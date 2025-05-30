import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { DatabaseHelper } from '../lib/database/DatabaseHelper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const [firstName, setFirstName] = useState('');
  const [patientCount, setPatientCount] = useState(0);
  const [scanCount, setScanCount] = useState(0);
  const [diseaseStats, setDiseaseStats] = useState<{ [diagnosis: string]: number }>({});

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        const userStr = await SecureStore.getItemAsync('user');
        if (userStr && isActive) {
          const user = JSON.parse(userStr);
          setFirstName(user.fullName.split(' ')[0]);
        }
        const db = DatabaseHelper.getInstance();
        const patients = await db.getPatients();
        if (isActive) setPatientCount(patients.length);

        if (db['database']) {
          db['database'].transaction(tx => {
            tx.executeSql(
              'SELECT COUNT(*) as count FROM scans',
              [],
              (_, result) => isActive && setScanCount(result.rows.item(0).count)
            );
            tx.executeSql(
              'SELECT diagnosis, COUNT(*) as count FROM scans WHERE diagnosis IS NOT NULL AND diagnosis != "" GROUP BY diagnosis',
              [],
              (_, result) => {
                if (!isActive) return;
                const stats: { [diagnosis: string]: number } = {};
                for (let i = 0; i < result.rows.length; i++) {
                  const row = result.rows.item(i);
                  stats[row.diagnosis] = row.count;
                }
                setDiseaseStats(stats);
              }
            );
          });
        }
      })();
      return () => { isActive = false; };
    }, [])
  );

  return (
    <LinearGradient
      colors={["#1E88E5", "#6AB7FF"]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.welcome}>Welcome, <Text style={{ fontWeight: 'bold' }}>{firstName}</Text>!</Text>
      </View>
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Ionicons name="people" size={40} color="#1E88E5" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Total Patients</Text>
          <Text style={styles.cardValue}>{patientCount}</Text>
        </View>
        <View style={styles.card}>
          <Ionicons name="images" size={40} color="#1E88E5" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Total Scans</Text>
          <Text style={styles.cardValue}>{scanCount}</Text>
        </View>
      </View>
      <ScrollView style={styles.analyticsScroll} contentContainerStyle={styles.analyticsContainer}>
        <Text style={styles.analyticsTitle}>Disease Analytics</Text>
        {Object.keys(diseaseStats).length === 0 ? (
          <Text style={styles.noData}>No disease data yet.</Text>
        ) : (
          Object.entries(diseaseStats).map(([diagnosis, count]) => (
            <View key={diagnosis} style={styles.diseaseCard}>
              <Ionicons name="medkit" size={28} color="#1E88E5" style={{ marginRight: 12 }} />
              <Text style={styles.diseaseName}>{diagnosis}</Text>
              <Text style={styles.diseaseCount}>{count}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 30,
  },
  welcome: {
    fontSize: 28,
    color: '#fff',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.9,
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 28,
    alignItems: 'center',
    width: width * 0.4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  cardIcon: {
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 16,
    color: '#1E88E5',
    marginBottom: 6,
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  analyticsScroll: {
    marginTop: 30,
    width: width * 0.9,
    flex: 1,
  },
  analyticsContainer: {
    paddingBottom: 40,
  },
  analyticsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  noData: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  diseaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  diseaseName: {
    fontSize: 18,
    color: '#1E88E5',
    flex: 1,
    fontWeight: '600',
  },
  diseaseCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
}); 