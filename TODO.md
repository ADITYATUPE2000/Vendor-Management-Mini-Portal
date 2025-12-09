# Task: Fix 404 Error for /api/auth/vendor Endpoint

## Problem
- Frontend is making a GET request to `http://localhost:5000/api/auth/vendor`
- Getting 404 (Not Found) error
- This suggests the backend endpoint doesn't exist or isn't properly routed

## Todo List
- [ ] Examine frontend code that makes the vendor auth request
- [ ] Check backend API structure and routing configuration
- [ ] Investigate existing auth endpoints in backend/api/auth.js
- [ ] Identify if vendor endpoint needs to be created or is missing from routing
- [ ] Implement or fix the missing /api/auth/vendor endpoint
- [ ] Update backend/routes.js if needed to include the vendor endpoint
- [ ] Test the fix by starting the backend server
- [ ] Verify the frontend can successfully call the endpoint

## Next Steps
1. Look at frontend/src/lib/queryClient.js to see the request
2. Check backend/api/auth.js for existing auth endpoints
3. Review backend/routes.js for routing configuration
4. Create or fix the missing vendor endpoint
