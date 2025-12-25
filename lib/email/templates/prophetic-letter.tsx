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

interface PropheticLetterEmailProps {
  recipientName?: string
  prophecyTitle: string
  prophecyContent: string
  prophetName?: string
  prophecyDate?: string
  scriptureReference?: string
  scriptureText?: string
  reflectionQuestions?: string[]
  prayer?: string
  readMoreUrl?: string
  unsubscribeUrl?: string
}

export default function PropheticLetterEmail({
  recipientName = 'Friend',
  prophecyTitle,
  prophecyContent,
  prophetName = 'Prophet Lorenzo',
  prophecyDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  scriptureReference,
  scriptureText,
  reflectionQuestions = [],
  prayer,
  readMoreUrl = 'https://tpcmin.org/prophecy',
  unsubscribeUrl = 'https://tpcmin.org/unsubscribe',
}: PropheticLetterEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>A Word from the Lord: {prophecyTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerLabel}>A PROPHETIC WORD</Text>
            <Heading style={headerTitle}>{prophecyTitle}</Heading>
            <Text style={headerMeta}>
              Given through {prophetName} | {prophecyDate}
            </Text>
          </Section>

          {/* Scripture Reference */}
          {scriptureReference && scriptureText && (
            <Section style={scriptureCard}>
              <Text style={scriptureRef}>{scriptureReference}</Text>
              <Text style={scriptureTextStyle}>"{scriptureText}"</Text>
            </Section>
          )}

          {/* Main Content */}
          <Section style={content}>
            <Text style={greeting}>Beloved {recipientName},</Text>

            <Text style={introText}>
              The Lord has spoken a word for this season. May your heart be open to receive what the Spirit is saying.
            </Text>

            <Hr style={divider} />

            {/* Prophecy Content */}
            <Section style={prophecySection}>
              <div
                style={prophecyText}
                dangerouslySetInnerHTML={{ __html: prophecyContent.replace(/\n/g, '<br />') }}
              />
            </Section>

            <Hr style={divider} />

            {/* Reflection Questions */}
            {reflectionQuestions.length > 0 && (
              <Section style={reflectionSection}>
                <Heading style={reflectionTitle}>Questions for Reflection</Heading>
                <ul style={reflectionList}>
                  {reflectionQuestions.map((question, index) => (
                    <li key={index} style={reflectionItem}>{question}</li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Prayer */}
            {prayer && (
              <Section style={prayerSection}>
                <Heading style={prayerTitle}>Prayer of Response</Heading>
                <Text style={prayerText}>
                  <em>{prayer}</em>
                </Text>
              </Section>
            )}

            {/* Call to Action */}
            <Section style={ctaSection}>
              <Link href={readMoreUrl} style={ctaButton}>
                Read Full Prophetic Word
              </Link>
              <Text style={ctaSubtext}>
                Access audio recording and additional resources
              </Text>
            </Section>

            {/* Request Your Own */}
            <Section style={requestSection}>
              <Text style={requestText}>
                Would you like to receive a personal prophetic word?
              </Text>
              <Link href="https://tpcmin.org/prophecy/request" style={requestButton}>
                Request a Personal Word
              </Link>
            </Section>

            <Text style={closingText}>
              May the Lord give you ears to hear what the Spirit is saying. Be encouraged - God is moving in this season!
            </Text>

            <Text style={signature}>
              In His Service,<br />
              <strong>TPC Ministries</strong>
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
              <Link href="https://tpcmin.org/prophecy" style={footerLink}>Prophecy Archive</Link>
              {' | '}
              <Link href="https://tpcmin.org/contact" style={footerLink}>Contact</Link>
            </Text>
            <Text style={footerUnsubscribe}>
              <Link href={unsubscribeUrl} style={footerLink}>Unsubscribe</Link> from prophetic updates
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
  background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)',
  padding: '40px 30px',
  textAlign: 'center' as const,
}

const headerLabel = {
  color: '#c9a961',
  fontSize: '12px',
  fontWeight: 'bold',
  letterSpacing: '3px',
  margin: '0 0 12px',
  textTransform: 'uppercase' as const,
}

const headerTitle = {
  color: '#ffffff',
  fontSize: '26px',
  fontWeight: 'bold',
  lineHeight: '1.3',
  margin: '0 0 12px',
}

const headerMeta = {
  color: '#ffffff',
  fontSize: '13px',
  margin: '0',
  opacity: 0.8,
}

const scriptureCard = {
  backgroundColor: '#faf8f5',
  borderLeft: '4px solid #c9a961',
  padding: '20px 24px',
}

const scriptureRef = {
  color: '#c9a961',
  fontSize: '12px',
  fontWeight: 'bold',
  letterSpacing: '1px',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
}

const scriptureTextStyle = {
  color: '#1e3a8a',
  fontSize: '16px',
  fontStyle: 'italic',
  lineHeight: '1.6',
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
  fontStyle: 'italic',
  lineHeight: '1.6',
  margin: '0 0 24px',
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const prophecySection = {
  backgroundColor: '#fefefe',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '24px',
  marginBottom: '24px',
}

const prophecyText = {
  color: '#1e3a8a',
  fontSize: '17px',
  fontStyle: 'italic',
  lineHeight: '1.8',
  margin: '0',
}

const reflectionSection = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
}

const reflectionTitle = {
  color: '#1e3a8a',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
}

const reflectionList = {
  color: '#4b5563',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
  paddingLeft: '20px',
}

const reflectionItem = {
  marginBottom: '8px',
}

const prayerSection = {
  backgroundColor: '#1e3a8a',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
}

const prayerTitle = {
  color: '#c9a961',
  fontSize: '14px',
  fontWeight: 'bold',
  letterSpacing: '1px',
  margin: '0 0 12px',
  textTransform: 'uppercase' as const,
}

const prayerText = {
  color: '#ffffff',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0',
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const ctaButton = {
  backgroundColor: '#c9a961',
  color: '#1e3a8a',
  fontSize: '14px',
  fontWeight: 'bold',
  padding: '14px 28px',
  textDecoration: 'none',
  borderRadius: '6px',
  display: 'inline-block',
}

const ctaSubtext = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '12px 0 0',
}

const requestSection = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center' as const,
  marginBottom: '24px',
}

const requestText = {
  color: '#333333',
  fontSize: '15px',
  margin: '0 0 16px',
}

const requestButton = {
  backgroundColor: '#1e3a8a',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  padding: '12px 24px',
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
