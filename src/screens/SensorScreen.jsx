import React from 'react';
import { View, Text, Button, Modal } from 'react-native';
import { useEffect, useState } from 'react';
import * as Paho from 'paho-mqtt';

import { colors } from '../assets/styles/Colors.ts';
import { sensorScreenStyles } from '../assets/styles/SensorScreen.ts';
import { getDefaultIp, getWebSocketPort } from '../lib/config.ts';
import UpdateSaveRadio from '../components/UpdateSaveRadio.tsx';

export default function SensorScreen() {

    const [soilData, setSoilData] = useState({
        moisture: 0,
        temperature: 0,
        electricalConductivity: 0,
        phLevel: 0
    });
    const [shouldConnect, setShouldConnect] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('Disconnected');
    const [isModalVisible, setIsModalVisible] = useState(false);
    // // Replace with your Raspberry Pi's IP address
    // const IP = useRef(null);
    // const PORT = useRef(9001); // Replace with your WebSocket port

    useEffect(() => {
        let client;
        const clientId = 'client-' + Math.random().toString(16).slice(2);
        const connectClient = async () => {
            
            if (!shouldConnect) return;
            try {
                const ip = 'cloudtree.local';
                // const portStr = await getWebSocketPort();
                // const port = parseInt(portStr, 10) || 9001; // fallback to 9001 if conversion fails
                const port = 9001;
                console.log('Connecting to IP:', ip, 'Port:', port);
                const wsUrl = `ws://${ip}:${port}/`;
                // const wsUrl = `ws://cloudtree.local:9001/`;
                client = new Paho.Client(wsUrl, clientId);
                client.onConnectionLost = (response) => {
                    console.log('Connection lost:', response?.errorMessage);
                    setConnectionStatus('Disconnected');
                };
                client.onMessageArrived = (data) => {
                    if (data.payloadString === 'Sensor Timeout or incomplete frame') {
                        console.warn('Received timeout or incomplete frame message');
                        return;
                    }
                    try {
                        const soilDataJson = JSON.parse(data.payloadString);
                        setSoilData((prevData) => ({
                            ...prevData,
                            moisture: soilDataJson.Moist,
                            temperature: soilDataJson.Temp,
                            electricalConductivity: soilDataJson.EC,
                            phLevel: soilDataJson.pH
                        }));
                        console.log('message arrived:', data.payloadString);
                    } catch (error) {
                        console.error('Error parsing JSON:', error);
                    }
                };
                client.connect({
                    useSSL: false,
                    timeout: 100,
                    onSuccess: () => {
                        console.log('Connected to MQTT broker');
                        setConnectionStatus('Connected');
                        client.subscribe('get_data');
                    },
                    onFailure: (error) => {
                        console.log('Connection failed: ', error);
                        setConnectionStatus('Error');
                    }
                });
            } catch (err) {
                console.error('MQTT connect error:', err);
                setConnectionStatus('Error');
            }
        };
        connectClient();
        return () => {
            if (client && client.isConnected()) {
                client.disconnect();
                console.log('Disconnected from MQTT broker');
            }
        };
    }, [shouldConnect]);

    const connectToBroker = () => {
        setShouldConnect(true);
    }

    return (
        <View style={sensorScreenStyles.mainContainer}>
            
            <View style={[connectionStatus === 'Connected' ? sensorScreenStyles.sdcSuccess :
                connectionStatus === 'Error' ? sensorScreenStyles.sdcError :
                sensorScreenStyles.sdcDisconnected,
                    {backgroundColor: colors.bgLight2}
                ]}>
                <View style={sensorScreenStyles.sensorStatusContainer}>
                    <Text>Connection Status: </Text>
                    <Text style={[sensorScreenStyles.sensorStatusIndicator, {
                        color: connectionStatus === 'Connected' ? colors.success :
                            connectionStatus === 'Error' ? colors.danger :
                            colors.warning
                    }]}>{connectionStatus}</Text>
                </View>
                <Text>Soil Moisture: {soilData.moisture}</Text>
                <Text>Soil Temperature: {soilData.temperature}</Text>
                <Text>Electrical Conductivity: {soilData.electricalConductivity}</Text>
                <Text>pH Level: {soilData.phLevel}</Text>
            </View>
            <View style={sensorScreenStyles.actionsContainer}>
                <Button
                    title="Connect to Broker"
                    onPress={connectToBroker}
                    disabled={shouldConnect}
                    style={sensorScreenStyles.button}
                />
                <Button
                    title="Save"
                    onPress={() => setIsModalVisible(true)}
                    style={sensorScreenStyles.button}
                />
            </View>
            <Modal
                animationType='slide'
                transparent={false}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={{backgroundColor: colors.bgLight, alignItems: 'center', justifyContent: 'center'}}>
                    <UpdateSaveRadio/>
                </View>
            </Modal>
        </View>
    );
}

function SaveScreen() {
    return(
        <View>
            
        </View>
    );
}
