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

interface TeachingLetterEmailProps {
  recipientName?: string
  teachingTitle: string
  teachingDescription: string
  speaker?: string
  category?: string
  duration?: string
  keyPoints?: string[]
  scriptureReferences?: string[]
  thumbnailUrl?: string
  watchUrl?: string
  listenUrl?: string
  relatedTeachings?: Array<{
    title: string
    url: string
  }>
  unsubscribeUrl?: string
}

export default function TeachingLetterEmail({
  recipientName = 'Friend',
  teachingTitle,
  teachingDescription,
  speaker = 'Prophet Lorenzo',
  category = 'Teaching',
  duration,
  keyPoints = [],
  scriptureReferences = [],
  thumbnailUrl,
  watchUrl = 'https://tpcmin.org/teachings',
  listenUrl,
  relatedTeachings = [],
  unsubscribeUrl = 'https://tpcmin.org/unsubscribe',
}: TeachingLetterEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New Teaching: {teachingTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerLabel}>NEW {category.toUpperCase()}</Text>
            <Heading style={headerTitle}>TPC Ministries</Heading>
          </Section>

          {/* Teaching Card */}
          <Section style={teachingCard}>
            <Text style={categoryBadge}>{category}</Text>
            <Heading style={teachingTitleStyle}>{teachingTitle}</Heading>
            <Text style={teachingMeta}>
              by {speaker} {duration && `| ${duration}`}
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={greeting}>Dear {recipientName},</Text>

            <Text style={introText}>
              A new teaching has been released that we believe will bless and equip you in your walk with Christ.
            </Text>

            <Text style={description}>{teachingDescription}</Text>

            {/* Key Points */}
            {keyPoints.length > 0 && (
              <Section style={keyPointsSection}>
                <Heading style={keyPointsTitle}>Key Takeaways</Heading>
                <ul style={keyPointsList}>
                  {keyPoints.map((point, index) => (
                    <li key={index} style={keyPointItem}>{point}</li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Scripture References */}
            {scriptureReferences.length > 0 && (
              <Section style={scripturesSection}>
                <Text style={scripturesLabel}>Scriptures Referenced:</Text>
                <Text style={scripturesText}>
                  {scriptureReferences.join(' | ')}
                </Text>
              </Section>
            )}

            {/* Watch/Listen Buttons */}
            <Section style={ctaSection}>
              <table style={ctaTable}>
                <tr>
                  <td style={ctaCell}>
                    <Link href={watchUrl} style={watchButton}>
                      Watch Teaching
                    </Link>
                  </td>
                  {listenUrl && (
                    <td style={ctaCell}>
                      <Link href={listenUrl} style={listenButton}>
                        Listen Audio
                      </Link>
                    </td>
                  )}
                </tr>
              </table>
            </Section>

            <Hr style={divider} />

            {/* Related Teachings */}
            {relatedTeachings.length > 0 && (
              <Section style={relatedSection}>
                <Heading style={relatedTitle}>You Might Also Enjoy</Heading>
                {relatedTeachings.map((teaching, index) => (
                  <div key={index} style={relatedItem}>
                    <Link href={teaching.url} style={relatedLink}>
                      {teaching.title}
                    </Link>
                  </div>
                ))}
              </Section>
            )}

            {/* Explore More */}
            <Section style={exploreSection}>
              <Text style={exploreText}>
                Explore our full library of teachings, sermons, and prophetic insights.
              </Text>
              <Link href="https://tpcmin.org/teachings" style={exploreButton}>
                Browse All Teachings
              </Link>
            </Section>

            <Text style={closingText}>
              May this teaching bring revelation and transformation to your life. We're honored to partner with you on this journey of faith.
            </Text>

            <Text style={signature}>
              Growing Together in Christ,<br />
              <strong>TPC Ministries Team</strong>
            </Text>
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
              <Link href="https://tpcmin.org/teachings" style={footerLink}>Teachings</Link>
              {' | '}
              <Link href="https://tpcmin.org/giving" style={footerLink}>Support</Link>
            </Text>
            <Text style={footerUnsubscribe}>
              <Link href={unsubscribeUrl} style={footerLink}>Unsubscribe</Link> from teaching releases
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

const headerLabel = {
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

const teachingCard = {
  backgroundColor: '#1e3a8a',
  padding: '30px',
  textAlign: 'center' as const,
}

const categoryBadge = {
  backgroundColor: '#c9a961',
  color: '#1e3a8a',
  fontSize: '10px',
  fontWeight: 'bold',
  letterSpacing: '1px',
  padding: '4px 12px',
  borderRadius: '4px',
  display: 'inline-block',
  margin: '0 0 12px',
  textTransform: 'uppercase' as const,
}

const teachingTitleStyle = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  lineHeight: '1.3',
  margin: '0 0 12px',
}

const teachingMeta = {
  color: '#c9a961',
  fontSize: '14px',
  margin: '0',
}

const content = {
  padding: '30px',
}

const greeting = {
  color: '#333333',
  fontSize: '16px',
  margin: '0 0 16px',
}

const introText = {
  color: '#4b5563',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 20px',
}

const description = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '1.7',
  margin: '0 0 24px',
}

const keyPointsSection = {
  backgroundColor: '#f8f9fa',
  borderLeft: '4px solid #c9a961',
  padding: '20px',
  marginBottom: '24px',
}

const keyPointsTitle = {
  color: '#1e3a8a',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
}

const keyPointsList = {
  color: '#333333',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
  paddingLeft: '20px',
}

const keyPointItem = {
  marginBottom: '8px',
}

const scripturesSection = {
  backgroundColor: '#faf8f5',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
}

const scripturesLabel = {
  color: '#666666',
  fontSize: '12px',
  fontWeight: 'bold',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
}

const scripturesText = {
  color: '#1e3a8a',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0',
}

const ctaSection = {
  textAlign: 'center' as const,
  marginBottom: '24px',
}

const ctaTable = {
  margin: '0 auto',
}

const ctaCell = {
  padding: '0 8px',
}

const watchButton = {
  backgroundColor: '#c9a961',
  color: '#1e3a8a',
  fontSize: '14px',
  fontWeight: 'bold',
  padding: '14px 28px',
  textDecoration: 'none',
  borderRadius: '6px',
  display: 'inline-block',
}

const listenButton = {
  backgroundColor: '#1e3a8a',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  padding: '14px 28px',
  textDecoration: 'none',
  borderRadius: '6px',
  display: 'inline-block',
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const relatedSection = {
  marginBottom: '24px',
}

const relatedTitle = {
  color: '#1e3a8a',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
}

const relatedItem = {
  padding: '8px 0',
  borderBottom: '1px solid #e5e7eb',
}

const relatedLink = {
  color: '#1e3a8a',
  fontSize: '14px',
  textDecoration: 'none',
}

const exploreSection = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center' as const,
  marginBottom: '24px',
}

const exploreText = {
  color: '#4b5563',
  fontSize: '14px',
  margin: '0 0 16px',
}

const exploreButton = {
  backgroundColor: '#1e3a8a',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: 'bold',
  padding: '10px 20px',
  textDecoration: 'none',
  borderRadius: '6px',
  display: 'inline-block',
}

const closingText = {
  color: '#4b5563',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '24px 0',
}

const signature = {
  color: '#333333',
  fontSize: '15px',
  lineHeight: '1.6',
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
  margin: '0 0 12px',
}

const footerLink = {
  color: '#c9a961',
  textDecoration: 'underline',
}

const footerUnsubscribe = {
  color: '#ffffff',
  fontSize: '11px',
  opacity: 0.7,
  margin: '0',
}
