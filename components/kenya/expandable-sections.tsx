'use client'

import { useState } from 'react'
import {
  Heart,
  GraduationCap,
  Stethoscope,
  Briefcase,
  Wheat,
  Package,
  MapPin,
  ChevronDown,
  Users,
  Building2,
  Droplets,
  TreePine,
  Church,
  Factory,
} from 'lucide-react'

const serviceAreas = [
  {
    id: 'ministry',
    title: 'Ministry & Spiritual Care',
    icon: Heart,
    description: 'Teaching, preaching, prayer ministry, and pastoral support for local churches.',
    details: {
      overview: 'Partner with Kenyan pastors and church leaders to provide spiritual encouragement, prophetic ministry, and practical support for growing congregations.',
      activities: [
        'Preach and teach at local church services and conferences',
        'Lead prayer and deliverance ministry sessions',
        'Conduct pastoral care and counseling training',
        'Support church leadership development',
        'Facilitate worship and intercession gatherings',
      ],
      idealFor: 'Pastors, ministers, intercessors, worship leaders, and those with gifts in teaching or prophecy.',
      impact: 'You will strengthen local church leadership and leave behind resources that continue to build up the Body of Christ long after you return home.',
    },
  },
  {
    id: 'education',
    title: 'Education & Youth',
    icon: GraduationCap,
    description: 'Mentorship, financial literacy training, and leadership development for young people.',
    details: {
      overview: 'Invest in Kenya\'s next generation by teaching practical life skills, biblical principles, and leadership foundations to students and young adults.',
      activities: [
        'Teach financial literacy and stewardship workshops',
        'Lead youth leadership development sessions',
        'Mentor students in career and life planning',
        'Conduct after-school programs and tutoring',
        'Facilitate team-building and character development activities',
      ],
      idealFor: 'Teachers, youth pastors, mentors, coaches, financial professionals, and anyone passionate about investing in young people.',
      impact: 'Many Kenyan youth lack access to practical life skills training. Your investment helps them build a foundation for future success.',
    },
  },
  {
    id: 'medical',
    title: 'Medical Missions',
    icon: Stethoscope,
    description: 'Healthcare outreach, clinics, and health education in underserved communities.',
    details: {
      overview: 'Bring hope and healing to communities with limited healthcare access through mobile clinics, health screenings, and preventive care education.',
      activities: [
        'Conduct health screenings and basic medical assessments',
        'Provide first aid and primary care services',
        'Lead health education workshops (hygiene, nutrition, disease prevention)',
        'Distribute medical supplies and medications',
        'Train local health workers in basic care protocols',
      ],
      idealFor: 'Doctors, nurses, EMTs, pharmacists, dentists, public health professionals, and healthcare students.',
      impact: 'Many rural Kenyans travel hours to reach medical facilities. Your service brings care directly to those in need.',
    },
  },
  {
    id: 'business',
    title: 'Business Development',
    icon: Briefcase,
    description: 'Entrepreneurship training, business mentorship, and economic empowerment.',
    details: {
      overview: 'Empower Kenyan entrepreneurs and small business owners with the knowledge and skills to build sustainable enterprises that transform their communities.',
      activities: [
        'Teach business planning and strategy workshops',
        'Provide one-on-one mentorship to local entrepreneurs',
        'Lead marketing and sales training sessions',
        'Facilitate microfinance and savings group education',
        'Consult with existing businesses on growth strategies',
      ],
      idealFor: 'Business owners, entrepreneurs, consultants, marketers, accountants, and professionals with business expertise.',
      impact: 'Economic empowerment creates lasting change. When businesses thrive, families are fed, children go to school, and communities flourish.',
    },
  },
  {
    id: 'food-security',
    title: 'Food Security',
    icon: Wheat,
    description: 'Agricultural initiatives, farming support, and sustainable food systems.',
    details: {
      overview: 'Address food insecurity at its root by teaching sustainable farming practices, supporting local agriculture, and building community gardens.',
      activities: [
        'Teach sustainable farming and irrigation techniques',
        'Help establish community and school gardens',
        'Train families in food preservation methods',
        'Support poultry and livestock management projects',
        'Educate on nutrition and meal planning with local foods',
      ],
      idealFor: 'Farmers, agricultural specialists, nutritionists, environmental scientists, and anyone passionate about food justice.',
      impact: 'With proper training, families can grow enough food to feed themselves year-round and generate income from surplus.',
    },
  },
  {
    id: 'material',
    title: 'Material Support',
    icon: Package,
    description: 'Distribution of clothing, medical supplies, and educational resources.',
    details: {
      overview: 'Organize and distribute donated materials to families, schools, churches, and medical facilities where they are needed most.',
      activities: [
        'Sort and organize donated materials for distribution',
        'Coordinate distribution events in communities',
        'Deliver supplies to schools and orphanages',
        'Pack and distribute hygiene kits and school supplies',
        'Document and track material distribution for accountability',
      ],
      idealFor: 'Anyone with a heart to serve! This track welcomes all skill levels and ages.',
      impact: 'A simple pair of shoes, a school uniform, or basic medical supplies can dramatically improve a child\'s quality of life.',
    },
  },
]

