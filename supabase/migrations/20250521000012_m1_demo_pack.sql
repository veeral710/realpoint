-- M1: Demo labeling, is_demo flags, extra mock content

ALTER TABLE news_items ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE tp_schemes ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT true;

UPDATE news_items SET title = '[Demo] ' || title
WHERE title NOT LIKE '[Demo]%' AND title NOT LIKE '[demo]%';

UPDATE tp_schemes SET name = '[Demo] ' || name
WHERE name NOT LIKE '[Demo]%' AND name NOT LIKE '[demo]%';

UPDATE listings SET title = '[Demo] ' || title
WHERE title NOT LIKE '[Demo]%' AND title NOT LIKE '[demo]%';

-- Extra news (area-tagged for filters / map)
INSERT INTO news_items (title, title_gu, summary, summary_gu, category, source_url, published_at, is_published, is_demo)
SELECT v.title, v.title_gu, v.summary, v.summary_gu, v.category::news_category, v.source_url,
  v.published_at::timestamptz, v.is_published, v.is_demo
FROM (VALUES
  (
    '[Demo] Vesu FSI clarification for mixed-use parcels',
    '[ડેમો] વેસુ મિશ્ર ઉપયોગ પાર્સલ માટે FSI સ્પષ્ટીકરણ',
    'Sample SUDA-style notice for Vesu corridor. Not an official publication.',
    'વેસુ કોરિડોર માટે નમૂના સુડા નોટિસ. અધિકૃત પ્રકાશન નથી.',
    'suda', 'https://example.com/demo/vesu-fsi', NOW() - INTERVAL '1 day', true, true
  ),
  (
    '[Demo] Adajan TP road widening impact notice',
    '[ડેમો] અડાજણ TP રોડ વિસ્તરણ અસર નોટિસ',
    'Mock infrastructure notice mentioning Adajan TP scheme boundaries.',
    'અડાજણ TP સીમા નમૂના મૉક નોટિસ.',
    'infrastructure', 'https://example.com/demo/adajan-road', NOW() - INTERVAL '3 days', true, true
  ),
  (
    '[Demo] Varachha industrial zone GST registration reminder',
    '[ડેમો] વરાછા ઔદ્યોગિક ઝોન GST નોંધણી',
    'Demo circular for Varachha traders — verify with official GST portal.',
    'વરાછા વેપારીઓ માટે ડેમો પરિપત્ર.',
    'gst_registration', 'https://example.com/demo/varachha-gst', NOW() - INTERVAL '4 days', true, true
  ),
  (
    '[Demo] Katargam revenue camp for 7/12 copies',
    '[ડેમો] કતારગામ 7/12 કેમ્પ',
    'Sample revenue department camp announcement for Surat city.',
    'સુરત શહેર માટે નમૂના રેવન્યુ કેમ્પ.',
    'revenue', 'https://example.com/demo/katargam-712', NOW() - INTERVAL '6 days', true, true
  ),
  (
    '[Demo] Palsana peri-urban TP draft objections window',
    '[ડેમો] પલસાણા TP આપત્તિઓ વિંડો',
    'Mock objection period for proposed Palsana TP — illustrative dates only.',
    'પલસાણા TP માટે નમૂના આપત્તિ સમયગાળો.',
    'suda', 'https://example.com/demo/palsana-tp', NOW() - INTERVAL '8 days', true, true
  ),
  (
    '[Demo] RERA: sample registered project list for Surat',
    '[ડેમો] રેરા: સુરત નમૂના પ્રોજેક્ટ',
    'Demo GUJRERA-style summary for app testing. Not live registry data.',
    'એપ ટેસ્ટ માટે નમૂના રેરા સારાંશ.',
    'rera', 'https://example.com/demo/rera-surat', NOW() - INTERVAL '9 days', true, true
  ),
  (
    '[Demo] Hazira-Kamrej corridor environmental clearance note',
    NULL,
    'Mock environmental notice linked to industrial corridor TP.',
    NULL,
    'infrastructure', 'https://example.com/demo/hazira-env', NOW() - INTERVAL '11 days', true, true
  ),
  (
    '[Demo] City Light drainage upgrade along TP boundary',
    '[ડેમો] સિટી લાઇટ ડ્રેનેજ અપગ્રેડ',
    'Sample SMC-style work notice near City Light TP overlay.',
    'સિટી લાઇટ TP નજીક નમૂના SMC નોટિસ.',
    'infrastructure', 'https://example.com/demo/citylight-drain', NOW() - INTERVAL '13 days', true, true
  ),
  (
    '[Demo] Udhna industrial estate fire safety compliance',
    NULL,
    'Demo safety circular for Udhna-Dindoli belt.',
    NULL,
    'general', 'https://example.com/demo/udhna-safety', NOW() - INTERVAL '14 days', true, true
  ),
  (
    '[Demo] Surat district stamp duty revision summary',
    '[ડેમો] સ્ટામ્પ ડ્યુટી સારાંશ',
    'Illustrative fee table for transaction planning workshops.',
    'નમૂના ફી સારાંશ.',
    'gst_registration', 'https://example.com/demo/stamp-duty', NOW() - INTERVAL '15 days', true, true
  )
) AS v(title, title_gu, summary, summary_gu, category, source_url, published_at, is_published, is_demo)
WHERE NOT EXISTS (
  SELECT 1 FROM news_items n WHERE n.title = v.title
);

