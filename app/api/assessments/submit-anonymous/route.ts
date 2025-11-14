import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface SpiritualGiftScores {
  [giftName: string]: {
    score: number
    percentage: number
  }
}

interface SeasonalScores {
  [seasonName: string]: number
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { assessment_id, email, responses_json, ip_address } = body

    if (!assessment_id || !responses_json) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields'
        },
        { status: 400 }
      )
    }

    // Get assessment details to determine type
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('id, slug, name')
      .eq('id', assessment_id)
      .single()

    if (assessmentError || !assessment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Assessment not found'
        },
        { status: 404 }
      )
    }

    // Get questions to properly calculate results
    const { data: questions } = await supabase
      .from('assessment_questions')
      .select('id, scoring_category, question_type')
      .eq('assessment_id', assessment_id)
      .order('order_number', { ascending: true })

    // Calculate results based on assessment type
    const results_json = calculateAssessmentResults(
      assessment.slug,
      responses_json,
      questions || []
    )

    const { data, error } = await supabase
      .from('assessment_responses_anonymous')
      .insert({
        assessment_id,
        email: email || null,
        responses_json,
        results_json,
        ip_address: ip_address || null,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Assessment submitted successfully',
        response_id: data.id,
        results: results_json
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error submitting anonymous assessment:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit assessment'
      },
      { status: 500 }
    )
  }
}

function calculateAssessmentResults(
  assessmentSlug: string,
  responses: any,
  questions: any[]
) {
  const calculatedAt = new Date().toISOString()

  switch (assessmentSlug) {
    case 'spiritual-gifts':
      return calculateSpiritualGiftsResults(responses, questions, calculatedAt)

    case 'seasonal':
      return calculateSeasonalResults(responses, questions, calculatedAt)

    case 'prophetic-expression':
      return calculatePropheticExpressionResults(responses, questions, calculatedAt)

    case 'ministry-calling':
      return calculateMinistryCallingResults(responses, questions, calculatedAt)

    case 'redemptive-gifts':
      return calculateRedemptiveGiftsResults(responses, questions, calculatedAt)

    case 'spiritual-maturity':
      return calculateSpiritualMaturityResults(responses, questions, calculatedAt)

    default:
      return {
        scores: {},
        topResults: [],
        calculatedAt
      }
  }
}

function calculateSpiritualGiftsResults(
  responses: any,
  questions: any[],
  calculatedAt: string
) {
  const giftScores: SpiritualGiftScores = {}

  // Tally up scores by gift category
  questions.forEach((question, index) => {
    const questionId = (index + 1).toString()
    const response = responses[questionId]
    const category = question.scoring_category

    if (category && response) {
      if (!giftScores[category]) {
        giftScores[category] = { score: 0, percentage: 0 }
      }
      // Assuming Likert scale 1-5
      giftScores[category].score += parseInt(response) || 0
    }
  })

  // Calculate percentages (assuming max score per gift is 10 questions × 5 = 50)
  // Adjust based on actual question distribution
  Object.keys(giftScores).forEach(gift => {
    const maxPossible = 25 // Adjust based on questions per gift
    giftScores[gift].percentage = Math.round(
      (giftScores[gift].score / maxPossible) * 100
    )
  })

  // Get top 3 gifts
  const topResults = Object.entries(giftScores)
    .sort(([, a], [, b]) => b.score - a.score)
    .slice(0, 3)
    .map(([gift, data]) => ({
      gift,
      score: data.score,
      percentage: data.percentage
    }))

  return {
    type: 'spiritual-gifts',
    giftScores,
    topResults,
    calculatedAt
  }
}

function calculateSeasonalResults(
  responses: any,
  questions: any[],
  calculatedAt: string
) {
  // Season mapping based on question patterns
  const seasonScores: SeasonalScores = {
    'Planting Season': 0,
    'Growth Season': 0,
    'Harvest Season': 0,
    'Rest Season': 0,
    'Waiting Season': 0,
    'Pruning Season': 0
  }

  // Analyze responses to determine season
  // Questions 1-5 indicate growth/energy
  const growthIndicators = [1, 3, 6, 8, 10, 11, 13, 15]
  const waitingIndicators = [2, 5, 7, 12, 14]
  const challengeIndicators = [9, 12]
  const harvestIndicators = [6, 10, 13]

  growthIndicators.forEach(q => {
    const response = parseInt(responses[q.toString()]) || 0
    if (response >= 4) seasonScores['Growth Season'] += response
  })

  waitingIndicators.forEach(q => {
    const response = parseInt(responses[q.toString()]) || 0
    if (response >= 4) seasonScores['Waiting Season'] += response
  })

  challengeIndicators.forEach(q => {
    const response = parseInt(responses[q.toString()]) || 0
    if (response >= 4) seasonScores['Pruning Season'] += response
  })

  harvestIndicators.forEach(q => {
    const response = parseInt(responses[q.toString()]) || 0
    if (response >= 4) seasonScores['Harvest Season'] += response
  })

  // Determine primary season
  const primarySeason = Object.entries(seasonScores)
    .sort(([, a], [, b]) => b - a)[0]

  // Get top 1-3 seasons
  const topResults = Object.entries(seasonScores)
    .sort(([, a], [, b]) => b - a)
    .filter(([, score]) => score > 0)
    .slice(0, 2)
    .map(([season, score]) => ({
      season,
      score,
      isPrimary: season === primarySeason[0]
    }))

  return {
    type: 'seasonal',
    seasonScores,
    primarySeason: primarySeason[0],
    topResults,
    calculatedAt
  }
}

