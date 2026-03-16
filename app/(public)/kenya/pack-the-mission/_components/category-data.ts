export type ItemSourcing = 'us' | 'kenya'

export interface SupplyItem {
  name: string
  qty: string
  value: string
  fundAmount: number // Stripe checkout price (includes ~15-20% logistics margin)
  sourcing: ItemSourcing // 'us' = bring/ship from US, 'kenya' = we'll purchase on the ground
}

export interface SupplyCategory {
  id: string
  name: string
  desc: string
  icon: string
  colorClass: string
  items: SupplyItem[]
}

export interface SponsorshipItem {
  id: string
  name: string
  description: string
  amount: number
  frequency: 'one_time' | 'monthly'
  icon: string
}

// Trip departs April 23 — items must be received ~2-3 weeks before
export const ITEM_DEADLINE = 'April 15, 2026'
export const TRIP_DEPARTURE = 'April 23, 2026'

// Sourcing logic:
//   'us'    = Better quality/price from US refurb market, specific brands, or specialty items
//   'kenya' = Cheaper locally, heavy/bulky to fly, or supports the Kenyan economy
//
// Prices include ~15-20% margin for coordination, logistics, and delivery assurance.
export const categories: SupplyCategory[] = [
  {
    id: 'tech',
    name: 'Technology & Equipment',
    desc: 'Tools that open doors',
    icon: '💻',
    colorClass: 'tech',
    items: [
      { name: 'Refurbished Laptops', qty: 'Need 10', value: '$400–575 ea', fundAmount: 475, sourcing: 'us' },
      { name: 'Tablets / iPads', qty: 'Need 8', value: '$175–350 ea', fundAmount: 250, sourcing: 'us' },
      { name: 'Smartphones', qty: 'Need 12', value: '$60–175 ea', fundAmount: 100, sourcing: 'us' },
      { name: 'Digital Cameras', qty: 'Need 3', value: '$95–240 ea', fundAmount: 150, sourcing: 'us' },
      { name: 'SD Cards (64GB+)', qty: 'Need 15', value: '$12 ea', fundAmount: 12, sourcing: 'us' },
      { name: 'USB Drives (32GB+)', qty: 'Need 25', value: '$6 ea', fundAmount: 6, sourcing: 'us' },
      { name: 'Power Banks', qty: 'Need 15', value: '$18–30 ea', fundAmount: 25, sourcing: 'us' },
      { name: 'Universal Chargers', qty: 'Need 10', value: '$12 ea', fundAmount: 12, sourcing: 'us' },
    ],
  },
  {
    id: 'hygiene',
    name: 'Hygiene & Personal Care',
    desc: 'Dignity in the details',
    icon: '🧴',
    colorClass: 'hygiene',
    items: [
      { name: 'Toothbrushes (bulk packs)', qty: 'Need 200', value: '$1 ea', fundAmount: 1, sourcing: 'kenya' },
      { name: 'Toothpaste', qty: 'Need 100 tubes', value: '$1.50 ea', fundAmount: 2, sourcing: 'kenya' },
      { name: 'Bar Soap', qty: 'Need 150', value: '$1 ea', fundAmount: 1, sourcing: 'kenya' },
      { name: 'Deodorant', qty: 'Need 80', value: '$2.50 ea', fundAmount: 3, sourcing: 'us' },
      { name: 'Feminine Hygiene Products', qty: 'Need 100 packs', value: '$4 ea', fundAmount: 4, sourcing: 'us' },
      { name: 'Hand Sanitizer', qty: 'Need 50', value: '$2 ea', fundAmount: 2, sourcing: 'us' },
      { name: 'Washcloths', qty: 'Need 100', value: '$1.50 ea', fundAmount: 2, sourcing: 'kenya' },
    ],
  },
  {
    id: 'school',
    name: 'School & Office Supplies',
    desc: 'Equipping learners & leaders',
    icon: '📓',
    colorClass: 'school',
    items: [
      { name: 'Composition Notebooks', qty: 'Need 200', value: '$1.50 ea', fundAmount: 2, sourcing: 'kenya' },
      { name: 'Pens (bulk packs)', qty: 'Need 300', value: '$0.50 ea', fundAmount: 1, sourcing: 'kenya' },
      { name: 'Pencils & Sharpeners', qty: 'Need 200', value: '$0.50 ea', fundAmount: 1, sourcing: 'kenya' },
      { name: 'Backpacks', qty: 'Need 50', value: '$18–30 ea', fundAmount: 25, sourcing: 'kenya' },
      { name: 'Rulers & Geometry Sets', qty: 'Need 50', value: '$3 ea', fundAmount: 3, sourcing: 'kenya' },
      { name: 'Coloring Supplies', qty: 'Need 30 sets', value: '$6 ea', fundAmount: 6, sourcing: 'kenya' },
    ],
  },
  {
    id: 'medical-equipment',
    name: 'Medical Equipment & Diagnostics',
    desc: '1,000-patient medical camp',
    icon: '🩺',
    colorClass: 'medical',
    items: [
      { name: 'Blood Pressure Monitors', qty: 'Need 12', value: '$25–40 ea', fundAmount: 35, sourcing: 'us' },
      { name: 'Stethoscopes', qty: 'Need 12', value: '$15–30 ea', fundAmount: 25, sourcing: 'us' },
      { name: 'Pulse Oximeters', qty: 'Need 10', value: '$20–35 ea', fundAmount: 30, sourcing: 'us' },
      { name: 'Blood Glucose Monitors', qty: 'Need 8', value: '$25 ea', fundAmount: 25, sourcing: 'us' },
      { name: 'Glucose Test Strips', qty: 'Need 500', value: '$0.50 ea', fundAmount: 1, sourcing: 'us' },
      { name: 'Rapid Malaria Test Kits (RDTs)', qty: 'Need 300', value: '$1.50 ea', fundAmount: 2, sourcing: 'kenya' },
      { name: 'Otoscopes', qty: 'Need 5', value: '$25 ea', fundAmount: 25, sourcing: 'us' },
      { name: 'Digital Thermometers', qty: 'Need 15', value: '$6 ea', fundAmount: 6, sourcing: 'us' },
      { name: 'Reading Glasses (assorted)', qty: 'Need 200', value: '$4 ea', fundAmount: 4, sourcing: 'kenya' },
      { name: 'MUAC Tapes (malnutrition)', qty: 'Need 50', value: '$2 ea', fundAmount: 2, sourcing: 'kenya' },
      { name: 'Pregnancy Test Kits', qty: 'Need 100', value: '$1 ea', fundAmount: 1, sourcing: 'kenya' },
      { name: 'Urine Dipstick Tests', qty: 'Need 200', value: '$0.75 ea', fundAmount: 1, sourcing: 'us' },
    ],
  },
  {
    id: 'medical-supplies',
    name: 'Medications & Medical Consumables',
    desc: 'Supplies for 1,000 patients',
    icon: '💊',
    colorClass: 'medical',
    items: [
      { name: 'OTC Pain Relievers (Ibuprofen/Acetaminophen)', qty: 'Need 200 bottles', value: '$6 ea', fundAmount: 6, sourcing: 'us' },
      { name: 'Oral Rehydration Salts (ORS)', qty: 'Need 500 packets', value: '$0.50 ea', fundAmount: 1, sourcing: 'kenya' },
      { name: 'Multivitamins (adult + child)', qty: 'Need 1,000', value: '$0.25 ea', fundAmount: 1, sourcing: 'kenya' },
      { name: 'Deworming Tablets (Albendazole)', qty: 'Need 500', value: '$0.30 ea', fundAmount: 1, sourcing: 'kenya' },
      { name: 'Antibiotic Ointment', qty: 'Need 200 tubes', value: '$3 ea', fundAmount: 3, sourcing: 'us' },
      { name: 'Antifungal Cream', qty: 'Need 100 tubes', value: '$4 ea', fundAmount: 4, sourcing: 'us' },
      { name: 'Eye Drops', qty: 'Need 100 bottles', value: '$3 ea', fundAmount: 3, sourcing: 'us' },
      { name: 'Cough & Cold Medicine', qty: 'Need 100 bottles', value: '$5 ea', fundAmount: 5, sourcing: 'us' },
      { name: 'First Aid Kits (pre-assembled)', qty: 'Need 20', value: '$18 ea', fundAmount: 18, sourcing: 'us' },
      { name: 'Disposable Gloves', qty: 'Need 2,000 pairs', value: '$0.10 ea', fundAmount: 8, sourcing: 'us' },
      { name: 'Face Masks', qty: 'Need 500', value: '$0.15 ea', fundAmount: 8, sourcing: 'us' },
      { name: 'Bandages & Gauze', qty: 'Need 500 packs', value: '$3 ea', fundAmount: 3, sourcing: 'us' },
      { name: 'Antiseptic Solution (Betadine)', qty: 'Need 50 bottles', value: '$6 ea', fundAmount: 6, sourcing: 'us' },
      { name: 'Medical Tape', qty: 'Need 50 rolls', value: '$3 ea', fundAmount: 3, sourcing: 'us' },
      { name: 'Sharps Containers', qty: 'Need 20', value: '$8 ea', fundAmount: 8, sourcing: 'us' },
      { name: 'Biohazard Waste Bags', qty: 'Need 100', value: '$1.50 ea', fundAmount: 2, sourcing: 'us' },
    ],
  },
  {
    id: 'general',
    name: 'General & Community',
    desc: 'Everything else that matters',
    icon: '🤝',
    colorClass: 'general',
    items: [
      { name: "Children's Clothing", qty: 'Assorted sizes', value: 'Gently used ok', fundAmount: 10, sourcing: 'us' },
      { name: 'Athletic Shoes', qty: 'Need 40 pairs', value: '$18–35 ea', fundAmount: 25, sourcing: 'kenya' },
      { name: 'Sunglasses', qty: 'Need 30', value: '$4 ea', fundAmount: 4, sourcing: 'us' },
      { name: 'Reusable Water Bottles', qty: 'Need 50', value: '$6 ea', fundAmount: 6, sourcing: 'kenya' },
      { name: 'Flashlights', qty: 'Need 20', value: '$6 ea', fundAmount: 6, sourcing: 'kenya' },
      { name: 'Sewing Kits', qty: 'Need 15', value: '$6 ea', fundAmount: 6, sourcing: 'kenya' },
    ],
  },
]

