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
 * Calculate Prophetic Expression Assessment Results
 */
export function calculatePropheticExpression(responses: AssessmentResponse): AssessmentResult {
  const expressionQuestions: { [key: string]: string[] } = {
    seer: ['1', '6', '11'],
    prophet: ['2', '7', '12'],
    intercessor: ['3', '8', '13'],
    worship: ['4', '9', '14'],
    acts: ['5', '10', '15', '16'],
  }

  const scores: { [key: string]: number } = {}
  for (const [expression, questionIds] of Object.entries(expressionQuestions)) {
    const total = questionIds.reduce((sum, qId) => sum + (Number(responses[qId]) || 0), 0)
    scores[expression] = Math.round((total / (questionIds.length * 5)) * 100)
  }

  const sortedExpressions = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([exp]) => exp)

  const [primary, secondary, tertiary] = sortedExpressions

  const expressionInfo: { [key: string]: any } = {
    seer: {
      title: 'Seer',
      description: 'You receive revelation primarily through visions, dreams, and visual imagery. You "see" what God is showing you in the spirit realm.',
      strengths: [
        'Receiving vivid dreams and visions',
        'Seeing spiritual realities others miss',
        'Visual interpretation of God\'s messages',
        'Perceiving future events or spiritual dynamics',
      ],
      growth_areas: [
        'Learn to interpret symbols correctly',
        'Not every vision needs to be shared publicly',
        'Develop discernment for timing of revelation',
      ],
      ministries: ['Dream interpretation', 'Prophetic art', 'Intercessory prayer', 'Spiritual mapping'],
      scriptures: ['Acts 2:17', 'Joel 2:28', 'Numbers 12:6', 'Daniel 7:1'],
      next_steps: [
        'Start a dream journal to record what God shows you',
        'Study biblical symbolism and dream interpretation',
        'Connect with mature seers for mentoring',
      ],
    },
    prophet: {
      title: 'Prophet/Declarative',
      description: 'You receive and deliver God\'s word with boldness and clarity. You speak forth what God is saying to individuals, churches, or nations.',
      strengths: [
        'Clear, bold delivery of God\'s word',
        'Speaking correction with authority',
        'Addressing issues in the church or culture',
        'Calling people to repentance and alignment',
      ],
      growth_areas: [
        'Balance truth with grace and love',
        'Timing is as important as the message',
        'Stay submitted to spiritual authority',
      ],
      ministries: ['Public prophetic ministry', 'Teaching', 'Leadership councils', 'Prophetic training'],
      scriptures: ['Amos 3:7', '1 Corinthians 14:3', 'Jeremiah 1:9-10'],
      next_steps: [
        'Practice delivering words with love and humility',
        'Find accountability for your prophetic words',
        'Study how biblical prophets delivered hard words',
      ],
    },
    intercessor: {
      title: 'Prophetic Intercessor',
      description: 'You receive revelation through prayer and travail. God downloads His heart as you intercede, and you pray His purposes into being.',
      strengths: [
        'Receiving revelation during prayer',
        'Feeling God\'s emotions for people and situations',
        'Praying with prophetic accuracy',
        'Birthing things in the Spirit through prayer',
      ],
      growth_areas: [
        'Not all prayer burdens are yours to carry alone',
        'Release burdens after praying them through',
        'Balance intercession with rest',
      ],
      ministries: ['Prayer teams', 'Intercession ministry', 'Spiritual warfare', 'Prayer covering'],
      scriptures: ['Romans 8:26-27', 'Isaiah 62:6-7', 'Ezekiel 22:30'],
      next_steps: [
        'Join or lead an intercessory prayer group',
        'Journal what God reveals during prayer times',
        'Learn to identify and pray into prophetic words',
      ],
    },
    worship: {
      title: 'Revelatory Worship',
      description: 'You receive and release revelation through music, singing, and worship. The prophetic flows naturally in the context of worship.',
      strengths: [
        'Receiving songs and melodies from heaven',
        'Ministering prophetically through music',
        'Creating atmosphere for God\'s presence',
        'Leading others into encounters with God',
      ],
      growth_areas: [
        'Steward the gift with excellence and practice',
        'Not every prophetic song is for public release',
        'Stay humble about the platform worship provides',
      ],
      ministries: ['Worship team', 'Prophetic worship', 'Songwriting', 'Soaking prayer'],
      scriptures: ['1 Samuel 16:23', '2 Kings 3:15', 'Ephesians 5:19', 'Colossians 3:16'],
      next_steps: [
        'Record the spontaneous songs God gives you',
        'Study how David and other musicians prophesied',
        'Develop your musical skills alongside your gift',
      ],
    },
    acts: {
      title: 'Prophetic Acts',
      description: 'You communicate God\'s message through symbolic actions, demonstrations, and creative expressions. You embody the prophetic message.',
      strengths: [
        'Communicating through visual demonstrations',
        'Creative prophetic expressions',
        'Engaging people through memorable actions',
        'Making the invisible visible',
      ],
      growth_areas: [
        'Ensure actions are clearly understood',
        'Some acts are private, not public',
        'Stay sensitive to cultural context',
      ],
      ministries: ['Prophetic drama', 'Creative arts ministry', 'Prophetic intercession', 'Evangelism'],
      scriptures: ['Isaiah 20:1-4', 'Ezekiel 4-5', 'Jeremiah 27:2', 'Acts 21:10-11'],
      next_steps: [
        'Ask God for creative ways to demonstrate His word',
        'Study the prophetic acts in Scripture',
        'Practice in private before public expression',
      ],
    },
  }

  const primaryInfo = expressionInfo[primary] || expressionInfo.seer

  return {
    primary_result: primaryInfo.title,
    secondary_result: expressionInfo[secondary]?.title || '',
    tertiary_result: expressionInfo[tertiary]?.title || '',
    scores,
    title: `Your Prophetic Expression: ${primaryInfo.title}`,
    description: primaryInfo.description,
    strengths: primaryInfo.strengths,
    growth_areas: primaryInfo.growth_areas,
    ministry_recommendations: primaryInfo.ministries,
    scripture_references: primaryInfo.scriptures,
    next_steps: primaryInfo.next_steps,
  }
}

