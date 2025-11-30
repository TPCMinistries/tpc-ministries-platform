-- ============================================
-- SAMPLE DEVOTIONAL DATA
-- Run this in Supabase SQL Editor
-- ============================================

-- Insert 14 days of devotionals
INSERT INTO devotionals (date, title, scripture_reference, scripture_text, content, prayer, reflection_questions, author, series)
VALUES
-- Day 1 - Today
(CURRENT_DATE,
 'Walking in Divine Purpose',
 'Jeremiah 29:11',
 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.',
 'Every morning you wake up is an invitation from God to step into your divine purpose. He didn''t create you by accident – you are fearfully and wonderfully made, designed with intention and crafted for a specific assignment in this generation.

Many believers struggle with purpose because they''re looking for something grand and dramatic. But purpose often unfolds in the ordinary moments – in the kind word you speak, the excellence you bring to your work, the love you show your family.

The prophet Jeremiah reminds us that God''s plans are already established. He''s not figuring it out as He goes. Your future is secure in His hands. The question isn''t whether God has a plan – it''s whether you''ll trust Him enough to walk in it.

Today, release the anxiety of trying to figure everything out. Instead, take one faithful step forward. Purpose isn''t revealed all at once; it unfolds as you walk in obedience.',
 'Father, thank You for having plans for my life that are good and full of hope. Help me to trust Your timing and Your process. Open my eyes to see the purpose in my everyday moments. Give me courage to step out in faith, even when I can''t see the full picture. In Jesus'' name, Amen.',
 '["What is one area of your life where you sense God calling you to step out in faith?", "How does knowing God has a plan affect the way you approach uncertainty?", "What ordinary moment today could be an opportunity to walk in purpose?"]',
 'TPC Ministries',
 'Streams of Grace'),

-- Day 2
(CURRENT_DATE + 1,
 'The Power of Renewed Thinking',
 'Romans 12:2',
 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind. Then you will be able to test and approve what God''s will is—his good, pleasing and perfect will.',
 'Your mind is the battlefield where your destiny is won or lost. What you think about determines the direction of your life. This is why Paul urges us not to be conformed to the world''s patterns but to be transformed by renewing our minds.

Renewal isn''t a one-time event – it''s a daily discipline. Every morning, you have a choice: will you feed your mind with worry, fear, and negativity? Or will you intentionally fill it with God''s Word and His promises?

The world constantly tries to shape our thinking through media, culture, and circumstances. But God offers us a different way – transformation from the inside out. When your mind is renewed, you begin to see situations differently. Problems become opportunities. Setbacks become setups.

The result of a renewed mind? You''ll be able to discern God''s will clearly. You won''t have to guess or wonder – you''ll know because your thinking aligns with His.',
 'Lord, I surrender my thought life to You today. Help me to take every thought captive and make it obedient to Christ. Renew my mind with Your truth. Replace my anxious thoughts with Your peace, my doubts with Your promises, and my fears with Your faith. Transform me from the inside out. Amen.',
 '["What thought patterns do you need God to transform?", "How can you practically renew your mind daily?", "What lies have you believed that contradict God''s Word?"]',
 'TPC Ministries',
 'Streams of Grace'),

-- Day 3
(CURRENT_DATE + 2,
 'Strength in Weakness',
 '2 Corinthians 12:9-10',
 'But he said to me, "My grace is sufficient for you, for my power is made perfect in weakness." Therefore I will boast all the more gladly about my weaknesses, so that Christ''s power may rest on me.',
 'We live in a culture that celebrates strength and hides weakness. Social media shows highlight reels, not struggles. But God''s economy works differently – His power is perfected in our weakness.

Paul had a "thorn in the flesh" – something that caused him ongoing difficulty. He pleaded with God three times to remove it. Instead of removing it, God gave Paul something better: sufficient grace. The thorn remained, but so did God''s power.

Your weakness isn''t a disqualification from God''s purpose – it''s often the very thing He uses. When you''re weak, you''re more dependent on Him. When you can''t do it in your own strength, His strength shines through.

Stop hiding your struggles and start surrendering them. Acknowledge your need for God. In that place of honest vulnerability, you''ll find His grace is more than enough.',
 'Father, I confess I often try to appear strong when I''m actually struggling. Today I bring my weaknesses to You – not to be ashamed, but to experience Your sufficient grace. Let Your power rest on me. Use even my limitations for Your glory. I choose to depend on You completely. Amen.',
 '["What weakness have you been trying to hide from God and others?", "How might God want to use your weakness to display His power?", "Where do you need to experience God''s sufficient grace today?"]',
 'TPC Ministries',
 'Streams of Grace'),

