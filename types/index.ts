export interface Mission {
  id: string
  country: string
  flag: string
  description: string
  impact: string
  image?: string
}

export interface Teaching {
  id: string
  title: string
  speaker: string
  duration: string
  thumbnail: string
  date: Date
  category?: string
}

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'member' | 'admin'
}
