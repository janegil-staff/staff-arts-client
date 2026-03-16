import { NavLink } from 'react-router-dom'
import { Home, Compass, Upload, Tv2, User, MessageCircle } from 'lucide-react'

const links = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/explore', icon: Compass, label: 'Explore' },
  { to: '/upload', icon: Upload, label: 'Upload' },
  { to: '/shows', icon: Tv2, label: 'Shows' },
  { to: '/messages', icon: MessageCircle, label: 'Messages' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function Navbar() {
  return (
    <>
      {/* Top navbar - tablet and desktop */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 items-center justify-between px-8 h-16"
        style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <span className="font-bold text-lg" style={{ fontFamily: 'Playfair Display', color: 'var(--teal)' }}>
          Staff Arts
        </span>
        <div className="flex items-center gap-1">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-white'
                    : 'hover:bg-white/5'
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? 'var(--teal)' : 'var(--text-muted)',
                background: isActive ? 'rgba(38,142,134,0.1)' : undefined,
              })}
            >
              <Icon size={16} strokeWidth={1.5} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Bottom navbar - mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-3"
        style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all duration-200 ${
                isActive ? 'opacity-100' : 'opacity-40 hover:opacity-70'
              }`
            }>
            {({ isActive }) => (
              <>
                <Icon size={22} color={isActive ? 'var(--teal)' : 'var(--text)'} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-xs" style={{ color: isActive ? 'var(--teal)' : 'var(--text-muted)' }}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
