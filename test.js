const puppeteer = require("puppeteer");

async function scrapeYouTube() {
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
      const thumbnailUrl = video.querySelector("yt-img-shadow img")
        ? video.querySelector("yt-img-shadow img").src
        : "";
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

  console.log(videos); // Afficher les vidéos récupérées
  await browser.close();
}

scrapeYouTube();
