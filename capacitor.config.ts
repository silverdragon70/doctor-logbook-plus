import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.32be04c8b6414d258cde3f0dbedc18a2',
  appName: 'doctor-logbook-plus',
  webDir: 'dist',
  server: {
    url: 'https://32be04c8-b641-4d25-8cde-3f0dbedc18a2.lovableproject.com?forceHideBadge=true',
    cleartext: true,
    androidScheme: 'https'
  },
  plugins: {
    CapacitorSQLite: {
      iosDatabaseLocation: 'Library/CapacitorDatabase',
      iosIsEncryption: true,
      iosKeychainPrefix: 'medora',
      androidIsEncryption: true,
      androidBiometric: {
        biometricAuth: false,
      }
    }
  }
};

export default config;
