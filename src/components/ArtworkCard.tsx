import { useNavigate } from 'react-router-dom'

interface Artist {
  id?: string
  _id?: string
  name: string
  displayName?: string
  avatar?: string
}

interface ArtworkImage {
  url: string
}

export interface Artwork {
  _id: string
  title: string
  description: string
  price: number
  currency: string
  images: ArtworkImage[]
  artist?: Artist | null
  status: string
  createdAt: string
}

interface Props {
  artwork: Artwork
  size?: 'sm' | 'md' | 'lg'
}

export default function ArtworkCard({ artwork, size = 'md' }: Props) {
  const navigate = useNavigate()
  const heights = { sm: 'h-48', md: 'h-64', lg: 'h-80' }
  const imageUrl = artwork.images?.[0]?.url
  const artistId = artwork.artist?._id || artwork.artist?.id

  return (
    <div
      onClick={() => navigate(`/artwork/${artwork._id}`)}
      className="cursor-pointer group rounded-xl overflow-hidden transition-transform duration-300 hover:-translate-y-1"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className={`relative ${heights[size]} overflow-hidden`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={artwork.title}
            className="no-save w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: 'var(--bg-elevated)' }}>
            <span style={{ color: 'var(--text-muted)' }}>No image</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-white font-semibold text-sm truncate" style={{ fontFamily: 'Playfair Display' }}>
            {artwork.title}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--teal-light)' }}>
            {artwork.price > 0 ? `${artwork.price} ${artwork.currency}` : 'Not for sale'}
          </p>
        </div>
      </div>
      {artwork.artist && (
        <div className="flex items-center gap-2 px-3 py-2">
          <img
            src={artwork.artist.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${artistId}`}
            alt={artwork.artist.name}
            className="w-6 h-6 rounded-full object-cover"
            style={{ border: '1px solid var(--border)' }}
          />
          <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
            {artwork.artist.displayName || artwork.artist.name}
          </span>
        </div>
      )}
    </div>
  )
}
