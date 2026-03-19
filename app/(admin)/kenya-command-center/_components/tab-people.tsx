'use client'

import { Save, Check } from 'lucide-react'
import type { Trip, Participant, Lodging, Contact, WaitingListEntry } from './types'
import { DelegationTable } from './people/delegation-table'
import { PartnersTable } from './people/partners-table'
import { WaitingList } from './people/waiting-list'
import { HotelBlocks } from './people/hotel-blocks'

interface TabPeopleProps {
  trip: Trip
  filteredParticipants: Participant[]
  participants: Participant[]
  lodging: Lodging[]
  contacts: Contact[]
  waitingList: WaitingListEntry[]
  searchQuery: string
  setSearchQuery: (q: string) => void
  filterTrack: string
  setFilterTrack: (t: string) => void
  filterStatus: string
  setFilterStatus: (s: string) => void
  setSelectedParticipant: (p: Participant) => void
  updateParticipantStatus: (id: string, status: string) => void
  updateParticipantField: (id: string, field: string, value: string) => void
  updateLodgingField: (id: string, field: string, value: string | number) => void
  updateContactField: (id: string, field: string, value: string) => void
  addParticipantDirect: (firstName: string, lastName: string) => void
  sendKenyaInvite: (invite: { firstName: string; lastName: string; email: string; track: string; role: string; sendEmail: boolean }) => Promise<any>
  deleteParticipant: (id: string) => void
  addContact: (name: string, fields?: { email?: string; phone?: string; organization?: string; role?: string; city?: string }) => void
  deleteContact: (id: string) => void
  sendPartnerInfoRequest: (contactId: string) => Promise<any>
  addWaitingListEntry: (entry: any) => void
  updateWaitingListEntry: (id: string, updates: any) => void
  deleteWaitingListEntry: (id: string) => void
  promoteToDelegate: (entry: WaitingListEntry) => void
  sendWaitingListEmail: (waitingListId: string, action: 'entice' | 'welcome' | 'decline') => Promise<any>
  addLodging: (city: string, checkIn: string, checkOut: string) => void
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  onOpenInviteModal?: () => void
}

export function TabPeople({
  trip,
  filteredParticipants,
  participants,
  lodging,
  contacts,
  waitingList,
  searchQuery,
  setSearchQuery,
  filterTrack,
  setFilterTrack,
  filterStatus,
  setFilterStatus,
  setSelectedParticipant,
  updateParticipantStatus,
  updateParticipantField,
  updateLodgingField,
  updateContactField,
  addParticipantDirect,
  sendKenyaInvite,
  deleteParticipant,
  addContact,
  deleteContact,
  sendPartnerInfoRequest,
  addWaitingListEntry,
  updateWaitingListEntry,
  deleteWaitingListEntry,
  promoteToDelegate,
  sendWaitingListEmail,
  addLodging,
  saveStatus,
  onOpenInviteModal,
}: TabPeopleProps) {
  return (
    <div className="space-y-6">
      {/* Save Status */}
      <div className="flex justify-end min-h-[24px]">
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

      {/* US Delegation */}
      <DelegationTable
        filteredParticipants={filteredParticipants}
        setSelectedParticipant={setSelectedParticipant}
        updateParticipantField={updateParticipantField}
        deleteParticipant={deleteParticipant}
        addParticipantDirect={addParticipantDirect}
        sendKenyaInvite={sendKenyaInvite}
        onOpenInviteModal={onOpenInviteModal}
      />

      {/* In-Country Partners */}
      <PartnersTable
        contacts={contacts}
        updateContactField={updateContactField}
        addContact={addContact}
        deleteContact={deleteContact}
        sendPartnerInfoRequest={sendPartnerInfoRequest}
      />

      {/* Waiting to Hear */}
      <WaitingList
        waitingList={waitingList}
        addWaitingListEntry={addWaitingListEntry}
        updateWaitingListEntry={updateWaitingListEntry}
        deleteWaitingListEntry={deleteWaitingListEntry}
        promoteToDelegate={promoteToDelegate}
        sendWaitingListEmail={sendWaitingListEmail}
      />

      {/* Hotel Blocks */}
      <HotelBlocks
        lodging={lodging}
        updateLodgingField={updateLodgingField}
        addLodging={addLodging}
      />
    </div>
  )
}
