import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  calculateAssessmentResult,
  type AssessmentResponse,
} from '@/lib/assessments/calculator'

export const dynamic = 'force-dynamic'

// Server-side assessment submission. Computes the result and writes both the
// completed response and the result row with the service role, so the public
// tables don't need a blanket anon INSERT/SELECT (which would otherwise leak
// every visitor's email and results to anyone holding the anon key).
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const assessmentType: string = (body?.assessment_type ?? '').toString()
    const responses: AssessmentResponse = body?.responses ?? {}
    const email: string | null = body?.email ? String(body.email) : null
    const responseId: string | null = body?.responseId ? String(body.responseId) : null

    if (!assessmentType || typeof responses !== 'object' || Array.isArray(responses)) {
      return NextResponse.json({ error: 'assessment_type and responses are required' }, { status: 400 })
    }

    // Derive the member from the authenticated session — never trust a
    // client-supplied member_id.
    let memberId: string | null = null
    try {
      const userClient = await createClient()
      const { data: { user } } = await userClient.auth.getUser()
      if (user) {
        const { data: member } = await userClient
          .from('members')
          .select('id')
          .eq('user_id', user.id)
          .single()
        memberId = member?.id ?? null
      }
    } catch {
      // Anonymous submission — memberId stays null.
    }

    const admin = createAdminClient()
    const now = new Date().toISOString()

    // 1. Persist the completed response (update an existing draft if provided).
    let finalResponseId = responseId
    if (responseId) {
      await admin
        .from('assessment_responses')
        .update({ responses, completed_at: now })
        .eq('id', responseId)
    } else {
      const { data: respData, error: respError } = await admin
        .from('assessment_responses')
        .insert({
          member_id: memberId,
          assessment_type: assessmentType,
          email,
          responses,
          completed_at: now,
        })
        .select('id')
        .single()
      if (respError) throw respError
      finalResponseId = respData.id
    }

    // 2. Compute the result deterministically on the server.
    const result = calculateAssessmentResult(assessmentType, responses)

    // 3. Persist the result row.
    const { data: resultData, error: resultError } = await admin
      .from('member_assessment_results')
      .insert({
        response_id: finalResponseId,
        member_id: memberId,
        assessment_type: assessmentType,
        // Legacy NOT NULL / companion columns kept in sync with the flat result.
        responses_json: responses,
        results_json: result,
        primary_result: result.primary_result,
        secondary_result: result.secondary_result,
        tertiary_result: result.tertiary_result,
        scores: result.scores,
        title: result.title,
        description: result.description,
        strengths: result.strengths,
        growth_areas: result.growth_areas,
        ministry_recommendations: result.ministry_recommendations,
        scripture_references: result.scripture_references,
        next_steps: result.next_steps,
      })
      .select('id')
      .single()

    if (resultError) throw resultError

    // 4. Sync the member's spiritual profile so the AI (Prophet Lorenzo) and
    //    personalization features actually know the result. Logged-in only;
    //    never let a profile failure break the submission.
    if (memberId) {
      try {
        const profile: Record<string, unknown> = {
          member_id: memberId,
          strengths: result.strengths,
          growth_areas: result.growth_areas,
          updated_at: now,
        }
        if (assessmentType === 'spiritual-gifts') {
          profile.primary_gift = result.primary_result
          profile.secondary_gifts = [result.secondary_result, result.tertiary_result].filter(Boolean)
          profile.gift_scores = result.scores
        }
        if (assessmentType === 'seasonal') {
          profile.current_season = result.primary_result
          profile.season_started_at = now
        }
        await admin
          .from('member_spiritual_profiles')
          .upsert(profile, { onConflict: 'member_id' })
      } catch (profileError) {
        console.error('Spiritual profile sync failed (non-fatal):', profileError)
      }
    }

    return NextResponse.json({ resultId: resultData.id, responseId: finalResponseId })
  } catch (error) {
    console.error('Assessment submit error:', error)
    return NextResponse.json({ error: 'Failed to submit assessment' }, { status: 500 })
  }
}
