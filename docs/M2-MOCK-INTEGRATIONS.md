# M2 — Mock integrations

No real govt APIs, SMS, or WhatsApp Business — flows are real in the UI and stored in Supabase.

## Features

| Feature | Mobile | Admin |
|---------|--------|-------|
| 7/12 / property card request | Account → Request 7/12 | `/admin/document-requests` |
| Listing inquiries | Property detail → Send inquiry | `/admin/inquiries` |
| Seller inbox | Account → Inquiries on my listings | (same table) |
| WhatsApp | Property → WhatsApp (confirm dialog in dev) | — |
| Demo push | Account → Demo notice alert | Local notification in ~3s |
| Sample PDF | News / TP scheme “Open PDF” | Seeded dummy PDF URL |

## Apply DB

```bash
supabase migration up   # 20250521000013_m2_mock_integrations.sql
pnpm seed:m2            # demo inquiries (needs admin + buyer users)
```

Or full reset:

```bash
pnpm demo:reset
```

## Test script

1. Login **buyer@realpoint.local** → open a listing → **Send inquiry**
2. Login **admin@realpoint.local** → Account → **Inquiries on my listings** (3 demo messages)
3. Account → **Request 7/12** → submit → note reference `DEMO-…`
4. Admin web → **7/12 requests** table shows the row
5. Account → **Demo notice alert** → allow notifications → sample banner in 3s
6. TP scheme detail → **View sample scheme PDF**
