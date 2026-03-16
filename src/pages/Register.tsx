import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import api from '../services/api'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    displayName: '',
    email: '',
    password: '',
    role: 'collector',
  })
  const [obscure, setObscure] = useState(true)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all required fields')
      return
    }
    if (!form.email.includes('@')) {
      setError('Enter a valid email')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (!agreed) {
      setError('Please accept the Privacy Policy and Terms of Service')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/mobile/auth/register', {
        name: form.name.trim(),
        displayName: form.displayName.trim() || undefined,
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      })
      const token = res.data.data?.accessToken
      if (token) {
        localStorage.setItem('token', token)
        navigate('/')
      } else {
        setError('Registration failed — no token received')
      }
    } catch (e: any) {
      setError(e.response?.data?.error || e.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
  }

  const roles = [
    { label: 'Artist', value: 'artist' },
    { label: 'Collector', value: 'collector' },
    { label: 'Gallery', value: 'gallery' },
  ]

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 max-w-sm mx-auto">
      <button onClick={() => navigate(-1)}
        className="w-9 h-9 rounded-full flex items-center justify-center mb-6 hover:bg-white/10 transition-colors"
        style={{ border: '1px solid var(--border)' }}>
        <ArrowLeft size={18} style={{ color: 'var(--text-muted)' }} />
      </button>

      {/* Title */}
      <h1 className="text-3xl font-light mb-8" style={{ color: 'var(--text)' }}>
        Join{' '}
        <span style={{ letterSpacing: '1px' }}>STAFF </span>
        <span style={{ color: 'var(--teal)', fontStyle: 'italic' }}>Arts</span>
      </h1>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm"
          style={{ background: 'rgba(255,100,100,0.1)', color: '#ff6b6b' }}>
          {error}
        </div>
      )}

      <div className="space-y-3">
        {/* Full name */}
        <input
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={inputStyle}
        />

        {/* Display name */}
        <input
          type="text"
          placeholder="Display Name (optional)"
          value={form.displayName}
          onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={inputStyle}
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={inputStyle}
        />

        {/* Password */}
        <div className="relative">
          <input
            type={obscure ? 'password' : 'text'}
            placeholder="Password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none pr-12"
            style={inputStyle}
          />
          <button onClick={() => setObscure(!obscure)}
            className="absolute right-3 top-1/2 -translate-y-1/2">
            {obscure
              ? <EyeOff size={18} style={{ color: 'var(--text-muted)' }} />
              : <Eye size={18} style={{ color: 'var(--text-muted)' }} />
            }
          </button>
        </div>
      </div>

      {/* Role picker */}
      <div className="mt-5">
        <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>I am a...</p>
        <div className="flex gap-2">
          {roles.map(r => (
            <button key={r.value} onClick={() => setForm(f => ({ ...f, role: r.value }))}
              className="flex-1 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                background: form.role === r.value ? 'var(--teal)' : 'var(--bg-elevated)',
                border: `1px solid ${form.role === r.value ? 'var(--teal)' : 'var(--border)'}`,
                color: form.role === r.value ? 'white' : 'var(--text-muted)',
              }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Terms */}
      <div className="flex items-start gap-3 mt-5">
        <div
          onClick={() => setAgreed(!agreed)}
          className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-colors"
          style={{
            background: agreed ? 'var(--teal)' : 'transparent',
            border: `1px solid ${agreed ? 'var(--teal)' : 'var(--border)'}`,
          }}>
          {agreed && <span className="text-white text-xs">✓</span>}
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          I agree to the{' '}
          <span style={{ color: 'var(--teal)', textDecoration: 'underline', cursor: 'pointer' }}>
          <span onClick={() => navigate(`/privacy`)} style={{ color: `var(--teal)`, textDecoration: `underline`, cursor: `pointer` }}>Privacy Policy</span>
          </span>
          {' '}and{' '}
          <span style={{ color: 'var(--teal)', textDecoration: 'underline', cursor: 'pointer' }}>
          <span onClick={() => navigate(`/terms`)} style={{ color: `var(--teal)`, textDecoration: `underline`, cursor: `pointer` }}>Terms of Service</span>
          </span>
        </p>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full mt-6 py-4 rounded-xl font-semibold text-white transition-opacity disabled:opacity-50"
        style={{ background: 'var(--teal)' }}>
        {loading ? 'Creating account...' : 'Create Account'}
      </button>

      <button onClick={() => navigate('/login')}
        className="w-full mt-3 py-3 text-sm"
        style={{ color: 'var(--teal)' }}>
        Already have an account? Sign In
      </button>
    </div>
  )
}
