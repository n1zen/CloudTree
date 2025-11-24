import React, { useEffect, useState } from 'react';
import { View, Text, Button, Modal, ScrollView } from 'react-native';
import * as Paho from 'paho-mqtt';

import { colors } from '../assets/styles/Colors.ts';
import { sensorScreenStyles } from '../assets/styles/SensorScreen.ts';
import { getDefaultIp, getWebSocketPort } from '../lib/config.ts';
import UpdateSaveRadio from '../components/UpdateSaveRadio.tsx';
import StatusIndicator from '../components/StatusIndicator.tsx';
import ParameterAdvice from '../components/ParameterAdvice.tsx';
import SoilTypePredictor from '../components/SoilTypePredictor.tsx';
import NarraSoilSuitability from '../components/NarraSoilSuitability.tsx';
import SaveModal from '../components/SaveModal.tsx';
import UpdateModal from '../components/UpdateModal.tsx';
import { generateAutoComment } from '../lib/commentGenerator.ts';
import { buildGeneratorPayload } from '../lib/soilParameterUtils.ts';

export default function SensorScreen() {
    const [soilData, setSoilData] = useState({
        moisture: 0,
        temperature: 0,
        electricalConductivity: 0,
        phLevel: 0,
        nitrogen: 0,
        phosphorus: 0,
        potassium: 0
    });
    const [shouldConnect, setShouldConnect] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('Disconnected');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectAction, setSelectAction] = useState('Save');
    const [parameterInsights, setParameterInsights] = useState({});

    useEffect(() => {
        let client;
        const clientId = 'client-' + Math.random().toString(16).slice(2);
        const connectClient = async () => {
            if (!shouldConnect) return;
            try {
                const ip = await getDefaultIp();
                const portStr = await getWebSocketPort();
                const port = parseInt(portStr, 10) || 9001;
                console.log('Connecting to IP:', ip, 'Port:', port);
                const wsUrl = `ws://${ip}:${port}/`;
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
                            phLevel: soilDataJson.pH,
                            nitrogen: soilDataJson.nitrogen,
                            phosphorus: soilDataJson.phosphorus,
                            potassium: soilDataJson.potassium
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

    useEffect(() => {
        const commentData = generateAutoComment(buildGeneratorPayload(soilData));
        const insightsMap = commentData.analyses.reduce((acc, analysis) => {
            acc[analysis.field] = analysis;
            return acc;
        }, {});
        setParameterInsights(insightsMap);
    }, [soilData]);

    const connectToBroker = () => {
        setShouldConnect(true);
    };

    const handleSaveBtnPress = () => {
        setShouldConnect(false);
        setIsModalVisible(true);
    };

    return (
        <ScrollView>
            <View style={sensorScreenStyles.mainContainer}>
                <View style={[
                    connectionStatus === 'Connected' ? sensorScreenStyles.sdcSuccess :
                    connectionStatus === 'Error' ? sensorScreenStyles.sdcError :
                    sensorScreenStyles.sdcDisconnected,
                    { backgroundColor: colors.bgLight2 }
                ]}>
                    <View style={sensorScreenStyles.sensorStatusContainer}>
                        <Text>Connection Status: </Text>
                        <Text
                            style={[
                                sensorScreenStyles.sensorStatusIndicator,
                                {
                                    color: connectionStatus === 'Connected' ? colors.success :
                                        connectionStatus === 'Error' ? colors.danger :
                                        colors.warning
                                }
                            ]}
                        >
                            {connectionStatus}
                        </Text>
                    </View>
                    <View style={sensorScreenStyles.cardsContainer}>
                        <NarraSoilSuitability soilData={soilData} />
                        <SoilTypePredictor soilData={soilData} />
                        <View style={sensorScreenStyles.fullCard}>
                            <Text style={sensorScreenStyles.cardHeader}>Soil Moisture</Text>
                            <View style={sensorScreenStyles.cardRow}>
                                <Text>{soilData.moisture} %</Text>
                                <StatusIndicator field="Hum" value={soilData.moisture} />
                            </View>
                            <ParameterAdvice field="Hum" parameterInsights={parameterInsights} />
                        </View>
                        <View style={sensorScreenStyles.fullCard}>
                            <Text style={sensorScreenStyles.cardHeader}>Soil Temperature</Text>
                            <View style={sensorScreenStyles.cardRow}>
                                <Text>{soilData.temperature} °C</Text>
                                <StatusIndicator field="Temp" value={soilData.temperature} />
                            </View>
                            <ParameterAdvice field="Temp" parameterInsights={parameterInsights} />
                        </View>
                        <View style={sensorScreenStyles.fullCard}>
                            <Text style={sensorScreenStyles.cardHeader}>Electrical Conductivity</Text>
                            <View style={sensorScreenStyles.cardRow}>
                                <Text>{Number.isFinite(soilData.electricalConductivity) ? soilData.electricalConductivity.toFixed(0) : 0} µS/cm</Text>
                                <StatusIndicator field="Ec" value={soilData.electricalConductivity} />
                            </View>
                            <ParameterAdvice field="Ec" parameterInsights={parameterInsights} />
                        </View>
                        <View style={sensorScreenStyles.fullCard}>
                            <Text style={sensorScreenStyles.cardHeader}>pH Level</Text>
                            <View style={sensorScreenStyles.cardRow}>
                                <Text>{soilData.phLevel} pH</Text>
                                <StatusIndicator field="Ph" value={soilData.phLevel} />
                            </View>
                            <ParameterAdvice field="Ph" parameterInsights={parameterInsights} />
                        </View>
                        <View style={sensorScreenStyles.fullCard}>
                            <Text style={sensorScreenStyles.cardHeader}>NPK</Text>
                            <View style={sensorScreenStyles.cardRow}>
                                <Text>N: {soilData.nitrogen} mg/kg</Text>
                                <StatusIndicator field="Nitrogen" value={soilData.nitrogen} />
                            </View>
                            <ParameterAdvice field="Nitrogen" parameterInsights={parameterInsights} />
                            <View style={sensorScreenStyles.cardRow}>
                                <Text>P: {soilData.phosphorus} mg/kg</Text>
                                <StatusIndicator field="Phosphorus" value={soilData.phosphorus} />
                            </View>
                            <ParameterAdvice field="Phosphorus" parameterInsights={parameterInsights} />
                            <View style={sensorScreenStyles.cardRow}>
                                <Text>K: {soilData.potassium} mg/kg</Text>
                                <StatusIndicator field="Potassium" value={soilData.potassium} />
                            </View>
                            <ParameterAdvice field="Potassium" parameterInsights={parameterInsights} />
                        </View>
                    </View>
                </View>
                <View style={sensorScreenStyles.actionsContainer}>
                    <Button
                        title="Connect to Sensor"
                        onPress={connectToBroker}
                        disabled={shouldConnect}
                        color={colors.primary}
                    />
                    <Button
                        title="Save"
                        onPress={handleSaveBtnPress}
                        color={colors.primary}
                    />
                </View>
                <Modal
                    animationType="slide"
                    transparent
                    visible={isModalVisible}
                    onRequestClose={() => setIsModalVisible(false)}
                >
                    <ScrollView>
                        <View style={sensorScreenStyles.modalContainer}>
                            <View style={sensorScreenStyles.modalContent}>
                                <UpdateSaveRadio onSelect={setSelectAction} selected={selectAction} />
                                {selectAction === 'Save' ? (
                                    <SaveModal
                                        soilData={soilData}
                                        setIsModalVisible={setIsModalVisible}
                                        parameterInsights={parameterInsights}
                                    />
                                ) : (
                                    <UpdateModal
                                        soilData={soilData}
                                        setIsModalVisible={setIsModalVisible}
                                        parameterInsights={parameterInsights}
                                    />
                                )}
                            </View>
                        </View>
                    </ScrollView>
                </Modal>
            </View>
        </ScrollView>
    );
}