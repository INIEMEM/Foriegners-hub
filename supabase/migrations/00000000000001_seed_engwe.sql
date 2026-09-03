-- Create category for Electric Bikes
INSERT INTO bike_categories (id, name, description) 
VALUES ('c1b48b52-f6cb-4a25-a13a-c8a74e1d7cf1', 'Electric Bicycle', 'E-bikes for effortless city commuting.')
ON CONFLICT (name) DO NOTHING;

-- Insert Engwe M20
INSERT INTO bikes (b_code, name, category_id, description, image_url, status)
VALUES (
  'B-ENGWE-001',
  'ENGWE M20',
  (SELECT id FROM bike_categories WHERE name = 'Electric Bicycle' LIMIT 1),
  'The ENGWE M20 is a powerful and reliable electric bike suitable for city commutes and comfortable rides.',
  '/images/engwe-m20.jpg',
  'AVAILABLE'
)
ON CONFLICT (b_code) DO NOTHING;
