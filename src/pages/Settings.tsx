import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock, Trash2, Bell, Shield, FileText, Info } from 'lucide-react'
import api from '../services/api'

const roles = [
  { label: 'Artist', value: 'artist' },
  { label: 'Collector', value: 'collector' },
  { label: 'Gallery', value: 'gallery' },
]

export default function Settings() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [savingRole, setSavingRole] = useState(false)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [showPasswordSheet, setShowPasswordSheet] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showRoleConfirm, setShowRoleConfirm] = useState<string | null>(null)
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' })
  const [passwordError, setPasswordError] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    api.get('/mobile/auth/me')
      .then(r => setUser(r.data?.data?.user || r.data?.data || r.data?.user || r.data))
      .catch(() => navigate('/login'))
  }, [])

  const handleChangeRole = async (newRole: string) => {
    if (!user || newRole === user.role) return
    setSavingRole(true)
    try {
      const userId = user._id || user.id
      await api.patch(`/users/${userId}`, { role: newRole })
      setUser((u: any) => ({ ...u, role: newRole }))
    } catch (e) {
      console.error('Failed to update role', e)
    } finally {
      setSavingRole(false)
      setShowRoleConfirm(null)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordForm.current || !passwordForm.newPass) { setPasswordError('All fields required'); return }
    if (passwordForm.newPass.length < 8) { setPasswordError('Min 8 characters'); return }
    if (passwordForm.newPass !== passwordForm.confirm) { setPasswordError('Passwords do not match'); return }
    setSavingPassword(true)
    setPasswordError('')
    try {
      const userId = user._id || user.id
      await api.patch(`/users/${userId}`, {
        currentPassword: passwordForm.current,
        newPassword: passwordForm.newPass,
      })
      setShowPasswordSheet(false)
      setPasswordForm({ current: '', newPass: '', confirm: '' })
    } catch (e: any) {
      setPasswordError(e.response?.data?.error || 'Failed to update password')
    } finally {
      setSavingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      const userId = user._id || user.id
      await api.delete(`/users/${userId}`)
      localStorage.removeItem('token')
      navigate('/login')
    } catch (e) {
      console.error('Failed to delete account', e)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const inputStyle = {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
  }

  const SectionHeader = ({ label }: { label: string }) => (
    <p className="px-4 pt-6 pb-2 text-xs font-semibold uppercase tracking-widest"
      style={{ color: 'var(--text-muted)' }}>{label}</p>
  )

  const SettingsGroup = ({ children }: { children: React.ReactNode }) => (
    <div className="mx-4 rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
      {children}
    </div>
  )

  const MenuItem = ({ icon: Icon, label, color, trailing, onClick, showChevron = true }: any) => (
    <div onClick={onClick}
      className={`flex items-center gap-4 px-5 py-4 ${onClick ? 'cursor-pointer hover:bg-white/5' : ''} transition-colors`}>
      <Icon size={20} style={{ color: color || 'var(--text-muted)' }} />
      <span className="flex-1 text-sm" style={{ color: color || 'var(--text)' }}>{label}</span>
      {trailing || (showChevron && onClick && <span style={{ color: 'var(--text-muted)' }}>›</span>)}
    </div>
  )

  const Divider = () => (
    <div style={{ height: '1px', background: 'var(--border)', marginLeft: '56px' }} />
  )

  return (
    <div className="min-h-screen max-w-2xl mx-auto pb-24">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
          style={{ border: '1px solid var(--border)' }}>
          <ArrowLeft size={18} style={{ color: 'var(--text-muted)' }} />
        </button>
        <h1 className="text-lg font-light" style={{ color: 'var(--text)' }}>Settings</h1>
      </div>

      {/* Account */}
      <SectionHeader label="Account" />
      <SettingsGroup>
        <MenuItem icon={Lock} label="Change Password" onClick={() => setShowPasswordSheet(true)} />
        <Divider />
        <MenuItem icon={Trash2} label="Delete Account" color="#ef4444" onClick={() => setShowDeleteConfirm(true)} />
      </SettingsGroup>

      {/* Role */}
      <SectionHeader label="I am a..." />
      <div className="px-4">
        {savingRole ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--teal)' }} />
          </div>
        ) : (
          <div className="flex gap-2">
            {roles.map(r => (
              <button key={r.value}
                onClick={() => user?.role !== r.value && setShowRoleConfirm(r.value)}
                className="flex-1 py-2.5 rounded-full text-sm font-medium transition-all"
                style={{
                  background: user?.role === r.value ? 'var(--teal)' : 'var(--bg-elevated)',
                  border: `1px solid ${user?.role === r.value ? 'var(--teal)' : 'var(--border)'}`,
                  color: user?.role === r.value ? 'white' : 'var(--text-muted)',
                }}>
                {r.label}
              </button>
            ))}
          </div>
        )}
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          Changing your role updates how others see your profile.
        </p>
      </div>

      {/* Notifications */}
      <SectionHeader label="Notifications" />
      <SettingsGroup>
        <div className="flex items-center gap-4 px-5 py-4">
          <Bell size={20} style={{ color: 'var(--text-muted)' }} />
          <span className="flex-1 text-sm" style={{ color: 'var(--text)' }}>Push Notifications</span>
          <div onClick={() => setPushNotifications(!pushNotifications)}
            className="relative w-11 h-6 rounded-full cursor-pointer transition-colors"
            style={{ background: pushNotifications ? 'var(--teal)' : 'var(--border)' }}>
            <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
              style={{ transform: pushNotifications ? 'translateX(20px)' : 'translateX(2px)' }} />
          </div>
        </div>
      </SettingsGroup>

      {/* About */}
      <SectionHeader label="About" />
      <SettingsGroup>
        <MenuItem icon={Info} label="App Version"
          showChevron={false}
          trailing={<span className="text-sm" style={{ color: 'var(--text-muted)' }}>1.0.0</span>} />
        <Divider />
        <MenuItem icon={Shield} label="Privacy Policy" onClick={() => navigate('/privacy')} />
        <Divider />
        <MenuItem icon={FileText} label="Terms of Service" onClick={() => navigate('/terms')} />
      </SettingsGroup>

      {/* Sign Out */}
      <div className="px-4 mt-6">
        <button onClick={handleLogout} className="w-full py-3 text-sm font-medium" style={{ color: '#ef4444' }}>
          Sign Out
        </button>
      </div>

      {/* Change Password Modal */}
      {showPasswordSheet && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setShowPasswordSheet(false)}>
          <div className="w-full max-w-2xl mx-auto rounded-t-3xl p-6 pb-10"
            style={{ background: 'var(--bg-elevated)' }}
            onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-medium mb-5" style={{ color: 'var(--text)' }}>Change Password</h2>
            {passwordError && (
              <div className="mb-3 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(255,100,100,0.1)', color: '#ff6b6b' }}>
                {passwordError}
              </div>
            )}
            <div className="space-y-3">
              {[
                { key: 'current', placeholder: 'Current password' },
                { key: 'newPass', placeholder: 'New password' },
                { key: 'confirm', placeholder: 'Confirm new password' },
              ].map(({ key, placeholder }) => (
                <input key={key} type="password" placeholder={placeholder}
                  value={passwordForm[key as keyof typeof passwordForm]}
                  onChange={e => setPasswordForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={inputStyle} />
              ))}
            </div>
            <button onClick={handleChangePassword} disabled={savingPassword}
              className="w-full mt-5 py-4 rounded-xl font-semibold text-white disabled:opacity-50"
              style={{ background: 'var(--teal)' }}>
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      )}

      {/* Delete Account Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: 'var(--bg-elevated)' }}>
            <h2 className="text-lg font-medium mb-2" style={{ color: 'var(--text)' }}>Delete Account</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              This will permanently delete your account and all your data. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-xl text-sm font-medium"
                style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                Cancel
              </button>
              <button onClick={handleDeleteAccount}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: '#ef4444' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Confirm */}
      {showRoleConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: 'var(--bg-elevated)' }}>
            <h2 className="text-lg font-medium mb-2" style={{ color: 'var(--text)' }}>Change Role</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              Switch your role to {showRoleConfirm[0].toUpperCase() + showRoleConfirm.slice(1)}?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowRoleConfirm(null)}
                className="flex-1 py-3 rounded-xl text-sm font-medium"
                style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                Cancel
              </button>
              <button onClick={() => handleChangeRole(showRoleConfirm)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold"
                style={{ color: 'var(--teal)', border: '1px solid var(--teal)' }}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
