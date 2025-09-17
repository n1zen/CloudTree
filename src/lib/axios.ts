import axios from 'axios';
import { getDefaultIp, getHttpPort } from './config.ts';
import { CreateSoilRequest, SoilList, ParameterList, UpdateParameterRequest } from './types.ts';

// const defaultIp = 'cloudtree.local';
// const httpPort = '8000';
const defaultIp = getDefaultIp() || 'cloudtree.local';
const httpPort = getHttpPort() || '8000';


const api = axios.create({
    baseURL: `http://${defaultIp}:${httpPort}`,
    timeout: 10000, 
});

export const idToNumber = (id: string): number => {
    const match = id.match(/^[SP](\d+)$/i)?.[1];
    return match ? parseInt(match, 10) : NaN;
}

// GET FUNCTIONS
// Get All Soils
export async function getSoil(): Promise<SoilList[]>{
    try {
        const response = await api.get('/soils');
        if(response.status === 200) {
            return response.data;
        } else {
            console.error('Failed to get soil data: ' + response.status);
            console.log(response.data);
            throw new Error('Failed to get soil data: ' + response.status);
        }
    } catch (error) {
        console.error('Failed to get soil data: ' + error);
        throw new Error('Failed to get soil data: ' + error);
    }
}

// Get Parameters for a Soil
export async function getParameters(Soil_ID: string): Promise<ParameterList[]>{
    const id = idToNumber(Soil_ID);
    try {
        const response = await api.get(`/soils/parameters/${id}`);
        if(response.status === 200) {
            return response.data;
        } else {
            console.error('Failed to get parameters data: ' + response.status);
            console.log(response.data);
            throw new Error('Failed to get parameters data: ' + response.status);
        }
    } catch (error) {
        console.error('Failed to get parameters data: ' + error);
        throw new Error('Failed to get parameters data: ' + error);
    }
}

// POST FUNCTIONS
// Save New Soil
export async function saveSoilData(soilData: CreateSoilRequest): Promise<CreateSoilRequest> {
    try {
        const response = await api.post('/create/soil/', soilData);
        if(response.status === 200) {
            return response.data;
        } else {
            console.error('Failed to save soil data: ' + response.status);
            console.log(response.data);
            throw new Error('Failed to save soil data: ' + response.status);
        }
    } catch (error) {
        console.error('Failed to save soil data: ' + error);
        throw new Error('Failed to save soil data: ' + error);
    }
};

// Save New Parameter for a Soil
export async function saveParameterData(parameterData: UpdateParameterRequest): Promise<UpdateParameterRequest> {
    try {
        const response = await api.post(`/add/parameter/`, parameterData);
        if(response.status === 200) {   
            return response.data;
        } else {
            console.error('Failed to save parameter data: ' + response.status);
            console.log(response.data);
            throw new Error('Failed to save parameter data: ' + response.status);
        }
    } catch (error) {
        console.error('Failed to save parameter data: ' + error);
        throw new Error('Failed to save parameter data: ' + error);
    }
}

// DELETE FUNCTIONS
// Delete a Parameter
export async function deleteParameter(parameterID: string): Promise<void> {
    const id = idToNumber(parameterID);
    try {
        const response = await api.delete(`/delete/parameter/${id}`);
        if(response.status === 200) {
            console.log('Parameter deleted successfully');
            return;
        } else {
            console.error('Failed to delete parameter data: ' + response.status);
            console.log(response.data);
            throw new Error('Failed to delete parameter data: ' + response.status);
        }
    } catch (error) {
        console.error('Failed to delete parameter data: ' + error);
        throw new Error('Failed to delete parameter data: ' + error);
    }
}

// Delete Soil and All of its Parameters
export async function deleteSoil(soilID: string): Promise<void> {
    const id = idToNumber(soilID);
    try {
        const response = await api.delete(`/delete/soil/${id}`);
        if(response.status === 200) {
            console.log('Soil deleted successfully');
            return;
        }
    } catch (error) {
        console.error('Failed to delete soil data: ' + error);
        throw new Error('Failed to delete soil data: ' + error);
    }
}