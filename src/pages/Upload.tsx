import { useState, useEffect } from "react";
import { ImagePlus } from "lucide-react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Upload() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    year: "",
    price: "",
    medium: "",
    style: "",
    currency: "NOK",
    width: "",
    height: "",
    unit: "cm",
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/login");
  }, []);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!image) {
      setError("Please select an image");
      return;
    }
    if (!form.title) {
      setError("Please enter a title");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Step 1: Upload image to Cloudinary
      const formData = new FormData();
      formData.append("image", image);
      const uploadRes = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { url, publicId } = uploadRes.data.data || uploadRes.data;

      // Step 2: Create artwork with image URL
      await api.post("/artworks", {
        title: form.title,
        description: form.description,
        price: Number(form.price) || 0,
        currency: form.currency,
        medium: form.medium,
        style: form.style,
        categories: selectedCategories,
        dimensions:
          form.width && form.height
            ? {
                width: Number(form.width),
                height: Number(form.height),
                unit: form.unit,
              }
            : undefined,
        forSale: Number(form.price) > 0,
        year: form.year ? Number(form.year) : undefined,
        images: [{ url, publicId: publicId || "" }],
      });
      navigate("/");
    } catch (e: any) {
      console.error(e);
      setError(
        e.response?.data?.error || e.response?.data?.message || "Upload failed",
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
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-2xl mx-auto">
      <h1
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: "Playfair Display" }}
      >
        Upload Artwork
      </h1>

      {error && (
        <div
          className="mb-4 px-4 py-3 rounded-xl text-sm"
          style={{ background: "rgba(255,100,100,0.1)", color: "#ff6b6b" }}
        >
          {error}
        </div>
      )}

      <label
        className="block mb-6 cursor-pointer mx-auto"
        style={{ maxWidth: "512px" }}
      >
        <div
          className="w-full rounded-2xl flex flex-col items-center justify-center overflow-hidden"
          style={{
            border: "2px dashed var(--border)",
            background: "var(--bg-elevated)",
            minHeight: "200px",
          }}
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-auto rounded-2xl"
              style={{ maxHeight: "512px", objectFit: "contain" }}
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
        <input
          type="text"
          placeholder="Title *"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={inputStyle}
        />

        <div className="flex gap-2">
          <select
            value={form.currency}
            onChange={(e) =>
              setForm((f) => ({ ...f, currency: e.target.value }))
            }
            className="px-3 py-3 rounded-xl text-sm outline-none"
            style={{ ...inputStyle, minWidth: "90px" }}
          >
            {["NOK", "USD", "EUR", "GBP", "SEK", "DKK"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Price — leave 0 if not for sale"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
            style={inputStyle}
          />
        </div>

        <select
          value={form.medium}
          onChange={(e) => setForm((f) => ({ ...f, medium: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={inputStyle}
        >
          <option value="">Medium (optional)</option>
          {[
            "Oil",
            "Acrylic",
            "Watercolor",
            "Gouache",
            "Tempera",
            "Fresco",
            "Encaustic",
            "Pastel",
            "Charcoal",
            "Pencil",
            "Ink",
            "Graphite",
            "Crayon",
            "Digital",
            "Photography",
            "Printmaking",
            "Lithography",
            "Etching",
            "Screenprint",
            "Sculpture",
            "Ceramic",
            "Glass",
            "Textile",
            "Mixed Media",
            "Other",
          ].map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={form.style}
          onChange={(e) => setForm((f) => ({ ...f, style: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={inputStyle}
        >
          <option value="">Style (optional)</option>
          {[
            "Abstract",
            "Realism",
            "Impressionism",
            "Expressionism",
            "Surrealism",
            "Minimalism",
            "Pop Art",
            "Cubism",
            "Modernism",
            "Contemporary",
            "Street Art",
            "Folk Art",
            "Illustration",
            "Concept Art",
            "Other",
          ].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Year (optional)"
          value={form.year}
          onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={inputStyle}
        />
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-1.5"
            style={{ color: "var(--text-muted)" }}
          >
            Categories (optional)
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "Painting",
              "Drawing",
              "Photography",
              "Sculpture",
              "Digital Art",
              "Printmaking",
              "Illustration",
              "Street Art",
              "Abstract",
              "Portrait",
              "Landscape",
              "Still Life",
              "Wildlife",
              "Architecture",
              "Fashion",
              "Concept Art",
            ].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() =>
                  setSelectedCategories((prev) =>
                    prev.includes(cat)
                      ? prev.filter((c) => c !== cat)
                      : [...prev, cat],
                  )
                }
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: selectedCategories.includes(cat)
                    ? "var(--teal)"
                    : "var(--bg-elevated)",
                  border: `1px solid ${selectedCategories.includes(cat) ? "var(--teal)" : "var(--border)"}`,
                  color: selectedCategories.includes(cat)
                    ? "white"
                    : "var(--text-muted)",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-1.5"
            style={{ color: "var(--text-muted)" }}
          >
            Dimensions (optional)
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Width"
              value={form.width}
              onChange={(e) =>
                setForm((f) => ({ ...f, width: e.target.value }))
              }
              className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
              style={inputStyle}
            />
            <input
              type="number"
              placeholder="Height"
              value={form.height}
              onChange={(e) =>
                setForm((f) => ({ ...f, height: e.target.value }))
              }
              className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
              style={inputStyle}
            />
            <select
              value={form.unit}
              onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
              className="px-3 py-3 rounded-xl text-sm outline-none"
              style={{ ...inputStyle, minWidth: "70px" }}
            >
              {["cm", "in", "mm", "px"].map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

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
