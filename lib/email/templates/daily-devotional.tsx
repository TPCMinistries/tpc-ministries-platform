import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components'

interface DailyDevotionalEmailProps {
  recipientName?: string
  devotionalTitle: string
  scripture: string
  scriptureText: string
  reflection: string
  prayer?: string
  author?: string
  date?: string
  readMoreUrl?: string
  unsubscribeUrl?: string
}

export default function DailyDevotionalEmail({
  recipientName = 'Friend',
  devotionalTitle,
  scripture,
  scriptureText,
  reflection,
  prayer,
  author = 'TPC Ministries',
  date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
  readMoreUrl = 'https://tpcmin.org/devotional',
  unsubscribeUrl = 'https://tpcmin.org/unsubscribe',
}: DailyDevotionalEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{devotionalTitle} - Your Daily Word from TPC Ministries</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerDate}>{date}</Text>
            <Text style={headerSubtext}>DAILY DEVOTIONAL</Text>
            <Heading style={headerTitle}>TPC Ministries</Heading>
          </Section>

          {/* Scripture Card */}
          <Section style={scriptureCard}>
            <Text style={scriptureReference}>{scripture}</Text>
            <Text style={scriptureTextStyle}>"{scriptureText}"</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={greeting}>Good Morning, {recipientName}</Text>

            <Heading style={title}>{devotionalTitle}</Heading>

            <div
              style={reflectionText}
              dangerouslySetInnerHTML={{ __html: reflection.replace(/\n/g, '<br />') }}
            />

            {prayer && (
              <>
                <Hr style={divider} />
                <Section style={prayerSection}>
                  <Heading style={prayerTitle}>Today's Prayer</Heading>
                  <Text style={prayerText}>
                    <em>{prayer}</em>
                  </Text>
                </Section>
              </>
            )}

            {/* Call to Action */}
            <Section style={ctaSection}>
              <Link href={readMoreUrl} style={ctaButton}>
                Read Full Devotional
              </Link>
            </Section>

            <Text style={authorText}>
              With love in Christ,<br />
              <strong>{author}</strong>
            </Text>
          </Section>

          {/* Quick Actions */}
          <Section style={actionsSection}>
            <table style={actionsTable}>
              <tr>
                <td style={actionItem}>
                  <Link href="https://tpcmin.org/prayer" style={actionLink}>
                    Submit Prayer Request
                  </Link>
                </td>
                <td style={actionItem}>
                  <Link href="https://tpcmin.org/teachings" style={actionLink}>
                    Browse Teachings
                  </Link>
                </td>
                <td style={actionItem}>
                  <Link href="https://tpcmin.org/giving" style={actionLink}>
                    Support Ministry
                  </Link>
                </td>
              </tr>
            </table>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <strong>TPC Ministries</strong><br />
              Awakening Purpose. Igniting Vision.
            </Text>
            <Text style={footerLinks}>
              <Link href="https://tpcmin.org" style={footerLink}>Website</Link>
              {' | '}
              <Link href="https://tpcmin.org/contact" style={footerLink}>Contact</Link>
              {' | '}
              <Link href={unsubscribeUrl} style={footerLink}>Unsubscribe</Link>
            </Text>
            <Text style={footerDisclaimer}>
              You're receiving this because you subscribed to Daily Devotionals.
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
  padding: '30px 20px',
  textAlign: 'center' as const,
}

const headerDate = {
  color: '#ffffff',
  fontSize: '12px',
  margin: '0 0 8px',
  opacity: 0.8,
}

const headerSubtext = {
  color: '#c9a961',
  fontSize: '11px',
  fontWeight: 'bold',
  letterSpacing: '3px',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
}

const headerTitle = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
}

const scriptureCard = {
  backgroundColor: '#faf8f5',
  borderLeft: '4px solid #c9a961',
  margin: '0',
  padding: '24px 30px',
}

const scriptureReference = {
  color: '#c9a961',
  fontSize: '12px',
  fontWeight: 'bold',
  letterSpacing: '1px',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
}

const scriptureTextStyle = {
  color: '#1e3a8a',
  fontSize: '18px',
  fontStyle: 'italic',
  lineHeight: '1.6',
  margin: '0',
}

const content = {
  padding: '30px',
}

const greeting = {
  color: '#666666',
  fontSize: '15px',
  margin: '0 0 20px',
}

const title = {
  color: '#1e3a8a',
  fontSize: '24px',
  fontWeight: 'bold',
  lineHeight: '1.3',
  margin: '0 0 20px',
}

const reflectionText = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '1.7',
  margin: '0 0 24px',
}

const divider = {
  borderColor: '#e5e7eb',
  borderTop: '1px solid #e5e7eb',
  margin: '24px 0',
}

const prayerSection = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
}

const prayerTitle = {
  color: '#1e3a8a',
  fontSize: '14px',
  fontWeight: 'bold',
  letterSpacing: '1px',
  margin: '0 0 12px',
  textTransform: 'uppercase' as const,
}

const prayerText = {
  color: '#4b5563',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0',
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '24px 0',
}

const ctaButton = {
  backgroundColor: '#c9a961',
  color: '#1e3a8a',
  fontSize: '14px',
  fontWeight: 'bold',
  padding: '12px 28px',
  textDecoration: 'none',
  borderRadius: '6px',
  display: 'inline-block',
}

const authorText = {
  color: '#666666',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '24px 0 0',
}

const actionsSection = {
  backgroundColor: '#f8f9fa',
  padding: '20px',
}

const actionsTable = {
  width: '100%',
}

const actionItem = {
  textAlign: 'center' as const,
  padding: '8px',
}

const actionLink = {
  color: '#1e3a8a',
  fontSize: '13px',
  textDecoration: 'none',
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
  margin: '0 0 12px',
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

// Export render function for use with Resend
export function renderDailyDevotional(props: DailyDevotionalEmailProps): string {
  // This would use react-email's render function
  // For now, return the component for use with Resend's react option
  return ''
}
