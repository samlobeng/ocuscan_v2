import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Predictions } from './lib/services/PredictionService';

export default function ScanResultsScreen() {
  const { results, patientId } = useLocalSearchParams();
  const predictions = results ? JSON.parse(results as string) : {};

  const renderPredictions = (imageUri: string, predictions: Predictions) => {
    const detectedDiseases = Object.entries(predictions)
      .filter(([_, pred]) => pred.detected)
      .sort(([_, a], [__, b]) => b.probability - a.probability);

    return (
      <View key={imageUri} style={styles.imageResults}>
        <Image source={{ uri: imageUri }} style={styles.image} />
        <View style={styles.predictionsContainer}>
          <Text style={styles.sectionTitle}>Detected Conditions:</Text>
          {detectedDiseases.length > 0 ? (
            detectedDiseases.map(([disease, pred]) => (
              <View key={disease} style={styles.predictionItem}>
                <Text style={styles.diseaseName}>{disease}</Text>
                <Text style={styles.probability}>
                  Confidence: {(pred.probability * 100).toFixed(1)}%
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDiseases}>No conditions detected</Text>
          )}

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Detailed Analysis:</Text>
          {Object.entries(predictions)
            .sort(([_, a], [__, b]) => b.probability - a.probability)
            .map(([disease, pred]) => (
              <View key={disease} style={styles.predictionItem}>
                <Text style={styles.diseaseName}>{disease}</Text>
                <Text style={styles.probability}>
                  Confidence: {(pred.probability * 100).toFixed(1)}%
                </Text>
              </View>
            ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Scan Results</Text>
        <Text style={styles.sectionDescription}>
          Analysis of retinal images
        </Text>
        
        {Object.entries(predictions).map(([imageUri, preds]) => 
          renderPredictions(imageUri, preds as Predictions)
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  imageResults: {
    marginBottom: 30,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  predictionsContainer: {
    padding: 15,
  },
  predictionItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: '#1a1a1a',
  },
  probability: {
    color: '#666',
    fontSize: 14,
  },
  noDiseases: {
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
  },
}); 