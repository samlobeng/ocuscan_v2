import * as FileSystem from 'expo-file-system';
import { DatabaseManager } from './DatabaseManager';

export async function databaseManagementExample() {
  try {
    // Get database path
    const dbPath = await DatabaseManager.getDatabasePath();
    console.log('Database path:', dbPath);

    // Create a backup
    const backupPath = await DatabaseManager.createBackup();
    console.log('Backup created at:', backupPath);

    // List all backups
    const backups = await DatabaseManager.listBackups();
    console.log('Available backups:', backups);

    // Get database size
    const size = await DatabaseManager.getDatabaseSize();
    console.log('Database size:', size, 'bytes');

    // Example of exporting database
    const exportPath = `${FileSystem.documentDirectory}exports/ocuscan_export.db`;
    await DatabaseManager.exportDatabase(exportPath);
    console.log('Database exported to:', exportPath);

    // Example of restoring from backup
    if (backups.length > 0) {
      const latestBackup = backups[backups.length - 1];
      await DatabaseManager.restoreFromBackup(latestBackup);
      console.log('Database restored from backup:', latestBackup);
    }

  } catch (error) {
    console.error('Error managing database:', error);
  }
} 