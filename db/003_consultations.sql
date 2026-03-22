CREATE TABLE IF NOT EXISTS consultation_requests (
    consultation_request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_name             VARCHAR(200) NOT NULL,
    email                   VARCHAR(255) NOT NULL,
    phone                   VARCHAR(30),
    child_name              VARCHAR(200),
    child_age               VARCHAR(30),
    child_grade_level       VARCHAR(30),
    goals                   TEXT NOT NULL,
    challenges              TEXT,
    source_page             VARCHAR(100) DEFAULT 'contact',
    status                  VARCHAR(30) NOT NULL DEFAULT 'new',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultation_requests_email
    ON consultation_requests(email);

CREATE INDEX IF NOT EXISTS idx_consultation_requests_status
    ON consultation_requests(status);
