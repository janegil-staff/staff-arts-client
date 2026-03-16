import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar, Users, Ticket, Globe } from 'lucide-react'
import api from '../services/api'

const musicTypes: Record<string, string> = {
  concert: 'Concert', dj_set: 'DJ Set', live_performance: 'Live Performance',
  open_mic: 'Open Mic', festival: 'Festival', album_release: 'Album Release',
  opening: 'Opening', workshop: 'Workshop', talk: 'Talk', fair: 'Art Fair', other: 'Event',
}

const isMusicType = (type: string) =>
  ['concert','dj_set','live_performance','open_mic','festival','album_release'].includes(type)

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/events/${id}`)
      .then(r => setEvent(r.data.data || r.data))
      .catch(() => navigate('/shows'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--teal)' }} />
    </div>
  )

  if (!event) return null

  const coverUrl = event.coverImage?.url
  const isMusic = isMusicType(event.type) || event.category === 'music'
  const typeColor = isMusic ? '#c084fc' : '#2dd4a0'
  const typeLabel = musicTypes[event.type] || 'Event'

  const dateStr = event.date
    ? new Date(event.date).toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : ''
  const timeStr = event.date
    ? new Date(event.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div className="min-h-screen max-w-2xl mx-auto">
      {/* Hero */}
      <div className="relative" style={{ height: coverUrl ? '340px' : '180px' }}>
        {coverUrl ? (
          <img src={coverUrl} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--bg-elevated)' }}>
            <span className="text-6xl">{isMusic ? '🎵' : '📅'}</span>
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
        {/* Type badge */}
        <div className="flex items-center gap-2 mb-3 mt-4">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
            style={{ background: `${typeColor}20`, color: typeColor }}>
            {isMusic ? '🎵' : '📅'} {typeLabel}
          </span>
          {event.isOnline && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
              style={{ background: 'rgba(96,165,250,0.12)', color: '#60a5fa' }}>
              <Globe size={10} /> Online
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-light mb-4" style={{ color: 'var(--text)', letterSpacing: '0.5px', lineHeight: 1.2 }}>
          {event.title}
        </h1>

        {/* Date card */}
        {dateStr && (
          <div className="flex items-center gap-4 p-4 rounded-2xl mb-4"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(38,142,134,0.1)' }}>
              <Calendar size={20} style={{ color: 'var(--teal)' }} />
            </div>
            <div>
              <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>{dateStr}</p>
              {timeStr && <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{timeStr}</p>}
            </div>
          </div>
        )}

        {/* Info pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {event.location && (
            <span className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <MapPin size={14} /> {event.location}
            </span>
          )}
          {event.isFree ? (
            <span className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <Ticket size={14} /> Free
            </span>
          ) : event.price > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <Ticket size={14} /> {event.price} {event.currency || 'NOK'}
            </span>
          )}
          {event.rsvps?.length > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <Users size={14} /> {event.rsvps.length} attending
            </span>
          )}
        </div>

        {/* Organizer */}
        {event.organizer && (
          <div className="flex items-center gap-3 p-4 rounded-2xl mb-6 cursor-pointer hover:bg-white/5"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
            onClick={() => navigate(`/profile/${event.organizer._id}`)}>
            <img
              src={event.organizer.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${event.organizer._id}`}
              alt={event.organizer.name}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Organizer</p>
              <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>
                {event.organizer.displayName || event.organizer.name}
              </p>
            </div>
            <span style={{ color: 'var(--text-muted)' }}>›</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <button className="flex-1 py-4 rounded-xl font-semibold text-white transition-opacity"
            style={{ background: 'var(--teal)' }}>
            RSVP
          </button>
          {event.isOnline && event.link && (
            <a href={event.link} target="_blank" rel="noreferrer"
              className="flex-1 py-4 rounded-xl font-semibold text-center transition-opacity"
              style={{ border: '1px solid var(--border)', color: 'var(--text)' }}>
              Join Online
            </a>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>About</p>
            <p className="text-sm leading-relaxed font-light" style={{ color: 'var(--text-muted)' }}>
              {event.description}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
