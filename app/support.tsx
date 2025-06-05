import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './lib/supabase';
import { checkInternetConnection } from './lib/network';

export default function SupportScreen() {
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const isOnline = await checkInternetConnection();
      if (isOnline) {
        await supabase.from('feedback').insert({ message: feedback });
        Alert.alert('Thank you!', 'Your feedback has been sent.');
      } else {
        await AsyncStorage.setItem('pendingFeedback', feedback);
        Alert.alert('Saved Offline', 'Your feedback will be sent when you are online.');
      }
      setFeedback('');
    } catch (e) {
      Alert.alert('Error', 'Failed to send feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Help & Support</Text>
      <Text style={styles.faqTitle}>FAQ</Text>
      <Text style={styles.faqQ}>Q: How do I add a new patient?</Text>
      <Text style={styles.faqA}>A: Go to the Patients tab and tap the + button.</Text>
      <Text style={styles.faqQ}>Q: How do I sync data?</Text>
      <Text style={styles.faqA}>A: Data syncs automatically when you are online, or you can use the Sync Now button in Settings.</Text>
      <Text style={styles.faqQ}>Q: How do I contact support?</Text>
      <Text style={styles.faqA}>A: Use the feedback form below.</Text>
      <Text style={styles.faqTitle}>Send Feedback</Text>
      <TextInput
        style={styles.input}
        value={feedback}
        onChangeText={setFeedback}
        placeholder="Type your feedback here..."
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={submitting || !feedback.trim()}>
        <Text style={styles.buttonText}>{submitting ? 'Sending...' : 'Send Feedback'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#1E88E5' },
  faqTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  faqQ: { fontWeight: 'bold', marginTop: 8 },
  faqA: { marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16, minHeight: 80 },
  button: { backgroundColor: '#1E88E5', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
}); 