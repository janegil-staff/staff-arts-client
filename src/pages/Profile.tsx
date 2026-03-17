import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera } from 'lucide-react'
import api from '../services/api'

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const avatarRef = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    api.get('/mobile/auth/me')
      .then(r => { setUser(r.data.data?.user || r.data.data || r.data.user || r.data) })
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false))
  }, [])

  const uploadImage = async (file: File): Promise<{ url: string, publicId: string }> => {
    const formData = new FormData()
    formData.append('image', file)
    const res = await api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data.data || res.data
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploadingAvatar(true)
    try {
      const { url } = await uploadImage(file)
      await api.patch(`/users/${user._id}`, { avatar: url })
      setUser((u: any) => ({ ...u, avatar: url }))
    } catch (err) {
      console.error('Avatar upload failed', err)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploadingCover(true)
    try {
      const { url } = await uploadImage(file)
      await api.patch(`/users/${user._id}`, { coverImage: url })
      setUser((u: any) => ({ ...u, coverImage: url }))
    } catch (err) {
      console.error('Cover upload failed', err)
    } finally {
      setUploadingCover(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--teal)' }} />
    </div>
  )

  if (!user) return null

  const initials = ((user.displayName || user.name || '?')[0]).toUpperCase()

  const menuItems = [
    { icon: '🎨', label: 'My Artworks', path: '/my-artworks' },
    { icon: '🔖', label: 'Saved Artworks', path: '/saved-artworks' },
    { icon: '💬', label: 'Messages', path: '/messages' },
    { icon: '⚙️', label: 'Settings', path: '/settings' },
  ]

  return (
    <div className="min-h-screen pb-24 max-w-2xl mx-auto">

      {/* Cover photo */}
      <div className="relative" style={{ height: '180px' }}>
        {user.coverImage ? (
          <img src={user.coverImage} alt="Cover"
            className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full"
            style={{ background: 'linear-gradient(135deg, #0d3b2e 0%, #1e2d4a 100%)' }} />
        )}

        {/* Cover upload button */}
        <button
          onClick={() => coverRef.current?.click()}
          disabled={uploadingCover}
          className="absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-opacity"
          style={{ background: 'rgba(0,0,0,0.6)' }}>
          {uploadingCover
            ? <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin border-white" />
            : <Camera size={14} color="white" />
          }
        </button>
        <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
      </div>

      {/* Avatar */}
      <div className="px-6">
        <div className="relative -mt-11 mb-3 w-20" style={{ width: '80px' }}>
          {user.avatar ? (
            <img src={user.avatar} alt={user.name}
              className="w-20 h-20 rounded-full object-cover"
              style={{ border: '3px solid var(--bg)', width: '80px', height: '80px' }} />
          ) : (
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ width: '80px', height: '80px', background: 'var(--bg-elevated)', border: '3px solid var(--bg)' }}>
              <span className="text-2xl font-bold" style={{ color: 'var(--teal)' }}>{initials}</span>
            </div>
          )}

          {/* Avatar upload button */}
          <button
            onClick={() => avatarRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: 'var(--teal)', border: '2px solid var(--bg)' }}>
            {uploadingAvatar
              ? <div className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin border-white" />
              : <Camera size={10} color="white" />
            }
          </button>
          <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>

        {/* User info */}
        <h1 className="text-2xl font-light" style={{ color: 'var(--text)' }}>
          {user.displayName || user.name}
        </h1>
        {user.username && (
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>@{user.username}</p>
        )}
        {user.role && (
          <span className="inline-block mt-2 px-3 py-1 rounded text-xs font-semibold"
            style={{ background: 'rgba(38,142,134,0.12)', color: 'var(--teal)' }}>
            {user.role[0].toUpperCase() + user.role.slice(1)}
          </span>
        )}
        {user.bio && (
          <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {user.bio}
          </p>
        )}
        {user.location && (
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>📍 {user.location}</p>
        )}
      </div>

      {/* Stats */}
      <div className="mx-6 mt-5 rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
        <div className="flex">
          {[
            { label: 'Followers', value: user.followerCount ?? user.followersCount ?? 0 },
            { label: 'Following', value: user.followingCount ?? 0 },
            { label: 'Works', value: user.artworkCount ?? 0 },
          ].map((stat, i) => (
            <div key={stat.label} className="flex-1 flex flex-col items-center py-4"
              style={{ borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <span className="text-xl font-semibold" style={{ color: 'var(--text)' }}>{stat.value}</span>
              <span className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile */}
      <div className="mx-6 mt-4">
        <button onClick={() => navigate('/edit-profile')}
          className="w-full py-3 rounded-xl font-medium text-sm transition-colors hover:bg-white/5"
          style={{ border: '1px solid var(--border)', color: 'var(--text)' }}>
          Edit Profile
        </button>
      </div>

      {/* Menu */}
      <div className="mx-6 mt-4 rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
        {menuItems.map((item, i) => (
          <div key={item.label}>
            <div onClick={() => navigate(item.path)}
              className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-white/5 transition-colors">
              <span className="text-lg">{item.icon}</span>
              <span className="flex-1 text-sm font-medium" style={{ color: 'var(--text)' }}>{item.label}</span>
              <span style={{ color: 'var(--text-muted)' }}>›</span>
            </div>
            {i < menuItems.length - 1 && (
              <div style={{ height: '1px', background: 'var(--border)', marginLeft: '56px' }} />
            )}
          </div>
        ))}
      </div>

      {/* Sign Out */}
      <div className="mx-6 mt-4">
        <button onClick={handleLogout}
          className="w-full py-3 text-sm font-medium"
          style={{ color: '#ef4444' }}>
          Sign Out
        </button>
      </div>

    </div>
  )
}
