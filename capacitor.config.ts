import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cabinet360.expert',
  appName: 'Cabinet 360',
  webDir: 'out',
  server: {
    url: 'https://cabinet-expert-ohada.vercel.app',
    cleartext: true
  }
};

export default config;
