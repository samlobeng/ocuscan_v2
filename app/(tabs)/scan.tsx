import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  ActionSheetIOS,
} from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { DatabaseHelper } from '../lib/database/DatabaseHelper';

interface Patient {
  id: number;
  fullName: string;
  recordNumber: string;
}

export default function ScanScreen() {
  const { patientId } = useLocalSearchParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (!patientId) {
      setIsLoading(false);
      return;
    }
    loadPatient(patientId as string);
  }, [patientId]);

  useEffect(() => {
    navigation.setOptions({
      title: 'Scan Retina',
      headerStyle: { backgroundColor: '#1E88E5' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: '600' },
    });
  }, [navigation]);

  const loadPatient = async (id: string) => {
    setIsLoading(true);
    try {
      const db = DatabaseHelper.getInstance();
      const p = await db.getPatientById(Number(id));
      setPatient(p);
    } catch (error) {
      Alert.alert('Error', 'Failed to load patient');
    } finally {
      setIsLoading(false);
    }
  };

  const showUploadOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Photo Library', 'Files'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) pickImagesFromLibrary();
          if (buttonIndex === 2) pickImagesFromFiles();
        }
      );
    } else {
      Alert.alert('Upload Images', 'Choose source', [
        { text: 'Photo Library', onPress: pickImagesFromLibrary },
        { text: 'Files', onPress: pickImagesFromFiles },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const pickImagesFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to select images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setSelectedImages((prev) => ([...prev, ...uris] as string[]));
    }
  };

  const pickImagesFromFiles = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'image/*',
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (!result.canceled) {
      if ('assets' in result && Array.isArray(result.assets)) {
        const uris = result.assets.map((a) => a.uri);
        setSelectedImages((prev) => ([...prev, ...uris] as string[]));
      } else if ('uri' in result && result.uri) {
        setSelectedImages((prev) => ([...prev, result.uri] as string[]));
      }
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera permissions to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setSelectedImages((prev) => ([...prev, result.assets[0].uri] as string[]));
    }
  };

  const removeImage = (uri: string) => {
    setSelectedImages((prev) => prev.filter((img) => img !== uri));
  };

  const analyzeImage = async () => {
    if (selectedImages.length === 0) return;
    setIsAnalyzing(true);
    try {
      // TODO: Implement image analysis for all selected images
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated delay
      router.push('scan-results' as any);
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Error', 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (!patient) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No patient selected. Please select a patient from the Patients screen.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={[styles.content, { paddingBottom: 24 }]}> 
              <Text style={styles.scanTitle}>
                Retina scan for <Text style={styles.patientName}>{patient.fullName}</Text> (Record #{patient.recordNumber})
              </Text>
              <View style={styles.divider} />
              <View style={styles.scanSection}>
                {selectedImages.length > 0 ? (
                  <View style={styles.imagesGrid}>
                    <View style={styles.imagesRow}>
                      {selectedImages.map((uri) => (
                        <View key={uri} style={styles.imageThumbWrapper}>
                          <Image source={{ uri }} style={styles.imageThumb} />
                          <TouchableOpacity
                            style={styles.removeImageButton}
                            onPress={() => removeImage(uri)}
                            accessibilityLabel="Remove image"
                          >
                            <Ionicons name="close-circle" size={20} color="#FF3B30" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={[styles.button, styles.secondaryButton]}
                        onPress={() => setSelectedImages([])}
                      >
                        <Text style={styles.secondaryButtonText}>Clear All</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.button, isAnalyzing && styles.buttonDisabled]}
                        onPress={analyzeImage}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={styles.buttonText}>Analyze Images</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.uploadContainer}>
                    <View style={styles.uploadBox}>
                      <Ionicons name="camera-outline" size={64} color="#007AFF" />
                      <Text style={styles.uploadText}>
                        Take a photo or upload images of the retina
                      </Text>
                      <View style={styles.buttonContainer}>
                        <TouchableOpacity
                          style={[styles.button, styles.secondaryButton]}
                          onPress={showUploadOptions}
                        >
                          <Ionicons name="images-outline" size={24} color="#007AFF" />
                          <Text style={styles.secondaryButtonText}>Upload</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.button, styles.secondaryButton]}
                          onPress={takePhoto}
                        >
                          <Ionicons name="camera" size={24} color="#007AFF" />
                          <Text style={styles.secondaryButtonText}>Camera</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              </View>
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
  scanTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  patientName: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  uploadContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadBox: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  uploadText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  scanSection: {
    marginTop: 32,
    alignItems: 'center',
  },
  scanText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 8,
    marginBottom: 16,
    width: '100%',
  },
  imagesGrid: {
    width: '100%',
    marginBottom: 24,
  },
  imagesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
    justifyContent: 'center',
  },
  imageThumbWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  imageThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 10,
    zIndex: 2,
  },
}); 