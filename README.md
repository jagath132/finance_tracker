# Cointrail - Finance Tracker

A modern, responsive finance tracking application built with React, TypeScript, and Capacitor for web and mobile deployment.

## Features

- Track income and expenses
- Categorize transactions
- View detailed analytics and summaries
- Import/export transaction data
- Dark/light theme support
- Responsive design for all devices
- Mobile app support via Capacitor

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase
- **Mobile**: Capacitor
- **Build**: Vite
- **Deployment**: Netlify (Web), GitHub Actions (CI/CD)

## Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd finance_tracker-main
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

4. Fill in your Supabase credentials in `.env`

5. Start development server:
   ```bash
   npm run dev
   ```

### Building

```bash
# Build for web
npm run build

# Build for mobile
npx cap sync android
npx cap sync ios
```

## CI/CD Pipeline

This project uses GitHub Actions for automated deployment:

### Environments

- **Staging**: Deployed from `develop` branch to Netlify staging site
- **Production**: Deployed from `main` branch to Netlify production site

### Workflows

- `deploy-web.yml`: Handles web builds and Netlify deployments
- `deploy-mobile.yml`: Handles Android APK builds
- `rollback.yml`: Manual rollback workflow for failed deployments
- `test-pipeline.yml`: Test the CI/CD pipeline manually

### Required Secrets

Set these in your GitHub repository secrets:

#### Netlify

- `NETLIFY_AUTH_TOKEN`: Your Netlify personal access token
- `NETLIFY_SITE_ID_STAGING`: Staging site ID
- `NETLIFY_SITE_ID_PRODUCTION`: Production site ID

#### Supabase

- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key

#### Android (for mobile builds)

- `ANDROID_KEYSTORE_BASE64`: Base64 encoded keystore file
- `ANDROID_KEYSTORE_PASSWORD`: Keystore password
- `ANDROID_KEY_ALIAS`: Key alias
- `ANDROID_KEY_PASSWORD`: Key password

### Deployment Process

1. Push to `develop` branch → Automatic staging deployment
2. Create PR to `main` → Build verification
3. Merge to `main` → Automatic production deployment

### Rollback

Use the `rollback.yml` workflow to rollback to a previous commit:

1. Go to Actions tab in GitHub
2. Select "Rollback Deployment" workflow
3. Choose environment and commit SHA
4. Run workflow

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, Theme, etc.)
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries
├── screens/           # Page components
├── types/             # TypeScript type definitions
└── main.tsx           # App entry point

android/               # Android project files
ios/                   # iOS project files (if applicable)
.github/workflows/     # CI/CD workflows
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and commit: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Create a Pull Request

## License

This project is licensed under the MIT License.
