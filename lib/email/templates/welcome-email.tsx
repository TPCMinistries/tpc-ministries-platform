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

interface WelcomeEmailProps {
  memberName: string
  loginUrl?: string
  temporaryPassword?: string
}

export default function WelcomeEmail({
  memberName = 'Friend',
  loginUrl = 'https://tpcmin.org/login',
  temporaryPassword,
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to TPC Ministries - Your Journey Begins!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Heading style={headerText}>TPC MINISTRIES</Heading>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Welcome, {memberName}!</Heading>

            <Text style={text}>
              We are thrilled to have you join the TPC Ministries family! Your spiritual journey with us begins today, and we're honored to walk alongside you.
            </Text>

            {temporaryPassword && (
              <Section style={passwordBox}>
                <Text style={passwordLabel}>Your Temporary Password:</Text>
                <Text style={passwordText}>{temporaryPassword}</Text>
                <Text style={passwordNote}>
                  Please change this password after your first login for security.
                </Text>
              </Section>
            )}

            <Section style={buttonSection}>
              <Link href={loginUrl} style={button}>
                Access Your Account
              </Link>
            </Section>

            <Heading style={h2}>What's Available to You:</Heading>

            <Section style={featureList}>
              <Text style={feature}>
                <strong style={featureTitle}>🎓 Teachings & Sermons</strong>
                <br />
                Access powerful messages and prophetic insights
              </Text>

              <Text style={feature}>
                <strong style={featureTitle}>🙏 Prayer Requests</strong>
                <br />
                Submit prayer requests and receive support from our community
              </Text>

              <Text style={feature}>
                <strong style={featureTitle}>✨ Personal Prophecy</strong>
                <br />
                Receive personalized prophetic words (Partner & Covenant members)
              </Text>

              <Text style={feature}>
                <strong style={featureTitle}>🌍 Mission Updates</strong>
                <br />
                Stay connected with our work in Kenya, South Africa, and Grenada
              </Text>

              <Text style={feature}>
                <strong style={featureTitle}>💝 Giving & Support</strong>
                <br />
                Partner with us through tithes, offerings, and mission support
              </Text>
            </Section>

            <Text style={text}>
              Need help getting started? Reply to this email and we'll be happy to assist you.
            </Text>

            <Text style={signature}>
              Blessings,
              <br />
              <strong>The TPC Ministries Team</strong>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              TPC Ministries | Touching People for Christ
            </Text>
            <Text style={footerText}>
              <Link href="https://tpcmin.org" style={footerLink}>
                Visit Our Website
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
  margin: '0',
  letterSpacing: '2px',
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
  margin: '30px 0 20px',
}

const text = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const passwordBox = {
  backgroundColor: '#f8f9fa',
  border: '2px solid #c9a961',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
  textAlign: 'center' as const,
}

const passwordLabel = {
  color: '#666666',
  fontSize: '14px',
  margin: '0 0 8px',
}

const passwordText = {
  color: '#1e3a8a',
  fontSize: '24px',
  fontWeight: 'bold',
  letterSpacing: '2px',
  margin: '0 0 12px',
  fontFamily: 'monospace',
}

const passwordNote = {
  color: '#666666',
  fontSize: '12px',
  margin: '0',
  fontStyle: 'italic',
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

const signature = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '30px 0 0',
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
