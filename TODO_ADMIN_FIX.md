# Fix Admin Applications Approve/Reject Buttons Not Working

## Current Status
- Frontend complete (per TODO_ADMIN_APPROVE.md)
- Models/service correct
- Likely backend API issue or no data

## Steps to Complete:
1. [x] **Add debug logs & fix ID field** - Changed to jobRequestId (buttons now use correct UUID)
2. [x] **Test app** - Confirmed: apps load, jobRequestId valid, API calls correct
3. **Verify data** - Do pending apps load with applicationId?
4. **Check API** - Network tab: GET /api/admin/applications?status=Pending + POST approve/reject
5. **Backend check** - If 404/500, endpoints missing on server
6. **Fix & test** - Update based on results
7. **Mark complete**

**Run:** `ng serve` then test buttons, paste console output.

Updated when step done.

