const puppeteer = require("puppeteer");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function scrapeAndInsertYouTubeVideos() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Accéder à la page YouTube avec une recherche spécifique
  await page.goto("https://www.youtube.com/results?search_query=football");

  // Attendre que la page charge les vidéos
  await page.waitForSelector("ytd-video-renderer");

  // Extraire les titres, URLs, miniatures, noms de chaînes et dates de publication
  const videos = await page.evaluate(() => {
    const videoElements = document.querySelectorAll("ytd-video-renderer");
    const videoData = [];

    videoElements.forEach((video) => {
      const title = video.querySelector("#video-title")
        ? video.querySelector("#video-title").textContent.trim()
        : "";
      const url = video.querySelector("a")
        ? "https://www.youtube.com" +
          video.querySelector("a").getAttribute("href")
        : "";

      // Tentative de récupération de la miniature via un autre sélecteur
      let thumbnailUrl = "";
      const thumbnailElement = video.querySelector("yt-img-shadow img");
      if (thumbnailElement) {
        thumbnailUrl = thumbnailElement.src || "";
      } else {
        // Si la miniature n'est pas trouvée, utiliser une image par défaut
        thumbnailUrl = "https://www.example.com/default-thumbnail.jpg";
      }

      const channelName = video.querySelector(
        "#channel-name yt-formatted-string"
      )
        ? video
            .querySelector("#channel-name yt-formatted-string")
            .textContent.trim()
        : "";
      const publishedAt = video.querySelector(
        "#metadata-line span:nth-child(2)"
      )
        ? video
            .querySelector("#metadata-line span:nth-child(2)")
            .textContent.trim()
        : "";

      videoData.push({
        title,
        url,
        thumbnailUrl,
        channelName,
        publishedAt,
      });
    });
    return videoData;
  });

  console.log("Videos Scrapped:", videos);

  // Insérer les vidéos dans la base de données
  for (const video of videos) {
    try {
      // Extrait l'ID de YouTube, vérifie qu'il existe
      const youtubeIdMatch = video.url.match(/[?&]v=([^&]+)/);
      const youtubeId = youtubeIdMatch ? youtubeIdMatch[1] : null;

      if (!youtubeId) {
        console.error(
          "Erreur: ID YouTube non trouvé pour la vidéo",
          video.title
        );
        continue; // Ignore la vidéo sans ID valide
      }

      // Vérifier si la vidéo existe déjà dans la base de données (éviter les doublons)
      const existingVideo = await prisma.video.findUnique({
        where: { youtubeId },
      });

      if (existingVideo) {
        console.log(
          `Vidéo déjà présente dans la base de données : ${video.title}`
        );
        continue; // Ne pas insérer si la vidéo existe déjà
      }

      // Créer la vidéo dans la base de données
      const insertedVideo = await prisma.video.create({
        data: {
          youtubeId,
          title: video.title,
          channelName: video.channelName,
          thumbnailUrl: video.thumbnailUrl,
          publishedAt: video.publishedAt || null,
        },
      });

      console.log(`Vidéo ajoutée : ${insertedVideo.title}`);
    } catch (error) {
      console.error("Erreur lors de l'insertion de la vidéo :", error);
    }
  }

  await browser.close();
  await prisma.$disconnect();
}

// Lancer le script
scrapeAndInsertYouTubeVideos();
