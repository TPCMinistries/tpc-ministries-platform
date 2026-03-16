import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | TPC Ministries',
  description: 'Privacy Policy for TPC Ministries - how we collect, use, and protect your information.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-navy-950">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy to-navy-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,184,131,0.12),transparent_60%)]" />
        <div className="container relative mx-auto max-w-5xl px-4 py-32 text-center">
          <p className="mb-4 text-body-sm font-semibold uppercase tracking-[0.2em] text-gold">Legal</p>
          <h1 className="mb-6 font-display text-display-xl md:text-display-2xl text-white">
            Privacy Policy
          </h1>
          <p className="mx-auto max-w-2xl text-body-xl text-white/50">
            Last updated: February 8, 2026
          </p>
          <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      <section className="bg-background px-4 py-section">
        <div className="container mx-auto max-w-4xl prose prose-lg prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-gold prose-a:no-underline hover:prose-a:underline">
          <h2>Introduction</h2>
          <p>
            TPC Ministries (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting your privacy. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your information when you visit our website
            tpcmin.org and use our services.
          </p>
          <p>
            TPC Ministries is a 501(c)(3) nonprofit organization. We take your privacy seriously and are
            committed to being transparent about our data practices.
          </p>

          <h2>Information We Collect</h2>

          <h3>Information You Provide</h3>
          <p>We may collect information that you voluntarily provide, including:</p>
          <ul>
            <li><strong>Account Information:</strong> Name, email address, phone number, and password when you create an account</li>
            <li><strong>Profile Information:</strong> Address, city, state, country, biography, and profile photo</li>
            <li><strong>Donation Information:</strong> Payment details processed securely through Stripe (we do not store credit card numbers)</li>
            <li><strong>Communication Data:</strong> Prayer requests, contact form submissions, messages, and journal entries</li>
            <li><strong>Assessment Responses:</strong> Answers to spiritual assessments (may be submitted anonymously)</li>
            <li><strong>Event Registrations:</strong> Information provided when registering for events or mission trips</li>
          </ul>

          <h3>Information Collected Automatically</h3>
          <p>When you access our website, we may automatically collect:</p>
          <ul>
            <li>Browser type and version</li>
            <li>Device information</li>
            <li>IP address</li>
            <li>Pages visited and time spent</li>
            <li>Referring website</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide and maintain our services</li>
            <li>Process donations and issue tax receipts</li>
            <li>Send ministry communications, newsletters, and updates</li>
            <li>Facilitate community features (groups, prayer, messaging)</li>
            <li>Provide personalized spiritual assessments and recommendations</li>
            <li>Coordinate events and mission trips</li>
            <li>Improve our website and services</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>Information Sharing</h2>
          <p>We do not sell, trade, or rent your personal information. We may share information with:</p>
          <ul>
            <li><strong>Service Providers:</strong> Trusted third parties that help us operate our website (Stripe for payments, Resend for email, Vercel for hosting, Supabase for data storage)</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            <li><strong>Ministry Partners:</strong> With your consent, for mission trip coordination or ministry collaboration</li>
          </ul>

          <h2>Data Security</h2>
          <p>
            We implement appropriate security measures to protect your information, including:
          </p>
          <ul>
            <li>SSL/TLS encryption for all data transmission</li>
            <li>Row-Level Security (RLS) on our database</li>
            <li>Secure authentication with encrypted passwords</li>
            <li>Regular security audits</li>
            <li>Limited access to personal data by authorized personnel only</li>
          </ul>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access</strong> the personal information we hold about you</li>
            <li><strong>Correct</strong> inaccurate information</li>
            <li><strong>Delete</strong> your account and associated data</li>
            <li><strong>Opt out</strong> of marketing communications</li>
            <li><strong>Export</strong> your data</li>
          </ul>
          <p>
            To exercise these rights, contact us at{' '}
            <a href="mailto:info@tpcmin.org">
              info@tpcmin.org
            </a>.
          </p>

          <h2>Cookies</h2>
          <p>
            We use essential cookies to maintain your session and preferences. We also use analytics
            to understand how visitors use our site. You can control cookie settings through your
            browser preferences.
          </p>

          <h2>Children&apos;s Privacy</h2>
          <p>
            Our services are not directed to children under 13. We do not knowingly collect personal
            information from children under 13. If you believe we have collected such information,
            please contact us immediately.
          </p>

          <h2>Donation Privacy</h2>
          <p>
            As a 501(c)(3) organization, we are committed to donor privacy. We will not share or sell
            donor information with outside parties. Donation records are kept confidential and used
            only for processing gifts, issuing tax receipts, and ministry communications you have
            opted into.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by
            posting the new policy on this page and updating the &ldquo;Last updated&rdquo; date.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us:
          </p>
          <ul>
            <li>Email: <a href="mailto:info@tpcmin.org">info@tpcmin.org</a></li>
            <li>Website: <a href="/connect">tpcmin.org/connect</a></li>
          </ul>
        </div>
      </section>
    </div>
  )
}
