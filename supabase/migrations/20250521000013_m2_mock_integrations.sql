-- M2: Mock integrations — document requests, demo PDFs, sample inquiries

CREATE TYPE document_request_type AS ENUM ('seven_twelve', 'property_card');
CREATE TYPE document_request_status AS ENUM (
  'submitted',
  'contacted',
  'completed',
  'cancelled'
);

CREATE TABLE document_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  tp_scheme_id UUID REFERENCES tp_schemes(id) ON DELETE SET NULL,
  request_type document_request_type NOT NULL,
  survey_number TEXT,
  village_name TEXT,
  contact_phone TEXT,
  notes TEXT,
  status document_request_status NOT NULL DEFAULT 'submitted',
  reference_code TEXT NOT NULL,
  is_demo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_document_requests_user ON document_requests(user_id, created_at DESC);
CREATE INDEX idx_document_requests_status ON document_requests(status);

ALTER TABLE document_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users create own document requests"
  ON document_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own document requests"
  ON document_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admins update document requests"
  ON document_requests FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- Sample PDF links (public demo files)
UPDATE news_items
SET pdf_url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
WHERE id IN (
  SELECT id FROM news_items
  WHERE pdf_url IS NULL AND is_published = true
  ORDER BY published_at DESC
  LIMIT 5
);

UPDATE tp_schemes
SET pdf_url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
WHERE pdf_url IS NULL AND is_published = true;

-- Demo inquiries (listing owner = admin after seed)
DO $$
DECLARE
  admin_uid UUID;
  buyer_uid UUID;
  listing_rec RECORD;
  n INT := 0;
BEGIN
  SELECT id INTO admin_uid FROM auth.users WHERE email = 'admin@realpoint.local' LIMIT 1;
  SELECT id INTO buyer_uid FROM auth.users WHERE email = 'buyer@realpoint.local' LIMIT 1;
  IF admin_uid IS NULL OR buyer_uid IS NULL THEN
    RAISE NOTICE 'Skip demo inquiries: run seed-dev-users first';
    RETURN;
  END IF;

  FOR listing_rec IN
    SELECT id FROM listings
    WHERE user_id = admin_uid AND status = 'published'
    ORDER BY created_at DESC
    LIMIT 3
  LOOP
    n := n + 1;
    INSERT INTO listing_inquiries (listing_id, user_id, message, contact_phone)
    VALUES (
      listing_rec.id,
      buyer_uid,
      CASE n
        WHEN 1 THEN 'I would like to visit this property on Saturday. Is morning OK?'
        WHEN 2 THEN 'Please share NA status and latest 7/12 copy if available.'
        ELSE 'What is the best price for quick closure?'
      END,
      '+919800000001'
    );
  END LOOP;
END $$;
