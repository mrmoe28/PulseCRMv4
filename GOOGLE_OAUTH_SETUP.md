# Google OAuth Setup Instructions for PulseCRM

## Quick Summary
Your `.env.local` file has been created with placeholders for Google OAuth credentials. You need to:
1. Get credentials from Google Cloud Console
2. Replace `YOUR_GOOGLE_CLIENT_ID_HERE` and `YOUR_GOOGLE_CLIENT_SECRET_HERE` in `.env.local`
3. Restart your development server

## Step-by-Step Instructions

### 1. Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Create a new project or select an existing one

### 2. Enable Required APIs
1. In the left sidebar, go to **APIs & Services** > **Library**
2. Search for and enable these APIs:
   - **Google Calendar API** (for calendar integration)
   - **Gmail API** (for email integration)
   - **Google+ API** or **Google Identity** (for OAuth sign-in)

### 3. Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen first:
   - Choose **External** for user type (unless you have a Google Workspace)
   - Fill in required fields:
     - App name: **PulseCRM**
     - User support email: Your email
     - Developer contact: Your email
   - Add scopes (optional but recommended):
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
     - `../auth/calendar` (if using Google Calendar)
     - `../auth/gmail.send` (if using Gmail)
   - Add test users if in development

### 4. Configure OAuth Client
1. After consent screen setup, create OAuth client ID:
   - Application type: **Web application**
   - Name: **PulseCRM Development** (or similar)
   
2. Add Authorized JavaScript origins:
   - `http://localhost:3010` (for development)
   - `https://your-domain.vercel.app` (for production, when ready)

3. Add Authorized redirect URIs:
   - **For Development:**
     - `http://localhost:3010/api/auth/callback/google`
     - `http://localhost:3010/api/oauth/google-calendar/callback`
     - `http://localhost:3010/api/oauth/gmail/callback`
   
   - **For Production (add when deploying):**
     - `https://your-domain.vercel.app/api/auth/callback/google`
     - `https://your-domain.vercel.app/api/oauth/google-calendar/callback`
     - `https://your-domain.vercel.app/api/oauth/gmail/callback`

4. Click **CREATE**

### 5. Copy Your Credentials
1. After creation, you'll see your credentials:
   - **Client ID**: Copy this value
   - **Client Secret**: Copy this value (click SHOW if hidden)

2. Open `/apps/web/.env.local` and replace:
   - `YOUR_GOOGLE_CLIENT_ID_HERE` with your actual Client ID
   - `YOUR_GOOGLE_CLIENT_SECRET_HERE` with your actual Client Secret

### 6. Test Your Setup
1. Stop your development server if running (Ctrl+C)
2. Start it again:
   ```bash
   pnpm dev
   ```
3. Navigate to http://localhost:3010/auth
4. Try signing in with Google

## Troubleshooting

### Common Issues:

**"Redirect URI mismatch" error:**
- Double-check that the redirect URIs in Google Cloud Console match exactly
- Ensure you're using `http://localhost:3010` (not `localhost:3000`)
- The URI is case-sensitive and must match exactly

**"Access blocked" error:**
- Make sure OAuth consent screen is configured
- If using test mode, add your email as a test user
- Publish your app (in OAuth consent screen) for production use

**Google sign-in button not appearing:**
- Check browser console for errors
- Verify `.env.local` file is in the correct location (`apps/web/`)
- Ensure credentials are properly formatted (no extra spaces or quotes)

## Security Notes
- **Never commit** your `.env.local` file to version control
- Keep your Client Secret secure and never expose it publicly
- For production, use environment variables in your hosting platform (e.g., Vercel)
- Regularly rotate credentials if compromised

## Next Steps
Once Google OAuth is working:
1. Test sign-in functionality
2. Configure Google Calendar integration (if needed)
3. Set up Gmail integration (if needed)
4. Deploy to production with production redirect URIs

## Additional Resources
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)
- [Google API Console Help](https://support.google.com/googleapi/)