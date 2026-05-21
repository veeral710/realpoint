-- Sample Surat listings for Phase 1–2 validation (dev admin user)
-- Run after seed-dev-admin.sh; user: admin@realpoint.local

DO $$
DECLARE
  uid UUID;
  loc_adajan UUID;
  loc_vesu UUID;
  loc_varachha UUID;
  loc_palsana UUID;
  loc_katargam UUID;
BEGIN
  SELECT id INTO uid FROM auth.users WHERE email = 'admin@realpoint.local' LIMIT 1;
  IF uid IS NULL THEN
    RAISE NOTICE 'Skip seed listings: run pnpm seed:admin first';
    RETURN;
  END IF;

  SELECT id INTO loc_adajan FROM localities WHERE area_name = 'Adajan' LIMIT 1;
  SELECT id INTO loc_vesu FROM localities WHERE area_name = 'Vesu' LIMIT 1;
  SELECT id INTO loc_varachha FROM localities WHERE area_name = 'Varachha' LIMIT 1;
  SELECT id INTO loc_palsana FROM localities WHERE area_name = 'Palsana' LIMIT 1;
  SELECT id INTO loc_katargam FROM localities WHERE area_name = 'Katargam' LIMIT 1;

  INSERT INTO listings (
    user_id, intent, property_class, title, description, price, price_negotiable,
    area_value, area_unit, locality_id, contact_phone, contact_whatsapp, status
  ) VALUES
  (uid, 'sell', 'plot', 'NA Plot near Adajan Bridge', 'Clear title, road touch, ideal for residential bungalow.', 4500000, true, 120, 'sqyd', loc_adajan, '+919876543210', '+919876543210', 'published'),
  (uid, 'sell', 'agricultural', 'Agricultural land Palsana — 2 vigha', 'Irrigation available, peaceful location.', 2800000, true, 2, 'vigha', loc_palsana, '+919876543210', NULL, 'published'),
  (uid, 'rent', 'commercial', 'Shop on rent Varachha main road', 'Ground floor, parking for 2 wheelers.', 35000, false, 450, 'sqft', loc_varachha, '+919876543210', '+919876543210', 'published'),
  (uid, 'sell', 'house', '3 BHK independent house Vesu', 'Modular kitchen, bore well, society not applicable.', 12500000, true, 1800, 'sqft', loc_vesu, '+919876543210', '+919876543210', 'published'),
  (uid, 'sell', 'apartment', '2 BHK apartment Katargam — ready possession', '4th floor, lift, covered parking.', 5200000, true, 950, 'sqft', loc_katargam, '+919876543210', NULL, 'published'),
  (uid, 'sell', 'non_agricultural', 'NA land industrial zone Hazira road', 'Suitable for warehouse / small factory.', 8500000, true, 5000, 'sqm', loc_palsana, '+919876543210', '+919876543210', 'published'),
  (uid, 'rent', 'apartment', 'Furnished 1 BHK rent Vesu', 'Family preferred, no pets.', 18000, false, 650, 'sqft', loc_vesu, '+919876543210', '+919876543210', 'published'),
  (uid, 'sell', 'plot', 'Corner plot Adajan — TP road facing', 'Premium corner, all docs ready.', 6200000, true, 150, 'sqyd', loc_adajan, '+919876543210', NULL, 'published'),
  (uid, 'buy', 'plot', 'Wanted: plot in Vesu or Althan 100+ sqyd', 'Serious buyer, cash ready.', NULL, false, 100, 'sqyd', loc_vesu, '+919876543210', '+919876543210', 'published'),
  (uid, 'sell', 'commercial', 'Office space City Light area', 'Suitable for CA / small IT office.', 7500000, true, 1100, 'sqft', loc_adajan, '+919876543210', NULL, 'draft'),
  (uid, 'rent', 'house', '4 BHK bungalow rent Palsana highway', 'Gated feel, garden.', 45000, true, 2400, 'sqft', loc_palsana, '+919876543210', '+919876543210', 'published'),
  (uid, 'sell', 'mixed', 'Plot + old structure Varachha', 'Demolition possible, high potential.', 9800000, true, 200, 'sqyd', loc_varachha, '+919876543210', '+919876543210', 'published')
  ON CONFLICT DO NOTHING;
END $$;