/**
 * Calculate Ministry Calling Assessment Results
 */
export function calculateMinistryCalling(responses: AssessmentResponse): AssessmentResult {
  const callingQuestions: { [key: string]: string[] } = {
    teaching: ['1', '8', '15'],
    pastoral: ['2', '9', '16'],
    evangelism: ['3', '10', '17'],
    worship: ['4', '11'],
    administration: ['5', '12'],
    missions: ['6', '13', '18'],
    prayer: ['7', '14'],
  }

  const scores: { [key: string]: number } = {}
  for (const [calling, questionIds] of Object.entries(callingQuestions)) {
    const total = questionIds.reduce((sum, qId) => sum + (Number(responses[qId]) || 0), 0)
    scores[calling] = Math.round((total / (questionIds.length * 5)) * 100)
  }

  const sortedCallings = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([c]) => c)

  const [primary, secondary, tertiary] = sortedCallings

  const callingInfo: { [key: string]: any } = {
    teaching: {
      title: 'Teaching Ministry',
      description: 'You are called to study, understand, and communicate God\'s Word to help others grow in knowledge and application of Scripture.',
      strengths: [
        'Clear explanation of biblical truth',
        'Passion for study and preparation',
        'Helping others understand Scripture',
        'Making complex truths accessible',
      ],
      growth_areas: [
        'Teaching must lead to transformation, not just information',
        'Stay teachable yourself',
        'Engage the heart, not just the mind',
      ],
      ministries: ['Bible teaching', 'Small groups', 'Sunday school', 'Training and equipping'],
      scriptures: ['Ephesians 4:11', 'Romans 12:7', '2 Timothy 2:2', 'Nehemiah 8:8'],
      next_steps: [
        'Prepare and teach a lesson in your church',
        'Take a Bible study methods course',
        'Find a teaching mentor to develop your gift',
      ],
    },
    pastoral: {
      title: 'Pastoral Care Ministry',
      description: 'You are called to shepherd, nurture, and care for people through life\'s joys and challenges. You naturally walk with people long-term.',
      strengths: [
        'Deep care for individuals',
        'Walking with people through difficulty',
        'Creating safe, healing environments',
        'Long-term investment in lives',
      ],
      growth_areas: [
        'You can\'t pastor everyone - focus your care',
        'Set boundaries to prevent burnout',
        'Let people struggle enough to grow',
      ],
      ministries: ['Pastoral care', 'Counseling', 'Hospital visitation', 'Recovery ministry'],
      scriptures: ['1 Peter 5:2-4', 'John 10:11', 'Ezekiel 34:15-16'],
      next_steps: [
        'Join a care or visitation ministry',
        'Get training in pastoral counseling',
        'Identify 3-5 people to intentionally shepherd',
      ],
    },
    evangelism: {
      title: 'Evangelism Ministry',
      description: 'You are called to share the Gospel and lead people to faith in Christ. You have a passion for the lost and ability to communicate the Good News.',
      strengths: [
        'Natural conversations about faith',
        'Passion for those without Christ',
        'Ability to clearly share the Gospel',
        'Leading people to decisions',
      ],
      growth_areas: [
        'Evangelism without discipleship is incomplete',
        'Relationship matters, not just conversion',
        'Be patient with people\'s journeys',
      ],
      ministries: ['Outreach', 'Street evangelism', 'Guest services', 'Alpha/seeker courses'],
      scriptures: ['Matthew 28:19-20', 'Romans 10:14-15', '2 Timothy 4:5'],
      next_steps: [
        'Share your testimony with someone this week',
        'Join an outreach team or evangelism training',
        'Pray for and build relationships with non-believers',
      ],
    },
    worship: {
      title: 'Worship Ministry',
      description: 'You are called to lead people into God\'s presence through music, arts, and creative expressions that glorify Him.',
      strengths: [
        'Creating atmosphere for God\'s presence',
        'Musical or artistic gifting',
        'Sensitivity to the Spirit in worship',
        'Leading others into encounter',
      ],
      growth_areas: [
        'Worship is a lifestyle, not just a service',
        'Excellence honors God - keep developing skills',
        'Lead from overflow of personal worship',
      ],
      ministries: ['Worship team', 'Creative arts', 'Production', 'Songwriting'],
      scriptures: ['Psalm 150', 'John 4:23-24', 'Colossians 3:16'],
      next_steps: [
        'Audition for or join a worship team',
        'Develop your musical/artistic skills',
        'Study worship in Scripture',
      ],
    },
    administration: {
      title: 'Administrative Ministry',
      description: 'You are called to organize, manage, and coordinate ministry operations so the church functions effectively.',
      strengths: [
        'Organizing complex systems',
        'Attention to detail',
        'Making ministry run smoothly',
        'Strategic planning and execution',
      ],
      growth_areas: [
        'Remember the "why" behind the "what"',
        'People matter more than processes',
        'Stay flexible when God redirects',
      ],
      ministries: ['Church operations', 'Event planning', 'Finance', 'HR/volunteer coordination'],
      scriptures: ['1 Corinthians 12:28', 'Romans 12:8', 'Exodus 18:21-22'],
      next_steps: [
        'Volunteer for a ministry that needs organization',
        'Offer administrative help to a ministry leader',
        'Take a course in nonprofit management',
      ],
    },
    missions: {
      title: 'Missions Ministry',
      description: 'You are called to take the Gospel across cultural and geographic boundaries, whether locally or globally.',
      strengths: [
        'Heart for unreached peoples',
        'Cross-cultural sensitivity',
        'Adaptability to new environments',
        'Pioneer spirit',
      ],
      growth_areas: [
        'Learn the culture before trying to change it',
        'Long-term presence often beats short-term trips',
        'Support missionaries already on the field',
      ],
      ministries: ['Global missions', 'Local cross-cultural ministry', 'Mission trips', 'Refugee ministry'],
      scriptures: ['Acts 1:8', 'Matthew 28:19-20', 'Romans 10:15'],
      next_steps: [
        'Go on a mission trip to explore this calling',
        'Support a missionary financially and prayerfully',
        'Learn about unreached people groups',
      ],
    },
    prayer: {
      title: 'Prayer Ministry',
      description: 'You are called to intercede for others and cultivate a lifestyle of prayer that moves heaven and changes earth.',
      strengths: [
        'Perseverance in prayer',
        'Hearing God for others',
        'Carrying prayer burdens faithfully',
        'Creating culture of prayer',
      ],
      growth_areas: [
        'Prayer is partnership with God, not changing His mind',
        'Rest between prayer assignments',
        'Celebrate answered prayers',
      ],
      ministries: ['Prayer team', 'Intercessory prayer', 'Prayer room', 'Healing prayer'],
      scriptures: ['James 5:16', 'Luke 18:1', '1 Thessalonians 5:17'],
      next_steps: [
        'Join a prayer ministry at your church',
        'Start or join a prayer group',
        'Study the prayers of the Bible',
      ],
    },
  }

  const primaryInfo = callingInfo[primary] || callingInfo.teaching

  return {
    primary_result: primaryInfo.title,
    secondary_result: callingInfo[secondary]?.title || '',
    tertiary_result: callingInfo[tertiary]?.title || '',
    scores,
    title: `Your Ministry Calling: ${primaryInfo.title}`,
    description: primaryInfo.description,
    strengths: primaryInfo.strengths,
    growth_areas: primaryInfo.growth_areas,
    ministry_recommendations: primaryInfo.ministries,
    scripture_references: primaryInfo.scriptures,
    next_steps: primaryInfo.next_steps,
  }
}

