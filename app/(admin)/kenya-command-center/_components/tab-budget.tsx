'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, TrendingDown, Save, Check, Trash2, Plus, AlertTriangle } from 'lucide-react'
import type { BudgetCategory, Expense } from './types'

interface TabBudgetProps {
  budgetCategories: BudgetCategory[]
  expenses: Expense[]
  getBudgetSpent: (categoryId: string) => number
  updateExpenseStatus: (id: string, status: string) => void
  updateExpenseField: (id: string, field: string, value: string | number) => void
  deleteExpense: (id: string) => void
  addExpenseInline: (expense: { category_id: string; description: string; amount: number; expense_date: string; paid_by: string }) => void
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
}

const STATUS_OPTIONS = ['pending', 'approved', 'paid', 'reimbursed', 'rejected'] as const

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pending:    { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  approved:   { bg: 'bg-blue-100',   text: 'text-blue-800' },
  paid:       { bg: 'bg-green-100',  text: 'text-green-800' },
  reimbursed: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  rejected:   { bg: 'bg-red-100',    text: 'text-red-800' },
}

const inputClasses = 'bg-transparent border border-gray-200 rounded px-2 py-1 text-[13px] focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none'
const thClasses = 'text-left p-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide'

export function TabBudget({
  budgetCategories,
  expenses,
  getBudgetSpent,
  updateExpenseStatus,
  updateExpenseField,
  deleteExpense,
  addExpenseInline,
  saveStatus,
}: TabBudgetProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category_id: budgetCategories[0]?.id || '',
    expense_date: new Date().toISOString().split('T')[0],
    paid_by: '',
  })

  // Computed totals
  const totalBudget = useMemo(
    () => budgetCategories.reduce((sum, c) => sum + c.budgeted_amount, 0),
    [budgetCategories]
  )

  const totalSpent = useMemo(
    () => expenses
      .filter(e => ['approved', 'paid', 'reimbursed'].includes(e.status))
      .reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  )

  const remaining = totalBudget - totalSpent

  // Filtered expenses
  const filteredExpenses = useMemo(
    () => activeCategory === 'all'
      ? expenses
      : expenses.filter(e => e.category_id === activeCategory),
    [expenses, activeCategory]
  )

  // Sidebar stats
  const pendingCount = useMemo(
    () => expenses.filter(e => e.status === 'pending').length,
    [expenses]
  )

  const avgExpense = useMemo(
    () => expenses.length > 0
      ? expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length
      : 0,
    [expenses]
  )

  const largestExpense = useMemo(
    () => expenses.length > 0
      ? expenses.reduce((max, e) => e.amount > max.amount ? e : max, expenses[0])
      : null,
    [expenses]
  )

  const overBudgetCount = useMemo(
    () => budgetCategories.filter(cat => {
      const spent = getBudgetSpent(cat.id)
      return spent > cat.budgeted_amount
    }).length,
    [budgetCategories, getBudgetSpent]
  )

  // Category name lookup
  const categoryNameMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const cat of budgetCategories) {
      map[cat.id] = cat.name
    }
    return map
  }, [budgetCategories])

  function handleAddExpense() {
    const amount = parseFloat(newExpense.amount)
    if (!newExpense.description.trim() || isNaN(amount) || amount <= 0 || !newExpense.category_id) return

    addExpenseInline({
      category_id: newExpense.category_id,
      description: newExpense.description.trim(),
      amount,
      expense_date: newExpense.expense_date,
      paid_by: newExpense.paid_by.trim(),
    })

    setNewExpense({
      description: '',
      amount: '',
      category_id: budgetCategories[0]?.id || '',
      expense_date: new Date().toISOString().split('T')[0],
      paid_by: '',
    })
    setShowAddForm(false)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {/* ====== MAIN COLUMN ====== */}
      <div className="space-y-6">
        {/* Save Status + Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Expense Management
          </h2>
          <div className="flex items-center gap-3">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1.5 text-sm text-gray-500 animate-pulse">
                <Save className="h-3.5 w-3.5" /> Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <Check className="h-3.5 w-3.5" /> Saved
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-sm text-red-600">Save failed</span>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-navy">${totalBudget.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-1">Total Budget</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">${totalSpent.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-1">Total Spent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-gold' : 'text-red-600'}`}>
                ${remaining.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">Remaining</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
              activeCategory === 'all'
                ? 'bg-navy text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({expenses.length})
          </button>
          {budgetCategories.map(cat => {
            const catExpenseCount = expenses.filter(e => e.category_id === cat.id).length
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-navy text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.name} ({catExpenseCount})
              </button>
            )
          })}
        </div>

        {/* Expense Table */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-navy">
                Expenses {activeCategory !== 'all' && `— ${categoryNameMap[activeCategory] || ''}`}
                <span className="text-gray-400 font-normal ml-2 text-sm">({filteredExpenses.length})</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3 py-1.5 text-[13px] font-medium bg-navy text-white rounded hover:bg-navy/90 transition-colors flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Add Expense
              </button>
            </div>

            {/* Inline Add Form */}
            {showAddForm && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-end gap-2 flex-wrap">
                  <div>
                    <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Description *</label>
                    <input
                      type="text"
                      placeholder="Expense description"
                      value={newExpense.description}
                      onChange={e => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleAddExpense()}
                      className={`w-[180px] ${inputClasses}`}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Amount *</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      value={newExpense.amount}
                      onChange={e => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleAddExpense()}
                      className={`w-[100px] ${inputClasses}`}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Category *</label>
                    <select
                      value={newExpense.category_id}
                      onChange={e => setNewExpense(prev => ({ ...prev, category_id: e.target.value }))}
                      className={`w-[140px] ${inputClasses} cursor-pointer`}
                    >
                      {budgetCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Date</label>
                    <input
                      type="date"
                      value={newExpense.expense_date}
                      onChange={e => setNewExpense(prev => ({ ...prev, expense_date: e.target.value }))}
                      className={`w-[140px] ${inputClasses}`}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Paid By</label>
                    <input
                      type="text"
                      placeholder="Name"
                      value={newExpense.paid_by}
                      onChange={e => setNewExpense(prev => ({ ...prev, paid_by: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleAddExpense()}
                      className={`w-[120px] ${inputClasses}`}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddExpense}
                      disabled={!newExpense.description.trim() || !newExpense.amount || parseFloat(newExpense.amount) <= 0}
                      className="px-3 py-1.5 text-[13px] font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false)
                        setNewExpense({
                          description: '',
                          amount: '',
                          category_id: budgetCategories[0]?.id || '',
                          expense_date: new Date().toISOString().split('T')[0],
                          paid_by: '',
                        })
                      }}
                      className="px-3 py-1.5 text-[13px] font-medium bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ fontSize: '13px' }}>
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className={thClasses}>Description</th>
                    <th className={thClasses}>Amount</th>
                    <th className={thClasses}>Category</th>
                    <th className={thClasses}>Date</th>
                    <th className={thClasses}>Paid By</th>
                    <th className={thClasses}>Status</th>
                    <th className={thClasses}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map(expense => {
                    const statusStyle = STATUS_STYLES[expense.status] || STATUS_STYLES.pending
                    return (
                      <tr key={expense.id} className="group border-b border-gray-100 hover:bg-gray-50/50">
                        {/* Description — inline edit */}
                        <td className="p-2.5">
                          <input
                            type="text"
                            defaultValue={expense.description}
                            onBlur={e => {
                              if (e.target.value !== expense.description) {
                                updateExpenseField(expense.id, 'description', e.target.value)
                              }
                            }}
                            className={`w-[180px] ${inputClasses} font-medium`}
                          />
                        </td>

                        {/* Amount — inline edit */}
                        <td className="p-2.5">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={expense.amount}
                            onBlur={e => {
                              const parsed = parseFloat(e.target.value)
                              if (!isNaN(parsed) && parsed !== expense.amount) {
                                updateExpenseField(expense.id, 'amount', parsed)
                              }
                            }}
                            className={`w-[90px] ${inputClasses}`}
                          />
                        </td>

                        {/* Category — display only */}
                        <td className="p-2.5">
                          <span className="text-[13px] text-gray-700">
                            {categoryNameMap[expense.category_id] || '—'}
                          </span>
                        </td>

                        {/* Date — display */}
                        <td className="p-2.5 whitespace-nowrap text-gray-600">
                          {new Date(expense.expense_date + 'T00:00:00').toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>

                        {/* Paid By — inline edit */}
                        <td className="p-2.5">
                          <input
                            type="text"
                            defaultValue={expense.paid_by || ''}
                            onBlur={e => {
                              if (e.target.value !== (expense.paid_by || '')) {
                                updateExpenseField(expense.id, 'paid_by', e.target.value)
                              }
                            }}
                            placeholder="—"
                            className={`w-[100px] ${inputClasses}`}
                          />
                        </td>

                        {/* Status — select dropdown */}
                        <td className="p-2.5">
                          <select
                            defaultValue={expense.status}
                            onChange={e => updateExpenseStatus(expense.id, e.target.value)}
                            className={`${inputClasses} cursor-pointer px-2 py-1 rounded text-[12px] font-medium ${statusStyle.bg} ${statusStyle.text} border-0`}
                          >
                            {STATUS_OPTIONS.map(s => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                        </td>

                        {/* Delete — hover-visible */}
                        <td className="p-2.5">
                          <button
                            type="button"
                            onClick={() => deleteExpense(expense.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500"
                            title="Delete expense"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                  {filteredExpenses.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-gray-400">
                        <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-40" />
                        <p className="text-[14px]">No expenses recorded</p>
                        <p className="text-[12px] mt-1">
                          {activeCategory !== 'all' ? 'Try selecting "All" or add a new expense.' : 'Click "Add Expense" to get started.'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ====== SIDEBAR ====== */}
      <div className="space-y-4">
        {/* Category Breakdown */}
        <Card className="border-gray-100">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold text-navy flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="space-y-4">
              {budgetCategories.map(cat => {
                const spent = getBudgetSpent(cat.id)
                const percent = cat.budgeted_amount > 0 ? (spent / cat.budgeted_amount) * 100 : 0
                const isOverBudget = percent > 100

                return (
                  <div key={cat.id} className="space-y-1.5">
                    <div className="flex justify-between text-[13px]">
                      <span className="font-medium text-gray-800">{cat.name}</span>
                      <span className={isOverBudget ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                        ${spent.toLocaleString()} / ${cat.budgeted_amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOverBudget ? 'bg-red-500' :
                          percent > 80 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                    {isOverBudget && (
                      <p className="text-[11px] text-red-500 font-medium">
                        Over budget by ${(spent - cat.budgeted_amount).toLocaleString()}
                      </p>
                    )}
                  </div>
                )
              })}
              {budgetCategories.length === 0 && (
                <p className="text-gray-400 text-[12px]">No budget categories defined</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="border-gray-100">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold text-navy flex items-center gap-2">
              Pending Approvals
              {pendingCount > 0 && (
                <Badge className="bg-yellow-100 text-yellow-800 text-[11px] px-2 py-0.5">
                  {pendingCount}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            {pendingCount === 0 ? (
              <p className="text-gray-400 text-[12px]">No pending approvals</p>
            ) : (
              <div className="space-y-2.5">
                {expenses.filter(e => e.status === 'pending').slice(0, 5).map(e => (
                  <div key={e.id} className="p-2.5 bg-yellow-50 rounded-lg border border-yellow-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-[13px] text-gray-800 truncate mr-2">{e.description}</span>
                      <span className="font-bold text-[13px] text-navy whitespace-nowrap">${e.amount.toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] text-gray-500">{e.paid_by || 'Unknown'}</p>
                    <div className="flex gap-1.5 mt-2">
                      <button
                        type="button"
                        onClick={() => updateExpenseStatus(e.id, 'approved')}
                        className="px-2 py-0.5 text-[11px] font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => updateExpenseStatus(e.id, 'rejected')}
                        className="px-2 py-0.5 text-[11px] font-medium bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
                {pendingCount > 5 && (
                  <p className="text-[11px] text-gray-400 text-center">
                    +{pendingCount - 5} more pending
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border-gray-100">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold text-navy flex items-center gap-2">
              <TrendingDown className="h-4 w-4" /> Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-gray-600">Avg Expense</span>
                <span className="text-[13px] font-semibold text-navy">
                  ${avgExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-gray-600">Largest Expense</span>
                <div className="text-right">
                  <span className="text-[13px] font-semibold text-navy block">
                    {largestExpense ? `$${largestExpense.amount.toLocaleString()}` : '—'}
                  </span>
                  {largestExpense && (
                    <span className="text-[11px] text-gray-400 block truncate max-w-[140px]">
                      {largestExpense.description}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-gray-600">Over Budget</span>
                <span className={`text-[13px] font-semibold flex items-center gap-1 ${overBudgetCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {overBudgetCount > 0 && <AlertTriangle className="h-3.5 w-3.5" />}
                  {overBudgetCount} {overBudgetCount === 1 ? 'category' : 'categories'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-gray-600">Total Expenses</span>
                <span className="text-[13px] font-semibold text-navy">{expenses.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-gray-600">Budget Utilization</span>
                <span className={`text-[13px] font-semibold ${totalBudget > 0 && (totalSpent / totalBudget) > 0.9 ? 'text-red-600' : 'text-navy'}`}>
                  {totalBudget > 0 ? `${Math.round((totalSpent / totalBudget) * 100)}%` : '—'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
