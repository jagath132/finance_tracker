import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cointrail',
  appName: 'Cointrail',
  webDir: 'dist',
  plugins: {
    CapacitorUpdater: {
      autoUpdate: true,
      statsUrl: '', // Disable stats since we are self-hosting
    },
  },
  server: {
    // During local dev set this to the dev server URL (emulator: 10.0.2.2:5173).
    // For production builds remove or unset this field.
    url: process.env.CAPACITOR_DEV_SERVER_URL || 'http://10.0.2.2:5173',
    cleartext: true,
  },
};

export default config;
