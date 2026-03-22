# We Believe Academics — Database & Backend Design Document

**Version:** 1.0  
**Date:** March 2026  
**Platform:** Firebase Data Connect → Cloud SQL (PostgreSQL)  

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  webelieveacademics.com (Cloudflare)                     │
│  ┌──────────┐ ┌──────────────┐ ┌────────────────────┐   │
│  │  Portal   │ │ TCAP Practice│ │ Polynomial Project │   │
│  │ portal.html│ │   Test       │ │  AI Tutor          │   │
│  └─────┬─────┘ └──────┬───────┘ └─────────┬──────────┘   │
│        │               │                   │              │
├────────┼───────────────┼───────────────────┼──────────────┤
│        ▼               ▼                   ▼              │
│              FIREBASE SERVICES                            │
│  ┌────────────────┐  ┌────────────────┐                  │
│  │ Firebase Auth   │  │ Cloud Storage  │                  │
│  │ (Email/Password)│  │ (PDFs, Files)  │                  │
│  └───────┬────────┘  └───────┬────────┘                  │
│          │                   │                            │
│  ┌───────┴───────────────────┴───────────┐               │
│  │     Firebase Data Connect              │               │
│  │     (GraphQL API layer)                │               │
│  └───────────────┬───────────────────────┘               │
│                  │                                        │
│  ┌───────────────▼───────────────────────┐               │
│  │     Cloud SQL (PostgreSQL 15+)        │               │
│  │     20 Tables · 4 Views              │               │
│  └───────────────────────────────────────┘               │
│                                                          │
│              AI SERVICES                                 │
│  ┌────────────────────────────────────┐                  │
│  │   Anthropic Claude API             │                  │
│  │   (Tutor, Grading, Study Plans)    │                  │
│  └────────────────────────────────────┘                  │
└──────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Static HTML/CSS/JS | Student portal, tools, tests |
| Hosting | Cloudflare Pages | Static site delivery, CDN |
| Source Control | GitHub | Code repository |
| Authentication | Firebase Auth | Email/password login, session management |
| Database | Cloud SQL PostgreSQL | Structured data, relational queries |
| API Layer | Firebase Data Connect | GraphQL queries between frontend and DB |
| File Storage | Cloud Storage for Firebase | PDFs, reports, lesson files, media |
| AI | Anthropic Claude API | Tutoring, grading, study plans, lesson generation |

---

## 2. Database Schema — 6 Domains, 20 Tables

### Domain 1: Users & Roles (4 tables)

The `users` table is the central identity table linked to Firebase Auth via `firebase_uid`. All people in the system — students, teachers, parents, admins — have a row in `users`. Extended profile data lives in role-specific tables.

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | All authenticated users | firebase_uid, email, role, first_name |
| `students` | Student-specific data | grade_level, parent_id, school_name |
| `teachers` | Teacher-specific data | subject_specialty, certification |
| `parents` | Parent-specific data | phone, preferred_contact |

**Relationships:**
- `students.student_id` → `users.user_id` (1:1)
- `students.parent_id` → `users.user_id` (many students to one parent)
- `teachers.teacher_id` → `users.user_id` (1:1)
- `parents.parent_id` → `users.user_id` (1:1)

### Domain 2: Learning Content (4 tables)

Content is organized in a hierarchy: **Courses** contain **Lessons** (via the join table `course_lessons`), and **Tests** are linked to lessons or courses. Lessons can be teacher-created or AI-generated, distinguished by `lesson_type`.

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `courses` | Structured collections of lessons | title, subject_area, grade_level, teacher_id |
| `lessons` | Individual learning units | lesson_type (teacher_led/ai_generated), content_url, ai_model_used |
| `course_lessons` | Maps lessons into courses with ordering | course_id, lesson_id, order_in_course |
| `tests` | Assessments | max_score, passing_score, content_json (inline questions) |

**Key Design Decision:** Tests store questions as JSONB (`content_json`) for flexibility — this allows the TCAP practice test and similar tools to store their full question bank inline without needing a separate questions table. The `results_json` field in `grades` stores per-question results.

### Domain 3: Student Tracking (4 tables)

This is the core of the student experience. It tracks enrollment → personalized plan → progress → grade in a chain.

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `student_enrollments` | Student enrollment in courses | student_id, course_id, status, enrollment_date |
| `personalized_lesson_plans` | Per-student lesson assignments with tool selection | assigned_tool_id, custom_instructions, status |
| `student_progress` | Granular lesson-level progress | completion_pct, time_spent_min, last_accessed |
| `grades` | All grading (tests, homework, projects, etc.) | score, max_score, percentage (auto-calc), results_json |

**Flow:**
```
Student enrolls in Course
    → Teacher assigns PersonalizedLessonPlan for each Lesson
        → Student works through it → StudentProgress updates
            → Student takes Test → Grade recorded
                → Grade linked to EducationalStandards via alignments
```

