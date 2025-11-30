-- ============================================
-- AI TRAINING & KNOWLEDGE BASE
-- Allows admin to customize AI behavior
-- ============================================

-- ============================================
-- AI CONFIGURATION
-- Store AI personality, tone, and settings
-- ============================================
CREATE TABLE IF NOT EXISTS ai_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT,
  config_type VARCHAR(50) DEFAULT 'text', -- 'text', 'json', 'boolean', 'number'
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES members(id)
);

-- ============================================
-- AI KNOWLEDGE BASE
-- Custom knowledge the AI should reference
-- ============================================
CREATE TABLE IF NOT EXISTS ai_knowledge_base (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Categorization
  category VARCHAR(100) NOT NULL, -- 'faq', 'teaching', 'scripture', 'ministry_info', 'sermon', 'prophecy_principle', 'prayer_guide'
  title VARCHAR(255) NOT NULL,
  -- Content
  content TEXT NOT NULL,
  -- Scripture references
  scripture_references TEXT[],
  -- Tags for retrieval
  tags TEXT[],
  -- Priority (higher = more important)
  priority INTEGER DEFAULT 5,
  -- Status
  is_active BOOLEAN DEFAULT true,
  -- Metadata
  source VARCHAR(255), -- where this knowledge came from
  created_by UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_knowledge_category ON ai_knowledge_base(category);
CREATE INDEX idx_ai_knowledge_tags ON ai_knowledge_base USING GIN(tags);
CREATE INDEX idx_ai_knowledge_active ON ai_knowledge_base(is_active);

-- ============================================
-- AI RESPONSE FEEDBACK
-- Track quality of AI responses for improvement
-- ============================================
CREATE TABLE IF NOT EXISTS ai_response_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES ai_messages(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id),
  -- Feedback
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_type VARCHAR(50), -- 'helpful', 'not_helpful', 'incorrect', 'offensive', 'needs_improvement'
  feedback_text TEXT,
  -- Admin review
  admin_reviewed BOOLEAN DEFAULT false,
  admin_notes TEXT,
  reviewed_by UUID REFERENCES members(id),
  reviewed_at TIMESTAMPTZ,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AI CUSTOM RESPONSES
-- Pre-defined responses for specific topics
-- ============================================
CREATE TABLE IF NOT EXISTS ai_custom_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Trigger
  trigger_phrases TEXT[] NOT NULL, -- phrases that trigger this response
  trigger_type VARCHAR(50) DEFAULT 'contains', -- 'contains', 'exact', 'starts_with'
  -- Response
  response_template TEXT NOT NULL,
  -- Conditions
  member_tier VARCHAR(50), -- only trigger for specific tier (null = all)
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 5, -- higher priority responses checked first
  -- Metadata
  created_by UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INSERT DEFAULT CONFIG
-- ============================================
INSERT INTO ai_config (config_key, config_value, config_type, description) VALUES
('ai_name', 'Prophet Lorenzo', 'text', 'The name the AI uses to identify itself'),
('ai_title', 'Founder and Spiritual Leader of TPC Ministries', 'text', 'Title/role of the AI persona'),
('ai_personality', 'warm, compassionate, Spirit-led, prophetic yet grounded in Scripture, encouraging but challenging when needed', 'text', 'Core personality traits'),
('ai_communication_style', 'Uses terms like "beloved" and "my friend", shares Scripture naturally, offers to pray, asks thoughtful questions, speaks prophetically when appropriate', 'text', 'How the AI communicates'),
('ministry_name', 'TPC Ministries (The Prophetic Church)', 'text', 'Full ministry name'),
('ministry_mission', 'To raise up prophetic voices for the Kingdom', 'text', 'Ministry mission statement'),
('ministry_focus_areas', 'Prophetic development, hearing God''s voice, prayer and intercession, spiritual gifts discovery, personal transformation, Kingdom purpose, Biblical foundations', 'text', 'Key ministry focus areas'),
('ai_boundaries', 'Not a licensed counselor - for serious mental health concerns, encourage professional help. Don''t make specific date predictions. Always point to God''s Word. Be sensitive to crisis situations.', 'text', 'Things the AI should not do'),
('greeting_style', 'Warm and welcoming, uses the member''s first name, acknowledges their spiritual journey', 'text', 'How the AI greets members'),
('prayer_style', 'Sincere, specific to the situation, Scripture-based, declares God''s promises', 'text', 'How the AI prays'),
('prophetic_phrases', 'I sense the Lord saying..., The Spirit is leading me to share..., I believe God wants you to know...', 'text', 'Phrases used when speaking prophetically'),
('scripture_emphasis', 'Jeremiah 29:11, Romans 8:28, Isaiah 41:10, Philippians 4:13, Proverbs 3:5-6', 'text', 'Key scriptures to reference often')
ON CONFLICT (config_key) DO NOTHING;

-- ============================================
-- INSERT SAMPLE KNOWLEDGE BASE
-- ============================================
INSERT INTO ai_knowledge_base (category, title, content, scripture_references, tags, priority) VALUES
('ministry_info', 'About TPC Ministries', 'TPC Ministries (The Prophetic Church) was founded by Prophet Lorenzo to raise up prophetic voices for the Kingdom. We believe in the current-day operation of all spiritual gifts and the importance of hearing God''s voice for personal and corporate guidance.', ARRAY['1 Corinthians 12:1-11', 'Joel 2:28'], ARRAY['about', 'ministry', 'prophetic'], 10),

('teaching', 'How to Hear God''s Voice', 'God speaks to us in many ways: through Scripture (His primary voice), through the Holy Spirit''s still small voice, through godly counsel, through circumstances, through dreams and visions, and through prophetic words. The key is to cultivate a lifestyle of prayer and Scripture reading, and to test everything against God''s Word.', ARRAY['John 10:27', '1 Kings 19:12', 'Acts 2:17', '1 John 4:1'], ARRAY['hearing god', 'prophetic', 'spiritual growth'], 9),

('teaching', 'Understanding Spiritual Gifts', 'Every believer has been given spiritual gifts by the Holy Spirit for the edification of the church and the advancement of God''s Kingdom. The key gifts include: prophecy, teaching, wisdom, knowledge, faith, healing, miracles, discernment, tongues, and interpretation. Discover your gifts through prayer, assessment, and practice.', ARRAY['1 Corinthians 12:4-11', 'Romans 12:6-8', 'Ephesians 4:11-12'], ARRAY['spiritual gifts', 'gifts', 'holy spirit'], 9),

('prayer_guide', 'How to Pray Effectively', 'Effective prayer involves: 1) Coming with a clean heart (confess sin first), 2) Praying according to God''s will (align with Scripture), 3) Praying in faith (believe God hears), 4) Being specific in requests, 5) Listening for God''s response, 6) Persisting until breakthrough, 7) Giving thanks always.', ARRAY['Matthew 6:9-13', 'James 5:16', '1 John 5:14-15', 'Philippians 4:6'], ARRAY['prayer', 'how to pray', 'effective prayer'], 9),

('prophecy_principle', 'Testing Prophetic Words', 'All prophetic words should be tested: 1) Does it align with Scripture? 2) Does it bear witness with your spirit? 3) Does it glorify God? 4) Does it produce peace? 5) Do mature believers confirm it? 6) Does it build up, encourage, and comfort? Never act hastily on a prophetic word - allow time for confirmation.', ARRAY['1 Thessalonians 5:20-21', '1 John 4:1', '1 Corinthians 14:29', '1 Corinthians 14:3'], ARRAY['prophecy', 'testing', 'prophetic words'], 9),

('faq', 'What is the PLANT Program?', 'PLANT stands for Purpose, Learn, Activate, Nurture, Thrive. It''s our comprehensive discipleship and learning platform designed to help believers grow in their faith, discover their gifts, and fulfill their God-given purpose. The program includes courses, assessments, mentorship, and practical application.', ARRAY['2 Timothy 2:15', 'Hebrews 5:12-14'], ARRAY['plant', 'learning', 'discipleship', 'courses'], 8),

('faq', 'Membership Tiers Explained', 'TPC offers three membership levels: FREE (access to basic content and community), PARTNER (monthly giving supporters with access to premium content and personal prophecies), and COVENANT (highest level with direct access to Prophet Lorenzo, exclusive teachings, and priority for ministry events).', NULL, ARRAY['membership', 'tiers', 'partner', 'covenant', 'pricing'], 8),

('teaching', 'Walking in Your Purpose', 'God has a specific purpose for your life. To discover it: 1) Seek God in prayer and fasting, 2) Study Scripture for principles, 3) Identify your passions and gifts, 4) Listen for prophetic confirmation, 5) Start where you are with what you have, 6) Be faithful in small things, 7) Trust God''s timing.', ARRAY['Jeremiah 29:11', 'Ephesians 2:10', 'Proverbs 19:21', 'Romans 8:28'], ARRAY['purpose', 'calling', 'destiny'], 8),

('scripture', 'Scriptures for Difficult Seasons', 'When facing trials, remember: "The Lord is close to the brokenhearted" (Psalm 34:18), "My grace is sufficient for you" (2 Corinthians 12:9), "I will never leave you nor forsake you" (Hebrews 13:5), "All things work together for good" (Romans 8:28), "This too shall pass" (2 Corinthians 4:17-18).', ARRAY['Psalm 34:18', '2 Corinthians 12:9', 'Hebrews 13:5', 'Romans 8:28', '2 Corinthians 4:17-18'], ARRAY['trials', 'difficulty', 'comfort', 'encouragement'], 9)
ON CONFLICT DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE ai_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_response_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_custom_responses ENABLE ROW LEVEL SECURITY;

-- Admins can manage all AI config
CREATE POLICY "Admins can manage AI config" ON ai_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM members WHERE user_id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can manage knowledge base" ON ai_knowledge_base
  FOR ALL USING (
    EXISTS (SELECT 1 FROM members WHERE user_id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can manage custom responses" ON ai_custom_responses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM members WHERE user_id = auth.uid() AND is_admin = true)
  );

-- Members can submit feedback
CREATE POLICY "Members can submit feedback" ON ai_response_feedback
  FOR INSERT WITH CHECK (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view all feedback" ON ai_response_feedback
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM members WHERE user_id = auth.uid() AND is_admin = true)
  );
