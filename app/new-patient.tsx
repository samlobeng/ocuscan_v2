import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { DatabaseHelper } from './lib/database/DatabaseHelper';
import Checkbox from 'expo-checkbox';

export default function NewPatientScreen() {
  const [fullName, setFullName] = useState('');
  const [recordNumber, setRecordNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter the patient\'s full name');
      return;
    }

    if (!recordNumber.trim()) {
      Alert.alert('Error', 'Please enter the patient\'s record number');
      return;
    }

    if (!acceptedDisclaimer) {
      Alert.alert('Error', 'Please accept the data privacy disclaimer');
      return;
    }

    setIsSubmitting(true);

    try {
      const db = DatabaseHelper.getInstance();
      await db.createPatient({
        fullName: fullName.trim(),
        recordNumber: recordNumber.trim(),
        notes: notes.trim(),
      });

      Alert.alert(
        'Success',
        'Patient added successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add patient. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter patient's full name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Record Number *</Text>
            <TextInput
              style={styles.input}
              value={recordNumber}
              onChangeText={setRecordNumber}
              placeholder="Enter patient's record number"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any additional notes"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.disclaimerContainer}>
            <Checkbox
              value={acceptedDisclaimer}
              onValueChange={setAcceptedDisclaimer}
              color={acceptedDisclaimer ? '#007AFF' : undefined}
              style={styles.checkbox}
            />
            <Text style={styles.disclaimerText}>
              I confirm that I have obtained the patient's consent to store their
              data in accordance with data protection regulations. I understand
              that I am responsible for maintaining the confidentiality of this
              information.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}>
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Adding Patient...' : 'Add Patient'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  notesInput: {
    height: 100,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  checkbox: {
    margin: 4,
  },
  disclaimerText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 