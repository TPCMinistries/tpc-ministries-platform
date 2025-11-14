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
} from '@react-email/components'

interface UrgentEmailProps {
  recipientName?: string
  title: string
  message: string
  actionText?: string
  actionUrl?: string
  urgencyLevel?: 'high' | 'medium' | 'low'
}

export default function UrgentEmail({
  recipientName = 'Friend',
  title,
  message,
  actionText,
  actionUrl,
  urgencyLevel = 'high',
}: UrgentEmailProps) {
  const urgencyColors = {
    high: { bg: '#dc2626', border: '#991b1b', badge: '#fef2f2' },
    medium: { bg: '#ea580c', border: '#c2410c', badge: '#fff7ed' },
    low: { bg: '#eab308', border: '#a16207', badge: '#fefce8' },
  }

  const colors = urgencyColors[urgencyLevel]

  return (
    <Html>
      <Head />
      <Preview>URGENT: {title}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Urgent Header */}
          <Section style={{ ...header, backgroundColor: colors.bg }}>
            <div style={{ ...urgentBadge, backgroundColor: colors.badge }}>
              <span style={{ color: colors.bg }}>⚠️ URGENT MESSAGE</span>
            </div>
            <Heading style={headerTitle}>TPC Ministries</Heading>
          </Section>

          {/* Alert Strip */}
          <Section style={{ ...alertStrip, backgroundColor: colors.border }}>
            <Text style={alertText}>
              {urgencyLevel === 'high' && '🔴 IMMEDIATE ATTENTION REQUIRED'}
              {urgencyLevel === 'medium' && '🟠 ACTION NEEDED'}
              {urgencyLevel === 'low' && '🟡 IMPORTANT NOTICE'}
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>{title}</Heading>

            {recipientName && (
              <Text style={greeting}>Dear {recipientName},</Text>
            )}

            <div style={{ ...messageBox, borderLeftColor: colors.bg }}>
              <div
                style={messageContent}
                dangerouslySetInnerHTML={{ __html: message.replace(/\n/g, '<br />') }}
              />
            </div>

            {/* Action Button */}
            {actionText && actionUrl && (
              <Section style={buttonSection}>
                <Link href={actionUrl} style={{ ...actionButton, backgroundColor: colors.bg }}>
                  {actionText}
                </Link>
              </Section>
            )}

            <Section style={timeStampSection}>
              <Text style={timeStamp}>
                Sent: {new Date().toLocaleString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  timeZoneName: 'short',
                })}
              </Text>
            </Section>

            <Text style={footerNote}>
              If you have any questions or concerns regarding this message, please contact us immediately.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <strong>TPC Ministries</strong>
              <br />
              Emergency Contact: info@tpcmin.com
            </Text>
            <Text style={footerLinks}>
              <Link href="https://tpcmin.org" style={footerLink}>
                Website
              </Link>
              {' | '}
              <Link href="https://tpcmin.org/contact" style={footerLink}>
                Contact Us
              </Link>
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
  padding: '40px 30px',
  textAlign: 'center' as const,
}

const urgentBadge = {
  display: 'inline-block',
  padding: '8px 20px',
  borderRadius: '20px',
  marginBottom: '16px',
  fontSize: '12px',
  fontWeight: 'bold',
  letterSpacing: '1px',
}

const headerTitle = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
}

const alertStrip = {
  padding: '12px 20px',
  textAlign: 'center' as const,
}

const alertText = {
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: 'bold',
  letterSpacing: '1px',
  margin: '0',
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

const messageBox = {
  backgroundColor: '#fef2f2',
  border: '2px solid #fee2e2',
  borderLeft: '6px solid',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
}

const messageContent = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const actionButton = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '16px 40px',
  textDecoration: 'none',
  borderRadius: '6px',
  display: 'inline-block',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
}

const timeStampSection = {
  borderTop: '1px solid #e5e7eb',
  borderBottom: '1px solid #e5e7eb',
  padding: '16px 0',
  margin: '24px 0',
}

const timeStamp = {
  color: '#6b7280',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '0',
  fontFamily: 'monospace',
}

const footerNote = {
  color: '#6b7280',
  fontSize: '13px',
  lineHeight: '1.6',
  textAlign: 'center' as const,
  fontStyle: 'italic',
  margin: '0',
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
  margin: '0',
}

const footerLink = {
  color: '#c9a961',
  textDecoration: 'underline',
}
