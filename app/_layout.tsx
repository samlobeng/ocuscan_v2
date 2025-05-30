import React from 'react';
import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const user = await SecureStore.getItemAsync('user');
      const hasSeenOnboarding = await SecureStore.getItemAsync('hasSeenOnboarding');
      
      setIsAuthenticated(!!user);
      
      // If user hasn't seen onboarding, redirect to onboarding screen
      if (!hasSeenOnboarding) {
        router.replace('/onboarding');
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1E88E5" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="onboarding"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="(auth)" 
        options={{ 
          headerShown: false,
          gestureEnabled: false,
        }} 
      />
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: false,
          gestureEnabled: false,
        }} 
      />
      <Stack.Screen 
        name="new-patient" 
        options={{ 
          presentation: 'modal',
          title: 'New Patient',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#1E88E5',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerShadowVisible: false,
          headerBackTitle: 'Back',
        }} 
      />
      <Stack.Screen 
        name="patient/[id]" 
        options={{ 
          title: 'Patient Details',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#1E88E5',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerShadowVisible: false,
          headerBackTitle: 'Back',
        }} 
      />
      <Stack.Screen 
        name="scan-results" 
        options={{ 
          presentation: 'modal',
          title: 'Scan Results',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#1E88E5',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerShadowVisible: false,
          headerBackTitle: 'Back',
        }} 
      />
      <Stack.Screen 
        name="about" 
        options={{ 
          presentation: 'modal',
          title: 'About',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#1E88E5',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerShadowVisible: false,
          headerBackTitle: 'Back',
        }} 
      />
      <Stack.Screen 
        name="support" 
        options={{ 
          presentation: 'modal',
          title: 'Support',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#1E88E5',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerShadowVisible: false,
          headerBackTitle: 'Back',
        }} 
      />
      <Stack.Screen 
        name="privacy" 
        options={{ 
          presentation: 'modal',
          title: 'Privacy',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#1E88E5',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerShadowVisible: false,
          headerBackTitle: 'Back',
        }} 
      />
      <Stack.Screen 
        name="notifications" 
        options={{ 
          presentation: 'modal',
          title: 'Notifications',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#1E88E5',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerShadowVisible: false,
          headerBackTitle: 'Back',
        }} 
      />
      <Stack.Screen 
        name="account" 
        options={{ 
          presentation: 'modal',
          title: 'Account',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#1E88E5',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerShadowVisible: false,
          headerBackTitle: 'Back',
        }} 
      />
    </Stack>
  );
} 