import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ImagePlus } from 'lucide-react'
import api from '../services/api'

type ShowType = 'event' | 'exhibition' | 'music' | null

const eventTypes = ['opening', 'workshop', 'talk', 'fair', 'other']
const musicTypes = ['concert', 'dj_set', 'live_performance', 'open_mic', 'festival', 'album_release']
const currencies = ['NOK', 'USD', 'EUR', 'GBP', 'SEK']

export default function CreateShow() {
  const navigate = useNavigate()
  const [showType, setShowType] = useState<ShowType>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)

  // Shared fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [isFree, setIsFree] = useState(true)
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState('NOK')

  // Event/Music specific
  const [eventType, setEventType] = useState('other')
  const [isOnline, setIsOnline] = useState(false)
  const [link, setLink] = useState('')

  // Exhibition specific
  const [isVirtual, setIsVirtual] = useState(false)
  const [virtualUrl, setVirtualUrl] = useState('')

  const inputStyle = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
  }

  const handleCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const uploadCover = async (folder: string) => {
    if (!coverFile) return null
    const formData = new FormData()
    formData.append('image', coverFile)
    const res = await api.post(`/upload/image?folder=${folder}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    const data = res.data.data || res.data
    return { url: data.url, publicId: data.publicId || '' }
  }

  const handleSubmit = async () => {
    if (!title.trim()) { setError('Title is required'); return }
    if (!startDate) { setError('Start date is required'); return }
    setSubmitting(true)
    setError('')
    try {
      const folder = showType === 'exhibition' ? 'exhibitions' : showType === 'music' ? 'music' : 'events'
      const coverData = await uploadCover(folder)

      const dateTime = startDate && startTime
        ? new Date(`${startDate}T${startTime}`).toISOString()
        : new Date(startDate).toISOString()

      const endDateTime = endDate
        ? new Date(endDate).toISOString()
        : new Date(new Date(startDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()

      let body: any
      let endpoint: string

      if (showType === 'exhibition') {
        endpoint = '/exhibitions'
        body = {
          title: title.trim(),
          description: description.trim(),
          startDate: dateTime,
          endDate: endDateTime,
          location: location.trim(),
          isVirtual,
          virtualUrl: virtualUrl.trim(),
          ticketPrice: Number(price) || 0,
          isFree,
          ...(coverData ? { coverImage: coverData } : {}),
        }
      } else {
        endpoint = '/events'
        body = {
          title: title.trim(),
          description: description.trim(),
          type: eventType,
          category: showType === 'music' ? 'music' : 'event',
          date: dateTime,
          endDate: endDateTime,
          location: location.trim(),
          isOnline,
          link: link.trim(),
          price: Number(price) || 0,
          isFree,
          currency,
          ...(coverData ? { coverImage: coverData } : {}),
        }
      }

      await api.post(endpoint, body)
      navigate('/shows')
    } catch (e: any) {
      setError(e.response?.data?.error || e.response?.data?.message || 'Failed to create show')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Type picker ──
  if (!showType) {
    return (
      <div className="min-h-screen max-w-2xl mx-auto px-4 pt-6 pb-24">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/shows')}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            style={{ border: '1px solid var(--border)' }}>
            <ArrowLeft size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
          <h1 className="text-2xl font-light" style={{ color: 'var(--text)', fontFamily: 'Playfair Display' }}>
            New Show
          </h1>
        </div>

        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          Choose the type of show you want to create
        </p>

        <div className="space-y-3">
          {[
            { type: 'event' as ShowType, icon: '📅', title: 'Event', subtitle: 'Opening, workshop, talk, art fair', color: '#2dd4a0', bg: '#0d3b2e' },
            { type: 'exhibition' as ShowType, icon: '🖼️', title: 'Exhibition', subtitle: 'Gallery show, solo or group exhibition', color: '#60a5fa', bg: '#1e2d4a' },
            { type: 'music' as ShowType, icon: '🎵', title: 'Music Event', subtitle: 'Concert, DJ set, live performance, festival', color: '#c084fc', bg: '#2d1b4e' },
          ].map(({ type, icon, title, subtitle, color, bg }) => (
            <button key={type} onClick={() => setShowType(type)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-colors hover:bg-white/5"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: bg }}>
                <span className="text-2xl">{icon}</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
              </div>
              <span style={{ color }}>›</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const typeLabel = showType === 'exhibition' ? 'Exhibition' : showType === 'music' ? 'Music Event' : 'Event'

  // ── Form ──
  return (
    <div className="min-h-screen max-w-2xl mx-auto px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setShowType(null)}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
          style={{ border: '1px solid var(--border)' }}>
          <ArrowLeft size={18} style={{ color: 'var(--text-muted)' }} />
        </button>
        <h1 className="text-lg font-medium" style={{ color: 'var(--text)' }}>New {typeLabel}</h1>
        <button onClick={handleSubmit} disabled={submitting}
          className="text-sm font-semibold disabled:opacity-50"
          style={{ color: 'var(--teal)' }}>
          {submitting ? 'Publishing...' : 'Publish'}
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm"
          style={{ background: 'rgba(255,100,100,0.1)', color: '#ff6b6b' }}>
          {error}
        </div>
      )}

      <div className="space-y-5">
        {/* Cover image */}
        <label className="block cursor-pointer">
          <div className="w-full rounded-2xl overflow-hidden flex flex-col items-center justify-center"
            style={{ minHeight: '180px', border: '2px dashed var(--border)', background: 'var(--bg-elevated)' }}>
            {preview ? (
              <img src={preview} alt="Cover" className="w-full h-48 object-cover rounded-2xl" />
            ) : (
              <>
                <ImagePlus size={36} style={{ color: 'var(--teal)' }} />
                <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Add cover image</p>
              </>
            )}
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleCover} />
        </label>

        {/* Title */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Title *</p>
          <input type="text" placeholder="Give your show a name" value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
        </div>

        {/* Description */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Description</p>
          <textarea placeholder="Tell people what to expect..." value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3} className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none" style={inputStyle} />
        </div>

        {/* Event type chips */}
        {showType === 'event' && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Event Type</p>
            <div className="flex flex-wrap gap-2">
              {eventTypes.map(t => (
                <button key={t} onClick={() => setEventType(t)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: eventType === t ? 'var(--teal)' : 'var(--bg-elevated)',
                    border: `1px solid ${eventType === t ? 'var(--teal)' : 'var(--border)'}`,
                    color: eventType === t ? 'white' : 'var(--text-muted)',
                  }}>
                  {t[0].toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Music type chips */}
        {showType === 'music' && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Music Type</p>
            <div className="flex flex-wrap gap-2">
              {musicTypes.map(t => (
                <button key={t} onClick={() => setEventType(t)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: eventType === t ? '#c084fc' : 'var(--bg-elevated)',
                    border: `1px solid ${eventType === t ? '#c084fc' : 'var(--border)'}`,
                    color: eventType === t ? 'white' : 'var(--text-muted)',
                  }}>
                  {t.replace(/_/g, ' ')[0].toUpperCase() + t.replace(/_/g, ' ').slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Exhibition virtual toggle */}
        {showType === 'exhibition' && (
          <div className="flex items-center justify-between px-4 py-3 rounded-xl"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Virtual exhibition</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>This exhibition is online only</p>
            </div>
            <button onClick={() => setIsVirtual(v => !v)}
              className="w-11 h-6 rounded-full transition-colors relative"
              style={{ background: isVirtual ? 'var(--teal)' : 'var(--border)' }}>
              <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                style={{ left: isVirtual ? '22px' : '2px' }} />
            </button>
          </div>
        )}

        {/* Dates */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Date & Time</p>
          <div className="flex gap-2 mb-2">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
          </div>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle}
            placeholder="End date (optional)" />
        </div>

        {/* Location */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
            {showType === 'exhibition' && isVirtual ? 'Virtual URL' : 'Location'}
          </p>
          {showType === 'exhibition' && isVirtual ? (
            <input type="url" placeholder="https://..." value={virtualUrl}
              onChange={e => setVirtualUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
          ) : (
            <input type="text" placeholder="Venue or address" value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
          )}
        </div>

        {/* Pricing */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Pricing</p>
          <div className="flex items-center justify-between px-4 py-3 rounded-xl mb-2"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Free entry</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>No ticket price</p>
            </div>
            <button onClick={() => setIsFree(v => !v)}
              className="w-11 h-6 rounded-full transition-colors relative"
              style={{ background: isFree ? 'var(--teal)' : 'var(--border)' }}>
              <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                style={{ left: isFree ? '22px' : '2px' }} />
            </button>
          </div>
          {!isFree && (
            <div className="flex gap-2">
              <select value={currency} onChange={e => setCurrency(e.target.value)}
                className="px-3 py-3 rounded-xl text-sm outline-none"
                style={{ ...inputStyle, minWidth: '80px' }}>
                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" placeholder="0" value={price}
                onChange={e => setPrice(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
            </div>
          )}
        </div>

        {/* Online event toggle (events/music only) */}
        {showType !== 'exhibition' && (
          <div>
            <div className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Online event</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>This event takes place online</p>
              </div>
              <button onClick={() => setIsOnline(v => !v)}
                className="w-11 h-6 rounded-full transition-colors relative"
                style={{ background: isOnline ? 'var(--teal)' : 'var(--border)' }}>
                <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                  style={{ left: isOnline ? '22px' : '2px' }} />
              </button>
            </div>
            {isOnline && (
              <input type="url" placeholder="Event link (Zoom, YouTube, etc.)" value={link}
                onChange={e => setLink(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none mt-2" style={inputStyle} />
            )}
          </div>
        )}

        {/* Submit */}
        <button onClick={handleSubmit} disabled={submitting}
          className="w-full py-4 rounded-xl font-semibold text-white transition-opacity disabled:opacity-50"
          style={{ background: 'var(--teal)' }}>
          {submitting ? 'Publishing...' : `Publish ${typeLabel}`}
        </button>
      </div>
    </div>
  )
}
