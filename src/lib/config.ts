// Reads native env variables provided by react-native-config
// Expected keys (optional): DEFAULT_IP, WS_PORT, HTTP_PORT
// Falls back to sensible defaults if not provided
// Note: You still control runtime overrides via AsyncStorage setters below
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - typings depend on project setup
import {DEFAULT_IP, WS_PORT, HTTP_PORT} from '@env';

export function getDefaultIp() {
    return (DEFAULT_IP || 'cloudtree.local');
}

export function getWebSocketPort() {
    return (WS_PORT || '9001');
}

export function getHttpPort() {
    return (HTTP_PORT || '8000');
}