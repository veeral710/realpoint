# RealPoint Beta Launch Checklist

## Pre-launch

- [ ] Supabase production project with migrations applied
- [ ] Phone OTP tested on Android and iOS physical devices
- [ ] `listing-images` storage bucket public read verified
- [ ] Admin CMS: create/edit news at `/admin`
- [ ] 10+ news items visible (seed migration or manual)
- [ ] 5+ test listings posted from mobile (with GPS pin where possible)
- [ ] Map tab: TP overlay, property pins, TP directory
- [ ] Disclaimer shown on first app open
- [ ] Privacy policy URL live (required by stores)

## Play Store (internal track)

1. `cd apps/mobile && eas build -p android --profile preview`
2. Create application `com.realpoint.surat`
3. Store listing: screenshots, short description, full description
4. Content rating questionnaire
5. Upload AAB → Internal testing → invite testers
6. **Goal:** 500 installs in Surat (marketing + broker partners)

## TestFlight

1. `eas build -p ios --profile preview`
2. `eas submit -p ios`
3. Add external testers (up to 10,000)
4. Monitor crash logs in App Store Connect

## Metrics (week 4–12)

| Metric | Target |
|--------|--------|
| Installs (Surat) | 500+ |
| D7 retention (news users) | 30% |
| Active published listings | 50+ |
| Crash-free sessions | 99%+ |

## Post-beta

- Expand districts (Tapi, Bharuch, Navsari)
- TP map strategy (partner vs build)
- Boosted listings monetization
