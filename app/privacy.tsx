import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PrivacyScreen() {
  const handleClearData = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('Data Cleared', 'All local data has been removed.');
    } catch (e) {
      Alert.alert('Error', 'Failed to clear data.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.text}>
        Your privacy is important to us. All patient data and medical images are handled with strict confidentiality. We comply with relevant medical data protection regulations and maintain the highest standards of data security.
        </Text>
      <TouchableOpacity style={styles.button} onPress={handleClearData}>
        <Text style={styles.buttonText}>Clear Local Data</Text>
      </TouchableOpacity>
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#1E88E5' },
  text: { fontSize: 16, marginBottom: 24 },
  button: { backgroundColor: '#ff3b30', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
}); 