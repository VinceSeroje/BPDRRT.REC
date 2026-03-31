# MCGI DRRT-RACS Bug Fixes

## Issue 1: Member Profile Picture in Header
- [x] Investigate why member login shows admin profile picture in header
- [x] Fix profile picture display logic - Added updateHeaderPhoto() call in login functions

## Issue 2: Update Member Not Working
- [x] Investigate edit member form submission - Working correctly
- [x] Test member update process - Working correctly
- [x] Test profile picture update functionality via file upload - Working correctly

## Summary of Fixes Applied:
1. Added `updateHeaderPhoto(admin.photo, admin.name)` call in admin login function (line ~289)
2. Added `updateHeaderPhoto(member.photo, member.name)` call in member login function (line ~331)

These fixes ensure that when a user logs in, their profile photo is immediately displayed in the header, rather than waiting for a page refresh.