/**
 * Calculate Redemptive Gifts Assessment Results (Romans 12)
 */
export function calculateRedemptiveGifts(responses: AssessmentResponse): AssessmentResult {
  const giftQuestions: { [key: string]: string[] } = {
    prophet: ['1', '8', '15', '22'],
    servant: ['2', '9', '16', '23'],
    teacher: ['3', '10', '17', '24'],
    exhorter: ['4', '11', '18'],
    giver: ['5', '12', '19', '25'],
    ruler: ['6', '13', '20'],
    mercy: ['7', '14', '21'],
  }

  const scores: { [key: string]: number } = {}
  for (const [gift, questionIds] of Object.entries(giftQuestions)) {
    const total = questionIds.reduce((sum, qId) => sum + (Number(responses[qId]) || 0), 0)
    scores[gift] = Math.round((total / (questionIds.length * 5)) * 100)
  }

  const sortedGifts = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([g]) => g)

  const [primary, secondary, tertiary] = sortedGifts

  const giftInfo: { [key: string]: any } = {
    prophet: {
      title: 'Prophet (Perceiver)',
      description: 'You see the world in black and white, right and wrong. You have a passion for truth and easily identify what\'s out of alignment.',
      strengths: [
        'Seeing truth clearly',
        'Standing firm on principles',
        'Identifying problems quickly',
        'Passionate about righteousness',
      ],
      growth_areas: [
        'Learn to deliver truth with grace',
        'Not everyone sees things as clearly as you',
        'Allow room for process and growth in others',
      ],
      ministries: ['Teaching', 'Prophetic ministry', 'Counseling', 'Writing'],
      scriptures: ['Romans 12:6', 'Amos 3:7', '1 Corinthians 14:3'],
      next_steps: [
        'Practice speaking truth in love',
        'Ask for feedback on how you deliver hard truths',
        'Study how Jesus balanced truth and grace',
      ],
    },
    servant: {
      title: 'Servant',
      description: 'You find joy in meeting practical needs and helping others succeed. You see what needs to be done and do it without being asked.',
      strengths: [
        'Anticipating needs',
        'Working behind the scenes',
        'Practical service orientation',
        'Freeing others for their calling',
      ],
      growth_areas: [
        'Set healthy boundaries',
        'Your worth isn\'t in what you do',
        'Learn to receive as well as give',
      ],
      ministries: ['Hospitality', 'Helps ministry', 'Practical care', 'Setup teams'],
      scriptures: ['Romans 12:7', 'Mark 10:45', 'Galatians 5:13'],
      next_steps: [
        'Find a serving role in your church',
        'Practice saying no when overextended',
        'Study Jesus as the ultimate servant',
      ],
    },
    teacher: {
      title: 'Teacher',
      description: 'You love to research, validate, and present truth in systematic ways. Accuracy and thoroughness are important to you.',
      strengths: [
        'In-depth research and study',
        'Systematic presentation',
        'Attention to accuracy',
        'Foundational teaching',
      ],
      growth_areas: [
        'Don\'t let perfectionism paralyze you',
        'Application matters as much as information',
        'Connect truth to transformation',
      ],
      ministries: ['Bible teaching', 'Curriculum development', 'Training', 'Writing'],
      scriptures: ['Romans 12:7', 'James 3:1', '2 Timothy 2:15'],
      next_steps: [
        'Prepare and teach a lesson',
        'Create resources for others to use',
        'Get feedback on your teaching style',
      ],
    },
    exhorter: {
      title: 'Exhorter (Encourager)',
      description: 'You naturally see the best in people and love helping them reach their potential. You\'re a natural counselor and encourager.',
      strengths: [
        'Seeing potential in others',
        'Practical problem-solving',
        'Motivating and encouraging',
        'Walking with people through process',
      ],
      growth_areas: [
        'Some pain has purpose - don\'t rush people through',
        'Set time boundaries in counseling',
        'Celebrate progress, not just results',
      ],
      ministries: ['Counseling', 'Mentoring', 'Small groups', 'Life coaching'],
      scriptures: ['Romans 12:8', 'Hebrews 10:24-25', 'Acts 4:36'],
      next_steps: [
        'Offer to mentor someone',
        'Get training in biblical counseling',
        'Practice giving specific encouragement',
      ],
    },
    giver: {
      title: 'Giver',
      description: 'You see resources as tools for Kingdom impact. You\'re generous, frugal with yourself, and strategic with giving.',
      strengths: [
        'Generosity and sacrifice',
        'Wise resource management',
        'Seeing investment opportunities',
        'Funding Kingdom initiatives',
      ],
      growth_areas: [
        'Give yourself, not just money',
        'Some things can\'t be solved with resources',
        'Give without expectation of control',
      ],
      ministries: ['Benevolence', 'Missions support', 'Building projects', 'Kingdom business'],
      scriptures: ['Romans 12:8', '2 Corinthians 9:7', 'Luke 6:38'],
      next_steps: [
        'Pray about increasing your giving',
        'Find a ministry to invest in long-term',
        'Study biblical stewardship principles',
      ],
    },
    ruler: {
      title: 'Ruler (Administrator/Leader)',
      description: 'You see the big picture and naturally organize people and resources to accomplish vision. You\'re a builder and leader.',
      strengths: [
        'Vision casting',
        'Strategic organization',
        'Building teams',
        'Accomplishing goals',
      ],
      growth_areas: [
        'Lead with people, not over them',
        'Vision must be God\'s, not just yours',
        'Delegate without abandoning',
      ],
      ministries: ['Leadership', 'Administration', 'Project management', 'Church planting'],
      scriptures: ['Romans 12:8', 'Nehemiah 2-6', '1 Timothy 3:4-5'],
      next_steps: [
        'Lead a team or project',
        'Get leadership training',
        'Find a leadership mentor',
      ],
    },
    mercy: {
      title: 'Mercy',
      description: 'You feel deeply for those who are hurting and create safe spaces for emotional healing. You\'re drawn to the broken and marginalized.',
      strengths: [
        'Deep empathy',
        'Creating safe spaces',
        'Emotional sensitivity',
        'Loving the unlovable',
      ],
      growth_areas: [
        'Don\'t take on others\' pain as your own',
        'Balance mercy with truth',
        'Set emotional boundaries',
      ],
      ministries: ['Care ministry', 'Hospital visitation', 'Recovery ministry', 'Homeless outreach'],
      scriptures: ['Romans 12:8', 'Matthew 5:7', 'Luke 10:33-37'],
      next_steps: [
        'Join a care ministry',
        'Practice self-care to sustain mercy',
        'Study how Jesus showed mercy',
      ],
    },
  }

  const primaryInfo = giftInfo[primary] || giftInfo.prophet

  return {
    primary_result: primaryInfo.title,
    secondary_result: giftInfo[secondary]?.title || '',
    tertiary_result: giftInfo[tertiary]?.title || '',
    scores,
    title: `Your Redemptive Gift: ${primaryInfo.title}`,
    description: primaryInfo.description,
    strengths: primaryInfo.strengths,
    growth_areas: primaryInfo.growth_areas,
    ministry_recommendations: primaryInfo.ministries,
    scripture_references: primaryInfo.scriptures,
    next_steps: primaryInfo.next_steps,
  }
}

