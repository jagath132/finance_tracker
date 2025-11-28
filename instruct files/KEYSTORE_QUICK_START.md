# 🚀 Quick Start: Generate Your Android Keystore

## Step 1: Generate Keystore (Run this command)

```powershell
keytool -genkeypair -v -storetype PKCS12 -keystore cointrail-release.keystore -alias cointrail -keyalg RSA -keysize 2048 -validity 10000
```

**Save the passwords you enter!** You'll need them for GitHub secrets.

---

## Step 2: Convert to Base64 (Run after Step 1)

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("cointrail-release.keystore")) | Set-Clipboard
```

This copies the base64 string to your clipboard.

---

## Step 3: Add GitHub Secrets

Go to: https://github.com/jagath132/finance_tracker/settings/secrets/actions

Add these 4 secrets:

| Secret Name | Where to get the value |
|------------|------------------------|
| `ANDROID_KEYSTORE_BASE64` | From your clipboard (Step 2) |
| `ANDROID_KEYSTORE_PASSWORD` | The keystore password you entered in Step 1 |
| `ANDROID_KEY_ALIAS` | Use: `cointrail` |
| `ANDROID_KEY_PASSWORD` | The key password you entered in Step 1 |

---

## Step 4: Add Firebase Secrets

You also need to add your Firebase configuration as GitHub secrets:

| Secret Name | Where to find |
|------------|---------------|
| `VITE_FIREBASE_API_KEY` | From your `.env` file |
| `VITE_FIREBASE_AUTH_DOMAIN` | From your `.env` file |
| `VITE_FIREBASE_PROJECT_ID` | From your `.env` file |
| `VITE_FIREBASE_STORAGE_BUCKET` | From your `.env` file |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | From your `.env` file |
| `VITE_FIREBASE_APP_ID` | From your `.env` file |

---

## ✅ That's it!

Once you've added all the secrets and push your code, GitHub Actions will automatically:
1. Build your web app
2. Sync with Capacitor
3. Build and sign your Android APK
4. Upload it as an artifact

---

## 🔒 Security Reminder

- ✅ Keystore file is in `.gitignore` - never commit it!
- ✅ Store keystore and passwords in a password manager
- ✅ Keep a backup of your keystore file
- ⚠️ **Losing your keystore means you can NEVER update your app on Google Play!**
