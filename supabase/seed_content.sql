-- ============================================
-- TPC MINISTRIES CONTENT SEED
-- Run this in Supabase SQL Editor
-- Project: tpc-ministries-platform (naulwwnzrznslvhhxfed)
-- ============================================

-- ============================================
-- TEACHINGS
-- ============================================

INSERT INTO teachings (title, description, author, content_type, is_published, is_featured, view_count, published_at)
VALUES

-- Teaching 1
('Finding Your Voice in This Season',
'So many believers are sitting on the sidelines waiting for permission to step into what God has already called them to do. In this message, Prophet Lorenzo breaks down why your voice matters and how to start using it right where you are.',
'Prophet Lorenzo Daughtry-Chambers',
'video',
true,
true,
47,
NOW() - INTERVAL '2 days'),

-- Teaching 2
('The Process Before the Promise',
'We love the promise but we hate the process. Yet God uses every season of preparation to shape us for what He has ahead. This teaching will encourage you if you feel stuck between where you are and where God said you would be.',
'Prophet Lorenzo Daughtry-Chambers',
'video',
true,
true,
89,
NOW() - INTERVAL '9 days'),

-- Teaching 3
('Breaking the Cycle of Fear',
'Fear keeps us small. It keeps us silent. It keeps us from stepping into rooms God has already opened. Prophetess Sarah shares practical keys to breaking free from fear patterns that have held you back.',
'Prophetess Sarah Daughtry-Chambers',
'video',
true,
false,
112,
NOW() - INTERVAL '16 days'),

-- Teaching 4
('Prayer That Shifts Atmospheres',
'There is a difference between religious prayer and the kind of prayer that changes things. Learn how to pray with authority and see breakthrough in your home, your workplace, and your city.',
'Prophet Lorenzo Daughtry-Chambers',
'video',
true,
true,
156,
NOW() - INTERVAL '23 days'),

-- Teaching 5
('Discerning the Times and Seasons',
'Not every opportunity is a God opportunity. Not every open door is the right door. This message will help you recognize what season you are in and how to move accordingly.',
'Prophet Lorenzo Daughtry-Chambers',
'video',
true,
false,
78,
NOW() - INTERVAL '30 days'),

-- Teaching 6
('Healing the Father Wound',
'Many of us carry pain from absent, distant, or hurtful fathers. This wound affects how we see God and how we see ourselves. Prophetess Sarah shares a word of healing for those ready to be made whole.',
'Prophetess Sarah Daughtry-Chambers',
'video',
true,
true,
203,
NOW() - INTERVAL '37 days'),

-- Teaching 7
('Understanding Your Prophetic Gift',
'God speaks to His people. But how do you know if what you are hearing is from Him? This teaching covers the basics of hearing God and stewarding the prophetic gift He has placed in you.',
'Prophet Lorenzo Daughtry-Chambers',
'video',
true,
false,
134,
NOW() - INTERVAL '44 days'),

-- Teaching 8
('When God Says Wait',
'Waiting is not wasted time. In seasons of waiting, God is doing some of His deepest work. If you are in a holding pattern and wondering if God has forgotten you, this message is for you.',
'Prophetess Sarah Daughtry-Chambers',
'video',
true,
false,
167,
NOW() - INTERVAL '51 days'),

-- Teaching 9
('Building Your House on the Rock',
'Everyone is building something with their life. The question is whether it will stand when the storms come. Jesus gave us the blueprint. This message unpacks what it means to build on solid ground.',
'Prophet Lorenzo Daughtry-Chambers',
'video',
true,
false,
92,
NOW() - INTERVAL '58 days'),

-- Teaching 10
('The Power of Covenant Partnership',
'God designed us for connection. When we partner together in vision and purpose, something shifts in the spiritual realm. Learn why isolation is the enemy and covenant is the answer.',
'Prophet Lorenzo Daughtry-Chambers',
'video',
true,
false,
45,
NOW() - INTERVAL '65 days')

ON CONFLICT DO NOTHING;

-- ============================================
-- EVENTS
-- ============================================

INSERT INTO events (title, description, event_type, start_date, end_date, location, is_virtual, virtual_link, capacity, is_published, price, tier_access)
VALUES

-- Event 1: Monthly Prayer Call
('Monthly Intercessory Prayer Call',
'Join us for our monthly prayer gathering where we come together to pray for our families, communities, and nations. All are welcome. Come with expectation.',
'service',
(DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '14 days' + INTERVAL '19 hours')::timestamptz,
(DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '14 days' + INTERVAL '21 hours')::timestamptz,
NULL,
true,
'https://zoom.us/j/tpcministries',
NULL,
true,
0,
ARRAY['free', 'partner', 'covenant']::VARCHAR[]),

-- Event 2: Purpose Accelerator Workshop
('Purpose Accelerator Workshop',
'A 3-hour intensive workshop designed to help you get clarity on your calling and create an action plan for the next 90 days. Bring a notebook and come ready to work.',
'workshop',
(CURRENT_DATE + INTERVAL '21 days' + INTERVAL '10 hours')::timestamptz,
(CURRENT_DATE + INTERVAL '21 days' + INTERVAL '13 hours')::timestamptz,
NULL,
true,
'https://zoom.us/j/tpcministries',
50,
true,
0,
ARRAY['partner', 'covenant']::VARCHAR[]),

-- Event 3: Prophetic Encounter Night
('Prophetic Encounter Night',
'An evening of worship, prophetic ministry, and personal prayer. Come expecting to hear from God. Personal prophetic ministry will be available.',
'service',
(CURRENT_DATE + INTERVAL '35 days' + INTERVAL '18 hours')::timestamptz,
(CURRENT_DATE + INTERVAL '35 days' + INTERVAL '21 hours')::timestamptz,
'TPC Ministries Center',
false,
'https://youtube.com/live/tpcministries',
100,
true,
0,
ARRAY['free', 'partner', 'covenant']::VARCHAR[]),

-- Event 4: Kingdom Leadership Summit
('Kingdom Leadership Summit 2025',
'Our annual gathering for leaders and emerging leaders. Two days of teaching, networking, and commissioning. Early registration is now open.',
'conference',
(DATE '2025-03-14' + INTERVAL '9 hours')::timestamptz,
(DATE '2025-03-15' + INTERVAL '17 hours')::timestamptz,
'Grenada Conference Center',
false,
NULL,
200,
true,
0,
ARRAY['partner', 'covenant']::VARCHAR[]),

-- Event 5: New Member Orientation
('New Member Welcome Session',
'New to TPC Ministries? Join us for a casual orientation where you can learn more about our vision, meet the team, and find your place in the community.',
'workshop',
(CURRENT_DATE + INTERVAL '10 days' + INTERVAL '12 hours')::timestamptz,
(CURRENT_DATE + INTERVAL '10 days' + INTERVAL '13 hours')::timestamptz,
NULL,
true,
'https://zoom.us/j/tpcministries',
30,
true,
0,
ARRAY['free', 'partner', 'covenant']::VARCHAR[])

ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Content seeded successfully!' as status;
SELECT 'Teachings: ' || COUNT(*) as count FROM teachings;
SELECT 'Events: ' || COUNT(*) as count FROM events;
