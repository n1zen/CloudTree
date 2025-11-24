import {
    getSoil,
    getParameters,
    saveSoilData,
    saveParameterData,
    deleteParameter,
    deleteSoil,
    idToNumber
} from './axios';
import {
    getLocalSoils,
    getLocalParameters,
    getPendingItems,
    updateSoilSyncStatus,
    updateParameterSyncStatus,
    bulkInsertSoils,
    bulkInsertParameters,
    logSyncActivity,
    getBackendId,
    mapIds,
    LocalSoil,
    LocalParameter
} from './databaseService';
import { CreateSoilRequest, UpdateParameterRequest } from './types';

export interface SyncResult {
    success: boolean;
    message: string;
    itemsSynced: number;
    errors: string[];
}

/**
 * Sync local data to Raspberry Pi
 * Uploads all pending changes from local database to the server
 */
export const syncToServer = async (): Promise<SyncResult> => {
    const result: SyncResult = {
        success: true,
        message: '',
        itemsSynced: 0,
        errors: []
    };

    try {
        const pending = await getPendingItems();
        
        console.log(`Found ${pending.soils.length} pending soils and ${pending.parameters.length} pending parameters`);

        // Sync pending soils
        for (const soil of pending.soils) {
            try {
                // Check if already synced (has backend mapping)
                const existingBackendId = await getBackendId(soil.Soil_ID);
                if (existingBackendId) {
                    console.log(`Soil ${soil.Soil_ID} already synced as ${existingBackendId}`);
                    await updateSoilSyncStatus(soil.Soil_ID, 'synced');
                    continue;
                }

                // We need to find the first parameter for this soil to create the CreateSoilRequest
                const params = await getLocalParameters(soil.Soil_ID);
                
                if (params.length === 0) {
                    result.errors.push(`No parameters found for soil ${soil.Soil_ID}`);
                    continue;
                }

                const firstParam = params[0];
                
                const soilRequest: CreateSoilRequest = {
                    Soil: {
                        Soil_Name: soil.Soil_Name,
                        Loc_Latitude: soil.Loc_Latitude,
                        Loc_Longitude: soil.Loc_Longitude
                    },
                    Parameters: {
                        Hum: firstParam.Hum,
                        Temp: firstParam.Temp,
                        Ec: firstParam.Ec,
                        Ph: firstParam.Ph,
                        Nitrogen: firstParam.Nitrogen,
                        Phosphorus: firstParam.Phosphorus,
                        Potassium: firstParam.Potassium,
                        Comments: firstParam.Comments
                    }
                };

                // Save to server - backend creates S0001, P0001, etc.
                const response = await saveSoilData(soilRequest);
                
                // Extract backend IDs from response
                // Note: This depends on your backend API structure
                // You may need to fetch the latest soil to get the backend ID
                const serverSoils = await getSoil();
                const latestSoil = serverSoils[serverSoils.length - 1];
                const backendSoilId = latestSoil.Soil_ID;
                
                // Get its first parameter
                const serverParams = await getParameters(backendSoilId);
                const backendParamId = serverParams[0]?.Parameter_ID;
                
                // Create ID mappings
                await mapIds(soil.Soil_ID, backendSoilId, 'soil');
                if (backendParamId) {
                    await mapIds(firstParam.Parameter_ID, backendParamId, 'parameter');
                }
                
                // Mark as synced
                await updateSoilSyncStatus(soil.Soil_ID, 'synced');
                await updateParameterSyncStatus(firstParam.Parameter_ID, 'synced');
                
                result.itemsSynced += 2; // Soil + Parameter
                console.log(`Successfully synced soil ${soil.Soil_ID} → ${backendSoilId}`);
            } catch (error) {
                console.error(`Error syncing soil ${soil.Soil_ID}:`, error);
                result.errors.push(`Failed to sync soil ${soil.Soil_ID}: ${error}`);
                result.success = false;
            }
        }

        // Sync pending parameters (that belong to already synced soils)
        for (const param of pending.parameters) {
            try {
                // Check if already synced (has backend mapping)
                const existingBackendId = await getBackendId(param.Parameter_ID);
                if (existingBackendId) {
                    console.log(`Parameter ${param.Parameter_ID} already synced as ${existingBackendId}`);
                    await updateParameterSyncStatus(param.Parameter_ID, 'synced');
                    continue;
                }

                // Check if the soil for this parameter exists and is synced
                const localSoils = await getLocalSoils();
                const parentSoil = localSoils.find(s => s.Soil_ID === param.Soil_ID);
                
                if (!parentSoil) {
                    result.errors.push(`Parent soil ${param.Soil_ID} not found for parameter ${param.Parameter_ID}`);
                    continue;
                }

                if (parentSoil.sync_status !== 'synced') {
                    // Parent soil not synced yet, skip this parameter
                    console.log(`Skipping parameter ${param.Parameter_ID} - parent soil ${param.Soil_ID} not synced`);
                    continue;
                }

                // Get backend ID for the parent soil
                const backendSoilId = await getBackendId(param.Soil_ID);
                if (!backendSoilId) {
                    result.errors.push(`No backend mapping for soil ${param.Soil_ID}`);
                    continue;
                }

                // Convert backend Soil_ID to numeric format for API (S0001 → 1)
                const numericSoilId = idToNumber(backendSoilId);
                if (isNaN(numericSoilId)) {
                    result.errors.push(`Invalid backend Soil_ID format: ${backendSoilId}`);
                    continue;
                }

                const paramRequest: UpdateParameterRequest = {
                    Soil_ID: numericSoilId.toString(), // Backend expects numeric string
                    Parameters: {
                        Hum: param.Hum,
                        Temp: param.Temp,
                        Ec: param.Ec,
                        Ph: param.Ph,
                        Nitrogen: param.Nitrogen,
                        Phosphorus: param.Phosphorus,
                        Potassium: param.Potassium,
                        Comments: param.Comments
                    }
                };

                // Save to server - backend creates new parameter ID
                await saveParameterData(paramRequest);
                
                // Fetch the latest parameter to get backend ID
                const serverParams = await getParameters(backendSoilId);
                const latestParam = serverParams[serverParams.length - 1];
                const backendParamId = latestParam?.Parameter_ID;
                
                if (backendParamId) {
                    // Create ID mapping
                    await mapIds(param.Parameter_ID, backendParamId, 'parameter');
                }
                
                // Mark as synced
                await updateParameterSyncStatus(param.Parameter_ID, 'synced');
                
                result.itemsSynced++;
                console.log(`Successfully synced parameter ${param.Parameter_ID} → ${backendParamId}`);
            } catch (error) {
                console.error(`Error syncing parameter ${param.Parameter_ID}:`, error);
                result.errors.push(`Failed to sync parameter ${param.Parameter_ID}: ${error}`);
                result.success = false;
            }
        }

        if (result.errors.length === 0) {
            result.message = `Successfully synced ${result.itemsSynced} items to server`;
            await logSyncActivity('success', result.message, result.itemsSynced);
        } else {
            result.message = `Synced ${result.itemsSynced} items with ${result.errors.length} errors`;
            await logSyncActivity('partial', result.message, result.itemsSynced);
        }

    } catch (error) {
        result.success = false;
        result.message = `Sync failed: ${error}`;
        result.errors.push(String(error));
        await logSyncActivity('error', result.message, result.itemsSynced);
    }

    return result;
};

