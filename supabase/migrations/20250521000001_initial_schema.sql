-- RealPoint initial schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'agent');
CREATE TYPE news_category AS ENUM (
  'suda', 'revenue', 'rera', 'gst_registration', 'infrastructure', 'general'
);
CREATE TYPE listing_intent AS ENUM ('buy', 'sell', 'rent');
CREATE TYPE property_class AS ENUM (
  'agricultural', 'non_agricultural', 'plot', 'house', 'apartment',
  'commercial', 'industrial', 'mixed'
);
CREATE TYPE area_unit AS ENUM (
  'sqft', 'sqm', 'sqyd', 'acre', 'hectare', 'guntha', 'vigha'
);
CREATE TYPE listing_status AS ENUM ('draft', 'published', 'archived', 'reported');

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'buyer',
  company_name TEXT,
  rera_id TEXT,
  disclaimer_accepted_at TIMESTAMPTZ,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Localities
CREATE TABLE localities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district TEXT NOT NULL,
  taluka TEXT,
  area_name TEXT NOT NULL,
  area_name_gu TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_localities_district ON localities(district);
CREATE INDEX idx_localities_area ON localities(area_name);

-- News
CREATE TABLE news_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  title_gu TEXT,
  summary TEXT NOT NULL,
  summary_gu TEXT,
  category news_category NOT NULL DEFAULT 'general',
  source_url TEXT,
  pdf_url TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_news_published ON news_items(is_published, published_at DESC);
CREATE INDEX idx_news_category ON news_items(category);

-- Listings
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  intent listing_intent NOT NULL,
  property_class property_class NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(15, 2),
  price_negotiable BOOLEAN NOT NULL DEFAULT TRUE,
  area_value NUMERIC(15, 4),
  area_unit area_unit,
  locality_id UUID REFERENCES localities(id),
  address_text TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  na_status TEXT,
  road_width_ft NUMERIC(8, 2),
  zone_name TEXT,
  survey_number TEXT,
  bhk INT,
  floor_number INT,
  furnishing TEXT,
  building_age_years INT,
  parking BOOLEAN,
  contact_phone TEXT,
  contact_whatsapp TEXT,
  status listing_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listings_status ON listings(status, created_at DESC);
CREATE INDEX idx_listings_user ON listings(user_id);
CREATE INDEX idx_listings_filters ON listings(intent, property_class, locality_id);

-- Listing media
CREATE TABLE listing_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inquiries
CREATE TABLE listing_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  contact_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Saved items (bookmarks)
CREATE TABLE saved_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  news_item_id UUID REFERENCES news_items(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT saved_items_target CHECK (
    (news_item_id IS NOT NULL AND listing_id IS NULL) OR
    (news_item_id IS NULL AND listing_id IS NOT NULL)
  ),
  UNIQUE (user_id, news_item_id),
  UNIQUE (user_id, listing_id)
);

-- Reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Push tokens
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, token)
);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER news_items_updated_at BEFORE UPDATE ON news_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-create profile on signup (must use public schema from auth trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, full_name)
  VALUES (
    NEW.id,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE localities ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Helper: is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid()),
    FALSE
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON profiles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Localities: public read
CREATE POLICY "Localities are public"
  ON localities FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admins manage localities"
  ON localities FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- News: public read published
CREATE POLICY "Published news is public"
  ON news_items FOR SELECT TO anon, authenticated
  USING (is_published = true OR is_admin());

CREATE POLICY "Admins manage news"
  ON news_items FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- Listings
CREATE POLICY "Published listings are public"
  ON listings FOR SELECT TO anon, authenticated
  USING (status = 'published' OR user_id = auth.uid() OR is_admin());

CREATE POLICY "Users manage own listings"
  ON listings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own listings"
  ON listings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users delete own listings"
  ON listings FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR is_admin());

-- Listing media
CREATE POLICY "Media visible with listing"
  ON listing_media FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings l
      WHERE l.id = listing_id
      AND (l.status = 'published' OR l.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Owners manage media"
  ON listing_media FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings l
      WHERE l.id = listing_id AND (l.user_id = auth.uid() OR is_admin())
    )
  );

-- Inquiries
CREATE POLICY "Users create inquiries"
  ON listing_inquiries FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Listing owners see inquiries"
  ON listing_inquiries FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings l
      WHERE l.id = listing_id AND (l.user_id = auth.uid() OR is_admin())
    )
    OR user_id = auth.uid()
  );

-- Saved items
CREATE POLICY "Users manage own saves"
  ON saved_items FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Reports
CREATE POLICY "Authenticated users can report"
  ON reports FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins view reports"
  ON reports FOR SELECT TO authenticated
  USING (is_admin());

-- Push tokens
CREATE POLICY "Users manage own push tokens"
  ON push_tokens FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Storage buckets (run via dashboard or seed)
-- listing-images: public read, authenticated upload to own folder
