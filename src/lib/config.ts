import AsyncStorage from '@react-native-async-storage/async-storage';

import { startDiscovery, stopDiscovery } from './udpService.js';

startDiscovery();
setTimeout(() => {
    stopDiscovery();
}, 10000);

export async function getDefaultIp() {
    const ip = await AsyncStorage.getItem('ip');
    return ip ?? '192.168.100.66';
}

export async function getWebSocketPort() {
    const port = await AsyncStorage.getItem('websocketPort');
    return port ?? '9001';
}

export async function getHttpPort() {
    const port = await AsyncStorage.getItem('httpPort');
    return port ?? '8000';
}