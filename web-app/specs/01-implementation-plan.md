# Implementation Plan - APK Distribution App

## Project Overview
A secure, simple APK distribution system that allows admins to distribute ~200MB APK files to approved users via Google OAuth authentication. The app prioritizes simplicity, security, and responsive design.

## Technology Stack
- **Frontend**: Next.js (App Router)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Cloudflare R2
- **ORM**: Drizzle ORM
- **Authentication**: Supabase Auth (Google OAuth)
- **Deployment**: Vercel
- **Styling**: Tailwind CSS (for responsive design)

## Database Schema

### Users Table (Custom)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_download TIMESTAMP WITH TIME ZONE
);
```

### Releases Table
```sql
CREATE TABLE releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  r2_key TEXT NOT NULL,
  changelog TEXT,
  release_notes TEXT,
  is_production BOOLEAN DEFAULT FALSE,
  is_latest BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);
```

### Downloads Table (Analytics)
```sql
CREATE TABLE downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  release_id UUID REFERENCES releases(id),
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);
```

### Access Requests Table
```sql
CREATE TABLE access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES users(id)
);
```

## Security Architecture

### RLS Policies
- **Users table**: Only admins can read/write; users can read their own record
- **Releases table**: Public can read releases; only admins can create/update
- **Downloads table**: Only admins can read; insert on download
- **Access requests**: Users can create; admins can read/update

### Download Security
- R2 presigned URLs with short expiry (5-10 minutes)
- Server-side validation before generating download links
- Check user approval status before allowing downloads
- Track all download attempts in analytics table

### SEO Protection
- `robots.txt` with `Disallow: /`
- Meta tags: `noindex, nofollow`
- X-Robots-Tag header

## User Flow Implementation

### Public Homepage
1. **Components**:
   - Hero section with "Download Latest App" button
   - Simple, mobile-first design
   - Google OAuth login button (if not authenticated)
   - Download button (if authenticated and approved)
   - Request access button (if authenticated but not approved)

2. **Logic**:
   - Check authentication status via Supabase Auth
   - If authenticated, check user approval status
   - If approved, fetch latest release and generate secure download link
   - If not approved, show request access button

### Authentication Flow
1. User clicks "Download" or "Login with Google"
2. Redirect to Supabase Google OAuth
3. After callback, check if user exists in custom users table
4. If new user, create record with `is_approved = FALSE`
5. Redirect to homepage with updated state

### Download Flow
1. User clicks download button
2. Server validates: user is authenticated + approved
3. Server generates presigned R2 URL with expiry
4. Log download event in downloads table
5. Redirect user to presigned URL
6. Update user's `last_download` timestamp

## Admin Flow Implementation

### Admin Panel Structure
1. **Authentication Check**: Verify `is_admin = TRUE` in users table
2. **Dashboard Layout**: Simple sidebar navigation

### Release Management
1. **List Releases**: Table showing all releases with version, date, flags
2. **Create Release**: Form with:
   - APK file upload (to R2)
   - Version number
   - Changelog
   - Release notes
   - Production/Latest toggle
3. **Update Release**: Edit version, changelog, notes, flags
4. **Delete Release**: Remove from database and R2

### User Management
1. **List Users**: Table with email, name, approval status, admin status
2. **Create User**: Manual user creation (for invited users)
3. **Update User**: Toggle admin/approval status
4. **Delete User**: Remove user and revoke access

### Access Request Management
1. **List Requests**: Show pending requests with user details
2. **Approve Request**: Set user `is_approved = TRUE`, update request status
3. **Reject Request**: Update request status to rejected

### Analytics Dashboard
1. **Download Metrics**:
   - Total downloads per release
   - Downloads over time (chart)
   - Active users (downloaded in last 30 days)
2. **User Activity**:
   - List of recent downloads with user, release, timestamp
   - Filter by release or user
3. **Export**: CSV export of download data

## API Routes

### Authentication
- `GET /api/auth/user` - Get current user and approval status
- `POST /api/auth/callback` - Handle OAuth callback

### Downloads
- `GET /api/download/latest` - Generate secure download link for latest release
- `GET /api/download/[releaseId]` - Generate secure download link for specific release

### Admin API
- `GET /api/admin/releases` - List all releases
- `POST /api/admin/releases` - Create new release
- `PUT /api/admin/releases/[id]` - Update release
- `DELETE /api/admin/releases/[id]` - Delete release
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user
- `GET /api/admin/requests` - List access requests
- `PUT /api/admin/requests/[id]` - Approve/reject request
- `GET /api/admin/analytics` - Get download analytics

## File Structure

```
web-app/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (public)/
│   │   └── page.tsx
│   ├── (admin)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── releases/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── users/
│   │   │   └── page.tsx
│   │   ├── requests/
│   │   │   └── page.tsx
│   │   └── analytics/
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   ├── download/
│   │   └── admin/
│   ├── layout.tsx
│   └── robots.txt
├── components/
│   ├── ui/
│   ├── admin/
│   └── public/
├── lib/
│   ├── db/
│   │   ├── schema.ts
│   │   └── client.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── r2/
│   │   └── client.ts
│   └── utils.ts
├── drizzle.config.ts
├── package.json
├── tailwind.config.ts
└── .env.local
```

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

# App
NEXT_PUBLIC_APP_URL=
```

## Implementation Order

1. **Phase 1: Setup**
   - Initialize Next.js project
   - Install dependencies (Supabase, Drizzle, Tailwind)
   - Configure environment variables
   - Set up Cloudflare R2 bucket

2. **Phase 2: Database**
   - Configure Drizzle with Supabase
   - Create database schema
   - Run migrations
   - Set up RLS policies

3. **Phase 3: Authentication**
   - Configure Supabase Auth with Google OAuth
   - Create user sync logic (auth.users → custom users table)
   - Build auth context/provider

4. **Phase 4: Public Interface**
   - Build homepage with download button
   - Implement authentication flow
   - Create access request functionality
   - Integrate R2 download with presigned URLs

5. **Phase 5: Admin Panel**
   - Build admin layout and navigation
   - Create release management interface
   - Build user management interface
   - Implement access request handling
   - Create analytics dashboard

6. **Phase 6: Security & SEO**
   - Add robots.txt
   - Implement SEO meta tags
   - Secure all API routes
   - Test RLS policies

7. **Phase 7: Testing & Deployment**
   - Test complete user flow
   - Test complete admin flow
   - Deploy to Vercel
   - Configure environment variables in production

## Design Approach

Following the frontend-design skill principles:
- **Purpose**: Simple, baby-proof APK distribution
- **Tone**: Clean, minimal, functional with subtle sophistication
- **Differentiation**: Extreme simplicity - one-click download experience
- **Key Design Elements**:
  - Large, clear download button as focal point
  - Minimal navigation
  - Mobile-first responsive design
  - Clear status indicators (approved/not approved)
  - Subtle animations for state changes
  - High contrast for accessibility

## Success Criteria

- [ ] Users can authenticate with Google OAuth
- [ ] Approved users can download APK securely
- [ ] Non-approved users can request access
- [ ] Admins can manage releases (CRUD)
- [ ] Admins can manage users (CRUD)
- [ ] Admins can approve/reject access requests
- [ ] Admins can view download analytics
- [ ] Download links expire after 5-10 minutes
- [ ] App is not indexed by search engines
- [ ] All pages are responsive on mobile
- [ ] RLS policies enforce security
- [ ] No secrets exposed in client code
