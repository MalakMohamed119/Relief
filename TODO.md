# Fix Angular & SCSS Warnings TODO

## Steps:
- [x] 1. Edit src/app/features/psw/components/offers/offers.html: Replace 3x offer.shifts?.length → offer.shifts.length
- [x] 2. Edit src/app/features/careHome/components/care-home-profile/care-home-profile.scss: Add @use 'sass:color'; + replace 2x darken($success-color, 10%)
- [x] 3. Edit src/app/features/careHome/components/notifications/notifications.scss: Add @use + replace 3x darken()
- [x] 4. Edit src/app/features/psw/components/psw-profile/psw-profile.scss: Add @use + replace 2x darken($success-color, 10%)
- [x] 5. Verify: ng build && check no warnings
- [x] 6. Complete task