export const sponsorshipItems: SponsorshipItem[] = [
  {
    id: 'sponsor-student',
    name: 'Sponsor a Student',
    description: 'Cover school fees, uniforms, books, and supplies for one student. Comparable to Compassion International ($43/mo) — your support keeps a child in school.',
    amount: 45,
    frequency: 'monthly',
    icon: '🎓',
  },
  {
    id: 'sponsor-orphan',
    name: 'Sponsor an Orphan',
    description: 'Provide food, shelter, clothing, education, and basic medical care for one orphan through our local partners in Kenya.',
    amount: 75,
    frequency: 'monthly',
    icon: '💛',
  },
  {
    id: 'school-partnership',
    name: 'School Partnership',
    description: 'Fully equip a rural school (~200 students, 6-8 classrooms) with desks, whiteboards, textbooks, and teaching materials.',
    amount: 7500,
    frequency: 'one_time',
    icon: '🏫',
  },
  {
    id: 'classroom-kit',
    name: 'Classroom Kit',
    description: 'Furnish one classroom for 40 students — desks, whiteboard, markers, exercise books, and learning materials.',
    amount: 1500,
    frequency: 'one_time',
    icon: '📚',
  },
  {
    id: 'school-lunch',
    name: 'School Lunch Program',
    description: 'Feed ~200 students at one school for a full month — 20 school days of nutritious meals that fuel learning.',
    amount: 800,
    frequency: 'monthly',
    icon: '🍽️',
  },
  {
    id: 'library-starter',
    name: 'Library Starter Kit',
    description: '500+ books, shelving, reading tables, and setup — only 2% of Kenyan public schools have libraries.',
    amount: 3000,
    frequency: 'one_time',
    icon: '📖',
  },
]

