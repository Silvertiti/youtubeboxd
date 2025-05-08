const puppeteer = require("puppeteer");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Nombre de vidéos à récupérer (via argument CLI ou 10 par défaut)
const args = process.argv.slice(2);
const MAX_VIDEOS = parseInt(args[0], 20) || 20;

async function scrapeAndInsertYouTubeVideos() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto("https://www.youtube.com/results?search_query=football", {
      waitUntil: "domcontentloaded",
    });

    await page.waitForSelector("ytd-video-renderer", { timeout: 5000 });

    // ✅ SCROLL automatique pour charger plus de vidéos
    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const videos = await page.evaluate((max) => {
      const videoElements = document.querySelectorAll("ytd-video-renderer");
      const videoData = [];
      let count = 0;

      for (const video of videoElements) {
        if (count >= max) break;

        const title = video.querySelector("#video-title")
          ? video.querySelector("#video-title").textContent.trim()
          : "";

        const url = video.querySelector("a")
          ? "https://www.youtube.com" +
            video.querySelector("a").getAttribute("href")
          : "";

        // ⛔️ Exclure les Shorts
        if (url.includes("/shorts/")) continue;

        // Extraire l'ID
        let youtubeId = null;
        const match = url.match(/[?&]v=([^&]+)/);
        if (match) youtubeId = match[1];

        // Miniature via ID
        let thumbnailUrl = youtubeId
          ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`
          : "";

        // Fallback <img>
        if (!thumbnailUrl) {
          const possibleImages = video.querySelectorAll("img");
          for (const img of possibleImages) {
            const src =
              img.getAttribute("src") ||
              img.getAttribute("data-thumb") ||
              img.getAttribute("data-src") ||
              img.getAttribute("srcset");

            if (src && !src.startsWith("data:")) {
              thumbnailUrl = src;
              break;
            }
          }
        }

        if (!thumbnailUrl) {
          thumbnailUrl = "https://www.example.com/default-thumbnail.jpg";
        }

        const channelName = video.querySelector(
          "#channel-name yt-formatted-string"
        )
          ? video
              .querySelector("#channel-name yt-formatted-string")
              .textContent.trim()
          : "Unknown Channel";

        const publishedAt = video.querySelector(
          "#metadata-line span:nth-child(2)"
        )
          ? video
              .querySelector("#metadata-line span:nth-child(2)")
              .textContent.trim()
          : null;

        videoData.push({
          title,
          url,
          thumbnailUrl,
          channelName,
          publishedAt,
        });

        count++;
      }

      return videoData;
    }, MAX_VIDEOS);

    console.log(
      `Vidéos récupérées (max ${MAX_VIDEOS}, hors Shorts) :`,
      videos.length
    );
    videos.forEach((v, i) => {
      console.log(`[${i + 1}] ${v.title} (${v.channelName})`);
      console.log(`     Thumbnail: ${v.thumbnailUrl}`);
    });

    for (const video of videos) {
      try {
        const youtubeIdMatch = video.url.match(/[?&]v=([^&]+)/);
        const youtubeId = youtubeIdMatch ? youtubeIdMatch[1] : null;

        if (!youtubeId) {
          console.error("ID YouTube non trouvé pour :", video.title);
          continue;
        }

        const existingVideo = await prisma.video.findUnique({
          where: { youtubeId },
        });

        if (existingVideo) {
          console.log(`Vidéo déjà présente : ${video.title}`);
          continue;
        }

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
  } catch (error) {
    console.error("Erreur lors de l'extraction des vidéos:", error);
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

scrapeAndInsertYouTubeVideos();
