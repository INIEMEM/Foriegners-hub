-- Create site_settings table
CREATE TABLE site_settings (
    id TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id)
);

-- Seed initial settings
INSERT INTO site_settings (id, value) VALUES 
('contract_terms', '1. The renter agrees to take care of the bicycle and return it in the same condition.\n2. The renter is responsible for any damage or theft during the rental period.\n3. The renter must follow all local traffic laws and regulations.\n4. Foreigners Hub is not liable for any injuries sustained while using the bicycle.\n5. The deposit will be refunded upon the safe return of the bicycle.'),
('payment_instructions', 'Send payment proof to the official Foreigners Hub WhatsApp contact (+1 234 567 8900) or email support@foreignershub.com.')
ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON site_settings FOR ALL USING (is_admin());
