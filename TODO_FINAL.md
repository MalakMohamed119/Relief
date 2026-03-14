# TODO - Final Tasks

## Admin Dashboard 404 Error Fix

### Issue
- Admin dashboard and admin-applications were showing 404 errors for `/api/admin/applications/pending`

### Root Cause
- The backend API endpoint `/api/admin/applications/pending` does not exist
- The correct endpoint is `/api/admin/applications` with a query parameter `status=Pending`

### Fix Applied
- Updated `src/app/core/services/admin.service.ts`
- Changed `getPendingApplications()` method from:
  ```typescript
  return this.http.get<any>(`${this.apiUrl}/api/admin/applications/pending`);
  ```
  To:
  ```typescript
  return this.http.get<any>(`${this.apiUrl}/api/admin/applications`, {
    params: { status: 'Pending' }
  });
  ```

### Verification
- Tested endpoint: `curl -I "http://3.99.158.214:5000/api/admin/applications?status=Pending"`
- Result: HTTP/1.1 405 Method Not Allowed (with Allow: GET - meaning endpoint exists and GET is allowed)

### Status
- [x] Fixed the 404 error for admin applications endpoint

