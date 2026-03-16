import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-6 py-8 pb-24">
      <button onClick={() => navigate(-1)}
        className="w-9 h-9 rounded-full flex items-center justify-center mb-6 hover:bg-white/10 transition-colors"
        style={{ border: '1px solid var(--border)' }}>
        <ArrowLeft size={18} style={{ color: 'var(--text-muted)' }} />
      </button>

      <h1 className="text-3xl font-light mb-2" style={{ color: 'var(--text)', fontFamily: 'Playfair Display' }}>
        Privacy Policy
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Last updated: March 2026</p>

      {[
        {
          title: '1. Information We Collect',
          body: 'We collect information you provide when creating an account, such as your name, email address, and profile details. We also collect content you upload, including artwork images and descriptions.',
        },
        {
          title: '2. How We Use Your Information',
          body: 'We use your information to operate and improve Staff Arts, to communicate with you, to process transactions, and to personalise your experience on the platform.',
        },
        {
          title: '3. Sharing Your Information',
          body: 'We do not sell your personal information. Your public profile, artworks, and activity may be visible to other users. We may share information with service providers who help us operate the platform.',
        },
        {
          title: '4. Data Storage',
          body: 'Your data is stored securely on our servers. Uploaded images are stored via Cloudinary. We retain your data for as long as your account is active or as needed to provide services.',
        },
        {
          title: '5. Your Rights',
          body: 'You have the right to access, correct, or delete your personal data at any time. You can update your profile information in the app settings or contact us to request account deletion.',
        },
        {
          title: '6. Cookies',
          body: 'We use authentication tokens to keep you signed in. We do not use third-party tracking cookies or advertising cookies.',
        },
        {
          title: '7. Contact',
          body: 'If you have any questions about this Privacy Policy, please contact us at privacy@staffarts.com.',
        },
      ].map(section => (
        <div key={section.title} className="mb-6">
          <h2 className="font-semibold text-sm mb-2" style={{ color: 'var(--text)' }}>{section.title}</h2>
          <p className="text-sm leading-relaxed font-light" style={{ color: 'var(--text-muted)' }}>{section.body}</p>
        </div>
      ))}
    </div>
  )
}
