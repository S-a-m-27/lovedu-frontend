# Backend API Integration

This document describes how the frontend integrates with the backend API.

## Environment Variables

Add the following to your `.env.local` file:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## How It Works

### Authentication Flow

1. **User Login/Signup**: Users authenticate through Supabase Auth (handled by frontend)
2. **Token Storage**: After successful authentication, the JWT token is stored in localStorage
3. **Backend Verification**: The token is automatically verified with the backend API
4. **API Calls**: All subsequent API calls include the token in the Authorization header

### API Client

The `apiClient` utility (`lib/apiClient.ts`) handles:
- Automatic token management
- Request/response handling
- Error handling
- Token storage and retrieval

### Available Backend Endpoints

#### Authentication Endpoints

- `POST /auth/verify-token` - Verify JWT token
  - Request: `{ token: string }`
  - Response: User information

- `GET /auth/me` - Get current authenticated user
  - Requires: Bearer token in Authorization header
  - Response: Current user information

- `GET /auth/user/{user_id}` - Get user by ID
  - Requires: Bearer token in Authorization header
  - Response: User information

- `POST /auth/refresh` - Refresh access token
  - Request: `{ refresh_token: string }`
  - Response: New access token and refresh token

## Usage in Components

### Using the Auth Hook

```typescript
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'

function MyComponent() {
  const { user, backendUser, loading, getCurrentUserFromBackend } = useSupabaseAuth()
  
  // user: Supabase user object
  // backendUser: User object from backend API
  // loading: Loading state
  // getCurrentUserFromBackend: Function to fetch current user from backend
}
```

### Making API Calls

```typescript
import { apiClient } from '@/lib/apiClient'

// Get current user
const response = await apiClient.getCurrentUser()
if (response.data) {
  console.log('User:', response.data)
}

// Verify token
const response = await apiClient.verifyToken(token)
if (response.data) {
  console.log('User:', response.data)
}
```

## Backend Server Setup

Make sure your backend server is running:

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

## CORS Configuration

The backend is configured to accept requests from `http://localhost:3000` by default. Update `CORS_ORIGINS` in the backend `.env` file if needed.

## Troubleshooting

### Token Not Being Sent

- Check that the token is stored in localStorage
- Verify the token is being set after login: `apiClient.setToken(token)`

### CORS Errors

- Ensure backend CORS_ORIGINS includes your frontend URL
- Check that backend server is running

### 401 Unauthorized

- Verify token is valid and not expired
- Check that token is being sent in Authorization header
- Ensure backend has correct Supabase credentials

