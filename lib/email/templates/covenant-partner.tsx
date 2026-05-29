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

type PartnerEmailKind = 'welcome' | 'monthly-update' | 'gathering'

interface CovenantPartnerEmailProps {
  kind?: PartnerEmailKind
  memberName?: string
  partnerHubUrl?: string
  givingUrl?: string
  gatheringDate?: string
  gatheringTime?: string
  gatheringUrl?: string
  updateTitle?: string
  updateBody?: string
}

const contentByKind: Record<PartnerEmailKind, {
  preview: string
  eyebrow: string
  headline: string
  intro: string
  cta: string
}> = {
  welcome: {
    preview: 'Welcome to Covenant Partnership with TPC Ministries.',
    eyebrow: 'Covenant Partnership',
    headline: 'Welcome to the builder community',
    intro:
      'Thank you for becoming a monthly Covenant Partner. Your partnership helps sustain prophetic ministry, discipleship, missions, leadership development, and practical equipping for the future ahead.',
    cta: 'Open Partner Hub',
  },
  'monthly-update': {
    preview: 'Your monthly Covenant Partner update from TPC Ministries.',
    eyebrow: 'Partner Update',
    headline: 'What your partnership is helping build',
    intro:
      'Here is a concise update on the ministry work, teaching rhythm, missions movement, and practical equipping your monthly partnership helps sustain.',
    cta: 'View Partner Hub',
  },
  gathering: {
    preview: 'You are invited to the next Covenant Partner gathering.',
    eyebrow: 'Partner Gathering',
    headline: 'Join the next partner gathering',
    intro:
      'We are gathering Covenant Partners for teaching, prayer, alignment, and corporate encouragement. This is a space to be strengthened and stay connected to the assignment.',
    cta: 'View Gathering Details',
  },
}

export default function CovenantPartnerEmail({
  kind = 'welcome',
  memberName = 'Friend',
  partnerHubUrl = 'https://tpcmin.org/partner-hub',
  givingUrl = 'https://tpcmin.org/my-giving',
  gatheringDate,
  gatheringTime,
  gatheringUrl,
  updateTitle,
  updateBody,
}: CovenantPartnerEmailProps) {
  const content = contentByKind[kind]
  const ctaUrl = kind === 'gathering' && gatheringUrl ? gatheringUrl : partnerHubUrl

  return (
    <Html>
      <Head />
      <Preview>{content.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={eyebrow}>{content.eyebrow}</Text>
            <Heading style={headerTitle}>TPC Ministries</Heading>
          </Section>

          <Section style={contentSection}>
            <Heading style={h1}>{content.headline}</Heading>
            <Text style={text}>Hello {memberName},</Text>
            <Text style={text}>{updateBody || content.intro}</Text>

            {updateTitle && (
              <Section style={highlightBox}>
                <Text style={highlightTitle}>{updateTitle}</Text>
              </Section>
            )}

            {kind === 'gathering' && (gatheringDate || gatheringTime) && (
              <Section style={detailsBox}>
                <Text style={detailsLabel}>Gathering Details</Text>
                {gatheringDate && <Text style={detailsText}>Date: {gatheringDate}</Text>}
                {gatheringTime && <Text style={detailsText}>Time: {gatheringTime}</Text>}
              </Section>
            )}

            <Section style={valuesBox}>
              <Text style={valuesTitle}>Partner rhythm</Text>
              <Text style={valueItem}>Monthly live partner gatherings</Text>
              <Text style={valueItem}>Bi-weekly teaching and equipping</Text>
              <Text style={valueItem}>Missions, media, discipleship, and leadership updates</Text>
              <Text style={valueItem}>Practical development for spiritual maturity and future-readiness</Text>
            </Section>

            <Section style={disclaimerBox}>
              <Text style={disclaimerText}>
                Prophetic ministry is never for sale. Partnership is not payment for prophecy. It is a
                way to help sustain the work of the ministry while staying connected to ongoing teaching,
                community, and equipping.
              </Text>
            </Section>

            <Section style={buttonSection}>
              <Link href={ctaUrl} style={button}>
                {content.cta}
              </Link>
            </Section>

            <Text style={text}>
              You can manage your monthly partnership, giving records, and account details from your
              member area.
            </Text>

            <Text style={smallText}>
              Manage giving: <Link href={givingUrl} style={inlineLink}>{givingUrl}</Link>
            </Text>

            <Text style={signature}>
              With gratitude,
              <br />
              <strong>TPC Ministries</strong>
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>TPC Ministries | Touching People for Christ</Text>
            <Text style={footerText}>
              <Link href="https://tpcmin.org" style={footerLink}>tpcmin.org</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f5f1e8',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
}

const header = {
  backgroundColor: '#0e1a2e',
  padding: '34px 30px',
  textAlign: 'center' as const,
}

const eyebrow = {
  color: '#d4b883',
  fontSize: '12px',
  fontWeight: '700',
  letterSpacing: '2px',
  margin: '0 0 10px',
  textTransform: 'uppercase' as const,
}

const headerTitle = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0',
}

const contentSection = {
  padding: '38px 30px',
}

const h1 = {
  color: '#0e1a2e',
  fontSize: '28px',
  lineHeight: '34px',
  margin: '0 0 22px',
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 18px',
}

const smallText = {
  color: '#6b7280',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 18px',
}

const inlineLink = {
  color: '#9a6b1f',
}

const highlightBox = {
  backgroundColor: '#fbf4df',
  borderLeft: '4px solid #d4b883',
  borderRadius: '8px',
  margin: '20px 0',
  padding: '18px',
}

const highlightTitle = {
  color: '#0e1a2e',
  fontSize: '17px',
  fontWeight: '700',
  lineHeight: '24px',
  margin: '0',
}

const detailsBox = {
  backgroundColor: '#eef3f8',
  borderRadius: '8px',
  margin: '20px 0',
  padding: '18px',
}

const detailsLabel = {
  color: '#0e1a2e',
  fontSize: '14px',
  fontWeight: '700',
  margin: '0 0 8px',
}

const detailsText = {
  color: '#374151',
  fontSize: '15px',
  margin: '4px 0',
}

const valuesBox = {
  border: '1px solid #e5e7eb',
  borderRadius: '10px',
  margin: '24px 0',
  padding: '20px',
}

const valuesTitle = {
  color: '#0e1a2e',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 12px',
}

const valueItem = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
}

const disclaimerBox = {
  backgroundColor: '#0e1a2e',
  borderRadius: '8px',
  margin: '24px 0',
  padding: '18px',
}

const disclaimerText = {
  color: '#f5f1e8',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '28px 0',
}

const button = {
  backgroundColor: '#d4b883',
  borderRadius: '8px',
  color: '#0e1a2e',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '700',
  padding: '14px 30px',
  textDecoration: 'none',
}

const signature = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '26px 0 0',
}

const footer = {
  backgroundColor: '#0e1a2e',
  padding: '24px 20px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#d4b883',
  fontSize: '13px',
  margin: '0 0 6px',
}

const footerLink = {
  color: '#d4b883',
  textDecoration: 'underline',
}
