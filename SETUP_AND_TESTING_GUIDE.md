# Complete Setup & Testing Guide

## 🚀 Quick Start (After Fixes Applied)

### Step 1: Verify Environment Variables

**Check `/server/.env`:**
```env
MONGO_URL=mongodb+srv://ashishlukka:jarvis@cluster0.660fyyc.mongodb.net/?appName=Cluster0
PORT=5000
JWT_SECRET=jarvis_app_secret_key_2024_production

HF_TOKEN=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
GOOGLE_API_KEY=AIzaSyCPjLCfMJ2HWob0OIKjf9BNVlbtlGmrPks
```

### Step 2: Clear Old Database (Optional but Recommended)

If you had duplicate email issues, delete old MongoDB documents:
1. Go to MongoDB Atlas dashboard
2. Navigate to Collections
3. Drop the `users` collection
4. OR Delete individual test documents with old emails

### Step 3: Start Server

```bash
cd server
npm install  # if needed
npm start
```

Expected output:
```
✓ Server running on port 5000
✓ Environment: development
MongoDB Connected successfully
```

### Step 4: Start Client

In a new terminal:
```bash
cd client
npm install  # if needed
npm run dev
```

Expected output:
```
VITE v7.3.1  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

### Step 5: Test Authentication

Open browser DevTools (F12) → Console tab

#### Test 1: Signup
```
1. Navigate to http://localhost:5173/login
2. Enter:
   - Full Name: "John Doe"
   - Email: "john@example.com"
   - Password: "password123"
3. Click "CREATE ACCOUNT"
```

Expected Console Output:
```
✓ Successful signup
✓ Redirected to /dashboard
✓ Token stored in localStorage
```

localStorage should contain:
```javascript
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "userId": "507f1f77bcf86cd799439011",
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "isGuest": "false"
}
```

#### Test 2: Logout & Login
```
1. Go to Navbar, click Logout
2. Verify redirected to home page
3. Go back to /login
4. Click "Login" tab
5. Enter the same email and password
6. Click "Login"
```

Expected:
```
✓ Successfully logged in
✓ Redirected to /dashboard
✓ Same token in localStorage (or new one)
```

#### Test 3: Guest Login
```
1. Go to http://localhost:5173/login
2. Click "CONTINUE AS GUEST"
```

Expected:
```
✓ Guest account created
✓ Redirected to /dashboard
✓ isGuest = "true" in localStorage
```

#### Test 4: Error Handling

**Try duplicate email:**
- Sign up with same email again
- Expected: "Email already registered. Please login instead."
- Form auto-switches to login

**Try invalid email:**
- Email field: "notanemail"
- Password: "password123"
- Click Create Account
- Expected: "Please provide a valid email address"

**Try short password:**
- Email: "test@example.com"
- Password: "123"
- Expected: "Password must be at least 6 characters"

**Try wrong password:**
- Email: "john@example.com"
- Password: "wrongpassword"
- Click Login
- Expected: "Invalid email or password"

## 🔍 Server-Side Verification

### Check Server Logs

When testing, server console should show:
```
POST /api/users/signup 201
POST /api/users/login 200
POST /api/users/guest 201
GET /api/users/profile 200
```

### Test Health Endpoint

```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "Server is running",
  "port": 5000
}
```

### Test API Directly

**Using curl or Postman:**

```bash
# Test Signup
curl -X POST http://localhost:5000/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "isGuest": false
  }
}
```

```bash
# Test Login
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

## 📊 Testing Scenarios

### Scenario 1: New User Signup Flow
```
Landing Page
    ↓
Click "Get Started"
    ↓
Login Page (Signup tab active)
    ↓
Enter name, email, password
    ↓
Click "CREATE ACCOUNT"
    ↓
Server validates input ✓
Server checks duplicate email ✓
Server hashes password ✓
Server creates user in DB ✓
Server generates JWT token ✓
    ↓
Client receives token
    ↓
Client saves to localStorage
    ↓
Client redirects to /dashboard ✓
```

### Scenario 2: Returning User Login Flow
```
Login Page (Login tab active)
    ↓
Enter email, password
    ↓
Click "Login"
    ↓
Server finds user in DB ✓
Server validates password ✓
Server generates JWT token ✓
    ↓
Client receives token
    ↓
Client saves to localStorage
    ↓
Client redirects to /dashboard ✓
```

### Scenario 3: Protected Route Access
```
User has valid token in localStorage
    ↓
Navigates to /dashboard
    ↓
ProtectedRoute checks authService.isLoggedIn()
    ↓
Token exists ✓
    ↓
Allow access to App component ✓
    ↓
App sends API requests with Authorization header
    ↓
Server verifies token
    ↓
Token valid ✓
    ↓
Process request normally ✓
```

## ✅ Success Criteria

After all fixes, you should see:

- ✅ Signup completes without 500 error
- ✅ Login works with correct credentials
- ✅ Duplicate email shows proper error message
- ✅ Token stored in localStorage
- ✅ Redirect to dashboard on success
- ✅ Protected routes work with token
- ✅ Guest login works
- ✅ Logout clears localStorage
- ✅ No console errors related to auth
- ✅ All HTTP status codes are correct (201, 200, 400, 401)

## 🐛 Common Issues & Solutions

### Issue: Still Getting 500 on Signup

**Solution:**
1. Check server console for exact error
2. Verify JWT_SECRET in .env
3. Clear MongoDB `users` collection
4. Restart server
5. Try with valid input (name, valid email, 6+ char password)

### Issue: 401 Unauthorized on Login

**Solution:**
1. Verify JWT_SECRET matches in auth.js and route
2. Check password is correct (case-sensitive)
3. Verify user exists in MongoDB (check Atlas)
4. Try logging in with exact email (case doesn't matter due to normalization)

### Issue: Duplicate Email Database Error

**Solution:**
1. Email normalization now prevents this
2. If persists, drop users collection
3. Check MongoDB unique indexes: `db.users.getIndexes()`
4. If needed, reindex: `db.users.dropIndex("email_1"); db.users.createIndex({email: 1})`

### Issue: Token Not Being Sent

**Solution:**
1. Verify token is in localStorage
2. Check API requests have Authorization header
3. Use getAuthHeaders() in authService for all protected routes
4. Format should be: `Authorization: Bearer <token>`

### Issue: CORS Error

**Solution:**
1. Check server CORS config in server.js
2. Ensure client URL matches CORS origin
3. Verify credentials: true is set
4. Check request headers are allowed

## 📝 Next Steps

1. **Test thoroughly** with the scenarios above
2. **Monitor server logs** for any errors
3. **Check browser console** for network errors
4. **Verify localStorage** contains correct data
5. **Test logout and re-login** to ensure token refresh
6. **Try protected routes** to verify auth works

## 🔒 Security Reminders

Before deploying to production:

1. Change JWT_SECRET to a cryptographically random string
2. Use HTTPS only
3. Set secure CORS origins (not *)
4. Add rate limiting to auth endpoints
5. Implement password reset functionality
6. Add email verification
7. Use httpOnly cookies for token storage (optional, more secure)
8. Add logging and monitoring for auth failures

---

**All fixes are now applied!** Start testing following the guide above.
