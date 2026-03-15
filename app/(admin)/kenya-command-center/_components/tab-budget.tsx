'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { BudgetCategory, Expense } from './types'

interface TabBudgetProps {
  budgetCategories: BudgetCategory[]
  expenses: Expense[]
  getBudgetSpent: (categoryId: string) => number
  setShowExpenseModal: (show: boolean) => void
  updateExpenseStatus: (id: string, status: string) => void
}

export function TabBudget({
  budgetCategories, expenses, getBudgetSpent,
  setShowExpenseModal, updateExpenseStatus,
}: TabBudgetProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Budget Overview</CardTitle>
          <Button size="sm" onClick={() => setShowExpenseModal(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Expense
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetCategories.map(cat => {
              const spent = getBudgetSpent(cat.id)
              const percent = cat.budgeted_amount > 0 ? (spent / cat.budgeted_amount) * 100 : 0
              const isOverBudget = percent > 100

              return (
                <div key={cat.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{cat.name}</span>
                    <span className={isOverBudget ? 'text-red-600' : 'text-gray-600'}>
                      ${spent.toLocaleString()} / ${cat.budgeted_amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isOverBudget ? 'bg-red-500' :
                        percent > 80 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-navy">
                ${budgetCategories.reduce((sum, c) => sum + c.budgeted_amount, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Budget</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                ${expenses.filter(e => ['approved', 'paid', 'reimbursed'].includes(e.status)).reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Spent</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gold">
                ${(budgetCategories.reduce((sum, c) => sum + c.budgeted_amount, 0) -
                   expenses.filter(e => ['approved', 'paid', 'reimbursed'].includes(e.status)).reduce((sum, e) => sum + e.amount, 0)).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Remaining</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <p className="text-gray-500 text-sm">No expenses recorded</p>
          ) : (
            <div className="space-y-3">
              {expenses.slice(0, 10).map(e => (
                <div key={e.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{e.description}</p>
                    <p className="text-xs text-gray-500">{new Date(e.expense_date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-navy">${e.amount}</p>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      e.status === 'approved' || e.status === 'paid' ? 'bg-green-100 text-green-800' :
                      e.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {e.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {expenses.filter(e => e.status === 'pending').length > 0 && (
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {expenses.filter(e => e.status === 'pending').map(e => (
                <div key={e.id} className="border rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{e.description}</span>
                    <span className="font-bold text-navy">${e.amount}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    {e.paid_by} • {new Date(e.expense_date).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => updateExpenseStatus(e.id, 'approved')}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-red-600 border-red-600"
                      onClick={() => updateExpenseStatus(e.id, 'rejected')}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
