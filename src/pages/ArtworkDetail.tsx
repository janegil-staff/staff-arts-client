import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  ArrowLeft,
  MessageCircle,
  ShoppingBag,
  Heart,
  Bookmark,
  Eye,
  MessageSquare,
  Send,
} from "lucide-react";

export default function ArtworkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    api
      .get(`/artworks/${id}`)
      .then((res) => setArtwork(res.data.data))
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [id]);

  const loadComments = async () => {
    setCommentsLoading(true);
    try {
      const res = await api.get(`/artworks/${id}/comments`);
      setComments(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setCommentsLoading(false);
    }
  };

  const toggleComments = () => {
    if (!showComments) loadComments();
    setShowComments((v) => !v);
  };

  const toggleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    const wasLiked = artwork.isLiked;
    setArtwork((a: any) => ({
      ...a,
      isLiked: !wasLiked,
      likesCount: wasLiked ? a.likesCount - 1 : a.likesCount + 1,
    }));
    try {
      await api.post(`/artworks/${id}/like`);
    } catch {
      setArtwork((a: any) => ({
        ...a,
        isLiked: wasLiked,
        likesCount: wasLiked ? a.likesCount + 1 : a.likesCount - 1,
      }));
    } finally {
      setLikeLoading(false);
    }
  };

  const toggleSave = async () => {
    if (saveLoading) return;
    setSaveLoading(true);
    const wasSaved = artwork.isSaved;
    setArtwork((a: any) => ({
      ...a,
      isSaved: !wasSaved,
      savesCount: wasSaved ? a.savesCount - 1 : a.savesCount + 1,
    }));
    try {
      await api.post(`/artworks/${id}/save`);
    } catch {
      setArtwork((a: any) => ({
        ...a,
        isSaved: wasSaved,
        savesCount: wasSaved ? a.savesCount + 1 : a.savesCount - 1,
      }));
    } finally {
      setSaveLoading(false);
    }
  };

  const sendComment = async () => {
    const text = commentText.trim();
    if (!text || sendingComment) return;
    setCommentText("");
    setSendingComment(true);
    try {
      const res = await api.post(`/artworks/${id}/comments`, { text });
      setComments((c) => [res.data.data, ...c]);
      setArtwork((a: any) => ({
        ...a,
        commentsCount: (a.commentsCount || 0) + 1,
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setSendingComment(false);
    }
  };

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
  const myId = localStorage.getItem("myUserId");
  const isOwner = myId && myId === artistId;

  const price =
    artwork.price > 0
      ? `${artwork.price} ${artwork.currency || "NOK"}`
      : "Not for sale";

  const handleMessage = async () => {
    try {
      const res = await api.post("/conversations", { participantId: artistId });
      const convo = res.data.data;
      navigate(`/messages/${convo._id || convo.id}`);
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
            className="w-full no-save object-cover"
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
        {/* Title + status */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0 pr-3">
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: "Playfair Display", color: "var(--text)" }}
            >
              {artwork.title}
            </h1>
            {artwork.year > 0 && (
              <p
                className="text-sm mt-0.5 font-light"
                style={{ color: "var(--text-muted)" }}
              >
                {artwork.year}
              </p>
            )}
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

        {/* Engagement row */}
        <div
          className="flex items-center gap-5 py-3 mb-2"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          {/* Like */}
          <button
            onClick={toggleLike}
            className="flex items-center gap-1.5 transition-opacity"
            style={{ opacity: likeLoading ? 0.5 : 1 }}
          >
            <Heart
              size={20}
              fill={artwork.isLiked ? "#ef4444" : "none"}
              color={artwork.isLiked ? "#ef4444" : "var(--text-muted)"}
            />
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              {artwork.likesCount || 0}
            </span>
          </button>

          {/* Comments */}
          <button
            onClick={toggleComments}
            className="flex items-center gap-1.5"
          >
            <MessageSquare size={20} color="var(--text-muted)" />
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              {artwork.commentsCount || 0}
            </span>
          </button>

          {/* Views */}
          <div className="flex items-center gap-1.5">
            <Eye size={20} color="var(--text-muted)" />
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              {artwork.views || 0}
            </span>
          </div>

          <div className="flex-1" />

          {/* Save */}
          <button
            onClick={toggleSave}
            className="flex items-center gap-1.5 transition-opacity"
            style={{ opacity: saveLoading ? 0.5 : 1 }}
          >
            <Bookmark
              size={20}
              fill={artwork.isSaved ? "var(--teal)" : "none"}
              color={artwork.isSaved ? "var(--teal)" : "var(--text-muted)"}
            />
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              {artwork.savesCount || 0}
            </span>
          </button>
        </div>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-2 mb-4 mt-3">
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
                  className="w-24 h-24 no-save rounded-xl object-cover flex-shrink-0"
                  style={{ border: "1px solid var(--border)" }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Comments section */}
        {showComments && (
          <div className="mb-6">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--text-muted)" }}
            >
              Comments
            </p>

            {/* Comment input */}
            <div className="flex gap-2 mb-4">
              <div
                className="flex-1 rounded-xl px-3 py-2"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                }}
              >
                <textarea
                  ref={commentInputRef}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendComment();
                    }
                  }}
                  placeholder="Add a comment..."
                  rows={1}
                  className="w-full text-sm outline-none bg-transparent resize-none"
                  style={{ color: "var(--text)" }}
                />
              </div>
              <button
                onClick={sendComment}
                disabled={sendingComment || !commentText.trim()}
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity disabled:opacity-40"
                style={{ background: "var(--teal)" }}
              >
                {sendingComment ? (
                  <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin border-white" />
                ) : (
                  <Send size={14} color="white" />
                )}
              </button>
            </div>

            {/* Comments list */}
            {commentsLoading ? (
              <div className="flex justify-center py-6">
                <div
                  className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: "var(--teal)" }}
                />
              </div>
            ) : comments.length === 0 ? (
              <p
                className="text-sm text-center py-6"
                style={{ color: "var(--text-muted)" }}
              >
                No comments yet — be the first!
              </p>
            ) : (
              <div className="space-y-4">
                {comments.map((c: any, i: number) => {
                  const sender = c.user || c.sender || {};
                  const name = sender.displayName || sender.name || "Unknown";
                  return (
                    <div key={c._id || i} className="flex gap-3">
                      <img
                        src={
                          sender.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${sender._id}`
                        }
                        alt={name}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div>
                        <p
                          className="text-xs font-semibold"
                          style={{ color: "var(--text)" }}
                        >
                          {name}
                        </p>
                        <p
                          className="text-sm mt-0.5 leading-relaxed"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {c.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {isOwner ? (
          <div className="flex gap-3 mt-2">
            <button
              onClick={async () => {
                if (!confirm("Delete this artwork?")) return;
                try {
                  await api.delete(`/artworks/${id}`);
                  navigate("/my-artworks");
                } catch (e) {
                  console.error(e);
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white"
              style={{ background: "#ef4444" }}
            >
              Delete Artwork
            </button>
          </div>
        ) : artwork.forSale && artwork.price > 0 ? (
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
              onClick={async () => {
                try {
                  const res = await api.post("/conversations", {
                    participantId: artistId,
                  });
                  const convo = res.data.data;
                  navigate(`/messages/${convo._id || convo.id}`, {
                    state: {
                      prefillMessage: `Hi! I'm interested in buying "${artwork.title}" — is it still available?`,
                    },
                  });
                } catch (e) {
                  console.error(e);
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white"
              style={{ background: "var(--teal)" }}
            >
              <ShoppingBag size={18} />
              Buy Now
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