const cities = [
  {
    id: 'nairobi',
    name: 'Nairobi',
    subtitle: 'The Capital City',
    icon: Building2,
    overview: 'Kenya\'s bustling capital and largest city, home to over 4.4 million people. A city of contrasts where modern skyscrapers stand alongside informal settlements.',
    details: {
      population: '4.4 million (metro area: 9+ million)',
      knownFor: 'East Africa\'s economic hub, tech innovation ("Silicon Savannah"), Nairobi National Park',
      ministry: 'We partner with churches and organizations serving in Kibera (Africa\'s largest urban slum), Mathare, and surrounding communities.',
      needs: [
        'Youth unemployment and lack of vocational training',
        'Healthcare access in informal settlements',
        'Education resources for under-resourced schools',
        'Business mentorship for emerging entrepreneurs',
        'Pastoral support for growing churches',
      ],
      activities: [
        'Church services and pastoral conferences',
        'Youth leadership and mentorship programs',
        'Medical outreach in underserved communities',
        'Business development workshops',
      ],
    },
  },
  {
    id: 'mombasa',
    name: 'Mombasa',
    subtitle: 'The Coastal City',
    icon: Droplets,
    overview: 'Kenya\'s second-largest city and major port on the Indian Ocean. A historic trading hub with rich Swahili culture and a diverse population.',
    details: {
      population: '1.2 million (county: 1.5 million)',
      knownFor: 'Historic Old Town (UNESCO tentative site), Fort Jesus, beautiful beaches, major shipping port',
      ministry: 'We serve alongside coastal churches reaching communities in Likoni, Changamwe, and surrounding areas.',
      needs: [
        'Economic opportunities beyond tourism',
        'Clean water access in outlying areas',
        'Education and literacy programs',
        'Healthcare for remote fishing communities',
        'Church planting and pastoral training',
      ],
      activities: [
        'Community health education',
        'Children\'s ministry and education support',
        'Pastoral care and church strengthening',
        'Food security and nutrition programs',
      ],
    },
  },
  {
    id: 'kakamega',
    name: 'Kakamega',
    subtitle: 'The Rural Heartland',
    icon: TreePine,
    overview: 'Located in western Kenya near the Kakamega Forest (Kenya\'s last tropical rainforest). An agricultural region with significant rural poverty.',
    details: {
      population: '100,000 (county: 1.9 million)',
      knownFor: 'Kakamega Rainforest, agricultural production, sugarcane farming, traditional Luhya culture',
      ministry: 'We partner with rural churches and communities to address agricultural, educational, and spiritual needs.',
      needs: [
        'Sustainable farming techniques and food security',
        'Clean water and sanitation',
        'Medical care in remote villages',
        'School supplies and educational support',
        'Economic development for farming families',
      ],
      activities: [
        'Agricultural training and demonstration farms',
        'Village medical outreach clinics',
        'School partnerships and supply distribution',
        'Church conferences and pastoral training',
        'Women\'s empowerment programs',
      ],
    },
  },
]

