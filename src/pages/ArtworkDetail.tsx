import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { ArrowLeft, MessageCircle, ShoppingBag } from "lucide-react";

export default function ArtworkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState<Artwork | null>(null);

  useEffect(() => {
    api
      .get(`/artworks/${id}`)
      .then((res) => setArtwork(res.data.data))
      .catch(() => navigate("/"));
  }, [id]);

  if (!artwork)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--teal)" }}
        />
      </div>
    );

  return (
    <div className="min-h-screen pb-24">
      <div className="relative">
        <img
          src={artwork.imageUrl}
          alt={artwork.title}
          className="w-full object-cover"
          style={{ maxHeight: "60vh" }}
        />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <ArrowLeft size={20} color="white" />
        </button>
      </div>

      <div className="px-4 pt-5">
        <div className="flex items-start justify-between">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: "Playfair Display" }}
            >
              {artwork.title}
            </h1>
            <p
              className="text-xl font-semibold mt-1"
              style={{ color: "var(--teal)" }}
            >
              ${artwork.price}
            </p>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background:
                artwork.status === "available"
                  ? "rgba(38,142,134,0.15)"
                  : "rgba(255,255,255,0.05)",
            }}
          >
            <span
              className="text-xs font-medium capitalize"
              style={{
                color:
                  artwork.status === "available"
                    ? "var(--teal)"
                    : "var(--text-muted)",
              }}
            >
              {artwork.status}
            </span>
          </div>
        </div>

        <div
          className="flex items-center gap-3 mt-4 p-3 rounded-xl cursor-pointer"
          style={{ background: "var(--bg-elevated)" }}
          onClick={() => navigate(`/profile/${artwork.artist.id}`)}
        >
          <img
            src={
              artwork.artist.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${artwork.artist.id}`
            }
            alt={artwork.artist.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-medium text-sm">{artwork.artist.name}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              @{artwork.artist.username}
            </p>
          </div>
        </div>

        {artwork.description && (
          <p
            className="mt-4 text-sm leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            {artwork.description}
          </p>
        )}

        {artwork.status === "available" && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={() =>
                navigate(
                  `/messages/new?artistId=${artwork.artist.id}&artworkId=${artwork.id}`,
                )
              }
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-opacity"
              style={{ border: "1px solid var(--teal)", color: "var(--teal)" }}
            >
              <MessageCircle size={18} />
              Message
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white transition-opacity"
              style={{ background: "var(--teal)" }}
            >
              <ShoppingBag size={18} />
              Buy Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
