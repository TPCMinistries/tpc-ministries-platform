import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

// Admin client for service operations
const getAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Get authenticated Supabase client
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
    // COURSE 1: New Believer's Journey (FREE)
    // ============================================
    const { data: course1, error: course1Error } = await supabase
      .from('plant_courses')
      .insert({
        slug: 'new-believers-journey',
        name: "New Believer's Journey",
        description: "Begin your walk with Christ with confidence. This foundational course covers salvation, water baptism, the Holy Spirit, and your first steps in faith. Perfect for those who have recently given their life to Jesus or want to strengthen their foundation.",
        category: 'discipleship',
        difficulty_level: 'beginner',
        ministry_id: 'tpc',
        required_tier: 'free',
        status: 'published',
        estimated_hours: 2,
        has_certificate: true,
        is_public: true,
        published_at: new Date().toISOString()
      })
      .select()
      .single()

    if (course1Error) {
      results.push(`Error creating course 1: ${course1Error.message}`)
    } else {
      results.push(`Created course: ${course1.name}`)

      // Module 1: Salvation
      const { data: mod1_1 } = await supabase
        .from('plant_modules')
        .insert({
          course_id: course1.id,
          slug: 'understanding-salvation',
          name: 'Understanding Salvation',
          description: 'What happened when you gave your life to Christ',
          sequence_order: 1,
          has_quiz: true
        })
        .select()
        .single()

      if (mod1_1) {
        await supabase.from('plant_lessons').insert([
          {
            module_id: mod1_1.id,
            slug: 'what-is-salvation',
            name: 'What is Salvation?',
            description: 'Understanding the gift of salvation through Jesus Christ',
            sequence_order: 1,
            content_type: 'text',
            estimated_minutes: 10,
            is_preview: true,
            content_html: `<h2>What is Salvation?</h2><p>Salvation is God's gift of eternal life through Jesus Christ. When you accepted Jesus as your Lord and Savior, something miraculous happened:</p><ul><li><strong>Your sins were forgiven</strong> - Every wrong thing you've ever done has been washed away by the blood of Jesus (1 John 1:9)</li><li><strong>You became a new creation</strong> - The old you is gone, and you've been made new (2 Corinthians 5:17)</li><li><strong>You received eternal life</strong> - Heaven is now your home (John 3:16)</li><li><strong>You became God's child</strong> - You are now part of God's family (John 1:12)</li></ul><blockquote>"For by grace you have been saved through faith. And this is not your own doing; it is the gift of God." - Ephesians 2:8</blockquote><p>Salvation is not something you earned - it's a free gift from God that you received by faith when you believed in Jesus.</p>`
          },
          {
            module_id: mod1_1.id,
            slug: 'your-new-identity',
            name: 'Your New Identity in Christ',
            description: 'Discover who you are now as a child of God',
            sequence_order: 2,
            content_type: 'text',
            estimated_minutes: 12,
            is_preview: false,
            content_html: `<h2>Your New Identity in Christ</h2><p>When you accepted Christ, you didn't just get a ticket to heaven - you received a brand new identity. Here's who you are now:</p><h3>You Are:</h3><ul><li><strong>Chosen</strong> - God chose you before the foundation of the world (Ephesians 1:4)</li><li><strong>Loved</strong> - Nothing can separate you from God's love (Romans 8:38-39)</li><li><strong>Forgiven</strong> - Your sins are completely forgiven (Colossians 1:14)</li><li><strong>Righteous</strong> - You have been made right with God (2 Corinthians 5:21)</li><li><strong>Free</strong> - You are free from condemnation (Romans 8:1)</li><li><strong>Empowered</strong> - The same power that raised Christ lives in you (Ephesians 1:19-20)</li></ul><p>The enemy will try to remind you of your past, but God says you are a new creation. Your identity is no longer based on what you've done, but on what Christ has done for you.</p>`
          },
          {
            module_id: mod1_1.id,
            slug: 'assurance-of-salvation',
            name: 'Assurance of Salvation',
            description: 'How to know for certain that you are saved',
            sequence_order: 3,
            content_type: 'text',
            estimated_minutes: 10,
            is_preview: false,
            content_html: `<h2>Assurance of Salvation</h2><p>Many new believers wonder, "Am I really saved?" God doesn't want you to live in doubt. Here's how you can be certain:</p><h3>The Promise of God's Word</h3><blockquote>"I write these things to you who believe in the name of the Son of God, that you may know that you have eternal life." - 1 John 5:13</blockquote><p>Notice it says "know" not "hope" or "wish." You can have certainty!</p><h3>Signs of Genuine Salvation:</h3><ul><li>You have a desire to know God more</li><li>You feel conviction when you sin</li><li>You have love for other believers</li><li>You want to obey God's Word</li><li>The Holy Spirit confirms it in your heart (Romans 8:16)</li></ul><p>Doubts may come, but they don't change the truth. Your salvation is based on God's promise, not your feelings.</p>`
          }
        ])
        results.push('Added lessons to Module 1')
      }

      // Module 2: Water Baptism
      const { data: mod1_2 } = await supabase
        .from('plant_modules')
        .insert({
          course_id: course1.id,
          slug: 'water-baptism',
          name: 'Water Baptism',
          description: 'Your first public declaration of faith',
          sequence_order: 2,
          has_quiz: false
        })
        .select()
        .single()

      if (mod1_2) {
        await supabase.from('plant_lessons').insert([
          {
            module_id: mod1_2.id,
            slug: 'why-be-baptized',
            name: 'Why Be Baptized?',
            description: 'Understanding the importance of water baptism',
            sequence_order: 1,
            content_type: 'text',
            estimated_minutes: 10,
            is_preview: false,
            content_html: `<h2>Why Be Baptized?</h2><p>Water baptism is one of the first steps of obedience for a new believer. Here's why it matters:</p><h3>1. Jesus Commands It</h3><blockquote>"Go therefore and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit." - Matthew 28:19</blockquote><h3>2. Jesus Modeled It</h3><p>Even Jesus was baptized to "fulfill all righteousness" (Matthew 3:15). If Jesus was baptized, how much more should we be?</p><h3>3. It's a Public Declaration</h3><p>Baptism is your way of publicly saying, "I belong to Jesus now." It's like a wedding ring - it doesn't make you married, but it shows the world you are.</p><h3>4. It Symbolizes Your New Life</h3><p>Going under the water represents dying to your old life. Coming up represents rising to new life in Christ (Romans 6:4).</p>`
          },
          {
            module_id: mod1_2.id,
            slug: 'preparing-for-baptism',
            name: 'Preparing for Baptism',
            description: 'What to expect and how to prepare',
            sequence_order: 2,
            content_type: 'text',
            estimated_minutes: 8,
            is_preview: false,
            content_html: `<h2>Preparing for Your Baptism</h2><h3>What to Expect</h3><ul><li>You'll be fully immersed in water (it's quick!)</li><li>Someone will baptize you "in the name of the Father, Son, and Holy Spirit"</li><li>Family and friends are often invited to witness</li><li>Many people share a brief testimony before being baptized</li></ul><h3>How to Prepare</h3><ul><li>Bring a change of clothes and a towel</li><li>Invite friends and family to witness</li><li>Prepare a brief testimony (optional but powerful)</li><li>Come with a heart of gratitude and celebration</li></ul>`
          }
        ])
        results.push('Added lessons to Module 2')
      }

      // Module 3: The Holy Spirit
      const { data: mod1_3 } = await supabase
        .from('plant_modules')
        .insert({
          course_id: course1.id,
          slug: 'the-holy-spirit',
          name: 'The Holy Spirit',
          description: 'Your Helper and Guide',
          sequence_order: 3,
          has_quiz: true
        })
        .select()
        .single()

      if (mod1_3) {
        await supabase.from('plant_lessons').insert([
          {
            module_id: mod1_3.id,
            slug: 'who-is-the-holy-spirit',
            name: 'Who is the Holy Spirit?',
            description: 'Understanding the third person of the Trinity',
            sequence_order: 1,
            content_type: 'text',
            estimated_minutes: 12,
            is_preview: false,
            content_html: `<h2>Who is the Holy Spirit?</h2><p>The Holy Spirit is not an "it" or a force - He is a Person. He is the third person of the Trinity: Father, Son, and Holy Spirit.</p><h3>The Holy Spirit Is:</h3><ul><li><strong>God</strong> - Fully divine, equal with the Father and Son</li><li><strong>A Person</strong> - He has a mind, will, and emotions</li><li><strong>Your Helper</strong> - Jesus called Him the "Helper" or "Comforter" (John 14:16)</li><li><strong>Your Teacher</strong> - He teaches and reminds you of God's truth (John 14:26)</li><li><strong>Your Guide</strong> - He leads you into all truth (John 16:13)</li></ul><blockquote>"And I will ask the Father, and he will give you another Helper, to be with you forever." - John 14:16</blockquote><p>When you accepted Christ, the Holy Spirit came to live inside you. You are never alone!</p>`
          },
          {
            module_id: mod1_3.id,
            slug: 'the-spirits-work',
            name: "The Spirit's Work in Your Life",
            description: 'How the Holy Spirit helps you daily',
            sequence_order: 2,
            content_type: 'text',
            estimated_minutes: 10,
            is_preview: false,
            content_html: `<h2>The Spirit's Work in Your Life</h2><p>The Holy Spirit is actively working in your life every day. Here's what He does:</p><h3>He Convicts</h3><p>When you sin, the Holy Spirit gently convicts you - not to condemn you, but to lead you to repentance (John 16:8).</p><h3>He Guides</h3><p>He leads you in decisions, showing you God's will for your life (Romans 8:14).</p><h3>He Empowers</h3><p>He gives you power to live the Christian life and be a witness (Acts 1:8).</p><h3>He Produces Fruit</h3><p>As you walk with Him, He produces fruit in your life: love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, and self-control (Galatians 5:22-23).</p>`
          }
        ])
        results.push('Added lessons to Module 3')
      }

      // Module 4: First Steps
      const { data: mod1_4 } = await supabase
        .from('plant_modules')
        .insert({
          course_id: course1.id,
          slug: 'first-steps',
          name: 'Your First Steps',
          description: 'Practical steps to grow in your faith',
          sequence_order: 4,
          has_quiz: false
        })
        .select()
        .single()

      if (mod1_4) {
        await supabase.from('plant_lessons').insert([
          {
            module_id: mod1_4.id,
            slug: 'daily-devotion',
            name: 'Developing a Daily Devotion',
            description: 'How to spend time with God each day',
            sequence_order: 1,
            content_type: 'text',
            estimated_minutes: 10,
            is_preview: false,
            content_html: `<h2>Developing a Daily Devotion</h2><p>Just like any relationship, your relationship with God grows through time spent together. Here's how to start:</p><h3>Find a Time</h3><p>Choose a consistent time each day. Morning is ideal because you start your day with God, but any time works if you're consistent.</p><h3>Find a Place</h3><p>Find a quiet spot where you won't be distracted. Jesus often withdrew to solitary places to pray (Luke 5:16).</p><h3>A Simple Format</h3><ol><li><strong>Read</strong> - Read a passage of Scripture (start with the Gospel of John)</li><li><strong>Reflect</strong> - Think about what you read. What is God saying?</li><li><strong>Respond</strong> - Pray about what you learned. Talk to God like a friend.</li></ol><h3>Start Small</h3><p>Start with 10-15 minutes and grow from there. Consistency matters more than duration.</p>`
          },
          {
            module_id: mod1_4.id,
            slug: 'finding-community',
            name: 'Finding Community',
            description: 'The importance of connecting with other believers',
            sequence_order: 2,
            content_type: 'text',
            estimated_minutes: 8,
            is_preview: false,
            content_html: `<h2>Finding Community</h2><p>You were not meant to walk this journey alone. God designed us for community.</p><blockquote>"And let us consider how to stir up one another to love and good works, not neglecting to meet together." - Hebrews 10:24-25</blockquote><h3>Why Community Matters</h3><ul><li><strong>Encouragement</strong> - Others lift you up when you're struggling</li><li><strong>Accountability</strong> - Others help you stay on track</li><li><strong>Growth</strong> - You learn from others who are further along</li><li><strong>Service</strong> - You use your gifts to help others</li></ul><h3>Ways to Connect at TPC</h3><ul><li>Join a Community Group</li><li>Attend services regularly</li><li>Serve on a volunteer team</li><li>Connect with a prayer partner</li></ul><p>Don't wait until you "have it all together." Come as you are and grow together!</p>`
          }
        ])
        results.push('Added lessons to Module 4')
      }
    }

    // ============================================
    // COURSE 2: Foundations of Prayer (FREE)
    // ============================================
    const { data: course2, error: course2Error } = await supabase
      .from('plant_courses')
      .insert({
        slug: 'foundations-of-prayer',
        name: 'Foundations of Prayer',
        description: "Learn to communicate with God effectively. This course covers the basics of prayer, different types of prayer, overcoming obstacles, and building a consistent prayer life.",
        category: 'discipleship',
        difficulty_level: 'beginner',
        ministry_id: 'tpc',
        required_tier: 'free',
        status: 'published',
        estimated_hours: 3,
        has_certificate: true,
        is_public: true,
        published_at: new Date().toISOString()
      })
      .select()
      .single()

    if (course2Error) {
      results.push(`Error creating course 2: ${course2Error.message}`)
    } else {
      results.push(`Created course: ${course2.name}`)

      // Module 1
      const { data: mod2_1 } = await supabase
        .from('plant_modules')
        .insert({
          course_id: course2.id,
          slug: 'what-is-prayer',
          name: 'What is Prayer?',
          description: 'Understanding the heart of prayer',
          sequence_order: 1,
          has_quiz: true
        })
        .select()
        .single()

      if (mod2_1) {
        await supabase.from('plant_lessons').insert([
          {
            module_id: mod2_1.id,
            slug: 'prayer-as-conversation',
            name: 'Prayer as Conversation',
            description: 'Prayer is simply talking with God',
            sequence_order: 1,
            content_type: 'text',
            estimated_minutes: 10,
            is_preview: true,
            content_html: `<h2>Prayer as Conversation</h2><p>Prayer is not a religious ritual or a formal ceremony. At its core, prayer is simply conversation with God - your Heavenly Father who loves you.</p><h3>God Wants to Hear From You</h3><blockquote>"Call to me and I will answer you and tell you great and unsearchable things you do not know." - Jeremiah 33:3</blockquote><p>Think about that - the Creator of the universe invites you to call on Him! He's not too busy, too distant, or too important. He wants to hear from you.</p><h3>Two-Way Communication</h3><p>Prayer is not just us talking to God - it's also listening. A good conversation involves both speaking and listening. As you grow in prayer, you'll learn to hear God's voice too.</p>`
          },
          {
            module_id: mod2_1.id,
            slug: 'why-pray',
            name: 'Why Pray?',
            description: 'The purpose and power of prayer',
            sequence_order: 2,
            content_type: 'text',
            estimated_minutes: 12,
            is_preview: false,
            content_html: `<h2>Why Pray?</h2><p>If God already knows everything, why should we pray? Great question!</p><h3>1. Relationship</h3><p>Prayer builds intimacy with God. You can't have a close relationship with someone you never talk to.</p><h3>2. Alignment</h3><p>Prayer aligns your heart with God's heart. As you pray, your desires begin to match His desires.</p><h3>3. Power</h3><p>Prayer releases God's power into situations. James 5:16 says "The prayer of a righteous person has great power."</p><h3>4. Transformation</h3><p>Prayer changes you. Time in God's presence transforms you to be more like Jesus.</p>`
          }
        ])
        results.push('Added lessons to Prayer Module 1')
      }

      // Module 2: Types of Prayer
      const { data: mod2_2 } = await supabase
        .from('plant_modules')
        .insert({
          course_id: course2.id,
          slug: 'types-of-prayer',
          name: 'Types of Prayer',
          description: 'Different ways to approach God',
          sequence_order: 2,
          has_quiz: false
        })
        .select()
        .single()

      if (mod2_2) {
        await supabase.from('plant_lessons').insert([
          {
            module_id: mod2_2.id,
            slug: 'praise-and-worship',
            name: 'Praise and Worship',
            description: 'Honoring God for who He is',
            sequence_order: 1,
            content_type: 'text',
            estimated_minutes: 10,
            is_preview: false,
            content_html: `<h2>Praise and Worship</h2><p>Praise and worship focus on who God is, not what He does for us.</p><h3>What to Praise God For:</h3><ul><li>His holiness and majesty</li><li>His love and faithfulness</li><li>His power and wisdom</li><li>His mercy and grace</li></ul><blockquote>"Enter his gates with thanksgiving and his courts with praise." - Psalm 100:4</blockquote>`
          },
          {
            module_id: mod2_2.id,
            slug: 'petition-and-intercession',
            name: 'Petition and Intercession',
            description: 'Asking God for yourself and others',
            sequence_order: 2,
            content_type: 'text',
            estimated_minutes: 12,
            is_preview: false,
            content_html: `<h2>Petition and Intercession</h2><h3>Petition: Praying for Yourself</h3><blockquote>"Do not be anxious about anything, but in everything by prayer and petition, with thanksgiving, present your requests to God." - Philippians 4:6</blockquote><h3>Intercession: Praying for Others</h3><p>Intercession is standing in the gap for others. When you intercede, you're partnering with God on behalf of someone else.</p><p>Who to Intercede For:</p><ul><li>Family members</li><li>Friends and coworkers</li><li>Church leaders</li><li>Government officials</li><li>The lost and hurting</li></ul>`
          }
        ])
        results.push('Added lessons to Prayer Module 2')
      }
    }

    // ============================================
    // COURSE 3: Reading Your Bible (FREE)
    // ============================================
    const { data: course3, error: course3Error } = await supabase
      .from('plant_courses')
      .insert({
        slug: 'reading-your-bible',
        name: 'Reading Your Bible',
        description: "Discover how to read, understand, and apply God's Word to your life. This course covers Bible basics, study methods, and practical tips.",
        category: 'bible-study',
        difficulty_level: 'beginner',
        ministry_id: 'tpc',
        required_tier: 'free',
        status: 'published',
        estimated_hours: 2,
        has_certificate: true,
        is_public: true,
        published_at: new Date().toISOString()
      })
      .select()
      .single()

    if (course3Error) {
      results.push(`Error creating course 3: ${course3Error.message}`)
    } else {
      results.push(`Created course: ${course3.name}`)

      // Module 1: Bible Basics
      const { data: mod3_1 } = await supabase
        .from('plant_modules')
        .insert({
          course_id: course3.id,
          slug: 'bible-basics',
          name: 'Bible Basics',
          description: 'Understanding the structure of Scripture',
          sequence_order: 1,
          has_quiz: true
        })
        .select()
        .single()

      if (mod3_1) {
        await supabase.from('plant_lessons').insert([
          {
            module_id: mod3_1.id,
            slug: 'what-is-the-bible',
            name: 'What is the Bible?',
            description: 'An overview of Scripture',
            sequence_order: 1,
            content_type: 'text',
            estimated_minutes: 12,
            is_preview: true,
            content_html: `<h2>What is the Bible?</h2><p>The Bible is not just a book - it's a library of 66 books written over 1,500 years by more than 40 authors, all inspired by God.</p><blockquote>"All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness." - 2 Timothy 3:16</blockquote><h3>Two Main Sections</h3><p><strong>Old Testament (39 books)</strong> - Written before Jesus came. Contains history, poetry, prophecy, and law.</p><p><strong>New Testament (27 books)</strong> - Written after Jesus. Contains the Gospels, church history, letters, and prophecy.</p>`
          },
          {
            module_id: mod3_1.id,
            slug: 'navigating-scripture',
            name: 'Navigating Scripture',
            description: 'How to find verses and books',
            sequence_order: 2,
            content_type: 'text',
            estimated_minutes: 8,
            is_preview: false,
            content_html: `<h2>Navigating Scripture</h2><h3>Understanding References</h3><p>When you see "John 3:16" it means:</p><ul><li><strong>John</strong> - The book name</li><li><strong>3</strong> - The chapter number</li><li><strong>16</strong> - The verse number</li></ul><h3>Where to Start Reading</h3><ul><li><strong>Gospel of John</strong> - Learn about Jesus</li><li><strong>Psalms</strong> - Prayers and praise</li><li><strong>Proverbs</strong> - Practical wisdom</li><li><strong>Romans</strong> - Core Christian beliefs</li></ul>`
          }
        ])
        results.push('Added lessons to Bible Module 1')
      }

      // Module 2: How to Read
      const { data: mod3_2 } = await supabase
        .from('plant_modules')
        .insert({
          course_id: course3.id,
          slug: 'how-to-read',
          name: 'How to Read the Bible',
          description: 'Practical methods for study',
          sequence_order: 2,
          has_quiz: false
        })
        .select()
        .single()

      if (mod3_2) {
        await supabase.from('plant_lessons').insert([
          {
            module_id: mod3_2.id,
            slug: 'soap-method',
            name: 'The SOAP Method',
            description: 'A simple approach to Bible reading',
            sequence_order: 1,
            content_type: 'text',
            estimated_minutes: 10,
            is_preview: false,
            content_html: `<h2>The SOAP Method</h2><p>SOAP is a simple method for reading and applying Scripture:</p><h3>S - Scripture</h3><p>Read a passage of Scripture. Write out the verse or verses that stand out to you.</p><h3>O - Observation</h3><p>What do you notice? Who is speaking? What is happening? What words stand out?</p><h3>A - Application</h3><p>How does this apply to your life today? What is God saying to you personally?</p><h3>P - Prayer</h3><p>Respond to God in prayer. Thank Him for what you learned. Ask Him to help you apply it.</p>`
          }
        ])
        results.push('Added lessons to Bible Module 2')
      }
    }

    // ============================================
    // PLACEHOLDER COURSES (Coming Soon)
    // ============================================
    const placeholderCourses = [
      {
        slug: 'hearing-gods-voice',
        name: "Hearing God's Voice",
        description: "Learn to recognize and respond to God's voice in your daily life. Discover the different ways God speaks and develop sensitivity to the Holy Spirit's leading.",
        category: 'prophetic',
        difficulty_level: 'beginner',
        required_tier: 'partner',
        estimated_hours: 4
      },
      {
        slug: 'walking-in-the-spirit',
        name: 'Walking in the Spirit',
        description: "Go deeper in your relationship with the Holy Spirit. Learn to be led by the Spirit daily, bear spiritual fruit, and live in the power of God.",
        category: 'discipleship',
        difficulty_level: 'intermediate',
        required_tier: 'partner',
        estimated_hours: 4
      },
      {
        slug: 'fasting-that-works',
        name: 'Fasting That Works',
        description: "Discover the biblical principles of fasting and how to fast effectively. Learn different types of fasts and how fasting can breakthrough in your life.",
        category: 'discipleship',
        difficulty_level: 'beginner',
        required_tier: 'partner',
        estimated_hours: 2
      },
      {
        slug: 'prophetic-foundations',
        name: 'Prophetic Foundations',
        description: "Understand the biblical foundation for prophetic ministry. Learn the purpose of prophecy, how to operate in the prophetic gift, and how to test prophetic words.",
        category: 'prophetic',
        difficulty_level: 'intermediate',
        required_tier: 'covenant',
        estimated_hours: 6
      },
      {
        slug: 'dreams-and-visions',
        name: 'Dreams & Visions',
        description: "Learn to understand and interpret prophetic dreams and visions. Discover common biblical symbols and how God speaks through the night season.",
        category: 'prophetic',
        difficulty_level: 'intermediate',
        required_tier: 'covenant',
        estimated_hours: 5
      },
      {
        slug: 'activating-your-gift',
        name: 'Activating Your Gift',
        description: "Move from understanding prophecy to operating in your prophetic gift. Practical training on giving prophetic words, prophetic etiquette, and growing in accuracy.",
        category: 'prophetic',
        difficulty_level: 'advanced',
        required_tier: 'covenant',
        estimated_hours: 8
      },
      {
        slug: 'spiritual-warfare',
        name: 'Spiritual Warfare',
        description: "Understand the spiritual battle and how to fight victoriously. Learn about your authority in Christ, the armor of God, and strategies for breakthrough.",
        category: 'ministry',
        difficulty_level: 'intermediate',
        required_tier: 'covenant',
        estimated_hours: 5
      },
      {
        slug: 'servant-leadership',
        name: 'Servant Leadership 101',
        description: "Develop biblical leadership skills rooted in the example of Jesus. Learn to lead by serving, build healthy teams, and influence with integrity.",
        category: 'leadership',
        difficulty_level: 'beginner',
        required_tier: 'covenant',
        estimated_hours: 4
      },
      {
        slug: 'building-ministry-teams',
        name: 'Building Ministry Teams',
        description: "Learn to develop, lead, and multiply ministry teams. Discover how to identify gifts, empower leaders, and create a healthy team culture.",
        category: 'leadership',
        difficulty_level: 'intermediate',
        required_tier: 'covenant',
        estimated_hours: 5
      }
    ]

    for (const course of placeholderCourses) {
      const { error } = await supabase
        .from('plant_courses')
        .insert({
          ...course,
          ministry_id: 'tpc',
          status: 'draft',
          has_certificate: true,
          is_public: true
        })

      if (error) {
        results.push(`Error creating placeholder ${course.name}: ${error.message}`)
      } else {
        results.push(`Created placeholder: ${course.name}`)
      }
    }

    // Fetch all created courses to return
    const { data: allCourses } = await supabase
      .from('plant_courses')
      .select('*')
      .order('created_at', { ascending: false })

    return NextResponse.json({
      success: true,
      message: 'Courses seeded successfully',
      results,
      courses: allCourses || []
    })

  } catch (error: any) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
