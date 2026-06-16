const mongoose = require("mongoose");

async function connectToDB() {
  const connectionCandidates = [
    process.env.MONGO_URI,
    process.env.MONGO_URI_LOCAL,
    "mongodb://127.0.0.1:27017/interview-master",
  ].filter(Boolean);

  let lastError;

  try {
    for (const uri of connectionCandidates) {
      try {
        await mongoose.connect(uri);
        console.log("connected to DB");
        return;
      } catch (err) {
        lastError = err;
        console.warn(`failed to connect using ${uri}`);
      }
    }

    throw lastError || new Error("No MongoDB connection URI was available.");
  } catch (err) {
    console.error("database connection failed:", err.message);
    console.error(
      "Set MONGO_URI to a reachable MongoDB Atlas URI or MONGO_URI_LOCAL to a local MongoDB instance.",
    );
  }
}

module.exports = connectToDB;
