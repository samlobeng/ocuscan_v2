import { DatabaseHelper } from './database/DatabaseHelper';
import { subscribeToNetworkChanges } from './network';

class SyncService {
  private static instance: SyncService;
  private isSyncing: boolean = false;

  private constructor() {
    this.initializeNetworkListener();
  }

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private initializeNetworkListener() {
    subscribeToNetworkChanges(async (isConnected) => {
      if (isConnected && !this.isSyncing) {
        await this.syncPendingData();
      }
    });
  }

  private async syncPendingData() {
    if (this.isSyncing) return;

    try {
      this.isSyncing = true;
      const db = DatabaseHelper.getInstance();
      await db.syncPendingUsers();
    } catch (error) {
      console.error('Error syncing pending data:', error);
    } finally {
      this.isSyncing = false;
    }
  }
}

export const syncService = SyncService.getInstance(); 