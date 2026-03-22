CREATE TABLE IF NOT EXISTS auth_local_credentials (
    user_id              UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    password_hash        TEXT NOT NULL,
    password_updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_refresh_tokens (
    token_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id          UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash       TEXT NOT NULL,
    expires_at       TIMESTAMPTZ NOT NULL,
    revoked_at       TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_refresh_tokens_user_id
    ON api_refresh_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_api_refresh_tokens_expires_at
    ON api_refresh_tokens(expires_at);
