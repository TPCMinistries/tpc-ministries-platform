'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plane, RefreshCw, Download } from 'lucide-react'
import type { TabType } from './_components/types'
import { tabs } from './_components/constants'
import { useKenyaData } from './_components/use-kenya-data'
import { CountdownTimer } from './_components/countdown-timer'
import { StatsHeader } from './_components/stats-header'
import { TabOverview } from './_components/tab-overview'
import { TabPeople } from './_components/tab-people'
import { TabActions } from './_components/tab-actions'
import { TabItinerary } from './_components/tab-itinerary'
import { TabLogistics } from './_components/tab-logistics'
import { TabTracks } from './_components/tab-tracks'
import { TabBudget } from './_components/tab-budget'
import { TabPacking } from './_components/tab-packing'
import { TabComms } from './_components/tab-comms'
import { TabMedia } from './_components/tab-media'
import { TabPipeline } from './_components/tab-pipeline'
import { TabPrayer } from './_components/tab-prayer'
import { TabNotes } from './_components/tab-notes'
import { ModalExpense } from './_components/modal-expense'
import { ModalAnnouncement } from './_components/modal-announcement'
import { ModalDailyFocus } from './_components/modal-daily-focus'
import { ModalParticipantDetail } from './_components/modal-participant-detail'
import { useState } from 'react'

