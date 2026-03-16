import { useState, useEffect } from "react";
import { ImagePlus } from "lucide-react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Upload() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/login")
  }, []);
  const [form, setForm] = useState({ title: "", description: "", price: "" });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!image || !form.title || !form.price) return;
    setLoading(true);
    try {
      const data = new FormData();
      data.append("image", image);
      data.append("title", form.title);
      data.append("description", form.description);
      data.append("price", form.price);
      await api.post("/artworks", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/");
    } catch (e) {
      console.error(e);
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
    <div className="min-h-screen pb-24 px-4 pt-6">
      <h1
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: "Playfair Display" }}
      >
        Upload Artwork
      </h1>

      <label className="block mb-6 cursor-pointer mx-auto" style={{ maxWidth: "512px" }}>
        <div
          className="w-full rounded-2xl flex flex-col items-center justify-center overflow-hidden mx-auto" style={{ maxWidth: "512px" }} style={{ minHeight: "200px" }}
          style={{
            border: `2px dashed var(--border)`,
            background: "var(--bg-elevated)",
          }}
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <ImagePlus size={40} style={{ color: "var(--teal)" }} />
              <p
                className="mt-3 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                Tap to select image
              </p>
            </>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImage}
        />
      </label>

      <div className="space-y-4">
        {[
          { key: "title", placeholder: "Artwork title", type: "text" },
          { key: "price", placeholder: "Price (USD)", type: "number" },
        ].map(({ key, placeholder, type }) => (
          <input
            key={key}
            type={type}
            placeholder={placeholder}
            value={form[key as keyof typeof form]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={inputStyle}
          />
        ))}
        <textarea
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          rows={4}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
          style={inputStyle}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full mt-6 py-4 rounded-xl font-semibold text-white transition-opacity disabled:opacity-50"
        style={{ background: "var(--teal)" }}
      >
        {loading ? "Uploading..." : "Publish Artwork"}
      </button>
    </div>
  );
}
