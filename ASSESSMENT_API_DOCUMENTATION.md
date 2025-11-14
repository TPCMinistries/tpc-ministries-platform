# Assessment System API Documentation

Complete API documentation for the TPC Ministries Assessment System.

## Table of Contents
- [Public Routes](#public-routes)
- [Member Routes](#member-routes)
- [Admin Routes](#admin-routes)
- [Scoring Algorithms](#scoring-algorithms)
- [Database Schema](#database-schema)

---

## Public Routes

### 1. List All Assessments
**GET** `/api/assessments/list`

Returns all active assessments.

**Response:**
```json
{
  "success": true,
  "assessments": [
    {
      "id": "uuid",
      "name": "Spiritual Gifts Assessment",
      "slug": "spiritual-gifts",
      "description": "Discover your God-given abilities...",
      "category": "Gifts & Calling",
      "question_count": 20,
      "estimated_minutes": 15,
      "biblical_foundation": "Romans 12:6-8...",
      "total_completions": 2847
    }
  ]
}
```

---

### 2. Get Assessment Questions
**GET** `/api/assessments/[id]/questions`

Returns questions for a specific assessment.

**Parameters:**
- `id` (path): Assessment UUID

**Response:**
```json
{
  "success": true,
  "assessment": {
    "id": "uuid",
    "name": "Spiritual Gifts Assessment",
    "slug": "spiritual-gifts"
  },
  "questions": [
    {
      "id": "uuid",
      "question_text": "I enjoy organizing people...",
      "question_type": "scale",
      "options_json": null,
      "scoring_category": "administration",
      "order_number": 1
    }
  ]
}
```

**Question Types:**
- `scale` - Likert scale (1-5)
- `multiple_choice` - Single selection
- `ranking` - Order by preference
- `select_all` - Multiple selections

---

### 3. Submit Anonymous Assessment
**POST** `/api/assessments/submit-anonymous`

Submits assessment responses from non-logged-in users.

**Request Body:**
```json
{
  "assessment_id": "uuid",
  "email": "user@example.com",
  "responses_json": {
    "1": 5,
    "2": 4,
    "3": 5
  },
  "ip_address": "192.168.1.1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Assessment submitted successfully",
  "response_id": "uuid",
  "results": {
    "type": "spiritual-gifts",
    "giftScores": {
      "teaching": { "score": 24, "percentage": 96 },
      "exhortation": { "score": 22, "percentage": 88 }
    },
    "topResults": [
      {
        "gift": "teaching",
        "score": 24,
        "percentage": 96
      }
    ],
    "calculatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## Member Routes

### 4. Submit Member Assessment
**POST** `/api/assessments/submit-member`

Submits assessment responses from authenticated members with retake tracking.

**Authentication:** Required

**Request Body:**
```json
{
  "assessment_id": "uuid",
  "member_id": "uuid",
  "responses_json": {
    "1": 5,
    "2": 4
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Assessment submitted successfully",
  "result_id": "uuid",
  "results": { /* full results object */ },
  "retake_number": 2,
  "is_retake": true,
  "comparison": {
    "assessmentType": "spiritual-gifts",
    "hasChanges": true,
    "improvements": ["Teaching increased by 4%"],
    "declines": [],
    "summary": "Your Teaching gift has strengthened"
  },
  "previous_results": {
    "completed_at": "2023-06-20T10:30:00Z",
    "retake_number": 1
  }
}
```

---

### 5. Get Member Assessment History
**GET** `/api/assessments/member-history`

Returns all assessments completed by the authenticated member.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "member": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "summary": {
    "total_assessments_taken": 3,
    "total_completions": 6,
    "most_recent_completion": "2024-01-15T10:30:00Z"
  },
  "assessment_history": [
    {
      "assessment": {
        "id": "uuid",
        "name": "Spiritual Gifts Assessment",
        "slug": "spiritual-gifts",
        "category": "Gifts & Calling"
      },
      "times_completed": 2,
      "last_taken": "2024-01-15T10:30:00Z",
      "results": [
        {
          "id": "uuid",
          "completed_at": "2024-01-15T10:30:00Z",
          "retake_number": 2,
          "results_json": { /* results */ }
        },
        {
          "id": "uuid",
          "completed_at": "2023-06-20T10:30:00Z",
          "retake_number": 1,
          "results_json": { /* results */ }
        }
      ]
    }
  ]
}
```

---

### 6. Save Assessment Progress
**POST** `/api/assessments/save-progress`

Saves in-progress assessment for authenticated members.

**Authentication:** Required

**Request Body:**
```json
{
  "assessment_id": "uuid",
  "responses_json": {
    "1": 5,
    "2": 4
  },
  "current_question": 3
}
```

**Response:**
```json
{
  "success": true,
  "message": "Progress saved successfully",
  "current_question": 3,
  "saved_at": "2024-01-15T10:30:00Z"
}
```

**GET** `/api/assessments/save-progress?assessment_id=uuid`

Retrieves saved progress.

**DELETE** `/api/assessments/save-progress?assessment_id=uuid`

Clears saved progress.

---

## Admin Routes

### 7. Get Assessment Analytics
**GET** `/api/assessments/admin/analytics`

Returns comprehensive analytics for all assessments.

**Authentication:** Required (Admin role)

**Query Parameters:**
- `assessment_id` (optional): Filter by specific assessment
- `time_range` (optional): Days to look back (default: 30)

**Response:**
```json
{
  "success": true,
  "time_range": {
    "days": 30,
    "start_date": "2023-12-16T10:30:00Z",
    "end_date": "2024-01-15T10:30:00Z"
  },
  "overall_stats": {
    "total_assessments": 6,
    "total_completions_in_range": 450,
    "total_anonymous": 300,
    "total_member": 150,
    "total_conversions": 102,
    "overall_conversion_rate": 34,
    "unique_members": 120,
    "total_retakes": 30,
    "time_range_days": 30
  },
  "conversion_funnel": {
    "started_assessments": 450,
    "provided_email": 219,
    "email_capture_rate": 73,
    "completed_assessments": 450,
    "created_account": 102,
    "conversion_rate": 34
  },
  "assessment_analytics": [
    {
      "assessment_id": "uuid",
      "assessment_name": "Spiritual Gifts Assessment",
      "assessment_slug": "spiritual-gifts",
      "question_count": 20,
      "estimated_minutes": 15,
      "total_completions": 2847,
      "completions_in_range": 147,
      "anonymous_completions": 98,
      "member_completions": 49,
      "conversion_count": 32,
      "conversion_rate": 32.7,
      "unique_members": 40,
      "retakes": 9,
      "retake_rate": 22.5,
      "emails_captured": 72,
      "email_capture_rate": 73.5,
      "avg_completion_time": "15 min"
    }
  ]
}
```

---

### 8. Create New Assessment
**POST** `/api/assessments/admin/create`

Creates a new assessment.

**Authentication:** Required (Admin role)

**Request Body:**
```json
{
  "name": "Leadership Style Assessment",
  "slug": "leadership-style",
  "description": "Discover your leadership approach",
  "question_count": 18,
  "estimated_minutes": 12,
  "category": "Leadership & Calling",
  "biblical_foundation": "Exodus 18, Nehemiah 2",
  "display_order": 7
}
```

**Response:**
```json
{
  "success": true,
  "message": "Assessment created successfully",
  "assessment": {
    "id": "uuid",
    "name": "Leadership Style Assessment",
    "slug": "leadership-style",
    "is_active": true,
    "total_completions": 0
  }
}
```

**Validation:**
- `slug` must be lowercase with hyphens only (e.g., "my-assessment")
- `question_count` must be between 1 and 100
- `estimated_minutes` must be between 1 and 120
- `slug` must be unique

---

### 9. Manage Assessment Questions
**POST** `/api/assessments/admin/questions`

Creates a new question.

**Authentication:** Required (Admin role)

**Request Body:**
```json
{
  "assessment_id": "uuid",
  "question_text": "I enjoy organizing people and tasks",
  "question_type": "scale",
  "options_json": null,
  "scoring_category": "administration",
  "order_number": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Question created successfully",
  "question": {
    "id": "uuid",
    "assessment_id": "uuid",
    "question_text": "I enjoy organizing people and tasks",
    "question_type": "scale",
    "scoring_category": "administration",
    "order_number": 1
  }
}
```

---

**PUT** `/api/assessments/admin/questions`

Updates an existing question.

**Request Body:**
```json
{
  "question_id": "uuid",
  "question_text": "Updated question text",
  "scoring_category": "new-category"
}
```

---

**DELETE** `/api/assessments/admin/questions?question_id=uuid`

Deletes a question.

---

## Scoring Algorithms

### Spiritual Gifts Assessment

Calculates scores for each spiritual gift based on Likert scale responses (1-5).

**Gifts Tracked:**
- Administration, Mercy, Teaching, Exhortation, Serving, Giving, Discernment, Leadership, Faith, Prophecy, Shepherding

**Algorithm:**
1. Each question is mapped to a gift category
2. Sum all responses for each gift (multiple questions per gift)
3. Calculate percentage: `(score / max_possible) * 100`
4. Return top 3 gifts ranked by score

**Max Possible Score:** Typically 25 (5 questions × 5 max response)

---

### Seasonal Assessment

Determines current spiritual season based on response patterns.

**Seasons:**
- Planting Season, Growth Season, Harvest Season, Rest Season, Waiting Season, Pruning Season

**Algorithm:**
1. Map questions to season indicators
2. For each season, sum responses ≥ 4
3. Determine primary season (highest score)
4. Return top 1-2 seasons

**Example Indicators:**
- Growth: Questions about learning, hunger, expansion
- Waiting: Questions about patience, preparation
- Pruning: Questions about challenges, refinement
- Harvest: Questions about fruitfulness, breakthrough

---

### Prophetic Expression Assessment

Identifies primary prophetic expression type.

**Expression Types:**
- Seer, Prophet, Intercessor, Revelatory Worship, Prophetic Acts

**Algorithm:**
1. Questions mapped to expression categories
2. Sum scores per expression type
3. Calculate percentage: `(score / 20) * 100`
4. Return top 3 expressions

---

### Ministry Calling Assessment

Determines top ministry calling areas.

**Calling Areas:**
- Teaching, Pastoral Care, Evangelism, Worship, Administration, Missions, Prayer Ministry

**Algorithm:**
1. Questions map to calling categories
2. Sum responses per calling
3. Calculate percentage: `(score / 15) * 100`
4. Return top 3 callings

---

### Redemptive Gifts Assessment (Romans 12)

Identifies primary and secondary redemptive gifts.

**Gifts (Romans 12:6-8):**
- Prophet, Servant, Teacher, Exhorter, Giver, Ruler, Mercy

**Algorithm:**
1. Questions mapped to each of 7 gifts
2. Sum responses per gift
3. Calculate percentage: `(score / 20) * 100`
4. Return primary (highest) and secondary (second highest)

---

### Spiritual Maturity Assessment

Assesses spiritual development across multiple categories.

**Categories:**
- Biblical Knowledge, Prayer Life, Character Development, Service & Ministry, Spiritual Disciplines

**Algorithm:**
1. Questions mapped to categories
2. Calculate overall percentage: `(total_score / max_score) * 100`
3. Assign maturity level:
   - 80%+ = Mature
   - 60-79% = Growing
   - 40-59% = Developing
   - <40% = Beginning
4. Identify top 2 strengths (highest categories)
5. Identify top 2 growth areas (lowest categories)

---

## Database Schema

### assessments
```sql
id UUID PRIMARY KEY
name TEXT NOT NULL
slug TEXT UNIQUE NOT NULL
description TEXT
question_count INTEGER NOT NULL
estimated_minutes INTEGER NOT NULL
category TEXT
biblical_foundation TEXT
is_active BOOLEAN DEFAULT true
display_order INTEGER
total_completions INTEGER DEFAULT 0
created_at TIMESTAMP
```

### assessment_questions
```sql
id UUID PRIMARY KEY
assessment_id UUID REFERENCES assessments(id)
question_text TEXT NOT NULL
question_type TEXT CHECK (scale|multiple_choice|ranking|select_all)
options_json JSONB
scoring_category TEXT
order_number INTEGER NOT NULL
created_at TIMESTAMP
```

### assessment_responses_anonymous
```sql
id UUID PRIMARY KEY
assessment_id UUID REFERENCES assessments(id)
email TEXT
responses_json JSONB NOT NULL
results_json JSONB
completed_at TIMESTAMP
ip_address TEXT
converted_to_member BOOLEAN DEFAULT false
member_id UUID REFERENCES members(id)
```

### member_assessment_results
```sql
id UUID PRIMARY KEY
member_id UUID REFERENCES members(id)
assessment_id UUID REFERENCES assessments(id)
responses_json JSONB NOT NULL
results_json JSONB NOT NULL
completed_at TIMESTAMP
retake_number INTEGER DEFAULT 1
UNIQUE(member_id, assessment_id, retake_number)
```

---

## Error Responses

All API routes follow consistent error response format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**Common Status Codes:**
- `400` - Bad Request (missing/invalid parameters)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized/wrong role)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate slug/constraint violation)
- `500` - Internal Server Error

---

## Authentication & Authorization

**Public Routes:** No authentication required
- `/api/assessments/list`
- `/api/assessments/[id]/questions`
- `/api/assessments/submit-anonymous`

**Member Routes:** Requires authentication
- `/api/assessments/submit-member`
- `/api/assessments/member-history`
- `/api/assessments/save-progress`

**Admin Routes:** Requires authentication + admin role
- `/api/assessments/admin/analytics`
- `/api/assessments/admin/create`
- `/api/assessments/admin/questions`

**Note:** Admin role check is currently a TODO in the codebase. Implement by checking `members.role` field.

---

## Rate Limiting Recommendations

- **Anonymous submissions:** 3 per IP per hour
- **Member submissions:** 10 per member per day
- **Save progress:** 30 per member per hour
- **Admin endpoints:** 100 per admin per hour

---

## Testing Endpoints

**Test Anonymous Submission:**
```bash
curl -X POST http://localhost:3001/api/assessments/submit-anonymous \
  -H "Content-Type: application/json" \
  -d '{
    "assessment_id": "your-assessment-uuid",
    "email": "test@example.com",
    "responses_json": {"1": 5, "2": 4, "3": 5},
    "ip_address": "127.0.0.1"
  }'
```

**Test Get Assessments:**
```bash
curl http://localhost:3001/api/assessments/list
```

---

## Future Enhancements

1. **Assessment Progress Table**
   - Create dedicated table for in-progress assessments
   - Currently uses TODO placeholders

2. **Real-time Completion Tracking**
   - Track actual time spent per question
   - Calculate avg_completion_time from real data

3. **Admin Role Enforcement**
   - Implement role checks in admin routes
   - Add role field to members table if not present

4. **Email Automation**
   - Send results via email after completion
   - Automated follow-up sequences

5. **PDF Generation**
   - Generate downloadable PDF results
   - Include charts and visualizations

6. **Comparison Analytics**
   - Compare results across demographics
   - Benchmark against cohort averages
