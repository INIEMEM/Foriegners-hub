-- =============================================================================
-- FOREIGNERS HUB: PHASE 2 - DATABASE SCHEMA
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
CREATE TYPE bike_status AS ENUM ('AVAILABLE', 'RESERVED', 'RENTED', 'MAINTENANCE', 'INACTIVE');
CREATE TYPE apartment_status AS ENUM ('AVAILABLE', 'RENTED', 'MAINTENANCE', 'INACTIVE');
CREATE TYPE rental_status AS ENUM ('PENDING', 'CONTRACT_PENDING', 'AWAITING_PAYMENT', 'PAYMENT_SUBMITTED', 'PAYMENT_VERIFIED', 'ACTIVE', 'EXPIRED', 'CANCELLED');
CREATE TYPE rental_type AS ENUM ('NEW', 'RENEWAL');
CREATE TYPE payment_status AS ENUM ('AWAITING_PAYMENT', 'PAYMENT_SUBMITTED', 'VERIFIED', 'REJECTED');
CREATE TYPE contract_status AS ENUM ('PENDING', 'SIGNED', 'EXPIRED', 'CANCELLED');
CREATE TYPE repair_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- =============================================================================
-- TABLES
-- =============================================================================

-- 1. PROFILES (Linked to auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'USER' NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to automatically create a profile when a new auth.user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (new.id, new.email, 'USER');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. BIKE CATEGORIES
CREATE TABLE bike_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BIKES
CREATE TABLE bikes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    b_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category_id UUID REFERENCES bike_categories(id),
    description TEXT,
    specifications JSONB,
    image_url TEXT,
    status bike_status DEFAULT 'AVAILABLE' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. APARTMENT CATEGORIES
CREATE TABLE apartment_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. APARTMENTS
CREATE TABLE apartments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category_id UUID REFERENCES apartment_categories(id),
    description TEXT,
    location TEXT,
    price_info JSONB,
    bedrooms INTEGER,
    amenities JSONB,
    image_urls TEXT[],
    status apartment_status DEFAULT 'AVAILABLE' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RENTAL PRICING PLANS
CREATE TABLE rental_pricing_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    duration_weeks INTEGER,
    duration_months INTEGER,
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. RENTALS (Supports both Bikes and Apartments)
CREATE TABLE rentals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    bike_id UUID REFERENCES bikes(id),
    apartment_id UUID REFERENCES apartments(id),
    pricing_plan_id UUID REFERENCES rental_pricing_plans(id),
    status rental_status DEFAULT 'PENDING' NOT NULL,
    type rental_type DEFAULT 'NEW' NOT NULL,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    total_amount NUMERIC(10, 2) NOT NULL,
    deposit_amount NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT one_service_only CHECK (
        (bike_id IS NOT NULL AND apartment_id IS NULL) OR 
        (bike_id IS NULL AND apartment_id IS NOT NULL)
    )
);

-- Enforce business rule: A user may have only ONE ACTIVE BIKE RENTAL at a time.
-- Active means any status other than EXPIRED or CANCELLED.
CREATE UNIQUE INDEX one_active_bike_rental_per_user 
ON rentals (user_id) 
WHERE bike_id IS NOT NULL AND status NOT IN ('EXPIRED', 'CANCELLED');

-- 8. PAYMENTS
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rental_id UUID REFERENCES rentals(id) NOT NULL,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payment_date TIMESTAMPTZ,
    status payment_status DEFAULT 'AWAITING_PAYMENT' NOT NULL,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CONTRACTS
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rental_id UUID REFERENCES rentals(id) NOT NULL,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    version TEXT NOT NULL,
    signed_at TIMESTAMPTZ,
    signer_name TEXT,
    signature_data TEXT,
    document_path TEXT,
    status contract_status DEFAULT 'PENDING' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. REPAIR SERVICES
CREATE TABLE repair_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. REPAIR REQUESTS
CREATE TABLE repair_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    bike_id UUID REFERENCES bikes(id) NOT NULL,
    service_id UUID REFERENCES repair_services(id),
    description TEXT,
    status repair_status DEFAULT 'PENDING' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- SEED DATA
-- =============================================================================

INSERT INTO rental_pricing_plans (name, duration_weeks, duration_months, total_price) VALUES
('1 Week', 1, 0, 55.00),
('2 Weeks', 2, 0, 110.00),
('3 Weeks', 3, 0, 150.00),
('4 Weeks / 1 Month', 4, 1, 170.00),
('2 Months', 0, 2, 340.00),
('3 Months', 0, 3, 450.00)
ON CONFLICT DO NOTHING;

INSERT INTO repair_services (name, description) VALUES
('Brake pad replacement', 'Replacement of worn out brake pads.'),
('Brake adjustment', 'Adjusting brake tension and alignment.'),
('Tire repair', 'Patching or repairing a punctured tire.'),
('Tube replacement', 'Replacing a damaged inner tube.'),
('Chain service', 'Cleaning, lubricating, and adjusting the bike chain.'),
('Other', 'Any other repair service required.')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bike_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE bikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users read own, Admins read/write all
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins have full access to profiles" ON profiles FOR ALL USING (is_admin());

-- Publicly readable entities (Bikes, Apartments, Pricing, Categories, Repair Services)
CREATE POLICY "Public can view bike categories" ON bike_categories FOR SELECT USING (true);
CREATE POLICY "Admins manage bike categories" ON bike_categories FOR ALL USING (is_admin());

CREATE POLICY "Public can view bikes" ON bikes FOR SELECT USING (true);
CREATE POLICY "Admins manage bikes" ON bikes FOR ALL USING (is_admin());

CREATE POLICY "Public can view apartment categories" ON apartment_categories FOR SELECT USING (true);
CREATE POLICY "Admins manage apartment categories" ON apartment_categories FOR ALL USING (is_admin());

CREATE POLICY "Public can view apartments" ON apartments FOR SELECT USING (true);
CREATE POLICY "Admins manage apartments" ON apartments FOR ALL USING (is_admin());

CREATE POLICY "Public can view pricing plans" ON rental_pricing_plans FOR SELECT USING (true);
CREATE POLICY "Admins manage pricing plans" ON rental_pricing_plans FOR ALL USING (is_admin());

CREATE POLICY "Public can view repair services" ON repair_services FOR SELECT USING (true);
CREATE POLICY "Admins manage repair services" ON repair_services FOR ALL USING (is_admin());

-- Rentals, Payments, Contracts, Repair Requests, Notifications (Users read/write own, Admins read/write all)
CREATE POLICY "Users view own rentals" ON rentals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own rentals" ON rentals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage rentals" ON rentals FOR ALL USING (is_admin());

CREATE POLICY "Users view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage payments" ON payments FOR ALL USING (is_admin());

CREATE POLICY "Users view own contracts" ON contracts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own contracts" ON contracts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own contracts" ON contracts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins manage contracts" ON contracts FOR ALL USING (is_admin());

CREATE POLICY "Users view own repair requests" ON repair_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own repair requests" ON repair_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage repair requests" ON repair_requests FOR ALL USING (is_admin());

CREATE POLICY "Users view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins manage notifications" ON notifications FOR ALL USING (is_admin());
