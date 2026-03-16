import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Upload from './pages/Upload'
import Shows from './pages/Shows'
import ShowEvents from './pages/ShowEvents'
import ShowExhibitions from './pages/ShowExhibitions'
import ShowMusic from './pages/ShowMusic'
import Profile from './pages/Profile'
import Messages from './pages/Messages'
import ArtworkDetail from './pages/ArtworkDetail'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <Navbar />
        <div className="pt-0 pb-20 md:pt-16 md:pb-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/shows" element={<Shows />} />
            <Route path="/shows/events" element={<ShowEvents />} />
            <Route path="/shows/exhibitions" element={<ShowExhibitions />} />
            <Route path="/shows/music" element={<ShowMusic />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/messages/:id" element={<Messages />} />
            <Route path="/artwork/:id" element={<ArtworkDetail />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
