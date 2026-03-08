import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.medora.logbook',
  appName: 'Medora',
  webDir: 'dist',
  server: {
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
