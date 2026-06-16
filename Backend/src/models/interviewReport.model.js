const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    resumeFileName: {
      type: String,
      required: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    analysis: {
      matchScore: {
        type: Number,
        default: 0,
      },
      summary: {
        type: String,
        default: "",
      },
      matchedSkills: {
        type: [String],
        default: [],
      },
      missingSkills: {
        type: [String],
        default: [],
      },
      suggestedSkills: {
        type: [String],
        default: [],
      },
      atsKeywords: {
        type: [String],
        default: [],
      },
      resumeAdvice: {
        type: [String],
        default: [],
      },
      nextSteps: {
        type: [String],
        default: [],
      },
      roleFit: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  },
);

const interviewReportModel = mongoose.model(
  "interview_reports",
  analysisSchema,
);

module.exports = interviewReportModel;
