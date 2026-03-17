import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ArtworkImage {
  url: string
  publicId: string
  width?: number
  height?: number
}

interface ArtworkArtist {
  _id: string
  name?: string
  displayName?: string
  username?: string
  avatar?: string
}

interface Artwork {
  _id: string
  title: string
  description: string
  images: ArtworkImage[]
  medium: string
  style: string
  status: string
  forSale: boolean
  price: number
  currency: string
  likesCount: number
  savesCount: number
  views: number
  artist: ArtworkArtist | string
  createdAt: string
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function SavedArtworkRow({ artwork }: { artwork: Artwork }) {
  const navigate = useNavigate()
  const imageUrl = artwork.images[0]?.url
  const artist = typeof artwork.artist === 'object' ? artwork.artist : null
  const artistName = artist?.displayName || artist?.name || artist?.username || null

  return (
    <div
      className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors cursor-pointer"
      onClick={() => navigate(`/artworks/${artwork._id}`)}
    >
      {/* Thumbnail */}
      <div
        className="flex-shrink-0 rounded-xl overflow-hidden"
        style={{ width: 64, height: 64, background: 'var(--bg)' }}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={artwork.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span style={{ fontSize: 24 }}>🖼️</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
          {artwork.title}
        </p>
        {artistName && (
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
            by {artistName}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          {artwork.medium && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {artwork.medium}
            </span>
          )}
          {artwork.forSale && artwork.medium && (
            <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>·</span>
          )}
          {artwork.forSale && (
            <span className="text-xs font-semibold" style={{ color: 'var(--teal)' }}>
              {artwork.currency} {artwork.price.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Engagement */}
      <div className="flex-shrink-0 text-right hidden sm:block">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>♡ {artwork.likesCount}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>🔖 {artwork.savesCount}</p>
      </div>

      {/* Chevron */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: 'var(--text-muted)', flexShrink: 0 }}
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SavedArtworks() {
  const navigate = useNavigate()
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/artworks/saved')
      const list: Artwork[] = res.data.data ?? res.data ?? []
      setArtworks(list)
    } catch {
      setError('Failed to load saved artworks')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pb-24 max-w-2xl mx-auto">
      {/* Header */}
      <div
        className="flex items-center gap-4 px-4 py-4 sticky top-0 z-10"
        style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors hover:bg-white/5"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text)' }}>
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-lg font-light" style={{ color: 'var(--text)' }}>Saved Artworks</h1>
        {!loading && artworks.length > 0 && (
          <span
            className="ml-auto text-xs px-2 py-1 rounded-lg"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
          >
            {artworks.length} saved
          </span>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--teal)' }}
          />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{error}</p>
          <button
            onClick={load}
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: 'var(--teal)', color: 'white' }}
          >
            Try again
          </button>
        </div>
      ) : artworks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--bg-elevated)' }}
          >
            <span style={{ fontSize: 32 }}>🔖</span>
          </div>
          <p className="text-base font-medium" style={{ color: 'var(--text)' }}>Nothing saved yet</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Tap the bookmark icon on any artwork to save it here
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ background: 'var(--teal)', color: 'white' }}
          >
            Explore artworks
          </button>
        </div>
      ) : (
        <div
          className="mx-4 mt-4 rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          {artworks.map((artwork, i) => (
            <div key={artwork._id}>
              <SavedArtworkRow artwork={artwork} />
              {i < artworks.length - 1 && (
                <div style={{ height: 1, background: 'var(--border)', marginLeft: 84 }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
