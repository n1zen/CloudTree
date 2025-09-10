import React from 'react';
import { View, Text } from 'react-native';
import { useEffect, useState } from 'react';
import * as Paho from 'paho-mqtt';

export default function SensorScreen() {

    const [soilData, setSoilData] = useState([]);

    // useEffect(() => {
    //     let client;
    //     const setupMqttClient = async () => {
    //         try {
    //             const mqttHost = await getMqttHost(); 
    //             client =  new Paho.Client()
    //         } catch (error) {
                
    //         }
    //     }
    // }, [])

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Sensor Screen</Text>
        </View>
    );
}