-- Day 4
(CURRENT_DATE + 3,
 'Rooted in Love',
 'Ephesians 3:17-19',
 'So that Christ may dwell in your hearts through faith. And I pray that you, being rooted and established in love, may have power, together with all the Lord''s holy people, to grasp how wide and long and high and deep is the love of Christ.',
 'Trees that weather the fiercest storms are those with the deepest roots. Paul prays that we would be "rooted and established in love" – that our foundation would be so secure in God''s love that nothing could shake us.

Many believers know about God''s love intellectually but haven''t experienced it deeply. They still live from a place of striving, trying to earn what''s already been freely given. But when you''re truly rooted in love, everything changes.

You stop performing for approval because you already have it. You stop fearing rejection because you know you''re accepted. You stop running from God when you fail because you understand His love isn''t based on your performance.

Paul says we need "power to grasp" how vast God''s love is. It''s so immense that we can''t comprehend it naturally – we need the Holy Spirit''s help. Today, ask Him to reveal more of the Father''s love to you.',
 'Father, I want to know Your love – not just as a concept but as a living reality. Root me deeply in Your unconditional acceptance. Help me grasp the width, length, height, and depth of Christ''s love. Set me free from striving and help me rest in Your perfect love. Amen.',
 '["Do you tend to strive for God''s approval or rest in His love?", "What would change in your life if you fully believed you were loved unconditionally?", "How does insecurity about God''s love affect your daily decisions?"]',
 'TPC Ministries',
 'Streams of Grace'),

-- Day 5
(CURRENT_DATE + 4,
 'The Gift of Today',
 'Psalm 118:24',
 'This is the day the Lord has made; let us rejoice and be glad in it.',
 'Yesterday is gone. Tomorrow isn''t promised. But today – this very day – is a gift from God. The psalmist doesn''t say "This is the day I made" or "This is the day circumstances created." This is the day the LORD has made.

That means today, with all its challenges and opportunities, isn''t random. God has sovereignly ordained this day for you. The people you''ll encounter, the situations you''ll face, the decisions you''ll make – He''s already gone before you.

So often we rush through today while worrying about tomorrow or regretting yesterday. We miss the present moment because we''re mentally somewhere else. But joy is found in the present tense, not the past or future.

The command is clear: rejoice and be glad. Not because everything is perfect, but because the Lord has made this day. It''s His gift to you. How will you unwrap it?',
 'Lord, thank You for this day – a day You''ve crafted with intention. Forgive me for the times I''ve taken Your gift for granted. Help me to be fully present today, not anxious about tomorrow or stuck in yesterday. I choose to rejoice because You are with me. This is the day You''ve made – I will be glad in it! Amen.',
 '["What keeps you from being fully present in each day?", "How can you practice gratitude for today specifically?", "What moment from today can you pause and thank God for?"]',
 'TPC Ministries',
 'Streams of Grace'),

-- Day 6
(CURRENT_DATE + 5,
 'Guarded by Peace',
 'Philippians 4:6-7',
 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.',
 'Anxiety is the enemy of peace, and it seems to be everywhere today. We worry about finances, health, relationships, the future. Our minds race with "what ifs" and worst-case scenarios. Paul offers a powerful antidote: prayer with thanksgiving.

Notice the process: Don''t be anxious → Pray with thanksgiving → Receive peace. It''s not complicated, but it requires intentionality. When anxiety knocks, we must choose to pray instead of worry.

The peace God gives "transcends all understanding." It doesn''t make logical sense. Your circumstances might still be uncertain, but your heart can be at rest. This peace acts as a guard, protecting your heart and mind from the assault of anxiety.

The key often missed is thanksgiving. When we pray with gratitude, we''re reminded of God''s faithfulness. We remember past deliverances. Our perspective shifts from the problem to the Problem-Solver.',
 'Father, I bring my anxieties to You today. I choose not to carry them myself. Thank You for Your faithfulness in the past – You''ve never failed me. I present my requests to You with a grateful heart. Guard my mind with Your supernatural peace. Help me trust You with what I cannot control. Amen.',
 '["What situation is causing you anxiety right now?", "How can you practice prayer with thanksgiving in that situation?", "What past faithfulness of God can you remember to build your faith?"]',
 'TPC Ministries',
 'Streams of Grace'),

