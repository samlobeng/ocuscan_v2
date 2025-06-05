import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PredictionService, Predictions } from '../lib/services/PredictionService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function RetinaResultsScreen() {
  const { imageUri } = useLocalSearchParams();
  const router = useRouter();
  const [predictions, setPredictions] = React.useState<Predictions | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    analyzeImage();
  }, []);

  const analyzeImage = async () => {
    try {
      setLoading(true);
      setError(null);
      const predictionService = PredictionService.getInstance();
      const results = await predictionService.predictImage(imageUri as string);
      setPredictions(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };

  const getDiseaseColor = (probability: number) => {
    if (probability > 0.7) return '#FF4B4B';
    if (probability > 0.5) return '#FFA500';
    return '#4CAF50';
  };

  const getDiseaseIcon = (probability: number) => {
    if (probability > 0.7) return 'alert-circle';
    if (probability > 0.5) return 'alert';
    return 'check-circle';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Analyzing Retina Image...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={64} color="#FF4B4B" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={analyzeImage}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const detectedDiseases = predictions 
    ? Object.entries(predictions)
        .filter(([_, pred]) => pred.detected)
        .sort(([_, a], [__, b]) => b.probability - a.probability)
    : [];

  const otherDiseases = predictions
    ? Object.entries(predictions)
        .filter(([_, pred]) => !pred.detected)
        .sort(([_, a], [__, b]) => b.probability - a.probability)
    : [];

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#007AFF', '#00C6FF']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Retina Analysis Results</Text>
      </LinearGradient>

      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri as string }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {detectedDiseases.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detected Conditions</Text>
          {detectedDiseases.map(([disease, pred]) => (
            <View key={disease} style={styles.diseaseCard}>
              <View style={styles.diseaseHeader}>
                <MaterialCommunityIcons
                  name={getDiseaseIcon(pred.probability)}
                  size={24}
                  color={getDiseaseColor(pred.probability)}
                />
                <Text style={styles.diseaseName}>{disease}</Text>
              </View>
              <View style={styles.probabilityBar}>
                <View 
                  style={[
                    styles.probabilityFill,
                    { 
                      width: `${pred.probability * 100}%`,
                      backgroundColor: getDiseaseColor(pred.probability)
                    }
                  ]} 
                />
              </View>
              <Text style={styles.probabilityText}>
                Confidence: {(pred.probability * 100).toFixed(1)}%
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.noDiseasesContainer}>
          <MaterialCommunityIcons name="check-circle" size={64} color="#4CAF50" />
          <Text style={styles.noDiseasesText}>No diseases detected</Text>
          <Text style={styles.noDiseasesSubtext}>
            The retina appears to be healthy
          </Text>
        </View>
      )}

      {otherDiseases.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other Conditions</Text>
          {otherDiseases.map(([disease, pred]) => (
            <View key={disease} style={styles.diseaseCard}>
              <View style={styles.diseaseHeader}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={24}
                  color="#4CAF50"
                />
                <Text style={styles.diseaseName}>{disease}</Text>
              </View>
              <View style={styles.probabilityBar}>
                <View 
                  style={[
                    styles.probabilityFill,
                    { 
                      width: `${pred.probability * 100}%`,
                      backgroundColor: '#4CAF50'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.probabilityText}>
                Confidence: {(pred.probability * 100).toFixed(1)}%
              </Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity 
        style={styles.newScanButton}
        onPress={() => router.back()}
      >
        <Text style={styles.newScanButtonText}>New Scan</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FF4B4B',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  imageContainer: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: '100%',
    height: 200,
  },
  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  diseaseCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  diseaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  probabilityBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  probabilityFill: {
    height: '100%',
    borderRadius: 4,
  },
  probabilityText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  noDiseasesContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  noDiseasesText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 16,
  },
  noDiseasesSubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  newScanButton: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  newScanButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 