import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const getAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const getAuthClient = async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin
    const authClient = await getAuthClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member } = await authClient
      .from('members')
      .select('is_admin')
      .eq('user_id', user.id)
      .single()

    if (!member?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const supabase = getAdminClient()
    const results: string[] = []

    // ============================================
    // INTRODUCTION TO THE BIBLE - QUIZZES
    // ============================================

    // Get Module 1: The Big Picture
    const { data: bibleM1 } = await supabase
      .from('plant_modules')
      .select('id, course_id')
      .eq('slug', 'the-big-picture')
      .single()

    if (bibleM1) {
      // Delete existing quiz for this module
      await supabase.from('plant_quizzes').delete().eq('module_id', bibleM1.id)

      // Create quiz
      const { data: quiz1 } = await supabase
        .from('plant_quizzes')
        .insert({
          module_id: bibleM1.id,
          name: 'The Big Picture Quiz',
          description: 'Test your understanding of what the Bible is and its main message',
          passing_score: 70,
          max_attempts: 3,
          shuffle_questions: true,
          show_correct_answers: true,
          is_active: true
        })
        .select()
        .single()

      if (quiz1) {
        await supabase.from('plant_quiz_questions').insert([
          {
            quiz_id: quiz1.id,
            question_type: 'multiple_choice',
            question_text: 'How many books are in the Bible?',
            options: JSON.stringify([
              { id: 'a', text: '39', is_correct: false },
              { id: 'b', text: '66', is_correct: true },
              { id: 'c', text: '72', is_correct: false },
              { id: 'd', text: '27', is_correct: false }
            ]),
            explanation: 'The Bible contains 66 books: 39 in the Old Testament and 27 in the New Testament.',
            points: 1,
            sequence_order: 1
          },
          {
            quiz_id: quiz1.id,
            question_type: 'multiple_choice',
            question_text: 'What does "God-breathed" (2 Timothy 3:16) mean about Scripture?',
            options: JSON.stringify([
              { id: 'a', text: 'God physically breathed on the pages', is_correct: false },
              { id: 'b', text: 'The Bible was inspired by God through human authors', is_correct: true },
              { id: 'c', text: 'Only some parts of the Bible are from God', is_correct: false },
              { id: 'd', text: 'The Bible should be read while taking deep breaths', is_correct: false }
            ]),
            explanation: '"God-breathed" means that Scripture was divinely inspired—God worked through human authors to communicate His truth.',
            points: 1,
            sequence_order: 2
          },
          {
            quiz_id: quiz1.id,
            question_type: 'true_false',
            question_text: 'The Old Testament was written after Jesus\' resurrection.',
            correct_answer: false,
            explanation: 'The Old Testament was written before Jesus came, covering creation through about 400 BC. The New Testament was written after Jesus\' resurrection.',
            points: 1,
            sequence_order: 3
          },
          {
            quiz_id: quiz1.id,
            question_type: 'multiple_choice',
            question_text: 'What is the central theme that runs through the entire Bible?',
            options: JSON.stringify([
              { id: 'a', text: 'Rules for living a good life', is_correct: false },
              { id: 'b', text: 'God\'s plan to rescue humanity through Jesus Christ', is_correct: true },
              { id: 'c', text: 'Historical records of ancient civilizations', is_correct: false },
              { id: 'd', text: 'Moral fables and allegories', is_correct: false }
            ]),
            explanation: 'The Bible tells one unified story: God\'s plan to rescue humanity and restore creation through Jesus Christ.',
            points: 1,
            sequence_order: 4
          },
          {
            quiz_id: quiz1.id,
            question_type: 'multiple_choice',
            question_text: 'Which of these is NOT one of the four "acts" in the Bible\'s story?',
            options: JSON.stringify([
              { id: 'a', text: 'Creation', is_correct: false },
              { id: 'b', text: 'Fall', is_correct: false },
              { id: 'c', text: 'Evolution', is_correct: true },
              { id: 'd', text: 'Redemption', is_correct: false }
            ]),
            explanation: 'The four acts of the Bible\'s story are: Creation, Fall, Redemption, and Restoration. Evolution is not part of this biblical framework.',
            points: 1,
            sequence_order: 5
          }
        ])
        results.push('Created quiz for "The Big Picture" module')
      }
    }

    // Get Module 2: How to Read the Bible
    const { data: bibleM2 } = await supabase
      .from('plant_modules')
      .select('id')
      .eq('slug', 'how-to-read-the-bible')
      .single()

    if (bibleM2) {
      await supabase.from('plant_quizzes').delete().eq('module_id', bibleM2.id)

      const { data: quiz2 } = await supabase
        .from('plant_quizzes')
        .insert({
          module_id: bibleM2.id,
          name: 'How to Read the Bible Quiz',
          description: 'Test your understanding of Bible reading methods and interpretation',
          passing_score: 70,
          max_attempts: 3,
          shuffle_questions: true,
          show_correct_answers: true,
          is_active: true
        })
        .select()
        .single()

      if (quiz2) {
        await supabase.from('plant_quiz_questions').insert([
          {
            quiz_id: quiz2.id,
            question_type: 'multiple_choice',
            question_text: 'What does "context is king" mean in Bible interpretation?',
            options: JSON.stringify([
              { id: 'a', text: 'The Bible was written for kings', is_correct: false },
              { id: 'b', text: 'Understanding surrounding verses is essential for correct interpretation', is_correct: true },
              { id: 'c', text: 'Only read passages about royalty', is_correct: false },
              { id: 'd', text: 'The most important context is your personal situation', is_correct: false }
            ]),
            explanation: 'Context is king means we must read verses in their surrounding context (verses, chapter, book, and whole Bible) to understand them correctly.',
            points: 1,
            sequence_order: 1
          },
          {
            quiz_id: quiz2.id,
            question_type: 'multiple_choice',
            question_text: 'What does SOAP stand for in Bible reading?',
            options: JSON.stringify([
              { id: 'a', text: 'Study, Observe, Apply, Pray', is_correct: false },
              { id: 'b', text: 'Scripture, Observation, Application, Prayer', is_correct: true },
              { id: 'c', text: 'Seek, Open, Ask, Praise', is_correct: false },
              { id: 'd', text: 'Scripture, Outline, Analyze, Proclaim', is_correct: false }
            ]),
            explanation: 'SOAP stands for Scripture (read it), Observation (what do you notice), Application (how does it apply), and Prayer (respond to God).',
            points: 1,
            sequence_order: 2
          },
          {
            quiz_id: quiz2.id,
            question_type: 'true_false',
            question_text: 'Proverbs should be read as absolute promises that always come true.',
            correct_answer: false,
            explanation: 'Proverbs are general wisdom principles, not absolute promises. They describe how things generally work, not guarantees for every situation.',
            points: 1,
            sequence_order: 3
          },
          {
            quiz_id: quiz2.id,
            question_type: 'multiple_choice',
            question_text: 'When reading narrative/historical books, what should you look for?',
            options: JSON.stringify([
              { id: 'a', text: 'Rules to follow exactly as the characters did', is_correct: false },
              { id: 'b', text: 'What the story teaches about God\'s character', is_correct: true },
              { id: 'c', text: 'Hidden codes and secret messages', is_correct: false },
              { id: 'd', text: 'Only the miraculous events', is_correct: false }
            ]),
            explanation: 'In narrative/historical books, look for what the story reveals about God\'s character and His work. Not every action recorded is endorsed—some characters make bad choices.',
            points: 1,
            sequence_order: 4
          },
          {
            quiz_id: quiz2.id,
            question_type: 'multiple_choice',
            question_text: 'Which book is recommended as a good starting point for new Bible readers?',
            options: JSON.stringify([
              { id: 'a', text: 'Leviticus', is_correct: false },
              { id: 'b', text: 'Revelation', is_correct: false },
              { id: 'c', text: 'The Gospel of John', is_correct: true },
              { id: 'd', text: 'Numbers', is_correct: false }
            ]),
            explanation: 'The Gospel of John is an excellent starting point because it clearly presents who Jesus is and why He came. It was written specifically to help readers believe.',
            points: 1,
            sequence_order: 5
          }
        ])
        results.push('Created quiz for "How to Read the Bible" module')
      }
    }

    // ============================================
    // PRAYER FOUNDATIONS - QUIZZES
    // ============================================

    // Get Module 1: Understanding Prayer
    const { data: prayerM1 } = await supabase
      .from('plant_modules')
      .select('id')
      .eq('slug', 'understanding-prayer')
      .single()

    if (prayerM1) {
      await supabase.from('plant_quizzes').delete().eq('module_id', prayerM1.id)

      const { data: quiz3 } = await supabase
        .from('plant_quizzes')
        .insert({
          module_id: prayerM1.id,
          name: 'Understanding Prayer Quiz',
          description: 'Test your understanding of the foundations of prayer',
          passing_score: 70,
          max_attempts: 3,
          shuffle_questions: true,
          show_correct_answers: true,
          is_active: true
        })
        .select()
        .single()

      if (quiz3) {
        await supabase.from('plant_quiz_questions').insert([
          {
            quiz_id: quiz3.id,
            question_type: 'multiple_choice',
            question_text: 'At its core, what is prayer?',
            options: JSON.stringify([
              { id: 'a', text: 'A religious ritual to earn God\'s favor', is_correct: false },
              { id: 'b', text: 'Conversation and relationship with God', is_correct: true },
              { id: 'c', text: 'A way to get what you want from God', is_correct: false },
              { id: 'd', text: 'Something only for emergencies', is_correct: false }
            ]),
            explanation: 'Prayer is fundamentally conversation with God—a two-way relationship where we speak and listen.',
            points: 1,
            sequence_order: 1
          },
          {
            quiz_id: quiz3.id,
            question_type: 'true_false',
            question_text: 'Jesus, being God, did not need to pray.',
            correct_answer: false,
            explanation: 'Jesus prayed constantly! He prayed before major decisions, in times of stress, and withdrew regularly to pray. If Jesus needed prayer, how much more do we?',
            points: 1,
            sequence_order: 2
          },
          {
            quiz_id: quiz3.id,
            question_type: 'multiple_choice',
            question_text: 'According to Hebrews 4:16, how should we approach God in prayer?',
            options: JSON.stringify([
              { id: 'a', text: 'With fear and trembling', is_correct: false },
              { id: 'b', text: 'Only when we feel worthy', is_correct: false },
              { id: 'c', text: 'With confidence to receive mercy and grace', is_correct: true },
              { id: 'd', text: 'Through religious leaders only', is_correct: false }
            ]),
            explanation: 'Hebrews 4:16 says we can approach God\'s throne of grace with confidence because of Jesus. We come boldly, not based on our worthiness but on Christ\'s finished work.',
            points: 1,
            sequence_order: 3
          },
          {
            quiz_id: quiz3.id,
            question_type: 'multiple_choice',
            question_text: 'What are the four common ways God answers prayer?',
            options: JSON.stringify([
              { id: 'a', text: 'Always, Sometimes, Rarely, Never', is_correct: false },
              { id: 'b', text: 'Yes, No, Wait, Something Better', is_correct: true },
              { id: 'c', text: 'Immediately, Eventually, Partially, Completely', is_correct: false },
              { id: 'd', text: 'Loudly, Quietly, Through Others, Not At All', is_correct: false }
            ]),
            explanation: 'God answers prayer with Yes (giving what we ask), No (protecting us from what\'s not best), Wait (developing our patience), or Something Better (exceeding our requests).',
            points: 1,
            sequence_order: 4
          },
          {
            quiz_id: quiz3.id,
            question_type: 'true_false',
            question_text: 'Prayer changes God\'s mind about His plans.',
            correct_answer: false,
            explanation: 'Prayer doesn\'t change God—He is unchanging. But prayer changes situations and it changes us. God has chosen to work through the prayers of His people.',
            points: 1,
            sequence_order: 5
          }
        ])
        results.push('Created quiz for "Understanding Prayer" module')
      }
    }

    // Get Module 3: Building a Prayer Life
    const { data: prayerM3 } = await supabase
      .from('plant_modules')
      .select('id')
      .eq('slug', 'building-a-prayer-life')
      .single()

    if (prayerM3) {
      await supabase.from('plant_quizzes').delete().eq('module_id', prayerM3.id)

      const { data: quiz4 } = await supabase
        .from('plant_quizzes')
        .insert({
          module_id: prayerM3.id,
          name: 'Building a Prayer Life Quiz',
          description: 'Test your understanding of practical prayer disciplines',
          passing_score: 70,
          max_attempts: 3,
          shuffle_questions: true,
          show_correct_answers: true,
          is_active: true
        })
        .select()
        .single()

      if (quiz4) {
        await supabase.from('plant_quiz_questions').insert([
          {
            quiz_id: quiz4.id,
            question_type: 'multiple_choice',
            question_text: 'What does ACTS stand for in the prayer framework?',
            options: JSON.stringify([
              { id: 'a', text: 'Ask, Confess, Thank, Seek', is_correct: false },
              { id: 'b', text: 'Adoration, Confession, Thanksgiving, Supplication', is_correct: true },
              { id: 'c', text: 'Approach, Communicate, Trust, Submit', is_correct: false },
              { id: 'd', text: 'Always, Consistently, Truthfully, Sincerely', is_correct: false }
            ]),
            explanation: 'ACTS stands for Adoration (praising God), Confession (acknowledging sin), Thanksgiving (expressing gratitude), and Supplication (presenting requests).',
            points: 1,
            sequence_order: 1
          },
          {
            quiz_id: quiz4.id,
            question_type: 'true_false',
            question_text: 'When praying Scripture, you are guaranteed to be praying according to God\'s will.',
            correct_answer: true,
            explanation: 'When you pray God\'s own words back to Him, you know you\'re praying according to His will. This is one of the most powerful ways to pray.',
            points: 1,
            sequence_order: 2
          },
          {
            quiz_id: quiz4.id,
            question_type: 'multiple_choice',
            question_text: 'According to Psalm 66:18, what can hinder our prayers?',
            options: JSON.stringify([
              { id: 'a', text: 'Not praying long enough', is_correct: false },
              { id: 'b', text: 'Not using the right words', is_correct: false },
              { id: 'c', text: 'Cherishing sin in our hearts', is_correct: true },
              { id: 'd', text: 'Praying at the wrong time of day', is_correct: false }
            ]),
            explanation: 'Psalm 66:18 says "If I had cherished sin in my heart, the Lord would not have listened." Unconfessed sin hinders our fellowship with God and our effectiveness in prayer.',
            points: 1,
            sequence_order: 3
          },
          {
            quiz_id: quiz4.id,
            question_type: 'multiple_choice',
            question_text: 'What should you do when you don\'t feel like praying?',
            options: JSON.stringify([
              { id: 'a', text: 'Wait until you feel spiritual', is_correct: false },
              { id: 'b', text: 'Skip prayer that day', is_correct: false },
              { id: 'c', text: 'Pray anyway—prayer is about faith, not feelings', is_correct: true },
              { id: 'd', text: 'Only pray short prayers', is_correct: false }
            ]),
            explanation: 'Prayer isn\'t about feelings—it\'s about faith. Feelings follow actions. Pray anyway, and trust that God hears you regardless of what you feel.',
            points: 1,
            sequence_order: 4
          },
          {
            quiz_id: quiz4.id,
            question_type: 'multiple_choice',
            question_text: 'What is one of the best ways to stay focused during prayer?',
            options: JSON.stringify([
              { id: 'a', text: 'Pray while watching TV', is_correct: false },
              { id: 'b', text: 'Pray out loud or write your prayers in a journal', is_correct: true },
              { id: 'c', text: 'Set a timer and rush through', is_correct: false },
              { id: 'd', text: 'Only pray short one-word prayers', is_correct: false }
            ]),
            explanation: 'Praying out loud or writing your prayers helps you stay focused and creates a record of God\'s faithfulness when you can look back at answered prayers.',
            points: 1,
            sequence_order: 5
          }
        ])
        results.push('Created quiz for "Building a Prayer Life" module')
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Quizzes created successfully',
      results
    })

  } catch (error: any) {
    console.error('Quiz creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
