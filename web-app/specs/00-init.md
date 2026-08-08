# Intro
- I want an app to distribute my .apk file to only listed users.
- File is ~200mb big

# Specifications
- Supabase (postgres) for db
- Cloudflare r2 for storage
- Next.js 
- Vercel
- Drizzle ORM
- Google Oauth 

# UX
- The ux should be most simplest like a baby could operate it. The website doesn't need to be complex
- User's on mobile should see download app on homepage.

# App flow 
- User opens website -> Sees a Download Latest App -> (if not logged in) -> Open Google OAuth Link -> after authorization automatically start download (if user is allowed) -> (if not allowed) show a request access button.

# Admin Flow
- Admin should allowed to create releases. each release should have option make itself `production` or `latest release`.
- Admin should see the approval request and also should have list of users for performing CRUD.
- Analytics: Admin must have data regarding which user downloaded apk of which release and when.

# Database
- Maintain Seperate users table other supabase auth. if user has admin role, he can access admin panel.

# Security
- Make sure the app is not listed anywhere on internet.
- The Download link from r2 must have expiry and the whole flow should be secure.
- Make sure to make no mistakes while implementation.

# Preferences
- Make sure every UI is responsive