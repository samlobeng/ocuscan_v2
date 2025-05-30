import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>OcuScan</Text>
        </View>
        <Text style={styles.subtitle}>
          Your AI-powered retinal disease detection assistant
        </Text>

        <View style={styles.authButtons}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => router.push('/sign-in')}
          >
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.push('/create-account')}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Create Account
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <Image 
                source={require('../assets/illustrations/patient-registration.png')}
                style={styles.stepImage}
                resizeMode="contain"
              />
              <Text style={styles.stepTitle}>1. Register Patient</Text>
              <Text style={styles.stepText}>
                Create a new patient profile or select an existing one
              </Text>
            </View>

            <View style={styles.step}>
              <Image 
                source={require('../assets/illustrations/image-capture.png')}
                style={styles.stepImage}
                resizeMode="contain"
              />
              <Text style={styles.stepTitle}>2. Capture Image</Text>
              <Text style={styles.stepText}>
                Take a clear photo of the patient's retina
              </Text>
            </View>

            <View style={styles.step}>
              <Image 
                source={require('../assets/illustrations/analysis.png')}
                style={styles.stepImage}
                resizeMode="contain"
              />
              <Text style={styles.stepTitle}>3. AI Analysis</Text>
              <Text style={styles.stepText}>
                Our AI analyzes the image for potential issues
              </Text>
            </View>

            <View style={styles.step}>
              <Image 
                source={require('../assets/illustrations/history.png')}
                style={styles.stepImage}
                resizeMode="contain"
              />
              <Text style={styles.stepTitle}>4. View Results</Text>
              <Text style={styles.stepText}>
                Get detailed analysis and track patient history
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Common Retinal Diseases</Text>
          <Image 
            source={require('../assets/retina.jpeg')}
            style={styles.retinaImage}
            resizeMode="contain"
          />
          <View style={styles.diseaseList}>
            <View style={styles.diseaseItem}>
              <MaterialCommunityIcons name="eye-check" size={24} color="#1E88E5" />
              <View style={styles.diseaseText}>
                <Text style={styles.diseaseTitle}>Diabetic Retinopathy</Text>
                <Text style={styles.diseaseDescription}>
                  A diabetes complication affecting the retina's blood vessels
                </Text>
              </View>
            </View>

            <View style={styles.diseaseItem}>
              <MaterialCommunityIcons name="eye-check" size={24} color="#1E88E5" />
              <View style={styles.diseaseText}>
                <Text style={styles.diseaseTitle}>Age-related Macular Degeneration</Text>
                <Text style={styles.diseaseDescription}>
                  Deterioration of the macula, affecting central vision
                </Text>
              </View>
            </View>

            <View style={styles.diseaseItem}>
              <MaterialCommunityIcons name="eye-check" size={24} color="#1E88E5" />
              <View style={styles.diseaseText}>
                <Text style={styles.diseaseTitle}>Glaucoma</Text>
                <Text style={styles.diseaseDescription}>
                  Damage to the optic nerve, often due to high eye pressure
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E88E5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: '#1E88E5',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
    marginBottom: 20,
  },
  authButtons: {
    width: '100%',
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1E88E5',
    marginBottom: 20,
  },
  stepsContainer: {
    gap: 20,
  },
  step: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  stepImage: {
    width: '100%',
    height: 150,
    marginBottom: 10,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E88E5',
    marginBottom: 5,
  },
  stepText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  retinaImage: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 15,
  },
  diseaseList: {
    gap: 15,
  },
  diseaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  diseaseText: {
    marginLeft: 15,
    flex: 1,
  },
  diseaseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E88E5',
    marginBottom: 4,
  },
  diseaseDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 15,
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
  primaryButton: {
    backgroundColor: '#1E88E5',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1E88E5',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#1E88E5',
  },
}); 