# GitHub Secrets Setup Guide

This guide will help you configure all the required GitHub secrets for the CI/CD pipeline.

## Prerequisites

1. GitHub repository access with admin permissions
2. Netlify account and sites set up
3. Supabase project configured
4. Android keystore (for signed APKs)

## Step 1: Access GitHub Repository Secrets

1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables**
4. Click **Actions**
5. Click **New repository secret**

## Step 2: Configure Netlify Secrets

### NETLIFY_AUTH_TOKEN

1. Go to [Netlify](https://app.netlify.com/)
2. Click on your profile picture (top right)
3. Select **User settings**
4. Click **Applications** in the left sidebar
5. Click **New access token**
6. Give it a name (e.g., "GitHub Actions CI/CD")
7. Copy the generated token
8. In GitHub, create a new secret named `NETLIFY_AUTH_TOKEN`
9. Paste the token as the value

### NETLIFY_SITE_ID_STAGING

1. In Netlify, go to your **staging site** dashboard
2. The Site ID is in the URL: `https://app.netlify.com/sites/[SITE_ID]/...`
3. Copy the SITE_ID from the URL
4. In GitHub, create a new secret named `NETLIFY_SITE_ID_STAGING`
5. Paste the Site ID as the value

### NETLIFY_SITE_ID_PRODUCTION

1. In Netlify, go to your **production site** dashboard
2. Copy the Site ID from the URL (same as above)
3. In GitHub, create a new secret named `NETLIFY_SITE_ID_PRODUCTION`
4. Paste the Site ID as the value

## Step 4: Configure Android Keystore Secrets (For Signed APKs)

### Option 1: Generate New Keystore (Recommended)

1. Open a terminal/command prompt
2. Run this command to generate a keystore:
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000
   ```
3. Follow the prompts to set passwords and information
4. Remember the keystore password, alias name, and key password

### Option 2: Use Existing Keystore

If you already have a keystore file, use that.

### Configure Secrets

1. **ANDROID_KEYSTORE_BASE64**
   - Convert your `.keystore` file to base64:
     ```bash
     # On Linux/Mac
     base64 -i my-release-key.keystore

     # On Windows (using PowerShell)
     [Convert]::ToBase64String([IO.File]::ReadAllBytes("my-release-key.keystore"))
     ```
   - In GitHub, create a new secret named `ANDROID_KEYSTORE_BASE64`
   - Paste the base64 string as the value

2. **ANDROID_KEYSTORE_PASSWORD**
   - In GitHub, create a new secret named `ANDROID_KEYSTORE_PASSWORD`
   - Paste your keystore password as the value

3. **ANDROID_KEY_ALIAS**
   - In GitHub, create a new secret named `ANDROID_KEY_ALIAS`
   - Paste your alias name (from keystore generation) as the value

4. **ANDROID_KEY_PASSWORD**
   - In GitHub, create a new secret named `ANDROID_KEY_PASSWORD`
   - Paste your key password as the value (usually same as keystore password)

## Step 5: Verify Configuration

1. Go to your GitHub repository
2. Click on **Actions** tab
3. You should see the workflows listed
4. Push a small change to trigger the pipeline
5. Check that the secrets are accessible (no "secret not found" errors)

## Troubleshooting

### Netlify Deployment Issues
- Ensure the Netlify auth token has the correct permissions
- Verify site IDs are correct
- Check that the sites exist and are accessible

### Supabase Issues
- Ensure you're using the anon/public key, not the service role key
- Verify the project URL is correct

### Android Build Issues
- Ensure the keystore file is valid
- Check that passwords are correct
- Verify the alias exists in the keystore

### General Tips
- Secrets are case-sensitive
- Never commit secrets to code
- Rotate secrets periodically for security
- Test with a small change first

## Security Notes

- These secrets give access to deploy to your sites and build signed mobile apps
- Keep them secure and don't share them
- Use different keystores for different environments if needed
- Consider using GitHub's secret scanning features

## Next Steps

Once all secrets are configured:
1. Push your code to the `develop` branch to test staging deployment
2. Create a pull request to test the CI checks
3. Merge to `main` to test production deployment

The CI/CD pipeline will now automatically handle builds and deployments!
