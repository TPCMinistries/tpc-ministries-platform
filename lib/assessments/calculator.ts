/**
 * Assessment Result Calculator
 *
 * This module handles the calculation of assessment results based on user responses.
 * Each assessment type has its own calculation logic.
 */

export interface AssessmentResponse {
  [questionId: string]: number | string | string[]
}

export interface AssessmentResult {
  primary_result: string
  secondary_result: string
  tertiary_result: string
  scores: { [key: string]: number }
  title: string
  description: string
  strengths: string[]
  growth_areas: string[]
  ministry_recommendations: string[]
  scripture_references: string[]
  next_steps: string[]
}

/**
 * Calculate Spiritual Gifts Assessment Results
 */
export function calculateSpiritualGifts(responses: AssessmentResponse): AssessmentResult {
  // Map of gifts to their question IDs
  const giftQuestions: { [gift: string]: string[] } = {
    administration: ['1', '13'],
    mercy: ['2', '14'],
    teaching: ['3', '12'],
    exhortation: ['4', '15'],
    serving: ['5', '16'],
    giving: ['6', '17'],
    discernment: ['7', '18'],
    leadership: ['8', '19'],
    faith: ['9'],
    prophecy: ['10', '20'],
    shepherding: ['11'],
  }

  // Calculate scores for each gift
  const scores: { [gift: string]: number } = {}
  for (const [gift, questionIds] of Object.entries(giftQuestions)) {
    const total = questionIds.reduce((sum, qId) => {
      return sum + (Number(responses[qId]) || 0)
    }, 0)
    // Average score (out of 5) for this gift
    scores[gift] = Math.round((total / questionIds.length) * 20) // Convert to percentage
  }

  // Sort gifts by score
  const sortedGifts = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([gift]) => gift)

  const [primary, secondary, tertiary] = sortedGifts

  // Gift descriptions
  const giftDescriptions: { [key: string]: any } = {
    administration: {
      title: 'Administration',
      description: 'You excel at organizing people, tasks, and resources to accomplish Kingdom goals efficiently.',
      strengths: [
        'Creating and implementing effective systems',
        'Managing complex projects and timelines',
        'Bringing order to chaos',
        'Coordinating multiple team members',
      ],
      growth_areas: [
        'Remember that people matter more than processes',
        'Be flexible when plans need to change',
        'Include others in decision-making',
      ],
      ministries: ['Church operations', 'Event coordination', 'Ministry logistics', 'Volunteer coordination'],
      scriptures: ['1 Corinthians 12:28', 'Romans 12:8', 'Luke 14:28-30'],
      next_steps: [
        'Volunteer to help organize an upcoming church event',
        'Offer to create systems for a ministry that needs structure',
        'Study biblical examples of administration (Nehemiah, Joseph)',
      ],
    },
    mercy: {
      title: 'Mercy',
      description: 'You have a special ability to feel and demonstrate compassion for those who are suffering.',
      strengths: [
        'Deep empathy for those in pain',
        'Creating safe spaces for hurting people',
        'Providing comfort in times of crisis',
        'Seeing beyond surface issues to root pain',
      ],
      growth_areas: [
        'Set healthy boundaries to avoid burnout',
        'Balance compassion with truth-telling',
        'Don\'t enable unhealthy patterns',
      ],
      ministries: ['Hospital visitation', 'Grief support', 'Recovery ministries', 'Homeless outreach'],
      scriptures: ['Romans 12:8', 'Matthew 5:7', 'Luke 10:33-37'],
      next_steps: [
        'Join a care ministry or visiting team',
        'Reach out to someone going through a difficult time',
        'Study how Jesus showed mercy while calling people to change',
      ],
    },
    teaching: {
      title: 'Teaching',
      description: 'You have the ability to study, understand, and clearly communicate biblical truth to others.',
      strengths: [
        'Breaking down complex concepts',
        'Thorough biblical study and research',
        'Making Scripture practical and applicable',
        'Helping others grow in understanding',
      ],
      growth_areas: [
        'Balance knowledge with application',
        'Remember transformation trumps information',
        'Stay humble about what you don\'t know',
      ],
      ministries: ['Small group leadership', 'Bible study facilitation', 'Sunday school', 'Discipleship'],
      scriptures: ['Romans 12:7', 'James 3:1', '2 Timothy 2:2'],
      next_steps: [
        'Lead or co-lead a Bible study or small group',
        'Develop a teaching on a topic God has taught you',
        'Find a mentor to develop your teaching gift further',
      ],
    },
    exhortation: {
      title: 'Exhortation/Encouragement',
      description: 'You naturally motivate, encourage, and inspire others toward spiritual growth and perseverance.',
      strengths: [
        'Seeing potential in people',
        'Speaking life and hope into difficult situations',
        'Motivating others to keep going',
        'Coming alongside people in their journey',
      ],
      growth_areas: [
        'Sometimes people need to sit in their pain before moving forward',
        'Balance encouragement with allowing consequences',
        'Not everyone wants to be cheered up immediately',
      ],
      ministries: ['Mentoring', 'Coaching', 'Recovery support', 'New believer follow-up'],
      scriptures: ['Romans 12:8', 'Acts 4:36', 'Hebrews 10:24-25'],
      next_steps: [
        'Reach out to 3 people this week with specific encouragement',
        'Join a mentoring or discipleship ministry',
        'Study how Barnabas encouraged Paul and others',
      ],
    },
    serving: {
      title: 'Serving/Helps',
      description: 'You find joy in meeting practical needs and supporting others\' ministries behind the scenes.',
      strengths: [
        'Spotting needs before being asked',
        'Working diligently without recognition',
        'Practical problem-solving',
        'Freeing others to use their gifts',
      ],
      growth_areas: [
        'Don\'t say yes to everything - protect your capacity',
        'It\'s okay to be recognized for your service',
        'Serving doesn\'t mean being taken advantage of',
      ],
      ministries: ['Setup/teardown teams', 'Hospitality', 'Practical assistance', 'Maintenance'],
      scriptures: ['Romans 12:7', 'Galatians 6:10', 'Mark 10:45'],
      next_steps: [
        'Join a serving team (setup, hospitality, etc.)',
        'Offer practical help to a ministry or ministry leader',
        'Study how Jesus served even while leading',
      ],
    },
    giving: {
      title: 'Giving',
      description: 'You have a God-given ability to generate resources and generously support Kingdom work.',
      strengths: [
        'Trusting God with your finances',
        'Finding joy in sacrificial generosity',
        'Seeing investment opportunities for the Kingdom',
        'Managing resources wisely',
      ],
      growth_areas: [
        'Money isn\'t the answer to every problem',
        'Give relationally, not just financially',
        'Your value isn\'t in what you give',
      ],
      ministries: ['Missions support', 'Building projects', 'Scholarship funds', 'Ministry sponsorship'],
      scriptures: ['Romans 12:8', '2 Corinthians 9:6-7', 'Acts 4:32-37'],
      next_steps: [
        'Pray about increasing your giving percentage',
        'Sponsor a ministry or missionary long-term',
        'Study biblical principles of generosity (2 Corinthians 8-9)',
      ],
    },
    discernment: {
      title: 'Discernment',
      description: 'You have spiritual insight to distinguish between truth and error, good and evil spirits.',
      strengths: [
        'Sensing spiritual dynamics in situations',
        'Detecting deception or false teaching',
        'Protecting others from spiritual harm',
        'Understanding motivations and spiritual roots',
      ],
      growth_areas: [
        'Discernment without love becomes critical and judgmental',
        'Share insights with wisdom and timing',
        'Not everyone will receive what you see',
      ],
      ministries: ['Leadership advisory', 'Prayer ministry', 'Counseling support', 'Spiritual warfare'],
      scriptures: ['1 Corinthians 12:10', 'Hebrews 5:14', '1 John 4:1'],
      next_steps: [
        'Join a prayer or intercession team',
        'Study how to test spirits biblically (1 John 4)',
        'Find mature believers to help you develop this gift',
      ],
    },
    leadership: {
      title: 'Leadership',
      description: 'You have the ability to cast vision, make decisions, and guide groups toward God-honoring goals.',
      strengths: [
        'Seeing the big picture and future vision',
        'Making decisions with confidence',
        'Inspiring others to follow',
        'Taking responsibility for group outcomes',
      ],
      growth_areas: [
        'Lead collaboratively, not autocratically',
        'Listen to wisdom from all sources',
        'Your vision must align with God\'s vision',
      ],
      ministries: ['Ministry leadership', 'Team leading', 'Board service', 'Project leadership'],
      scriptures: ['Romans 12:8', '1 Timothy 3:1-7', 'Hebrews 13:7'],
      next_steps: [
        'Lead a small group, team, or ministry initiative',
        'Find a leadership mentor or coach',
        'Study biblical leadership (Nehemiah, Moses, Paul)',
      ],
    },
    faith: {
      title: 'Faith',
      description: 'You have extraordinary confidence in God\'s power and willingness to intervene in impossible situations.',
      strengths: [
        'Believing God for the impossible',
        'Inspiring others to trust God more',
        'Staying confident during uncertainty',
        'Praying bold, expectant prayers',
      ],
      growth_areas: [
        'Faith doesn\'t mean presumption',
        'God\'s timeline may differ from yours',
        'Not everyone has the same level of faith',
      ],
      ministries: ['Prayer ministry', 'Missions', 'Church planting', 'New initiatives'],
      scriptures: ['1 Corinthians 12:9', 'Hebrews 11:1', 'Mark 11:22-24'],
      next_steps: [
        'Join an intercessory prayer team',
        'Step out in faith on something God is calling you to',
        'Study the heroes of faith in Hebrews 11',
      ],
    },
    prophecy: {
      title: 'Prophecy',
      description: 'You receive insights from God and communicate His heart, will, and truth to others.',
      strengths: [
        'Hearing God\'s voice clearly',
        'Speaking truth with clarity and conviction',
        'Calling people and situations back to God\'s standard',
        'Seeing what God is doing and wants to do',
      ],
      growth_areas: [
        'Deliver truth with love and humility',
        'Your timing matters as much as your message',
        'Stay accountable to spiritual authority',
      ],
      ministries: ['Prophetic ministry', 'Teaching', 'Intercessory prayer', 'Spiritual direction'],
      scriptures: ['Romans 12:6', '1 Corinthians 14:3', '1 Thessalonians 5:19-21'],
      next_steps: [
        'Join a prophetic ministry or training',
        'Practice giving encouraging prophetic words',
        'Study Old Testament prophets and New Testament prophecy',
      ],
    },
    shepherding: {
      title: 'Shepherding/Pastor',
      description: 'You have a heart to nurture, guide, protect, and care for people\'s long-term spiritual development.',
      strengths: [
        'Long-term investment in people',
        'Creating safe community',
        'Spiritual guidance and protection',
        'Knowing and caring for individuals deeply',
      ],
      growth_areas: [
        'Don\'t carry what only Jesus can carry',
        'Set healthy boundaries with your flock',
        'You can\'t shepherd everyone',
      ],
      ministries: ['Small group leadership', 'Pastoral care', 'Mentoring', 'Recovery groups'],
      scriptures: ['Ephesians 4:11', '1 Peter 5:1-4', 'John 10:11-14'],
      next_steps: [
        'Lead a small group or care group',
        'Come alongside a few people for long-term discipleship',
        'Study how Jesus and Paul shepherded people',
      ],
    },
  }

  const primaryInfo = giftDescriptions[primary] || giftDescriptions.teaching
  const secondaryInfo = giftDescriptions[secondary] || giftDescriptions.mercy
  const tertiaryInfo = giftDescriptions[tertiary] || giftDescriptions.serving

  return {
    primary_result: primaryInfo.title,
    secondary_result: secondaryInfo.title,
    tertiary_result: tertiaryInfo.title,
    scores,
    title: `Your Spiritual Gifts: ${primaryInfo.title}, ${secondaryInfo.title}, ${tertiaryInfo.title}`,
    description: primaryInfo.description,
    strengths: primaryInfo.strengths,
    growth_areas: primaryInfo.growth_areas,
    ministry_recommendations: primaryInfo.ministries,
    scripture_references: primaryInfo.scriptures,
    next_steps: primaryInfo.next_steps,
  }
}