### Domain 4: Pedagogical Personalization (4 tables)

This is what makes the platform unique. Each student has identified best learning methods per subject, and the system matches them to compatible pedagogical tools.

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `teaching_methods` | Master list of learning methodologies | method_name (Visual, Auditory, Kinesthetic, etc.) |
| `pedagogical_tools` | Available learning tools | tool_name, media_type, is_interactive, external_url |
| `tool_method_compatibility` | Maps tools to methods with scores | tool_id, method_id, compatibility_score (1-5) |
| `student_learning_preferences` | Student's best method per subject | student_id, subject_area, best_method_id |

**How Personalization Works:**
1. Teacher (or AI) identifies student's `best_method_id` for each `subject_area`
2. System queries `tool_method_compatibility` for tools with high `compatibility_score` for that method
3. Teacher selects or system auto-assigns `assigned_tool_id` in `personalized_lesson_plans`
4. Student receives lesson delivered through their optimal tool

**Example:** A student identified as a "Visual Learner" in Math would be assigned "Virtual Manipulatives" or "Graphic Organizer" tools (compatibility_score = 5) rather than "Audio Lesson" (score = 2).

### Domain 5: Educational Standards (3 tables)

Government educational guidelines (Tennessee Academic Standards, Common Core, etc.) are stored as structured, queryable data. Standards are linked to grades via a many-to-many relationship because one test/assignment typically covers multiple standards.

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `educational_standards` | Structured standards data | standard_identifier (7.RP.A.3), description, domain |
| `standard_documents` | Metadata for guideline PDFs | source_url, file_url (Cloud Storage), publication_date |
| `assignment_standard_alignments` | Maps grades to standards (many-to-many) | grade_id, standard_id, alignment_strength |

**Quarterly Update Process:**
1. Download latest guidelines from TN DOE website
2. Parse standards into structured format
3. Upsert into `educational_standards` (set old versions `is_current = FALSE`)
4. Archive PDFs to Cloud Storage, update `standard_documents`

### Domain 6: Metrics, Reports & AI (4 tables)

Teacher-defined custom metrics provide flexibility beyond grades. Reports centralize all generated documents with Cloud Storage URLs.

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `teacher_defined_metrics` | Custom tracking metrics per teacher | metric_name, metric_type (numeric/text/boolean/rating) |
| `student_metric_values` | Recorded values per student | value_numeric, value_text, value_boolean, recorded_date |
| `metric_standard_alignments` | Links metric observations to standards | metric_value_id, standard_id |
| `reports` | All generated reports | report_type, file_url, report_data_json, ai_generated |

**Report Types:**
- **Student Report:** Progress, grades, standards mastery, learning preferences
- **Parent Report:** Child's progress, strengths, areas for growth, teacher comments
- **Teacher Report:** Class-wide performance, tool effectiveness, engagement data
- **AI Report:** AI lesson effectiveness, personalization impact, model performance
- **Government Report:** Aggregate standards achievement, demographics, compliance data

---

## 3. Entity Relationship Summary

```
users ──────┬──── students ────── student_enrollments ────── courses
            │         │                    │                    │
            ├──── teachers                 │              course_lessons
            │                              │                    │
            ├──── parents                  ▼                 lessons
            │                   personalized_lesson_plans      │
            │                        │          │            tests
            │                        │     pedagogical_tools   │
            │                        ▼                         ▼
            │               student_progress               grades
            │                                                │
            │    teaching_methods ── tool_method_compat       │
            │         │                                      │
            │    student_learning_preferences    assignment_standard_alignments
            │                                                │
            │    teacher_defined_metrics           educational_standards
            │         │                                      │
            │    student_metric_values          standard_documents
            │         │
            │    metric_standard_alignments
            │
            └──── reports
```

---

## 4. Pre-Built Views

| View | Purpose | Key Joins |
|------|---------|-----------|
| `v_student_performance` | Average scores per student per subject | users → grades → tests → lessons |
| `v_enrollment_progress` | Course completion % per enrollment | enrollments → progress |
| `v_standards_mastery` | Per-standard average score per student | grades → alignments → standards |
| `v_tool_effectiveness` | Which tools produce best scores | plans → tools → grades + methods |

---

## 5. Seed Data Included

The schema SQL file includes seed data for:
- **8 Teaching Methods:** Visual, Auditory, Kinesthetic, Read/Write, Problem-Based, Collaborative, Self-Paced, Gamified
- **12 Pedagogical Tools:** Flashcards, Interactive Quiz, Video Lecture, Guided Reading, Problem Set, Virtual Manipulatives, AI Tutor Chat, Audio Lesson, Collaborative Worksheet, Game-Based Practice, Writing Workshop, Graphic Organizer
- **28 TN 7th Grade Standards:** Full Math standards (7.RP, 7.NS, 7.EE, 7.G, 7.SP) and ELA standards (RL.7, RI.7, L.7) matching the TCAP practice test

