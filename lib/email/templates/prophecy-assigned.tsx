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

interface ProphecyAssignedProps {
  memberName: string
  prophecyTitle?: string
  viewUrl?: string
}

export default function ProphecyAssigned({
  memberName = 'Friend',
  prophecyTitle = 'A Personal Word',
  viewUrl = 'https://tpcmin.org/member/prophecy',
}: ProphecyAssignedProps) {
  return (
    <Html>
      <Head />
      <Preview>You have received a new personal prophecy from TPC Ministries</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerText}>TPC MINISTRIES</Heading>
            <Text style={headerSubtext}>Personal Prophecy</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Section style={sparkleBox}>
              <Heading style={sparkleEmoji}>✨</Heading>
              <Heading style={h1}>A Prophetic Word for You!</Heading>
            </Section>

            <Text style={greeting}>Dear {memberName},</Text>

            <Text style={text}>
              The Lord has spoken a personal word over your life! We're excited to share
              a new prophetic message that has been prepared specifically for you.
            </Text>

            <Section style={prophecyBox}>
              <Text style={prophecyLabel}>Prophecy Title:</Text>
              <Text style={prophecyTitle}>{prophecyTitle}</Text>
            </Section>

            <Text style={text}>
              This prophetic word is meant to encourage, edify, and provide divine direction
              for your spiritual journey. We encourage you to:
            </Text>

            <Section style={instructionList}>
              <Text style={instruction}>
                <strong style={instructionNumber}>1.</strong> Pray before reading and ask the Holy Spirit for understanding
              </Text>
              <Text style={instruction}>
                <strong style={instructionNumber}>2.</strong> Read the prophecy carefully and meditate on it
              </Text>
              <Text style={instruction}>
                <strong style={instructionNumber}>3.</strong> Write down how God speaks to you through this word
              </Text>
              <Text style={instruction}>
                <strong style={instructionNumber}>4.</strong> Test it against Scripture (1 Thessalonians 5:20-21)
              </Text>
              <Text style={instruction}>
                <strong style={instructionNumber}>5.</strong> Share your testimony with us as you see it fulfilled
              </Text>
            </Section>

            <Section style={buttonSection}>
              <Link href={viewUrl} style={button}>
                Read Your Prophecy
              </Link>
            </Section>

            <Section style={verseBox}>
              <Text style={verseText}>
                "Pursue love, and earnestly desire the spiritual gifts, especially that you may prophesy."
              </Text>
              <Text style={verseRef}>— 1 Corinthians 14:1</Text>
            </Section>

            <Text style={text}>
              If you have questions about your prophecy or would like prayer, please don't hesitate
              to reach out to us. We're here to support you on your spiritual journey.
            </Text>

            <Text style={signature}>
              May this word bring clarity, hope, and strength to your walk with Christ.
              <br />
              <br />
              <strong>Prophetically Yours,</strong>
              <br />
              <strong>TPC Ministries Team</strong>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              TPC Ministries | Touching People for Christ
            </Text>
            <Text style={footerText}>
              <Link href="https://tpcmin.org/member/prophecy" style={footerLink}>
                View All Prophecies
              </Link>
              {' | '}
              <Link href="https://tpcmin.org/contact" style={footerLink}>
                Contact Us
              </Link>
            </Text>
            <Text style={footerDisclaimer}>
              Personal prophecies are given to encourage and build up believers. Always test prophetic
              words against Scripture and seek wise counsel.
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
  margin: '0 0 8px',
  letterSpacing: '2px',
}

const headerSubtext = {
  color: '#ffffff',
  fontSize: '14px',
  margin: '0',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
}

const content = {
  padding: '40px 30px',
}

const sparkleBox = {
  textAlign: 'center' as const,
  margin: '0 0 30px',
}

const sparkleEmoji = {
  fontSize: '48px',
  margin: '0 0 12px',
}

const h1 = {
  color: '#1e3a8a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
}

const greeting = {
  color: '#333333',
  fontSize: '18px',
  margin: '0 0 20px',
}

const text = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const prophecyBox = {
  background: 'linear-gradient(135deg, #1e3a8a 0%, #2e4a9a 100%)',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
  boxShadow: '0 4px 12px rgba(30, 58, 138, 0.15)',
}

const prophecyLabel = {
  color: '#c9a961',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 8px',
}

const prophecyTitle = {
  color: '#ffffff',
  fontSize: '22px',
  fontWeight: 'bold',
  margin: '0',
  lineHeight: '30px',
}

const instructionList = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #c9a961',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
}

const instruction = {
  color: '#333333',
  fontSize: '15px',
  lineHeight: '26px',
  margin: '0 0 12px',
  paddingLeft: '8px',
}

const instructionNumber = {
  color: '#c9a961',
  fontSize: '16px',
  marginRight: '8px',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#c9a961',
  color: '#1e3a8a',
  fontSize: '18px',
  fontWeight: 'bold',
  padding: '16px 40px',
  textDecoration: 'none',
  borderRadius: '8px',
  display: 'inline-block',
  boxShadow: '0 4px 12px rgba(201, 169, 97, 0.3)',
}

const verseBox = {
  borderLeft: '4px solid #c9a961',
  backgroundColor: '#fff9e6',
  padding: '20px',
  margin: '24px 0',
  fontStyle: 'italic',
}

const verseText = {
  color: '#1e3a8a',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 8px',
}

const verseRef = {
  color: '#666666',
  fontSize: '14px',
  margin: '0',
  textAlign: 'right' as const,
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

const footerDisclaimer = {
  color: '#ffffff',
  fontSize: '11px',
  margin: '16px 0 0',
  opacity: 0.8,
  lineHeight: '16px',
}
