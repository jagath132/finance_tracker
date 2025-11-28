# Android Keystore Setup Guide

## 📋 Overview

To publish your app to Google Play Store, you need to sign your release APK with a keystore. This guide will help you create and configure it.

## 🔑 Step 1: Generate a Keystore

Run this command in your terminal (from any directory):

```powershell
keytool -genkeypair -v -storetype PKCS12 -keystore cointrail-release.keystore -alias cointrail -keyalg RSA -keysize 2048 -validity 10000
```

### You'll be prompted for:

1. **Keystore password**: Choose a strong password (you'll need this for `ANDROID_KEYSTORE_PASSWORD`)
2. **Key password**: Choose another strong password (you'll need this for `ANDROID_KEY_PASSWORD`)
3. **Your name**: Enter your full name or company name
4. **Organizational unit**: e.g., "Development"
5. **Organization**: Your company/app name
6. **City/Locality**: Your city
7. **State/Province**: Your state
8. **Country code**: Two-letter country code (e.g., "IN" for India, "US" for USA)

### Important Notes:
- **SAVE THESE PASSWORDS SECURELY!** If you lose them, you can never update your app on Google Play
- The keystore file will be created in your current directory
- Move it to a secure location (NOT in your project folder)
- **NEVER commit the keystore file to Git**

## 🔐 Step 2: Get the Required Values

After creating the keystore, you'll have:

1. **ANDROID_KEYSTORE_BASE64**: The keystore file encoded in base64
2. **ANDROID_KEYSTORE_PASSWORD**: The password you entered for the keystore
3. **ANDROID_KEY_ALIAS**: `cointrail` (from the command above)
4. **ANDROID_KEY_PASSWORD**: The password you entered for the key

### Convert Keystore to Base64:

Run this PowerShell command (replace the path with your keystore location):

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("cointrail-release.keystore")) | Set-Clipboard
```

This will copy the base64 string to your clipboard. This is your `ANDROID_KEYSTORE_BASE64` value.

## 📝 Step 3: Configure Android Build

You need to update your `android/app/build.gradle` file to use the keystore for signing.

### Option A: For GitHub Actions (Recommended)

The workflow will automatically decode the base64 keystore and use it for signing. You just need to add the secrets to GitHub.

### Option B: For Local Builds

Create a file `android/keystore.properties` with:

```properties
storeFile=/path/to/your/cointrail-release.keystore
storePassword=YOUR_KEYSTORE_PASSWORD
keyAlias=cointrail
keyPassword=YOUR_KEY_PASSWORD
```

**Important**: Add `keystore.properties` to `.gitignore`!

## 🌐 Step 4: Add GitHub Secrets

Go to your GitHub repository:
1. Navigate to: `Settings` → `Secrets and variables` → `Actions`
2. Click `New repository secret`
3. Add these four secrets:

| Secret Name | Value |
|------------|-------|
| `ANDROID_KEYSTORE_BASE64` | The base64 string from Step 2 |
| `ANDROID_KEYSTORE_PASSWORD` | Your keystore password |
| `ANDROID_KEY_ALIAS` | `cointrail` |
| `ANDROID_KEY_PASSWORD` | Your key password |

## ✅ Step 5: Update build.gradle

I'll update your `android/app/build.gradle` to support signing with the keystore.

## 🔒 Security Best Practices

1. ✅ **Never** commit the keystore file to Git
2. ✅ **Never** commit passwords to Git
3. ✅ Store the keystore in a secure location (cloud backup recommended)
4. ✅ Keep a backup of your keystore and passwords in a password manager
5. ✅ Add `*.keystore`, `*.jks`, and `keystore.properties` to `.gitignore`

## 🚨 Important Warning

**If you lose your keystore or passwords, you will NEVER be able to update your app on Google Play Store!**

You would have to:
- Unpublish the old app
- Create a new app listing
- Lose all your reviews and downloads

So please backup everything securely!

## 📱 Testing Your Setup

After setting everything up, you can test locally with:

```bash
cd android
./gradlew assembleRelease
```

The signed APK will be in: `android/app/build/outputs/apk/release/app-release.apk`
