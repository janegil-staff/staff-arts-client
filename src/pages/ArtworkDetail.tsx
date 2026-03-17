import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { ArrowLeft, MessageCircle, ShoppingBag } from "lucide-react";

export default function ArtworkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/artworks/${id}`)
      .then((res) => setArtwork(res.data.data))
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--teal)" }}
        />
      </div>
    );

  if (!artwork) return null;

  const imageUrl = artwork.images?.[0]?.url;
  const artist = artwork.artist;
  const artistId = artist?._id || artist?.id;
  const price =
    artwork.price > 0
      ? `${artwork.price} ${artwork.currency || "NOK"}`
      : "Not for sale";

  const handleMessage = async () => {
    try {
      const res = await api.post("/conversations", { participantId: artistId });
      const convo = res.data.data;
      const convoId = convo._id || convo.id;
      navigate(`/messages/${convoId}`);
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <div className="min-h-screen pb-24 max-w-2xl mx-auto">
      {/* Hero image */}
      <div className="relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={artwork.title}
            className="w-full object-cover"
            style={{ maxHeight: "60vh" }}
          />
        ) : (
          <div
            className="w-full flex items-center justify-center"
            style={{ height: "300px", background: "var(--bg-elevated)" }}
          >
            <span className="text-6xl">🖼️</span>
          </div>
        )}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%)",
          }}
        />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <ArrowLeft size={20} color="white" />
        </button>
      </div>

      <div className="px-5 pt-5">
        {/* Title + price + status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 pr-3">
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: "Playfair Display", color: "var(--text)" }}
            >
              {artwork.title}
            </h1>
            <p
              className="text-xl font-semibold mt-1"
              style={{ color: "var(--teal)" }}
            >
              {price}
            </p>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full flex-shrink-0"
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

        {/* Meta pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {artwork.medium && (
            <span
              className="text-xs px-3 py-1 rounded-full"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
              }}
            >
              {artwork.medium}
            </span>
          )}
          {artwork.style && (
            <span
              className="text-xs px-3 py-1 rounded-full"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
              }}
            >
              {artwork.style}
            </span>
          )}
          {artwork.year > 0 && (
            <span
              className="text-xs px-3 py-1 rounded-full"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
              }}
            >
              {artwork.year}
            </span>
          )}
          {artwork.dimensions?.width && (
            <span
              className="text-xs px-3 py-1 rounded-full"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
              }}
            >
              {artwork.dimensions.width} × {artwork.dimensions.height}{" "}
              {artwork.dimensions.unit}
            </span>
          )}
        </div>

        {/* Artist */}
        {artist && (
          <div
            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer mb-4 hover:bg-white/5 transition-colors"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
            }}
            onClick={() => {
              const myId = localStorage.getItem("myUserId");
              if (myId && (myId === artist?._id || myId === artist?.id)) {
                navigate("/profile");
              } else {
                navigate(`/profile/${artistId}`);
              }
            }}
          >
            <img
              src={
                artist.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${artistId}`
              }
              alt={artist.name}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p
                className="font-medium text-sm truncate"
                style={{ color: "var(--text)" }}
              >
                {artist.displayName || artist.name}
              </p>
              {artist.slug && (
                <p
                  className="text-xs truncate"
                  style={{ color: "var(--text-muted)" }}
                >
                  @{artist.slug}
                </p>
              )}
            </div>
            <span style={{ color: "var(--text-muted)" }}>›</span>
          </div>
        )}

        {/* Description */}
        {artwork.description && (
          <div className="mb-6">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              About
            </p>
            <p
              className="text-sm leading-relaxed font-light"
              style={{ color: "var(--text-muted)" }}
            >
              {artwork.description}
            </p>
          </div>
        )}

        {/* Multiple images */}
        {artwork.images?.length > 1 && (
          <div className="mb-6">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              More Images
            </p>
            <div
              className="flex gap-2 overflow-x-auto pb-1"
              style={{ scrollbarWidth: "none" }}
            >
              {artwork.images.map((img: any, i: number) => (
                <img
                  key={i}
                  src={img.url}
                  alt={`${artwork.title} ${i + 1}`}
                  className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                  style={{ border: "1px solid var(--border)" }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {artwork.forSale && artwork.price > 0 && (
          <div className="flex gap-3 mt-2">
            {artist && (
              <button
                onClick={handleMessage}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-opacity"
                style={{
                  border: "1px solid var(--teal)",
                  color: "var(--teal)",
                }}
              >
                <MessageCircle size={18} />
                Message
              </button>
            )}
            <button
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white"
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
