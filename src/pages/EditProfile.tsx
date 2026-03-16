import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import api from '../services/api'

export default function EditProfile() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [user, setUser] = useState<any>(null)
  const [form, setForm] = useState({ name: '', displayName: '', bio: '', location: '', username: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/mobile/auth/me')
      .then(r => {
        const u = r.data?.data?.user || r.data?.data || r.data?.user || r.data
        setUser(u)
        setForm({
          name: u.name || '',
          displayName: u.displayName || '',
          bio: u.bio || '',
          location: u.location || '',
          username: u.username || '',
        })
      })
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!form.name) { setError('Name is required'); return }
    setSaving(true)
    setError('')
    try {
      const userId = user._id || user.id || id
      await api.patch(`/users/${userId}`, form)
      navigate('/profile')
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--teal)' }} />
    </div>
  )

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-6 py-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
          style={{ border: '1px solid var(--border)' }}>
          <ArrowLeft size={18} style={{ color: 'var(--text-muted)' }} />
        </button>
        <h1 className="text-lg font-medium" style={{ color: 'var(--text)' }}>Edit Profile</h1>
        <button onClick={handleSave} disabled={saving}
          className="text-sm font-semibold disabled:opacity-50"
          style={{ color: 'var(--teal)' }}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm"
          style={{ background: 'rgba(255,100,100,0.1)', color: '#ff6b6b' }}>
          {error}
        </div>
      )}

      <div className="space-y-4">
        {[
          { key: 'name', label: 'Full Name', placeholder: 'Your full name' },
          { key: 'displayName', label: 'Display Name', placeholder: 'How you appear to others' },
          { key: 'username', label: 'Username', placeholder: 'your_username' },
          { key: 'location', label: 'Location', placeholder: 'City, Country' },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: 'var(--text-muted)' }}>{label}</p>
            <input
              type="text"
              placeholder={placeholder}
              value={form[key as keyof typeof form]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={inputStyle}
            />
          </div>
        ))}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1.5"
            style={{ color: 'var(--text-muted)' }}>Bio</p>
          <textarea
            placeholder="Tell people about yourself..."
            value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            rows={4}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
            style={inputStyle}
          />
        </div>
      </div>
    </div>
  )
}
