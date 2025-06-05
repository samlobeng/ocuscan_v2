import * as FileSystem from 'expo-file-system';
import { Image } from 'react-native';

export interface DiseasePrediction {
  probability: number;
  detected: boolean;
}

export interface Predictions {
  [disease: string]: DiseasePrediction;
}

export class PredictionService {
  private static instance: PredictionService;
  private readonly API_URL = 'http://192.168.0.129:8000'; // Your local network IP

  private constructor() {}

  public static getInstance(): PredictionService {
    if (!PredictionService.instance) {
      PredictionService.instance = new PredictionService();
    }
    return PredictionService.instance;
  }

  public async predictImage(imageUri: string): Promise<Predictions | null> {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      } as any);

      console.log('Sending request to:', `${this.API_URL}/predict`);
      
      // Make API request
      const response = await fetch(`${this.API_URL}/predict`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400) {
          throw new Error(errorData.detail || 'Invalid image');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const predictions = await response.json();
      console.log('Received predictions:', predictions);
      return predictions;
    } catch (error) {
      console.error('Error making prediction:', error);
      throw error; // Re-throw to handle in the UI
    }
  }
} 