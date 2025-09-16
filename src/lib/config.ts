import AsyncStorage from '@react-native-async-storage/async-storage';

export async function setDefaultIp(ip: string) {
    await AsyncStorage.setItem('ip', ip);
}

export async function setWebSocketPort(port: string) {
    await AsyncStorage.setItem('wsPort', port);
}

export async function setHttpPort(port: string) {
    await AsyncStorage.setItem('httpPort', port);
}

export async function getDefaultIp() {
    const ip = await AsyncStorage.getItem('ip');
    return ip ?? 'cloudtree.local';
}

export async function getWebSocketPort() {
    const port = await AsyncStorage.getItem('wsPort');
    return port ?? '9001';
}

export async function getHttpPort() {
    const port = await AsyncStorage.getItem('httpPort');
    return port ?? '8000';
}