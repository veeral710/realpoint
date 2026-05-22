-- M3: Idempotent demo pack reload (inquiries) callable from admin UI

CREATE OR REPLACE FUNCTION public.reload_demo_pack()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_uid UUID;
  buyer_uid UUID;
  listing_rec RECORD;
  n INT := 0;
  inserted INT := 0;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Admin only';
  END IF;

  SELECT id INTO admin_uid FROM auth.users WHERE email = 'admin@realpoint.local' LIMIT 1;
  SELECT id INTO buyer_uid FROM auth.users WHERE email = 'buyer@realpoint.local' LIMIT 1;

  IF admin_uid IS NULL OR buyer_uid IS NULL THEN
    RETURN jsonb_build_object(
      'ok', false,
      'message', 'Run pnpm seed:users after demo:reset (admin + buyer missing)'
    );
  END IF;

  DELETE FROM listing_inquiries
  WHERE user_id = buyer_uid
    AND message LIKE '%visit this property on Saturday%';

  FOR listing_rec IN
    SELECT id FROM listings
    WHERE user_id = admin_uid AND status = 'published'
    ORDER BY created_at DESC
    LIMIT 3
  LOOP
    n := n + 1;
    INSERT INTO listing_inquiries (listing_id, user_id, message, contact_phone)
    SELECT
      listing_rec.id,
      buyer_uid,
      CASE n
        WHEN 1 THEN 'I would like to visit this property on Saturday. Is morning OK?'
        WHEN 2 THEN 'Please share NA status and latest 7/12 copy if available.'
        ELSE 'What is the best price for quick closure?'
      END,
      '+919800000001'
    WHERE NOT EXISTS (
      SELECT 1 FROM listing_inquiries li
      WHERE li.listing_id = listing_rec.id AND li.user_id = buyer_uid
    );

    IF FOUND THEN
      inserted := inserted + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'ok', true,
    'inquiries_inserted', inserted,
    'message', format('Demo inquiries refreshed (%s new)', inserted)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.reload_demo_pack() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reload_demo_pack() TO authenticated;
