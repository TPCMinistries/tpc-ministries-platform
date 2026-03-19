'use client'

import { PaymentTracker } from './payment-tracker'
import { FundraisingManager } from './fundraising-manager'
import type { DelegateData } from './use-delegate-data'

interface TabFinancesProps {
  data: DelegateData
}

export function TabFinances({ data }: TabFinancesProps) {
  const { participant, donations } = data

  if (!participant) return null

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Payment Tracker */}
      <PaymentTracker participant={participant} donations={donations} />

      {/* Fundraising Manager (spans 2 columns) */}
      <FundraisingManager
        participant={participant}
        donations={donations}
        onUpdate={data.refetch}
        onSubmitManualDonation={data.submitManualDonation}
        onSavePersonalization={data.savePersonalization}
        onUploadPhoto={data.uploadPhoto}
        uploadingPhoto={data.uploadingPhoto}
      />
    </div>
  )
}
