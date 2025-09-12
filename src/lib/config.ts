import AsyncStorage from '@react-native-async-storage/async-storage';
import { DefaultTheme } from '@react-navigation/native';

const IP_ADDRESS_KEY = "@cloudtree_app_ip_address";
const DEFAULT_IP = "10.42.0.1";


export const generateClientId = (): string => {
    return 'client-' + Math.random().toString(16).slice(2);
}

export const getBaseUrl = async (): Promise<string> => {
    try {
        const ipAddress = await AsyncStorage.getItem(IP_ADDRESS_KEY);
        return `http://${ipAddress || DEFAULT_IP}:8000`;
    } catch (error) {
        console.error('Error getting IP address:', error);
        return `http://${DEFAULT_IP}:8000`;
    }
};

export const getMqttHost = (): String => {
    return DEFAULT_IP
}; 