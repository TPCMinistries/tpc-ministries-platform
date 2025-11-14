import { render } from '@react-email/components'
import WelcomeEmail from './templates/welcome-email'
import DonationReceipt from './templates/donation-receipt'
import LeadConfirmation from './templates/lead-confirmation'
import ProphecyAssigned from './templates/prophecy-assigned'
import PasswordReset from './templates/password-reset'
import AnnouncementEmail from './templates/announcement'
import NewsletterEmail from './templates/newsletter'
import EventInvitationEmail from './templates/event-invitation'
import UrgentEmail from './templates/urgent'

export async function renderWelcomeEmail(props: {
  memberName: string
  loginUrl?: string
  temporaryPassword?: string
}) {
  return render(WelcomeEmail(props))
}

export async function renderDonationReceipt(props: {
  donorName: string
  amount: number
  date: string
  donationType: string
  transactionId?: string
  isRecurring?: boolean
}) {
  return render(DonationReceipt(props))
}

export async function renderLeadConfirmation(props: {
  name: string
  interests?: string[]
}) {
  return render(LeadConfirmation(props))
}

export async function renderProphecyAssigned(props: {
  memberName: string
  prophecyTitle?: string
  viewUrl?: string
}) {
  return render(ProphecyAssigned(props))
}

export async function renderPasswordReset(props: {
  memberName: string
  resetUrl: string
  expiresIn?: string
}) {
  return render(PasswordReset(props))
}

export async function renderAnnouncement(props: {
  recipientName?: string
  title: string
  message: string
  ctaText?: string
  ctaUrl?: string
  imageUrl?: string
}) {
  return render(AnnouncementEmail(props))
}

export async function renderNewsletter(props: {
  recipientName?: string
  headline: string
  message: string
  sections?: Array<{
    title: string
    content: string
    linkText?: string
    linkUrl?: string
  }>
}) {
  return render(NewsletterEmail(props))
}

export async function renderEventInvitation(props: {
  recipientName?: string
  eventTitle: string
  eventDate: string
  eventTime: string
  eventLocation: string
  eventDescription: string
  rsvpUrl?: string
  imageUrl?: string
}) {
  return render(EventInvitationEmail(props))
}

export async function renderUrgent(props: {
  recipientName?: string
  title: string
  message: string
  actionText?: string
  actionUrl?: string
  urgencyLevel?: 'high' | 'medium' | 'low'
}) {
  return render(UrgentEmail(props))
}

// Personalization helper - replaces {{firstName}}, {{lastName}}, etc in text
export function personalize(text: string, data: { firstName?: string; lastName?: string; email?: string }) {
  return text
    .replace(/\{\{firstName\}\}/g, data.firstName || '')
    .replace(/\{\{first_name\}\}/g, data.firstName || '')
    .replace(/\{\{lastName\}\}/g, data.lastName || '')
    .replace(/\{\{last_name\}\}/g, data.lastName || '')
    .replace(/\{\{email\}\}/g, data.email || '')
}
