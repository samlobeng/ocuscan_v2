import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { DatabaseHelper } from './lib/database/DatabaseHelper';
import { supabase } from './lib/supabase';
import { checkInternetConnection } from './lib/network';

export default function AccountScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const userStr = await SecureStore.getItemAsync('user');
      if (userStr) setProfile(JSON.parse(userStr));
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save locally (SQLite)
      const db = DatabaseHelper.getInstance();
      await db.updateUser({
        id: profile.id,
        email: profile.email,
        password: profile.password,
        fullName: profile.fullName,
        hospitalName: profile.hospitalName,
        role: profile.role,
        synced: false, // mark as unsynced until confirmed
      });
      await SecureStore.setItemAsync('user', JSON.stringify(profile));

      // Try to sync to Supabase
      const isOnline = await checkInternetConnection();
      if (isOnline) {
        // Fetch by email to get the correct id
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', profile.email)
          .single();
        const upsertProfile = {
          id: existingProfile?.id || profile.id,
          email: profile.email,
          full_name: profile.fullName,
          hospital_name: profile.hospitalName,
          role: profile.role,
        };
        await supabase.from('profiles').upsert(upsertProfile, { onConflict: 'email' });
        // Mark as synced locally
        await db.markUserAsSynced(profile.id);
      }
      Alert.alert('Success', 'Profile updated!');
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#1E88E5" /></View>;
  if (!profile) return <View style={styles.center}><Text>No profile found.</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account</Text>
      <TextInput
        style={styles.input}
        value={profile.fullName}
        onChangeText={t => setProfile({ ...profile, fullName: t })}
        placeholder="Full Name"
      />
      <TextInput
        style={styles.input}
        value={profile.email}
        onChangeText={t => setProfile({ ...profile, email: t })}
        placeholder="Email"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        value={profile.hospitalName}
        onChangeText={t => setProfile({ ...profile, hospitalName: t })}
        placeholder="Hospital Name"
      />
      <TextInput
        style={styles.input}
        value={profile.role}
        onChangeText={t => setProfile({ ...profile, role: t })}
        placeholder="Role"
      />
      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
      </TouchableOpacity>
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#1E88E5' },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#1E88E5', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
}); 