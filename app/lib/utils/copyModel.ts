import * as FileSystem from 'expo-file-system';

export async function copyModelToDocuments(): Promise<void> {
  try {
    // Get the source and destination paths
    const sourceUri = FileSystem.documentDirectory + '../Model/mobile_retina_vit.pt';
    const destinationUri = FileSystem.documentDirectory + 'mobile_retina_vit.pt';

    // Check if the model already exists in the documents directory
    const fileInfo = await FileSystem.getInfoAsync(destinationUri);
    if (fileInfo.exists) {
      console.log('Model already exists in documents directory');
      return;
    }

    // Copy the model to the documents directory
    await FileSystem.copyAsync({
      from: sourceUri,
      to: destinationUri
    });

    console.log('Model copied to documents directory successfully');
  } catch (error) {
    console.error('Error copying model:', error);
    throw error;
  }
} 