import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../supabase';
import { checkInternetConnection } from '../network';

export interface User {
  id: number;
  email: string;
  password: string;
  fullName: string;
  hospitalName: string;
  role: string;
  createdAt: string;
  synced: boolean;
}

export interface Patient {
  id: number;
  recordNumber: string;
  fullName: string;
  notes: string;
  createdAt: string;
}

type SQLiteDatabase = SQLite.SQLiteDatabase;

type DatabaseOperation<T> = () => Promise<T>;

class Mutex {
  private locked: boolean = false;
  private queue: Array<() => void> = [];

  async acquire(): Promise<void> {
    if (!this.locked) {
      this.locked = true;
      return;
    }

    return new Promise<void>((resolve) => {
      this.queue.push(resolve);
    });
  }

  release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) next();
    } else {
      this.locked = false;
    }
  }
}

export class DatabaseHelper {
  private static instance: DatabaseHelper;
  private database: SQLiteDatabase | null = null;
  private readonly DB_NAME = 'ocuscan.db';

  private constructor() {
    this.initDatabase();
  }

  public static getInstance(): DatabaseHelper {
    if (!DatabaseHelper.instance) {
      DatabaseHelper.instance = new DatabaseHelper();
    }
    return DatabaseHelper.instance;
  }

  private async initDatabase() {
    try {
      console.log('Initializing database...');
      
      // Close any existing connection
      if (this.database) {
        await this.database.closeAsync();
        this.database = null;
      }

      // Open database
      this.database = SQLite.openDatabase(this.DB_NAME);
      console.log('Database opened successfully');

      // Create tables
      await this.createTables();
      console.log('Database initialization completed');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async createTables() {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    return new Promise<void>((resolve, reject) => {
      this.database!.transaction(
        (tx) => {
          // Create users table
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              email TEXT UNIQUE NOT NULL,
              password TEXT NOT NULL,
              full_name TEXT NOT NULL,
              hospital_name TEXT NOT NULL,
              role TEXT NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              synced INTEGER DEFAULT 0
            );
          `);

          // Create patients table
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS patients (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              record_number TEXT UNIQUE NOT NULL,
              full_name TEXT NOT NULL,
              notes TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `);

          // Create scans table
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS scans (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              patient_id INTEGER NOT NULL,
              image_path TEXT NOT NULL,
              diagnosis TEXT,
              confidence_score REAL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (patient_id) REFERENCES patients (id)
            );
          `);
        },
        (error) => {
          console.error('Error creating tables:', error);
          reject(error);
        },
        () => {
          console.log('Tables created successfully');
          resolve();
        }
      );
    });
  }

  public async createUser(user: Omit<User, 'id' | 'createdAt' | 'synced'>): Promise<User> {
    if (!this.database) {
      await this.initDatabase();
    }

    let isOnline = false;
    try {
      isOnline = await checkInternetConnection();
    } catch {}

    let supabaseUser = null;
    if (isOnline) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
        });
        if (error) throw error;
        supabaseUser = data.user;

        // Insert into profiles table
        if (supabaseUser) {
          try {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: supabaseUser.id, // or 'user_id' depending on your schema
                  email: user.email,
                  full_name: user.fullName,
                  hospital_name: user.hospitalName,
                  role: user.role,
                  created_at: new Date().toISOString(),
                },
              ]);
            if (profileError) throw profileError;
          } catch (error) {
            console.error('Error inserting profile in Supabase:', error);
          }
        }
      } catch (error) {
        console.error('Error creating user in Supabase:', error);
      }
    }

    return new Promise((resolve, reject) => {
      this.database!.transaction(
        (tx) => {
          tx.executeSql(
            `INSERT INTO users (email, password, full_name, hospital_name, role, synced)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              user.email,
              user.password,
              user.fullName,
              user.hospitalName,
              user.role,
              isOnline && supabaseUser ? 1 : 0
            ],
            (_, result) => {
              if (result.insertId) {
                resolve({
                  id: result.insertId,
                  ...user,
                  createdAt: new Date().toISOString(),
                  synced: isOnline && supabaseUser ? true : false
                });
              } else {
                reject(new Error('Failed to create user'));
              }
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  public async checkEmailExists(email: string): Promise<boolean> {
    if (!this.database) {
      await this.initDatabase();
    }

    return new Promise((resolve, reject) => {
      this.database!.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT COUNT(*) as count FROM users WHERE email = ?',
            [email],
            (_, result) => {
              const count = result.rows.item(0).count;
              resolve(count > 0);
            },
            (_, error) => {
              console.error('Error checking email:', error);
              reject(error);
              return false;
            }
          );
        },
        (error) => {
          console.error('Transaction error checking email:', error);
          reject(error);
        }
      );
    });
  }

  public async authenticateUser(email: string, password: string): Promise<User | null> {
    if (!this.database) {
      await this.initDatabase();
    }

    return new Promise((resolve, reject) => {
      this.database!.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT * FROM users WHERE email = ? AND password = ?',
            [email, password],
            (_, result) => {
              if (result.rows.length > 0) {
                const user = result.rows.item(0);
                resolve({
                  id: user.id,
                  email: user.email,
                  password: user.password,
                  fullName: user.full_name,
                  hospitalName: user.hospital_name,
                  role: user.role,
                  createdAt: user.created_at,
                  synced: user.synced === 1
                });
              } else {
                resolve(null);
              }
            },
            (_, error) => {
              console.error('Error authenticating user:', error);
              reject(error);
              return false;
            }
          );
        },
        (error) => {
          console.error('Transaction error authenticating user:', error);
          reject(error);
        }
      );
    });
  }

  public async createPatient(patient: { fullName: string; recordNumber: string; notes: string }): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    let isOnline = false;
    try {
      isOnline = await checkInternetConnection();
    } catch {}

    let supabaseId = null;
    let userId = null;
    if (isOnline) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
        const { data, error } = await supabase
          .from('patients')
          .insert([{
            full_name: patient.fullName,
            record_number: patient.recordNumber,
            notes: patient.notes,
            created_by: userId,
          }])
          .select()
          .single();
        if (error) throw error;
        supabaseId = data.id;
      } catch (error) {
        console.error('Error creating patient in Supabase:', error);
      }
    }

    return new Promise((resolve, reject) => {
      this.database!.transaction(
        (tx) => {
          tx.executeSql(
            `INSERT INTO patients (record_number, full_name, notes, synced)
             VALUES (?, ?, ?, ?)`,
            [
              patient.recordNumber,
              patient.fullName,
              patient.notes,
              isOnline && supabaseId ? 1 : 0
            ],
            (_, result) => {
              resolve();
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  public async getPatients(): Promise<Array<{
    id: number;
    recordNumber: string;
    fullName: string;
    notes: string;
    createdAt: string;
  }>> {
    if (!this.database) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.database!.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT * FROM patients ORDER BY created_at DESC',
            [],
            (_, result) => {
              const patients = [];
              for (let i = 0; i < result.rows.length; i++) {
                const row = result.rows.item(i);
                patients.push({
                  id: row.id,
                  recordNumber: row.record_number,
                  fullName: row.full_name,
                  notes: row.notes,
                  createdAt: row.created_at,
                });
              }
              resolve(patients);
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        (error) => {
          console.error('Error getting patients:', error);
          reject(error);
        }
      );
    });
  }

  public async getPatientById(id: number): Promise<Patient | null> {
    if (!this.database) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.database!.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT * FROM patients WHERE id = ?',
            [id],
            (_, result) => {
              if (result.rows.length > 0) {
                const row = result.rows.item(0);
                resolve({
                  id: row.id,
                  recordNumber: row.record_number,
                  fullName: row.full_name,
                  notes: row.notes,
                  createdAt: row.created_at,
                });
              } else {
                resolve(null);
              }
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        (error) => {
          console.error('Error getting patient by id:', error);
          reject(error);
        }
      );
    });
  }

  public async updatePatient(
    id: number,
    patient: { fullName: string; recordNumber: string; notes: string }
  ): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.database!.transaction(
        (tx) => {
          tx.executeSql(
            `UPDATE patients 
             SET full_name = ?, record_number = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [patient.fullName, patient.recordNumber, patient.notes, id],
            (_, result) => {
              if (result.rowsAffected > 0) {
                resolve();
              } else {
                reject(new Error('Failed to update patient'));
              }
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        (error) => {
          console.error('Error updating patient:', error);
          reject(error);
        }
      );
    });
  }

  public async syncPendingUsers(): Promise<void> {
    if (!this.database) {
      await this.initDatabase();
    }

    const isOnline = await checkInternetConnection();
    if (!isOnline) return;

    return new Promise((resolve, reject) => {
      this.database!.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT * FROM users WHERE synced = 0',
            [],
            async (_, result) => {
              const users = [];
              for (let i = 0; i < result.rows.length; i++) {
                users.push(result.rows.item(i));
              }

              for (const user of users) {
                try {
                  const { data, error } = await supabase.auth.signUp({
                    email: user.email,
                    password: user.password,
                  });

                  if (error) throw error;

                  tx.executeSql(
                    'UPDATE users SET synced = 1 WHERE id = ?',
                    [user.id]
                  );
                } catch (error) {
                  console.error(`Error syncing user ${user.id}:`, error);
                }
              }
              resolve();
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        (error) => {
          console.error('Error syncing users:', error);
          reject(error);
        }
      );
    });
  }

  public async syncPendingPatients(): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');
    const isOnline = await checkInternetConnection();
    if (!isOnline) return;

    let userId = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    } catch {}

    return new Promise((resolve, reject) => {
      this.database!.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT * FROM patients WHERE synced = 0',
            [],
            async (_, result) => {
              for (let i = 0; i < result.rows.length; i++) {
                const patient = result.rows.item(i);
                try {
                  const { data, error } = await supabase
                    .from('patients')
                    .insert([{
                      full_name: patient.full_name,
                      record_number: patient.record_number,
                      notes: patient.notes,
                      created_by: userId,
                    }])
                    .select()
                    .single();
                  if (!error) {
                    tx.executeSql(
                      'UPDATE patients SET synced = 1 WHERE id = ?',
                      [patient.id]
                    );
                  }
                } catch (error) {
                  console.error('Error syncing patient:', error);
                }
              }
              resolve();
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  public async syncPendingScans(): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');
    const isOnline = await checkInternetConnection();
    if (!isOnline) return;

    let userId = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    } catch {}

    return new Promise((resolve, reject) => {
      this.database!.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT * FROM scans WHERE synced = 0 OR synced IS NULL',
            [],
            async (_, result) => {
              for (let i = 0; i < result.rows.length; i++) {
                const scan = result.rows.item(i);
                try {
                  const { data, error } = await supabase
                    .from('scans')
                    .insert([{
                      patient_id: scan.patient_id,
                      image_path: scan.image_path,
                      diagnosis: scan.diagnosis,
                      confidence_score: scan.confidence_score,
                      created_at: scan.created_at,
                      created_by: userId,
                    }])
                    .select()
                    .single();
                  if (!error) {
                    tx.executeSql(
                      'UPDATE scans SET synced = 1 WHERE id = ?',
                      [scan.id]
                    );
                  }
                } catch (error) {
                  console.error('Error syncing scan:', error);
                }
              }
              resolve();
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        (error) => {
          reject(error);
        }
      );
    });
  }
} 