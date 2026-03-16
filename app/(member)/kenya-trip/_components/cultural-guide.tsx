'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function CulturalGuide() {
  return (
    <div className="space-y-6">
      {/* Swahili Basics */}
      <Card>
        <CardHeader>
          <CardTitle>Swahili Essentials</CardTitle>
          <p className="text-sm text-gray-500">You&apos;ll use these daily. Kenyans love when visitors try Swahili!</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              ['Hello', 'Jambo / Habari'],
              ['How are you?', 'Habari yako?'],
              ['I\'m fine', 'Mzuri sana'],
              ['Thank you', 'Asante (sana)'],
              ['Please', 'Tafadhali'],
              ['Yes / No', 'Ndiyo / Hapana'],
              ['Welcome', 'Karibu'],
              ['Friend', 'Rafiki'],
              ['God bless you', 'Mungu akubariki'],
              ['No problem', 'Hakuna matata'],
              ['How much?', 'Bei gani?'],
              ['Goodbye', 'Kwaheri'],
            ].map(([english, swahili]) => (
              <div key={english} className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">{english}</span>
                <span className="font-medium text-navy">{swahili}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cultural Do's and Don'ts */}
      <Card>
        <CardHeader>
          <CardTitle>Cultural Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold text-green-700 mb-1.5">Do</p>
              <ul className="space-y-1 text-gray-600">
                <li>Greet people warmly &mdash; handshakes are common, sometimes lengthy</li>
                <li>Use your right hand for handshakes, giving, and receiving</li>
                <li>Dress modestly for church services (no shorts, cover shoulders)</li>
                <li>Ask permission before photographing people, especially children</li>
                <li>Accept offered food/drink graciously &mdash; it&apos;s a sign of hospitality</li>
                <li>Remove shoes when entering someone&apos;s home</li>
                <li>Be patient &mdash; &quot;Kenya time&quot; runs differently than US time</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-red-700 mb-1.5">Don&apos;t</p>
              <ul className="space-y-1 text-gray-600">
                <li>Don&apos;t point with your index finger &mdash; use an open hand</li>
                <li>Don&apos;t eat with your left hand in traditional settings</li>
                <li>Don&apos;t photograph military/police installations</li>
                <li>Don&apos;t display large amounts of cash</li>
                <li>Don&apos;t drink tap water &mdash; bottled water only</li>
                <li>Don&apos;t discuss politics with strangers</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-navy mb-1.5">Good to Know</p>
              <ul className="space-y-1 text-gray-600">
                <li>Currency: Kenyan Shilling (KES). ~150 KES = $1 USD</li>
                <li>M-Pesa (mobile money) is everywhere &mdash; your guide can help</li>
                <li>Power outlets: Type G (UK-style, 3 rectangular prongs). Bring adapters.</li>
                <li>WiFi is available in hotels/cities but spotty in rural Kakamega</li>
                <li>Tipping: 10% at restaurants. Small tips for porters/drivers appreciated.</li>
                <li>Malaria risk exists &mdash; take prescribed prophylaxis</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Travel Day Quick Reference */}
      <Card className="border-sky-200 bg-sky-50/50">
        <CardHeader>
          <CardTitle>Travel Day Essentials</CardTitle>
          <p className="text-sm text-gray-500">For your departure from the US</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-sky-800 mb-1">Meeting Point</p>
              <p className="text-gray-600">JFK Terminal 4 &mdash; look for the TPC team (we&apos;ll have a WhatsApp check-in)</p>
            </div>
            <div>
              <p className="font-semibold text-sky-800 mb-1">Carry-On Must-Haves</p>
              <p className="text-gray-600">Passport, visa docs, medications, phone charger, change of clothes, snacks, neck pillow, pen (for customs form)</p>
            </div>
            <div>
              <p className="font-semibold text-sky-800 mb-1">Before You Board</p>
              <p className="text-gray-600">Download offline maps (Google Maps &rarr; Kenya), WhatsApp must be installed, notify your bank of travel dates, activate international plan or plan to buy local SIM at JKIA</p>
            </div>
            <div>
              <p className="font-semibold text-sky-800 mb-1">Arriving at JKIA (Nairobi)</p>
              <p className="text-gray-600">Have your e-Visa ready on phone. Customs form filled out. Ground transport will be waiting. Don&apos;t exchange money at the airport &mdash; rates are better in town.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
