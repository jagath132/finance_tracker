Cointrail

A modern, responsive web application for tracking personal finances, built with React, TypeScript, and Vite.

Features

- User authentication (login/register)
- Dashboard with financial overview
- Transaction management (add, edit, delete, search)
- Category management
- Data import/export (CSV)
- Profile management
- Responsive design with dark/light theme
- Local data storage (ready for backend integration)

Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

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

1. Clone the repository and install dependencies:
   ```bash
   git clone <repository-url>
   cd finance_tracker
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

Running the Application

The application is now running with mock data and local state management. All features work without a backend:

- Authentication is simulated (always succeeds)
- Data is stored in memory (resets on page refresh)
- All CRUD operations work with local state

Deployment

This app is configured for deployment on Netlify. The `netlify.toml` file contains the build settings.

For other platforms, ensure the environment variables are set in your deployment environment.

Technologies Used

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **State Management**: React Context + Hooks
- **Icons**: Lucide React
- **Data Processing**: PapaParse for CSV handling
- **Backend Ready**: Architecture prepared for any backend integration
