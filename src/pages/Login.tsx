import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from 'lucide-react'
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (!form.email || !form.password) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/mobile/auth/login", form);
      const token = res.data.data?.accessToken;
      if (token) {
        localStorage.setItem("token", token);
        navigate("/");
      } else {
        setError("Invalid response from server");
      }
    } catch (e: any) {
      setError(
        e.response?.data?.error || e.response?.data?.message || "Login failed",
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
          Sign in to your account
        </p>

        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(255,100,100,0.1)", color: "#ff6b6b" }}
          >
            {error}
          </div>
        )}

        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={inputStyle}
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none pr-12"
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Add this below the password input */}
          <div className="flex justify-end mt-1">
            <button
              onClick={() => navigate("/forgot-password")}
              className="text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              Forgot password?
            </button>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-5 py-4 rounded-xl font-semibold text-white transition-opacity disabled:opacity-50"
          style={{ background: "var(--teal)" }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p
          className="text-center text-sm mt-4"
          style={{ color: "var(--text-muted)" }}
        >
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            style={{ color: "var(--teal)" }}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