-- Day 7
(CURRENT_DATE + 6,
 'Fearfully and Wonderfully Made',
 'Psalm 139:14',
 'I praise you because I am fearfully and wonderfully made; your works are wonderful, I know that full well.',
 'In a world of filters and comparisons, it''s easy to forget a fundamental truth: you are God''s masterpiece. David declares that we are "fearfully and wonderfully made" – created with reverent care and astounding complexity.

Think about it: the same God who spoke galaxies into existence carefully knit you together. He chose your personality, your gifts, your physical features. Nothing about you is accidental or inferior.

Yet so many believers struggle with self-acceptance. We focus on what we lack rather than what we''ve been given. We compare our behind-the-scenes to everyone else''s highlight reel. This grieves the heart of God.

When you reject yourself, you''re essentially saying God made a mistake. But His works are wonderful – and that includes you. Today, practice agreeing with what God says about you instead of what insecurity whispers.',
 'Creator God, thank You for making me exactly as I am. Forgive me for the times I''ve rejected Your design or wished I was someone else. Help me see myself through Your eyes – as fearfully and wonderfully made. I choose to praise You for how You''ve created me. Give me confidence in my identity as Your beloved child. Amen.',
 '["What aspect of yourself do you struggle to accept?", "How does comparison rob you of gratitude for how God made you?", "What would change if you truly believed you were wonderfully made?"]',
 'TPC Ministries',
 'Streams of Grace'),

-- Day 8
(CURRENT_DATE + 7,
 'The Shepherd''s Care',
 'Psalm 23:1-3',
 'The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.',
 'In ancient times, a shepherd was responsible for everything: provision, protection, guidance, and care. When David declares "The Lord is my shepherd," he''s making a comprehensive statement of trust.

Notice what the shepherd provides: green pastures (nourishment), quiet waters (peace), and soul refreshment (restoration). God isn''t a harsh taskmaster driving you forward – He''s a caring shepherd who knows you need rest.

"He makes me lie down" suggests that sometimes God has to force us to rest. We''re so driven and busy that we ignore our own depletion. But the Good Shepherd knows burnout isn''t noble – it''s a sign we''ve stopped trusting His provision.

Where are you depleted today? Where do you need God to lead you beside quiet waters? He''s not impressed by your hustle. He wants to refresh your soul.',
 'Lord, You are my shepherd – I trust You to provide everything I need. Lead me to places of rest and refreshment. Forgive me for running past the quiet waters You''ve prepared. Teach me to receive Your care without guilt. Refresh my weary soul today. In Jesus'' name, Amen.',
 '["Are you allowing God to lead you to rest, or are you constantly running?", "What area of your life feels depleted and needs refreshment?", "How can you practically receive the Shepherd''s care today?"]',
 'TPC Ministries',
 'Streams of Grace'),

-- Day 9
(CURRENT_DATE + 8,
 'Faith Over Fear',
 'Isaiah 41:10',
 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.',
 'Fear is one of the most repeated topics in Scripture because God knows how easily we succumb to it. Over 365 times, the Bible says "fear not" – one for every day of the year. God isn''t surprised by our fears; He addresses them head-on.

Isaiah 41:10 gives us four powerful reasons not to fear: God is WITH us, He IS our God, He WILL strengthen us, and He WILL uphold us. Fear focuses on the problem; faith focuses on God''s presence and promises.

The command is clear: "Do not fear." But it''s followed immediately by "for I am with you." This isn''t positive thinking or denial of reality – it''s a shift in focus. Yes, the challenge is real, but God''s presence is more real.

Whatever you''re facing today, you''re not facing it alone. The Creator of the universe is with you. His strength is available. His hand upholds you. Fear may knock, but faith can answer.',
 'Father, I confess my fears to You today. I know they don''t come from You. Help me fix my eyes on Your presence rather than my problems. Thank You for being with me – I am never alone. Strengthen me with Your power and uphold me with Your righteous hand. I choose faith over fear. Amen.',
 '["What fear has been dominating your thoughts lately?", "How does remembering God''s presence change your perspective on that fear?", "What promise from this verse can you hold onto today?"]',
 'TPC Ministries',
 'Streams of Grace'),

