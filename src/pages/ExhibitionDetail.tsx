import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar, Ticket, Globe, Eye } from 'lucide-react'
import api from '../services/api'

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })
}

const statusColors: Record<string, { bg: string, color: string }> = {
  upcoming: { bg: 'rgba(38,142,134,0.12)', color: '#2dd4a0' },
  ongoing:  { bg: '#1e2d4a', color: '#60a5fa' },
  past:     { bg: 'var(--bg-elevated)', color: 'var(--text-muted)' },
  cancelled:{ bg: 'rgba(255,100,100,0.12)', color: '#ff6b6b' },
}

export default function ExhibitionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ex, setEx] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/exhibitions/${id}`)
      .then(r => setEx(r.data.data || r.data))
      .catch(() => navigate('/shows'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--teal)' }} />
    </div>
  )

  if (!ex) return null

  const coverUrl = ex.coverImage?.url
  const dateStr = ex.startDate
    ? `${formatDate(ex.startDate)}${ex.endDate ? ` — ${formatDate(ex.endDate)}` : ''}`
    : ''
  const statusCfg = statusColors[ex.status] || statusColors.upcoming
  const artworks = ex.artworks || []
  const artists = ex.artists || []

  return (
    <div className="min-h-screen max-w-2xl mx-auto">
      {/* Hero */}
      <div className="relative" style={{ height: coverUrl ? '360px' : '200px' }}>
        {coverUrl ? (
          <img src={coverUrl} alt={ex.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--bg-elevated)' }}>
            <span className="text-6xl">🖼️</span>
          </div>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 30%, var(--bg) 100%)' }} />
        <button onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <ArrowLeft size={20} color="white" />
        </button>
      </div>

      <div className="px-8 pb-24">
        {/* Status badge */}
        {ex.status && (
          <div className="mt-4 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
              style={{ background: statusCfg.bg, color: statusCfg.color }}>
              {ex.status}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl font-light mb-2" style={{ color: 'var(--text)', letterSpacing: '0.5px', lineHeight: 1.2 }}>
          {ex.title}
        </h1>

        {ex.isFeatured && (
          <p className="text-sm mb-4" style={{ color: '#f59e0b' }}>⭐ Featured</p>
        )}

        {/* Info pills */}
        <div className="flex flex-wrap gap-2 mb-6 mt-4">
          {dateStr && (
            <span className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <Calendar size={14} /> {dateStr}
            </span>
          )}
          {ex.location && (
            <span className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <MapPin size={14} /> {ex.location}
            </span>
          )}
          {ex.isVirtual && (
            <span className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <Globe size={14} /> Virtual
            </span>
          )}
          {ex.isFree ? (
            <span className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <Ticket size={14} /> Free
            </span>
          ) : ex.ticketPrice > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <Ticket size={14} /> {ex.ticketPrice} {ex.currency || 'NOK'}
            </span>
          )}
          {ex.views > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <Eye size={14} /> {ex.views} views
            </span>
          )}
        </div>

        {/* Organizer */}
        {ex.organizer && (
          <div className="flex items-center gap-3 p-4 rounded-2xl mb-6 cursor-pointer hover:bg-white/5"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
            onClick={() => navigate(`/profile/${ex.organizer._id}`)}>
            <img
              src={ex.organizer.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ex.organizer._id}`}
              alt={ex.organizer.name}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Organizer</p>
              <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>
                {ex.organizer.displayName || ex.organizer.name}
              </p>
            </div>
            <span style={{ color: 'var(--text-muted)' }}>›</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          {ex.isVirtual && ex.virtualUrl && (
            <a href={ex.virtualUrl} target="_blank" rel="noreferrer"
              className="flex-1 py-4 rounded-xl font-semibold text-center text-white"
              style={{ background: 'var(--teal)' }}>
              Visit Online
            </a>
          )}
          {!ex.isFree && ex.ticketPrice > 0 && (
            <button className="flex-1 py-4 rounded-xl font-semibold text-white"
              style={{ background: 'var(--teal)' }}>
              Get Tickets
            </button>
          )}
        </div>

        {/* Description */}
        {ex.description && (
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>About</p>
            <p className="text-sm leading-relaxed font-light" style={{ color: 'var(--text-muted)' }}>
              {ex.description}
            </p>
          </div>
        )}

        {/* Artists */}
        {artists.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Artists</p>
            <div className="flex flex-wrap gap-2">
              {artists.map((a: any) => {
                const artist = typeof a === 'object' ? a : { _id: a }
                return (
                  <div key={artist._id}
                    onClick={() => navigate(`/profile/${artist._id}`)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <img
                      src={artist.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${artist._id}`}
                      alt={artist.name} className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                      {artist.displayName || artist.name}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Artworks */}
        {artworks.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Artworks</p>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {artworks.map((a: any) => {
                const art = typeof a === 'object' ? a : { _id: a }
                const img = art.images?.[0]?.url
                return (
                  <div key={art._id}
                    onClick={() => navigate(`/artwork/${art._id}`)}
                    className="flex-shrink-0 w-36 cursor-pointer">
                    <div className="w-36 h-40 rounded-xl overflow-hidden mb-2"
                      style={{ background: 'var(--bg-elevated)' }}>
                      {img ? (
                        <img src={img} alt={art.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span style={{ color: 'var(--text-muted)' }}>🖼️</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs truncate font-medium" style={{ color: 'var(--text)' }}>{art.title}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
