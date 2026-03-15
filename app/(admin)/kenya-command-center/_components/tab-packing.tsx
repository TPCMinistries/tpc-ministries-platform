'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Package, Plus, Trash2, CheckCircle, X
} from 'lucide-react'
import type { Participant, PackingItem, PackingStatus } from './types'
import { packingCategories } from './constants'

interface TabPackingProps {
  participants: Participant[]
  packingItems: PackingItem[]
  packingStatuses: PackingStatus[]
  addPackingItem: (item: { item_name: string; category: string; is_required: boolean; quantity: number; notes?: string }) => void
  deletePackingItem: (id: string) => void
  togglePackingStatus: (participantId: string, packingItemId: string, currentlyPacked: boolean) => void
  initializePackingForAll: () => void
}

export function TabPacking({
  participants, packingItems, packingStatuses,
  addPackingItem, deletePackingItem, togglePackingStatus, initializePackingForAll,
}: TabPackingProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>('')
  const [newItem, setNewItem] = useState({
    item_name: '',
    category: 'clothing',
    is_required: false,
    quantity: 1,
  })

  const approvedParticipants = participants.filter(p => p.application_status === 'approved')

  const handleAddItem = () => {
    if (!newItem.item_name) return
    addPackingItem(newItem)
    setNewItem({ item_name: '', category: 'clothing', is_required: false, quantity: 1 })
    setShowAddForm(false)
  }

  const getParticipantProgress = (participantId: string) => {
    const statuses = packingStatuses.filter(s => s.participant_id === participantId)
    const packed = statuses.filter(s => s.is_packed).length
    const total = packingItems.length
    return total > 0 ? Math.round((packed / total) * 100) : 0
  }

  const isItemPacked = (participantId: string, itemId: string) => {
    return packingStatuses.some(s => s.participant_id === participantId && s.packing_item_id === itemId && s.is_packed)
  }

  // Group items by category
  const groupedItems = packingCategories.reduce((acc, cat) => {
    acc[cat] = packingItems.filter(item => item.category === cat)
    return acc
  }, {} as Record<string, PackingItem[]>)

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Team Gear Master List */}
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" /> Team Gear Master List
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={initializePackingForAll}>
              Initialize for All Delegates
            </Button>
            <Button size="sm" onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Item Name</Label>
                  <Input
                    value={newItem.item_name}
                    onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                    placeholder="e.g., Passport copies"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 mt-1"
                  >
                    {packingCategories.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newItem.is_required}
                    onChange={(e) => setNewItem({ ...newItem, is_required: e.target.checked })}
                  />
                  Required item
                </label>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Qty:</Label>
                  <Input
                    type="number"
                    min={1}
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                    className="w-16"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddItem}>Add</Button>
                <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {packingItems.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No packing items yet. Add items to create the packing checklist.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {packingCategories.map(cat => {
                const items = groupedItems[cat]
                if (!items || items.length === 0) return null
                return (
                  <div key={cat}>
                    <h3 className="font-semibold text-navy capitalize mb-2">{cat}</h3>
                    <div className="space-y-1">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{item.item_name}</span>
                            {item.is_required && (
                              <Badge className="bg-red-100 text-red-800 text-xs">Required</Badge>
                            )}
                            {item.quantity > 1 && (
                              <span className="text-xs text-gray-500">x{item.quantity}</span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 h-7 w-7 p-0"
                            onClick={() => deletePackingItem(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Per-Delegate Progress */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Delegate Packing Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <select
                value={selectedParticipantId}
                onChange={(e) => setSelectedParticipantId(e.target.value)}
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="">Select delegate...</option>
                {approvedParticipants.map(p => (
                  <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                ))}
              </select>
            </div>

            {selectedParticipantId && packingItems.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${getParticipantProgress(selectedParticipantId)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold">{getParticipantProgress(selectedParticipantId)}%</span>
                </div>

                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                  {packingItems.map(item => {
                    const packed = isItemPacked(selectedParticipantId, item.id)
                    return (
                      <button
                        key={item.id}
                        onClick={() => togglePackingStatus(selectedParticipantId, item.id, packed)}
                        className={`w-full flex items-center gap-2 p-2 rounded text-left text-sm transition-colors ${
                          packed ? 'bg-green-50 text-green-800' : 'hover:bg-gray-50'
                        }`}
                      >
                        {packed ? (
                          <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                        ) : (
                          <div className="h-4 w-4 border-2 border-gray-300 rounded shrink-0" />
                        )}
                        <span className={packed ? 'line-through' : ''}>{item.item_name}</span>
                        {item.is_required && !packed && (
                          <Badge className="bg-red-100 text-red-800 text-xs ml-auto">Required</Badge>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overview Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Team Packing Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {approvedParticipants.length === 0 ? (
              <p className="text-gray-500 text-sm">No approved delegates yet</p>
            ) : (
              <div className="space-y-2">
                {approvedParticipants.map(p => {
                  const progress = getParticipantProgress(p.id)
                  return (
                    <div key={p.id} className="flex items-center gap-3">
                      <span className="text-sm w-28 truncate">{p.first_name} {p.last_name}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            progress === 100 ? 'bg-green-500' :
                            progress >= 50 ? 'bg-gold' :
                            'bg-red-400'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium w-8 text-right">{progress}%</span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
