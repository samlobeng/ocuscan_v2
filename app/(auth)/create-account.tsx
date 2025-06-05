import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Checkbox from 'expo-checkbox';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DatabaseHelper } from '../lib/database/DatabaseHelper';
import * as SecureStore from 'expo-secure-store';
import { checkInternetConnection } from '../lib/network';

export default function CreateAccountScreen() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    hospitalName: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    hospitalName: '',
    password: '',
    confirmPassword: '',
    agreeTerms: '',
  });

  const [showTerms, setShowTerms] = useState(false);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      fullName: '',
      email: '',
      hospitalName: '',
      password: '',
      confirmPassword: '',
      agreeTerms: '',
    };

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    if (!formData.hospitalName.trim()) {
      newErrors.hospitalName = 'Hospital name is required';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    console.log('Starting account creation process...');
    if (validateForm()) {
      try {
        console.log('Form validation passed, checking email existence...');
        const db = DatabaseHelper.getInstance();
        
        try {
        const emailExists = await db.checkEmailExists(formData.email);
          console.log('Email exists check result:', emailExists);

        if (emailExists) {
            console.log('Email already exists');
          setErrors(prev => ({
            ...prev,
            email: 'An account with this email already exists'
          }));
            return;
          }
        } catch (error) {
          console.error('Error checking email existence:', error);
          Alert.alert(
            'Error',
            'Failed to check if email exists. Please try again.'
          );
          return;
        }

        console.log('Creating user...');
        let user;
        try {
          user = await db.createUser({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          hospitalName: formData.hospitalName,
          role: 'physician'
        });
          console.log('User created successfully:', user);
        } catch (error) {
          console.error('Error creating user:', error);
          Alert.alert(
            'Error',
            'Failed to create user account. Please try again.'
          );
          return;
        }

        // Store user session
        console.log('Storing user session...');
        try {
        await SecureStore.setItemAsync('user', JSON.stringify(user));
          console.log('User session stored successfully');
        } catch (error) {
          console.error('Error storing user session:', error);
          Alert.alert(
            'Warning',
            'Account created but failed to store session. Please try signing in.'
          );
          return;
        }
        
        console.log('Navigating to patients screen...');
        router.replace('/(tabs)/patients');
      } catch (error) {
        console.error('Error in account creation process:', error);
        if (error instanceof Error) {
          console.error('Error details:', error.message);
          console.error('Error stack:', error.stack);
        }
        Alert.alert(
          'Error',
          'An error occurred while creating your account. Please try again.'
        );
      }
    } else {
      console.log('Form validation failed');
    }
  };

  const TermsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showTerms}
      onRequestClose={() => setShowTerms(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Terms and Conditions</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowTerms(false)}
            >
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.modalSectionTitle}>1. Physician Verification</Text>
            <Text style={styles.modalText}>
              OcuScan is exclusively designed for licensed medical professionals. By using this application, you confirm that you are a licensed physician and agree to use the application in accordance with your medical license and professional obligations.
            </Text>

            <Text style={styles.modalSectionTitle}>2. Data Privacy</Text>
            <Text style={styles.modalText}>
              All patient data and medical images are handled with strict confidentiality. We comply with relevant medical data protection regulations and maintain the highest standards of data security.
            </Text>

            <Text style={styles.modalSectionTitle}>3. Medical Responsibility</Text>
            <Text style={styles.modalText}>
              While OcuScan provides AI-assisted analysis, the final medical decisions and diagnoses remain the responsibility of the licensed physician. The application serves as a diagnostic aid and should not replace professional medical judgment.
            </Text>

            <Text style={styles.modalSectionTitle}>4. Usage Guidelines</Text>
            <Text style={styles.modalText}>
              You agree to use OcuScan only for legitimate medical purposes and in accordance with your medical license. Any misuse or unauthorized access to the application is strictly prohibited.
            </Text>

            <Text style={styles.modalSectionTitle}>5. Updates and Changes</Text>
            <Text style={styles.modalText}>
              We reserve the right to update these terms and conditions. You will be notified of any significant changes that affect your use of the application.
            </Text>
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowTerms(false);
                setFormData({ ...formData, agreeTerms: true });
              }}
            >
              <Text style={styles.modalButtonText}>I Agree</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join OcuScan as a licensed physician
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={formData.fullName}
              onChangeText={(text) =>
                setFormData({ ...formData, fullName: text })
              }
              placeholderTextColor="#999"
            />
            {errors.fullName ? (
              <Text style={styles.errorText}>{errors.fullName}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hospital Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your hospital name"
              value={formData.hospitalName}
              onChangeText={(text) =>
                setFormData({ ...formData, hospitalName: text })
              }
              placeholderTextColor="#999"
            />
            {errors.hospitalName ? (
              <Text style={styles.errorText}>{errors.hospitalName}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a password"
              value={formData.password}
              onChangeText={(text) =>
                setFormData({ ...formData, password: text })
              }
              secureTextEntry
              placeholderTextColor="#999"
            />
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={(text) =>
                setFormData({ ...formData, confirmPassword: text })
              }
              secureTextEntry
              placeholderTextColor="#999"
            />
            {errors.confirmPassword ? (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            ) : null}
          </View>

          <View style={styles.termsContainer}>
            <View style={styles.checkboxGroup}>
              <Checkbox
                value={formData.agreeTerms}
                onValueChange={(value) =>
                  setFormData({ ...formData, agreeTerms: value })
                }
                color={formData.agreeTerms ? '#1E88E5' : undefined}
              />
              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>
                  I confirm that I am a licensed physician and agree to the{' '}
                  <Text
                    style={styles.termsLink}
                    onPress={() => setShowTerms(true)}
                  >
                    Terms and Conditions
                  </Text>
                </Text>
              </View>
            </View>
            {errors.agreeTerms ? (
              <Text style={styles.errorText}>{errors.agreeTerms}</Text>
            ) : null}
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.push('/sign-in')}
          >
            <Text style={styles.loginLinkText}>
              Already have an account? Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <TermsModal />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E88E5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  form: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingTop: 30,
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
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  termsContainer: {
    marginBottom: 20,
  },
  checkboxGroup: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  termsTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  termsText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  termsLink: {
    color: '#1E88E5',
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 5,
  },
  button: {
    backgroundColor: '#1E88E5',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#1E88E5',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalButton: {
    backgroundColor: '#1E88E5',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 