import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface NewsletterEmailProps {
  recipientName?: string
  headline: string
  message: string
  sections?: Array<{
    title: string
    content: string
    linkText?: string
    linkUrl?: string
  }>
}

export default function NewsletterEmail({
  recipientName = 'Friend',
  headline,
  message,
  sections = [],
}: NewsletterEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{headline}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerSubtext}>TPC MINISTRIES NEWSLETTER</Text>
            <Heading style={headerTitle}>Awakening Purpose. Igniting Vision.</Heading>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>{headline}</Heading>

            <Text style={greeting}>Dear {recipientName},</Text>

            <div
              style={messageContent}
              dangerouslySetInnerHTML={{ __html: message.replace(/\n/g, '<br />') }}
            />

            {/* Newsletter Sections */}
            {sections.map((section, index) => (
              <Section key={index} style={sectionCard}>
                <div style={sectionNumber}>{String(index + 1).padStart(2, '0')}</div>
                <Heading style={sectionTitle}>{section.title}</Heading>
                <Text style={sectionContent}>{section.content}</Text>
                {section.linkText && section.linkUrl && (
                  <Link href={section.linkUrl} style={sectionLink}>
                    {section.linkText} →
                  </Link>
                )}
              </Section>
            ))}

            {/* Divider */}
            <div style={divider} />

            {/* Quick Links */}
            <Section style={quickLinksSection}>
              <Heading style={quickLinksTitle}>Quick Links</Heading>
              <table style={quickLinksTable}>
                <tr>
                  <td style={quickLinkItem}>
                    <Link href="https://tpcmin.org/devotional" style={quickLink}>
                      📖 Daily Devotional
                    </Link>
                  </td>
                  <td style={quickLinkItem}>
                    <Link href="https://tpcmin.org/teachings" style={quickLink}>
                      🎓 Teachings
                    </Link>
                  </td>
                </tr>
                <tr>
                  <td style={quickLinkItem}>
                    <Link href="https://tpcmin.org/prayer" style={quickLink}>
                      🙏 Prayer Requests
                    </Link>
                  </td>
                  <td style={quickLinkItem}>
                    <Link href="https://tpcmin.org/giving" style={quickLink}>
                      💝 Give
                    </Link>
                  </td>
                </tr>
              </table>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <strong>TPC Ministries</strong>
              <br />
              Touching People for Christ
            </Text>
            <Text style={footerLinks}>
              <Link href="https://tpcmin.org" style={footerLink}>
                Website
              </Link>
              {' | '}
              <Link href="https://tpcmin.org/missions" style={footerLink}>
                Missions
              </Link>
              {' | '}
              <Link href="https://tpcmin.org/contact" style={footerLink}>
                Contact
              </Link>
            </Text>
            <Text style={footerDisclaimer}>
              Stay connected with TPC Ministries for updates, teachings, and inspiration.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f5f5f5',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
}

const header = {
  background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
  padding: '40px 30px',
  textAlign: 'center' as const,
}

const headerSubtext = {
  color: '#c9a961',
  fontSize: '11px',
  fontWeight: 'bold',
  letterSpacing: '2px',
  margin: '0 0 12px',
  textTransform: 'uppercase' as const,
}

const headerTitle = {
  color: '#ffffff',
  fontSize: '20px',
  fontWeight: 'normal',
  margin: '0',
  fontStyle: 'italic',
}

const content = {
  padding: '40px 30px',
}

const h1 = {
  color: '#1e3a8a',
  fontSize: '28px',
  fontWeight: 'bold',
  lineHeight: '1.3',
  margin: '0 0 24px',
}

const greeting = {
  color: '#333333',
  fontSize: '16px',
  margin: '0 0 20px',
}

const messageContent = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 32px',
}

const sectionCard = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e5e7eb',
  borderLeft: '4px solid #c9a961',
  borderRadius: '8px',
  padding: '24px',
  marginBottom: '20px',
}

const sectionNumber = {
  color: '#c9a961',
  fontSize: '12px',
  fontWeight: 'bold',
  marginBottom: '8px',
}

const sectionTitle = {
  color: '#1e3a8a',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 12px',
}

const sectionContent = {
  color: '#4b5563',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 16px',
}

const sectionLink = {
  color: '#c9a961',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
}

const divider = {
  borderTop: '2px solid #e5e7eb',
  margin: '32px 0',
}

const quickLinksSection = {
  marginTop: '32px',
}

const quickLinksTitle = {
  color: '#1e3a8a',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px',
}

const quickLinksTable = {
  width: '100%',
}

const quickLinkItem = {
  padding: '8px',
}

const quickLink = {
  color: '#4b5563',
  fontSize: '14px',
  textDecoration: 'none',
  display: 'block',
}

const footer = {
  backgroundColor: '#1e3a8a',
  padding: '30px 20px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#c9a961',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 12px',
}

const footerLinks = {
  color: '#ffffff',
  fontSize: '13px',
  margin: '0 0 16px',
}

const footerLink = {
  color: '#c9a961',
  textDecoration: 'underline',
}

const footerDisclaimer = {
  color: '#ffffff',
  fontSize: '11px',
  opacity: 0.7,
  lineHeight: '1.5',
  margin: '0',
}
