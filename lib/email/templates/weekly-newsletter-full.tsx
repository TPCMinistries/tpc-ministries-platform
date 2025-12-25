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
  Img,
} from '@react-email/components'

interface WeeklyNewsletterProps {
  recipientName?: string
  weekDate?: string
  aiSummary?: string
  featuredTeaching?: {
    title: string
    speaker: string
    description: string
    url: string
  }
  newProphecies?: Array<{
    title: string
    excerpt: string
    url: string
  }>
  upcomingEvents?: Array<{
    title: string
    date: string
    url: string
  }>
  communityStats?: {
    prayersAnswered: number
    newMembers: number
    teachingsWatched: number
  }
  topContent?: Array<{
    title: string
    type: string
    url: string
  }>
  unsubscribeUrl?: string
}

export default function WeeklyNewsletterFull({
  recipientName = 'Friend',
  weekDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  aiSummary,
  featuredTeaching,
  newProphecies = [],
  upcomingEvents = [],
  communityStats,
  topContent = [],
  unsubscribeUrl = 'https://tpcmin.org/unsubscribe',
}: WeeklyNewsletterProps) {
  return (
    <Html>
      <Head />
      <Preview>This Week at TPC Ministries - {weekDate}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerSubtext}>WEEKLY NEWSLETTER</Text>
            <Heading style={headerTitle}>TPC Ministries</Heading>
            <Text style={headerDate}>Week of {weekDate}</Text>
          </Section>

          {/* Greeting & AI Summary */}
          <Section style={content}>
            <Text style={greeting}>Dear {recipientName},</Text>

            {aiSummary && (
              <Section style={summaryCard}>
                <Text style={summaryLabel}>THIS WEEK'S HIGHLIGHTS</Text>
                <Text style={summaryText}>{aiSummary}</Text>
              </Section>
            )}

            {/* Featured Teaching */}
            {featuredTeaching && (
              <>
                <Heading style={sectionHeading}>Featured Teaching</Heading>
                <Section style={featuredCard}>
                  <Text style={featuredBadge}>FEATURED</Text>
                  <Heading style={featuredTitle}>{featuredTeaching.title}</Heading>
                  <Text style={featuredSpeaker}>by {featuredTeaching.speaker}</Text>
                  <Text style={featuredDescription}>{featuredTeaching.description}</Text>
                  <Link href={featuredTeaching.url} style={primaryButton}>
                    Watch Now
                  </Link>
                </Section>
              </>
            )}

            {/* New Prophecies */}
            {newProphecies.length > 0 && (
              <>
                <Heading style={sectionHeading}>New Prophetic Words</Heading>
                {newProphecies.map((prophecy, index) => (
                  <Section key={index} style={prophecyCard}>
                    <Heading style={prophecyTitle}>{prophecy.title}</Heading>
                    <Text style={prophecyExcerpt}>{prophecy.excerpt}</Text>
                    <Link href={prophecy.url} style={readMoreLink}>
                      Read Full Word
                    </Link>
                  </Section>
                ))}
              </>
            )}

            {/* Community Stats */}
            {communityStats && (
              <>
                <Heading style={sectionHeading}>Community Impact</Heading>
                <Section style={statsSection}>
                  <table style={statsTable}>
                    <tr>
                      <td style={statCell}>
                        <Text style={statNumber}>{communityStats.prayersAnswered}</Text>
                        <Text style={statLabel}>Prayers Answered</Text>
                      </td>
                      <td style={statCell}>
                        <Text style={statNumber}>{communityStats.newMembers}</Text>
                        <Text style={statLabel}>New Members</Text>
                      </td>
                      <td style={statCell}>
                        <Text style={statNumber}>{communityStats.teachingsWatched}</Text>
                        <Text style={statLabel}>Teachings Watched</Text>
                      </td>
                    </tr>
                  </table>
                </Section>
              </>
            )}

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <>
                <Heading style={sectionHeading}>Upcoming Events</Heading>
                <Section style={eventsSection}>
                  {upcomingEvents.map((event, index) => (
                    <div key={index} style={eventItem}>
                      <Text style={eventDate}>{event.date}</Text>
                      <Link href={event.url} style={eventTitle}>{event.title}</Link>
                    </div>
                  ))}
                </Section>
              </>
            )}

            {/* Top Content */}
            {topContent.length > 0 && (
              <>
                <Heading style={sectionHeading}>Popular This Week</Heading>
                <Section style={topContentSection}>
                  {topContent.map((item, index) => (
                    <div key={index} style={topContentItem}>
                      <Text style={topContentType}>{item.type}</Text>
                      <Link href={item.url} style={topContentTitle}>{item.title}</Link>
                    </div>
                  ))}
                </Section>
              </>
            )}

            <Hr style={divider} />

            {/* Quick Links */}
            <Section style={quickLinksSection}>
              <Heading style={quickLinksTitle}>Quick Links</Heading>
              <table style={quickLinksTable}>
                <tr>
                  <td style={quickLinkCell}>
                    <Link href="https://tpcmin.org/devotional" style={quickLink}>
                      Daily Devotional
                    </Link>
                  </td>
                  <td style={quickLinkCell}>
                    <Link href="https://tpcmin.org/prophecy" style={quickLink}>
                      Request a Word
                    </Link>
                  </td>
                </tr>
                <tr>
                  <td style={quickLinkCell}>
                    <Link href="https://tpcmin.org/prayer" style={quickLink}>
                      Submit Prayer
                    </Link>
                  </td>
                  <td style={quickLinkCell}>
                    <Link href="https://tpcmin.org/giving" style={quickLink}>
                      Give Online
                    </Link>
                  </td>
                </tr>
              </table>
            </Section>

            <Text style={closingText}>
              Thank you for being part of our TPC family. We're grateful for your partnership in ministry.
            </Text>

            <Text style={signature}>
              In His Service,<br />
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
              <Link href="https://tpcmin.org/missions" style={footerLink}>Missions</Link>
              {' | '}
              <Link href="https://tpcmin.org/contact" style={footerLink}>Contact</Link>
            </Text>
            <Text style={footerUnsubscribe}>
              <Link href={unsubscribeUrl} style={footerLink}>Unsubscribe</Link> from weekly newsletter
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
  padding: '40px 20px',
  textAlign: 'center' as const,
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
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 8px',
}