-- Day 10
(CURRENT_DATE + 9,
 'Rivers in the Desert',
 'Isaiah 43:19',
 'See, I am doing a new thing! Now it springs up; do you not perceive it? I am making a way in the wilderness and streams in the wasteland.',
 'When you''re in a wilderness season, it''s hard to imagine anything new could come from it. The landscape of your life feels barren. Hope seems distant. But God specializes in bringing rivers through deserts.

"See, I am doing a new thing!" God announces. He''s not stuck in the past, even if we are. He''s not limited by what has been – He''s the God of what can be. While we''re mourning what we''ve lost, He''s already preparing what''s next.

The question God asks is revealing: "Do you not perceive it?" Sometimes we miss what God is doing because we''re looking backward or because we''ve defined what "new" should look like. We need spiritual eyes to see His work.

Your wilderness isn''t the end of your story. God is making a way where there seems to be no way. Streams are forming in places that look dry. Stay alert – your new thing is springing up.',
 'Lord of new beginnings, open my eyes to see what You''re doing. I''ve been focused on the wilderness, but You''re focused on the rivers. Help me perceive the new thing You''re bringing forth. Give me hope in this season. I trust You to make a way where there seems to be no way. Amen.',
 '["What ''wilderness'' season are you currently in or recently came through?", "What new thing might God be doing that you haven''t perceived yet?", "How has God brought streams in your wasteland before?"]',
 'TPC Ministries',
 'Streams of Grace'),

-- Day 11
(CURRENT_DATE + 10,
 'Childlike Trust',
 'Proverbs 3:5-6',
 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
 'Children trust naturally. They don''t analyze every step before jumping into a parent''s arms. They don''t demand explanations before obeying. They simply trust. Jesus said we must become like children to enter the Kingdom – and trust is a big part of why.

Solomon calls us to trust "with all your heart" – not partial trust, not backup-plan trust, but complete trust. And here''s the challenge: we must do this while NOT leaning on our own understanding.

This is where most of us struggle. We want to understand before we trust. We want the full picture before we take a step. But God often asks us to trust first and understand later (if at all).

The promise is beautiful: "He will make your paths straight." Not that the path will be easy or that we''ll never be confused, but that God will direct us. He''ll get us where we need to go. Our job isn''t to figure it out – it''s to trust and submit.',
 'Father, I confess that I often try to figure things out before trusting You. Forgive my need for control. Today I choose to trust You with all my heart, even what I don''t understand. I submit my ways to You – my plans, my decisions, my future. Lead me on straight paths. Amen.',
 '["What situation are you trying to understand instead of simply trusting God with?", "How does ''leaning on your own understanding'' show up in your life?", "What would complete trust look like for you right now?"]',
 'TPC Ministries',
 'Streams of Grace'),

-- Day 12
(CURRENT_DATE + 11,
 'Unstoppable Love',
 'Romans 8:38-39',
 'For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers, neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God that is in Christ Jesus our Lord.',
 'Paul doesn''t just believe this truth – he''s convinced of it. He lists every possible threat to our security and declares that NONE of them can separate us from God''s love. This is the most secure position in the universe.

Think about what''s on the list: death, life, angels, demons, present circumstances, future unknowns, powers, height, depth, and "anything else in all creation." Paul covers every category of potential separation and dismisses each one.

Many believers live in fear that they''ll somehow disqualify themselves from God''s love. They think their failures or doubts might push God away. But this passage makes clear: nothing in all creation can separate you from His love.

This doesn''t mean there are no consequences for our choices or that everything is permissible. It means that God''s love is unconditional and permanent. You can''t earn it, and you can''t lose it. Rest in that today.',
 'Father, thank You that Your love for me is unstoppable. I am convinced that nothing can separate me from Your love in Christ Jesus. Help this truth move from my head to my heart. Quiet the voices that tell me I''m disqualified or unloved. Let Your perfect love cast out my fear. Amen.',
 '["What have you feared might separate you from God''s love?", "How does knowing God''s love is unconditional change how you approach Him?", "Who in your life needs to hear this message of unstoppable love?"]',
 'TPC Ministries',
 'Streams of Grace'),

