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

interface AnnouncementEmailProps {
  recipientName?: string
  title: string
  message: string
  ctaText?: string
  ctaUrl?: string
  imageUrl?: string
}

export default function AnnouncementEmail({
  recipientName = 'Friend',
  title,
  message,
  ctaText,
  ctaUrl,
  imageUrl,
}: AnnouncementEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <div style={logoCircle}>
              <div style={logoContent}>
                <div style={crossIcon}>✝</div>
                <div style={logoText}>TPC</div>
                <div style={logoSubtext}>Ministries</div>
              </div>
            </div>
          </Section>

          {/* Hero Image (if provided) */}
          {imageUrl && (
            <Section style={imageSection}>
              <Img src={imageUrl} alt={title} style={heroImage} />
            </Section>
          )}

          {/* Main Content */}
          <Section style={content}>
            <div style={announcementBadge}>📢 ANNOUNCEMENT</div>

            <Heading style={h1}>{title}</Heading>

            {recipientName && (
              <Text style={greeting}>Dear {recipientName},</Text>
            )}

            <div
              style={messageContent}
              dangerouslySetInnerHTML={{ __html: message.replace(/\n/g, '<br />') }}
            />

            {/* Call to Action */}
            {ctaText && ctaUrl && (
              <Section style={buttonSection}>
                <Link href={ctaUrl} style={button}>
                  {ctaText}
                </Link>
              </Section>
            )}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <strong>TPC Ministries</strong>
              <br />
              Awakening Purpose. Igniting Vision.
            </Text>
            <Text style={footerLinks}>
              <Link href="https://tpcmin.org" style={footerLink}>
                Visit Website
              </Link>
              {' | '}
              <Link href="https://tpcmin.org/giving" style={footerLink}>
                Give
              </Link>
              {' | '}
              <Link href="https://tpcmin.org/contact" style={footerLink}>
                Contact Us
              </Link>
            </Text>
            <Text style={footerDisclaimer}>
              You're receiving this email because you're a valued member of TPC Ministries.
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
  backgroundColor: '#1e3a8a',
  padding: '40px 20px',
  textAlign: 'center' as const,
}

const logoCircle = {
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  border: '3px solid #c9a961',
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const logoContent = {
  textAlign: 'center' as const,
}

const crossIcon = {
  fontSize: '32px',
  color: '#c9a961',
  marginBottom: '4px',
}

const logoText = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#c9a961',
  letterSpacing: '2px',
}

const logoSubtext = {
  fontSize: '12px',
  color: '#c9a961',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
}

const imageSection = {
  padding: '0',
}

const heroImage = {
  width: '100%',
  height: 'auto',
  display: 'block',
}

const content = {
  padding: '40px 30px',
}

const announcementBadge = {
  display: 'inline-block',
  backgroundColor: '#c9a961',
  color: '#ffffff',
  fontSize: '11px',
  fontWeight: 'bold',
  letterSpacing: '1px',
  padding: '6px 16px',
  borderRadius: '20px',
  marginBottom: '20px',
}

const h1 = {
  color: '#1e3a8a',
  fontSize: '32px',
  fontWeight: 'bold',
  lineHeight: '1.3',
  margin: '0 0 24px',
}

const greeting = {
  color: '#333333',
  fontSize: '18px',
  margin: '0 0 20px',
}

const messageContent = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 30px',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '40px 0',
}

const button = {
  backgroundColor: '#c9a961',
  color: '#1e3a8a',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '14px 32px',
  textDecoration: 'none',
  borderRadius: '6px',
  display: 'inline-block',
  boxShadow: '0 4px 12px rgba(201, 169, 97, 0.3)',
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
