import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, MessageCircle, UserPlus, UserCheck } from 'lucide-react'
import api from '../services/api'
import ArtworkCard from '../components/ArtworkCard'

export default function ArtistProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [artist, setArtist] = useState<any>(null)
  const [artworks, setArtworks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/users/${id}`)
        const data = res.data.data || res.data
        setArtist(data)
        setIsFollowing(data.isFollowing === true)

        // Check if own profile
        try {
          const me = await api.get('/mobile/auth/me')
          const myUser = me.data?.data?.user || me.data?.data || me.data
          const myId = myUser._id || myUser.id
          setIsOwnProfile(myId === (data._id || data.id))
        } catch {}

        // Load artworks
        const artRes = await api.get('/artworks', { params: { artist: id, limit: 20 } })
        setArtworks(artRes.data.data || [])
      } catch (e) {
        console.error('Artist profile error', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleFollow = async () => {
    if (!artist || followLoading) return
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    setFollowLoading(true)
    try {
      const res = await api.post(`/users/${artist._id || artist.id}/follow`)
      const following = res.data.data?.following === true
      setIsFollowing(following)
      setArtist((a: any) => ({
        ...a,
        followerCount: following ? (a.followerCount ?? 0) + 1 : (a.followerCount ?? 1) - 1,
        followersCount: following ? (a.followersCount ?? 0) + 1 : (a.followersCount ?? 1) - 1,
      }))
    } catch (e) {
      console.error('Follow error', e)
    } finally {
      setFollowLoading(false)
    }
  }

  const handleMessage = async () => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    try {
      const res = await api.post('/conversations', { participantId: artist._id || artist.id })
      const convo = res.data.data
      navigate(`/messages/${convo._id || convo.id}`)
    } catch (e) {
      console.error('Message error', e)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--teal)' }} />
    </div>
  )

  if (!artist) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p style={{ color: 'var(--text-muted)' }}>Artist not found</p>
      <button onClick={() => navigate(-1)} style={{ color: 'var(--teal)' }}>Go back</button>
    </div>
  )

  const initials = ((artist.displayName || artist.name || '?')[0]).toUpperCase()
  const followerCount = artist.followerCount ?? artist.followersCount ?? 0
  const followingCount = artist.followingCount ?? 0
  const artworkCount = artist.artworkCount ?? artworks.length

  return (
    <div className="min-h-screen pb-24 max-w-2xl mx-auto">

      {/* Cover */}
      <div className="relative" style={{ height: '160px' }}>
        {artist.coverImage ? (
          <img src={artist.coverImage} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full"
            style={{ background: 'linear-gradient(135deg, #0d3b2e 0%, #1e2d4a 100%)' }} />
        )}
        <button onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <ArrowLeft size={20} color="white" />
        </button>
      </div>

      {/* Avatar overlapping cover */}
      <div className="px-5">
        <div className="relative -mt-10 mb-3" style={{ width: '80px' }}>
          {artist.avatar ? (
            <img src={artist.avatar} alt={artist.name} className="rounded-full object-cover"
              style={{ width: '80px', height: '80px', border: '3px solid var(--bg)' }} />
          ) : (
            <div className="rounded-full flex items-center justify-center"
              style={{ width: '80px', height: '80px', background: 'var(--bg-elevated)', border: '3px solid var(--bg)' }}>
              <span className="text-2xl font-bold" style={{ color: 'var(--teal)' }}>{initials}</span>
            </div>
          )}
        </div>

        {/* Name + verified */}
        <div className="flex items-center gap-2 mb-0.5">
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
            {artist.displayName || artist.name}
          </h1>
          {artist.isVerified && (
            <span style={{ color: 'var(--teal)' }}>✓</span>
          )}
        </div>

        {/* Username */}
        {artist.username && (
          <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>@{artist.username}</p>
        )}

        {/* Role badge */}
        {artist.role && artist.role !== 'collector' && (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3"
            style={{ background: 'rgba(38,142,134,0.12)', color: 'var(--teal)' }}>
            {artist.role[0].toUpperCase() + artist.role.slice(1)}
          </span>
        )}

        {/* Bio */}
        {artist.bio && (
          <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-muted)' }}>
            {artist.bio}
          </p>
        )}

        {/* Location */}
        {artist.location && (
          <div className="flex items-center gap-1 mb-3">
            <MapPin size={12} style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{artist.location}</span>
          </div>
        )}

        {/* Mediums */}
        {artist.mediums?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {artist.mediums.map((m: string) => (
              <span key={m} className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                {m}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-6 mb-4">
          {[
            { label: 'Followers', value: followerCount },
            { label: 'Following', value: followingCount },
            { label: 'Works', value: artworkCount },
          ].map(stat => (
            <div key={stat.label}>
              <p className="font-semibold text-base" style={{ color: 'var(--text)' }}>{stat.value}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Action buttons — hide on own profile */}
        {!isOwnProfile && (
          <div className="flex gap-3 mb-6">
            <button onClick={handleFollow} disabled={followLoading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: isFollowing ? 'transparent' : 'var(--teal)',
                border: `1px solid ${isFollowing ? 'var(--border)' : 'var(--teal)'}`,
                color: isFollowing ? 'var(--text)' : 'white',
              }}>
              {followLoading
                ? <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: isFollowing ? 'var(--text)' : 'white' }} />
                : isFollowing
                  ? <><UserCheck size={16} /> Following</>
                  : <><UserPlus size={16} /> Follow</>
              }
            </button>
            <button onClick={handleMessage}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:bg-white/5"
              style={{ border: '1px solid var(--border)', color: 'var(--text)' }}>
              <MessageCircle size={16} /> Message
            </button>
          </div>
        )}
      </div>

      {/* Artworks */}
      {artworks.length > 0 ? (
        <div className="px-5">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--text-muted)' }}>Artworks</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {artworks.map(artwork => (
              <ArtworkCard key={artwork._id} artwork={artwork} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No artworks yet</p>
        </div>
      )}
    </div>
  )
}
