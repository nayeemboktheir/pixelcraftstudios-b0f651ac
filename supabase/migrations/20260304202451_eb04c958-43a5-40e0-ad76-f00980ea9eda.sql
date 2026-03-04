
UPDATE landing_pages
SET sections = (
  SELECT jsonb_agg(
    CASE 
      WHEN elem->>'type' = 'size-chart' THEN
        jsonb_set(elem, '{settings,sizes}', '[
          {"size": "M", "chest": "42", "length": "50", "sleeve": "23"},
          {"size": "L", "chest": "44", "length": "52", "sleeve": "23.5"},
          {"size": "XL", "chest": "46", "length": "54", "sleeve": "24"},
          {"size": "XXL", "chest": "48", "length": "56", "sleeve": "24.5"}
        ]'::jsonb)
      ELSE elem
    END
  )
  FROM jsonb_array_elements(sections) AS elem
)
WHERE slug = 'LP-premium-jubba';
