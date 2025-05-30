import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { DatabaseHelper } from '../lib/database/DatabaseHelper';

interface Patient {
  id: number;
  recordNumber: string;
  fullName: string;
  notes: string;
  createdAt: string;
}

export default function PatientDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPatient, setEditedPatient] = useState<Partial<Patient>>({});

  useEffect(() => {
    loadPatient();
  }, [id]);

  const loadPatient = async () => {
    try {
      const db = DatabaseHelper.getInstance();
      const loadedPatient = await db.getPatientById(Number(id));
      setPatient(loadedPatient);
      if (loadedPatient) {
        setEditedPatient(loadedPatient);
      }
    } catch (error) {
      console.error('Error loading patient:', error);
      Alert.alert('Error', 'Failed to load patient details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editedPatient.fullName?.trim()) {
      Alert.alert('Error', 'Please enter the patient\'s full name');
      return;
    }

    if (!editedPatient.recordNumber?.trim()) {
      Alert.alert('Error', 'Please enter the patient\'s record number');
      return;
    }

    try {
      const db = DatabaseHelper.getInstance();
      await db.updatePatient(Number(id), {
        fullName: editedPatient.fullName.trim(),
        recordNumber: editedPatient.recordNumber.trim(),
        notes: editedPatient.notes?.trim() || '',
      });

      setPatient({
        ...patient!,
        ...editedPatient,
      });
      setIsEditing(false);
      Alert.alert('Success', 'Patient details updated successfully');
    } catch (error) {
      console.error('Error updating patient:', error);
      Alert.alert('Error', 'Failed to update patient details');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (!patient) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Patient not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.label}>Full Name</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedPatient.fullName}
                  onChangeText={(text) => setEditedPatient({ ...editedPatient, fullName: text })}
                  placeholder="Enter patient's full name"
                  placeholderTextColor="#999"
                />
              ) : (
                <Text style={styles.value}>{patient.fullName}</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Record Number</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedPatient.recordNumber}
                  onChangeText={(text) => setEditedPatient({ ...editedPatient, recordNumber: text })}
                  placeholder="Enter patient's record number"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              ) : (
                <Text style={styles.value}>{patient.recordNumber}</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Notes</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.input, styles.notesInput]}
                  value={editedPatient.notes}
                  onChangeText={(text) => setEditedPatient({ ...editedPatient, notes: text })}
                  placeholder="Add any additional notes"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              ) : (
                <Text style={styles.value}>{patient.notes || 'No notes'}</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Created At</Text>
              <Text style={styles.value}>
                {new Date(patient.createdAt).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              {isEditing ? (
                <>
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleSave}>
                    <Text style={styles.buttonText}>Save Changes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => {
                      setEditedPatient(patient);
                      setIsEditing(false);
                    }}>
                    <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[styles.button, styles.editButton]}
                  onPress={() => setIsEditing(true)}>
                  <Text style={styles.buttonText}>Edit Details</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#fff',
  },
  notesInput: {
    height: 100,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#007AFF',
  },
}); 