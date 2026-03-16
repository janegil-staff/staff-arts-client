import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import ArtworkCard from '../components/ArtworkCard'

interface Artwork {
  _id: string
  title: string
  description: string
  price: number
  currency: string
  images: { url: string }[]
  artist?: any
  status: string
  createdAt: string
}

interface EventItem {
  _id: string
  title: string
  description: string
  type?: string
  category?: string
  coverImage: { url: string }
  startDate: string
  endDate: string
  location?: string
  organizer?: any
  itemType: 'event' | 'exhibition'
}

function EventBanner({ item, onClick }: { item: EventItem, onClick: () => void }) {
  const start = new Date(item.startDate)
  const end = new Date(item.endDate)
  const now = new Date()
  const isLive = start <= now && end >= now
  const daysUntil = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  const typeLabel = item.itemType === 'exhibition'
    ? 'Exhibition'
    : item.category || item.type || 'Event'

  return (
    <div
      onClick={onClick}
      className="relative w-full rounded-2xl overflow-hidden cursor-pointer group flex"
      style={{ height: '100px', border: '1px solid var(--border)', background: 'var(--bg-card)' }}
    >
      <div className="relative flex-shrink-0 w-24 h-full overflow-hidden">
        <img
          src={item.coverImage?.url}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col justify-between px-4 py-3 flex-1 min-w-0">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {isLive ? (
              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(38,142,134,0.2)', color: 'var(--teal)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse inline-block" />
                Live now
              </span>
            ) : daysUntil > 0 ? (
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                {daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
              </span>
            ) : null}
            <span className="text-xs px-2 py-0.5 rounded-full capitalize"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
              {typeLabel}
            </span>
          </div>
          <p className="font-semibold text-sm truncate"
            style={{ fontFamily: 'Playfair Display', color: 'var(--text)' }}>
            {item.title}
          </p>
          <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {item.description}
          </p>
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              📅 {start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} — {end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            {item.location && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                📍 {item.location}
              </span>
            )}
          </div>
          {item.organizer?.name && (
            <span className="text-xs flex-shrink-0 ml-2" style={{ color: 'var(--teal)' }}>
              {item.organizer.name}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [upcoming, setUpcoming] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      api.get('/artworks'),
      api.get('/events'),
      api.get('/exhibitions'),
    ])
      .then(([artRes, evtRes, exhRes]) => {
        setArtworks(artRes.data.data || [])

        const now = new Date()

        const events: EventItem[] = (evtRes.data.data || [])
          .filter((e: any) => new Date(e.endDate) >= now)
          .map((e: any) => ({ ...e, itemType: 'event' as const }))

        const exhibitions: EventItem[] = (exhRes.data.data || [])
          .filter((e: any) => new Date(e.endDate) >= now)
          .map((e: any) => ({ ...e, itemType: 'exhibition' as const }))

        const mixed = [...events, ...exhibitions]
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
          .slice(0, 3)

        setUpcoming(mixed)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen px-4 pt-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display', color: 'var(--text)' }}>
          Discover Art
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Original art, events and exhibitions
        </p>
      </div>

      {upcoming.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}>
              What's On
            </h2>
            <button onClick={() => navigate('/shows')}
              className="text-xs" style={{ color: 'var(--teal)' }}>
              See all
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {upcoming.map(item => (
              <EventBanner
                key={item._id}
                item={item}
                onClick={() => navigate(`/${item.itemType}s/${item._id}`)}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-semibold text-sm uppercase tracking-wider mb-3"
          style={{ color: 'var(--text-muted)' }}>
          Latest Artworks
        </h2>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 rounded-xl animate-pulse"
                style={{ background: 'var(--bg-elevated)' }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {artworks.map(artwork => (
              <ArtworkCard key={artwork._id} artwork={artwork} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
