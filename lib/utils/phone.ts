export function formatPhoneE164(phone: string): string | null {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')

  // US/Canada: Assume +1 if 10 digits
  if (cleaned.length === 10) {
    return `+1${cleaned}`
  }

  // Already has country code
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`
  }

  // International numbers with country code
  if (cleaned.length > 11) {
    return `+${cleaned}`
  }

  // Invalid
  return null
}

export function isValidPhone(phone: string): boolean {
  const formatted = formatPhoneE164(phone)
  return formatted !== null && formatted.length >= 12
}

export function formatPhoneDisplay(phone: string): string {
  // Format as (123) 456-7890 for US numbers
  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }

  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }

  // Return as-is for international numbers
  return phone
}

export function calculateSMSParts(message: string): number {
  // Standard SMS: 160 characters per part
  // With unicode characters: 70 characters per part
  const hasUnicode = /[^\x00-\x7F]/.test(message)
  const limit = hasUnicode ? 70 : 160

  if (message.length === 0) return 0
  return Math.ceil(message.length / limit)
}
