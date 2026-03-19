'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import type { Lodging } from '../types'

const HOTEL_BLOCK_STATUS_OPTIONS = ['⬜ Not started', '❓ Researching', '🔄 In progress', '✅ Confirmed']

const inputClasses = "bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none"
const selectClasses = "bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none cursor-pointer"
const thClasses = "text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide"

function computeNights(checkIn: string, checkOut: string): number {
  const d1 = new Date(checkIn)
  const d2 = new Date(checkOut)
  return Math.max(0, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)))
}

export interface HotelBlocksProps {
  lodging: Lodging[]
  updateLodgingField: (id: string, field: string, value: string | number) => void
  addLodging: (city: string, checkIn: string, checkOut: string) => void
}

export function HotelBlocks({
  lodging,
  updateLodgingField,
  addLodging,
}: HotelBlocksProps) {
  const [showAddHotel, setShowAddHotel] = useState(false)
  const [newHotelCity, setNewHotelCity] = useState('')
  const [newHotelCheckIn, setNewHotelCheckIn] = useState('')
  const [newHotelCheckOut, setNewHotelCheckOut] = useState('')

  const handleAddHotel = () => {
    if (newHotelCity.trim() && newHotelCheckIn && newHotelCheckOut) {
      addLodging(newHotelCity.trim(), newHotelCheckIn, newHotelCheckOut)
      setNewHotelCity('')
      setNewHotelCheckIn('')
      setNewHotelCheckOut('')
      setShowAddHotel(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-navy">
            🏨 Hotel Blocks ({lodging.length})
          </h3>
          <button
            type="button"
            onClick={() => setShowAddHotel(true)}
            className="px-3 py-1.5 text-[13px] font-medium bg-navy text-white rounded hover:bg-navy/90 transition-colors"
          >
            + Add Hotel Block
          </button>
        </div>

        {/* Add Hotel Block Inline Form */}
        {showAddHotel && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded border border-gray-200">
            <input
              type="text"
              placeholder="City"
              value={newHotelCity}
              onChange={(e) => setNewHotelCity(e.target.value)}
              className={`w-[120px] ${inputClasses}`}
              autoFocus
            />
            <input
              type="date"
              placeholder="Check-in"
              value={newHotelCheckIn}
              onChange={(e) => setNewHotelCheckIn(e.target.value)}
              className={`w-[140px] ${inputClasses}`}
            />
            <input
              type="date"
              placeholder="Check-out"
              value={newHotelCheckOut}
              onChange={(e) => setNewHotelCheckOut(e.target.value)}
              className={`w-[140px] ${inputClasses}`}
            />
            <button
              type="button"
              onClick={handleAddHotel}
              className="px-3 py-1.5 text-[13px] font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => { setShowAddHotel(false); setNewHotelCity(''); setNewHotelCheckIn(''); setNewHotelCheckOut('') }}
              className="px-3 py-1.5 text-[13px] font-medium bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ fontSize: '13px' }}>
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className={thClasses}>City</th>
                <th className={thClasses}>Check-in</th>
                <th className={thClasses}>Check-out</th>
                <th className={thClasses}>Nights</th>
                <th className={thClasses}>Property</th>
                <th className={thClasses}>Rooms</th>
                <th className={thClasses}>$/Night</th>
                <th className={thClasses}>Status</th>
                <th className={thClasses}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {lodging.map((l) => {
                const nights = computeNights(l.check_in_date, l.check_out_date)
                return (
                  <tr key={l.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="p-2.5">
                      <input
                        type="text"
                        defaultValue={l.city || ''}
                        onBlur={(e) => {
                          if (e.target.value !== (l.city || ''))
                            updateLodgingField(l.id, 'city', e.target.value)
                        }}
                        className={`w-[100px] ${inputClasses}`}
                      />
                    </td>
                    <td className="p-2.5">
                      <input
                        type="date"
                        defaultValue={l.check_in_date || ''}
                        onChange={(e) => updateLodgingField(l.id, 'check_in_date', e.target.value)}
                        className={`w-[130px] ${inputClasses}`}
                      />
                    </td>
                    <td className="p-2.5">
                      <input
                        type="date"
                        defaultValue={l.check_out_date || ''}
                        onChange={(e) => updateLodgingField(l.id, 'check_out_date', e.target.value)}
                        className={`w-[130px] ${inputClasses}`}
                      />
                    </td>
                    <td className="p-2.5 text-gray-600 text-center">{nights}</td>
                    <td className="p-2.5">
                      <input
                        type="text"
                        defaultValue={l.name || ''}
                        onBlur={(e) => {
                          if (e.target.value !== (l.name || ''))
                            updateLodgingField(l.id, 'name', e.target.value)
                        }}
                        className={`w-[180px] ${inputClasses}`}
                      />
                    </td>
                    <td className="p-2.5">
                      <input
                        type="number"
                        defaultValue={l.total_rooms || ''}
                        onBlur={(e) => {
                          const v = parseInt(e.target.value)
                          if (!isNaN(v) && v !== l.total_rooms)
                            updateLodgingField(l.id, 'total_rooms', v)
                        }}
                        className={`w-[60px] ${inputClasses}`}
                      />
                    </td>
                    <td className="p-2.5">
                      <input
                        type="text"
                        defaultValue={l.rate_per_night != null ? String(l.rate_per_night) : ''}
                        onBlur={(e) => {
                          const parsed = parseFloat(e.target.value)
                          if (!isNaN(parsed)) updateLodgingField(l.id, 'rate_per_night', parsed)
                        }}
                        placeholder="~$80-120"
                        className={`w-[90px] ${inputClasses}`}
                      />
                    </td>
                    <td className="p-2.5">
                      <select
                        defaultValue={l.booking_status || '⬜ Not started'}
                        onChange={(e) => updateLodgingField(l.id, 'booking_status', e.target.value)}
                        className={selectClasses}
                      >
                        {HOTEL_BLOCK_STATUS_OPTIONS.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2.5">
                      <input
                        type="text"
                        defaultValue={l.notes || ''}
                        onBlur={(e) => {
                          if (e.target.value !== (l.notes || ''))
                            updateLodgingField(l.id, 'notes', e.target.value)
                        }}
                        className={`w-[180px] ${inputClasses}`}
                      />
                    </td>
                  </tr>
                )
              })}
              {lodging.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-gray-400">No hotel blocks added yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