export const fundTiers = [
  { amount: 25, desc: 'Backpack + notebooks + pens for one student', impact: '1 student fully equipped for school' },
  { amount: 50, desc: 'Hygiene kits for 25 people — soap, toothbrush, sanitizer', impact: 'Dignity for a whole classroom' },
  { amount: 100, desc: 'A smartphone for a student or community leader', impact: 'Connection that opens doors' },
  { amount: 250, desc: 'A tablet for a classroom + power bank + charger', impact: 'Technology for an entire learning group' },
  { amount: 500, desc: 'A refurbished laptop + accessories for a school', impact: 'One device can train dozens of students' },
  { amount: 1000, desc: 'Full medical supply kit + tech for a community', impact: 'First aid, glasses, meds + a laptop' },
]

export const categoryColors: Record<string, { bg: string; fill: string; icon: string }> = {
  tech: {
    bg: 'bg-blue-50',
    fill: 'bg-gradient-to-r from-blue-600 to-blue-400',
    icon: 'bg-blue-100',
  },
  hygiene: {
    bg: 'bg-green-50',
    fill: 'bg-gradient-to-r from-green-600 to-green-400',
    icon: 'bg-green-100',
  },
  school: {
    bg: 'bg-gold/5',
    fill: 'bg-gradient-to-r from-gold-dark to-gold',
    icon: 'bg-gold/15',
  },
  medical: {
    bg: 'bg-red-50',
    fill: 'bg-gradient-to-r from-red-600 to-red-400',
    icon: 'bg-red-100',
  },
  general: {
    bg: 'bg-purple-50',
    fill: 'bg-gradient-to-r from-purple-600 to-purple-400',
    icon: 'bg-purple-100',
  },
}
