'use client'

import { ImpactJournal } from './impact-journal'
import type { DelegateData } from './use-delegate-data'

interface TabJournalProps {
  data: DelegateData
}

export function TabJournal({ data }: TabJournalProps) {
  const { trip, participant } = data

  if (!trip || !participant) return null

  return <ImpactJournal tripId={trip.id} participantId={participant.id} />
}