---

## 6. Cloud Storage Structure

```
webelieve-storage/
├── lessons/
│   ├── {lesson_id}/content.pdf
│   ├── {lesson_id}/video.mp4
│   └── {lesson_id}/interactive.html
├── reports/
│   ├── student/{student_id}/{report_id}.pdf
│   ├── parent/{parent_id}/{report_id}.pdf
│   └── government/{report_id}.pdf
├── standards/
│   └── {guideline_source}/{document_id}.pdf
├── avatars/
│   └── {user_id}.jpg
└── test-results/
    └── {student_id}/{grade_id}.json
```

---

## 7. Firebase Data Connect Integration

Firebase Data Connect generates a GraphQL API from your PostgreSQL schema. Key queries to implement:

```graphql
# Get student dashboard data
query StudentDashboard($studentId: UUID!) {
  student: users_by_pk(user_id: $studentId) {
    first_name
    students_by_pk { grade_level }
    student_enrollments { course { title } status }
    grades(order_by: { grade_date: desc }, limit: 10) {
      percentage assignment_type grade_date
    }
  }
}

# Get standards mastery for a student
query StandardsMastery($studentId: UUID!) {
  v_standards_mastery(where: { student_id: { _eq: $studentId }}) {
    standard_identifier domain avg_score times_assessed
  }
}

# Recommend tools for a student's lesson
query RecommendTools($studentId: UUID!, $subjectArea: String!) {
  student_learning_preferences(where: {
    student_id: { _eq: $studentId },
    subject_area: { _eq: $subjectArea }
  }) {
    best_method_id
    teaching_method {
      tool_method_compatibilities(order_by: { compatibility_score: desc }) {
        pedagogical_tool { tool_name description media_type }
        compatibility_score
      }
    }
  }
}
```

---

## 8. Security Rules

### Firestore/Cloud SQL Row-Level Security

```sql
-- Students can only read their own data
CREATE POLICY student_read_own ON grades
    FOR SELECT
    USING (student_id = current_setting('app.current_user_id')::UUID);

-- Teachers can read all students they're assigned to
CREATE POLICY teacher_read_students ON grades
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM student_enrollments se
            JOIN courses c ON c.course_id = se.course_id
            WHERE se.student_id = grades.student_id
            AND c.teacher_id = current_setting('app.current_user_id')::UUID
        )
    );

-- Parents can only see their children's data
CREATE POLICY parent_read_children ON grades
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM students s
            WHERE s.student_id = grades.student_id
            AND s.parent_id = current_setting('app.current_user_id')::UUID
        )
    );
```

---

## 9. Implementation Phases

### Phase 1: Foundation (Current)
- [x] Static website on Cloudflare
- [x] Student portal with Firebase Auth (demo mode)
- [x] TCAP practice test with localStorage
- [x] Polynomial project with AI tutor
- [ ] Set up Firebase project
- [ ] Deploy Cloud SQL PostgreSQL instance
- [ ] Run schema SQL to create tables

### Phase 2: Data Layer
- [ ] Enable Firebase Data Connect
- [ ] Connect portal to Firestore Auth (replace demo mode)
- [ ] Wire TCAP test results to save to `grades` table
- [ ] Wire student profiles to `students` table
- [ ] Implement `student_learning_preferences` in profile setup

### Phase 3: Personalization Engine
- [ ] Populate `tool_method_compatibility` scores
- [ ] Build lesson assignment workflow (teacher → personalized_lesson_plans)
- [ ] Auto-recommend tools based on student preferences
- [ ] Track progress in `student_progress` table

### Phase 4: Reporting & AI
- [ ] Build student report generator (pull from views)
- [ ] Build parent report generator
- [ ] AI-generated study plans saved to `reports` table
- [ ] Government report templates with standards alignment data
- [ ] Quarterly standards ingestion pipeline

---

## 10. Cost Estimate (Firebase)

| Service | Free Tier (Spark) | Estimated Monthly (Blaze) |
|---------|------------------|--------------------------|
| Firebase Auth | 50K MAU free | Free for your scale |
| Cloud SQL (PostgreSQL) | Not available on Spark | ~$7-15/mo (db-f1-micro) |
| Cloud Storage | 5GB free | ~$0.02/GB after 5GB |
| Firebase Data Connect | Preview (free) | TBD by Google |
| **Total** | — | **~$10-20/month** |

Note: Cloud SQL requires the Blaze (pay-as-you-go) plan. For your access pattern (a few times per day, small documents), the smallest instance is sufficient.

---

*Document generated for We Believe Academics. Schema SQL file: `webelieve_schema.sql`*
