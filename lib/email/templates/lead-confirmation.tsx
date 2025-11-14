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

interface LeadConfirmationProps {
  name: string
  interests?: string[]
}

export default function LeadConfirmation({
  name = 'Friend',
  interests = [],
}: LeadConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Thank you for your interest in TPC Ministries!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerText}>TPC MINISTRIES</Heading>
            <Text style={headerSubtext}>Touching People for Christ</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Thank You, {name}!</Heading>

            <Text style={text}>
              We're excited that you've expressed interest in TPC Ministries! Your information
              has been received, and one of our team members will be reaching out to you soon.
            </Text>

            {interests.length > 0 && (
              <>
                <Text style={text}>
                  <strong>You expressed interest in:</strong>
                </Text>
                <Section style={interestList}>
                  {interests.map((interest) => (
                    <Text key={interest} style={interestItem}>
                      ✓ {getInterestLabel(interest)}
                    </Text>
                  ))}
                </Section>
              </>
            )}

            <Heading style={h2}>While You Wait...</Heading>

            <Text style={text}>
              Feel free to explore what TPC Ministries has to offer:
            </Text>

            <Section style={featureList}>
              <Text style={feature}>
                <strong style={featureTitle}>📖 Browse Our Teachings</strong>
                <br />
                <Link href="https://tpcmin.org/teachings" style={link}>
                  Explore powerful messages and prophetic insights
                </Link>
              </Text>

              <Text style={feature}>
                <strong style={featureTitle}>🌍 Learn About Our Missions</strong>
                <br />
                <Link href="https://tpcmin.org/missions" style={link}>
                  See how we're impacting lives in Kenya, South Africa, and Grenada
                </Link>
              </Text>

              <Text style={feature}>
                <strong style={featureTitle}>💝 Partner With Us</strong>
                <br />
                <Link href="https://tpcmin.org/give" style={link}>
                  Support our ministry and mission work
                </Link>
              </Text>

              <Text style={feature}>
                <strong style={featureTitle}>📅 Upcoming Events</strong>
                <br />
                <Link href="https://tpcmin.org/events" style={link}>
                  Join us for live gatherings and special services
                </Link>
              </Text>
            </Section>

            <Section style={contactBox}>
              <Text style={contactText}>
                <strong>Have Questions?</strong>
                <br />
                Don't hesitate to reach out! Reply to this email or contact us directly.
                We're here to help you on your spiritual journey.
              </Text>
            </Section>

            <Text style={signature}>
              Blessings,
              <br />
              <strong>The TPC Ministries Team</strong>
            </Text>

            <Section style={buttonSection}>
              <Link href="https://tpcmin.org" style={button}>
                Visit Our Website
              </Link>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              TPC Ministries | Touching People for Christ
            </Text>
            <Text style={footerText}>
              <Link href="https://tpcmin.org" style={footerLink}>
                Website
              </Link>
              {' | '}
              <Link href="https://tpcmin.org/contact" style={footerLink}>
                Contact Us
              </Link>
              {' | '}
              <Link href="https://tpcmin.org/about" style={footerLink}>
                About Us
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

function getInterestLabel(interest: string): string {
  const labels: Record<string, string> = {
    teachings: 'Teachings & Sermons',
    prayer: 'Prayer Support',
    giving: 'Giving & Supporting Missions',
    events: 'Live Events & Gatherings',
    prophecy: 'Personal Prophecy',
    missions: 'Mission Work (Kenya, South Africa, Grenada)',
  }
  return labels[interest] || interest
}

// Styles
const main = {
  backgroundColor: '#f5f5f5',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
}

const header = {
  backgroundColor: '#1e3a8a',
  padding: '32px 20px',
  textAlign: 'center' as const,
}

const headerText = {
  color: '#c9a961',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 8px',
  letterSpacing: '2px',
}

const headerSubtext = {
  color: '#ffffff',
  fontSize: '14px',
  margin: '0',
  letterSpacing: '1px',
}

const content = {
  padding: '40px 30px',
}

const h1 = {
  color: '#1e3a8a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 20px',
}

const h2 = {
  color: '#1e3a8a',
  fontSize: '22px',
  fontWeight: 'bold',
  margin: '30px 0 16px',
}

const text = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const interestList = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #c9a961',
  borderRadius: '6px',
  padding: '16px 20px',
  margin: '12px 0 24px',
}

const interestItem = {
  color: '#1e3a8a',
  fontSize: '15px',
  lineHeight: '28px',
  margin: '0',
}

const featureList = {
  margin: '20px 0',
}

const feature = {
  color: '#333333',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '0 0 20px',
  paddingLeft: '8px',
}

const featureTitle = {
  color: '#1e3a8a',
  fontSize: '16px',
}

const link = {
  color: '#c9a961',
  textDecoration: 'underline',
}

const contactBox = {
  backgroundColor: '#fff9e6',
  border: '1px solid #c9a961',
  borderRadius: '8px',
  padding: '20px',
  margin: '30px 0',
  textAlign: 'center' as const,
}

const contactText = {
  color: '#333333',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '0',
}

const signature = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '30px 0 0',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '30px 0',
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
}

const footer = {
  backgroundColor: '#1e3a8a',
  padding: '30px 20px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#c9a961',
  fontSize: '14px',
  margin: '0 0 8px',
}

const footerLink = {
  color: '#c9a961',
  textDecoration: 'underline',
}
