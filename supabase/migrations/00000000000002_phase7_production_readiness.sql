-- =============================================================================
-- FOREIGNERS HUB: PHASE 7 - PRODUCTION READINESS
-- =============================================================================

-- Payment metadata needed for real local-transfer review.
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS payment_reference TEXT,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Dedicated rental extension lifecycle. Extensions belong to the existing
-- rental and do not create a second active bike rental.
DO $$ BEGIN
  CREATE TYPE rental_extension_status AS ENUM (
    'REQUESTED',
    'AWAITING_PAYMENT',
    'PAYMENT_SUBMITTED',
    'PAYMENT_VERIFIED',
    'APPROVED',
    'REJECTED',
    'CANCELLED'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS rental_extensions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rental_id UUID REFERENCES rentals(id) NOT NULL,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    pricing_plan_id UUID REFERENCES rental_pricing_plans(id) NOT NULL,
    payment_id UUID REFERENCES payments(id),
    current_end_date TIMESTAMPTZ NOT NULL,
    proposed_end_date TIMESTAMPTZ NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    deposit_amount NUMERIC(10, 2) DEFAULT 0 NOT NULL,
    status rental_extension_status DEFAULT 'AWAITING_PAYMENT' NOT NULL,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    payment_submitted_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES profiles(id),
    rejected_at TIMESTAMPTZ,
    rejected_by UUID REFERENCES profiles(id),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS one_pending_extension_per_rental
ON rental_extensions (rental_id)
WHERE status IN ('REQUESTED', 'AWAITING_PAYMENT', 'PAYMENT_SUBMITTED', 'PAYMENT_VERIFIED');

-- Idempotency table for scheduled rental reminders.
CREATE TABLE IF NOT EXISTS rental_notification_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rental_id UUID REFERENCES rentals(id) NOT NULL,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    event_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (rental_id, event_type)
);

ALTER TABLE rental_extensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_notification_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own rental extensions" ON rental_extensions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create own rental extensions" ON rental_extensions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users submit own rental extension payments" ON rental_extensions
FOR UPDATE
USING (auth.uid() = user_id AND status = 'AWAITING_PAYMENT')
WITH CHECK (auth.uid() = user_id AND status = 'PAYMENT_SUBMITTED');

CREATE POLICY "Admins manage rental extensions" ON rental_extensions
FOR ALL USING (is_admin());

CREATE POLICY "Users view own rental notification events" ON rental_notification_events
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins manage rental notification events" ON rental_notification_events
FOR ALL USING (is_admin());