/**
 * Sync data from Raspberry Pi to local database
 * Downloads all data from server and updates local database
 */
export const syncFromServer = async (): Promise<SyncResult> => {
    const result: SyncResult = {
        success: true,
        message: '',
        itemsSynced: 0,
        errors: []
    };

    try {
        // Get all soils from server
        const serverSoils = await getSoil();
        console.log(`Fetched ${serverSoils.length} soils from server`);

        // Insert soils into local database
        await bulkInsertSoils(serverSoils);
        result.itemsSynced += serverSoils.length;

        // Get parameters for each soil
        for (const soil of serverSoils) {
            try {
                const serverParams = await getParameters(soil.Soil_ID);
                console.log(`Fetched ${serverParams.length} parameters for soil ${soil.Soil_ID}`);
                
                await bulkInsertParameters(serverParams);
                result.itemsSynced += serverParams.length;
            } catch (error) {
                console.error(`Error fetching parameters for soil ${soil.Soil_ID}:`, error);
                result.errors.push(`Failed to fetch parameters for soil ${soil.Soil_ID}`);
                result.success = false;
            }
        }

        if (result.errors.length === 0) {
            result.message = `Successfully synced ${result.itemsSynced} items from server`;
            await logSyncActivity('success', result.message, result.itemsSynced);
        } else {
            result.message = `Synced ${result.itemsSynced} items with ${result.errors.length} errors`;
            await logSyncActivity('partial', result.message, result.itemsSynced);
        }

    } catch (error) {
        result.success = false;
        result.message = `Sync from server failed: ${error}`;
        result.errors.push(String(error));
        await logSyncActivity('error', result.message, result.itemsSynced);
    }

    return result;
};

/**
 * Full bidirectional sync
 * First pushes local changes to server, then pulls server data to local
 */
export const fullSync = async (): Promise<SyncResult> => {
    const result: SyncResult = {
        success: true,
        message: '',
        itemsSynced: 0,
        errors: []
    };

    try {
        console.log('Starting full sync: uploading local changes...');
        
        // First, push local changes to server
        const uploadResult = await syncToServer();
        result.itemsSynced += uploadResult.itemsSynced;
        result.errors.push(...uploadResult.errors);
        
        if (!uploadResult.success) {
            result.success = false;
            console.warn('Upload phase had errors:', uploadResult.errors);
        }

        console.log('Upload complete. Downloading server data...');

        // Then, pull server data to local
        const downloadResult = await syncFromServer();
        result.itemsSynced += downloadResult.itemsSynced;
        result.errors.push(...downloadResult.errors);
        
        if (!downloadResult.success) {
            result.success = false;
            console.warn('Download phase had errors:', downloadResult.errors);
        }

        if (result.errors.length === 0) {
            result.message = `Full sync completed: ${result.itemsSynced} items synced`;
            await logSyncActivity('success', result.message, result.itemsSynced);
        } else {
            result.message = `Full sync completed with ${result.errors.length} errors: ${result.itemsSynced} items synced`;
            await logSyncActivity('partial', result.message, result.itemsSynced);
        }

    } catch (error) {
        result.success = false;
        result.message = `Full sync failed: ${error}`;
        result.errors.push(String(error));
        await logSyncActivity('error', result.message, result.itemsSynced);
    }

    return result;
};

/**
 * Check if there are pending items that need to be synced
 */
export const hasPendingChanges = async (): Promise<boolean> => {
    try {
        const pending = await getPendingItems();
        return pending.soils.length > 0 || pending.parameters.length > 0;
    } catch (error) {
        console.error('Error checking pending changes:', error);
        return false;
    }
};

/**
 * Get count of pending items
 */
export const getPendingCount = async (): Promise<{soils: number, parameters: number}> => {
    try {
        const pending = await getPendingItems();
        return {
            soils: pending.soils.length,
            parameters: pending.parameters.length
        };
    } catch (error) {
        console.error('Error getting pending count:', error);
        return { soils: 0, parameters: 0 };
    }
};

