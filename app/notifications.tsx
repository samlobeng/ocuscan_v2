import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './lib/supabase';
import { checkInternetConnection } from './lib/network';

export default function NotificationsScreen() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const value = await AsyncStorage.getItem('notificationsEnabled');
      setEnabled(value === 'true');
      setLoading(false);
    })();
  }, []);

  const toggleSwitch = async () => {
    const newValue = !enabled;
    setEnabled(newValue);
    await AsyncStorage.setItem('notificationsEnabled', newValue ? 'true' : 'false');
    const isOnline = await checkInternetConnection();
    if (isOnline) {
      try {
        await supabase.from('user_settings').upsert({ notifications_enabled: newValue });
      } catch (e) {
        Alert.alert('Error', 'Failed to sync notification setting.');
      }
    }
  };

  if (loading) return <View style={styles.center}><Text>Loading...</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Enable Notifications</Text>
        <Switch value={enabled} onValueChange={toggleSwitch} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#1E88E5' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  label: { fontSize: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
}); 