import { useEffect, useState } from "react";
import api from "../services/api";
import ArtworkCard from "../components/ArtworkCard";

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);

  useEffect(() => {
    api.get("/users/me").then((res) => setUser(res.data.data));
    api.get("/artworks/me").then((res) => setArtworks(res.data.data || []));
  }, []);

  if (!user)
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
      <div
        className="px-4 pt-6 pb-6"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-4">
          <img
            src={
              user.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
            }
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover"
            style={{ border: "2px solid var(--teal)" }}
          />
          <div className="flex-1">
            <h1
              className="font-bold text-xl"
              style={{ fontFamily: "Playfair Display" }}
            >
              {user.name}
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              @{user.username}
            </p>
            {user.bio && <p className="text-sm mt-1">{user.bio}</p>}
          </div>
        </div>

        <div className="flex gap-6 mt-4">
          {[
            { label: "Artworks", value: artworks.length },
            { label: "Followers", value: user.followersCount },
            { label: "Following", value: user.followingCount },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="font-bold text-lg" style={{ color: "var(--teal)" }}>
                {value}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        <h2
          className="font-semibold mb-3 text-sm uppercase tracking-wider"
          style={{ color: "var(--text-muted)" }}
        >
          Artworks
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {artworks.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      </div>
    </div>
  );
}
