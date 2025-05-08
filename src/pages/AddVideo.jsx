import { useState } from "react";
import axios from "axios";

function AddVideo() {
  const [form, setForm] = useState({
    youtubeId: "",
    title: "",
    channelName: "",
    thumbnailUrl: "",
    publishedAt: "",
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError("");

    try {
      await axios.post("http://localhost:3000/api/videos", form);
      setSuccess(true);
      setForm({
        youtubeId: "",
        title: "",
        channelName: "",
        thumbnailUrl: "",
        publishedAt: "",
      });
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l’ajout de la vidéo.");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Ajouter une vidéo YouTube 🎬</h1>
      {success && (
        <p className="text-green-600 mb-2">Vidéo ajoutée avec succès !</p>
      )}
      {error && <p className="text-red-600 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="youtubeId"
          placeholder="ID YouTube"
          value={form.youtubeId}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="title"
          placeholder="Titre de la vidéo"
          value={form.title}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="channelName"
          placeholder="Nom de la chaîne"
          value={form.channelName}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="thumbnailUrl"
          placeholder="URL miniature (optionnel)"
          value={form.thumbnailUrl}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          name="publishedAt"
          placeholder="Date de publication (YYYY-MM-DD)"
          value={form.publishedAt}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Ajouter
        </button>
      </form>
    </div>
  );
}

export default AddVideo;
