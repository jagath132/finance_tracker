Finance Tracker

A modern, responsive web application for tracking personal finances, built with React, TypeScript, Vite, and Supabase.

Features

- User authentication (login/register)
- Dashboard with financial overview
- Transaction management (add, edit, delete, search)
- Category management
- Data import/export (CSV)
- Profile management with avatar upload
- Responsive design with dark/light theme
- Secure data storage with Supabase

Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- A Supabase account

Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd finance_tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com).

2. Go to your project's API settings and copy the Project URL and anon public key.

3. Create a `.env` file in the root directory and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the database migrations (optional, if setting up locally):
   - Install Supabase CLI if not already installed.
   - Run `supabase start` to start local Supabase.
   - Apply migrations: `supabase db push`

Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:5173` (or the port shown in the terminal).

Deployment

This app is configured for deployment on Netlify. The `netlify.toml` file contains the build settings.

For other platforms, ensure the environment variables are set in your deployment environment.

Technologies Used

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Icons**: Lucide React
- **Charts**: (if any, add here)
- **Other**: Axios for HTTP requests, PapaParse for CSV handling