const headerDate = {
  color: '#ffffff',
  fontSize: '14px',
  margin: '0',
  opacity: 0.9,
}

const content = {
  padding: '40px 30px',
}

const greeting = {
  color: '#333333',
  fontSize: '16px',
  margin: '0 0 24px',
}

const summaryCard = {
  backgroundColor: '#faf8f5',
  borderLeft: '4px solid #c9a961',
  padding: '20px',
  marginBottom: '32px',
}

const summaryLabel = {
  color: '#c9a961',
  fontSize: '11px',
  fontWeight: 'bold',
  letterSpacing: '1px',
  margin: '0 0 8px',
}

const summaryText = {
  color: '#333333',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0',
}

const sectionHeading = {
  color: '#1e3a8a',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '32px 0 16px',
  borderBottom: '2px solid #e5e7eb',
  paddingBottom: '8px',
}

const featuredCard = {
  backgroundColor: '#1e3a8a',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
}

const featuredBadge = {
  backgroundColor: '#c9a961',
  color: '#1e3a8a',
  fontSize: '10px',
  fontWeight: 'bold',
  letterSpacing: '1px',
  padding: '4px 12px',
  borderRadius: '4px',
  display: 'inline-block',
  margin: '0 0 12px',
}

const featuredTitle = {
  color: '#ffffff',
  fontSize: '22px',
  fontWeight: 'bold',
  margin: '0 0 8px',
}

const featuredSpeaker = {
  color: '#c9a961',
  fontSize: '14px',
  margin: '0 0 12px',
}

const featuredDescription = {
  color: '#ffffff',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 16px',
  opacity: 0.9,
}

const primaryButton = {
  backgroundColor: '#c9a961',
  color: '#1e3a8a',
  fontSize: '14px',
  fontWeight: 'bold',
  padding: '12px 24px',
  textDecoration: 'none',
  borderRadius: '6px',
  display: 'inline-block',
}

const prophecyCard = {
  backgroundColor: '#f8f9fa',
  borderLeft: '4px solid #c9a961',
  padding: '16px 20px',
  marginBottom: '12px',
}

const prophecyTitle = {
  color: '#1e3a8a',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px',
}

const prophecyExcerpt = {
  color: '#4b5563',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 8px',
}

const readMoreLink = {
  color: '#c9a961',
  fontSize: '13px',
  fontWeight: 'bold',
  textDecoration: 'none',
}

const statsSection = {
  backgroundColor: '#f8f9fa',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
}

const statsTable = {
  width: '100%',
}

const statCell = {
  textAlign: 'center' as const,
  padding: '12px',
}

const statNumber = {
  color: '#1e3a8a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 4px',
}

const statLabel = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '0',
  textTransform: 'uppercase' as const,
}

const eventsSection = {
  marginBottom: '24px',
}

const eventItem = {
  borderBottom: '1px solid #e5e7eb',
  padding: '12px 0',
}

const eventDate = {
  color: '#c9a961',
  fontSize: '12px',
  fontWeight: 'bold',
  margin: '0 0 4px',
}

const eventTitle = {
  color: '#1e3a8a',
  fontSize: '15px',
  textDecoration: 'none',
}

const topContentSection = {
  marginBottom: '24px',
}

const topContentItem = {
  padding: '8px 0',
}

const topContentType = {
  backgroundColor: '#e5e7eb',
  color: '#4b5563',
  fontSize: '10px',
  fontWeight: 'bold',
  letterSpacing: '1px',
  padding: '2px 8px',
  borderRadius: '4px',
  display: 'inline-block',
  margin: '0 8px 0 0',
  textTransform: 'uppercase' as const,
}

const topContentTitle = {
  color: '#1e3a8a',
  fontSize: '14px',
  textDecoration: 'none',
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
}

const quickLinksSection = {
  marginBottom: '24px',
}

const quickLinksTitle = {
  color: '#1e3a8a',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 16px',
}

const quickLinksTable = {
  width: '100%',
}

const quickLinkCell = {
  padding: '8px',
}

const quickLink = {
  backgroundColor: '#f8f9fa',
  color: '#1e3a8a',
  fontSize: '13px',
  padding: '12px 16px',
  textDecoration: 'none',
  borderRadius: '6px',
  display: 'block',
  textAlign: 'center' as const,
}

const closingText = {
  color: '#666666',
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