/**
 * Calculate Seasonal Assessment Results
 */
export function calculateSeasonal(responses: AssessmentResponse): AssessmentResult {
  // Seasonal indicators based on question patterns
  const seasonScores = {
    spring: 0, // New growth, fresh start
    summer: 0, // Fruitfulness, harvest
    fall: 0, // Transition, preparation
    winter: 0, // Rest, waiting, testing
  }

  // Spring indicators: Questions 3, 4, 11 (growth, preparation, hunger)
  seasonScores.spring += Number(responses['3'] || 0) + Number(responses['4'] || 0) + Number(responses['11'] || 0)

  // Summer indicators: Questions 1, 6, 10 (energy, fruit, breakthrough)
  seasonScores.summer += Number(responses['1'] || 0) + Number(responses['6'] || 0) + Number(responses['10'] || 0)

  // Fall indicators: Questions 2, 14 (transitions, rest call)
  seasonScores.fall += Number(responses['2'] || 0) + Number(responses['14'] || 0)

  // Winter indicators: Questions 5, 7, 9, 12 (dryness, waiting, warfare, testing)
  seasonScores.winter += Number(responses['5'] || 0) + Number(responses['7'] || 0) + Number(responses['9'] || 0) + Number(responses['12'] || 0)

  // Normalize scores
  seasonScores.spring = Math.round((seasonScores.spring / 15) * 100)
  seasonScores.summer = Math.round((seasonScores.summer / 15) * 100)
  seasonScores.fall = Math.round((seasonScores.fall / 10) * 100)
  seasonScores.winter = Math.round((seasonScores.winter / 20) * 100)

  const sortedSeasons = Object.entries(seasonScores)
    .sort(([, a], [, b]) => b - a)
    .map(([season]) => season)

  const [primary, secondary, tertiary] = sortedSeasons

  const seasonInfo: any = {
    spring: {
      title: 'Spring - Season of New Beginnings',
      description: 'You are in a season of fresh growth, new opportunities, and spiritual awakening. God is planting new seeds in your life.',
      strengths: [
        'Open to new things God is doing',
        'Experiencing fresh revelation and insight',
        'Feeling hopeful about the future',
        'Ready to step into new callings',
      ],
      growth_areas: [
        'Don\'t rush the growth process',
        'Tend to the new things God is planting',
        'Stay patient as seeds take time to sprout',
      ],
      ministries: ['Try new areas of ministry', 'Explore your calling', 'Join a new small group'],
      scriptures: ['Isaiah 43:19', 'Song of Solomon 2:11-12', '2 Corinthians 5:17'],
      next_steps: [
        'Journal about what new thing God is doing in your life',
        'Say yes to a new opportunity you\'ve been considering',
        'Ask God what seeds He\'s planting in this season',
      ],
    },
    summer: {
      title: 'Summer - Season of Fruitfulness',
      description: 'You are experiencing harvest and fruitfulness. What you\'ve sown is now producing results. This is a time of abundance and productivity.',
      strengths: [
        'Seeing results from past faithfulness',
        'Ministry and life are producing fruit',
        'Spiritual energy and momentum',
        'Opportunities are opening up',
      ],
      growth_areas: [
        'Don\'t take credit for what God is doing',
        'Stay humble in the blessing',
        'Remember summer doesn\'t last forever - steward it well',
      ],
      ministries: ['Multiplication and leadership', 'Mentoring others', 'Starting new initiatives'],
      scriptures: ['Galatians 6:9', 'John 15:5', 'Psalm 126:5-6'],
      next_steps: [
        'Thank God for the fruit He\'s producing',
        'Share your testimony to encourage others',
        'Sow for your next season while harvesting this one',
      ],
    },
    fall: {
      title: 'Fall - Season of Transition',
      description: 'You are in a season of change and transition. God is shifting things, preparing you for what\'s next. This is a time to let go and embrace the new.',
      strengths: [
        'Recognizing when seasons are changing',
        'Open to God\'s redirection',
        'Willing to let go of what\'s past',
        'Preparing for what\'s ahead',
      ],
      growth_areas: [
        'Transition can feel uncomfortable - trust God',
        'Don\'t resist necessary change',
        'Grieve what needs to end before embracing the new',
      ],
      ministries: ['Season-appropriate ministry', 'Help others navigate change', 'Prophetic insight'],
      scriptures: ['Ecclesiastes 3:1', 'Isaiah 43:18-19', 'Philippians 3:13-14'],
      next_steps: [
        'Ask God what He\'s asking you to release',
        'Identify what season you\'re transitioning into',
        'Find a mentor who\'s navigated similar transitions',
      ],
    },
    winter: {
      title: 'Winter - Season of Rest & Testing',
      description: 'You are in a season of waiting, rest, or testing. This is not a punishment but preparation. God is doing deep work beneath the surface.',
      strengths: [
        'Opportunity for deep inner work',
        'Learning to trust God when you can\'t see results',
        'Building character and endurance',
        'Being refined by pressure',
      ],
      growth_areas: [
        'Don\'t despise the season of hiddenness',
        'Winter is preparation for spring',
        'Stay faithful when you don\'t feel fruitful',
      ],
      ministries: ['Intercessory prayer', 'Personal development', 'Rest and sabbath'],
      scriptures: ['Psalm 30:5', 'James 1:2-4', 'Isaiah 40:31'],
      next_steps: [
        'Ask God what He\'s teaching you in this season',
        'Resist the urge to create your own spring',
        'Rest and trust that God is working even when you can\'t see it',
      ],
    },
  }

  const primaryInfo = seasonInfo[primary]

  return {
    primary_result: primaryInfo.title,
    secondary_result: seasonInfo[secondary]?.title || '',
    tertiary_result: seasonInfo[tertiary]?.title || '',
    scores: seasonScores,
    title: primaryInfo.title,
    description: primaryInfo.description,
    strengths: primaryInfo.strengths,
    growth_areas: primaryInfo.growth_areas,
    ministry_recommendations: primaryInfo.ministries,
    scripture_references: primaryInfo.scriptures,
    next_steps: primaryInfo.next_steps,
  }
}

/**
 * Main calculator function that routes to specific assessment type
 */
export function calculateAssessmentResult(
  assessmentType: string,
  responses: AssessmentResponse
): AssessmentResult {
  switch (assessmentType) {
    case 'spiritual-gifts':
      return calculateSpiritualGifts(responses)
    case 'seasonal':
      return calculateSeasonal(responses)
    // Add more assessment types here
    default:
      return calculateSpiritualGifts(responses)
  }
}
