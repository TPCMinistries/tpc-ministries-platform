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

interface DonationReceiptProps {
  donorName: string
  amount: number
  date: string
  donationType: string
  transactionId?: string
  isRecurring?: boolean
}

export default function DonationReceipt({
  donorName = 'Friend',
  amount = 0,
  date = new Date().toLocaleDateString(),
  donationType = 'One-Time Donation',
  transactionId = 'N/A',
  isRecurring = false,
}: DonationReceiptProps) {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100)

  return (
    <Html>
      <Head />
      <Preview>Thank you for your generous donation to TPC Ministries</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerText}>TPC MINISTRIES</Heading>
            <Text style={headerSubtext}>Donation Receipt</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Thank You, {donorName}!</Heading>

            <Text style={text}>
              Your generous {isRecurring ? 'monthly' : ''} donation of{' '}
              <strong style={amountText}>{formattedAmount}</strong> has been received.
              Your support enables us to continue our ministry and mission work around the world.
            </Text>

            {/* Receipt Details */}
            <Section style={receiptBox}>
              <Heading style={receiptTitle}>Receipt Details</Heading>
              <Hr style={divider} />

              <Section style={receiptRow}>
                <Text style={receiptLabel}>Donor Name:</Text>
                <Text style={receiptValue}>{donorName}</Text>
              </Section>

              <Section style={receiptRow}>
                <Text style={receiptLabel}>Amount:</Text>
                <Text style={receiptValue}>{formattedAmount}</Text>
              </Section>

              <Section style={receiptRow}>
                <Text style={receiptLabel}>Date:</Text>
                <Text style={receiptValue}>{date}</Text>
              </Section>

              <Section style={receiptRow}>
                <Text style={receiptLabel}>Type:</Text>
                <Text style={receiptValue}>{donationType}</Text>
              </Section>

              {isRecurring && (
                <Section style={receiptRow}>
                  <Text style={receiptLabel}>Frequency:</Text>
                  <Text style={receiptValue}>Monthly Recurring</Text>
                </Section>
              )}

              <Section style={receiptRow}>
                <Text style={receiptLabel}>Transaction ID:</Text>
                <Text style={receiptValue}>{transactionId}</Text>
              </Section>
            </Section>

            {/* Tax Information */}
            <Section style={taxBox}>
              <Text style={taxText}>
                <strong>Tax Information:</strong> TPC Ministries is a 501(c)(3) non-profit organization.
                Your donation is tax-deductible to the extent allowed by law. Please retain this receipt
                for your tax records. Our EIN is available upon request.
              </Text>
            </Section>

            {/* Impact Message */}
            <Heading style={h2}>Your Impact</Heading>

            <Text style={text}>
              Your faithful giving supports:
            </Text>

            <Section style={impactList}>
              <Text style={impactItem}>
                <strong style={impactEmoji}>🌍</strong> Mission work in Kenya, South Africa, and Grenada
              </Text>
              <Text style={impactItem}>
                <strong style={impactEmoji}>📖</strong> Producing and sharing biblical teachings
              </Text>
              <Text style={impactItem}>
                <strong style={impactEmoji}>🙏</strong> Prayer ministry and prophetic ministry
              </Text>
              <Text style={impactItem}>
                <strong style={impactEmoji}>💝</strong> Supporting those in need through outreach programs
              </Text>
            </Section>

            {isRecurring && (
              <Section style={recurringNote}>
                <Text style={text}>
                  Your monthly donation will be processed automatically on the same day each month.
                  You can manage your recurring donations in your account settings.
                </Text>
              </Section>
            )}

            <Text style={signature}>
              May God bless you abundantly for your generosity!
              <br />
              <br />
              <strong>The TPC Ministries Team</strong>
            </Text>

            <Section style={buttonSection}>
              <Link href="https://tpcmin.org/member/donations" style={button}>
                View Donation History
              </Link>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              TPC Ministries | Touching People for Christ
            </Text>
            <Text style={footerText}>
              Questions? Reply to this email or contact us at hello@tpcmin.org
            </Text>
            <Text style={footerText}>
              <Link href="https://tpcmin.org/give" style={footerLink}>
                Give Again
              </Link>
              {' | '}
              <Link href="https://tpcmin.org/member/donations" style={footerLink}>
                Donation History
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

const amountText = {
  color: '#c9a961',
  fontSize: '20px',
}

const receiptBox = {
  backgroundColor: '#f8f9fa',
  border: '2px solid #c9a961',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
}

const receiptTitle = {
  color: '#1e3a8a',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px',
  textAlign: 'center' as const,
}

const divider = {
  borderColor: '#c9a961',
  margin: '12px 0',
}

const receiptRow = {
  display: 'flex',
  justifyContent: 'space-between',
  margin: '8px 0',
}

const receiptLabel = {
  color: '#666666',
  fontSize: '14px',
  margin: '0',
}

const receiptValue = {
  color: '#1e3a8a',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0',
}

const taxBox = {
  backgroundColor: '#fff9e6',
  border: '1px solid #c9a961',
  borderRadius: '6px',
  padding: '16px',
  margin: '20px 0',
}

const taxText = {
  color: '#666666',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0',
}

const impactList = {
  margin: '16px 0',
}

const impactItem = {
  color: '#333333',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '0 0 12px',
  paddingLeft: '8px',
}

const impactEmoji = {
  color: '#c9a961',
  marginRight: '8px',
}

const recurringNote = {
  backgroundColor: '#e6f4ff',
  borderLeft: '4px solid #1e3a8a',
  padding: '16px',
  margin: '20px 0',
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
