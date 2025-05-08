require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Youtubeboxd OK");
});

app.listen(3000, () => {
  console.log("Serveur lancé sur http://localhost:3000");
});
