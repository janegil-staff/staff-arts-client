import { useEffect, useState } from "react";
import api from "../services/api";
import { Search } from "lucide-react";
import ArtworkCard from "../components/ArtworkCard";

export default function Explore() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/artworks", { params: { search: query } })
      .then((res) => setArtworks(res.data.data || []))
      .catch(() => setArtworks([]))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="min-h-screen pb-24 px-4 pt-6">
      <h1
        className="text-2xl font-bold mb-4"
        style={{ fontFamily: "Playfair Display" }}
      >
        Explore
      </h1>

      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "var(--text-muted)" }}
        />
        <input
          type="text"
          placeholder="Search artworks, artists..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            color: "var(--text)",
          }}
        />
      </div>

      {loading ? (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`rounded-xl animate-pulse ${i % 3 === 0 ? "h-80" : "h-56"}`}
              style={{ background: "var(--bg-elevated)" }}
            />
          ))}
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
          {artworks.map((artwork) => (
            <div key={artwork.id} className="break-inside-avoid mb-3">
              <ArtworkCard
                artwork={artwork}
                size={Math.random() > 0.5 ? "lg" : "md"}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