-- Extra TP schemes
INSERT INTO tp_schemes (
  scheme_number, name, name_gu, status, taluka, area_name,
  description, source_url, center_lat, center_lng, boundary, overlay_color, sort_order, is_published, is_demo
)
SELECT
  t.scheme_number, t.name, t.name_gu, t.status::tp_scheme_status, t.taluka, t.area_name,
  t.description, t.source_url, t.center_lat, t.center_lng, t.boundary, t.overlay_color,
  t.sort_order, t.is_published, t.is_demo
FROM (VALUES
(
  'TP-9', '[Demo] Athwa TP Scheme', 'અથવા TP', 'final', 'Surat City', 'Athwa',
  'Sample TP overlay for Athwa — illustrative boundary only.',
  'https://example.com/demo/tp-athwa', 21.1780, 72.7980,
  ST_GeogFromText('POLYGON((72.782 21.165, 72.814 21.165, 72.814 21.192, 72.782 21.192, 72.782 21.165))'),
  '#7cb342', 9, true, true
),
(
  'TP-10', '[Demo] Rander TP Scheme', 'રાંદેર TP', 'proposed', 'Surat City', 'Rander',
  'Proposed TP sample for Rander area.',
  'https://example.com/demo/tp-rander', 21.2280, 72.5020,
  ST_GeogFromText('POLYGON((72.488 21.214, 72.518 21.214, 72.518 21.242, 72.488 21.242, 72.488 21.214))'),
  '#ff9800', 10, true, true
),
(
  'TP-11', '[Demo] Olpad TP Scheme', 'ઓલપાડ TP', 'draft', 'Olpad', 'Olpad',
  'Draft TP mock for Olpad taluka.',
  'https://example.com/demo/tp-olpad', 21.3280, 72.7480,
  ST_GeogFromText('POLYGON((72.732 21.312, 72.768 21.312, 72.768 21.344, 72.732 21.344, 72.732 21.312))'),
  '#9e9e9e', 11, true, true
),
(
  'TP-12', '[Demo] Magdalla TP Scheme', 'મગડલ્લા TP', 'final', 'Majura', 'Magdalla',
  'Sample TP near Magdalla port vicinity.',
  'https://example.com/demo/tp-magdalla', 21.1480, 72.6880,
  ST_GeogFromText('POLYGON((72.672 21.134, 72.706 21.134, 72.706 21.162, 72.672 21.162, 72.672 21.134))'),
  '#00897b', 12, true, true
),
(
  'TP-13', '[Demo] Sachin GIDC TP Scheme', 'સાચિન GIDC TP', 'final', 'Surat City', 'Sachin',
  'Industrial GIDC sample TP for Sachin.',
  'https://example.com/demo/tp-sachin', 21.0880, 72.8780,
  ST_GeogFromText('POLYGON((72.862 21.074, 72.896 21.074, 72.896 21.102, 72.862 21.102, 72.862 21.074))'),
  '#5c6bc0', 13, true, true
),
(
  'TP-14', '[Demo] Bardoli Road TP Scheme', 'બારડોલી રોડ TP', 'proposed', 'Kamrej', 'Bardoli Road',
  'Peri-urban proposed TP mock.',
  'https://example.com/demo/tp-bardoli', 21.2680, 72.9280,
  ST_GeogFromText('POLYGON((72.912 21.252, 72.948 21.252, 72.948 21.284, 72.912 21.284, 72.912 21.252))'),
  '#ab47bc', 14, true, true
),
(
  'TP-15', '[Demo] Dumas Coastal TP Scheme', 'દુમસ TP', 'draft', 'Surat City', 'Dumas',
  'Coastal belt draft TP for demo map density.',
  'https://example.com/demo/tp-dumas', 21.1180, 72.7280,
  ST_GeogFromText('POLYGON((72.712 21.104, 72.746 21.104, 72.746 21.132, 72.712 21.132, 72.712 21.104))'),
  '#26c6da', 15, true, true
)
) AS t(scheme_number, name, name_gu, status, taluka, area_name, description, source_url, center_lat, center_lng, boundary, overlay_color, sort_order, is_published, is_demo)
WHERE NOT EXISTS (SELECT 1 FROM tp_schemes s WHERE s.scheme_number = t.scheme_number);

-- Link listings to TP + coordinates
UPDATE listings l
SET
  tp_scheme_id = t.id,
  latitude = t.center_lat + 0.002,
  longitude = t.center_lng - 0.001
FROM tp_schemes t, localities loc
WHERE loc.id = l.locality_id
  AND l.tp_scheme_id IS NULL
  AND t.area_name = loc.area_name
  AND l.status = 'published';

-- Re-run geo backfill for news (including new rows)
UPDATE news_items n
SET
  tp_scheme_id = t.id,
  locality_id = loc.id,
  latitude = t.center_lat + 0.003,
  longitude = t.center_lng - 0.002
FROM tp_schemes t
JOIN localities loc ON loc.area_name = t.area_name AND loc.district = 'Surat'
WHERE n.latitude IS NULL
  AND (n.summary ILIKE '%' || t.area_name || '%' OR n.title ILIKE '%' || t.area_name || '%');

UPDATE news_items
SET latitude = 21.1702, longitude = 72.8311
WHERE latitude IS NULL AND is_published = true;
