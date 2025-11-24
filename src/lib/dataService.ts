/**
 * Unified Data Service
 * This service provides a single interface for data operations that works both online and offline.
 * It automatically uses local database when offline and syncs when online.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getDefaultIp, getHttpPort } from './config';
import {
    getSoil as getServerSoil,
    getParameters as getServerParameters,
    saveSoilData as saveServerSoilData,
    saveParameterData as saveServerParameterData,
    deleteParameter as deleteServerParameter,
    deleteSoil as deleteServerSoil,
    idToNumber
} from './axios';
import {
    getLocalSoils,
    getLocalParameters,
    saveLocalSoil,
    saveLocalParameter,
    updateLocalParameter,
    deleteLocalParameter,
    deleteLocalSoil,
    updateSoilSyncStatus,
    updateParameterSyncStatus,
    getBackendId,
    mapIds,
    initDatabase
} from './databaseService';
import { SoilList, ParameterList, CreateSoilRequest, UpdateParameterRequest } from './types';

const OFFLINE_MODE_KEY = '@offline_mode';

// Initialize database on module load
initDatabase().catch(error => {
    console.error('Failed to initialize database:', error);
});

/**
 * Check if backend server (Raspberry Pi) is reachable
 * This actually tests the connection to your backend, not just internet
 */
export const checkConnectivity = async (): Promise<boolean> => {
    try {
        const ip = await getDefaultIp();
        const port = await getHttpPort();
        
        // Try to reach the backend with a simple request
        // Use a short timeout to quickly detect if backend is unreachable
        const response = await axios.get(`http://${ip}:${port}/soils`, {
            timeout: 3000, // 3 second timeout
            validateStatus: (status) => status < 500 // Accept any status < 500 as "reachable"
        });
        
        console.log('Backend reachable:', response.status);
        return true;
    } catch (error: any) {
        // Check if it's a timeout or network error
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
            console.log('Backend connection timeout');
            return false;
        }
        if (error.message?.includes('Network Error') || error.message?.includes('Network request failed')) {
            console.log('Backend not reachable - network error');
            return false;
        }
        
        // If we got here with another error, backend might still be reachable
        // (e.g., 404, auth error, etc. - but server responded)
        console.log('Backend check error (might still be reachable):', error.message);
        return false;
    }
};

/**
 * Get offline mode preference
 */
export const getOfflineMode = async (): Promise<boolean> => {
    try {
        const mode = await AsyncStorage.getItem(OFFLINE_MODE_KEY);
        return mode === 'true';
    } catch (error) {
        console.error('Error getting offline mode:', error);
        return false;
    }
};

/**
 * Set offline mode preference
 */
export const setOfflineMode = async (offline: boolean): Promise<void> => {
    try {
        await AsyncStorage.setItem(OFFLINE_MODE_KEY, offline.toString());
    } catch (error) {
        console.error('Error setting offline mode:', error);
    }
};

/**
 * Get all soils - works both online and offline
 */
export const getSoils = async (): Promise<SoilList[]> => {
    const offlineMode = await getOfflineMode();
    const isOnline = await checkConnectivity();

    if (!offlineMode && isOnline) {
        try {
            // Try to get from server
            const serverSoils = await getServerSoil();
            return serverSoils;
        } catch (error) {
            console.warn('Failed to fetch from server, falling back to local:', error);
            // Fall back to local
            const localSoils = await getLocalSoils();
            return localSoils.map(soil => ({
                Soil_ID: soil.Soil_ID,
                Soil_Name: soil.Soil_Name,
                Loc_Latitude: soil.Loc_Latitude,
                Loc_Longitude: soil.Loc_Longitude
            }));
        }
    } else {
        // Use local database
        const localSoils = await getLocalSoils();
        return localSoils.map(soil => ({
            Soil_ID: soil.Soil_ID,
            Soil_Name: soil.Soil_Name,
            Loc_Latitude: soil.Loc_Latitude,
            Loc_Longitude: soil.Loc_Longitude
        }));
    }
};

/**
 * Get parameters for a soil - works both online and offline
 */
export const getParameters = async (soilId: string): Promise<ParameterList[]> => {
    const offlineMode = await getOfflineMode();
    const isOnline = await checkConnectivity();

    if (!offlineMode && isOnline) {
        try {
            // Try to get from server
            const serverParams = await getServerParameters(soilId);
            return serverParams;
        } catch (error) {
            console.warn('Failed to fetch parameters from server, falling back to local:', error);
            // Fall back to local
            const localParams = await getLocalParameters(soilId);
            return localParams.map(param => ({
                Parameter_ID: param.Parameter_ID,
                Soil_ID: param.Soil_ID,
                Hum: param.Hum,
                Temp: param.Temp,
                Ec: param.Ec,
                Ph: param.Ph,
                Nitrogen: param.Nitrogen,
                Phosphorus: param.Phosphorus,
                Potassium: param.Potassium,
                Comments: param.Comments,
                Date_Recorded: param.Date_Recorded
            }));
        }
    } else {
        // Use local database
        const localParams = await getLocalParameters(soilId);
        return localParams.map(param => ({
            Parameter_ID: param.Parameter_ID,
            Soil_ID: param.Soil_ID,
            Hum: param.Hum,
            Temp: param.Temp,
            Ec: param.Ec,
            Ph: param.Ph,
            Nitrogen: param.Nitrogen,
            Phosphorus: param.Phosphorus,
            Potassium: param.Potassium,
            Comments: param.Comments,
            Date_Recorded: param.Date_Recorded
        }));
    }
};

