UPDATE landing_pages
SET sections = sections || jsonb_build_array(jsonb_build_object(
  'id', gen_random_uuid()::text,
  'type', 'video',
  'order', extract(epoch from now())::bigint,
  'settings', jsonb_build_object(
    'videoUrl', 'https://gznyoajcwiuhrmwdmjfh.supabase.co/storage/v1/object/public/shop-assets/landing-pages/WhatsApp Video 2026-02-21 at 4.00.17 PM.mp4',
    'title', '',
    'autoplay', false,
    'controls', true,
    'loop', true,
    'backgroundColor', '#ffffff'
  )
))
WHERE slug = 'LP-premium-jubba';