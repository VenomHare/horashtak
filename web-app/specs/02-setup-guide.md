# Setup Guide - APK Distribution App

## Prerequisites
- Bun package manager
- Supabase account
- Cloudflare account with R2 enabled

## 1. Environment Configuration

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env.local
```

Fill in the following variables:

### Supabase Configuration
1. Create a new Supabase project at https://supabase.com/dashboard
2. Go to Project Settings → API
3. Copy the following values:
   - `NEXT_PUBLIC_SUPABASE_URL`: Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY`: service_role key (keep secret!)
   - `DATABASE_URL`: Connection string (format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`)

### Google OAuth Setup (Supabase)
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Create a project at https://console.cloud.google.com
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
   - Add privacy policy URL: `https://[YOUR-APP-URL]/privacy`
   - Add terms of service URL: `https://[YOUR-APP-URL]/terms`
4. Copy Client ID and Client Secret to Supabase

### Cloudflare R2 Configuration
1. Go to Cloudflare Dashboard → R2
2. Create a new bucket (e.g., `apk-distribution`)
3. Go to R2 → Manage R2 API Tokens
4. Create a new API token with Object Read & Write permissions
5. Copy the following values:
   - `R2_ACCOUNT_ID`: Your Cloudflare Account ID
   - `R2_ACCESS_KEY_ID`: Access Key ID from the token
   - `R2_SECRET_ACCESS_KEY`: Secret Access Key from the token
   - `R2_BUCKET_NAME`: The name of your R2 bucket

### App Configuration
- `NEXT_PUBLIC_APP_URL`: Your app URL (e.g., `http://localhost:3000` for development)

## 2. Database Setup

### Run Migration
The database schema and RLS policies are defined in `lib/db/schema.ts` using Drizzle's built-in RLS support. To apply the schema:

1. Make sure your `DATABASE_URL` is set in `.env.local`
2. Run the migration:
```bash
bun drizzle-kit push
```

This will automatically:
- Create all tables (users, releases, downloads, access_requests)
- Enable Row Level Security on all tables
- Create all RLS policies using Drizzle's policy definitions
- Set up proper relationships between tables

### RLS Policies Summary
The RLS policies are automatically generated from the schema definitions using Drizzle's `pgPolicy` function:

**Users table:**
- Users can view their own data
- Admins can view and update all users
- Service role has full access

**Releases table:**
- Public (including unauthenticated) can view releases
- Admins can insert, update, and delete releases
- Service role has full access

**Downloads table:**
- Admins can view all download records
- Service role can insert download records (for server-side logging)
- Service role has full access

**Access requests table:**
- Users can create and view their own requests
- Admins can view and update all requests
- Service role has full access

### Database Client Strategy
The app uses two Drizzle clients:

1. **`db` (regular client)**: Used for queries that should be subject to RLS
   - User data reads (users can only see their own data)
   - Public data reads (anyone can read releases)
   - Admin checks (verifies admin status via RLS)

2. **`adminDb` (admin client)**: Used for operations that need to bypass RLS
   - Creating new users (bypasses RLS for initial user creation)
   - Logging downloads (server-side operations)
   - Admin operations (updates/deletes that need full access)
   - Analytics (admin needs to see all data)

Supabase client is used exclusively for authentication operations (auth.getUser(), signInWithOAuth(), etc.)

## 3. Create First Admin User

After setting up the database, you need to create the first admin user:

1. Sign in with Google OAuth on your app
2. Get your user ID from the browser console or by checking the `users` table
3. Go to Supabase Dashboard → SQL Editor
4. Run this SQL (replace `YOUR_USER_ID` with your actual user ID from auth.users):
```sql
UPDATE users 
SET is_admin = true, is_approved = true 
WHERE id = 'YOUR_USER_ID';
```

Alternatively, you can use the adminDb client directly in a script to create the first admin user programmatically.

## 4. Running the App

### Development
```bash
bun run dev
```

The app will be available at `http://localhost:3000`

### Production Build
```bash
bun run build
bun run start
```

## 5. Testing the App

### User Flow
1. Navigate to the homepage
2. Click "Sign in with Google"
3. Complete Google OAuth
4. You should see "Access Pending" message
5. Click "Request Access"
6. Go to admin panel (if you're admin)
7. Navigate to "Requests" and approve the user
8. Sign out and sign back in as the user
9. You should now see "Download Latest App" button

### Admin Flow
1. Sign in as admin user
2. Click "Admin Panel" button
3. Navigate to "Releases"
4. Upload an APK file with version info
5. Mark it as "Latest Release"
6. Navigate to "Users" to manage users
7. Navigate to "Requests" to approve/reject access
8. Navigate to "Analytics" to view download statistics

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Supabase project is active
- Ensure your IP is allowed in Supabase settings

### R2 Upload Issues
- Verify R2 credentials are correct
- Check bucket exists and is accessible
- Ensure API token has proper permissions

### Google OAuth Issues
- Verify Google OAuth credentials are correct
- Check redirect URI matches in Google Console
- Ensure Google+ API is enabled

### RLS Policy Issues
- Make sure RLS is enabled on all tables
- Check policies allow necessary operations
- Use Supabase Auth UI to test authentication

## Security Notes

- Never commit `.env.local` to version control
- Keep `SUPABASE_SERVICE_ROLE_KEY` and R2 credentials secret
- Use environment-specific configurations for production
- Regularly rotate API keys and secrets
- Monitor download logs for suspicious activity
