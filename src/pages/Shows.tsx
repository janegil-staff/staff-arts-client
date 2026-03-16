import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

interface ShowItem {
  id: string
  type: 'event' | 'exhibition' | 'music'
  title: string
  subType: string
  dateStr: string
  location: string
  imageUrl?: string
  isFree: boolean
  sortDate: number
}

const typeConfigs = {
  event:      { icon: '📅', label: 'Event',      color: '#2dd4a0', bg: '#0d3b2e' },
  exhibition: { icon: '🖼️', label: 'Exhibition', color: '#60a5fa', bg: '#1e2d4a' },
  music:      { icon: '🎵', label: 'Music',      color: '#c084fc', bg: '#2d1b4e' },
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
}

function ShowRow({ item, onClick }: { item: ShowItem, onClick: () => void }) {
  const cfg = typeConfigs[item.type]
  const meta = [cfg.label, item.subType, item.dateStr, item.location].filter(Boolean).join('  ·  ')
  return (
    <div onClick={onClick} className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
      style={{ borderBottom: '1px solid var(--border)' }}>
      {item.imageUrl ? (
        <img src={item.imageUrl} alt={item.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
      ) : (
        <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg }}>
          <span className="text-base">{cfg.icon}</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate" style={{ color: 'var(--text)' }}>{item.title}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{meta}</p>
        </div>
      </div>
      {item.isFree && (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ border: '1px solid var(--teal)', color: 'var(--teal)' }}>Free</span>
      )}
      <span style={{ color: 'var(--text-muted)' }}>›</span>
    </div>
  )
}

function NavButton({ icon, label, count, onClick }: {
  icon: string, label: string, count: number, onClick: () => void
}) {
  return (
    <button onClick={onClick} className="flex-1 flex flex-col items-center py-3 rounded-xl transition-all hover:bg-white/5"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
      <span className="text-xl">{icon}</span>
      <span className="text-xs font-medium mt-1" style={{ color: 'var(--text-muted)' }}>{label}</span>
      {count > 0 && (
        <span className="text-xs font-bold mt-1 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: 'var(--teal)', color: 'white' }}>{count}</span>
      )}
    </button>
  )
}

export default function Shows() {
  const [items, setItems] = useState<ShowItem[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      const [evtRes, exhRes] = await Promise.all([
        api.get('/events').then(r => r.data.data || []).catch(() => []),
        api.get('/exhibitions').then(r => r.data.data || []).catch(() => []),
      ])
      const all: ShowItem[] = []
      for (const e of evtRes) {
        const d = e.date ?? e.startDate
        all.push({
          id: e._id, type: e.category === 'music' ? 'music' : 'event',
          title: e.title ?? '', subType: (e.type ?? '').replace(/_/g, ' '),
          dateStr: d ? formatDate(d) : '', location: e.location ?? '',
          imageUrl: e.coverImage?.url, isFree: e.isFree === true,
          sortDate: d ? new Date(d).getTime() : 0,
        })
      }
      for (const e of exhRes) {
        const d = e.startDate
        let dateStr = d ? formatDate(d) : ''
        if (e.endDate) dateStr += ` – ${formatDate(e.endDate)}`
        all.push({
          id: e._id, type: 'exhibition',
          title: e.title ?? '', subType: e.status ?? '',
          dateStr, location: e.location ?? '',
          imageUrl: e.coverImage?.url, isFree: e.isFree === true,
          sortDate: d ? new Date(d).getTime() : 0,
        })
      }
      all.sort((a, b) => b.sortDate - a.sortDate)
      setItems(all)
      setLoading(false)
    }
    load()
  }, [])

  const eventCount = items.filter(i => i.type === 'event').length
  const exhibitionCount = items.filter(i => i.type === 'exhibition').length
  const musicCount = items.filter(i => i.type === 'music').length

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--teal)' }} />
    </div>
  )

  return (
    <div className="min-h-screen max-w-3xl mx-auto">
      <div className="flex gap-2 px-4 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <NavButton icon="📅" label="Events" count={eventCount} onClick={() => navigate('/shows/events')} />
        <NavButton icon="🖼️" label="Exhibitions" count={exhibitionCount} onClick={() => navigate('/shows/exhibitions')} />
        <NavButton icon="🎵" label="Music" count={musicCount} onClick={() => navigate('/shows/music')} />
      </div>

      {items.length > 0 && (
        <div className="px-4 pt-5 pb-2">
          <p className="text-xs font-semibold tracking-widest" style={{ color: 'var(--text-muted)' }}>
            UPCOMING & RECENT
          </p>
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <span className="text-5xl">🎭</span>
          <p className="text-lg font-light" style={{ color: 'var(--text-muted)' }}>No shows yet</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Create an event, exhibition, or music show</p>
        </div>
      ) : (
        <div>
          {items.map(item => (
            <ShowRow key={item.id} item={item}
              onClick={() => navigate(item.type === 'exhibition' ? `/exhibitions/${item.id}` : `/events/${item.id}`)} />
          ))}
        </div>
      )}

      <button
        onClick={() => navigate('/shows/create')}
        className="fixed bottom-24 right-6 md:bottom-8 flex items-center gap-2 px-5 py-3 rounded-full font-bold shadow-lg transition-transform hover:scale-105"
        style={{ background: 'var(--teal)', color: 'white', boxShadow: '0 4px 20px rgba(38,142,134,0.4)' }}
      >
        <span className="text-lg font-bold">+</span> New Show
      </button>
    </div>
  )
}