/**
 * Save soil data - works both online and offline
 */
export const saveSoilData = async (soilData: CreateSoilRequest): Promise<void> => {
    const offlineMode = await getOfflineMode();
    const isOnline = await checkConnectivity();

    if (!offlineMode && isOnline) {
        try {
            // If online, save directly to server
            // Backend creates proper Soil_ID (S0001, S0002, etc.) and Parameter_ID (P0001, P0002, etc.)
            const serverResponse = await saveServerSoilData(soilData);
            console.log('Soil data saved to server:', serverResponse);
            
            // Note: We don't save to local here with temp IDs
            // The next sync/refresh will pull it down with proper backend IDs
        } catch (error) {
            console.warn('Failed to save to server, saving locally instead:', error);
            // Fall back to local save if server fails (creates temp IDs like S1732484940123)
            await saveLocalSoil(soilData);
        }
    } else {
        // Offline mode - save to local database with temp IDs
        const localId = await saveLocalSoil(soilData);
        console.log(`Offline mode: Soil data saved to local database with temp ID: ${localId}`);
    }
};

/**
 * Save parameter data - works both online and offline
 * Uses ID translation for API calls
 */
export const saveParameterData = async (parameterData: UpdateParameterRequest): Promise<void> => {
    const offlineMode = await getOfflineMode();
    const isOnline = await checkConnectivity();

    if (!offlineMode && isOnline) {
        try {
            // Translate local Soil_ID to backend ID if needed
            let apiSoilId = parameterData.Soil_ID;
            
            // Check if this is a local ID (starts with L_S)
            if (apiSoilId.startsWith('L_S')) {
                const backendId = await getBackendId(apiSoilId);
                if (backendId) {
                    apiSoilId = backendId;
                } else {
                    throw new Error(`Soil ${apiSoilId} not synced yet. Please sync first.`);
                }
            }
            
            // Convert backend Soil_ID to numeric format (S0001 → "1")
            const numericSoilId = idToNumber(apiSoilId);
            if (isNaN(numericSoilId)) {
                throw new Error(`Invalid Soil_ID format: ${apiSoilId}`);
            }
            
            // Save to server with numeric Soil_ID
            const apiRequest = {
                Soil_ID: numericSoilId.toString(), // Backend expects numeric string
                Parameters: parameterData.Parameters
            };
            
            const serverResponse = await saveServerParameterData(apiRequest);
            console.log('Parameter data saved to server:', serverResponse);
            
            // Note: We don't save to local here - the next sync/refresh will pull it down with proper IDs
            // This avoids duplicate entries
        } catch (error) {
            console.warn('Failed to save to server, saving locally instead:', error);
            // Fall back to local save if server fails
            await saveLocalParameter(parameterData);
        }
    } else {
        // Offline mode - save to local database
        const localId = await saveLocalParameter(parameterData);
        console.log(`Offline mode: Parameter saved locally as ${localId}`);
    }
};

/**
 * Update an existing parameter - works both online and offline
 */
export const updateParameter = async (
    parameterId: string,
    parameterData: UpdateParameterRequest
): Promise<void> => {
    const offlineMode = await getOfflineMode();
    const isOnline = await checkConnectivity();

    // Always update in local database first
    await updateLocalParameter(parameterId, {
        Hum: parameterData.Parameters.Hum,
        Temp: parameterData.Parameters.Temp,
        Ec: parameterData.Parameters.Ec,
        Ph: parameterData.Parameters.Ph,
        Nitrogen: parameterData.Parameters.Nitrogen,
        Phosphorus: parameterData.Parameters.Phosphorus,
        Potassium: parameterData.Parameters.Potassium,
        Comments: parameterData.Parameters.Comments,
    });

    if (!offlineMode && isOnline) {
        try {
            // Try to update on server by creating a new parameter entry
            // (Your backend doesn't have update, so we just add a new reading)
            await saveServerParameterData(parameterData);
            // Mark as synced
            await updateParameterSyncStatus(parameterId, 'synced');
            console.log('Parameter updated on server and local database');
        } catch (error) {
            console.warn('Failed to update on server, updated locally:', error);
            // Keep as pending sync
        }
    } else {
        console.log('Offline mode: Parameter updated in local database only');
    }
};

/**
 * Delete parameter - works both online and offline
 */
export const deleteParameter = async (parameterId: string): Promise<void> => {
    const offlineMode = await getOfflineMode();
    const isOnline = await checkConnectivity();

    // Delete from local database
    await deleteLocalParameter(parameterId);

    if (!offlineMode && isOnline) {
        try {
            // Try to delete from server
            await deleteServerParameter(parameterId);
            console.log('Parameter deleted from server and local database');
        } catch (error) {
            console.warn('Failed to delete from server, deleted locally:', error);
        }
    } else {
        console.log('Offline mode: Parameter deleted from local database only');
    }
};

/**
 * Delete soil - works both online and offline
 */
export const deleteSoil = async (soilId: string): Promise<void> => {
    const offlineMode = await getOfflineMode();
    const isOnline = await checkConnectivity();

    // Delete from local database
    await deleteLocalSoil(soilId);

    if (!offlineMode && isOnline) {
        try {
            // Try to delete from server
            await deleteServerSoil(soilId);
            console.log('Soil deleted from server and local database');
        } catch (error) {
            console.warn('Failed to delete from server, deleted locally:', error);
        }
    } else {
        console.log('Offline mode: Soil deleted from local database only');
    }
};

