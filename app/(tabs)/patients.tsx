import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { router, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DatabaseHelper } from '../lib/database/DatabaseHelper';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

interface Patient {
  id: number;
  recordNumber: string;
  fullName: string;
  notes: string;
  createdAt: string;
  email?: string;
}

const PAGE_SIZE = 20;

export default function PatientsScreen() {
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [isFetchingMore, setIsFetchingMore] = React.useState(false);
  const navigation = useNavigation();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerAddButton}
          onPress={() => router.push('/new-patient')}
          accessibilityLabel="Add New Patient"
          accessibilityHint="Navigate to add a new patient"
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      ),
      title: 'Patients',
      headerStyle: { backgroundColor: '#1E88E5' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: '600' },
    });
  }, [navigation]);

  React.useEffect(() => {
    loadPatients(1, true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPatients(1, true);
    }, [])
  );

  // Load patients with pagination
  const loadPatients = async (pageToLoad = 1, reset = false) => {
    try {
      if (reset) {
        setIsLoading(true);
      } else {
        setIsFetchingMore(true);
      }
      const db = DatabaseHelper.getInstance();
      const allPatients = await db.getPatients();
      // Simulate pagination
      const start = 0;
      const end = pageToLoad * PAGE_SIZE;
      const pagedPatients = allPatients.slice(0, end);
      setPatients(pagedPatients);
      setHasMore(allPatients.length > end);
      setPage(pageToLoad);
    } catch (error) {
      console.error('Error loading patients:', error);
      Alert.alert('Error', 'Failed to load patients');
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  // Infinite scroll handler
  const handleEndReached = () => {
    if (hasMore && !isFetchingMore && !isLoading) {
      loadPatients(page + 1);
    }
  };

  // Real-time filtering
  const filteredPatients = React.useMemo(() => {
    if (!search.trim()) return patients;
    const lower = search.toLowerCase();
    return patients.filter((p) =>
      p.fullName.toLowerCase().includes(lower) ||
      p.recordNumber.toLowerCase().includes(lower) ||
      (p.email && p.email.toLowerCase().includes(lower))
    );
  }, [patients, search]);

  const renderPatientItem = ({ item }: { item: Patient }) => (
    <TouchableOpacity
      style={styles.patientCard}
      activeOpacity={0.95}
      accessibilityLabel={`Patient card for ${item.fullName}`}
      accessibilityHint="Tap to view details. Long press for more actions."
      onPress={() => router.push(`/patient/${item.id}`)}
      onLongPress={() => showPatientActions(item)}
    >
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{item.fullName}</Text>
        <Text style={styles.recordNumber}>Record #{item.recordNumber}</Text>
        {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
      </View>
      <View style={styles.iconContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          accessibilityLabel="Take Scan"
          accessibilityHint={`Start a new scan for ${item.fullName}`}
          onPress={() => {
            router.push({ pathname: '/scan', params: { patientId: item.id.toString() } });
          }}
        >
          <Ionicons name="eye-outline" size={24} color="#1E88E5" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          accessibilityLabel="Patient Actions"
          accessibilityHint={`Open actions for ${item.fullName}`}
          onPress={() => showPatientActions(item)}
        >
          <MaterialCommunityIcons name="file-document-outline" size={24} color="#1E88E5" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  function showPatientActions(item: Patient) {
    Alert.alert(
      'Patient Actions',
      `Choose an action for ${item.fullName}:`,
      [
        { text: 'View Details', onPress: () => router.push(`/patient/${item.id}`) },
        { text: 'View Reports', onPress: () => {/* Implement report viewing */} },
        { text: 'Share', onPress: () => {/* Implement share */} },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, record, or email"
            value={search}
            onChangeText={text => {
              setSearch(text);
            }}
            clearButtonMode="while-editing"
          />
        </View>
        <View style={styles.searchDivider} />
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : filteredPatients.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>
            {search ? 'No patients match your search.' : 'No patients registered yet.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPatients}
          renderItem={renderPatientItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.2}
          ListFooterComponent={hasMore && !isLoading ? (
            <View style={{ padding: 16 }}>
              <ActivityIndicator size="small" color="#007AFF" />
            </View>
          ) : null}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 20,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  recordNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  iconContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    backgroundColor: '#E3F0FF',
    borderRadius: 12,
    padding: 8,
    marginLeft: 8,
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
    marginBottom: 16,
  },
  addFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchBarWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F4F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: '100%',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    backgroundColor: 'transparent',
  },
  searchDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 10,
    width: '100%',
  },
  headerAddButton: {
    padding: 8,
  },
}); 