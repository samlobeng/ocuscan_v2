import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Disease {
  id: string;
  name: string;
  description: string;
  symptoms: string[];
  image: any; // TODO: Replace with actual image
}

const diseases: Disease[] = [
  {
    id: '1',
    name: 'Diabetic Retinopathy',
    description:
      'A diabetes complication that affects the eyes. It\'s caused by damage to the blood vessels of the light-sensitive tissue at the back of the eye (retina).',
    symptoms: [
      'Blurred vision',
      'Fluctuating vision',
      'Dark or empty areas in vision',
      'Vision loss',
      'Difficulty with color perception',
    ],
    image: require('../../assets/retina.jpeg'),
  },
  {
    id: '2',
    name: 'Age-related Macular Degeneration',
    description:
      'A disease that blurs the sharp, central vision needed for activities like reading and driving. It affects the macula, the part of the eye that allows you to see fine detail.',
    symptoms: [
      'Gradual loss of central vision',
      'Distorted vision',
      'Difficulty recognizing faces',
      'Need for brighter light when reading',
      'Blurred vision',
    ],
    image: require('../../assets/retina.jpeg'),
  },
  {
    id: '3',
    name: 'Glaucoma',
    description:
      'A group of eye conditions that damage the optic nerve, which is vital for good vision. This damage is often caused by abnormally high pressure in your eye.',
    symptoms: [
      'Patchy blind spots in peripheral vision',
      'Tunnel vision in advanced stages',
      'Severe headache',
      'Eye pain',
      'Nausea and vomiting',
    ],
    image: require('../../assets/retina.jpeg'),
  },
];

export default function EducationScreen() {
  const renderDiseaseCard = (disease: Disease) => (
    <TouchableOpacity
      key={disease.id}
      style={styles.diseaseCard}
      onPress={() => router.push(`/disease/${disease.id}` as any)}
    >
      <Image source={disease.image} style={styles.diseaseImage} />
      <View style={styles.diseaseInfo}>
        <Text style={styles.diseaseName}>{disease.name}</Text>
        <Text style={styles.diseaseDescription} numberOfLines={2}>
          {disease.description}
        </Text>
        <View style={styles.symptomsContainer}>
          {disease.symptoms.slice(0, 3).map((symptom, index) => (
            <View key={index} style={styles.symptomTag}>
              <Text style={styles.symptomText}>{symptom}</Text>
            </View>
          ))}
          {disease.symptoms.length > 3 && (
            <Text style={styles.moreSymptoms}>
              +{disease.symptoms.length - 3} more
            </Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#666" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Education</Text>
        <Text style={styles.subtitle}>Learn about retina diseases</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        {diseases.map(renderDiseaseCard)}
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  diseaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  diseaseImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  diseaseInfo: {
    flex: 1,
  },
  diseaseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  diseaseDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  symptomText: {
    fontSize: 12,
    color: '#1976D2',
  },
  moreSymptoms: {
    fontSize: 12,
    color: '#666',
    alignSelf: 'center',
  },
}); 