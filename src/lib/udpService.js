import dgram from 'react-native-udp';
import AsyncStorage from '@react-native-async-storage/async-storage';

let socket = null;

export function startDiscovery(port = 5005) {
    if (socket) {
        console.warn('Already discovering for UDP services.');
        return;
    }

    socket = dgram.createSocket('udp4');
    socket.bind(port);
    
    socket.on('message', (msg) => {
        try {
            const data = JSON.parse(msg.toString());

            if(data.ip) {
                const updated = {
                    "ip": data.ip,
                    "mqttPort": data.mqttPort,
                    "wsPort": data.wsPort,
                    "httpPort": data.httpPort
                };
                console.log('Discovered services:', updated);
                AsyncStorage.setItem('ip', updated.ip || ''); // Store the discovered IP address
                AsyncStorage.setItem('mqttPort', updated.mqttPort?.toString() || '');
                AsyncStorage.setItem('wsPort', updated.wsPort?.toString() || '');
                AsyncStorage.setItem('httpPort', updated.httpPort?.toString() || '');
            }
        } catch (error) {
            console.error('Error parsing UDP message:', msg.toString(), error);
        }
    });

    console.log(`UDP socket listening on port ${port}`);
}

export function stopDiscovery() {
    if (socket) {
        socket.close();
        socket = null;
        console.log('Stopped UDP service discovery.');
    }
}