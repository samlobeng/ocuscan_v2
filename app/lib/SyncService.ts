import { DatabaseHelper } from './database/DatabaseHelper';

export class SyncService {
  static async syncAll() {
    const db = DatabaseHelper.getInstance();
    try {
      await db.syncPendingUsers();
    } catch (e) {
      console.error('Error syncing users:', e);
    }
    try {
      await db.syncPendingPatients();
    } catch (e) {
      console.error('Error syncing patients:', e);
    }
    try {
      await db.syncPendingScans();
    } catch (e) {
      console.error('Error syncing scans:', e);
    }
  }
} 