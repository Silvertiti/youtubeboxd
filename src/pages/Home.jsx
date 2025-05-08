import { useEffect, useState } from "react";
import axios from "axios";

function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupère les vidéos depuis l'API
    axios
      .get("http://localhost:3000/api/videos")
      .then((res) => {
        setVideos(res.data);
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération des vidéos", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Chargement des vidéos...</p>;
  if (videos.length === 0) return <p>Aucune vidéo disponible.</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Bienvenue sur Youtubeboxd 🎬
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {videos.map((video) => (
          <div
            key={video.id}
            className="bg-white shadow rounded p-4 hover:shadow-lg transition"
          >
            <div
              className="relative w-full"
              style={{ paddingBottom: "56.25%" }}
            >
              {" "}
              {/* Maintenir le ratio 16:9 */}
              <img
                src={
                  video.thumbnailUrl ||
                  "https://www.example.com/default-thumbnail.jpg"
                }
                alt={video.title}
                className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
              />
            </div>
            <h2 className="text-lg font-semibold mt-4">{video.title}</h2>
            <p className="text-sm text-gray-500">{video.channelName}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
