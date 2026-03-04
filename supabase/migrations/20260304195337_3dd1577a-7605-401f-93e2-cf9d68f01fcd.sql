
-- Insert the Jubba product
INSERT INTO products (id, name, slug, description, price, original_price, stock, is_active, is_featured, images)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'প্রিমিয়াম Islamic জুব্বা',
  'premium-islamic-jubba',
  'নরম ও গ্লেজি ফিনিশের চায়না মাইক্রো স্টিজ ফ্যাব্রিকে তৈরি',
  1700,
  NULL,
  100,
  true,
  true,
  ARRAY[
    'https://gznyoajcwiuhrmwdmjfh.supabase.co/storage/v1/object/public/shop-assets/landing%2Fjubba-maroon.jpeg',
    'https://gznyoajcwiuhrmwdmjfh.supabase.co/storage/v1/object/public/shop-assets/landing%2Fjubba-black.jpeg',
    'https://gznyoajcwiuhrmwdmjfh.supabase.co/storage/v1/object/public/shop-assets/landing%2Fjubba-white.jpeg'
  ]
);

-- Insert color variations
INSERT INTO product_variations (product_id, name, price, stock, sort_order, is_active) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Red', 1700, 50, 1, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Black', 1700, 50, 2, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'White', 1700, 50, 3, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Maroon', 1700, 50, 4, true);
