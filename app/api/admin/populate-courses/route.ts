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
    // COURSE 1: Introduction to the Bible
    // ============================================
    const { data: bibleCourse } = await supabase
      .from('plant_courses')
      .select('id')
      .eq('name', 'Introduction to the Bible')
      .single()

    if (bibleCourse) {
      // Delete existing modules/lessons for fresh content
      await supabase.from('plant_modules').delete().eq('course_id', bibleCourse.id)

      // Module 1: The Big Picture
      const { data: bibleM1 } = await supabase
        .from('plant_modules')
        .insert({
          course_id: bibleCourse.id,
          slug: 'the-big-picture',
          name: 'The Big Picture',
          description: 'Understanding what the Bible is and why it matters',
          sequence_order: 1,
          has_quiz: true
        })
        .select()
        .single()

      if (bibleM1) {
        await supabase.from('plant_lessons').insert([
          {
            module_id: bibleM1.id,
            slug: 'what-is-the-bible',
            name: 'What is the Bible?',
            description: 'An introduction to the most influential book in history',
            sequence_order: 1,
            content_type: 'text',
            estimated_minutes: 12,
            is_preview: true,
            content_html: `<h2>What is the Bible?</h2>
<p>The Bible is not just one book—it's a library of 66 books written over approximately 1,500 years by more than 40 different authors from all walks of life: kings, shepherds, fishermen, doctors, tax collectors, and prophets.</p>

<h3>The Word "Bible"</h3>
<p>The word "Bible" comes from the Greek word <em>biblia</em>, meaning "books." It's fitting because the Bible is indeed a collection of books unified by one divine Author—God Himself.</p>

<blockquote>"All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness, so that the servant of God may be thoroughly equipped for every good work." — 2 Timothy 3:16-17</blockquote>

<h3>Two Main Divisions</h3>
<p><strong>The Old Testament (39 books)</strong><br/>Written before Jesus came, covering creation through about 400 BC. It includes:</p>
<ul>
<li>The Law (Genesis-Deuteronomy) — God's covenant with Israel</li>
<li>History (Joshua-Esther) — Israel's story as a nation</li>
<li>Poetry & Wisdom (Job-Song of Solomon) — Prayers, praises, and practical wisdom</li>
<li>Prophets (Isaiah-Malachi) — God's messages through His spokespersons</li>
</ul>

<p><strong>The New Testament (27 books)</strong><br/>Written after Jesus' resurrection, covering His life through the early church:</p>
<ul>
<li>The Gospels (Matthew-John) — Four accounts of Jesus' life</li>
<li>History (Acts) — The birth and spread of the church</li>
<li>Letters (Romans-Jude) — Teaching for churches and individuals</li>
<li>Prophecy (Revelation) — The ultimate victory of God's kingdom</li>
</ul>

<h3>One Unified Story</h3>
<p>Despite being written over millennia by dozens of authors, the Bible tells one cohesive story: <strong>God's plan to rescue humanity and restore His creation through Jesus Christ.</strong></p>`
          },
          {
            module_id: bibleM1.id,
            slug: 'why-trust-the-bible',
            name: 'Why Trust the Bible?',
            description: 'Evidence for the reliability of Scripture',
            sequence_order: 2,
            content_type: 'text',
            estimated_minutes: 15,
            is_preview: false,
            content_html: `<h2>Why Trust the Bible?</h2>
<p>You may wonder: "How do I know the Bible is trustworthy?" This is an important question, and there are solid reasons to have confidence in Scripture.</p>

<h3>1. Manuscript Evidence</h3>
<p>The Bible has more manuscript evidence than any other ancient document. We have over 5,800 Greek manuscripts of the New Testament alone, some dating within decades of the original writings. By comparison, most ancient works (like Homer's Iliad) have fewer than 700 manuscripts.</p>

<h3>2. Archaeological Confirmation</h3>
<p>Archaeology has repeatedly confirmed biblical accounts. Cities, people, and events described in Scripture have been verified through discoveries like:</p>
<ul>
<li>The Dead Sea Scrolls (confirming Old Testament accuracy)</li>
<li>The Pilate Stone (confirming Pontius Pilate's existence)</li>
<li>Ancient Nineveh and Babylon (confirming prophetic accuracy)</li>
</ul>

<h3>3. Prophetic Fulfillment</h3>
<p>The Bible contains hundreds of prophecies written centuries before their fulfillment. Jesus alone fulfilled over 300 Old Testament prophecies—mathematical probability makes this impossible by chance.</p>

<h3>4. Internal Consistency</h3>
<p>Despite 40+ authors writing over 1,500 years in three languages across three continents, the Bible maintains remarkable unity in its message about God, humanity, sin, and salvation.</p>

<h3>5. Transformed Lives</h3>
<p>Throughout history, the Bible has transformed individuals, families, and entire societies. Its power to change lives is evidence of its divine origin.</p>

<blockquote>"For the word of God is alive and active. Sharper than any double-edged sword, it penetrates even to dividing soul and spirit, joints and marrow; it judges the thoughts and attitudes of the heart." — Hebrews 4:12</blockquote>

<h3>The Ultimate Reason</h3>
<p>While evidence matters, the deepest reason to trust the Bible is that through it, we encounter the living God. As you read Scripture with an open heart, the Holy Spirit confirms its truth within you.</p>`
          },
          {
            module_id: bibleM1.id,
            slug: 'the-bibles-main-message',
            name: "The Bible's Main Message",
            description: 'The storyline that runs through all 66 books',
            sequence_order: 3,
            content_type: 'text',
            estimated_minutes: 12,
            is_preview: false,
            content_html: `<h2>The Bible's Main Message</h2>
<p>The Bible isn't a random collection of stories—it's one grand narrative with a beginning, middle, and end. Understanding this "big story" helps everything else make sense.</p>

<h3>The Story in Four Acts</h3>

<h4>Act 1: Creation (Genesis 1-2)</h4>
<p>God creates a perfect world and places humanity in it to enjoy relationship with Him and steward His creation. Everything is "very good."</p>

<h4>Act 2: Fall (Genesis 3)</h4>
<p>Adam and Eve rebel against God, bringing sin, death, and separation into the world. This affects all of creation and all of humanity. We all inherit this broken condition.</p>

<h4>Act 3: Redemption (Genesis 4 - Revelation 20)</h4>
<p>This is the longest act—God's plan to rescue and restore. It includes:</p>
<ul>
<li>God's promise to Abraham (a blessing for all nations)</li>
<li>God's covenant with Israel (a people set apart)</li>
<li>God's prophets (pointing to a coming Savior)</li>
<li><strong>Jesus Christ</strong> (the fulfillment of all promises)</li>
<li>The Church (spreading the good news worldwide)</li>
</ul>

<h4>Act 4: Restoration (Revelation 21-22)</h4>
<p>God creates a new heaven and new earth. Sin, death, and suffering are gone forever. God dwells with His people for eternity.</p>

<h3>The Hero of the Story</h3>
<p>Jesus is the hero of the entire Bible—not just the New Testament. The Old Testament points forward to Him; the New Testament reveals Him and points back to His finished work.</p>

<blockquote>"And beginning with Moses and all the Prophets, he explained to them what was said in all the Scriptures concerning himself." — Luke 24:27</blockquote>

<p>When you read any passage, ask: <strong>"How does this point to Jesus and God's plan of salvation?"</strong></p>`
          }
        ])
        results.push('Added Introduction to the Bible - Module 1: The Big Picture')
      }

      // Module 2: How to Read the Bible
      const { data: bibleM2 } = await supabase
        .from('plant_modules')
        .insert({
          course_id: bibleCourse.id,
          slug: 'how-to-read-the-bible',
          name: 'How to Read the Bible',
          description: 'Practical approaches to understanding Scripture',
          sequence_order: 2,
          has_quiz: true
        })
        .select()
        .single()

      if (bibleM2) {
        await supabase.from('plant_lessons').insert([
          {
            module_id: bibleM2.id,
            slug: 'reading-with-context',
            name: 'Reading with Context',
            description: 'Why context is king in Bible interpretation',
            sequence_order: 1,
            content_type: 'text',
            estimated_minutes: 12,
            is_preview: false,
            content_html: `<h2>Reading with Context</h2>
<p>The number one rule in Bible interpretation is: <strong>Context is king.</strong> Taking verses out of context leads to misunderstanding and misapplication.</p>

<h3>Three Levels of Context</h3>

<h4>1. Immediate Context</h4>
<p>What comes before and after the verse? Read the surrounding paragraphs and chapter to understand the flow of thought.</p>
<p><em>Example:</em> Philippians 4:13 ("I can do all things through Christ who strengthens me") isn't about athletic achievements—in context, Paul is talking about being content whether in plenty or in need.</p>

<h4>2. Book Context</h4>
<p>What is the purpose of this book? Who wrote it? To whom? Why?</p>
<ul>
<li>A letter to a struggling church (Corinthians) reads differently than a praise psalm</li>
<li>Historical narrative has different applications than direct commands</li>
</ul>

<h4>3. Biblical Context</h4>
<p>How does this fit into the whole Bible's story? Scripture interprets Scripture—clearer passages help explain difficult ones.</p>

<h3>Questions to Ask</h3>
<ul>
<li><strong>Who</strong> wrote this and to whom?</li>
<li><strong>What</strong> type of literature is this? (poetry, prophecy, history, letter)</li>
<li><strong>When</strong> was this written? What was happening?</li>
<li><strong>Where</strong> were the author and audience located?</li>
<li><strong>Why</strong> was this written? What problem or situation prompted it?</li>
</ul>

<h3>A Word of Caution</h3>
<p>Be careful not to make the Bible say what you want it to say. Come with humility, ready to be changed by God's Word rather than using it to confirm what you already believe.</p>

<blockquote>"Do your best to present yourself to God as one approved, a worker who does not need to be ashamed and who correctly handles the word of truth." — 2 Timothy 2:15</blockquote>`
          },
          {
            module_id: bibleM2.id,
            slug: 'the-soap-method',
            name: 'The SOAP Method',
            description: 'A simple daily Bible reading approach',
            sequence_order: 2,
            content_type: 'text',
            estimated_minutes: 10,
            is_preview: false,
            content_html: `<h2>The SOAP Method</h2>
<p>SOAP is a simple, effective method for daily Bible reading that helps you not just read, but truly engage with Scripture.</p>

<h3>S — Scripture</h3>
<p>Read a passage of the Bible. Don't rush—read slowly and thoughtfully. As you read, write out a verse or two that stands out to you.</p>
<p><em>Tip:</em> Start with a Gospel (Mark is a great choice) or a short letter (Philippians, Colossians).</p>

<h3>O — Observation</h3>
<p>What do you notice about this passage? Ask yourself:</p>
<ul>
<li>What is happening in this passage?</li>
<li>Who is speaking or being spoken to?</li>
<li>Are there any repeated words or themes?</li>
<li>What words or phrases stand out?</li>
<li>Is there a command, promise, or warning?</li>
</ul>

<h3>A — Application</h3>
<p>How does this apply to your life today? This is where it gets personal:</p>
<ul>
<li>Is there a sin to confess?</li>
<li>Is there a promise to claim?</li>
<li>Is there an example to follow?</li>
<li>Is there a command to obey?</li>
<li>What is God saying to ME through this?</li>
</ul>

<h3>P — Prayer</h3>
<p>Respond to God in prayer based on what you've read. Thank Him for what you learned. Ask Him to help you apply it. Pray the Scripture back to Him.</p>

<h3>Getting Started</h3>
<p>All you need is:</p>
<ul>
<li>A Bible (physical or app)</li>
<li>A journal or notebook</li>
<li>10-15 minutes</li>
<li>A quiet place</li>
</ul>

<p><strong>Remember:</strong> The goal isn't to check a box—it's to meet with God. Some days will feel rich; others may feel dry. Stay consistent, and over time you'll see tremendous growth.</p>`
          },
          {
            module_id: bibleM2.id,
            slug: 'understanding-genres',
            name: 'Understanding Bible Genres',
            description: 'How to read different types of biblical literature',
            sequence_order: 3,
            content_type: 'text',
            estimated_minutes: 14,
            is_preview: false,
            content_html: `<h2>Understanding Bible Genres</h2>
<p>The Bible contains different types of literature, and each type should be read differently. You wouldn't read poetry the same way you read a history textbook—the same is true in Scripture.</p>

<h3>Narrative/History</h3>
<p><em>Examples: Genesis, Exodus, Acts, the Gospels</em></p>
<p>These tell stories of real people and events. When reading narrative:</p>
<ul>
<li>Look for what the story teaches about God's character</li>
<li>Not every action recorded is endorsed—some characters make bad choices</li>
<li>Ask: "What was God doing in this situation?"</li>
</ul>

<h3>Law</h3>
<p><em>Examples: Leviticus, Deuteronomy</em></p>
<p>These are God's instructions to ancient Israel. When reading law:</p>
<ul>
<li>Some laws are moral (still apply), some are civil or ceremonial (fulfilled in Christ)</li>
<li>Look for the principle behind the law</li>
<li>Ask: "What does this reveal about God's character and values?"</li>
</ul>

<h3>Poetry & Wisdom</h3>
<p><em>Examples: Psalms, Proverbs, Ecclesiastes, Song of Solomon</em></p>
<ul>
<li>Uses figurative language, metaphor, and imagery</li>
<li>Psalms express honest emotions—even anger and despair</li>
<li>Proverbs are general principles, not absolute promises</li>
</ul>

<h3>Prophecy</h3>
<p><em>Examples: Isaiah, Jeremiah, Revelation</em></p>
<ul>
<li>Often uses symbolic language</li>
<li>May have near and far fulfillments</li>
<li>Focus on the main message, not every detail</li>
</ul>

<h3>Letters (Epistles)</h3>
<p><em>Examples: Romans, Galatians, James</em></p>
<ul>
<li>Written to specific people with specific situations</li>
<li>Most directly applicable to Christians today</li>
<li>Understand the original situation to apply correctly</li>
</ul>

<h3>A Practical Tip</h3>
<p>When you're unsure how to interpret a passage, ask: "What type of literature is this?" That simple question will guide you to read it appropriately.</p>`
          }
        ])
        results.push('Added Introduction to the Bible - Module 2: How to Read the Bible')
      }

      // Module 3: Applying Scripture
      const { data: bibleM3 } = await supabase
        .from('plant_modules')
        .insert({
          course_id: bibleCourse.id,
          slug: 'applying-scripture',
          name: 'Applying Scripture to Life',
          description: 'Moving from reading to living',
          sequence_order: 3,
          has_quiz: false
        })
        .select()
        .single()

      if (bibleM3) {
        await supabase.from('plant_lessons').insert([
          {
            module_id: bibleM3.id,
            slug: 'meditation-and-memorization',
            name: 'Meditation & Memorization',
            description: 'Going deeper than just reading',
            sequence_order: 1,
            content_type: 'text',
            estimated_minutes: 10,
            is_preview: false,
            content_html: `<h2>Meditation & Memorization</h2>
<p>Reading the Bible is good, but <strong>meditating</strong> on it takes your spiritual growth to another level.</p>

<h3>What is Biblical Meditation?</h3>
<p>Unlike Eastern meditation (emptying the mind), biblical meditation is <strong>filling your mind</strong> with God's Word and thinking deeply about it.</p>

<blockquote>"Keep this Book of the Law always on your lips; meditate on it day and night, so that you may be careful to do everything written in it. Then you will be prosperous and successful." — Joshua 1:8</blockquote>

<h3>How to Meditate on Scripture</h3>
<ol>
<li><strong>Read slowly</strong> — Take a single verse or short passage</li>
<li><strong>Emphasize different words</strong> — "The LORD is MY shepherd" vs. "The LORD is my SHEPHERD"</li>
<li><strong>Ask questions</strong> — Why did God include this? What does this mean for me?</li>
<li><strong>Visualize</strong> — Picture the scene. Put yourself in the story.</li>
<li><strong>Pray it back</strong> — Turn the verse into a prayer</li>
<li><strong>Return to it</strong> — Think about it throughout your day</li>
</ol>

<h3>The Power of Memorization</h3>
<p>Scripture memorization plants God's Word in your heart where it can work even when your Bible isn't open.</p>

<p><strong>Benefits of memorization:</strong></p>
<ul>
<li>Helps you resist temptation (Jesus quoted Scripture when tempted)</li>
<li>Provides comfort in difficult times</li>
<li>Equips you to share truth with others</li>
<li>Transforms your thinking over time</li>
</ul>

<h3>Tips for Memorizing</h3>
<ul>
<li>Start small — one verse at a time</li>
<li>Write it out by hand</li>
<li>Say it out loud repeatedly</li>
<li>Review regularly (use an app or index cards)</li>
<li>Learn it in context, not just isolation</li>
</ul>

<p><strong>Start with these verses:</strong> Psalm 23:1, Jeremiah 29:11, Romans 8:28, Philippians 4:6-7</p>`
          },
          {
            module_id: bibleM3.id,
            slug: 'living-it-out',
            name: 'Living It Out',
            description: 'Being a doer of the Word, not just a hearer',
            sequence_order: 2,
            content_type: 'text',
            estimated_minutes: 10,
            is_preview: false,
            content_html: `<h2>Living It Out</h2>
<p>The goal of Bible reading isn't just knowledge—it's transformation. James gives us a clear warning:</p>

<blockquote>"Do not merely listen to the word, and so deceive yourselves. Do what it says. Anyone who listens to the word but does not do what it says is like someone who looks at his face in a mirror and, after looking at himself, goes away and immediately forgets what he looks like." — James 1:22-24</blockquote>

<h3>From Reading to Doing</h3>
<p>Every time you read Scripture, ask: <strong>"What will I DO with this?"</strong></p>

<p>Be specific. Instead of "I'll be more loving," try "I will call my mom today and tell her I appreciate her."</p>

<h3>Common Applications</h3>
<ul>
<li><strong>Confess</strong> — Is there sin to turn from?</li>
<li><strong>Believe</strong> — Is there a truth to embrace?</li>
<li><strong>Thank</strong> — Is there a blessing to be grateful for?</li>
<li><strong>Pray</strong> — Is there something to bring before God?</li>
<li><strong>Act</strong> — Is there something specific to do today?</li>
<li><strong>Share</strong> — Is there someone who needs to hear this?</li>
</ul>

<h3>Accountability Helps</h3>
<p>Share what you're learning with someone. When you know you'll be asked "What did you learn and how did you apply it?" you're more likely to follow through.</p>

<h3>Grace for the Process</h3>
<p>You won't perfectly apply everything you read. That's okay. The Christian life is a journey of growth. When you fail, confess it, receive grace, and keep going.</p>

<blockquote>"Being confident of this, that he who began a good work in you will carry it on to completion until the day of Christ Jesus." — Philippians 1:6</blockquote>

<p>God is committed to your growth. Partner with Him through His Word, and watch how He transforms you over time.</p>`
          }
        ])
        results.push('Added Introduction to the Bible - Module 3: Applying Scripture')
      }

      // Update course stats
      await supabase
        .from('plant_courses')
        .update({ total_modules: 3, total_lessons: 8, estimated_hours: 8 })
        .eq('id', bibleCourse.id)

      results.push('Updated Introduction to the Bible course stats')
    }

    // ============================================
    // COURSE 2: Prayer Foundations
    // ============================================
    const { data: prayerCourse } = await supabase
      .from('plant_courses')
      .select('id')
      .eq('name', 'Prayer Foundations')
      .single()

    if (prayerCourse) {
      // Delete existing modules/lessons for fresh content
      await supabase.from('plant_modules').delete().eq('course_id', prayerCourse.id)

      // Module 1: Understanding Prayer
      const { data: prayerM1 } = await supabase
        .from('plant_modules')
        .insert({
          course_id: prayerCourse.id,
          slug: 'understanding-prayer',
          name: 'Understanding Prayer',
          description: 'The foundation of a powerful prayer life',
          sequence_order: 1,
          has_quiz: true
        })
        .select()
        .single()

      if (prayerM1) {
        await supabase.from('plant_lessons').insert([
          {
            module_id: prayerM1.id,
            slug: 'what-is-prayer',
            name: 'What is Prayer?',
            description: 'Understanding prayer as relationship, not ritual',
            sequence_order: 1,
            content_type: 'text',
            estimated_minutes: 12,
            is_preview: true,
            content_html: `<h2>What is Prayer?</h2>
<p>At its simplest, prayer is <strong>conversation with God</strong>. It's not a religious ritual or a formal ceremony—it's relationship.</p>

<h3>Prayer is Talking WITH God, Not AT God</h3>
<p>Many people think of prayer as a one-way monologue where we present our requests to God. But real prayer is two-way communication. We speak, and we listen. We share our hearts, and we receive from His.</p>

<blockquote>"Call to me and I will answer you and tell you great and unsearchable things you do not know." — Jeremiah 33:3</blockquote>

<h3>The Privilege of Prayer</h3>
<p>Consider this: The Creator of the universe—the One who spoke galaxies into existence—invites you to talk with Him anytime, anywhere, about anything. He's never too busy. He never puts you on hold. He never gets tired of hearing from you.</p>

<h3>What Prayer is NOT</h3>
<ul>
<li>It's NOT earning God's favor (you already have it in Christ)</li>
<li>It's NOT trying to change God's mind</li>
<li>It's NOT just for emergencies</li>
<li>It's NOT a performance (God sees your heart, not your words)</li>
<li>It's NOT limited to certain times or places</li>
</ul>

<h3>What Prayer IS</h3>
<ul>
<li>Communion with your Heavenly Father</li>
<li>Aligning your heart with God's heart</li>
<li>Partnering with God in His purposes</li>
<li>Receiving strength, wisdom, and peace</li>
<li>The privilege of every believer</li>
</ul>

<h3>You Have Access</h3>
<p>Because of Jesus, you can approach God with confidence:</p>
<blockquote>"Let us then approach God's throne of grace with confidence, so that we may receive mercy and find grace to help us in our time of need." — Hebrews 4:16</blockquote>`
          },
          {
            module_id: prayerM1.id,
            slug: 'why-pray',
            name: 'Why Pray?',
            description: 'The purpose and power of prayer',
            sequence_order: 2,
            content_type: 'text',
            estimated_minutes: 12,
            is_preview: false,
            content_html: `<h2>Why Pray?</h2>
<p>If God already knows everything and has a perfect plan, why should we pray? This is one of the most common questions about prayer.</p>

<h3>1. Because Jesus Did</h3>
<p>Jesus—who was God in the flesh—prayed constantly. If the Son of God needed prayer, how much more do we?</p>
<ul>
<li>He prayed before major decisions (Luke 6:12-13)</li>
<li>He prayed in times of stress (Luke 22:41-44)</li>
<li>He withdrew regularly to pray (Luke 5:16)</li>
<li>He prayed for others (John 17)</li>
</ul>

<h3>2. God Invites and Commands It</h3>
<blockquote>"Pray without ceasing." — 1 Thessalonians 5:17</blockquote>
<blockquote>"Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God." — Philippians 4:6</blockquote>

<h3>3. Prayer Changes Things</h3>
<p>God has chosen to work through the prayers of His people. James 5:16 says, "The prayer of a righteous person is powerful and effective."</p>
<p>Prayer doesn't change God—it changes situations and it changes us.</p>

<h3>4. Prayer Deepens Relationship</h3>
<p>You can't have intimacy with someone you never talk to. Prayer is how we grow closer to God. It's where we experience His presence, hear His voice, and know His heart.</p>

<h3>5. Prayer Transforms You</h3>
<p>Time in God's presence changes us. We become more like Jesus. Our desires align with His. Our perspective shifts from earthly to eternal.</p>

<h3>6. Prayer is Spiritual Warfare</h3>
<p>We're in a spiritual battle, and prayer is one of our primary weapons. Through prayer, we resist the enemy and advance God's kingdom.</p>

<blockquote>"The weapons we fight with are not the weapons of the world. On the contrary, they have divine power to demolish strongholds." — 2 Corinthians 10:4</blockquote>`
          },
          {
            module_id: prayerM1.id,
            slug: 'how-god-answers',
            name: 'How God Answers Prayer',
            description: 'Understanding God\'s responses to our prayers',
            sequence_order: 3,
            content_type: 'text',
            estimated_minutes: 10,
            is_preview: false,
            content_html: `<h2>How God Answers Prayer</h2>
<p>God always answers prayer—but not always the way we expect. Understanding His different responses helps us pray with faith and trust His timing.</p>

<h3>Yes</h3>
<p>Sometimes God gives us exactly what we asked for. These moments build our faith and remind us He hears us.</p>

<h3>No</h3>
<p>Sometimes God says no because He has something better, or He sees dangers we can't see. A loving Father doesn't give His children everything they ask for.</p>
<p><em>Example:</em> Paul prayed three times for his "thorn in the flesh" to be removed. God said no, but gave him sufficient grace (2 Corinthians 12:7-9).</p>

<h3>Wait</h3>
<p>Sometimes God's answer is "not yet." Waiting develops patience, deepens trust, and often prepares us to receive what we've asked for.</p>
<p><em>Example:</em> Abraham waited 25 years for the promised son. The delay wasn't denial—it was preparation.</p>

<h3>Something Better</h3>
<p>God often answers prayer in ways we didn't expect but that exceed what we asked. He sees the bigger picture.</p>

<blockquote>"Now to him who is able to do immeasurably more than all we ask or imagine, according to his power that is at work within us." — Ephesians 3:20</blockquote>

<h3>Keys to Receiving Answers</h3>
<ul>
<li><strong>Pray according to God's will</strong> (1 John 5:14)</li>
<li><strong>Pray in faith, believing</strong> (Mark 11:24)</li>
<li><strong>Pray with pure motives</strong> (James 4:3)</li>
<li><strong>Pray persistently</strong> (Luke 18:1)</li>
<li><strong>Deal with known sin</strong> (Psalm 66:18)</li>
</ul>

<h3>Trust His Heart</h3>
<p>When you don't understand God's answer, trust His character. He is good. He loves you. He knows best. His ways are higher than ours.</p>`
          }
        ])
        results.push('Added Prayer Foundations - Module 1: Understanding Prayer')
      }

      // Module 2: Types of Prayer
      const { data: prayerM2 } = await supabase
        .from('plant_modules')
        .insert({
          course_id: prayerCourse.id,
          slug: 'types-of-prayer',
          name: 'Types of Prayer',
          description: 'Different ways to approach God',
          sequence_order: 2,
          has_quiz: false
        })
        .select()
        .single()

      if (prayerM2) {
        await supabase.from('plant_lessons').insert([
          {
            module_id: prayerM2.id,
            slug: 'praise-and-worship',
            name: 'Praise & Worship',
            description: 'Honoring God for who He is',
            sequence_order: 1,
            content_type: 'text',
            estimated_minutes: 10,
            is_preview: false,
            content_html: `<h2>Praise & Worship</h2>
<p>Praise and worship focus on <strong>who God is</strong>, not just what He does for us. This type of prayer shifts our focus from ourselves to Him.</p>

<h3>What's the Difference?</h3>
<p><strong>Praise</strong> is celebrating God's acts—what He has done.<br/>
<strong>Worship</strong> is adoring God's character—who He is.</p>

<blockquote>"Enter his gates with thanksgiving and his courts with praise; give thanks to him and praise his name. For the LORD is good and his love endures forever." — Psalm 100:4-5</blockquote>

<h3>Why Start with Praise?</h3>
<p>Beginning prayer with praise:</p>
<ul>
<li>Puts God in His rightful place</li>
<li>Shifts your perspective from problems to His power</li>
<li>Builds your faith as you remember who you're talking to</li>
<li>Prepares your heart to receive from Him</li>
</ul>

<h3>What to Praise God For</h3>
<p><strong>His Character:</strong></p>
<ul>
<li>Holy — set apart, pure, perfect</li>
<li>Faithful — He keeps His promises</li>
<li>Loving — His love never fails</li>
<li>Sovereign — He's in control</li>
<li>Good — everything He does is right</li>
</ul>

<p><strong>His Works:</strong></p>
<ul>
<li>Creation — the beauty and complexity of what He made</li>
<li>Salvation — rescuing us through Jesus</li>
<li>Daily provision — meeting our needs</li>
<li>Answered prayers — specific things He's done</li>
</ul>

<h3>How to Practice Praise</h3>
<ul>
<li>Use the Psalms as a guide</li>
<li>List God's attributes and thank Him for each one</li>
<li>Sing worship songs as prayers</li>
<li>Praise Him even when you don't feel like it—it's a sacrifice (Hebrews 13:15)</li>
</ul>`
          },
          {
            module_id: prayerM2.id,
            slug: 'thanksgiving',
            name: 'Thanksgiving',
            description: 'Cultivating a grateful heart',
            sequence_order: 2,
            content_type: 'text',
            estimated_minutes: 8,
            is_preview: false,
            content_html: `<h2>Thanksgiving</h2>
<p>Thanksgiving is expressing gratitude to God for what He has done. A thankful heart is essential for a healthy prayer life.</p>

<blockquote>"Give thanks in all circumstances; for this is God's will for you in Christ Jesus." — 1 Thessalonians 5:18</blockquote>

<h3>Why Thanksgiving Matters</h3>
<ul>
<li>It acknowledges God as the source of all good things</li>
<li>It combats entitlement and complaint</li>
<li>It shifts focus from what's lacking to what's present</li>
<li>It builds faith by remembering God's faithfulness</li>
<li>It's commanded—it's God's will for us</li>
</ul>

<h3>What to Thank God For</h3>
<ul>
<li><strong>Salvation</strong> — the gift of eternal life</li>
<li><strong>Daily provision</strong> — food, shelter, clothing</li>
<li><strong>Relationships</strong> — family, friends, church</li>
<li><strong>Answered prayers</strong> — specific requests He's granted</li>
<li><strong>Trials</strong> — yes, even difficulties (they produce growth)</li>
<li><strong>His presence</strong> — that He never leaves us</li>
</ul>

<h3>Practical Tips</h3>
<ul>
<li>Keep a gratitude journal</li>
<li>Start each prayer with thanksgiving</li>
<li>Thank God throughout the day for small things</li>
<li>When tempted to complain, choose thanks instead</li>
<li>Be specific—name the blessings</li>
</ul>

<h3>In All Circumstances</h3>
<p>Notice Paul says "in" all circumstances, not "for" all circumstances. You don't have to thank God for tragedy, but you can thank Him in it—for His presence, His comfort, His promise to work all things for good.</p>`
          },
          {
            module_id: prayerM2.id,
            slug: 'petition-and-intercession',
            name: 'Petition & Intercession',
            description: 'Praying for yourself and others',
            sequence_order: 3,
            content_type: 'text',
            estimated_minutes: 12,
            is_preview: false,
            content_html: `<h2>Petition & Intercession</h2>
<p>God invites us to bring our needs (petition) and the needs of others (intercession) to Him.</p>

<h3>Petition: Praying for Yourself</h3>
<p>Some people feel guilty asking God for things, but Scripture encourages it:</p>
<blockquote>"Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God." — Philippians 4:6</blockquote>

<p><strong>What to petition for:</strong></p>
<ul>
<li>Wisdom and guidance</li>
<li>Provision for needs</li>
<li>Strength for challenges</li>
<li>Protection from evil</li>
<li>Growth in character</li>
<li>Opportunities to serve</li>
</ul>

<h3>Intercession: Praying for Others</h3>
<p>Intercession means standing in the gap for others, lifting their needs before God as if they were your own.</p>

<blockquote>"I urge, then, first of all, that petitions, prayers, intercession and thanksgiving be made for all people." — 1 Timothy 2:1</blockquote>

<p><strong>Who to intercede for:</strong></p>
<ul>
<li>Family members</li>
<li>Friends and neighbors</li>
<li>Church leaders and members</li>
<li>Government officials</li>
<li>The sick and suffering</li>
<li>Those who don't know Jesus</li>
<li>Missionaries and persecuted believers</li>
</ul>

<h3>How to Intercede Effectively</h3>
<ul>
<li>Pray Scripture over people</li>
<li>Be specific about their needs</li>
<li>Pray with faith, believing God hears</li>
<li>Follow up—ask how things are going</li>
<li>Keep a prayer list to stay faithful</li>
</ul>

<h3>The Ministry of Intercession</h3>
<p>When you intercede, you partner with God in His work in others' lives. It's one of the most powerful things you can do for someone. Never underestimate the impact of your prayers!</p>`
          },
          {
            module_id: prayerM2.id,
            slug: 'confession-and-repentance',
            name: 'Confession & Repentance',
            description: 'Keeping short accounts with God',
            sequence_order: 4,
            content_type: 'text',
            estimated_minutes: 10,
            is_preview: false,
            content_html: `<h2>Confession & Repentance</h2>
<p>Confession is agreeing with God about our sin. Repentance is turning away from it. Both are essential for a healthy relationship with God.</p>

<h3>Why Confession Matters</h3>
<p>Unconfessed sin doesn't remove our salvation, but it does hinder our fellowship with God and our effectiveness in prayer.</p>

<blockquote>"If I had cherished sin in my heart, the Lord would not have listened." — Psalm 66:18</blockquote>

<p>But God promises forgiveness when we confess:</p>
<blockquote>"If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness." — 1 John 1:9</blockquote>

<h3>How to Confess</h3>
<ol>
<li><strong>Agree with God</strong> — call sin what it is, don't minimize or excuse it</li>
<li><strong>Be specific</strong> — name the sin rather than vague generalities</li>
<li><strong>Accept forgiveness</strong> — don't keep beating yourself up</li>
<li><strong>Turn away</strong> — genuine repentance involves a change of direction</li>
<li><strong>Make amends</strong> — if you've wronged someone, seek to make it right</li>
</ol>

<h3>What to Confess</h3>
<ul>
<li>Actions — things you did that you shouldn't have</li>
<li>Omissions — things you should have done but didn't</li>
<li>Attitudes — pride, bitterness, selfishness, fear</li>
<li>Words — gossip, lies, harsh speech</li>
<li>Thoughts — lust, jealousy, judgment</li>
</ul>

<h3>Receive Grace</h3>
<p>Confession isn't meant to shame you—it's meant to free you. God already knows your sin. When you confess, you're not informing Him; you're agreeing with Him and receiving the grace He longs to give.</p>

<p>Don't let shame keep you from coming to God. He's a loving Father who runs toward repentant children (Luke 15:20).</p>`
          }
        ])
        results.push('Added Prayer Foundations - Module 2: Types of Prayer')
      }

      // Module 3: Building a Prayer Life
      const { data: prayerM3 } = await supabase
        .from('plant_modules')
        .insert({
          course_id: prayerCourse.id,
          slug: 'building-a-prayer-life',
          name: 'Building a Prayer Life',
          description: 'Practical steps for consistent prayer',
          sequence_order: 3,
          has_quiz: true
        })
        .select()
        .single()

      if (prayerM3) {
        await supabase.from('plant_lessons').insert([
          {
            module_id: prayerM3.id,
            slug: 'creating-a-prayer-rhythm',
            name: 'Creating a Prayer Rhythm',
            description: 'Establishing consistent times with God',
            sequence_order: 1,
            content_type: 'text',
            estimated_minutes: 10,
            is_preview: false,
            content_html: `<h2>Creating a Prayer Rhythm</h2>
<p>Consistent prayer doesn't happen by accident. It requires intentionality. Here's how to build a sustainable prayer rhythm.</p>

<h3>Set a Time</h3>
<p>Choose a specific time each day for focused prayer. Many find morning works best:</p>
<blockquote>"In the morning, LORD, you hear my voice; in the morning I lay my requests before you and wait expectantly." — Psalm 5:3</blockquote>

<p>But any consistent time works—lunch break, commute, evening. The key is consistency.</p>

<h3>Find a Place</h3>
<p>Jesus often withdrew to solitary places to pray (Luke 5:16). Find a spot where you can minimize distractions:</p>
<ul>
<li>A quiet corner at home</li>
<li>Your car before work</li>
<li>A park or outdoor space</li>
<li>An office with the door closed</li>
</ul>

<h3>Start Small</h3>
<p>Don't try to pray for an hour on day one. Start with 10-15 minutes and grow from there. Consistency matters more than duration.</p>

<h3>Use a Framework</h3>
<p>Having a structure helps, especially when starting. Try the ACTS model:</p>
<ul>
<li><strong>A</strong>doration — praise God for who He is</li>
<li><strong>C</strong>onfession — acknowledge sin and receive forgiveness</li>
<li><strong>T</strong>hanksgiving — thank God for what He's done</li>
<li><strong>S</strong>upplication — bring your requests and intercede for others</li>
</ul>

<h3>Keep a Prayer Journal</h3>
<p>Writing helps you stay focused and creates a record of God's faithfulness. Include:</p>
<ul>
<li>What you're praying for</li>
<li>Scripture that guides your prayers</li>
<li>Answers to prayer (don't forget to record these!)</li>
</ul>

<h3>Grace for the Process</h3>
<p>Some days will be rich; others will feel dry. Don't evaluate your prayer life by feelings. Show up consistently, and trust God to meet you.</p>`
          },
          {
            module_id: prayerM3.id,
            slug: 'praying-scripture',
            name: 'Praying Scripture',
            description: 'Letting God\'s Word guide your prayers',
            sequence_order: 2,
            content_type: 'text',
            estimated_minutes: 12,
            is_preview: false,
            content_html: `<h2>Praying Scripture</h2>
<p>One of the most powerful ways to pray is to use God's own words. When you pray Scripture, you know you're praying according to His will.</p>

<h3>Why Pray Scripture?</h3>
<ul>
<li>It keeps your prayers aligned with God's will</li>
<li>It gives you words when you don't know what to say</li>
<li>It builds your faith (you're praying God's promises)</li>
<li>It renews your mind as you pray</li>
<li>It's praying with authority</li>
</ul>

<h3>How to Pray Scripture</h3>

<h4>Method 1: Personalize It</h4>
<p>Take a verse and insert yourself or others into it.</p>
<p><em>Psalm 23:1</em> becomes: "Lord, You are MY shepherd. I shall not want."</p>
<p><em>Philippians 4:19</em> becomes: "God, I trust You to meet all of [name's] needs according to Your riches in glory."</p>

<h4>Method 2: Respond to It</h4>
<p>Read a passage and let it prompt your prayers.</p>
<p>Reading about God's faithfulness? Thank Him for His faithfulness in your life.</p>
<p>Reading a command? Ask for help to obey it.</p>

<h4>Method 3: Declare It</h4>
<p>Speak Scripture out loud as a declaration of truth.</p>
<p>"No weapon formed against me shall prosper" (Isaiah 54:17).</p>
<p>"Greater is He who is in me than he who is in the world" (1 John 4:4).</p>

<h3>Scriptures to Pray</h3>
<ul>
<li><strong>For guidance:</strong> Proverbs 3:5-6, James 1:5</li>
<li><strong>For peace:</strong> Philippians 4:6-7, Isaiah 26:3</li>
<li><strong>For protection:</strong> Psalm 91, Psalm 121</li>
<li><strong>For others:</strong> Ephesians 1:17-19, Colossians 1:9-12</li>
<li><strong>For strength:</strong> Isaiah 40:31, Philippians 4:13</li>
</ul>

<p>Start a collection of verses that become your personal prayer arsenal. The more Scripture you know, the more fuel you have for prayer.</p>`
          },
          {
            module_id: prayerM3.id,
            slug: 'overcoming-obstacles',
            name: 'Overcoming Prayer Obstacles',
            description: 'Breaking through common barriers',
            sequence_order: 3,
            content_type: 'text',
            estimated_minutes: 12,
            is_preview: false,
            content_html: `<h2>Overcoming Prayer Obstacles</h2>
<p>Every Christian faces obstacles to prayer. Knowing what they are and how to overcome them will help you maintain a vibrant prayer life.</p>

<h3>Obstacle 1: "I'm Too Busy"</h3>
<p><strong>Solution:</strong> You make time for what matters. If prayer is a priority, schedule it like any other important appointment. Start with just 10 minutes. Remember: you're never too busy for your most important relationship.</p>

<h3>Obstacle 2: "I Don't Know What to Say"</h3>
<p><strong>Solution:</strong> Use a framework (like ACTS), pray Scripture, or simply talk to God like you'd talk to a friend. He's not grading your eloquence—He wants your heart.</p>

<h3>Obstacle 3: "My Mind Wanders"</h3>
<p><strong>Solution:</strong> This is normal! When you notice your mind wandering, gently bring it back. Praying out loud or writing your prayers can help you stay focused. Don't beat yourself up—just refocus.</p>

<h3>Obstacle 4: "God Doesn't Seem to Answer"</h3>
<p><strong>Solution:</strong> God always answers, but not always the way we expect. Review past prayers—you may have missed His answers. Keep praying persistently (Luke 18:1-8). Trust His timing and His wisdom.</p>

<h3>Obstacle 5: "I Don't Feel Anything"</h3>
<p><strong>Solution:</strong> Prayer isn't about feelings—it's about faith. Feelings follow actions. Pray anyway, and trust that God hears you regardless of what you feel.</p>

<h3>Obstacle 6: "I Feel Unworthy"</h3>
<p><strong>Solution:</strong> You ARE unworthy—we all are! But Jesus made you worthy. You come to God not based on your performance, but based on Christ's finished work. Come boldly (Hebrews 4:16).</p>

<h3>Obstacle 7: "I Keep Forgetting"</h3>
<p><strong>Solution:</strong> Set reminders on your phone. Link prayer to existing habits (after brushing teeth, during commute). Keep your Bible and journal visible as reminders.</p>

<h3>The Enemy's Strategy</h3>
<p>Satan will do anything to keep you from praying because he knows prayer is powerful. When obstacles arise, recognize them as spiritual warfare and press through.</p>

<blockquote>"Be alert and of sober mind. Your enemy the devil prowls around like a roaring lion looking for someone to devour. Resist him, standing firm in the faith." — 1 Peter 5:8-9</blockquote>`
          }
        ])
        results.push('Added Prayer Foundations - Module 3: Building a Prayer Life')
      }

      // Update course stats
      await supabase
        .from('plant_courses')
        .update({ total_modules: 3, total_lessons: 10, estimated_hours: 6 })
        .eq('id', prayerCourse.id)

      results.push('Updated Prayer Foundations course stats')
    }

    return NextResponse.json({
      success: true,
      message: 'Courses populated with content',
      results
    })

  } catch (error: any) {
    console.error('Populate error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
