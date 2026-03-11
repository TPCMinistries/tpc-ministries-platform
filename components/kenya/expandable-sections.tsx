'use client'

import { useState } from 'react'
import {
  Heart,
  GraduationCap,
  Stethoscope,
  Briefcase,
  ChevronDown,
  Building2,
  Droplets,
  TreePine,
  Church,
} from 'lucide-react'

const serviceAreas = [
  {
    id: 'ministry',
    title: 'Ministry & Spiritual Care',
    icon: Heart,
    description: 'Teaching, preaching, prayer ministry, and pastoral support for local churches across all three cities.',
    details: {
      overview: 'Partner with Kenyan pastors and church leaders to provide spiritual encouragement, prophetic ministry, and practical support for growing congregations. This track runs across Nairobi, Kakamega, and Mombasa.',
      activities: [
        'Pastoral conferences and leadership training',
        'Prayer, worship, and prophetic ministry',
        'Church planting and strengthening support',
        'Community evangelism and outreach',
        'Facilitate teaching and discipleship programs',
      ],
      idealFor: 'Pastors, ministers, intercessors, worship leaders, and those with gifts in teaching or prophecy.',
      impact: 'You will strengthen local church leadership and leave behind resources that continue to build up the Body of Christ long after you return home.',
    },
  },
  {
    id: 'health',
    title: 'Health & Wellness',
    icon: Stethoscope,
    description: 'Healthcare outreach, workforce development, and health education in underserved communities.',
    details: {
      overview: 'Led by Dr. Michele Y. Griffith, this track brings hope and healing to communities with limited healthcare access through workforce development, community health outreach, and medical leadership roundtables.',
      activities: [
        'Healthcare workforce development programs',
        'Community health outreach clinics',
        'Medical leadership roundtables',
        'Hospital and partner engagement',
        'Health education and prevention workshops',
      ],
      idealFor: 'Doctors, nurses, EMTs, pharmacists, dentists, public health professionals, and healthcare students.',
      impact: 'Many rural Kenyans travel hours to reach medical facilities. Your service brings care directly to those in need and strengthens the local healthcare workforce.',
    },
  },
  {
    id: 'education',
    title: 'Education & Technology',
    icon: GraduationCap,
    description: 'Digital literacy, teacher development, STEM workshops, and youth mentorship programs.',
    details: {
      overview: 'Equip Kenya\'s next generation with digital skills, technology access, and practical education. This track focuses on bridging the digital divide and building sustainable education infrastructure.',
      activities: [
        'Digital literacy and technology training',
        'Teacher development and school partnerships',
        'Youth mentorship and career readiness programs',
        'STEM workshops and computer lab setup',
        'Financial literacy and life skills education',
      ],
      idealFor: 'Teachers, tech professionals, youth pastors, mentors, coaches, and anyone passionate about education and technology.',
      impact: 'Many Kenyan students lack access to technology and digital skills. Your investment helps them build a foundation for future success in a connected world.',
    },
  },
  {
    id: 'business',
    title: 'Business & Economic Empowerment',
    icon: Briefcase,
    description: 'Investment conferences, entrepreneur mentorship, and cross-border economic partnerships.',
    details: {
      overview: 'Two 1-day business conferences — one in Nairobi and one in Mombasa — designed to create real deals, real investments, and real economic movement. Where capital meets opportunity.',
      activities: [
        'Investor pitch sessions with vetted Kenyan companies',
        'Entrepreneurship and scaling strategies',
        'Access to capital — connecting founders with investors',
        'Cross-border partnership and market entry strategy',
        'Leadership and organizational development',
        'Technology and digital business tools for East Africa',
      ],
      idealFor: 'Investors, business owners, entrepreneurs, consultants, and professionals with business expertise seeking African market exposure.',
      impact: 'These conferences create economic infrastructure. Investment commitments, partnership agreements, and mentorship pairings that produce real returns long after the trip.',
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
        'Business conference — investor pitch sessions and partnerships (April 24)',
        'Church services and pastoral conferences',
        'Youth leadership and mentorship programs',
        'Medical outreach in underserved communities',
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
        'Business conference — coastal companies and trade partnerships (May 1–4)',
        'Community health education and outreach',
        'Children\'s ministry and education support',
        'Pastoral care and church strengthening',
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
    <div className="grid md:grid-cols-2 gap-6">
      {serviceAreas.map((area) => {
        const isExpanded = expandedId === area.id
        const Icon = area.icon

        return (
          <div
            key={area.id}
            className={`group bg-cream rounded-2xl border transition-all duration-300 cursor-pointer ${
              isExpanded
                ? 'bg-gold/5 border-gold shadow-lg col-span-1 md:col-span-2'
                : 'border-navy/10 hover:border-gold hover:bg-gold/5'
            }`}
            onClick={() => setExpandedId(isExpanded ? null : area.id)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0">
                    <Icon className="h-7 w-7 text-gold-dark" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-navy mb-1">{area.title}</h3>
                    <p className="text-navy/60 text-sm leading-relaxed">{area.description}</p>
                  </div>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-navy/40 transition-transform duration-300 flex-shrink-0 ml-4 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </div>

              {isExpanded && (
                <div className="mt-6 pt-6 border-t border-gold/30">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold text-navy mb-3">Overview</h4>
                      <p className="text-navy/60 text-sm leading-relaxed mb-6">
                        {area.details.overview}
                      </p>

                      <h4 className="font-semibold text-navy mb-3">Ideal For</h4>
                      <p className="text-navy/60 text-sm leading-relaxed">
                        {area.details.idealFor}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy mb-3">What You&apos;ll Do</h4>
                      <ul className="space-y-2">
                        {area.details.activities.map((activity, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-navy/60">
                            <span className="w-1.5 h-1.5 bg-gold rounded-full mt-2 flex-shrink-0"></span>
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-gold/10 rounded-xl">
                    <p className="text-navy/70 text-sm">
                      <strong className="text-gold-dark">Your Impact:</strong> {area.details.impact}
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
                ? 'bg-white/10 border-gold shadow-xl col-span-1 md:col-span-3'
                : 'bg-white/5 border-white/10 hover:border-gold/50 hover:bg-white/10'
            }`}
            onClick={() => setExpandedId(isExpanded ? null : city.id)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="h-7 w-7 text-gold" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{city.name}</h3>
                    <p className="text-gold text-sm font-medium">{city.subtitle}</p>
                    {!isExpanded && (
                      <p className="text-white/40 text-sm mt-2 leading-relaxed line-clamp-2">
                        {city.overview}
                      </p>
                    )}
                  </div>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-white/40 transition-transform duration-300 flex-shrink-0 ml-4 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </div>

              {isExpanded && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-white/60 leading-relaxed mb-6">{city.overview}</p>

                  <div className="grid md:grid-cols-3 gap-8">
                    <div>
                      <div className="mb-4">
                        <span className="text-gold text-sm font-semibold uppercase tracking-wider">Population</span>
                        <p className="text-white font-medium mt-1">{city.details.population}</p>
                      </div>
                      <div>
                        <span className="text-gold text-sm font-semibold uppercase tracking-wider">Known For</span>
                        <p className="text-white/60 text-sm mt-1">{city.details.knownFor}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-gold text-sm font-semibold uppercase tracking-wider">Key Needs</span>
                      <ul className="mt-2 space-y-2">
                        {city.details.needs.map((need, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                            <span className="w-1.5 h-1.5 bg-gold rounded-full mt-2 flex-shrink-0"></span>
                            {need}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="text-gold text-sm font-semibold uppercase tracking-wider">Our Activities</span>
                      <ul className="mt-2 space-y-2">
                        {city.details.activities.map((activity, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                            <span className="w-1.5 h-1.5 bg-gold rounded-full mt-2 flex-shrink-0"></span>
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-black/20 rounded-xl border border-white/10">
                    <div className="flex items-start gap-3">
                      <Church className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                      <p className="text-white/60 text-sm">
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
