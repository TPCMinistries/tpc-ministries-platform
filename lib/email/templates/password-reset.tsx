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

interface PasswordResetProps {
  memberName: string
  resetUrl: string
  expiresIn?: string
}

export default function PasswordReset({
  memberName = 'Friend',
  resetUrl = 'https://tpcmin.org/reset-password',
  expiresIn = '1 hour',
}: PasswordResetProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your TPC Ministries password</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerText}>TPC MINISTRIES</Heading>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Password Reset Request</Heading>

            <Text style={greeting}>Hello {memberName},</Text>

            <Text style={text}>
              We received a request to reset the password for your TPC Ministries account.
              If you made this request, click the button below to create a new password.
            </Text>

            <Section style={buttonSection}>
              <Link href={resetUrl} style={button}>
                Reset Password
              </Link>
            </Section>

            <Section style={warningBox}>
              <Text style={warningText}>
                <strong>⏰ This link will expire in {expiresIn}.</strong>
                <br />
                If you need a new link, you can request another password reset on our website.
              </Text>
            </Section>

            <Text style={text}>
              If the button above doesn't work, copy and paste this URL into your browser:
            </Text>

            <Text style={urlText}>{resetUrl}</Text>

            <Section style={securityBox}>
              <Heading style={securityTitle}>🔒 Security Tips</Heading>
              <Text style={securityText}>
                • Choose a strong password (at least 8 characters)
                <br />
                • Use a mix of letters, numbers, and symbols
                <br />
                • Don't reuse passwords from other accounts
                <br />
                • Consider using a password manager
              </Text>
            </Section>

            <Section style={alertBox}>
              <Text style={alertText}>
                <strong>Didn't request this?</strong>
                <br />
                If you didn't request a password reset, you can safely ignore this email.
                Your password will remain unchanged. If you're concerned about your account
                security, please contact us immediately.
              </Text>
            </Section>

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
                Visit Website
              </Link>
              {' | '}
              <Link href="https://tpcmin.org/contact" style={footerLink}>
                Contact Support
              </Link>
            </Text>
            <Text style={footerDisclaimer}>
              This is an automated security email. Please do not reply to this message.
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

const warningBox = {
  backgroundColor: '#fff9e6',
  border: '2px solid #f59e0b',
  borderRadius: '8px',
  padding: '16px',
  margin: '20px 0',
  textAlign: 'center' as const,
}

const warningText = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
}

const urlText = {
  color: '#c9a961',
  fontSize: '13px',
  wordBreak: 'break-all' as const,
  backgroundColor: '#f8f9fa',
  padding: '12px',
  borderRadius: '4px',
  border: '1px solid #e5e7eb',
  margin: '0 0 24px',
  fontFamily: 'monospace',
}

const securityBox = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #c9a961',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const securityTitle = {
  color: '#1e3a8a',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px',
}

const securityText = {
  color: '#333333',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
}

const alertBox = {
  backgroundColor: '#fee',
  border: '1px solid #fcc',
  borderLeft: '4px solid #ef4444',
  borderRadius: '6px',
  padding: '16px',
  margin: '24px 0',
}

const alertText = {
  color: '#991b1b',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
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
}