/**
 * Calculate Spiritual Maturity Assessment Results
 */
export function calculateSpiritualMaturity(responses: AssessmentResponse): AssessmentResult {
  const areaQuestions: { [key: string]: string[] } = {
    knowledge: ['1', '6', '11'],
    prayer: ['2', '7', '12'],
    character: ['3', '8', '13'],
    service: ['4', '9', '14'],
    disciplines: ['5', '10', '15'],
  }

  const scores: { [key: string]: number } = {}
  for (const [area, questionIds] of Object.entries(areaQuestions)) {
    const total = questionIds.reduce((sum, qId) => sum + (Number(responses[qId]) || 0), 0)
    scores[area] = Math.round((total / (questionIds.length * 5)) * 100)
  }

  // Calculate overall maturity level
  const overallScore = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 5)

  let maturityLevel: string
  let maturityTitle: string
  let maturityDescription: string

  if (overallScore >= 80) {
    maturityLevel = 'mature'
    maturityTitle = 'Mature'
    maturityDescription = 'You demonstrate deep spiritual maturity across multiple areas. You\'re ready to lead, mentor, and multiply.'
  } else if (overallScore >= 60) {
    maturityLevel = 'growing'
    maturityTitle = 'Growing'
    maturityDescription = 'You\'re actively developing in your faith and showing growth in key areas. Keep pressing forward!'
  } else if (overallScore >= 40) {
    maturityLevel = 'developing'
    maturityTitle = 'Developing'
    maturityDescription = 'You\'ve established foundations and are developing in your faith. Focus on consistent growth habits.'
  } else {
    maturityLevel = 'beginning'
    maturityTitle = 'Beginning'
    maturityDescription = 'You\'re at the beginning of an exciting journey! Focus on foundational disciplines and finding community.'
  }

  const sortedAreas = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([area]) => area)

  const [strongest, secondStrong, weakest] = [sortedAreas[0], sortedAreas[1], sortedAreas[sortedAreas.length - 1]]

  const areaInfo: { [key: string]: any } = {
    knowledge: {
      title: 'Biblical Knowledge',
      description: 'Understanding of Scripture and ability to apply it',
    },
    prayer: {
      title: 'Prayer Life',
      description: 'Consistent, effective prayer and hearing from God',
    },
    character: {
      title: 'Character Development',
      description: 'Fruit of the Spirit and Christ-like character',
    },
    service: {
      title: 'Service & Ministry',
      description: 'Active use of gifts to serve others',
    },
    disciplines: {
      title: 'Spiritual Disciplines',
      description: 'Consistent practices that fuel spiritual growth',
    },
  }

  const strengthAreas = [strongest, secondStrong].map(a => areaInfo[a]?.title || a)
  const growthAreas = sortedAreas.slice(-2).map(a => areaInfo[a]?.title || a)

  return {
    primary_result: maturityTitle,
    secondary_result: areaInfo[strongest]?.title || 'Biblical Knowledge',
    tertiary_result: areaInfo[weakest]?.title || 'Spiritual Disciplines',
    scores: { ...scores, overall: overallScore },
    title: `Spiritual Maturity Level: ${maturityTitle}`,
    description: maturityDescription,
    strengths: [
      `Strong in ${areaInfo[strongest]?.title}`,
      `Developing well in ${areaInfo[secondStrong]?.title}`,
      `Overall score of ${overallScore}%`,
    ],
    growth_areas: [
      `Focus on developing ${areaInfo[weakest]?.title}`,
      `Build consistency in ${growthAreas[0]}`,
      'Consider finding a mentor in your growth areas',
    ],
    ministry_recommendations: [
      'Small group participation',
      'Spiritual mentoring relationship',
      'Serve in an area of strength',
    ],
    scripture_references: ['Hebrews 5:12-14', '2 Peter 3:18', 'Ephesians 4:13-15', 'Colossians 2:6-7'],
    next_steps: [
      `Take a course or read a book on ${areaInfo[weakest]?.title?.toLowerCase()}`,
      'Find an accountability partner for growth',
      'Set specific, measurable goals for spiritual development',
    ],
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
    case 'prophetic-expression':
      return calculatePropheticExpression(responses)
    case 'ministry-calling':
      return calculateMinistryCalling(responses)
    case 'redemptive-gifts':
      return calculateRedemptiveGifts(responses)
    case 'spiritual-maturity':
      return calculateSpiritualMaturity(responses)
    default:
      return calculateSpiritualGifts(responses)
  }
}
