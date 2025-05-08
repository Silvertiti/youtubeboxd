function Home() {
  const videos = [
    {
      id: 1,
      title: "Pourquoi Inception est un chef-d'œuvre",
      thumbnail: "https://img.youtube.com/vi/YoHD9XEInc0/hqdefault.jpg"
    },
    {
      id: 2,
      title: "Analyse du Joker (2019)",
      thumbnail: "https://img.youtube.com/vi/zAGVQLHvwOY/hqdefault.jpg"
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Bienvenue sur Youtubeboxd 🎬</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {videos.map(video => (
          <div key={video.id} className="bg-white shadow rounded p-4 hover:shadow-lg transition">
            <img src={video.thumbnail} alt={video.title} className="rounded mb-2" />
            <h2 className="text-lg font-semibold">{video.title}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
