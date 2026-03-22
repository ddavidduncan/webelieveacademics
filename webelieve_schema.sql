-- ═══════════════════════════════════════════════════════════════════
-- WE BELIEVE ACADEMICS — PostgreSQL Database Schema
-- Version: 1.0
-- Date: March 2026
-- Platform: Firebase Data Connect → Cloud SQL (PostgreSQL)
-- ═══════════════════════════════════════════════════════════════════
-- 
-- ARCHITECTURE OVERVIEW:
--   Authentication: Firebase Auth (email/password)
--   Database: Cloud SQL PostgreSQL via Firebase Data Connect
--   File Storage: Cloud Storage for Firebase
--   AI Integration: Anthropic Claude API
--
-- TABLE COUNT: 20 tables across 6 domains
-- ═══════════════════════════════════════════════════════════════════

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════════
-- DOMAIN 1: USERS & ROLES
-- ═══════════════════════════════════════════════════════════════════

-- Custom ENUM types
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'parent', 'admin');
CREATE TYPE enrollment_status AS ENUM ('enrolled', 'completed', 'dropped', 'paused');
CREATE TYPE lesson_type AS ENUM ('teacher_led', 'ai_generated');
CREATE TYPE assignment_type AS ENUM ('test', 'homework', 'project', 'quiz', 'participation', 'lesson_completion');
CREATE TYPE plan_status AS ENUM ('assigned', 'in_progress', 'completed', 'skipped');
CREATE TYPE progress_status AS ENUM ('not_started', 'in_progress', 'completed');
CREATE TYPE metric_type AS ENUM ('numeric', 'text', 'boolean', 'rating_1_5');
CREATE TYPE report_type AS ENUM ('student_report', 'ai_report', 'parent_report', 'government_report', 'teacher_report');
CREATE TYPE media_type AS ENUM ('text', 'video', 'audio', 'interactive', 'image', 'pdf', 'document');
CREATE TYPE document_type AS ENUM ('official_guideline', 'interpretive_guide', 'resource', 'curriculum_framework');

