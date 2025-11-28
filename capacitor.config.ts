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
};

export default config;
