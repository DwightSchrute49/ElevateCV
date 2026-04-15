require("dotenv").config();

const app = require("./src/app");

const connectToDB = require("./src/config/database");

connectToDB();

const PORT = 3000;

app.listen(3000, () => {
  console.log(`server is running on port ${PORT}`);
});