-- ─────────────────────────────────────────────────────────────────
-- Table: users
-- Central user table linked to Firebase Auth UID
-- All roles (student, teacher, parent, admin) share this table
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE users (
    user_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid    VARCHAR(128) UNIQUE NOT NULL,   -- Firebase Auth UID
    email           VARCHAR(255) UNIQUE NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100),
    display_name    VARCHAR(200),
    role            user_role NOT NULL DEFAULT 'student',
    avatar_url      TEXT,                           -- Cloud Storage URL
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ─────────────────────────────────────────────────────────────────
-- Table: students
-- Extended profile for users with role = 'student'
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE students (
    student_id      UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    grade_level     VARCHAR(10),                    -- e.g. '7th', '8th'
    date_of_birth   DATE,
    parent_id       UUID REFERENCES users(user_id) ON DELETE SET NULL,
    school_name     VARCHAR(200),
    notes           TEXT,                           -- teacher/admin notes
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_students_parent ON students(parent_id);
CREATE INDEX idx_students_grade ON students(grade_level);

-- ─────────────────────────────────────────────────────────────────
-- Table: teachers
-- Extended profile for users with role = 'teacher'
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE teachers (
    teacher_id          UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    subject_specialty   VARCHAR(200),
    bio                 TEXT,
    hire_date           DATE,
    certification       VARCHAR(200),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- Table: parents
-- Extended profile for users with role = 'parent'
-- Links parent to one or more students via students.parent_id
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE parents (
    parent_id       UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    phone           VARCHAR(20),
    preferred_contact VARCHAR(50) DEFAULT 'email', -- email, phone, text
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ═══════════════════════════════════════════════════════════════════
-- DOMAIN 2: LEARNING CONTENT
-- Courses, Lessons, Tests
-- ═══════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────
-- Table: courses
-- A structured collection of lessons (e.g. "7th Grade Math Q3")
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE courses (
    course_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           VARCHAR(300) NOT NULL,
    description     TEXT,
    subject_area    VARCHAR(100),                   -- Mathematics, ELA, Science, etc.
    grade_level     VARCHAR(10),
    teacher_id      UUID REFERENCES users(user_id) ON DELETE SET NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_courses_teacher ON courses(teacher_id);
CREATE INDEX idx_courses_subject ON courses(subject_area);

-- ─────────────────────────────────────────────────────────────────
-- Table: lessons
-- Individual learning units — can be teacher-created or AI-generated
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE lessons (
    lesson_id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title               VARCHAR(300) NOT NULL,
    description         TEXT,
    lesson_type         lesson_type NOT NULL DEFAULT 'teacher_led',
    subject_area        VARCHAR(100),
    grade_level         VARCHAR(10),
    author_teacher_id   UUID REFERENCES users(user_id) ON DELETE SET NULL,
    ai_model_used       VARCHAR(100),               -- e.g. 'claude-sonnet-4', NULL if teacher-led
    content_url         TEXT,                        -- Cloud Storage URL for lesson file/media
    content_html        TEXT,                        -- Inline HTML content (for interactive lessons)
    estimated_minutes   INTEGER,                     -- Expected time to complete
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lessons_type ON lessons(lesson_type);
CREATE INDEX idx_lessons_teacher ON lessons(author_teacher_id);
CREATE INDEX idx_lessons_subject ON lessons(subject_area);

-- ─────────────────────────────────────────────────────────────────
-- Table: course_lessons
-- Join table: maps lessons into courses with ordering
-- A single lesson can appear in multiple courses
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE course_lessons (
    course_lesson_id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id           UUID NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    lesson_id           UUID NOT NULL REFERENCES lessons(lesson_id) ON DELETE CASCADE,
    order_in_course     INTEGER NOT NULL DEFAULT 0,
    is_required         BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (course_id, lesson_id)
);

CREATE INDEX idx_course_lessons_course ON course_lessons(course_id);

-- ─────────────────────────────────────────────────────────────────
-- Table: tests
-- Assessments linked to lessons or courses
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE tests (
    test_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           VARCHAR(300) NOT NULL,
    description     TEXT,
    lesson_id       UUID REFERENCES lessons(lesson_id) ON DELETE SET NULL,
    course_id       UUID REFERENCES courses(course_id) ON DELETE SET NULL,
    test_type       VARCHAR(50),                    -- 'practice', 'graded', 'diagnostic'
    max_score       NUMERIC(8,2) NOT NULL DEFAULT 100,
    passing_score   NUMERIC(8,2),
    time_limit_min  INTEGER,                        -- Time limit in minutes, NULL = unlimited
    content_url     TEXT,                            -- Cloud Storage URL (if external test file)
    content_json    JSONB,                          -- Inline test questions as JSON
    created_by      UUID REFERENCES users(user_id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tests_lesson ON tests(lesson_id);
CREATE INDEX idx_tests_course ON tests(course_id);


-- ═══════════════════════════════════════════════════════════════════
-- DOMAIN 3: STUDENT TRACKING
-- Enrollments, Progress, Grades, Personalized Plans
-- ═══════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────
-- Table: student_enrollments
-- Tracks which students are enrolled in which courses
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE student_enrollments (
    enrollment_id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    course_id       UUID NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    enrolled_by     UUID REFERENCES users(user_id) ON DELETE SET NULL, -- teacher who enrolled them
    status          enrollment_status NOT NULL DEFAULT 'enrolled',
    enrollment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completion_date TIMESTAMPTZ,
    notes           TEXT,
    UNIQUE (student_id, course_id)
);

CREATE INDEX idx_enrollments_student ON student_enrollments(student_id);
CREATE INDEX idx_enrollments_course ON student_enrollments(course_id);
CREATE INDEX idx_enrollments_status ON student_enrollments(status);

-- ─────────────────────────────────────────────────────────────────
-- Table: personalized_lesson_plans
-- Per-student lesson assignments with tool selection
-- Connects to pedagogical_tools for personalized delivery
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE personalized_lesson_plans (
    plan_id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id              UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    lesson_id               UUID NOT NULL REFERENCES lessons(lesson_id) ON DELETE CASCADE,
    enrollment_id           UUID REFERENCES student_enrollments(enrollment_id) ON DELETE SET NULL,
    assigned_by_teacher_id  UUID REFERENCES users(user_id) ON DELETE SET NULL,
    assigned_tool_id        UUID,                   -- FK added after pedagogical_tools table created
    custom_instructions     TEXT,                    -- Teacher notes for this student on this lesson
    status                  plan_status NOT NULL DEFAULT 'assigned',
    assigned_date           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date                TIMESTAMPTZ,
    completion_date         TIMESTAMPTZ,
    ai_generated            BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (student_id, lesson_id)
);

CREATE INDEX idx_plans_student ON personalized_lesson_plans(student_id);
CREATE INDEX idx_plans_status ON personalized_lesson_plans(status);

-- ─────────────────────────────────────────────────────────────────
-- Table: student_progress
-- Granular lesson-level progress tracking within enrollments
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE student_progress (
    progress_id     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id   UUID NOT NULL REFERENCES student_enrollments(enrollment_id) ON DELETE CASCADE,
    lesson_id       UUID NOT NULL REFERENCES lessons(lesson_id) ON DELETE CASCADE,
    plan_id         UUID REFERENCES personalized_lesson_plans(plan_id) ON DELETE SET NULL,
    status          progress_status NOT NULL DEFAULT 'not_started',
    completion_pct  INTEGER NOT NULL DEFAULT 0 CHECK (completion_pct >= 0 AND completion_pct <= 100),
    time_spent_min  INTEGER DEFAULT 0,              -- Total minutes spent
    last_accessed   TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (enrollment_id, lesson_id)
);

CREATE INDEX idx_progress_enrollment ON student_progress(enrollment_id);
CREATE INDEX idx_progress_status ON student_progress(status);

-- ─────────────────────────────────────────────────────────────────
-- Table: grades
-- Centralized grading for all assignment types
-- Links to tests, lessons, and educational standards
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE grades (
    grade_id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id              UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    assigned_by_user_id     UUID REFERENCES users(user_id) ON DELETE SET NULL,
    assignment_type         assignment_type NOT NULL,
    test_id                 UUID REFERENCES tests(test_id) ON DELETE SET NULL,
    plan_id                 UUID REFERENCES personalized_lesson_plans(plan_id) ON DELETE SET NULL,
    score                   NUMERIC(8,2) NOT NULL,
    max_score               NUMERIC(8,2) NOT NULL,
    percentage              NUMERIC(5,2) GENERATED ALWAYS AS (
                                CASE WHEN max_score > 0 THEN ROUND((score / max_score) * 100, 2) ELSE 0 END
                            ) STORED,
    grade_date              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    comments                TEXT,
    ai_generated            BOOLEAN NOT NULL DEFAULT FALSE,
    -- Detailed results (for TCAP-style tests with per-question data)
    results_json            JSONB,                  -- Full question-by-question breakdown
    writing_response        TEXT,                    -- Student's writing (for writing prompts)
    ai_writing_feedback     TEXT,                    -- AI-generated writing evaluation
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_type ON grades(assignment_type);
CREATE INDEX idx_grades_date ON grades(grade_date);
CREATE INDEX idx_grades_test ON grades(test_id);


-- ═══════════════════════════════════════════════════════════════════
-- DOMAIN 4: PEDAGOGICAL PERSONALIZATION
-- Teaching methods, tools, student learning preferences
-- ═══════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────
-- Table: teaching_methods
-- Master list of teaching/learning methodologies
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE teaching_methods (
    method_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    method_name     VARCHAR(100) NOT NULL UNIQUE,   -- e.g. 'Visual Learning'
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed data
INSERT INTO teaching_methods (method_name, description) VALUES
    ('Visual Learning', 'Learns best through diagrams, charts, colors, spatial understanding, and visual representations'),
    ('Auditory Learning', 'Learns best through listening, discussion, verbal explanation, and audio content'),
    ('Kinesthetic Learning', 'Learns best through hands-on activities, movement, building, and physical engagement'),
    ('Read/Write Learning', 'Learns best through reading text, taking notes, writing summaries, and written exercises'),
    ('Problem-Based Learning', 'Learns best by tackling real-world problems and working through challenges step by step'),
    ('Collaborative Learning', 'Learns best in group settings with peer discussion, teamwork, and shared problem-solving'),
    ('Self-Paced Learning', 'Learns best when given control over pace, order, and depth of material'),
    ('Gamified Learning', 'Learns best when material is presented with game mechanics: points, levels, challenges, rewards');

-- ─────────────────────────────────────────────────────────────────
-- Table: pedagogical_tools
-- Master list of available learning tools/modalities
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE pedagogical_tools (
    tool_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tool_name       VARCHAR(150) NOT NULL UNIQUE,
    description     TEXT,
    is_interactive  BOOLEAN NOT NULL DEFAULT FALSE,
    media_type      media_type NOT NULL DEFAULT 'text',
    external_url    TEXT,                            -- Link to external tool (Khan Academy, Desmos, etc.)
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed data
INSERT INTO pedagogical_tools (tool_name, description, is_interactive, media_type) VALUES
    ('Flashcards', 'Digital flashcard sets for vocabulary and concept review', TRUE, 'interactive'),
    ('Interactive Quiz', 'Self-grading quizzes with instant feedback', TRUE, 'interactive'),
    ('Video Lecture', 'Pre-recorded instructional videos with visual explanations', FALSE, 'video'),
    ('Guided Reading', 'Structured reading passages with comprehension checkpoints', FALSE, 'text'),
    ('Problem Set', 'Practice problems with worked examples and step-by-step solutions', FALSE, 'text'),
    ('Virtual Manipulatives', 'Digital tools for hands-on math exploration (algebra tiles, graphing)', TRUE, 'interactive'),
    ('AI Tutor Chat', 'One-on-one AI-powered tutoring conversation about the topic', TRUE, 'interactive'),
    ('Audio Lesson', 'Narrated lesson content for auditory learners', FALSE, 'audio'),
    ('Collaborative Worksheet', 'Shared worksheet for pair/group completion', TRUE, 'document'),
    ('Game-Based Practice', 'Educational games that reinforce concepts through play mechanics', TRUE, 'interactive'),
    ('Writing Workshop', 'AI-assisted writing practice with rubric-based feedback', TRUE, 'interactive'),
    ('Graphic Organizer', 'Visual frameworks (mind maps, Venn diagrams, flow charts) for organizing ideas', TRUE, 'image');

-- Now add the FK from personalized_lesson_plans
ALTER TABLE personalized_lesson_plans 
    ADD CONSTRAINT fk_plans_tool 
    FOREIGN KEY (assigned_tool_id) REFERENCES pedagogical_tools(tool_id) ON DELETE SET NULL;

-- ─────────────────────────────────────────────────────────────────
-- Table: tool_method_compatibility
-- Maps which tools work best with which teaching methods
-- Many-to-many with a compatibility score
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE tool_method_compatibility (
    compatibility_id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tool_id             UUID NOT NULL REFERENCES pedagogical_tools(tool_id) ON DELETE CASCADE,
    method_id           UUID NOT NULL REFERENCES teaching_methods(method_id) ON DELETE CASCADE,
    compatibility_score INTEGER NOT NULL DEFAULT 3 CHECK (compatibility_score >= 1 AND compatibility_score <= 5),
    -- 1 = poor fit, 3 = decent, 5 = excellent fit
    UNIQUE (tool_id, method_id)
);

-- ─────────────────────────────────────────────────────────────────
-- Table: student_learning_preferences
-- Each student's identified best learning method PER subject
-- One student can have different preferences for different subjects
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE student_learning_preferences (
    preference_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id          UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    subject_area        VARCHAR(100) NOT NULL,       -- 'Mathematics', 'ELA', 'Science', etc.
    best_method_id      UUID NOT NULL REFERENCES teaching_methods(method_id) ON DELETE CASCADE,
    assigned_by         UUID REFERENCES users(user_id) ON DELETE SET NULL, -- teacher or NULL if AI-determined
    preference_strength INTEGER DEFAULT 3 CHECK (preference_strength >= 1 AND preference_strength <= 5),
    last_evaluated      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes               TEXT,
    UNIQUE (student_id, subject_area)
);

CREATE INDEX idx_prefs_student ON student_learning_preferences(student_id);


-- ═══════════════════════════════════════════════════════════════════
-- DOMAIN 5: EDUCATIONAL STANDARDS & ALIGNMENT
-- Government guidelines, standards mapping, performance alignment
-- ═══════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────
-- Table: educational_standards
-- Structured representation of government educational guidelines
-- (e.g. Tennessee Academic Standards, Common Core)
-- Updated quarterly via automated or manual ingestion
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE educational_standards (
    standard_id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guideline_source        VARCHAR(200) NOT NULL,  -- 'Tennessee Dept. of Education', 'Common Core', etc.
    standard_identifier     VARCHAR(50) NOT NULL,   -- e.g. '7.RP.A.3', 'RL.7.2'
    description             TEXT NOT NULL,           -- Full text of the standard
    grade_level             VARCHAR(10),
    subject_area            VARCHAR(100),
    domain                  VARCHAR(200),            -- e.g. 'Ratios & Proportional Relationships'
    is_current              BOOLEAN NOT NULL DEFAULT TRUE,  -- FALSE when superseded
    last_updated            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (guideline_source, standard_identifier)
);

CREATE INDEX idx_standards_source ON educational_standards(guideline_source);
CREATE INDEX idx_standards_subject ON educational_standards(subject_area);
CREATE INDEX idx_standards_grade ON educational_standards(grade_level);
CREATE INDEX idx_standards_current ON educational_standards(is_current);

-- Seed: TN 7th Grade Math Standards (subset)
INSERT INTO educational_standards (guideline_source, standard_identifier, description, grade_level, subject_area, domain) VALUES
    ('TN Dept. of Education', '7.RP.A.1', 'Compute unit rates associated with ratios of fractions, including ratios of lengths, areas, and other quantities measured in like or different units.', '7th', 'Mathematics', 'Ratios & Proportional Relationships'),
    ('TN Dept. of Education', '7.RP.A.2', 'Recognize and represent proportional relationships between quantities.', '7th', 'Mathematics', 'Ratios & Proportional Relationships'),
    ('TN Dept. of Education', '7.RP.A.3', 'Use proportional relationships to solve multistep ratio and percent problems.', '7th', 'Mathematics', 'Ratios & Proportional Relationships'),
    ('TN Dept. of Education', '7.NS.A.1', 'Apply and extend previous understandings of addition and subtraction to add and subtract rational numbers.', '7th', 'Mathematics', 'The Number System'),
    ('TN Dept. of Education', '7.NS.A.2', 'Apply and extend previous understandings of multiplication and division to multiply and divide rational numbers.', '7th', 'Mathematics', 'The Number System'),
    ('TN Dept. of Education', '7.NS.A.3', 'Solve real-world and mathematical problems involving the four operations with rational numbers.', '7th', 'Mathematics', 'The Number System'),
    ('TN Dept. of Education', '7.EE.A.1', 'Apply properties of operations as strategies to add, subtract, factor, and expand linear expressions with rational coefficients.', '7th', 'Mathematics', 'Expressions & Equations'),
    ('TN Dept. of Education', '7.EE.B.3', 'Solve multi-step real-life and mathematical problems posed with positive and negative rational numbers.', '7th', 'Mathematics', 'Expressions & Equations'),
    ('TN Dept. of Education', '7.EE.B.4', 'Use variables to represent quantities in a real-world or mathematical problem, and construct simple equations and inequalities to solve problems.', '7th', 'Mathematics', 'Expressions & Equations'),
    ('TN Dept. of Education', '7.G.A.2', 'Draw geometric shapes with given conditions; describe the relationships between them.', '7th', 'Mathematics', 'Geometry'),
    ('TN Dept. of Education', '7.G.B.4', 'Know the formulas for the area and circumference of a circle; use them to solve problems.', '7th', 'Mathematics', 'Geometry'),
    ('TN Dept. of Education', '7.G.B.6', 'Solve real-world and mathematical problems involving area, volume, and surface area of two- and three-dimensional objects.', '7th', 'Mathematics', 'Geometry'),
    ('TN Dept. of Education', '7.SP.A.2', 'Use data from a random sample to draw inferences about a population with an unknown characteristic of interest.', '7th', 'Mathematics', 'Statistics & Probability'),
    ('TN Dept. of Education', '7.SP.C.7', 'Develop a probability model and use it to find probabilities of events.', '7th', 'Mathematics', 'Statistics & Probability'),
    ('TN Dept. of Education', 'RL.7.1', 'Cite several pieces of textual evidence to support analysis of what the text says explicitly as well as inferences drawn from the text.', '7th', 'ELA', 'Reading Literature'),
    ('TN Dept. of Education', 'RL.7.2', 'Determine a theme or central idea of a text and analyze its development over the course of the text.', '7th', 'ELA', 'Reading Literature'),
    ('TN Dept. of Education', 'RL.7.3', 'Analyze how particular elements of a story or drama interact.', '7th', 'ELA', 'Reading Literature'),
    ('TN Dept. of Education', 'RL.7.4', 'Determine the meaning of words and phrases as they are used in a text, including figurative and connotative meanings.', '7th', 'ELA', 'Reading Literature'),
    ('TN Dept. of Education', 'RL.7.5', 'Analyze how a drama or poem''s form or structure contributes to its meaning.', '7th', 'ELA', 'Reading Literature'),
    ('TN Dept. of Education', 'RL.7.6', 'Analyze how an author develops and contrasts the points of view of different characters or narrators.', '7th', 'ELA', 'Reading Literature'),
    ('TN Dept. of Education', 'RI.7.1', 'Cite several pieces of textual evidence to support analysis of what the text says.', '7th', 'ELA', 'Reading Informational Text'),
    ('TN Dept. of Education', 'RI.7.2', 'Determine two or more central ideas in a text and analyze their development.', '7th', 'ELA', 'Reading Informational Text'),
    ('TN Dept. of Education', 'RI.7.4', 'Determine the meaning of words and phrases as they are used in a text.', '7th', 'ELA', 'Reading Informational Text'),
    ('TN Dept. of Education', 'RI.7.5', 'Analyze the structure an author uses to organize a text.', '7th', 'ELA', 'Reading Informational Text'),
    ('TN Dept. of Education', 'RI.7.6', 'Determine an author''s point of view or purpose in a text and analyze how the author distinguishes their position.', '7th', 'ELA', 'Reading Informational Text'),
    ('TN Dept. of Education', 'RI.7.8', 'Trace and evaluate the argument and specific claims in a text.', '7th', 'ELA', 'Reading Informational Text'),
    ('TN Dept. of Education', 'L.7.1', 'Demonstrate command of the conventions of standard English grammar and usage when writing or speaking.', '7th', 'ELA', 'Language'),
    ('TN Dept. of Education', 'L.7.5', 'Demonstrate understanding of figurative language, word relationships, and nuances in word meanings.', '7th', 'ELA', 'Language');

-- ─────────────────────────────────────────────────────────────────
-- Table: standard_documents
-- Metadata for the actual guideline PDF/web documents
-- Files stored in Cloud Storage; metadata here
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE standard_documents (
    document_id     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           VARCHAR(300) NOT NULL,
    guideline_source VARCHAR(200),
    source_url      TEXT,                           -- Original URL on government website
    file_url        TEXT,                           -- Cloud Storage URL (archived copy)
    publication_date DATE,
    document_type   document_type NOT NULL DEFAULT 'official_guideline',
    grade_level     VARCHAR(10),
    subject_area    VARCHAR(100),
    last_ingested   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- Table: assignment_standard_alignments
-- Many-to-many: one grade/assignment covers MULTIPLE standards
-- Critical for TCAP-style tests where a single test maps to many standards
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE assignment_standard_alignments (
    alignment_id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grade_id            UUID NOT NULL REFERENCES grades(grade_id) ON DELETE CASCADE,
    standard_id         UUID NOT NULL REFERENCES educational_standards(standard_id) ON DELETE CASCADE,
    alignment_strength  NUMERIC(3,2) DEFAULT 1.0 CHECK (alignment_strength >= 0 AND alignment_strength <= 1),
    -- 1.0 = directly tests this standard, 0.5 = partially covers it
    UNIQUE (grade_id, standard_id)
);

CREATE INDEX idx_alignments_grade ON assignment_standard_alignments(grade_id);
CREATE INDEX idx_alignments_standard ON assignment_standard_alignments(standard_id);


-- ═══════════════════════════════════════════════════════════════════
-- DOMAIN 6: METRICS, REPORTS & AI
-- Teacher-defined metrics, all report types, AI data
-- ═══════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────
-- Table: teacher_defined_metrics
-- Custom metrics created by teachers to track student attributes
-- (e.g. "Participation Score", "Engagement Level", "Focus Rating")
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE teacher_defined_metrics (
    metric_def_id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id      UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    metric_name     VARCHAR(150) NOT NULL,
    description     TEXT,
    metric_type     metric_type NOT NULL DEFAULT 'numeric',
    subject_area    VARCHAR(100),                   -- NULL = applies to all subjects
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (teacher_id, metric_name)
);

-- ─────────────────────────────────────────────────────────────────
-- Table: student_metric_values
-- Actual recorded values for teacher-defined metrics per student
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE student_metric_values (
    metric_value_id     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id          UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    metric_def_id       UUID NOT NULL REFERENCES teacher_defined_metrics(metric_def_id) ON DELETE CASCADE,
    recorded_by         UUID REFERENCES users(user_id) ON DELETE SET NULL,
    value_numeric       NUMERIC(10,2),
    value_text          TEXT,
    value_boolean       BOOLEAN,
    recorded_date       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    comments            TEXT
);

CREATE INDEX idx_metric_vals_student ON student_metric_values(student_id);
CREATE INDEX idx_metric_vals_def ON student_metric_values(metric_def_id);
CREATE INDEX idx_metric_vals_date ON student_metric_values(recorded_date);

-- ─────────────────────────────────────────────────────────────────
-- Table: metric_standard_alignments
-- Maps teacher-defined metric values to educational standards
-- A single metric observation can relate to multiple standards
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE metric_standard_alignments (
    metric_align_id     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_value_id     UUID NOT NULL REFERENCES student_metric_values(metric_value_id) ON DELETE CASCADE,
    standard_id         UUID NOT NULL REFERENCES educational_standards(standard_id) ON DELETE CASCADE,
    UNIQUE (metric_value_id, standard_id)
);

-- ─────────────────────────────────────────────────────────────────
-- Table: reports
-- Metadata for all generated reports
-- Actual report files stored in Cloud Storage; URL stored here
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE reports (
    report_id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title               VARCHAR(300) NOT NULL,
    report_type         report_type NOT NULL,
    generated_by        UUID REFERENCES users(user_id) ON DELETE SET NULL,
    student_id          UUID REFERENCES users(user_id) ON DELETE SET NULL,
    teacher_id          UUID REFERENCES users(user_id) ON DELETE SET NULL,
    parent_id           UUID REFERENCES users(user_id) ON DELETE SET NULL,
    course_id           UUID REFERENCES courses(course_id) ON DELETE SET NULL,
    ai_generated        BOOLEAN NOT NULL DEFAULT FALSE,
    ai_model_used       VARCHAR(100),
    file_url            TEXT,                        -- Cloud Storage URL for PDF/doc
    report_data_json    JSONB,                      -- Structured report data for rendering
    summary             TEXT,                        -- AI-generated or manual summary
    generated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_type ON reports(report_type);
CREATE INDEX idx_reports_student ON reports(student_id);
CREATE INDEX idx_reports_date ON reports(generated_at);


-- ═══════════════════════════════════════════════════════════════════
-- HELPER: Updated timestamp trigger
-- Auto-updates updated_at column on row changes
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_students_updated BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_teachers_updated BEFORE UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_parents_updated BEFORE UPDATE ON parents FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_courses_updated BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_lessons_updated BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_tests_updated BEFORE UPDATE ON tests FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_progress_updated BEFORE UPDATE ON student_progress FOR EACH ROW EXECUTE FUNCTION update_timestamp();


-- ═══════════════════════════════════════════════════════════════════
-- USEFUL VIEWS
-- Pre-built queries for common dashboard/report needs
-- ═══════════════════════════════════════════════════════════════════

-- Student performance summary: latest grade per student per subject
CREATE VIEW v_student_performance AS
SELECT 
    u.user_id AS student_id,
    u.first_name || ' ' || COALESCE(u.last_name, '') AS student_name,
    s.grade_level,
    l.subject_area,
    COUNT(g.grade_id) AS total_assignments,
    ROUND(AVG(g.percentage), 1) AS avg_percentage,
    MAX(g.grade_date) AS last_graded
FROM users u
JOIN students s ON s.student_id = u.user_id
JOIN grades g ON g.student_id = u.user_id
LEFT JOIN tests t ON t.test_id = g.test_id
LEFT JOIN lessons l ON l.lesson_id = t.lesson_id
WHERE u.role = 'student'
GROUP BY u.user_id, u.first_name, u.last_name, s.grade_level, l.subject_area;

-- Student progress through enrolled courses
CREATE VIEW v_enrollment_progress AS
SELECT 
    se.enrollment_id,
    u.first_name || ' ' || COALESCE(u.last_name, '') AS student_name,
    c.title AS course_title,
    c.subject_area,
    se.status AS enrollment_status,
    COUNT(sp.progress_id) AS total_lessons,
    SUM(CASE WHEN sp.status = 'completed' THEN 1 ELSE 0 END) AS completed_lessons,
    ROUND(AVG(sp.completion_pct), 0) AS avg_completion_pct
FROM student_enrollments se
JOIN users u ON u.user_id = se.student_id
JOIN courses c ON c.course_id = se.course_id
LEFT JOIN student_progress sp ON sp.enrollment_id = se.enrollment_id
GROUP BY se.enrollment_id, u.first_name, u.last_name, c.title, c.subject_area, se.status;

-- Standards mastery: how well students perform on each standard
CREATE VIEW v_standards_mastery AS
SELECT
    g.student_id,
    u.first_name || ' ' || COALESCE(u.last_name, '') AS student_name,
    es.standard_identifier,
    es.description AS standard_description,
    es.domain,
    es.subject_area,
    COUNT(asa.alignment_id) AS times_assessed,
    ROUND(AVG(g.percentage), 1) AS avg_score
FROM grades g
JOIN assignment_standard_alignments asa ON asa.grade_id = g.grade_id
JOIN educational_standards es ON es.standard_id = asa.standard_id
JOIN users u ON u.user_id = g.student_id
WHERE es.is_current = TRUE
GROUP BY g.student_id, u.first_name, u.last_name, es.standard_identifier, es.description, es.domain, es.subject_area;

-- Pedagogical tool effectiveness: which tools produce best scores
CREATE VIEW v_tool_effectiveness AS
SELECT
    pt.tool_name,
    pt.media_type,
    tm.method_name,
    COUNT(g.grade_id) AS uses,
    ROUND(AVG(g.percentage), 1) AS avg_score
FROM personalized_lesson_plans plp
JOIN pedagogical_tools pt ON pt.tool_id = plp.assigned_tool_id
JOIN grades g ON g.student_id = plp.student_id AND g.plan_id = plp.plan_id
LEFT JOIN student_learning_preferences slp ON slp.student_id = plp.student_id
LEFT JOIN teaching_methods tm ON tm.method_id = slp.best_method_id
GROUP BY pt.tool_name, pt.media_type, tm.method_name;


-- ═══════════════════════════════════════════════════════════════════
-- SCHEMA COMPLETE
-- 
-- Table Summary:
--   Domain 1 (Users):         users, students, teachers, parents
--   Domain 2 (Content):       courses, lessons, course_lessons, tests
--   Domain 3 (Tracking):      student_enrollments, personalized_lesson_plans,
--                              student_progress, grades
--   Domain 4 (Pedagogy):      teaching_methods, pedagogical_tools,
--                              tool_method_compatibility, student_learning_preferences
--   Domain 5 (Standards):     educational_standards, standard_documents,
--                              assignment_standard_alignments
--   Domain 6 (Metrics/Rpt):   teacher_defined_metrics, student_metric_values,
--                              metric_standard_alignments, reports
--
-- Views: v_student_performance, v_enrollment_progress, 
--        v_standards_mastery, v_tool_effectiveness
-- ═══════════════════════════════════════════════════════════════════
