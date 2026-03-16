import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/conversations")
      .then((res) => setConversations(res.data.data || []))
      .catch(() => setConversations([]));
  }, []);

  const filtered = conversations.filter((c) =>
    c.participant.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="min-h-screen pb-24 px-4 pt-6">
      <h1
        className="text-2xl font-bold mb-4"
        style={{ fontFamily: "Playfair Display" }}
      >
        Messages
      </h1>

      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "var(--text-muted)" }}
        />
        <input
          type="text"
          placeholder="Search conversations..."
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

      <div className="space-y-2">
        {filtered.map((conv) => (
          <div
            key={conv.id}
            onClick={() => navigate(`/messages/${conv.id}`)}
            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors hover:bg-white/5"
            style={{ border: "1px solid var(--border)" }}
          >
            <img
              src={
                conv.participant.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.participant.id}`
              }
              alt={conv.participant.name}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {conv.participant.name}
              </p>
              {conv.lastMessage && (
                <p
                  className="text-xs truncate mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {conv.lastMessage.content}
                </p>
              )}
            </div>
            <p
              className="text-xs flex-shrink-0"
              style={{ color: "var(--text-muted)" }}
            >
              {new Date(conv.updatedAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