function calculatePropheticExpressionResults(
  responses: any,
  questions: any[],
  calculatedAt: string
) {
  const expressionScores: { [key: string]: number } = {
    'Seer': 0,
    'Prophet': 0,
    'Intercessor': 0,
    'Revelatory Worship': 0,
    'Prophetic Acts': 0
  }

  // Map questions to expression types based on scoring_category
  questions.forEach((question, index) => {
    const questionId = (index + 1).toString()
    const response = parseInt(responses[questionId]) || 0
    const category = question.scoring_category

    if (category && expressionScores.hasOwnProperty(category)) {
      expressionScores[category] += response
    }
  })

  const topResults = Object.entries(expressionScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([expression, score]) => ({
      expression,
      score,
      percentage: Math.round((score / 20) * 100) // Adjust based on questions
    }))

  return {
    type: 'prophetic-expression',
    expressionScores,
    topResults,
    calculatedAt
  }
}

function calculateMinistryCallingResults(
  responses: any,
  questions: any[],
  calculatedAt: string
) {
  const callingScores: { [key: string]: number } = {
    'Teaching': 0,
    'Pastoral Care': 0,
    'Evangelism': 0,
    'Worship': 0,
    'Administration': 0,
    'Missions': 0,
    'Prayer Ministry': 0
  }

  questions.forEach((question, index) => {
    const questionId = (index + 1).toString()
    const response = parseInt(responses[questionId]) || 0
    const category = question.scoring_category

    if (category && callingScores.hasOwnProperty(category)) {
      callingScores[category] += response
    }
  })

  const topResults = Object.entries(callingScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([calling, score]) => ({
      calling,
      score,
      percentage: Math.round((score / 15) * 100)
    }))

  return {
    type: 'ministry-calling',
    callingScores,
    topResults,
    calculatedAt
  }
}

function calculateRedemptiveGiftsResults(
  responses: any,
  questions: any[],
  calculatedAt: string
) {
  const giftScores: { [key: string]: number } = {
    'Prophet': 0,
    'Servant': 0,
    'Teacher': 0,
    'Exhorter': 0,
    'Giver': 0,
    'Ruler': 0,
    'Mercy': 0
  }

  questions.forEach((question, index) => {
    const questionId = (index + 1).toString()
    const response = parseInt(responses[questionId]) || 0
    const category = question.scoring_category

    if (category && giftScores.hasOwnProperty(category)) {
      giftScores[category] += response
    }
  })

  const topResults = Object.entries(giftScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([gift, score]) => ({
      gift,
      score,
      percentage: Math.round((score / 20) * 100)
    }))

  return {
    type: 'redemptive-gifts',
    giftScores,
    primaryGift: topResults[0]?.gift || 'Unknown',
    secondaryGift: topResults[1]?.gift || 'Unknown',
    topResults,
    calculatedAt
  }
}

function calculateSpiritualMaturityResults(
  responses: any,
  questions: any[],
  calculatedAt: string
) {
  const categoryScores: { [key: string]: number } = {
    'Biblical Knowledge': 0,
    'Prayer Life': 0,
    'Character Development': 0,
    'Service & Ministry': 0,
    'Spiritual Disciplines': 0
  }

  questions.forEach((question, index) => {
    const questionId = (index + 1).toString()
    const response = parseInt(responses[questionId]) || 0
    const category = question.scoring_category

    if (category && categoryScores.hasOwnProperty(category)) {
      categoryScores[category] += response
    }
  })

  // Calculate overall maturity level
  const totalScore = Object.values(categoryScores).reduce((a, b) => a + b, 0)
  const maxScore = questions.length * 5
  const overallPercentage = Math.round((totalScore / maxScore) * 100)

  let maturityLevel = 'Developing'
  if (overallPercentage >= 80) maturityLevel = 'Mature'
  else if (overallPercentage >= 60) maturityLevel = 'Growing'
  else if (overallPercentage >= 40) maturityLevel = 'Developing'
  else maturityLevel = 'Beginning'

  // Identify strengths and growth areas
  const strengths = Object.entries(categoryScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([category]) => category)

  const growthAreas = Object.entries(categoryScores)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 2)
    .map(([category]) => category)

  return {
    type: 'spiritual-maturity',
    categoryScores,
    overallPercentage,
    maturityLevel,
    strengths,
    growthAreas,
    calculatedAt
  }
}
