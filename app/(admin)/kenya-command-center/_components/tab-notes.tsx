'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, ExternalLink, StickyNote, Check, Phone, Link } from 'lucide-react'
import type { AdminNote } from './types'

interface TabNotesProps {
  adminNotes: AdminNote[]
  addAdminNote: (note: { note_type: string; title?: string; content?: string; url?: string }) => void
  updateAdminNoteField: (id: string, field: string, value: string) => void
  deleteAdminNote: (id: string) => void
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
}

export function TabNotes({
  adminNotes,
  addAdminNote,
  updateAdminNoteField,
  deleteAdminNote,
  saveStatus,
}: TabNotesProps) {
  const generalNotes = adminNotes.filter((n) => n.note_type === 'general')
  const contacts = adminNotes.filter((n) => n.note_type === 'contact')
  const links = adminNotes.filter((n) => n.note_type === 'link')

  const generalNote = generalNotes[0] ?? null

  return (
    <div className="space-y-6">
      {/* Save Status Indicator */}
      <div className="flex justify-end">
        {saveStatus === 'saving' && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
            Saving...
          </span>
        )}
        {saveStatus === 'saved' && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <Check className="h-3 w-3" />
            Saved
          </span>
        )}
        {saveStatus === 'error' && (
          <span className="text-xs text-red-600">Save failed</span>
        )}
      </div>

      {/* ===== Admin Notes Section ===== */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5" />
            Admin Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generalNote ? (
            <textarea
              defaultValue={generalNote.content ?? ''}
              onBlur={(e) =>
                updateAdminNoteField(generalNote.id, 'content', e.target.value)
              }
              rows={8}
              className="w-full rounded-lg border border-gray-200 p-4 text-sm focus:border-navy focus:ring-1 focus:ring-navy resize-y"
              placeholder="Write admin notes here..."
            />
          ) : (
            <div className="py-8 text-center">
              <StickyNote className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500 mb-4">No admin notes yet</p>
              <Button
                size="sm"
                onClick={() =>
                  addAdminNote({
                    note_type: 'general',
                    title: 'Admin Notes',
                    content: '',
                  })
                }
              >
                <Plus className="h-4 w-4 mr-1" />
                Create Notes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===== Key Contacts Section ===== */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Key Contacts
          </CardTitle>
          <Button
            size="sm"
            onClick={() =>
              addAdminNote({
                note_type: 'contact',
                title: '',
                content: '',
                url: '',
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Contact
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {contacts.length === 0 ? (
            <div className="py-8 text-center">
              <Phone className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500">No contacts added yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">
                      Name
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">
                      Role / Details
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">
                      Phone / Email
                    </th>
                    <th className="py-2 px-3 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className="border-b last:border-b-0 hover:bg-gray-50/50"
                    >
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          defaultValue={contact.title ?? ''}
                          onBlur={(e) =>
                            updateAdminNoteField(
                              contact.id,
                              'title',
                              e.target.value
                            )
                          }
                          placeholder="Contact name"
                          className="w-full rounded border border-transparent px-2 py-1 text-sm hover:border-gray-300 focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          defaultValue={contact.content ?? ''}
                          onBlur={(e) =>
                            updateAdminNoteField(
                              contact.id,
                              'content',
                              e.target.value
                            )
                          }
                          placeholder="Role or details"
                          className="w-full rounded border border-transparent px-2 py-1 text-sm hover:border-gray-300 focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          defaultValue={contact.url ?? ''}
                          onBlur={(e) =>
                            updateAdminNoteField(
                              contact.id,
                              'url',
                              e.target.value
                            )
                          }
                          placeholder="Phone or email"
                          className="w-full rounded border border-transparent px-2 py-1 text-sm hover:border-gray-300 focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <button
                          onClick={() => deleteAdminNote(contact.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete contact"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===== Important Links Section ===== */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Important Links
          </CardTitle>
          <Button
            size="sm"
            onClick={() =>
              addAdminNote({ note_type: 'link', title: '', url: '' })
            }
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Link
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {links.length === 0 ? (
            <div className="py-8 text-center">
              <Link className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500">No links added yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">
                      Title
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">
                      URL
                    </th>
                    <th className="py-2 px-3 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {links.map((link) => (
                    <tr
                      key={link.id}
                      className="border-b last:border-b-0 hover:bg-gray-50/50"
                    >
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          defaultValue={link.title ?? ''}
                          onBlur={(e) =>
                            updateAdminNoteField(
                              link.id,
                              'title',
                              e.target.value
                            )
                          }
                          placeholder="Link title"
                          className="w-full rounded border border-transparent px-2 py-1 text-sm hover:border-gray-300 focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            defaultValue={link.url ?? ''}
                            onBlur={(e) =>
                              updateAdminNoteField(
                                link.id,
                                'url',
                                e.target.value
                              )
                            }
                            placeholder="https://..."
                            className="flex-1 rounded border border-transparent px-2 py-1 text-sm hover:border-gray-300 focus:border-navy focus:ring-1 focus:ring-navy focus:outline-none"
                          />
                          {link.url && (
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-gray-400 hover:text-navy transition-colors shrink-0"
                              title="Open in new tab"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <button
                          onClick={() => deleteAdminNote(link.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete link"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
