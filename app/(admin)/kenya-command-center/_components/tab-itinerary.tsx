'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar, Plus, MapPin, Plane, Home, Phone, User, Star
} from 'lucide-react'
import type { ItineraryItem, Flight, Lodging, Contact } from './types'

interface TabItineraryProps {
  itinerary: ItineraryItem[]
  flights: Flight[]
  lodging: Lodging[]
  contacts: Contact[]
  setShowItineraryModal: (show: boolean) => void
}

export function TabItinerary({
  itinerary, flights, lodging, contacts, setShowItineraryModal,
}: TabItineraryProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Schedule */}
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Trip Schedule</CardTitle>
          <Button size="sm" onClick={() => setShowItineraryModal(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Item
          </Button>
        </CardHeader>
        <CardContent>
          {itinerary.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No itinerary items yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.from(new Set(itinerary.map(i => i.date))).map(date => (
                <div key={date} className="border rounded-lg overflow-hidden">
                  <div className="bg-navy text-white px-4 py-2 font-medium">
                    Day {itinerary.find(i => i.date === date)?.day_number} - {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="divide-y">
                    {itinerary.filter(i => i.date === date).map(item => (
                      <div key={item.id} className="flex items-start gap-4 p-4">
                        <div className="w-16 text-sm text-gray-500">
                          {item.start_time?.slice(0, 5)}
                        </div>
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${
                          item.category === 'travel' ? 'bg-blue-500' :
                          item.category === 'ministry' ? 'bg-green-500' :
                          item.category === 'meals' ? 'bg-yellow-500' :
                          item.category === 'meeting' ? 'bg-purple-500' :
                          'bg-gray-400'
                        }`} />
                        <div className="flex-1">
                          <p className="font-medium text-navy">{item.title}</p>
                          {item.location && (
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {item.location}
                            </p>
                          )}
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Flights & Lodging */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5" /> Flights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {flights.length === 0 ? (
              <p className="text-gray-500 text-sm">No flights added</p>
            ) : (
              <div className="space-y-3">
                {flights.map(f => (
                  <div key={f.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{f.airline} {f.flight_number}</span>
                      <Badge variant="outline" className="text-xs">{f.direction}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {f.departure_airport} → {f.arrival_airport}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(f.departure_datetime).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" /> Lodging
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lodging.length === 0 ? (
              <p className="text-gray-500 text-sm">No lodging added</p>
            ) : (
              <div className="space-y-3">
                {lodging.map(l => (
                  <div key={l.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{l.name}</p>
                    <p className="text-sm text-gray-600">{l.city}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(l.check_in_date).toLocaleDateString()} - {new Date(l.check_out_date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" /> Local Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <p className="text-gray-500 text-sm">No contacts added</p>
            ) : (
              <div className="space-y-3">
                {contacts.slice(0, 5).map(c => (
                  <div key={c.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-navy/10 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-navy" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.role} • {c.city}</p>
                    </div>
                    {c.is_primary && (
                      <Star className="h-4 w-4 text-gold" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
