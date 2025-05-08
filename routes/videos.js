const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const videos = await prisma.video.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(videos);
});

router.post("/", async (req, res) => {
  const { youtubeId, title, channelName, thumbnailUrl, publishedAt } = req.body;

  if (!youtubeId || !title || !channelName) {
    return res.status(400).json({ error: "Champs obligatoires manquants." });
  }

  try {
    const video = await prisma.video.create({
      data: {
        youtubeId,
        title,
        channelName,
        thumbnailUrl,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
      },
    });
    res.status(201).json(video);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la création de la vidéo." });
  }
});

module.exports = router;