export function ExpandableServiceTracks() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {serviceAreas.map((area) => {
        const isExpanded = expandedId === area.id
        const Icon = area.icon

        return (
          <div
            key={area.id}
            className={`group bg-stone-50 rounded-2xl border transition-all duration-300 cursor-pointer ${
              isExpanded
                ? 'bg-amber-50 border-amber-300 shadow-lg col-span-1 md:col-span-2 lg:col-span-3'
                : 'border-stone-200 hover:border-amber-300 hover:bg-amber-50'
            }`}
            onClick={() => setExpandedId(isExpanded ? null : area.id)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0">
                    <Icon className="h-7 w-7 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-900 mb-1">{area.title}</h3>
                    <p className="text-stone-600 text-sm leading-relaxed">{area.description}</p>
                  </div>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-stone-400 transition-transform duration-300 flex-shrink-0 ml-4 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </div>

              {isExpanded && (
                <div className="mt-6 pt-6 border-t border-amber-200">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold text-stone-900 mb-3">Overview</h4>
                      <p className="text-stone-600 text-sm leading-relaxed mb-6">
                        {area.details.overview}
                      </p>

                      <h4 className="font-semibold text-stone-900 mb-3">Ideal For</h4>
                      <p className="text-stone-600 text-sm leading-relaxed">
                        {area.details.idealFor}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-stone-900 mb-3">What You will Do</h4>
                      <ul className="space-y-2">
                        {area.details.activities.map((activity, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-amber-100/50 rounded-xl">
                    <p className="text-stone-700 text-sm">
                      <strong className="text-amber-700">Your Impact:</strong> {area.details.impact}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function ExpandableCities() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {cities.map((city) => {
        const isExpanded = expandedId === city.id
        const Icon = city.icon

        return (
          <div
            key={city.id}
            className={`group rounded-2xl border transition-all duration-300 cursor-pointer ${
              isExpanded
                ? 'bg-stone-800 border-amber-500 shadow-xl col-span-1 md:col-span-3'
                : 'bg-stone-800/50 border-stone-700 hover:border-amber-500/50 hover:bg-stone-800'
            }`}
            onClick={() => setExpandedId(isExpanded ? null : city.id)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="h-7 w-7 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{city.name}</h3>
                    <p className="text-amber-400 text-sm font-medium">{city.subtitle}</p>
                    {!isExpanded && (
                      <p className="text-stone-400 text-sm mt-2 leading-relaxed line-clamp-2">
                        {city.overview}
                      </p>
                    )}
                  </div>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-stone-400 transition-transform duration-300 flex-shrink-0 ml-4 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </div>

              {isExpanded && (
                <div className="mt-6 pt-6 border-t border-stone-700">
                  <p className="text-stone-300 leading-relaxed mb-6">{city.overview}</p>

                  <div className="grid md:grid-cols-3 gap-8">
                    <div>
                      <div className="mb-4">
                        <span className="text-amber-400 text-sm font-semibold uppercase tracking-wider">Population</span>
                        <p className="text-white font-medium mt-1">{city.details.population}</p>
                      </div>
                      <div>
                        <span className="text-amber-400 text-sm font-semibold uppercase tracking-wider">Known For</span>
                        <p className="text-stone-300 text-sm mt-1">{city.details.knownFor}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-amber-400 text-sm font-semibold uppercase tracking-wider">Key Needs</span>
                      <ul className="mt-2 space-y-2">
                        {city.details.needs.map((need, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-stone-300">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                            {need}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="text-amber-400 text-sm font-semibold uppercase tracking-wider">Our Activities</span>
                      <ul className="mt-2 space-y-2">
                        {city.details.activities.map((activity, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-stone-300">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-stone-900/50 rounded-xl border border-stone-700">
                    <div className="flex items-start gap-3">
                      <Church className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-stone-300 text-sm">
                        <strong className="text-white">Our Partnership:</strong> {city.details.ministry}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
