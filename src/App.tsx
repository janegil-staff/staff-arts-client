import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Upload from './pages/Upload'
import Shows from './pages/Shows'
import ShowEvents from './pages/ShowEvents'
import ShowExhibitions from './pages/ShowExhibitions'
import ShowMusic from './pages/ShowMusic'
import EventDetail from './pages/EventDetail'
import ExhibitionDetail from './pages/ExhibitionDetail'
import Profile from './pages/Profile'
import Messages from './pages/Messages'
import PrivacyPolicy from "./pages/PrivacyPolicy"
import TermsOfService from "./pages/TermsOfService"
import Register from "./pages/Register"
import Login from "./pages/Login"
import ProtectedRoute from "./components/ProtectedRoute"
import ArtistProfile from "./pages/ArtistProfile"
import Settings from "./pages/Settings"
import EditProfile from "./pages/EditProfile"
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
            <Route path="/shows/create" element={<ProtectedRoute><div>Create Show</div></ProtectedRoute>} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/exhibitions/:id" element={<ExhibitionDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<ArtistProfile />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/messages/:id" element={<Messages />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/edit-profile/:id" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
            <Route path="/artwork/:id" element={<ArtworkDetail />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
