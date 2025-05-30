import { LogBox } from 'react-native';
import { Slot } from 'expo-router';
import { SyncService } from './app/lib/SyncService';
import { subscribeToNetworkChanges } from './app/lib/network';
import { useEffect } from 'react';

// Ignore specific warnings
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

export default function App() {
  useEffect(() => {
    // Sync on app start
    SyncService.syncAll();
    // Sync on network reconnect
    const unsubscribe = subscribeToNetworkChanges((isConnected) => {
      if (isConnected) {
        SyncService.syncAll();
      }
    });
    return () => unsubscribe();
  }, []);

  return <Slot />;
} 