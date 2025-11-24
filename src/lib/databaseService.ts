import SQLite from 'react-native-sqlite-storage';
import { SoilList, ParameterList, CreateSoilRequest, UpdateParameterRequest, ParameterRequest } from './types';

// Enable debugging
SQLite.DEBUG(true);
SQLite.enablePromise(true);

const DATABASE_NAME = 'cloudtree.db';
const DATABASE_VERSION = '1.0';
const DATABASE_DISPLAY_NAME = 'CloudTree Local Database';
const DATABASE_SIZE = 200000;

type SQLiteDatabase = any; // Using any to avoid type issues with native module

let db: SQLiteDatabase | null = null;

// Sync status types
export type SyncStatus = 'synced' | 'pending' | 'conflict';

export interface LocalSoil extends SoilList {
    sync_status: SyncStatus;
    last_modified: string;
}

export interface LocalParameter extends ParameterList {
    sync_status: SyncStatus;
    last_modified: string;
}

/**
 * Initialize the database and create tables if they don't exist
 */
export const initDatabase = async (): Promise<void> => {
    try {
        db = await SQLite.openDatabase(
            DATABASE_NAME,
            DATABASE_VERSION,
            DATABASE_DISPLAY_NAME,
            DATABASE_SIZE
        );

        console.log('Database opened successfully');

        // Create Soils table
        await db.executeSql(`
            CREATE TABLE IF NOT EXISTS Soils (
                Soil_ID TEXT PRIMARY KEY,
                Soil_Name TEXT NOT NULL,
                Loc_Latitude REAL NOT NULL,
                Loc_Longitude REAL NOT NULL,
                sync_status TEXT DEFAULT 'pending',
                last_modified TEXT DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create Parameters table
        await db.executeSql(`
            CREATE TABLE IF NOT EXISTS Parameters (
                Parameter_ID TEXT PRIMARY KEY,
                Soil_ID TEXT NOT NULL,
                Hum REAL NOT NULL,
                Temp REAL NOT NULL,
                Ec REAL NOT NULL,
                Ph REAL NOT NULL,
                Nitrogen REAL NOT NULL,
                Phosphorus REAL NOT NULL,
                Potassium REAL NOT NULL,
                Comments TEXT,
                Date_Recorded TEXT NOT NULL,
                sync_status TEXT DEFAULT 'pending',
                last_modified TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (Soil_ID) REFERENCES Soils(Soil_ID) ON DELETE CASCADE
            );
        `);

        // Create sync log table
        await db.executeSql(`
            CREATE TABLE IF NOT EXISTS SyncLog (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sync_date TEXT NOT NULL,
                status TEXT NOT NULL,
                message TEXT,
                items_synced INTEGER DEFAULT 0
            );
        `);

        // Create ID mapping table for local ↔ backend ID translation
        await db.executeSql(`
            CREATE TABLE IF NOT EXISTS ID_Mappings (
                local_id TEXT PRIMARY KEY,
                backend_id TEXT UNIQUE,
                entity_type TEXT NOT NULL CHECK(entity_type IN ('soil', 'parameter')),
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                synced_at TEXT
            );
        `);

        // Create indexes for fast lookups
        await db.executeSql(`
            CREATE INDEX IF NOT EXISTS idx_backend_id ON ID_Mappings(backend_id);
        `);

        await db.executeSql(`
            CREATE INDEX IF NOT EXISTS idx_entity_type ON ID_Mappings(entity_type);
        `);

        console.log('Database tables created successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};

/**
 * Close the database connection
 */
export const closeDatabase = async (): Promise<void> => {
    if (db) {
        await db.close();
        console.log('Database closed');
        db = null;
    }
};

// ============================================================================
// ID MAPPING FUNCTIONS - Local ↔ Backend ID Translation
// ============================================================================

/**
 * Generate a new local Soil ID (L_S00001, L_S00002, etc.)
 */
export const generateLocalSoilId = async (): Promise<string> => {
    if (!db) throw new Error('Database not initialized');
    
    const [result] = await db.executeSql(
        "SELECT COUNT(*) as count FROM Soils"
    );
    const count = result.rows.item(0).count;
    return `L_S${String(count + 1).padStart(5, '0')}`;
};

/**
 * Generate a new local Parameter ID (L_P00001, L_P00002, etc.)
 */
export const generateLocalParameterId = async (): Promise<string> => {
    if (!db) throw new Error('Database not initialized');
    
    const [result] = await db.executeSql(
        "SELECT COUNT(*) as count FROM Parameters"
    );
    const count = result.rows.item(0).count;
    return `L_P${String(count + 1).padStart(5, '0')}`;
};

/**
 * Get backend ID from local ID
 */
export const getBackendId = async (localId: string): Promise<string | null> => {
    if (!db) throw new Error('Database not initialized');
    
    const [result] = await db.executeSql(
        'SELECT backend_id FROM ID_Mappings WHERE local_id = ?',
        [localId]
    );
    
    if (result.rows.length > 0) {
        return result.rows.item(0).backend_id;
    }
    return null;
};

/**
 * Get local ID from backend ID
 */
export const getLocalId = async (backendId: string): Promise<string | null> => {
    if (!db) throw new Error('Database not initialized');
    
    const [result] = await db.executeSql(
        'SELECT local_id FROM ID_Mappings WHERE backend_id = ?',
        [backendId]
    );
    
    if (result.rows.length > 0) {
        return result.rows.item(0).local_id;
    }
    return null;
};

/**
 * Create or update ID mapping between local and backend IDs
 */
export const mapIds = async (
    localId: string,
    backendId: string,
    entityType: 'soil' | 'parameter'
): Promise<void> => {
    if (!db) throw new Error('Database not initialized');
    
    const now = new Date().toISOString();
    
    await db.executeSql(
        `INSERT OR REPLACE INTO ID_Mappings (local_id, backend_id, entity_type, synced_at)
         VALUES (?, ?, ?, ?)`,
        [localId, backendId, entityType, now]
    );
    
    console.log(`ID Mapping: ${localId} ↔ ${backendId} (${entityType})`);
};

/**
 * Check if a local ID has been synced (has backend mapping)
 */
export const isSynced = async (localId: string): Promise<boolean> => {
    const backendId = await getBackendId(localId);
    return backendId !== null;
};

/**
 * Get all ID mappings for a specific entity type
 */
export const getAllMappings = async (entityType?: 'soil' | 'parameter'): Promise<Array<{
    local_id: string;
    backend_id: string;
    entity_type: string;
}>> => {
    if (!db) throw new Error('Database not initialized');
    
    const query = entityType
        ? 'SELECT * FROM ID_Mappings WHERE entity_type = ?'
        : 'SELECT * FROM ID_Mappings';
    
    const params = entityType ? [entityType] : [];
    const [result] = await db.executeSql(query, params);
    
    const mappings: Array<any> = [];
    for (let i = 0; i < result.rows.length; i++) {
        mappings.push(result.rows.item(i));
    }
    
    return mappings;
};

/**
 * Get all soils from local database
 */
export const getLocalSoils = async (): Promise<LocalSoil[]> => {
    if (!db) throw new Error('Database not initialized');

    const [results] = await db.executeSql(
        'SELECT * FROM Soils ORDER BY last_modified DESC'
    );

    const soils: LocalSoil[] = [];
    for (let i = 0; i < results.rows.length; i++) {
        soils.push(results.rows.item(i));
    }

    return soils;
};

/**
 * Get parameters for a specific soil from local database
 */
export const getLocalParameters = async (soilId: string): Promise<LocalParameter[]> => {
    if (!db) throw new Error('Database not initialized');

    const [results] = await db.executeSql(
        'SELECT * FROM Parameters WHERE Soil_ID = ? ORDER BY Date_Recorded DESC',
        [soilId]
    );

    const parameters: LocalParameter[] = [];
    for (let i = 0; i < results.rows.length; i++) {
        parameters.push(results.rows.item(i));
    }

    return parameters;
};

/**
 * Save a new soil to local database
 * NOTE: Creates LOCAL IDs like L_S00001, L_S00002
 * These are mapped to backend IDs (S0001, S0002) when synced
 */
export const saveLocalSoil = async (
    soilData: CreateSoilRequest,
    localId?: string
): Promise<string> => {
    if (!db) throw new Error('Database not initialized');

    // Generate local ID if not provided
    const soilLocalId = localId || await generateLocalSoilId();
    const now = new Date().toISOString();

    await db.executeSql(
        `INSERT INTO Soils (Soil_ID, Soil_Name, Loc_Latitude, Loc_Longitude, sync_status, last_modified) 
         VALUES (?, ?, ?, ?, 'pending', ?)`,
        [
            soilLocalId,
            soilData.Soil.Soil_Name,
            soilData.Soil.Loc_Latitude,
            soilData.Soil.Loc_Longitude,
            now
        ]
    );

    // Save the associated parameter with local ID
    const parameterLocalId = await generateLocalParameterId();
    await db.executeSql(
        `INSERT INTO Parameters (Parameter_ID, Soil_ID, Hum, Temp, Ec, Ph, Nitrogen, Phosphorus, Potassium, Comments, Date_Recorded, sync_status, last_modified)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
        [
            parameterLocalId,
            soilLocalId,
            soilData.Parameters.Hum,
            soilData.Parameters.Temp,
            soilData.Parameters.Ec,
            soilData.Parameters.Ph,
            soilData.Parameters.Nitrogen,
            soilData.Parameters.Phosphorus,
            soilData.Parameters.Potassium,
            soilData.Parameters.Comments,
            now,
            now
        ]
    );

    console.log(`Saved soil ${soilLocalId} with parameter ${parameterLocalId} to local database`);
    return soilLocalId;
};

/**
 * Save a new parameter to local database
 * NOTE: Creates LOCAL IDs like L_P00001, L_P00002
 * These are mapped to backend IDs (P0001, P0002) when synced
 */
export const saveLocalParameter = async (
    parameterData: UpdateParameterRequest,
    localId?: string
): Promise<string> => {
    if (!db) throw new Error('Database not initialized');

    const parameterLocalId = localId || await generateLocalParameterId();
    const now = new Date().toISOString();

    await db.executeSql(
        `INSERT INTO Parameters (Parameter_ID, Soil_ID, Hum, Temp, Ec, Ph, Nitrogen, Phosphorus, Potassium, Comments, Date_Recorded, sync_status, last_modified)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
        [
            parameterLocalId,
            parameterData.Soil_ID,
            parameterData.Parameters.Hum,
            parameterData.Parameters.Temp,
            parameterData.Parameters.Ec,
            parameterData.Parameters.Ph,
            parameterData.Parameters.Nitrogen,
            parameterData.Parameters.Phosphorus,
            parameterData.Parameters.Potassium,
            parameterData.Parameters.Comments,
            now,
            now
        ]
    );

    console.log(`Saved parameter ${parameterLocalId} to local database`);
    return parameterLocalId;
};

/**
 * Update an existing parameter in local database
 */
export const updateLocalParameter = async (
    parameterId: string,
    updates: Partial<ParameterList>
): Promise<void> => {
    if (!db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    
    // Build dynamic update query based on provided fields
    const fields = Object.keys(updates).filter(key => key !== 'Parameter_ID');
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => (updates as any)[field]);
    
    // Add sync status and last_modified
    const query = `UPDATE Parameters SET ${setClause}, sync_status = 'pending', last_modified = ? WHERE Parameter_ID = ?`;
    
    await db.executeSql(query, [...values, now, parameterId]);
    console.log(`Updated parameter ${parameterId} in local database`);
};

/**
 * Delete a parameter from local database
 */
export const deleteLocalParameter = async (parameterId: string): Promise<void> => {
    if (!db) throw new Error('Database not initialized');

    await db.executeSql('DELETE FROM Parameters WHERE Parameter_ID = ?', [parameterId]);
    console.log(`Deleted parameter ${parameterId} from local database`);
};

/**
 * Delete a soil and all its parameters from local database
 */
export const deleteLocalSoil = async (soilId: string): Promise<void> => {
    if (!db) throw new Error('Database not initialized');

    // Delete parameters first (cascade should handle this, but being explicit)
    await db.executeSql('DELETE FROM Parameters WHERE Soil_ID = ?', [soilId]);
    await db.executeSql('DELETE FROM Soils WHERE Soil_ID = ?', [soilId]);
    
    console.log(`Deleted soil ${soilId} and its parameters from local database`);
};

/**
 * Update sync status for a soil
 */
export const updateSoilSyncStatus = async (
    soilId: string,
    status: SyncStatus
): Promise<void> => {
    if (!db) throw new Error('Database not initialized');

    await db.executeSql(
        'UPDATE Soils SET sync_status = ?, last_modified = ? WHERE Soil_ID = ?',
        [status, new Date().toISOString(), soilId]
    );
};

/**
 * Update sync status for a parameter
 */
export const updateParameterSyncStatus = async (
    parameterId: string,
    status: SyncStatus
): Promise<void> => {
    if (!db) throw new Error('Database not initialized');

    await db.executeSql(
        'UPDATE Parameters SET sync_status = ?, last_modified = ? WHERE Parameter_ID = ?',
        [status, new Date().toISOString(), parameterId]
    );
};

/**
 * Get all pending items (not synced yet)
 */
export const getPendingItems = async (): Promise<{
    soils: LocalSoil[];
    parameters: LocalParameter[];
}> => {
    if (!db) throw new Error('Database not initialized');

    const [soilResults] = await db.executeSql(
        "SELECT * FROM Soils WHERE sync_status = 'pending'"
    );

    const [paramResults] = await db.executeSql(
        "SELECT * FROM Parameters WHERE sync_status = 'pending'"
    );

    const soils: LocalSoil[] = [];
    for (let i = 0; i < soilResults.rows.length; i++) {
        soils.push(soilResults.rows.item(i));
    }

    const parameters: LocalParameter[] = [];
    for (let i = 0; i < paramResults.rows.length; i++) {
        parameters.push(paramResults.rows.item(i));
    }

    return { soils, parameters };
};

/**
 * Clear all data from local database
 */
export const clearLocalDatabase = async (): Promise<void> => {
    if (!db) throw new Error('Database not initialized');

    await db.executeSql('DELETE FROM Parameters');
    await db.executeSql('DELETE FROM Soils');
    await db.executeSql('DELETE FROM SyncLog');
    
    console.log('Local database cleared');
};

/**
 * Log sync activity
 */
export const logSyncActivity = async (
    status: 'success' | 'error' | 'partial',
    message: string,
    itemsSynced: number = 0
): Promise<void> => {
    if (!db) throw new Error('Database not initialized');

    await db.executeSql(
        'INSERT INTO SyncLog (sync_date, status, message, items_synced) VALUES (?, ?, ?, ?)',
        [new Date().toISOString(), status, message, itemsSynced]
    );
};

/**
 * Get sync history
 */
export const getSyncHistory = async (limit: number = 10): Promise<any[]> => {
    if (!db) throw new Error('Database not initialized');

    const [results] = await db.executeSql(
        'SELECT * FROM SyncLog ORDER BY sync_date DESC LIMIT ?',
        [limit]
    );

    const history: any[] = [];
    for (let i = 0; i < results.rows.length; i++) {
        history.push(results.rows.item(i));
    }

    return history;
};

/**
 * Bulk insert soils from server with ID mapping
 */
export const bulkInsertSoils = async (soils: SoilList[]): Promise<void> => {
    if (!db) throw new Error('Database not initialized');

    const now = new Date().toISOString();

    for (const soil of soils) {
        const backendId = soil.Soil_ID; // S0001, S0002, etc.
        
        // Check if we already have a mapping for this backend ID
        let localId = await getLocalId(backendId);
        
        if (!localId) {
            // New soil from backend - check if local ID exists
            const [existing] = await db.executeSql(
                'SELECT Soil_ID FROM Soils WHERE Soil_ID = ?',
                [backendId]
            );
            
            if (existing.rows.length > 0) {
                // Soil exists with backend ID (old data) - use it as is
                localId = backendId;
            } else {
                // Generate new local ID
                localId = await generateLocalSoilId();
            }
            
            // Create mapping
            await mapIds(localId, backendId, 'soil');
        }

        // Check if local soil exists
        const [existingLocal] = await db.executeSql(
            'SELECT Soil_ID FROM Soils WHERE Soil_ID = ?',
            [localId]
        );

        if (existingLocal.rows.length > 0) {
            // Update existing soil
            await db.executeSql(
                `UPDATE Soils 
                 SET Soil_Name = ?, Loc_Latitude = ?, Loc_Longitude = ?, sync_status = 'synced', last_modified = ?
                 WHERE Soil_ID = ?`,
                [soil.Soil_Name, soil.Loc_Latitude, soil.Loc_Longitude, now, localId]
            );
        } else {
            // Insert new soil with local ID
            await db.executeSql(
                `INSERT INTO Soils (Soil_ID, Soil_Name, Loc_Latitude, Loc_Longitude, sync_status, last_modified)
                 VALUES (?, ?, ?, ?, 'synced', ?)`,
                [localId, soil.Soil_Name, soil.Loc_Latitude, soil.Loc_Longitude, now]
            );
        }
    }

    console.log(`Bulk inserted ${soils.length} soils with ID mappings`);
};

/**
 * Bulk insert parameters from server with ID mapping
 */
export const bulkInsertParameters = async (parameters: ParameterList[]): Promise<void> => {
    if (!db) throw new Error('Database not initialized');

    const now = new Date().toISOString();

    for (const param of parameters) {
        const backendParamId = param.Parameter_ID; // P0001, P0002, etc.
        const backendSoilId = param.Soil_ID; // S0001, S0002, etc.
        
        // Get or create mapping for parameter
        let localParamId = await getLocalId(backendParamId);
        
        if (!localParamId) {
            // Check if parameter exists with backend ID (old data)
            const [existing] = await db.executeSql(
                'SELECT Parameter_ID FROM Parameters WHERE Parameter_ID = ?',
                [backendParamId]
            );
            
            if (existing.rows.length > 0) {
                // Use existing backend ID
                localParamId = backendParamId;
            } else {
                // Generate new local ID
                localParamId = await generateLocalParameterId();
            }
            
            // Create mapping
            await mapIds(localParamId, backendParamId, 'parameter');
        }
        
        // Get local soil ID (must exist from bulk soil insert)
        let localSoilId = await getLocalId(backendSoilId);
        
        if (!localSoilId) {
            // Fallback: use backend ID if no mapping exists
            localSoilId = backendSoilId;
        }

        // Check if local parameter exists
        const [existingLocal] = await db.executeSql(
            'SELECT Parameter_ID FROM Parameters WHERE Parameter_ID = ?',
            [localParamId]
        );

        if (existingLocal.rows.length > 0) {
            // Update existing parameter
            await db.executeSql(
                `UPDATE Parameters 
                 SET Soil_ID = ?, Hum = ?, Temp = ?, Ec = ?, Ph = ?, Nitrogen = ?, Phosphorus = ?, Potassium = ?, 
                     Comments = ?, Date_Recorded = ?, sync_status = 'synced', last_modified = ?
                 WHERE Parameter_ID = ?`,
                [
                    localSoilId,
                    param.Hum, param.Temp, param.Ec, param.Ph,
                    param.Nitrogen, param.Phosphorus, param.Potassium,
                    param.Comments, param.Date_Recorded, now, localParamId
                ]
            );
        } else {
            // Insert new parameter with local IDs
            await db.executeSql(
                `INSERT INTO Parameters (Parameter_ID, Soil_ID, Hum, Temp, Ec, Ph, Nitrogen, Phosphorus, Potassium, Comments, Date_Recorded, sync_status, last_modified)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?)`,
                [
                    localParamId, localSoilId, param.Hum, param.Temp, param.Ec, param.Ph,
                    param.Nitrogen, param.Phosphorus, param.Potassium,
                    param.Comments, param.Date_Recorded, now
                ]
            );
        }
    }

    console.log(`Bulk inserted ${parameters.length} parameters with ID mappings`);
};

