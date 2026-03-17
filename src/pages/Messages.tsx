import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Search, X, Send } from "lucide-react";
import api from "../services/api";
import { getSocket, reconnectSocket } from "../services/socket";
import { notifyUnreadChange, decrementUnread } from "../hooks/useUnread";

function timeAgo(dateVal: string) {
  if (!dateVal) return "";
  const d = new Date(dateVal);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return d.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
}

function formatTime(dateVal: string) {
  if (!dateVal) return "";
  const d = new Date(dateVal);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function Avatar({
  src,
  name,
  size = 46,
}: {
  src?: string;
  name: string;
  size?: number;
}) {
  return src ? (
    <img
      src={src}
      alt={name}
      className="rounded-full object-cover flex-shrink-0"
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 font-bold"
      style={{
        width: size,
        height: size,
        background: "var(--teal)",
        color: "white",
        fontSize: size * 0.36,
      }}
    >
      {name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

function ConversationsList({
  onOpen,
}: {
  onOpen: (id: string, name: string, participantId: string) => void;
}) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState("");
  const debounceRef = useRef<any>(null);

  useEffect(() => {
    api
      .get("/mobile/auth/me")
      .then((r) => {
        const u = r.data?.data?.user || r.data?.data || r.data;
        const uid = u._id || u.id;
        setMyId(uid);
        localStorage.setItem("myUserId", uid);

        // Reconnect socket with auth token and join user room
        const socket = reconnectSocket();
        socket.emit("join_user_room", uid);
      })
      .catch(() => {});
    loadConversations();

    // Listen for new messages to update unread counts
    const socket = getSocket();
    socket.on("new_message", (msg: any) => {
      const storedId = localStorage.getItem("myUserId") || "";
      const senderId =
        typeof msg.sender === "object"
          ? msg.sender?._id || msg.sender?.id || ""
          : msg.sender || "";
      if (senderId === storedId) return;
      const convoId = msg.conversation || "";
      if (!convoId) return;
      setUnreadCounts((c) => {
        const newCount = (c[convoId] ?? 0) + 1;
        notifyUnreadChange(
          Object.values({ ...c, [convoId]: newCount }).reduce(
            (s: number, v: any) => s + Number(v),
            0,
          ),
        );
        return { ...c, [convoId]: newCount };
      });
      setConversations((prev) => {
        const idx = prev.findIndex((c) => (c._id || c.id) === convoId);
        if (idx < 0) return prev;
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          lastMessage: msg,
          lastMessageAt: msg.createdAt,
        };
        const convo = updated.splice(idx, 1)[0];
        const deduped = [
          convo,
          ...updated.filter((c) => (c._id || c.id) !== convoId),
        ];
        return deduped;
      });
    });

    return () => {
      socket.off("new_message");
    };
  }, []);

  const loadConversations = async () => {
    try {
      const [convRes, unreadRes] = await Promise.all([
        api.get("/conversations"),
        api.get("/conversations/unread").catch(() => ({ data: { data: {} } })),
      ]);
      const raw: any[] = convRes.data.data || [];
      // deduplicate by conversation id
      const seen = new Set();
      const deduped = raw.filter((c) => {
        const id = c._id || c.id;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });
      setConversations(deduped);
      setUnreadCounts(unreadRes.data.data || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearching(false);
      setSearchResults([]);
      return;
    }
    setSearching(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchUsers(q), 400);
  };

  const searchUsers = async (q: string) => {
    setSearchLoading(true);
    try {
      const res = await api.get("/users", { params: { search: q } });
      const storedId = myId || localStorage.getItem("myUserId") || "";
      const users = (res.data.data || []).filter(
        (u: any) => (u._id || u.id) !== storedId && !u.deletedAt,
      );
      setSearchResults(users);
    } catch (e) {
      console.error(e);
    } finally {
      setSearchLoading(false);
    }
  };

  const openChatWithUser = async (user: any) => {
    const userId = user._id || user.id;
    const name = user.displayName || user.name || "Unknown";
    setSearchQuery("");
    setSearching(false);
    setSearchResults([]);
    try {
      const res = await api.post("/conversations", { participantId: userId });
      const convo = res.data.data;
      onOpen(convo._id || convo.id, name, userId);
    } catch (e) {
      console.error(e);
    }
  };

  const otherParticipant = (participants: any[]) => {
    const storedId = myId || localStorage.getItem("myUserId") || "";
    const other = participants.find((p: any) => (p._id || p.id) !== storedId);
    return other ?? null;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3">
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-full"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
          }}
        >
          <Search size={16} style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: "var(--text)" }}
          />
          {searching && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSearching(false);
                setSearchResults([]);
              }}
            >
              <X size={16} style={{ color: "var(--text-muted)" }} />
            </button>
          )}
        </div>
      </div>

      {searching ? (
        <div className="flex-1 overflow-y-auto">
          {searchLoading ? (
            <div className="flex items-center justify-center py-12">
              <div
                className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "var(--teal)" }}
              />
            </div>
          ) : searchResults.length === 0 ? (
            <p
              className="text-center py-12 text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              No users found
            </p>
          ) : (
            searchResults.map((user) => (
              <div
                key={user._id || user.id}
                onClick={() => openChatWithUser(user)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
              >
                <Avatar
                  src={user.avatar}
                  name={user.displayName || user.name}
                  size={46}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="font-medium text-sm truncate"
                    style={{ color: "var(--text)" }}
                  >
                    {user.displayName || user.name}
                  </p>
                  {user.username && (
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      @{user.username}
                    </p>
                  )}
                </div>
                {user.role && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(38,142,134,0.12)",
                      color: "var(--teal)",
                    }}
                  >
                    {user.role[0].toUpperCase() + user.role.slice(1)}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center flex-1">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--teal)" }}
          />
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3">
          <span className="text-5xl">💬</span>
          <p className="text-lg font-light" style={{ color: "var(--text)" }}>
            No conversations yet
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Search for a user to start a conversation
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {conversations.map((convo) => {
            const participants = convo.participants || [];
            const other = otherParticipant(participants);
            if (!other) return null; // skip rendering self-conversations
            const name = other?.displayName || other?.name || "Unknown";
            const lastMsg = convo.lastMessage;
            const preview = lastMsg?.text || "No messages yet";
            const time = timeAgo(lastMsg?.createdAt || convo.lastMessageAt);
            const convoId = convo._id || convo.id;
            const otherId = other?._id || other?.id || "";
            const unread = unreadCounts[convoId] ?? 0;
            return (
              <div
                key={convoId}
                onClick={() => {
                  const prev = unreadCounts[convoId] ?? 0;
                  setUnreadCounts((c) => ({ ...c, [convoId]: 0 }));
                  if (prev > 0) decrementUnread(prev);
                  onOpen(convoId, name, otherId);
                }}
                className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-white/5 transition-colors"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <Avatar src={other?.avatar} name={name} size={50} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p
                      className="font-medium text-sm truncate"
                      style={{ color: "var(--text)" }}
                    >
                      {name}
                    </p>
                    <p
                      className="text-xs flex-shrink-0 ml-2"
                      style={{
                        color: unread > 0 ? "var(--teal)" : "var(--text-muted)",
                        fontWeight: unread > 0 ? "600" : "400",
                      }}
                    >
                      {time}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p
                      className="text-xs truncate flex-1"
                      style={{
                        color: unread > 0 ? "var(--text)" : "var(--text-muted)",
                        fontWeight: unread > 0 ? "500" : "400",
                      }}
                    >
                      {preview}
                    </p>
                    {unread > 0 && (
                      <span
                        className="ml-2 flex-shrink-0 flex items-center justify-center rounded-full text-white font-bold"
                        style={{
                          background: "#ef4444",
                          minWidth: "18px",
                          height: "18px",
                          padding: "0 4px",
                          fontSize: "10px",
                        }}
                      >
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ChatScreen({
  conversationId,
  name,
  participantId,
  onBack,
}: {
  conversationId: string;
  name: string;
  participantId: string;
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [myId, setMyId] = useState("");
  const [convoId, setConvoId] = useState(conversationId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("myUserId");
    if (stored) {
      setMyId(stored);
      return;
    }
    api
      .get("/mobile/auth/me")
      .then((r) => {
        const u = r.data?.data?.user || r.data?.data || r.data;
        setMyId(u._id || u.id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!convoId) return;
    loadMessages();
    const socket = getSocket();
    socket.emit("join_conversation", convoId);
    const onNewMessageChat = (msg: any) => {
      setMessages((m) => {
        const exists = m.some(
          (x) =>
            x._id === msg._id ||
            (x._id?.toString().startsWith("temp_") && x.text === msg.text),
        );
        if (exists)
          return m.map((x) =>
            x.text === msg.text && x._id?.toString().startsWith("temp_")
              ? msg
              : x,
          );
        return [...m, msg];
      });
    };
    socket.on("new_message", onNewMessageChat);
    return () => {
      socket.emit("leave_conversation", convoId);
      socket.off("new_message", onNewMessageChat);
    };
  }, [convoId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const res = await api.get(`/conversations/${convoId}/messages`);
      setMessages(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  const handleSend = async () => {
    const t = text.trim();
    if (!t || sending) return;
    setText("");
    setSending(true);
    let currentConvoId = convoId;
    if (!currentConvoId) {
      try {
        const res = await api.post("/conversations", { participantId });
        currentConvoId = res.data.data._id || res.data.data.id;
        setConvoId(currentConvoId);
      } catch (e) {
        console.error(e);
        setSending(false);
        return;
      }
    }
    const optimistic = {
      _id: `temp_${Date.now()}`,
      text: t,
      sender: { _id: myId },
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);
    try {
      const res = await api.post(`/conversations/${currentConvoId}/messages`, {
        text: t,
      });
      const sent = res.data.data;
      setMessages((m) =>
        m.map((msg) => (msg._id === optimistic._id ? sent : msg)),
      );
    } catch (e) {
      setMessages((m) => m.filter((msg) => msg._id !== optimistic._id));
    } finally {
      setSending(false);
    }
  };

  const getSenderId = (msg: any) => {
    const s = msg.sender;
    if (typeof s === "object") return s?._id || s?.id || "";
    return s || msg.senderId || "";
  };

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={20} style={{ color: "var(--text)" }} />
        </button>
        <p className="font-light text-lg" style={{ color: "var(--text)" }}>
          {name}
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "var(--teal)" }}
            />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Start a conversation with {name}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((msg) => {
              const isMe = getSenderId(msg) === myId;
              const isPending = msg._id?.toString().startsWith("temp_");
              return (
                <div
                  key={msg._id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} mb-1`}
                >
                  <div
                    className="max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl"
                    style={{
                      background: isMe ? "var(--teal)" : "var(--bg-elevated)",
                      borderBottomRightRadius: isMe ? "4px" : "18px",
                      borderBottomLeftRadius: isMe ? "18px" : "4px",
                    }}
                  >
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: isMe ? "white" : "var(--text)" }}
                    >
                      {msg.text}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <p
                        className="text-xs"
                        style={{
                          color: isMe
                            ? "rgba(255,255,255,0.6)"
                            : "var(--text-muted)",
                        }}
                      >
                        {formatTime(msg.createdAt)}
                      </p>
                      {isMe && (
                        <span
                          style={{
                            color: "rgba(255,255,255,0.6)",
                            fontSize: "10px",
                          }}
                        >
                          {isPending ? "○" : "✓"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div
        className="flex items-end gap-2 px-3 py-3 flex-shrink-0"
        style={{
          borderTop: "1px solid var(--border)",
          background: "var(--bg-elevated)",
        }}
      >
        <div
          className="flex-1 rounded-2xl px-4 py-2.5"
          style={{ background: "var(--bg)", minHeight: "42px" }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            rows={1}
            className="w-full text-sm outline-none bg-transparent resize-none"
            style={{ color: "var(--text)", maxHeight: "100px" }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity disabled:opacity-40"
          style={{ background: "var(--teal)" }}
        >
          {sending ? (
            <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin border-white" />
          ) : (
            <Send size={16} color="white" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function Messages() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeChat, setActiveChat] = useState<{
    id: string;
    name: string;
    participantId: string;
  } | null>(id ? { id, name: "", participantId: "" } : null);

  // ← Add this: when URL changes to /messages (no id), close the chat
  useEffect(() => {
    if (!id) {
      setActiveChat(null);
    }
  }, [id]);

  const openChat = (convoId: string, name: string, participantId: string) => {
    setActiveChat({ id: convoId, name, participantId });
    navigate(`/messages/${convoId}`, { replace: true });
  };

  const closeChat = () => {
    setActiveChat(null);
    navigate("/messages", { replace: true });
  };

  return (
    <div
      style={{ height: "calc(100vh - 80px)" }}
      className="flex flex-col max-w-2xl mx-auto"
    >
      {!activeChat && (
        <div
          className="px-4 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h1
            className="text-2xl font-light"
            style={{ color: "var(--text)", fontFamily: "Playfair Display" }}
          >
            Messages
          </h1>
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        {activeChat ? (
          <ChatScreen
            conversationId={activeChat.id}
            name={activeChat.name || "Chat"}
            participantId={activeChat.participantId}
            onBack={closeChat}
          />
        ) : (
          <ConversationsList onOpen={openChat} />
        )}
      </div>
    </div>
  );
}
