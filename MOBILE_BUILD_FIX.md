# GitHub Actions Mobile Build - Setup Guide

## Issue Fixed
The mobile build workflow was failing because:
1. Missing Firebase environment variables in GitHub Secrets
2. Attempting to build release APKs without proper signing configuration
3. Lack of error handling and stacktrace output

## Changes Made
1. **Updated `.github/workflows/deploy-mobile.yml`**:
   - Now builds debug APKs for all pushes (not just develop branch)
   - Only attempts release builds on main branch when signing secrets are available
   - Added `--stacktrace` flag for better error debugging
   - Added proper conditional checks for secrets

## Required GitHub Secrets

You need to configure the following secrets in your GitHub repository:

### Firebase Configuration (Required)
Go to: `https://github.com/jagath132/finance_tracker/settings/secrets/actions`

Add these secrets:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

**How to get these values:**
1. Open your local `.env` file (in your project root)
2. Copy each value after the `=` sign
3. Add them as secrets in GitHub

### Android Signing Configuration (Optional - Only for Release Builds)
These are only needed if you want to build signed release APKs:
- `ANDROID_KEYSTORE_BASE64` - Your keystore file encoded in base64
- `ANDROID_KEYSTORE_PASSWORD` - Keystore password
- `ANDROID_KEY_ALIAS` - Key alias
- `ANDROID_KEY_PASSWORD` - Key password

**How to create and encode keystore:**
```bash
# Generate keystore (if you don't have one)
keytool -genkey -v -keystore release.keystore -alias cointrail -keyalg RSA -keysize 2048 -validity 10000

# Encode to base64 (Windows PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("release.keystore"))

# Or on Linux/Mac
base64 release.keystore | tr -d '\n'
```

## Testing the Fix

1. **Add Firebase secrets to GitHub** (required)
2. **Commit and push** the updated workflow file:
   ```bash
   git add .github/workflows/deploy-mobile.yml
   git commit -m "fix: Update mobile build workflow with proper error handling"
   git push origin main
   ```
3. **Check the Actions tab** in GitHub to see if the build succeeds

## Expected Behavior

- **On any push to main/develop**: Builds a debug APK
- **On push to main (with signing secrets)**: Also builds a release APK
- **On pull requests**: Runs the build but doesn't create APKs
- **Build artifacts**: APK files are uploaded and available for download in the Actions tab

## Troubleshooting

If the build still fails:
1. Check the Actions logs for specific error messages
2. Verify all Firebase secrets are correctly set
3. Ensure your local build works: `npm run build`
4. Check if the Android folder is properly synced: `npx cap sync android`

## Next Steps

Once the build succeeds:
1. Download the APK from the Actions artifacts
2. Test it on your Android device
3. If everything works, consider setting up automatic deployment to Google Play Store
