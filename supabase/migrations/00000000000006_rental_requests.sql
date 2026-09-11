-- =============================================================================
-- FOREIGNERS HUB: RENTAL REQUESTS / LEADS
-- =============================================================================

CREATE TABLE IF NOT EXISTS rental_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    plan_type TEXT NOT NULL,
    plan_label TEXT,
    start_date DATE,
    bike_id UUID REFERENCES bikes(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'NEW' NOT NULL, -- 'NEW', 'CONTACTED', 'CONVERTED', 'ARCHIVED'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for admin filtering
CREATE INDEX IF NOT EXISTS idx_rental_requests_status ON rental_requests(status);
CREATE INDEX IF NOT EXISTS idx_rental_requests_created_at ON rental_requests(created_at DESC);

-- Enable RLS
ALTER TABLE rental_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can insert rental requests" ON rental_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins have full access to rental requests" ON rental_requests
    FOR ALL USING (is_admin());
