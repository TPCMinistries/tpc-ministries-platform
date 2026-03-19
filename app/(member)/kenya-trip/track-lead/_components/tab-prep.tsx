'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Target, Package, Plus, Trash2, CheckCircle } from 'lucide-react'
import { TRACK_COLORS } from '../../_components/constants'
import type { TrackDetail, TrackMaterial } from '../../_components/types'

interface TabPrepProps {
  trackDetails: TrackDetail[]
  trackMaterials: TrackMaterial[]
  track: string
  addMaterial: (trackDetailId: string, itemName: string) => Promise<boolean>
  toggleMaterial: (id: string, isChecked: boolean) => Promise<boolean>
  deleteMaterial: (id: string) => Promise<boolean>
}

export function TabPrep({
  trackDetails,
  trackMaterials,
  track,
  addMaterial,
  toggleMaterial,
  deleteMaterial,
}: TabPrepProps) {
  const [newItemName, setNewItemName] = useState<Record<string, string>>({})
  const [addingFor, setAddingFor] = useState<string | null>(null)
  const colors = TRACK_COLORS[track] || { bg: 'bg-gray-500', text: 'text-gray-700', light: 'bg-gray-100' }

  const getMaterialsForDetail = (detailId: string) =>
    trackMaterials.filter(m => m.track_detail_id === detailId)

  const handleAddMaterial = async (detailId: string) => {
    const name = newItemName[detailId]?.trim()
    if (!name) return

    setAddingFor(detailId)
    const success = await addMaterial(detailId, name)
    if (success) {
      setNewItemName(prev => ({ ...prev, [detailId]: '' }))
    }
    setAddingFor(null)
  }

  return (
    <div className="space-y-6">
      {/* Track Objectives (read-only) */}
      {trackDetails.map((detail) => {
        const materials = getMaterialsForDetail(detail.id)
        const checkedCount = materials.filter(m => m.is_checked).length
        const totalCount = materials.length
        const progressPct = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0

        return (
          <div key={detail.id} className="space-y-4">
            {/* Objectives & Scope */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-navy" />
                  <CardTitle className="text-lg text-navy">
                    Track Objectives
                  </CardTitle>
                  <Badge className={`${colors.light} ${colors.text}`}>{detail.track}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {detail.objectives && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Objectives</p>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                      {detail.objectives}
                    </div>
                  </div>
                )}
                {detail.scope && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Scope</p>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                      {detail.scope}
                    </div>
                  </div>
                )}
                {detail.notes && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Notes</p>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                      {detail.notes}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Materials Checklist */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-navy" />
                    <CardTitle className="text-lg text-navy">
                      Materials Checklist
                    </CardTitle>
                  </div>
                  {totalCount > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {checkedCount}/{totalCount}
                      </span>
                      <Badge className={
                        progressPct >= 80
                          ? 'bg-green-100 text-green-800'
                          : progressPct >= 50
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                      }>
                        {progressPct}%
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Progress bar */}
                {totalCount > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        progressPct >= 80 ? 'bg-green-500' : progressPct >= 50 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                )}

                {/* Materials list */}
                {materials.length === 0 ? (
                  <p className="text-sm text-gray-500 mb-4">No materials added yet. Add items below.</p>
                ) : (
                  <div className="space-y-2 mb-4">
                    {materials
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((material) => (
                        <div
                          key={material.id}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                            material.is_checked ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={material.is_checked}
                              onCheckedChange={(checked) => toggleMaterial(material.id, !!checked)}
                            />
                            <span className={`text-sm ${material.is_checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                              {material.item_name}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                            onClick={() => deleteMaterial(material.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                  </div>
                )}

                {/* Add new material */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a material item..."
                    value={newItemName[detail.id] || ''}
                    onChange={(e) => setNewItemName(prev => ({ ...prev, [detail.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddMaterial(detail.id)
                    }}
                  />
                  <Button
                    onClick={() => handleAddMaterial(detail.id)}
                    disabled={addingFor === detail.id || !(newItemName[detail.id]?.trim())}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      })}

      {trackDetails.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No track details have been set up by admin yet.</p>
            <p className="text-sm text-gray-400 mt-1">Check back later for objectives, scope, and materials.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
