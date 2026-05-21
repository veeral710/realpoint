-- Seed Surat TP schemes (approximate centers + bounds for map overlay demo)
-- Coordinates are indicative for development; verify with official SUDA sheets.

INSERT INTO tp_schemes (
  scheme_number, name, name_gu, status, taluka, area_name,
  description, source_url, center_lat, center_lng, boundary, overlay_color, sort_order, is_published
) VALUES
(
  'TP-1', 'Adajan TP Scheme', 'અડાજણ ટી.પી.', 'final', 'Surat City', 'Adajan',
  'Town Planning Scheme for Adajan area — verify plot numbers with official SUDA publication.',
  'https://www.sudaonline.org', 21.1958, 72.5801,
  ST_GeogFromText('POLYGON((72.565 21.185, 72.595 21.185, 72.595 21.208, 72.565 21.208, 72.565 21.185))'),
  '#2e7d52', 1, true
),
(
  'TP-2', 'Vesu TP Scheme', 'વેસુ ટી.પી.', 'final', 'Surat City', 'Vesu',
  'Vesu zone TP — popular residential and commercial development area.',
  'https://www.sudaonline.org', 21.1412, 72.7749,
  ST_GeogFromText('POLYGON((72.758 21.128, 72.792 21.128, 72.792 21.155, 72.758 21.155, 72.758 21.128))'),
  '#3d8b5f', 2, true
),
(
  'TP-3', 'Varachha TP Scheme', 'વરાછા ટી.પી.', 'final', 'Surat City', 'Varachha',
  'Varachha industrial and residential TP overlay.',
  'https://www.sudaonline.org', 21.2140, 72.8400,
  ST_GeogFromText('POLYGON((72.822 21.200, 72.858 21.200, 72.858 21.228, 72.822 21.228, 72.822 21.200))'),
  '#1b6b4a', 3, true
),
(
  'TP-4', 'Katargam TP Scheme', 'કતારગામ ટી.પી.', 'final', 'Surat City', 'Katargam',
  'Katargam TP scheme near central Surat corridors.',
  'https://www.sudaonline.org', 21.2320, 72.8200,
  ST_GeogFromText('POLYGON((72.805 21.218, 72.838 21.218, 72.838 21.246, 72.805 21.246, 72.805 21.218))'),
  '#4a9e6a', 4, true
),
(
  'TP-5', 'Palsana TP Scheme', 'પલસાણા ટી.પી.', 'proposed', 'Choryasi', 'Palsana',
  'Peri-urban TP near Palsana — check final notification status.',
  'https://www.sudaonline.org', 21.4180, 72.9080,
  ST_GeogFromText('POLYGON((72.890 21.402, 72.928 21.402, 72.928 21.434, 72.890 21.434, 72.890 21.402))'),
  '#e6a23c', 5, true
),
(
  'TP-6', 'Dindoli-Udhna TP Scheme', 'દિંડોલી-ઉધના ટી.પી.', 'final', 'Surat City', 'Udhna',
  'Industrial belt TP scheme Dindoli-Udhna corridor.',
  'https://www.sudaonline.org', 21.1680, 72.8620,
  ST_GeogFromText('POLYGON((72.845 21.152, 72.880 21.152, 72.880 21.184, 72.845 21.184, 72.845 21.152))'),
  '#5c6bc0', 6, true
),
(
  'TP-7', 'City Light-Bhestan TP Scheme', 'સિટી લાઇટ-ભેસ્તાન ટી.પી.', 'final', 'Surat City', 'City Light',
  'Western Surat TP covering City Light and Bhestan vicinity.',
  'https://www.sudaonline.org', 21.2080, 72.5480,
  ST_GeogFromText('POLYGON((72.532 21.194, 72.566 21.194, 72.566 21.222, 72.532 21.222, 72.532 21.194))'),
  '#26a69a', 7, true
),
(
  'TP-8', 'Hazira-Kamrej Corridor TP', 'હઝીરા-કામરેજ ટી.પી.', 'proposed', 'Choryasi', 'Hazira',
  'Industrial corridor TP toward Hazira port area.',
  'https://www.sudaonline.org', 21.2380, 72.6480,
  ST_GeogFromText('POLYGON((72.628 21.220, 72.670 21.220, 72.670 21.256, 72.628 21.256, 72.628 21.220))'),
  '#8d6e63', 8, true
);

INSERT INTO villages (district, taluka, name, name_gu, center_lat, center_lng, boundary, is_published) VALUES
(
  'Surat', 'Olpad', 'Sayli', 'સાયલી', 21.4520, 72.9820,
  ST_GeogFromText('POLYGON((72.968 21.438, 72.998 21.438, 72.998 21.466, 72.968 21.466, 72.968 21.438))'),
  true
),
(
  'Surat', 'Choryasi', 'Kim', 'કીમ', 21.3580, 72.7120,
  ST_GeogFromText('POLYGON((72.698 21.344, 72.728 21.344, 72.728 21.372, 72.698 21.372, 72.698 21.344))'),
  true
);
