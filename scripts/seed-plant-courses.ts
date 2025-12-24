import { createClient } from '@supabase/supabase-js'

// Environment variables should be set before running this script
// Run with: source .env.local && npx tsx scripts/seed-plant-courses.ts

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seedCourses() {
  console.log('Seeding PLANT courses...')

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
      published_at: new Date().toISOString()
    })
    .select()
    .single()

  if (course1Error) {
    console.error('Error creating course 1:', course1Error)
  } else {
    console.log('Created course:', course1.name)

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
          content_html: `
            <h2>What is Salvation?</h2>
            <p>Salvation is God's gift of eternal life through Jesus Christ. When you accepted Jesus as your Lord and Savior, something miraculous happened:</p>
            <ul>
              <li><strong>Your sins were forgiven</strong> - Every wrong thing you've ever done has been washed away by the blood of Jesus (1 John 1:9)</li>
              <li><strong>You became a new creation</strong> - The old you is gone, and you've been made new (2 Corinthians 5:17)</li>
              <li><strong>You received eternal life</strong> - Heaven is now your home (John 3:16)</li>
              <li><strong>You became God's child</strong> - You are now part of God's family (John 1:12)</li>
            </ul>
            <blockquote>"For by grace you have been saved through faith. And this is not your own doing; it is the gift of God." - Ephesians 2:8</blockquote>
            <p>Salvation is not something you earned - it's a free gift from God that you received by faith when you believed in Jesus.</p>
          `
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
          content_html: `
            <h2>Your New Identity in Christ</h2>
            <p>When you accepted Christ, you didn't just get a ticket to heaven - you received a brand new identity. Here's who you are now:</p>
            <h3>You Are:</h3>
            <ul>
              <li><strong>Chosen</strong> - God chose you before the foundation of the world (Ephesians 1:4)</li>
              <li><strong>Loved</strong> - Nothing can separate you from God's love (Romans 8:38-39)</li>
              <li><strong>Forgiven</strong> - Your sins are completely forgiven (Colossians 1:14)</li>
              <li><strong>Righteous</strong> - You have been made right with God (2 Corinthians 5:21)</li>
              <li><strong>Free</strong> - You are free from condemnation (Romans 8:1)</li>
              <li><strong>Empowered</strong> - The same power that raised Christ lives in you (Ephesians 1:19-20)</li>
            </ul>
            <p>The enemy will try to remind you of your past, but God says you are a new creation. Your identity is no longer based on what you've done, but on what Christ has done for you.</p>
          `
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
          content_html: `
            <h2>Assurance of Salvation</h2>
            <p>Many new believers wonder, "Am I really saved?" God doesn't want you to live in doubt. Here's how you can be certain:</p>
            <h3>The Promise of God's Word</h3>
            <blockquote>"I write these things to you who believe in the name of the Son of God, that you may know that you have eternal life." - 1 John 5:13</blockquote>
            <p>Notice it says "know" not "hope" or "wish." You can have certainty!</p>
            <h3>Signs of Genuine Salvation:</h3>
            <ul>
              <li>You have a desire to know God more</li>
              <li>You feel conviction when you sin</li>
              <li>You have love for other believers</li>
              <li>You want to obey God's Word</li>
              <li>The Holy Spirit confirms it in your heart (Romans 8:16)</li>
            </ul>
            <p>Doubts may come, but they don't change the truth. Your salvation is based on God's promise, not your feelings.</p>
          `
        }
      ])
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
          content_html: `
            <h2>Why Be Baptized?</h2>
            <p>Water baptism is one of the first steps of obedience for a new believer. Here's why it matters:</p>
            <h3>1. Jesus Commands It</h3>
            <blockquote>"Go therefore and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit." - Matthew 28:19</blockquote>
            <h3>2. Jesus Modeled It</h3>
            <p>Even Jesus was baptized to "fulfill all righteousness" (Matthew 3:15). If Jesus was baptized, how much more should we be?</p>
            <h3>3. It's a Public Declaration</h3>
            <p>Baptism is your way of publicly saying, "I belong to Jesus now." It's like a wedding ring - it doesn't make you married, but it shows the world you are.</p>
            <h3>4. It Symbolizes Your New Life</h3>
            <p>Going under the water represents dying to your old life. Coming up represents rising to new life in Christ (Romans 6:4).</p>
          `
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
          content_html: `
            <h2>Preparing for Your Baptism</h2>
            <h3>What to Expect</h3>
            <ul>
              <li>You'll be fully immersed in water (it's quick!)</li>
              <li>Someone will baptize you "in the name of the Father, Son, and Holy Spirit"</li>
              <li>Family and friends are often invited to witness</li>
              <li>Many people share a brief testimony before being baptized</li>
            </ul>
            <h3>How to Prepare</h3>
            <ul>
              <li>Bring a change of clothes and a towel</li>
              <li>Invite friends and family to witness</li>
              <li>Prepare a brief testimony (optional but powerful)</li>
              <li>Come with a heart of gratitude and celebration</li>
            </ul>
            <h3>Your Testimony</h3>
            <p>A simple testimony includes:</p>
            <ol>
              <li>What your life was like before Christ</li>
              <li>How you came to know Jesus</li>
              <li>What has changed since then</li>
            </ol>
            <p>Keep it brief (1-2 minutes) and focus on what Jesus has done.</p>
          `
        }
      ])
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
          content_html: `
            <h2>Who is the Holy Spirit?</h2>
            <p>The Holy Spirit is not an "it" or a force - He is a Person. He is the third person of the Trinity: Father, Son, and Holy Spirit.</p>
            <h3>The Holy Spirit Is:</h3>
            <ul>
              <li><strong>God</strong> - Fully divine, equal with the Father and Son</li>
              <li><strong>A Person</strong> - He has a mind, will, and emotions</li>
              <li><strong>Your Helper</strong> - Jesus called Him the "Helper" or "Comforter" (John 14:16)</li>
              <li><strong>Your Teacher</strong> - He teaches and reminds you of God's truth (John 14:26)</li>
              <li><strong>Your Guide</strong> - He leads you into all truth (John 16:13)</li>
            </ul>
            <blockquote>"And I will ask the Father, and he will give you another Helper, to be with you forever." - John 14:16</blockquote>
            <p>When you accepted Christ, the Holy Spirit came to live inside you. You are never alone!</p>
          `
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
          content_html: `
            <h2>The Spirit's Work in Your Life</h2>
            <p>The Holy Spirit is actively working in your life every day. Here's what He does:</p>
            <h3>He Convicts</h3>
            <p>When you sin, the Holy Spirit gently convicts you - not to condemn you, but to lead you to repentance (John 16:8).</p>
            <h3>He Guides</h3>
            <p>He leads you in decisions, showing you God's will for your life (Romans 8:14).</p>
            <h3>He Empowers</h3>
            <p>He gives you power to live the Christian life and be a witness (Acts 1:8).</p>
            <h3>He Produces Fruit</h3>
            <p>As you walk with Him, He produces fruit in your life: love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, and self-control (Galatians 5:22-23).</p>
            <h3>He Gives Gifts</h3>
            <p>He gives spiritual gifts to every believer for building up the church (1 Corinthians 12).</p>
          `
        }
      ])
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
          content_html: `
            <h2>Developing a Daily Devotion</h2>
            <p>Just like any relationship, your relationship with God grows through time spent together. Here's how to start:</p>
            <h3>Find a Time</h3>
            <p>Choose a consistent time each day. Morning is ideal because you start your day with God, but any time works if you're consistent.</p>
            <h3>Find a Place</h3>
            <p>Find a quiet spot where you won't be distracted. Jesus often withdrew to solitary places to pray (Luke 5:16).</p>
            <h3>A Simple Format</h3>
            <ol>
              <li><strong>Read</strong> - Read a passage of Scripture (start with the Gospel of John)</li>
              <li><strong>Reflect</strong> - Think about what you read. What is God saying?</li>
              <li><strong>Respond</strong> - Pray about what you learned. Talk to God like a friend.</li>
            </ol>
            <h3>Start Small</h3>
            <p>Start with 10-15 minutes and grow from there. Consistency matters more than duration.</p>
          `
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
          content_html: `
            <h2>Finding Community</h2>
            <p>You were not meant to walk this journey alone. God designed us for community.</p>
            <blockquote>"And let us consider how to stir up one another to love and good works, not neglecting to meet together." - Hebrews 10:24-25</blockquote>
            <h3>Why Community Matters</h3>
            <ul>
              <li><strong>Encouragement</strong> - Others lift you up when you're struggling</li>
              <li><strong>Accountability</strong> - Others help you stay on track</li>
              <li><strong>Growth</strong> - You learn from others who are further along</li>
              <li><strong>Service</strong> - You use your gifts to help others</li>
            </ul>
            <h3>Ways to Connect at TPC</h3>
            <ul>
              <li>Join a Community Group</li>
              <li>Attend services regularly</li>
              <li>Serve on a volunteer team</li>
              <li>Connect with a prayer partner</li>
            </ul>
            <p>Don't wait until you "have it all together." Come as you are and grow together!</p>
          `
        }
      ])
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
      description: "Learn to communicate with God effectively. This course covers the basics of prayer, different types of prayer, overcoming obstacles, and building a consistent prayer life. Transform your relationship with God through the power of prayer.",
      category: 'discipleship',
      difficulty_level: 'beginner',
      ministry_id: 'tpc',
      required_tier: 'free',
      status: 'published',
      estimated_hours: 3,
      has_certificate: true,
      published_at: new Date().toISOString()
    })
    .select()
    .single()

  if (course2Error) {
    console.error('Error creating course 2:', course2Error)
  } else {
    console.log('Created course:', course2.name)

    // Module 1: What is Prayer?
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
          content_html: `
            <h2>Prayer as Conversation</h2>
            <p>Prayer is not a religious ritual or a formal ceremony. At its core, prayer is simply conversation with God - your Heavenly Father who loves you.</p>
            <h3>God Wants to Hear From You</h3>
            <blockquote>"Call to me and I will answer you and tell you great and unsearchable things you do not know." - Jeremiah 33:3</blockquote>
            <p>Think about that - the Creator of the universe invites you to call on Him! He's not too busy, too distant, or too important. He wants to hear from you.</p>
            <h3>Two-Way Communication</h3>
            <p>Prayer is not just us talking to God - it's also listening. A good conversation involves both speaking and listening. As you grow in prayer, you'll learn to hear God's voice too.</p>
            <h3>No Formula Required</h3>
            <p>You don't need fancy words or religious language. God cares about your heart, not your vocabulary. Talk to Him like you would talk to a loving father or a close friend.</p>
          `
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
          content_html: `
            <h2>Why Pray?</h2>
            <p>If God already knows everything, why should we pray? Great question! Here's why prayer matters:</p>
            <h3>1. Relationship</h3>
            <p>Prayer builds intimacy with God. You can't have a close relationship with someone you never talk to.</p>
            <h3>2. Alignment</h3>
            <p>Prayer aligns your heart with God's heart. As you pray, your desires begin to match His desires.</p>
            <h3>3. Dependence</h3>
            <p>Prayer reminds you that you need God. It keeps you humble and dependent on Him.</p>
            <h3>4. Power</h3>
            <p>Prayer releases God's power into situations. James 5:16 says "The prayer of a righteous person has great power."</p>
            <h3>5. Transformation</h3>
            <p>Prayer changes you. Time in God's presence transforms you to be more like Jesus.</p>
            <h3>6. Invitation</h3>
            <p>Prayer invites God to work. He often waits for us to ask before He acts (Matthew 7:7).</p>
          `
        }
      ])
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
          content_html: `
            <h2>Praise and Worship</h2>
            <p>Praise and worship focus on who God is, not what He does for us. This is where we honor His character and attributes.</p>
            <h3>What to Praise God For:</h3>
            <ul>
              <li>His holiness and majesty</li>
              <li>His love and faithfulness</li>
              <li>His power and wisdom</li>
              <li>His mercy and grace</li>
              <li>His goodness and kindness</li>
            </ul>
            <blockquote>"Enter his gates with thanksgiving and his courts with praise; give thanks to him and praise his name." - Psalm 100:4</blockquote>
            <h3>Practical Tips:</h3>
            <ul>
              <li>Start your prayer time with praise</li>
              <li>Use the Psalms as a guide</li>
              <li>Play worship music to help you focus</li>
              <li>Speak or sing praises out loud</li>
            </ul>
          `
        },
        {
          module_id: mod2_2.id,
          slug: 'thanksgiving',
          name: 'Thanksgiving',
          description: 'Expressing gratitude to God',
          sequence_order: 2,
          content_type: 'text',
          estimated_minutes: 8,
          is_preview: false,
          content_html: `
            <h2>Thanksgiving</h2>
            <p>While praise focuses on who God is, thanksgiving focuses on what He has done. A grateful heart is essential to a healthy prayer life.</p>
            <blockquote>"Give thanks in all circumstances; for this is God's will for you in Christ Jesus." - 1 Thessalonians 5:18</blockquote>
            <h3>Things to Thank God For:</h3>
            <ul>
              <li>Salvation and eternal life</li>
              <li>Answered prayers</li>
              <li>Daily provisions</li>
              <li>Family and relationships</li>
              <li>Challenges that grow your faith</li>
              <li>His presence and peace</li>
            </ul>
            <h3>Keeping a Gratitude Journal</h3>
            <p>Consider keeping a list of things you're thankful for. When you're struggling, look back at all God has done. It will build your faith!</p>
          `
        },
        {
          module_id: mod2_2.id,
          slug: 'petition-and-intercession',
          name: 'Petition and Intercession',
          description: 'Asking God for yourself and others',
          sequence_order: 3,
          content_type: 'text',
          estimated_minutes: 12,
          is_preview: false,
          content_html: `
            <h2>Petition and Intercession</h2>
            <h3>Petition: Praying for Yourself</h3>
            <p>God invites you to bring your needs to Him:</p>
            <blockquote>"Do not be anxious about anything, but in everything by prayer and petition, with thanksgiving, present your requests to God." - Philippians 4:6</blockquote>
            <p>You can ask God for wisdom, provision, healing, guidance, strength, and anything else you need.</p>
            <h3>Intercession: Praying for Others</h3>
            <p>Intercession is standing in the gap for others. When you intercede, you're partnering with God on behalf of someone else.</p>
            <p>Who to Intercede For:</p>
            <ul>
              <li>Family members</li>
              <li>Friends and coworkers</li>
              <li>Church leaders</li>
              <li>Government officials</li>
              <li>The lost and hurting</li>
              <li>Other nations</li>
            </ul>
            <blockquote>"I urge, then, first of all, that petitions, prayers, intercession and thanksgiving be made for all people." - 1 Timothy 2:1</blockquote>
          `
        }
      ])
    }

    // Module 3: The Lord's Prayer
    const { data: mod2_3 } = await supabase
      .from('plant_modules')
      .insert({
        course_id: course2.id,
        slug: 'the-lords-prayer',
        name: "The Lord's Prayer",
        description: 'A model for how to pray',
        sequence_order: 3,
        has_quiz: true
      })
      .select()
      .single()

    if (mod2_3) {
      await supabase.from('plant_lessons').insert([
        {
          module_id: mod2_3.id,
          slug: 'jesus-model-prayer',
          name: "Jesus' Model Prayer",
          description: 'Breaking down the Lord\'s Prayer',
          sequence_order: 1,
          content_type: 'text',
          estimated_minutes: 15,
          is_preview: false,
          content_html: `
            <h2>Jesus' Model Prayer</h2>
            <p>When the disciples asked Jesus to teach them to pray, He gave them a model prayer (Matthew 6:9-13). Let's break it down:</p>
            <h3>"Our Father in heaven, hallowed be your name"</h3>
            <p><strong>Relationship + Reverence</strong> - Start by acknowledging God as your Father and honoring His name.</p>
            <h3>"Your kingdom come, your will be done, on earth as it is in heaven"</h3>
            <p><strong>Submission</strong> - Align yourself with God's purposes. Pray for His will, not just yours.</p>
            <h3>"Give us today our daily bread"</h3>
            <p><strong>Dependence</strong> - Bring your daily needs to God. He cares about your practical needs.</p>
            <h3>"Forgive us our debts, as we also have forgiven our debtors"</h3>
            <p><strong>Confession + Forgiveness</strong> - Confess your sins and extend forgiveness to others.</p>
            <h3>"Lead us not into temptation, but deliver us from the evil one"</h3>
            <p><strong>Protection</strong> - Ask for God's guidance and protection from spiritual attack.</p>
            <p>This isn't a prayer to recite mindlessly, but a template to guide your prayers.</p>
          `
        }
      ])
    }

    // Module 4: Building a Prayer Life
    const { data: mod2_4 } = await supabase
      .from('plant_modules')
      .insert({
        course_id: course2.id,
        slug: 'building-prayer-life',
        name: 'Building a Prayer Life',
        description: 'Practical steps to consistency',
        sequence_order: 4,
        has_quiz: false
      })
      .select()
      .single()

    if (mod2_4) {
      await supabase.from('plant_lessons').insert([
        {
          module_id: mod2_4.id,
          slug: 'overcoming-obstacles',
          name: 'Overcoming Obstacles',
          description: 'Common prayer struggles and solutions',
          sequence_order: 1,
          content_type: 'text',
          estimated_minutes: 10,
          is_preview: false,
          content_html: `
            <h2>Overcoming Obstacles to Prayer</h2>
            <h3>"I don't have time"</h3>
            <p>You have time for what you prioritize. Start with just 5-10 minutes. Pray while commuting, walking, or during lunch.</p>
            <h3>"I don't know what to say"</h3>
            <p>Start with what's on your heart. Use Scripture as a guide. The Holy Spirit helps you (Romans 8:26).</p>
            <h3>"My mind wanders"</h3>
            <p>This is normal! Gently redirect your thoughts. Pray out loud. Use a journal to write your prayers.</p>
            <h3>"I don't feel anything"</h3>
            <p>Prayer is about faith, not feelings. God hears you regardless of how you feel. Keep showing up.</p>
            <h3>"My prayers aren't answered"</h3>
            <p>God always answers - sometimes yes, sometimes no, sometimes wait. Trust His timing and wisdom.</p>
          `
        },
        {
          module_id: mod2_4.id,
          slug: 'creating-a-rhythm',
          name: 'Creating a Prayer Rhythm',
          description: 'Building sustainable prayer habits',
          sequence_order: 2,
          content_type: 'text',
          estimated_minutes: 10,
          is_preview: false,
          content_html: `
            <h2>Creating a Prayer Rhythm</h2>
            <h3>Morning Prayer</h3>
            <p>Start your day by giving it to God. Thank Him for a new day, seek His guidance, and commit your plans to Him.</p>
            <h3>Throughout the Day</h3>
            <p>Practice "breath prayers" - short prayers throughout the day. "Thank you, Lord." "Help me, Jesus." "Give me wisdom."</p>
            <h3>Evening Prayer</h3>
            <p>End your day by reflecting with God. Thank Him for the day, confess any sins, release any worries, and rest in His peace.</p>
            <h3>Practical Tips</h3>
            <ul>
              <li>Set reminders on your phone</li>
              <li>Link prayer to existing habits (after coffee, before bed)</li>
              <li>Find a prayer partner for accountability</li>
              <li>Keep a prayer journal to track prayers and answers</li>
              <li>Don't give up when you miss a day - just start again</li>
            </ul>
            <blockquote>"Pray without ceasing." - 1 Thessalonians 5:17</blockquote>
          `
        }
      ])
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
      description: "Discover how to read, understand, and apply God's Word to your life. This course covers Bible basics, study methods, and practical tips for making Scripture come alive. Perfect for anyone wanting to grow deeper in God's Word.",
      category: 'bible-study',
      difficulty_level: 'beginner',
      ministry_id: 'tpc',
      required_tier: 'free',
      status: 'published',
      estimated_hours: 2,
      has_certificate: true,
      published_at: new Date().toISOString()
    })
    .select()
    .single()

  if (course3Error) {
    console.error('Error creating course 3:', course3Error)
  } else {
    console.log('Created course:', course3.name)

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
          content_html: `
            <h2>What is the Bible?</h2>
            <p>The Bible is not just a book - it's a library of 66 books written over 1,500 years by more than 40 authors, all inspired by God.</p>
            <blockquote>"All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness." - 2 Timothy 3:16</blockquote>
            <h3>Two Main Sections</h3>
            <p><strong>Old Testament (39 books)</strong> - Written before Jesus came. Contains history, poetry, prophecy, and law.</p>
            <p><strong>New Testament (27 books)</strong> - Written after Jesus. Contains the Gospels, church history, letters, and prophecy.</p>
            <h3>The Central Theme</h3>
            <p>Though written by many authors, the Bible has one central theme: God's plan to rescue humanity through Jesus Christ. From Genesis to Revelation, it all points to Jesus.</p>
            <h3>Why It Matters</h3>
            <p>The Bible is God speaking to you. It's how you know who God is, who you are, and how to live. It's your guide for life.</p>
          `
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
          content_html: `
            <h2>Navigating Scripture</h2>
            <h3>Understanding References</h3>
            <p>When you see "John 3:16" it means:</p>
            <ul>
              <li><strong>John</strong> - The book name</li>
              <li><strong>3</strong> - The chapter number</li>
              <li><strong>16</strong> - The verse number</li>
            </ul>
            <h3>Using Your Bible</h3>
            <p>Most Bibles have a table of contents at the front that lists all 66 books with page numbers. Use this to find books until you learn where they are.</p>
            <h3>Bible Apps</h3>
            <p>Apps like YouVersion (Bible App) make it easy to search and read. You can search for any verse, highlight, take notes, and access different translations.</p>
            <h3>Where to Start Reading</h3>
            <p>If you're new to the Bible, start with:</p>
            <ul>
              <li><strong>Gospel of John</strong> - Learn about Jesus</li>
              <li><strong>Psalms</strong> - Prayers and praise</li>
              <li><strong>Proverbs</strong> - Practical wisdom</li>
              <li><strong>Romans</strong> - Core Christian beliefs</li>
            </ul>
          `
        }
      ])
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
          content_html: `
            <h2>The SOAP Method</h2>
            <p>SOAP is a simple method for reading and applying Scripture:</p>
            <h3>S - Scripture</h3>
            <p>Read a passage of Scripture. Write out the verse or verses that stand out to you.</p>
            <h3>O - Observation</h3>
            <p>What do you notice? Ask questions like:</p>
            <ul>
              <li>Who is speaking?</li>
              <li>What is happening?</li>
              <li>What words or phrases stand out?</li>
              <li>What is the main point?</li>
            </ul>
            <h3>A - Application</h3>
            <p>How does this apply to your life today? What is God saying to you personally through this passage?</p>
            <h3>P - Prayer</h3>
            <p>Respond to God in prayer. Thank Him for what you learned. Ask Him to help you apply it.</p>
            <p>Try this method with John 15:1-8 today!</p>
          `
        },
        {
          module_id: mod3_2.id,
          slug: 'asking-questions',
          name: 'Asking Good Questions',
          description: 'Questions that unlock understanding',
          sequence_order: 2,
          content_type: 'text',
          estimated_minutes: 10,
          is_preview: false,
          content_html: `
            <h2>Asking Good Questions</h2>
            <p>Good Bible study starts with good questions. Here are questions to ask every passage:</p>
            <h3>Context Questions</h3>
            <ul>
              <li>Who wrote this and to whom?</li>
              <li>When and where was it written?</li>
              <li>What was happening at the time?</li>
            </ul>
            <h3>Content Questions</h3>
            <ul>
              <li>What is the main idea?</li>
              <li>What words are repeated?</li>
              <li>Are there commands to obey or promises to claim?</li>
              <li>What does this reveal about God?</li>
              <li>What does this reveal about people?</li>
            </ul>
            <h3>Application Questions</h3>
            <ul>
              <li>How does this apply to me today?</li>
              <li>What should I do differently?</li>
              <li>Is there a sin to avoid or a truth to believe?</li>
            </ul>
          `
        }
      ])
    }

    // Module 3: Application
    const { data: mod3_3 } = await supabase
      .from('plant_modules')
      .insert({
        course_id: course3.id,
        slug: 'applying-scripture',
        name: 'Applying Scripture',
        description: 'Moving from reading to doing',
        sequence_order: 3,
        has_quiz: false
      })
      .select()
      .single()

    if (mod3_3) {
      await supabase.from('plant_lessons').insert([
        {
          module_id: mod3_3.id,
          slug: 'being-a-doer',
          name: 'Being a Doer of the Word',
          description: 'The goal of Bible reading',
          sequence_order: 1,
          content_type: 'text',
          estimated_minutes: 10,
          is_preview: false,
          content_html: `
            <h2>Being a Doer of the Word</h2>
            <blockquote>"But be doers of the word, and not hearers only, deceiving yourselves." - James 1:22</blockquote>
            <p>The goal of reading the Bible isn't to gain knowledge - it's to be transformed. Knowledge without application leads to pride. Application leads to growth.</p>
            <h3>The Danger of Hearing Only</h3>
            <p>James compares hearing without doing to looking in a mirror and immediately forgetting what you look like. It's pointless.</p>
            <h3>Moving to Action</h3>
            <p>After reading Scripture, ask:</p>
            <ul>
              <li>What one thing can I do TODAY to apply this?</li>
              <li>Who can I share this with?</li>
              <li>How will this change my behavior?</li>
            </ul>
            <h3>Start Small</h3>
            <p>You don't have to change everything at once. Apply one truth at a time. Small, consistent obedience leads to big transformation over time.</p>
          `
        },
        {
          module_id: mod3_3.id,
          slug: 'memorizing-scripture',
          name: 'Memorizing Scripture',
          description: 'Hiding God\'s Word in your heart',
          sequence_order: 2,
          content_type: 'text',
          estimated_minutes: 8,
          is_preview: false,
          content_html: `
            <h2>Memorizing Scripture</h2>
            <blockquote>"I have hidden your word in my heart that I might not sin against you." - Psalm 119:11</blockquote>
            <h3>Why Memorize?</h3>
            <ul>
              <li>God's Word is always with you</li>
              <li>It helps you resist temptation</li>
              <li>It renews your mind</li>
              <li>You can encourage others anytime</li>
            </ul>
            <h3>How to Memorize</h3>
            <ol>
              <li><strong>Choose a verse</strong> - Pick one that speaks to you</li>
              <li><strong>Write it down</strong> - The act of writing helps memory</li>
              <li><strong>Read it out loud</strong> - Repeat 5-10 times</li>
              <li><strong>Break it into phrases</strong> - Learn phrase by phrase</li>
              <li><strong>Review daily</strong> - Repetition is key</li>
            </ol>
            <h3>Good Starter Verses</h3>
            <ul>
              <li>John 3:16</li>
              <li>Philippians 4:13</li>
              <li>Romans 8:28</li>
              <li>Proverbs 3:5-6</li>
              <li>Jeremiah 29:11</li>
            </ul>
          `
        }
      ])
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
        has_certificate: true
      })

    if (error) {
      console.error(`Error creating placeholder course ${course.name}:`, error)
    } else {
      console.log('Created placeholder course:', course.name)
    }
  }

  console.log('Done seeding PLANT courses!')
}

seedCourses().catch(console.error)
