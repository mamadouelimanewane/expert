import type { CapacitorConfig } from '@capacitor/cli';

// L'application Android est une coquille WebView qui charge l'instance de
// production : aucun export statique (`out/`) n'est produit par Next.js.
const config: CapacitorConfig = {
  appId: 'com.cabinet360.expert',
  appName: 'Cabinet 360',
  webDir: 'out',
  server: {
    url: 'https://expert-pi.vercel.app',
  },
};

export default config;
