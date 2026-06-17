const express = require("express");

const cookieParser = require("cookie-parser");

const app = express();

app.use(
  express.json({
    limit: "15mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "15mb",
  }),
);

app.use(cookieParser());

app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:4173",
    process.env.FRONTEND_URL,
  ];
  const requestOrigin = req.headers.origin;

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

const authRouter = require("./routes/auth.routes");
const analysisRouter = require("./routes/analysis.routes");

app.use("/api/auth", authRouter);
app.use("/api/analysis", analysisRouter);

module.exports = app;