export default function KenyaCommandCenter() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const data = useKenyaData()

  if (data.loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-navy" />
      </div>
    )
  }

  if (!data.trip) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-[1800px] mx-auto text-center py-12">
          <Plane className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-navy mb-2">No Trip Found</h2>
          <p className="text-gray-600">Create a Kenya trip in the database to get started.</p>
        </div>
      </div>
    )
  }

  const trip = data.trip

  return (
    <div className="flex-1 p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-navy">{trip.name}</h1>
              <Badge className={`${
                trip.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                trip.status === 'registration_open' ? 'bg-green-100 text-green-800' :
                trip.status === 'active' ? 'bg-gold text-navy' :
                'bg-gray-100 text-gray-800'
              }`}>
                {trip.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-gray-600">
              {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} -
              {new Date(trip.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              {data.stats.daysUntilTrip > 0 && (
                <span className="ml-2 text-navy font-medium">({data.stats.daysUntilTrip} days away)</span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={data.fetchData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" onClick={data.exportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Countdown Timer */}
        <CountdownTimer trip={trip} />

        {/* Stats Overview */}
        <StatsHeader trip={trip} stats={data.stats} />

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-navy text-navy'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <TabOverview
            trip={trip}
            participants={data.participants}
            expenses={data.expenses}
            announcements={data.announcements}
            stats={data.stats}
            setActiveTab={(t) => setActiveTab(t as TabType)}
            setShowAnnouncementModal={data.setShowAnnouncementModal}
          />
        )}

        {activeTab === 'people' && (
          <TabPeople
            trip={trip}
            filteredParticipants={data.filteredParticipants}
            participants={data.participants}
            lodging={data.lodging}
            contacts={data.contacts}
            waitingList={data.waitingList}
            searchQuery={data.searchQuery}
            setSearchQuery={data.setSearchQuery}
            filterTrack={data.filterTrack}
            setFilterTrack={data.setFilterTrack}
            filterStatus={data.filterStatus}
            setFilterStatus={data.setFilterStatus}
            setSelectedParticipant={data.setSelectedParticipant}
            updateParticipantStatus={data.updateParticipantStatus}
            updateParticipantField={data.updateParticipantField}
            updateLodgingField={data.updateLodgingField}
            updateContactField={data.updateContactField}
            addParticipantDirect={data.addParticipantDirect}
            deleteParticipant={data.deleteParticipant}
            addContact={data.addContact}
            deleteContact={data.deleteContact}
            addWaitingListEntry={data.addWaitingListEntry}
            updateWaitingListEntry={data.updateWaitingListEntry}
            deleteWaitingListEntry={data.deleteWaitingListEntry}
            promoteToDelegate={data.promoteToDelegate}
            saveStatus={data.saveStatus}
          />
        )}

        {activeTab === 'actions' && (
          <TabActions
            actionItems={data.actionItems}
            addActionItem={data.addActionItem}
            updateActionItemField={data.updateActionItemField}
            deleteActionItem={data.deleteActionItem}
            saveStatus={data.saveStatus}
          />
        )}

        {activeTab === 'itinerary' && (
          <TabItinerary
            trip={trip}
            itinerary={data.itinerary}
            flights={data.flights}
            lodging={data.lodging}
            contacts={data.contacts}
            addItineraryItem={data.addItineraryItem}
            updateItineraryField={data.updateItineraryField}
            deleteItineraryItem={data.deleteItineraryItem}
            saveStatus={data.saveStatus}
          />
        )}

        {activeTab === 'logistics' && (
          <TabLogistics
            trip={trip}
            itinerary={data.itinerary}
            conferenceSessions={data.conferenceSessions}
            logisticsMatrix={data.logisticsMatrix}
            upsertLogisticsCell={data.upsertLogisticsCell}
            addConferenceSession={data.addConferenceSession}
            deleteConferenceSession={data.deleteConferenceSession}
            copyFromItinerary={data.copyFromItinerary}
          />
        )}

        {activeTab === 'tracks' && (
          <TabTracks
            participants={data.participants}
            contacts={data.contacts}
            conferenceSessions={data.conferenceSessions}
            trackDetails={data.trackDetails}
            trackMaterials={data.trackMaterials}
            updateTrackDetailField={data.updateTrackDetailField}
            addTrackMaterial={data.addTrackMaterial}
            toggleTrackMaterial={data.toggleTrackMaterial}
            deleteTrackMaterial={data.deleteTrackMaterial}
            saveStatus={data.saveStatus}
          />
        )}

        {activeTab === 'budget' && (
          <TabBudget
            budgetCategories={data.budgetCategories}
            expenses={data.expenses}
            getBudgetSpent={data.getBudgetSpent}
            setShowExpenseModal={data.setShowExpenseModal}
            updateExpenseStatus={data.updateExpenseStatus}
          />
        )}

        {activeTab === 'packing' && (
          <TabPacking
            participants={data.participants}
            packingItems={data.packingItems}
            packingStatuses={data.packingStatuses}
            addPackingItem={data.addPackingItem}
            deletePackingItem={data.deletePackingItem}
            togglePackingStatus={data.togglePackingStatus}
            initializePackingForAll={data.initializePackingForAll}
          />
        )}

        {activeTab === 'comms' && (
          <TabComms
            announcements={data.announcements}
            documents={data.documents}
            faqs={data.faqs}
            setShowAnnouncementModal={data.setShowAnnouncementModal}
          />
        )}

        {activeTab === 'media' && (
          <TabMedia
            trip={trip}
            mediaCalendar={data.mediaCalendar}
            mediaAssignments={data.mediaAssignments}
            shotList={data.shotList}
            addMediaCalendarItem={data.addMediaCalendarItem}
            updateMediaCalendarItem={data.updateMediaCalendarItem}
            deleteMediaCalendarItem={data.deleteMediaCalendarItem}
            addMediaAssignment={data.addMediaAssignment}
            deleteMediaAssignment={data.deleteMediaAssignment}
            addShotListItem={data.addShotListItem}
            toggleShotCaptured={data.toggleShotCaptured}
            deleteShotListItem={data.deleteShotListItem}
          />
        )}

        {activeTab === 'pipeline' && (
          <TabPipeline
            waitingList={data.waitingList}
            addWaitingListEntry={data.addWaitingListEntry}
            updateWaitingListEntry={data.updateWaitingListEntry}
            deleteWaitingListEntry={data.deleteWaitingListEntry}
            promoteToDelegate={data.promoteToDelegate}
          />
        )}

        {activeTab === 'prayer' && (
          <TabPrayer
            participants={data.participants}
            dailyFocus={data.dailyFocus}
            setShowDailyFocusModal={data.setShowDailyFocusModal}
          />
        )}

        {activeTab === 'notes' && (
          <TabNotes
            adminNotes={data.adminNotes}
            addAdminNote={data.addAdminNote}
            updateAdminNoteField={data.updateAdminNoteField}
            deleteAdminNote={data.deleteAdminNote}
            saveStatus={data.saveStatus}
          />
        )}
      </div>

      {/* Modals */}
      <ModalParticipantDetail
        participant={data.selectedParticipant}
        onClose={() => data.setSelectedParticipant(null)}
      />

      <ModalExpense
        show={data.showExpenseModal}
        onClose={() => data.setShowExpenseModal(false)}
        budgetCategories={data.budgetCategories}
        newExpense={data.newExpense}
        setNewExpense={data.setNewExpense}
        onSubmit={data.handleAddExpense}
      />

      <ModalAnnouncement
        show={data.showAnnouncementModal}
        onClose={() => data.setShowAnnouncementModal(false)}
        newAnnouncement={data.newAnnouncement}
        setNewAnnouncement={data.setNewAnnouncement}
        onSubmit={data.handleAddAnnouncement}
      />

      <ModalDailyFocus
        show={data.showDailyFocusModal}
        onClose={() => data.setShowDailyFocusModal(false)}
        newDailyFocus={data.newDailyFocus}
        setNewDailyFocus={data.setNewDailyFocus}
        onSubmit={data.handleAddDailyFocus}
      />
    </div>
  )
}
