import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      await api.post("/mobile/auth/forgot-password", { email });
      setSent(true);
    } catch (e: any) {
      setError(
        e.response?.data?.error ||
          e.response?.data?.message ||
          "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    color: "var(--text)",
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1
          className="text-3xl font-bold mb-2 text-center"
          style={{ fontFamily: "Playfair Display", color: "var(--text)" }}
        >
          Staff Arts
        </h1>
        <p
          className="text-sm text-center mb-8"
          style={{ color: "var(--text-muted)" }}
        >
          {sent ? "Check your inbox" : "Reset your password"}
        </p>

        {sent ? (
          <div className="text-center space-y-4">
            <div
              className="px-4 py-3 rounded-xl text-sm"
              style={{
                background: "rgba(0,200,150,0.1)",
                color: "var(--teal)",
              }}
            >
              If that email exists, a reset link has been sent.
            </div>
            <button
              onClick={() => navigate("/login")}
              className="w-full mt-2 py-4 rounded-xl font-semibold text-white"
              style={{ background: "var(--teal)" }}
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <>
            {error && (
              <div
                className="mb-4 px-4 py-3 rounded-xl text-sm"
                style={{
                  background: "rgba(255,100,100,0.1)",
                  color: "#ff6b6b",
                }}
              >
                {error}
              </div>
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={inputStyle}
            />

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-5 py-4 rounded-xl font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ background: "var(--teal)" }}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <p
              className="text-center text-sm mt-4"
              style={{ color: "var(--text-muted)" }}
            >
              <button
                onClick={() => navigate("/login")}
                style={{ color: "var(--teal)" }}
              >
                Back to Sign In
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
