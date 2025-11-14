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

interface EventInvitationEmailProps {
  recipientName?: string
  eventTitle: string
  eventDate: string
  eventTime: string
  eventLocation: string
  eventDescription: string
  rsvpUrl?: string
  imageUrl?: string
}

export default function EventInvitationEmail({
  recipientName = 'Friend',
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  eventDescription,
  rsvpUrl,
  imageUrl,
}: EventInvitationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You're invited: {eventTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <div style={invitationBadge}>✨ YOU'RE INVITED ✨</div>
            <Heading style={headerTitle}>TPC Ministries Event</Heading>
          </Section>

          {/* Event Image */}
          {imageUrl && (
            <Section style={imageSection}>
              <Img src={imageUrl} alt={eventTitle} style={eventImage} />
            </Section>
          )}

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>{eventTitle}</Heading>

            <Text style={greeting}>Dear {recipientName},</Text>

            <Text style={description}>{eventDescription}</Text>

            {/* Event Details Card */}
            <Section style={detailsCard}>
              <table style={detailsTable}>
                <tr>
                  <td style={iconCell}>
                    <div style={icon}>📅</div>
                  </td>
                  <td style={detailCell}>
                    <div style={detailLabel}>Date</div>
                    <div style={detailValue}>{eventDate}</div>
                  </td>
                </tr>
                <tr>
                  <td style={iconCell}>
                    <div style={icon}>🕐</div>
                  </td>
                  <td style={detailCell}>
                    <div style={detailLabel}>Time</div>
                    <div style={detailValue}>{eventTime}</div>
                  </td>
                </tr>
                <tr>
                  <td style={iconCell}>
                    <div style={icon}>📍</div>
                  </td>
                  <td style={detailCell}>
                    <div style={detailLabel}>Location</div>
                    <div style={detailValue}>{eventLocation}</div>
                  </td>
                </tr>
              </table>
            </Section>

            {/* RSVP Button */}
            {rsvpUrl && (
              <Section style={buttonSection}>
                <Link href={rsvpUrl} style={rsvpButton}>
                  RSVP Now
                </Link>
              </Section>
            )}

            <Text style={footerNote}>
              We can't wait to see you there! If you have any questions, please don't hesitate to reach out.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <strong>TPC Ministries</strong>
              <br />
              Awakening Purpose. Igniting Vision.
            </Text>
            <Text style={footerLinks}>
              <Link href="https://tpcmin.org/events" style={footerLink}>
                View All Events
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
  background: 'linear-gradient(135deg, #c9a961 0%, #d4b878 100%)',
  padding: '40px 30px',
  textAlign: 'center' as const,
}

const invitationBadge = {
  color: '#1e3a8a',
  fontSize: '14px',
  fontWeight: 'bold',
  letterSpacing: '2px',
  marginBottom: '12px',
}

const headerTitle = {
  color: '#1e3a8a',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
}

const imageSection = {
  padding: '0',
}

const eventImage = {
  width: '100%',
  height: 'auto',
  display: 'block',
}

const content = {
  padding: '40px 30px',
}

const h1 = {
  color: '#1e3a8a',
  fontSize: '32px',
  fontWeight: 'bold',
  lineHeight: '1.3',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const greeting = {
  color: '#333333',
  fontSize: '16px',
  margin: '0 0 20px',
}

const description = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 32px',
}

const detailsCard = {
  backgroundColor: '#f8f9fa',
  border: '2px solid #c9a961',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '32px',
}

const detailsTable = {
  width: '100%',
}

const iconCell = {
  width: '50px',
  verticalAlign: 'top',
  paddingBottom: '16px',
}

const icon = {
  fontSize: '24px',
}

const detailCell = {
  paddingBottom: '16px',
}

const detailLabel = {
  color: '#6b7280',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  marginBottom: '4px',
}

const detailValue = {
  color: '#1e3a8a',
  fontSize: '18px',
  fontWeight: 'bold',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const rsvpButton = {
  backgroundColor: '#c9a961',
  color: '#1e3a8a',
  fontSize: '18px',
  fontWeight: 'bold',
  padding: '16px 48px',
  textDecoration: 'none',
  borderRadius: '8px',
  display: 'inline-block',
  boxShadow: '0 4px 12px rgba(201, 169, 97, 0.4)',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
}

const footerNote = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.6',
  textAlign: 'center' as const,
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
