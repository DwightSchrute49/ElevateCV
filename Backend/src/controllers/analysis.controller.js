const interviewReportModel = require("../models/interviewReport.model");

function stripMarkdownFences(text) {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\n|,/)
      .map((item) => item.replace(/^[-*\d.\s]+/, "").trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeAnalysis(parsedAnalysis) {
  const analysis = parsedAnalysis || {};

  return {
    matchScore: Number(analysis.matchScore ?? analysis.score ?? 0),
    summary: String(analysis.summary ?? analysis.overview ?? "").trim(),
    matchedSkills: normalizeList(analysis.matchedSkills),
    missingSkills: normalizeList(analysis.missingSkills),
    suggestedSkills: normalizeList(
      analysis.suggestedSkills ?? analysis.recommendedSkills,
    ),
    atsKeywords: normalizeList(analysis.atsKeywords),
    resumeAdvice: normalizeList(analysis.resumeAdvice ?? analysis.advice),
    nextSteps: normalizeList(analysis.nextSteps),
    roleFit: String(analysis.roleFit ?? analysis.fitSummary ?? "").trim(),
  };
}

function buildPrompt(jobDescription, resumeName) {
  return `You are a senior resume reviewer and ATS analyst.

Analyze the attached resume PDF against the job description below.

Return ONLY valid JSON with this exact structure:
{
  "matchScore": number,
  "summary": "string",
  "matchedSkills": ["string"],
  "missingSkills": ["string"],
  "suggestedSkills": ["string"],
  "atsKeywords": ["string"],
  "resumeAdvice": ["string"],
  "nextSteps": ["string"],
  "roleFit": "string"
}

Rules:
- matchScore must be an integer from 0 to 100.
- missingSkills should focus on gaps between the resume and the job description.
- suggestedSkills should contain practical skills or tools the candidate could add if truthful and relevant.
- atsKeywords should reflect high-value keywords from the job description.
- resumeAdvice should give concise, actionable resume edits.
- nextSteps should be short, ordered actions.
- Do not include markdown, code fences, or any text outside the JSON object.

Resume file name: ${resumeName}

Job description:
${jobDescription}`;
}

async function analyzeResumeController(req, res) {
  const { jobDescription, resumeBase64, resumeName } = req.body;

  if (!jobDescription || !resumeBase64 || !resumeName) {
    return res.status(400).json({
      message:
        "jobDescription, resumeBase64, and resumeName are required to analyze the resume.",
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      message: "Gemini API key is not configured.",
    });
  }

  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const cleanBase64 = resumeBase64.includes(",")
    ? resumeBase64.split(",").pop()
    : resumeBase64;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: buildPrompt(jobDescription, resumeName),
          },
          {
            inlineData: {
              mimeType: "application/pdf",
              data: cleanBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      responseMimeType: "application/json",
    },
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const responseBody = await response.json();

  if (!response.ok) {
    const message =
      responseBody?.error?.message || "Failed to analyze the resume.";

    return res.status(response.status).json({ message });
  }

  const generatedText =
    responseBody?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("") || "";

  const cleanedText = stripMarkdownFences(generatedText);

  let parsedAnalysis;

  try {
    parsedAnalysis = JSON.parse(cleanedText);
  } catch (error) {
    parsedAnalysis = {
      summary: cleanedText,
    };
  }

  const analysis = normalizeAnalysis(parsedAnalysis);

  const report = await interviewReportModel.create({
    resumeFileName: resumeName,
    jobDescription,
    analysis,
  });

  return res.status(200).json({
    message: "Resume analyzed successfully.",
    report,
    analysis,
  });
}

module.exports = {
  analyzeResumeController,
};
