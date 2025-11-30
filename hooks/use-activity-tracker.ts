import { useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface TrackActivityParams {
  memberId: string
  activityType:
    | 'page_view'
    | 'content_read'
    | 'prayer_submitted'
    | 'journal_entry'
    | 'assessment_completed'
    | 'course_progress'
    | 'devotional_read'
    | 'prophecy_viewed'
    | 'ai_chat'
    | 'giving'
    | 'event_registered'
    | 'message_sent'
  resourceType?: string
  resourceId?: string
  resourceName?: string
  pagePath?: string
  durationSeconds?: number
  metadata?: Record<string, any>
}

export function useActivityTracker() {
  const trackActivity = useCallback(async (params: TrackActivityParams) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.from('member_activity').insert({
        member_id: params.memberId,
        activity_type: params.activityType,
        resource_type: params.resourceType,
        resource_id: params.resourceId,
        resource_name: params.resourceName,
        page_path: params.pagePath || (typeof window !== 'undefined' ? window.location.pathname : null),
        duration_seconds: params.durationSeconds,
        metadata: params.metadata || {}
      })

      if (error) {
        console.error('Error tracking activity:', error)
      }
    } catch (error) {
      console.error('Error tracking activity:', error)
    }
  }, [])

  // Convenience methods
  const trackPageView = useCallback((memberId: string, pagePath?: string) => {
    trackActivity({
      memberId,
      activityType: 'page_view',
      pagePath
    })
  }, [trackActivity])

  const trackDevotionalRead = useCallback((memberId: string, devotionalId: string, title: string) => {
    trackActivity({
      memberId,
      activityType: 'devotional_read',
      resourceType: 'devotional',
      resourceId: devotionalId,
      resourceName: title
    })
  }, [trackActivity])

  const trackJournalEntry = useCallback((memberId: string, entryId: string, mood?: string) => {
    trackActivity({
      memberId,
      activityType: 'journal_entry',
      resourceType: 'journal',
      resourceId: entryId,
      metadata: { mood }
    })
  }, [trackActivity])

  const trackPrayerSubmitted = useCallback((memberId: string, prayerId: string, isPublic: boolean) => {
    trackActivity({
      memberId,
      activityType: 'prayer_submitted',
      resourceType: 'prayer',
      resourceId: prayerId,
      metadata: { is_public: isPublic }
    })
  }, [trackActivity])

  const trackCourseProgress = useCallback((
    memberId: string,
    courseId: string,
    courseName: string,
    lessonId: string,
    lessonName: string,
    progressPercent: number
  ) => {
    trackActivity({
      memberId,
      activityType: 'course_progress',
      resourceType: 'course',
      resourceId: courseId,
      resourceName: courseName,
      metadata: {
        lesson_id: lessonId,
        lesson_name: lessonName,
        progress_percent: progressPercent
      }
    })
  }, [trackActivity])

  const trackAssessmentCompleted = useCallback((
    memberId: string,
    assessmentId: string,
    assessmentName: string,
    results: Record<string, any>
  ) => {
    trackActivity({
      memberId,
      activityType: 'assessment_completed',
      resourceType: 'assessment',
      resourceId: assessmentId,
      resourceName: assessmentName,
      metadata: { results }
    })
  }, [trackActivity])

  const trackProphecyViewed = useCallback((memberId: string, prophecyId: string) => {
    trackActivity({
      memberId,
      activityType: 'prophecy_viewed',
      resourceType: 'prophecy',
      resourceId: prophecyId
    })
  }, [trackActivity])

  const trackGiving = useCallback((memberId: string, amount: number, givingType: string) => {
    trackActivity({
      memberId,
      activityType: 'giving',
      resourceType: 'donation',
      metadata: { amount, giving_type: givingType }
    })
  }, [trackActivity])

  return {
    trackActivity,
    trackPageView,
    trackDevotionalRead,
    trackJournalEntry,
    trackPrayerSubmitted,
    trackCourseProgress,
    trackAssessmentCompleted,
    trackProphecyViewed,
    trackGiving
  }
}
