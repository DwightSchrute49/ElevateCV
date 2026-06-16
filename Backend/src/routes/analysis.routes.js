const express = require("express");

const analysisController = require("../controllers/analysis.controller");

const analysisRouter = express.Router();

analysisRouter.post("/analyze", analysisController.analyzeResumeController);

module.exports = analysisRouter;
