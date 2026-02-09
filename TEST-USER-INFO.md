# Test User Information

## 🧪 Development Test User

For easy testing and development, I've created a test user that you can use to login without going through the signup process.

### Test User Credentials:
- **Email:** `test@ku.edu.kw`
- **Password:** `testpassword123`

### How to Use:

1. **Go to the login page:** http://localhost:3000/login
2. **Click the green "Login as Test User" button** at the bottom of the form
3. **You'll be automatically logged in** and redirected to the chat page

### Alternative Method:
You can also manually enter the credentials:
- Email: `test@ku.edu.kw`
- Password: `testpassword123`

### Features Available:
- ✅ Full authentication bypass
- ✅ Kuwait University domain validation
- ✅ Access to all protected routes
- ✅ Chat interface
- ✅ Subscription pages
- ✅ All UI components

### Notes:
- This test user is only for development purposes
- The user is created in your Supabase database
- You can modify the credentials in `hooks/useSupabaseAuth.ts` if needed
- The test user button is only visible on the login page

### To Remove Test User:
If you want to remove the test user functionality:
1. Remove the `signInTestUser` function from `hooks/useSupabaseAuth.ts`
2. Remove the test user button from `app/(auth)/login/page.tsx`
3. Delete the test user from your Supabase dashboard

---

**Happy Testing! 🚀**







