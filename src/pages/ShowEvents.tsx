import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import api from '../services/api'

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
}

export default function ShowEvents() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/events')
      .then(r => setEvents((r.data.data || []).filter((e: any) => e.category !== 'music')))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen max-w-3xl mx-auto">
      <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => navigate('/shows')}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} style={{ color: 'var(--text)' }} />
        </button>
        <h1 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>Events</h1>
        {!loading && <span className="ml-auto text-sm" style={{ color: 'var(--text-muted)' }}>{events.length} events</span>}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--teal)' }} />
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <span className="text-5xl">📅</span>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>No events yet</p>
        </div>
      ) : (
        <div>
          {events.map((e: any) => {
            const d = e.date ?? e.startDate
            const dateStr = d ? formatDate(d) : ''
            const img = e.coverImage?.url
            return (
              <div key={e._id} onClick={() => navigate(`/events/${e._id}`)}
                className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
                style={{ borderBottom: '1px solid var(--border)' }}>
                {img ? (
                  <img src={img} alt={e.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#0d3b2e' }}>
                    <span className="text-base">📅</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: 'var(--text)' }}>{e.title}</p>
                  <p className="text-xs truncate mt-1" style={{ color: 'var(--text-muted)' }}>
                    {[dateStr, e.location].filter(Boolean).join('  ·  ')}
                  </p>
                </div>
                {e.isFree && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ border: '1px solid var(--teal)', color: 'var(--teal)' }}>Free</span>
                )}
                <span style={{ color: 'var(--text-muted)' }}>›</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
