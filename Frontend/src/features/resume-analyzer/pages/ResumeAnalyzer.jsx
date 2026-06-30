import { useState } from "react";
import { analyzeResume } from "../services/analysis.api";
import "../resume-analyzer.scss";

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read the PDF file."));
    reader.readAsDataURL(file);
  });
}

function formatPercent(value) {
  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return "0%";
  }

  return `${Math.max(0, Math.min(100, Math.round(numericValue)))}%`;
}

function ResumeAnalyzer() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("Ready to analyze");
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;

    if (selectedFile && selectedFile.type !== "application/pdf") {
      setError("Please upload a PDF resume.");
      setResumeFile(null);
      return;
    }

    setError("");
    setResumeFile(selectedFile);
  };

  const handleAnalyze = async (event) => {
    event.preventDefault();
    setError("");
    setProgress(0);
    setProgressLabel("Ready to analyze");

    if (!resumeFile) {
      setError("Upload your resume as a PDF before analyzing it.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Paste the job description you want to target.");
      return;
    }

    try {
      setLoading(true);
      setProgress(10);
      setProgressLabel("Reading your resume");
      const resumeBase64 = await readFileAsDataUrl(resumeFile);

      setProgress(40);
      setProgressLabel("Preparing the analysis request");
      const response = await analyzeResume({
        resumeName: resumeFile.name,
        resumeBase64,
        jobDescription: jobDescription.trim(),
      });

      setProgress(100);
      setProgressLabel("Analysis complete");
      setAnalysis(response.analysis || response.report?.analysis || null);
    } catch (analysisError) {
      setProgress(0);
      setProgressLabel("Analysis failed");
      setError(
        analysisError?.response?.data?.message ||
          analysisError?.message ||
          "We could not analyze the resume right now.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="resume-analyzer">
      <div className="resume-analyzer__glow resume-analyzer__glow--one" />
      <div className="resume-analyzer__glow resume-analyzer__glow--two" />

      <section className="resume-analyzer__shell">
        <header className="resume-analyzer__hero">
          <p className="resume-analyzer__eyebrow">AI-resume analyser</p>
          <h1>See what your resume is missing before you apply.</h1>
          <p className="resume-analyzer__hero-copy">
            Upload a PDF resume, paste a job description, and AI will
            highlight missing skills, ATS keywords, and the best additions to
            make.
          </p>
        </header>

        <div className="resume-analyzer__stats">
          <article>
            <strong>PDF upload</strong>
            <span>Analyze the exact resume you plan to send.</span>
          </article>
          <article>
            <strong>Skill gaps</strong>
            <span>Find missing tools, frameworks, and keywords fast.</span>
          </article>
          <article>
            <strong>Tailored advice</strong>
            <span>Get practical edits you can make right away.</span>
          </article>
        </div>

        <div className="resume-analyzer__content">
          <form className="resume-analyzer__panel" onSubmit={handleAnalyze}>
            <div className="resume-analyzer__panel-header">
              <div>
                <p className="resume-analyzer__panel-kicker">Input</p>
                <h2>Upload resume and describe the job</h2>
              </div>
              <span className="resume-analyzer__pill">AI-powered</span>
            </div>

            <label className="resume-analyzer__upload">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
              />
              <span className="resume-analyzer__upload-label">
                {resumeFile ? "Change PDF resume" : "Choose your PDF resume"}
              </span>
              <span className="resume-analyzer__upload-meta">
                {resumeFile
                  ? `${resumeFile.name} • ${(resumeFile.size / 1024 / 1024).toFixed(2)} MB`
                  : "PDF only, up to a few MB works best."}
              </span>
            </label>

            <label className="resume-analyzer__field">
              <span>Job description</span>
              <textarea
                rows={12}
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                placeholder="Paste the job description here, including required skills, tools, and responsibilities."
              />
            </label>

            {error && <div className="resume-analyzer__error">{error}</div>}

            <div className="resume-analyzer__progress" aria-live="polite">
              <div className="resume-analyzer__progress-row">
                <span>Analysis status</span>
                <strong>
                  {loading ? `${progress}%` : progress === 100 ? "100%" : "0%"}
                </strong>
              </div>
              <div className="resume-analyzer__progress-track">
                <div
                  className="resume-analyzer__progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p>
                {loading
                  ? progressLabel
                  : progress === 100
                    ? "Analysis complete"
                    : progressLabel}
              </p>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? `Analyzing resume... ${progress}%` : "Analyze resume"}
            </button>
          </form>

          <section className="resume-analyzer__panel resume-analyzer__panel--results">
            <div className="resume-analyzer__panel-header">
              <div>
                <p className="resume-analyzer__panel-kicker">Output</p>
                <h2>Analysis results</h2>
              </div>
              {analysis?.matchScore !== undefined && (
                <span className="resume-analyzer__score">
                  {formatPercent(analysis.matchScore)}
                </span>
              )}
            </div>

            {analysis ? (
              <div className="resume-analyzer__results">
                <article>
                  <h3>Summary</h3>
                  <p>
                    {analysis.summary ||
                      analysis.roleFit ||
                      "No summary returned."}
                  </p>
                </article>

                <article>
                  <h3>Missing skills</h3>
                  <div className="resume-analyzer__chips">
                    {analysis.missingSkills?.length ? (
                      analysis.missingSkills.map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))
                    ) : (
                      <p>No skill gaps returned.</p>
                    )}
                  </div>
                </article>

                <article>
                  <h3>Suggested skills</h3>
                  <div className="resume-analyzer__chips resume-analyzer__chips--positive">
                    {analysis.suggestedSkills?.length ? (
                      analysis.suggestedSkills.map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))
                    ) : (
                      <p>No suggestions returned.</p>
                    )}
                  </div>
                </article>

                <article>
                  <h3>ATS keywords</h3>
                  <div className="resume-analyzer__chips resume-analyzer__chips--keyword">
                    {analysis.atsKeywords?.length ? (
                      analysis.atsKeywords.map((keyword) => (
                        <span key={keyword}>{keyword}</span>
                      ))
                    ) : (
                      <p>No ATS keywords returned.</p>
                    )}
                  </div>
                </article>

                <article>
                  <h3>Resume advice</h3>
                  <ul>
                    {analysis.resumeAdvice?.length ? (
                      analysis.resumeAdvice.map((tip) => (
                        <li key={tip}>{tip}</li>
                      ))
                    ) : (
                      <li>No resume advice returned.</li>
                    )}
                  </ul>
                </article>

                <article>
                  <h3>Next steps</h3>
                  <ol>
                    {analysis.nextSteps?.length ? (
                      analysis.nextSteps.map((step) => (
                        <li key={step}>{step}</li>
                      ))
                    ) : (
                      <li>No next steps returned.</li>
                    )}
                  </ol>
                </article>
              </div>
            ) : (
              <div className="resume-analyzer__empty-state">
                <strong>Your analysis will appear here.</strong>
                <p>
                  Upload a resume and paste a job description to generate
                  missing-skill analysis, ATS keywords, and practical resume
                  suggestions.
                </p>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

export default ResumeAnalyzer;
