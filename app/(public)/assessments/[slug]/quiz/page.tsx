'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, ArrowRight, Save, Shield } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { calculateAssessmentResult } from '@/lib/assessments/calculator'

interface Question {
  id: string
  text: string
  type: 'likert' | 'multiple-choice' | 'ranking' | 'select-all'
  options?: string[]
  relatedGift?: string
}

interface AssessmentQuestions {
  [key: string]: {
    title: string
    totalQuestions: number
    questions: Question[]
  }
}

export default function AssessmentQuizPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [responses, setResponses] = useState<{ [key: string]: any }>({})
  const [showEmailCapture, setShowEmailCapture] = useState(false)
  const [email, setEmail] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [memberId, setMemberId] = useState<string | null>(null)
  const [responseId, setResponseId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setIsLoggedIn(true)
        // Get member ID
        const { data: member } = await supabase
          .from('members')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (member) {
          setMemberId(member.id)
        }
      }
    }
    checkAuth()
  }, [])

  // Trigger email capture at question 5 for non-logged-in users
  useEffect(() => {
    if (currentQuestion === 5 && !isLoggedIn && !email) {
      setShowEmailCapture(true)
    }
  }, [currentQuestion, isLoggedIn, email])

  const assessmentQuestions: AssessmentQuestions = {
    'spiritual-gifts': {
      title: 'Spiritual Gifts Assessment',
      totalQuestions: 20,
      questions: [
        {
          id: '1',
          text: 'I enjoy organizing people, tasks, and events to accomplish a goal.',
          type: 'likert',
          relatedGift: 'administration',
        },
        {
          id: '2',
          text: 'I feel deeply moved when I see people in physical or emotional need.',
          type: 'likert',
          relatedGift: 'mercy',
        },
        {
          id: '3',
          text: 'I love studying Scripture and uncovering deeper biblical truths.',
          type: 'likert',
          relatedGift: 'teaching',
        },
        {
          id: '4',
          text: 'I find it natural to inspire and motivate others toward spiritual growth.',
          type: 'likert',
          relatedGift: 'exhortation',
        },
        {
          id: '5',
          text: 'I am quick to offer practical help when someone has a tangible need.',
          type: 'likert',
          relatedGift: 'serving',
        },
        {
          id: '6',
          text: 'I am generous with my resources and find joy in meeting financial needs.',
          type: 'likert',
          relatedGift: 'giving',
        },
        {
          id: '7',
          text: 'I can sense when something is spiritually true or false.',
          type: 'likert',
          relatedGift: 'discernment',
        },
        {
          id: '8',
          text: 'I enjoy leading others and providing clear direction for groups.',
          type: 'likert',
          relatedGift: 'leadership',
        },
        {
          id: '9',
          text: 'I believe God can do the impossible and I inspire others to trust Him.',
          type: 'likert',
          relatedGift: 'faith',
        },
        {
          id: '10',
          text: 'I receive insights from God about His plans and purposes.',
          type: 'likert',
          relatedGift: 'prophecy',
        },
        {
          id: '11',
          text: 'I enjoy caring for people\'s spiritual well-being over long periods.',
          type: 'likert',
          relatedGift: 'shepherding',
        },
        {
          id: '12',
          text: 'I easily explain biblical concepts in ways others can understand.',
          type: 'likert',
          relatedGift: 'teaching',
        },
        {
          id: '13',
          text: 'I naturally create systems and structures that help things run smoothly.',
          type: 'likert',
          relatedGift: 'administration',
        },
        {
          id: '14',
          text: 'I am drawn to serve those who are hurting, suffering, or marginalized.',
          type: 'likert',
          relatedGift: 'mercy',
        },
        {
          id: '15',
          text: 'I find great satisfaction in encouraging others to keep going.',
          type: 'likert',
          relatedGift: 'exhortation',
        },
        {
          id: '16',
          text: 'I prefer to work behind the scenes to support others\' ministries.',
          type: 'likert',
          relatedGift: 'serving',
        },
        {
          id: '17',
          text: 'I trust God will provide for me as I give generously to His work.',
          type: 'likert',
          relatedGift: 'giving',
        },
        {
          id: '18',
          text: 'I can identify spiritual deception or unhealthy influences.',
          type: 'likert',
          relatedGift: 'discernment',
        },
        {
          id: '19',
          text: 'I am confident taking responsibility for the spiritual direction of a group.',
          type: 'likert',
          relatedGift: 'leadership',
        },
        {
          id: '20',
          text: 'I believe God speaks through me to bring correction or encouragement.',
          type: 'likert',
          relatedGift: 'prophecy',
        },
      ],
    },
    'seasonal': {
      title: 'Seasonal Assessment',
      totalQuestions: 15,
      questions: [
        {
          id: '1',
          text: 'Right now, I feel spiritually energized and growing.',
          type: 'likert',
        },
        {
          id: '2',
          text: 'I am experiencing significant life changes or transitions.',
          type: 'likert',
        },
        {
          id: '3',
          text: 'I feel like God is teaching me new things regularly.',
          type: 'likert',
        },
        {
          id: '4',
          text: 'I sense God is preparing me for something bigger.',
          type: 'likert',
        },
        {
          id: '5',
          text: 'My spiritual practices feel dry or routine right now.',
          type: 'likert',
        },
        {
          id: '6',
          text: 'I am experiencing fruitfulness in ministry or service.',
          type: 'likert',
        },
        {
          id: '7',
          text: 'I feel like I\'m in a waiting period spiritually.',
          type: 'likert',
        },
        {
          id: '8',
          text: 'God feels very close and I\'m hearing Him clearly.',
          type: 'likert',
        },
        {
          id: '9',
          text: 'I\'m facing significant challenges or spiritual warfare.',
          type: 'likert',
        },
        {
          id: '10',
          text: 'I see evidence of breakthrough and answered prayers.',
          type: 'likert',
        },
        {
          id: '11',
          text: 'I feel hungry for more of God\'s presence.',
          type: 'likert',
        },
        {
          id: '12',
          text: 'My faith is being tested in significant ways.',
          type: 'likert',
        },
        {
          id: '13',
          text: 'I am seeing growth in areas I\'ve been working on.',
          type: 'likert',
        },
        {
          id: '14',
          text: 'I sense God is calling me to rest and renewal.',
          type: 'likert',
        },
        {
          id: '15',
          text: 'I feel aligned with God\'s purposes for my life right now.',
          type: 'likert',
        },
      ],
    },
  }

  const assessment = assessmentQuestions[params.slug] || assessmentQuestions['spiritual-gifts']
  const question = assessment.questions[currentQuestion - 1]
  const progress = (currentQuestion / assessment.totalQuestions) * 100

  const handleResponse = (value: any) => {
    setResponses({
      ...responses,
      [question.id]: value,
    })
  }

  const handleNext = () => {
    if (currentQuestion < assessment.totalQuestions) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSaveAndExit = async () => {
    setIsSaving(true)
    const supabase = createClient()

    try {
      if (responseId) {
        // Update existing response
        await supabase
          .from('assessment_responses')
          .update({
            responses: responses,
          })
          .eq('id', responseId)
      } else {
        // Create new response
        const { data, error } = await supabase
          .from('assessment_responses')
          .insert({
            member_id: memberId,
            assessment_type: params.slug,
            email: email || null,
            responses: responses,
          })
          .select()
          .single()

        if (error) throw error
        if (data) setResponseId(data.id)
      }

      toast({
        title: 'Progress Saved',
        description: 'Your responses have been saved. You can continue later.',
      })

      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving progress:', error)
      toast({
        title: 'Error',
        description: 'Failed to save progress. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    try {
      // Save to leads table
      await supabase
        .from('leads')
        .insert({
          email: email,
          source: `assessment-progress: ${params.slug}`,
          status: 'new',
        })

      // Create initial response record
      const { data, error } = await supabase
        .from('assessment_responses')
        .insert({
          assessment_type: params.slug,
          email: email,
          responses: responses,
        })
        .select()
        .single()

      if (error && !error.message?.includes('duplicate')) throw error
      if (data) setResponseId(data.id)

      toast({
        title: 'Email Saved',
        description: 'Your progress is now being saved!',
      })

      setShowEmailCapture(false)
    } catch (error) {
      console.error('Error capturing email:', error)
      // Continue anyway
      setShowEmailCapture(false)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const supabase = createClient()

    try {
      // 1. Save/update assessment response
      let finalResponseId = responseId

      if (responseId) {
        // Update existing response with completed_at
        await supabase
          .from('assessment_responses')
          .update({
            responses: responses,
            completed_at: new Date().toISOString(),
          })
          .eq('id', responseId)
      } else {
        // Create new response
        const { data, error } = await supabase
          .from('assessment_responses')
          .insert({
            member_id: memberId,
            assessment_type: params.slug,
            email: email || null,
            responses: responses,
            completed_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) throw error
        finalResponseId = data.id
      }

      // 2. Calculate results using our calculator
      const calculatedResult = calculateAssessmentResult(params.slug, responses)

      // 3. Save results to database
      const resultInsertData: any = {
        response_id: finalResponseId,
        assessment_type: params.slug,
        primary_result: calculatedResult.primary_result,
        secondary_result: calculatedResult.secondary_result,
        tertiary_result: calculatedResult.tertiary_result,
        scores: calculatedResult.scores,
        title: calculatedResult.title,
        description: calculatedResult.description,
        strengths: calculatedResult.strengths,
        growth_areas: calculatedResult.growth_areas,
        ministry_recommendations: calculatedResult.ministry_recommendations,
        scripture_references: calculatedResult.scripture_references,
        next_steps: calculatedResult.next_steps,
      }

      // Only include member_id if user is logged in
      if (memberId) {
        resultInsertData.member_id = memberId
      }

      const { data: resultData, error: resultError } = await supabase
        .from('assessment_results')
        .insert(resultInsertData)
        .select()
        .single()

      if (resultError) {
        console.error('Error saving results:', resultError)
        throw new Error(`Failed to save results: ${resultError.message}`)
      }

      if (!resultData || !resultData.id) {
        throw new Error('Results were saved but no ID was returned')
      }

      // 4. Redirect to results page with result ID
      router.push(`/assessments/${params.slug}/results?id=${resultData.id}`)
    } catch (error: any) {
      console.error('Error submitting assessment:', error)
      const errorMessage = error?.message || error?.details || 'Failed to submit assessment. Please try again.'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link
              href={`/assessments/${params.slug}`}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-navy transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Exit Assessment
            </Link>
            {isLoggedIn && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveAndExit}
                disabled={isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save & Continue Later'}
              </Button>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-navy">{assessment.title}</span>
              <span className="text-gray-600">
                Question {currentQuestion} of {assessment.totalQuestions}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 px-4 py-12">
        <div className="container mx-auto max-w-3xl">
          <Card className="border-2 border-navy/10">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-2xl font-semibold text-navy mb-8 text-center">
                {question.text}
              </h2>

              {/* Likert Scale */}
              {question.type === 'likert' && (
                <div className="space-y-6">
                  <div className="flex justify-between text-sm text-gray-600 px-4">
                    <span>Strongly Disagree</span>
                    <span>Strongly Agree</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        onClick={() => handleResponse(value)}
                        className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover:border-navy/30 ${
                          responses[question.id] === value
                            ? 'border-navy bg-navy/5'
                            : 'border-gray-200'
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-semibold transition-all ${
                            responses[question.id] === value
                              ? 'border-navy bg-navy text-white'
                              : 'border-gray-300 text-gray-600'
                          }`}
                        >
                          {value}
                        </div>
                        <span className="text-xs text-gray-600 text-center">
                          {value === 1 && 'Never'}
                          {value === 2 && 'Rarely'}
                          {value === 3 && 'Sometimes'}
                          {value === 4 && 'Often'}
                          {value === 5 && 'Always'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Multiple Choice */}
              {question.type === 'multiple-choice' && question.options && (
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleResponse(option)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:border-navy/30 ${
                        responses[question.id] === option
                          ? 'border-navy bg-navy/5'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            responses[question.id] === option
                              ? 'border-navy bg-navy'
                              : 'border-gray-300'
                          }`}
                        >
                          {responses[question.id] === option && (
                            <div className="w-3 h-3 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className="text-gray-700">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={!responses[question.id] || isSubmitting}
              className="bg-navy hover:bg-navy/90"
            >
              {isSubmitting ? 'Calculating...' : currentQuestion === assessment.totalQuestions ? 'See Results' : 'Next'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Email Capture Dialog */}
      <Dialog open={showEmailCapture} onOpenChange={setShowEmailCapture}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-navy">Save Your Progress</DialogTitle>
            <DialogDescription>
              Enter your email to save your responses and receive your complete results when finished.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div className="flex items-start gap-2 text-sm text-gray-600">
              <Shield className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p>We respect your privacy. Unsubscribe anytime.</p>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1 bg-navy hover:bg-navy/90">
                Save Progress
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEmailCapture(false)}
              >
                Skip
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
