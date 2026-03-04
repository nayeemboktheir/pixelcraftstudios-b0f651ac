
UPDATE landing_pages
SET sections = jsonb_set(
  sections,
  '{7}',
  '{
    "id": "checkout-1",
    "type": "checkout-form",
    "order": 5,
    "settings": {
      "title": "অর্ডার করতে নিচের ফর্মটি পূরণ করুন",
      "buttonText": "অর্ডার কনফার্ম করুন",
      "accentColor": "#ef4444",
      "backgroundColor": "#f9fafb",
      "productIds": ["a1b2c3d4-e5f6-7890-abcd-ef1234567890"],
      "sizeOptions": ["S", "M", "L", "XL", "XXL", "3XL"]
    }
  }'::jsonb
)
WHERE id = '52f6581b-1bb2-4bc0-a9ab-19c77e7a2495';
