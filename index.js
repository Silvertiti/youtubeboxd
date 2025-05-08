const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const videoRoutes = require("./routes/videos");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/videos", videoRoutes);

app.listen(3000, () => {
  console.log("API dispo sur http://localhost:3000");
});
