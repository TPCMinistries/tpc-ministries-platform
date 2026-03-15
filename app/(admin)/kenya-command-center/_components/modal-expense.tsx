'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'
import type { BudgetCategory } from './types'

interface ModalExpenseProps {
  show: boolean
  onClose: () => void
  budgetCategories: BudgetCategory[]
  newExpense: {
    category_id: string
    description: string
    amount: string
    expense_date: string
    paid_by: string
    payment_method: string
  }
  setNewExpense: (expense: ModalExpenseProps['newExpense']) => void
  onSubmit: () => void
}

export function ModalExpense({
  show, onClose, budgetCategories, newExpense, setNewExpense, onSubmit,
}: ModalExpenseProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-navy">Add Expense</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <Label>Category</Label>
            <select
              value={newExpense.category_id}
              onChange={(e) => setNewExpense({ ...newExpense, category_id: e.target.value })}
              className="w-full border rounded-lg px-4 py-2 mt-1"
            >
              <option value="">Select category...</option>
              {budgetCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              placeholder="What was purchased?"
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Amount ($)</Label>
              <Input
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={newExpense.expense_date}
                onChange={(e) => setNewExpense({ ...newExpense, expense_date: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label>Paid By</Label>
            <Input
              value={newExpense.paid_by}
              onChange={(e) => setNewExpense({ ...newExpense, paid_by: e.target.value })}
              placeholder="Who made this purchase?"
              className="mt-1"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1 bg-navy hover:bg-navy/90" onClick={onSubmit}>
              Add Expense
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
