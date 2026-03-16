import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfService() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-6 py-8 pb-24">
      <button onClick={() => navigate(-1)}
        className="w-9 h-9 rounded-full flex items-center justify-center mb-6 hover:bg-white/10 transition-colors"
        style={{ border: '1px solid var(--border)' }}>
        <ArrowLeft size={18} style={{ color: 'var(--text-muted)' }} />
      </button>

      <h1 className="text-3xl font-light mb-2" style={{ color: 'var(--text)', fontFamily: 'Playfair Display' }}>
        Terms of Service
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Last updated: March 2026</p>

      {[
        {
          title: '1. Acceptance of Terms',
          body: 'By creating an account or using Staff Arts, you agree to these Terms of Service. If you do not agree, please do not use the platform.',
        },
        {
          title: '2. Your Account',
          body: 'You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information when registering and keep your details up to date.',
        },
        {
          title: '3. Content You Upload',
          body: 'You retain ownership of the artwork and content you upload. By uploading content, you grant Staff Arts a licence to display and promote it on the platform. You must not upload content that infringes third-party rights.',
        },
        {
          title: '4. Prohibited Conduct',
          body: 'You may not use Staff Arts to upload illegal content, harass other users, misrepresent your identity, or engage in fraudulent transactions. Violations may result in account suspension or termination.',
        },
        {
          title: '5. Transactions',
          body: 'Staff Arts facilitates connections between artists and collectors. We are not a party to any transaction between users. Disputes between buyers and sellers must be resolved between the parties involved.',
        },
        {
          title: '6. Limitation of Liability',
          body: 'Staff Arts is provided on an "as is" basis. We make no warranties about the availability or accuracy of the platform. To the extent permitted by law, we are not liable for any indirect or consequential damages.',
        },
        {
          title: '7. Changes to Terms',
          body: 'We may update these terms from time to time. We will notify you of significant changes via email or in-app notification. Continued use of the platform after changes constitutes acceptance.',
        },
        {
          title: '8. Contact',
          body: 'For questions about these Terms, please contact us at legal@staffarts.com.',
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
