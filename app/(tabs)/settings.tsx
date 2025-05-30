import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  action: () => void;
}

export default function SettingsScreen() {
  const handleSignOut = async () => {
    try {
      await AsyncStorage.removeItem('user');
      router.replace('/sign-in');
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const settings: SettingItem[] = [
    {
      id: '1',
      title: 'Account',
      icon: 'person-outline',
      action: () => router.push('/account'),
    },
    {
      id: '2',
      title: 'Notifications',
      icon: 'notifications-outline',
      action: () => router.push('/notifications'),
    },
    {
      id: '3',
      title: 'Privacy',
      icon: 'shield-outline',
      action: () => router.push('/privacy'),
    },
    {
      id: '4',
      title: 'Help & Support',
      icon: 'help-circle-outline',
      action: () => router.push('/support'),
    },
    {
      id: '5',
      title: 'About',
      icon: 'information-circle-outline',
      action: () => router.push('/about'),
    },
    {
      id: '6',
      title: 'Sign Out',
      icon: 'log-out-outline',
      action: handleSignOut,
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.action}
    >
      <View style={styles.settingInfo}>
        <Ionicons name={item.icon} size={24} color="#1a1a1a" />
        <Text style={styles.settingTitle}>{item.title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#666" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        {settings.map(renderSettingItem)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: '#1a1a1a',
  },
}); 