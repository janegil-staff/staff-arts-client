import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ArtworkImage {
  url: string
  publicId: string
  width?: number
  height?: number
  blurUrl?: string
}

interface Artwork {
  _id: string
  title: string
  description: string
  images: ArtworkImage[]
  medium: string
  style: string
  status: 'draft' | 'published' | 'sold' | 'archived' | 'available'
  forSale: boolean
  price: number
  currency: string
  likesCount: number
  savesCount: number
  views: number
  createdAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusColor = (status: Artwork['status']) => {
  switch (status) {
    case 'published':
    case 'available': return 'var(--teal)'
    case 'sold':      return '#60a5fa'
    case 'draft':     return 'var(--text-muted)'
    case 'archived':  return '#f59e0b'
    default:          return 'var(--text-muted)'
  }
}

// ─── Delete confirmation modal ────────────────────────────────────────────────

function DeleteModal({
  artwork,
  onConfirm,
  onCancel,
  loading,
}: {
  artwork: Artwork
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-t-2xl p-6"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text)' }}>
          Delete Artwork
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          Are you sure you want to delete <span style={{ color: 'var(--text)' }}>"{artwork.title}"</span>?
          This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-white/5"
            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-medium transition-opacity"
            style={{ background: '#ef4444', color: 'white', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function ArtworkRow({
  artwork,
  onDelete,
}: {
  artwork: Artwork
  onDelete: (a: Artwork) => void
}) {
  const navigate = useNavigate()
  const imageUrl = artwork.images[0]?.url
  const color = statusColor(artwork.status)

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
        <p
          className="text-sm font-medium truncate"
          style={{ color: 'var(--text)' }}
        >
          {artwork.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {artwork.medium && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {artwork.medium}
            </span>
          )}
          {artwork.medium && (
            <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>·</span>
          )}
          {/* Status badge */}
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              color,
              background: `${color}18`,
              border: `1px solid ${color}40`,
              fontSize: 10,
            }}
          >
            {artwork.status[0].toUpperCase() + artwork.status.slice(1)}
          </span>
        </div>
        {artwork.forSale && (
          <p className="text-xs mt-1 font-semibold" style={{ color: 'var(--teal)' }}>
            {artwork.currency} {artwork.price.toLocaleString()}
          </p>
        )}
      </div>

      {/* Stats + delete */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right hidden sm:block">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            👁 {artwork.views}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            ♡ {artwork.likesCount}
          </p>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onDelete(artwork) }}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-red-500/10"
          title="Delete artwork"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MyArtworks() {
  const navigate = useNavigate()
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<Artwork | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      // Get current user id from /me first
      const meRes = await api.get('/mobile/auth/me')
     const user = meRes.data.data?.user || meRes.data.data || meRes.data.user || meRes.data;
      const res = await api.get(`/users/${user._id}/artworks`)
      const list: Artwork[] = res.data.data ?? res.data ?? []
      setArtworks(list)
    } catch (e) {
      setError('Failed to load artworks')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await api.delete(`/artworks/${toDelete._id}`)
      setArtworks(prev => prev.filter(a => a._id !== toDelete._id))
      setToDelete(null)
    } catch {
      // keep modal open so user can retry
    } finally {
      setDeleting(false)
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
        <h1 className="text-lg font-light" style={{ color: 'var(--text)' }}>My Artworks</h1>
        {!loading && artworks.length > 0 && (
          <span
            className="ml-auto text-xs px-2 py-1 rounded-lg"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
          >
            {artworks.length} {artworks.length === 1 ? 'work' : 'works'}
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
            <span style={{ fontSize: 32 }}>🎨</span>
          </div>
          <p className="text-base font-medium" style={{ color: 'var(--text)' }}>No artworks yet</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Upload your first artwork to get started</p>
        </div>
      ) : (
        <div
          className="mx-4 mt-4 rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          {artworks.map((artwork, i) => (
            <div key={artwork._id}>
              <ArtworkRow artwork={artwork} onDelete={setToDelete} />
              {i < artworks.length - 1 && (
                <div style={{ height: 1, background: 'var(--border)', marginLeft: 84 }} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete modal */}
      {toDelete && (
        <DeleteModal
          artwork={toDelete}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
