import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

export class DatabaseManager {
  private static readonly DB_NAME = 'ocuscan.db';
  private static readonly BACKUP_DIR = `${FileSystem.documentDirectory}backups/`;

  /**
   * Get the database file path
   */
  public static async getDatabasePath(): Promise<string> {
    if (Platform.OS === 'web') {
      throw new Error('Web platform does not support direct database file access');
    }

    const db = SQLite.openDatabase(this.DB_NAME);
    const result = await db.execAsync([{ sql: 'PRAGMA database_list;', args: [] }], false);
    const dbPath = ((result[0] as unknown) as SQLite.SQLResultSet).rows.item(0).file;
    return dbPath;
  }

  /**
   * Create a backup of the database
   */
  public static async createBackup(): Promise<string> {
    const dbPath = await this.getDatabasePath();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${this.BACKUP_DIR}ocuscan_${timestamp}.db`;

    // Ensure backup directory exists
    const dirInfo = await FileSystem.getInfoAsync(this.BACKUP_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.BACKUP_DIR, { intermediates: true });
    }

    // Copy database file to backup location
    await FileSystem.copyAsync({
      from: dbPath,
      to: backupPath
    });

    return backupPath;
  }

  /**
   * Restore database from a backup
   */
  public static async restoreFromBackup(backupPath: string): Promise<void> {
    const dbPath = await this.getDatabasePath();
    
    // Close all database connections
    const db = SQLite.openDatabase(this.DB_NAME);
    await db.closeAsync();

    // Copy backup file to database location
    await FileSystem.copyAsync({
      from: backupPath,
      to: dbPath
    });
  }

  /**
   * List all database backups
   */
  public static async listBackups(): Promise<string[]> {
    const dirInfo = await FileSystem.getInfoAsync(this.BACKUP_DIR);
    if (!dirInfo.exists) {
      return [];
    }

    const files = await FileSystem.readDirectoryAsync(this.BACKUP_DIR);
    return files.filter(file => file.endsWith('.db'));
  }

  /**
   * Delete a database backup
   */
  public static async deleteBackup(backupPath: string): Promise<void> {
    await FileSystem.deleteAsync(backupPath);
  }

  /**
   * Get database size
   */
  public static async getDatabaseSize(): Promise<number> {
    const dbPath = await this.getDatabasePath();
    const fileInfo = await FileSystem.getInfoAsync(dbPath);
    if (!fileInfo.exists) {
      return 0;
    }
    return fileInfo.size || 0;
  }

  /**
   * Export database to a file
   */
  public static async exportDatabase(destinationPath: string): Promise<void> {
    const dbPath = await this.getDatabasePath();
    await FileSystem.copyAsync({
      from: dbPath,
      to: destinationPath
    });
  }

  /**
   * Import database from a file
   */
  public static async importDatabase(sourcePath: string): Promise<void> {
    const dbPath = await this.getDatabasePath();
    
    // Close all database connections
    const db = SQLite.openDatabase(this.DB_NAME);
    await db.closeAsync();

    // Copy source file to database location
    await FileSystem.copyAsync({
      from: sourcePath,
      to: dbPath
    });
  }
} 