-- Day 13
(CURRENT_DATE + 12,
 'The Discipline of Waiting',
 'Psalm 27:14',
 'Wait for the Lord; be strong and take heart and wait for the Lord.',
 'Waiting is one of the hardest spiritual disciplines. We live in an instant culture – instant messaging, instant downloads, instant gratification. But God operates on a different timeline, and His delays are not His denials.

David says "wait for the Lord" twice in one verse. The repetition is intentional. Waiting isn''t passive resignation – it''s active trust. Notice what accompanies waiting: being strong and taking heart. Waiting requires courage and endurance.

Why does God make us wait? Sometimes He''s preparing us. Sometimes He''s preparing the circumstances. Sometimes waiting is the very process that produces what we need. The fruit that grows quickly is often not the sweetest.

Whatever you''re waiting for – a breakthrough, an answer, a change – don''t give up. The Lord is worth waiting for. His timing is perfect even when it doesn''t feel like it.',
 'Lord, I confess that waiting is hard for me. I want answers now and changes immediately. But I choose to wait for You, trusting that Your timing is perfect. Strengthen my heart in this season of waiting. Help me grow in patience and trust. I believe You''re working even when I can''t see it. Amen.',
 '["What are you waiting on God for right now?", "How does impatience show up in your spiritual life?", "What might God be developing in you through this waiting season?"]',
 'TPC Ministries',
 'Streams of Grace'),

-- Day 14
(CURRENT_DATE + 13,
 'Living Sacrifices',
 'Romans 12:1',
 'Therefore, I urge you, brothers and sisters, in view of God''s mercy, to offer your bodies as a living sacrifice, holy and pleasing to God—this is your true and proper worship.',
 'In the Old Testament, sacrifices were offered dead. But Paul calls us to be living sacrifices – fully alive, fully surrendered, fully available to God. This is the appropriate response to God''s mercy.

The problem with living sacrifices? They keep crawling off the altar. Every day we must choose surrender again. Every morning we must lay ourselves down afresh. It''s not a one-time decision but a daily discipline.

This surrender isn''t joyless duty – it''s our "true and proper worship." We often think of worship as singing songs, but real worship is a surrendered life. It''s saying "Not my will, but Yours" in every area: career, relationships, finances, future.

What area of your life are you holding back from God? What''s still on your own altar instead of His? Today is a new opportunity to offer yourself fully – a living sacrifice, holy and pleasing.',
 'Father, in view of all Your mercy toward me, I offer myself to You today – body, mind, and spirit. I surrender my plans, my preferences, my rights. Use me as You see fit. This is my worship, not just songs I sing but a life laid down. Have Your way in me completely. Amen.',
 '["What area of your life have you been reluctant to surrender to God?", "How does viewing surrender as worship change your perspective?", "What does being a ''living sacrifice'' look like practically in your daily life?"]',
 'TPC Ministries',
 'Streams of Grace')

ON CONFLICT (date) DO UPDATE SET
  title = EXCLUDED.title,
  scripture_reference = EXCLUDED.scripture_reference,
  scripture_text = EXCLUDED.scripture_text,
  content = EXCLUDED.content,
  prayer = EXCLUDED.prayer,
  reflection_questions = EXCLUDED.reflection_questions,
  author = EXCLUDED.author,
  series = EXCLUDED.series,
  updated_at = NOW();

-- Confirm success
SELECT 'Devotional data seeded successfully! ' || COUNT(*) || ' devotionals available.' as status
FROM devotionals;
