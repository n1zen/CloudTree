import React from 'react';
import { View, Text, Button, Modal, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import * as Paho from 'paho-mqtt';

import { colors } from '../assets/styles/Colors.ts';
import { sensorScreenStyles } from '../assets/styles/SensorScreen.ts';
import { getDefaultIp, getWebSocketPort } from '../lib/config.ts';
import UpdateSaveRadio from '../components/UpdateSaveRadio.tsx';
import { requestLocationPermission, getCurrentLocation } from '../lib/locService.ts';
import { saveSoilData, getSoil, saveParameterData, idToNumber } from '../lib/axios.ts';
import { useNavigation } from '@react-navigation/native';
import StatusIndicator from '../components/StatusIndicator.tsx';

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

    const connectToBroker = () => {
        setShouldConnect(true);
    }

    return (
        <View style={sensorScreenStyles.mainContainer}>
            
            <ScrollView 
                contentContainerStyle={sensorScreenStyles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
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
                    <View style={sensorScreenStyles.cardsContainer}>
                        <View style={sensorScreenStyles.fullCard}>
                            <Text style={sensorScreenStyles.cardHeader}>Soil Moisture</Text>
                            <View style={sensorScreenStyles.cardRow}>
                                <Text>{soilData.moisture} %</Text>
                                <StatusIndicator field="Hum" value={soilData.moisture} />
                            </View>
                        </View>
                        <View style={sensorScreenStyles.fullCard}>
                            <Text style={sensorScreenStyles.cardHeader}>Soil Temperature</Text>
                            <View style={sensorScreenStyles.cardRow}>
                                <Text>{soilData.temperature} °C</Text>
                                <StatusIndicator field="Temp" value={soilData.temperature} />
                            </View>
                        </View>
                        <View style={sensorScreenStyles.fullCard}>
                            <Text style={sensorScreenStyles.cardHeader}>Electrical Conductivity</Text>
                            <View style={sensorScreenStyles.cardRow}>
                                <Text>{soilData.electricalConductivity} us/cm</Text>
                                <StatusIndicator field="Ec" value={soilData.electricalConductivity} />
                            </View>
                        </View>
                        <View style={sensorScreenStyles.fullCard}>
                            <Text style={sensorScreenStyles.cardHeader}>pH Level</Text>
                            <View style={sensorScreenStyles.cardRow}>
                                <Text>{soilData.phLevel} pH</Text>
                                <StatusIndicator field="Ph" value={soilData.phLevel} />
                            </View>
                        </View>
                        <View style={sensorScreenStyles.fullCard}>
                            <Text style={sensorScreenStyles.cardHeader}>NPK</Text>
                            <View style={sensorScreenStyles.cardRow}>
                                <Text>N: {soilData.nitrogen} mg/kg</Text>
                                <StatusIndicator field="Nitrogen" value={soilData.nitrogen} />
                            </View>
                            <View style={sensorScreenStyles.cardRow}>
                                <Text>P: {soilData.phosphorus} mg/kg</Text>
                                <StatusIndicator field="Phosphorus" value={soilData.phosphorus} />
                            </View>
                            <View style={sensorScreenStyles.cardRow}>
                                <Text>K: {soilData.potassium} mg/kg</Text>
                                <StatusIndicator field="Potassium" value={soilData.potassium} />
                            </View>
                        </View>
                    </View>
                </View>
                <View style={sensorScreenStyles.actionsContainer}>
                    <Button
                        title="Connect to Broker"
                        onPress={connectToBroker}
                        disabled={shouldConnect}
                        style={sensorScreenStyles.button}
                        color={colors.primary}
                    />
                    <Button
                        title="Save"
                        onPress={() => setIsModalVisible(true)}
                        style={sensorScreenStyles.button}
                        color={colors.primary}
                    />
                </View>
            </ScrollView>
            <Modal
                animationType='slide'
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <ScrollView>
                    <View style={sensorScreenStyles.modalContainer}>
                        <View style={sensorScreenStyles.modalContent}>
                            <UpdateSaveRadio onSelect={setSelectAction} selected={selectAction}/>
                            {selectAction === 'Save' ? <Save soilData={soilData} setIsModalVisible={setIsModalVisible} /> : <Update soilData={soilData} setIsModalVisible={setIsModalVisible} />}
                        </View>
                    </View>
                </ScrollView>
            </Modal>
        </View>
    );
}

function Save({soilData, setIsModalVisible}) {
    const [location, setLocation] = useState(null);
    const [locationPermission, setLocationPermission] = useState(false);
    const [locationError, setLocationError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [comments, setComments] = useState('Comments');
    const [soilName, setSoilName] = useState('Soil Name');
    const navigation = useNavigation();

    useEffect(() => {
        const getLocation = async () => {
            setIsLoading(true);
            try {
                const permsGranted = await requestLocationPermission();
                if (permsGranted) {
                    const currentLoc = await getCurrentLocation();
                    setLocation(currentLoc);
                    setLocationPermission(true);
                    setLocationError(null);
                } else {
                    setLocationPermission(false);
                    setLocationError('Location permission denied');
                }
            } catch (error) {
                setLocationPermission(false);
                setLocationError(error.message);
            } finally {
                setIsLoading(false);
            }
        }
        getLocation();
    },[])

    const handleSave = async () => {
        const newSoilData = {
            Soil: {
                Soil_Name: soilName,
                Loc_Latitude: location?.latitude,
                Loc_Longitude: location?.longitude
            },
            Parameters: {
                Hum: soilData.moisture,
                Temp: soilData.temperature,
                Ec: soilData.electricalConductivity,
                Ph: soilData.phLevel,
                Nitrogen: soilData.nitrogen,
                Phosphorus: soilData.phosphorus,
                Potassium: soilData.potassium,
                Comments: comments
            }
        };
        console.log('New soil data:', newSoilData);
        const savedSoilData = await saveSoilData(newSoilData);
        console.log('Saved soil data:', savedSoilData);
        Alert.alert('Soil saved successfully');
        setIsModalVisible(false);
        setComments('Comments');
        navigation.navigate('Home');
        setSoilName('Soil Name');
    };

    return(
        <View>
            <Button
                title="Save"
                onPress={() => {
                    console.log("Saved");
                    handleSave();
                    setIsModalVisible(false);
                }}
                color={colors.primary}
            />
            <TextInput placeholder="Soil Name" value={soilName} onChangeText={setSoilName} 
                style={sensorScreenStyles.soilIDInput}
            />
            <View style={sensorScreenStyles.cardsContainer}>
                <View style={sensorScreenStyles.halfCard}>
                    <Text style={sensorScreenStyles.cardHeader}>Latitude</Text>
                    <View style={sensorScreenStyles.cardRow}>
                        <Text>{location?.latitude ?? '-'}</Text>
                    </View>
                </View>
                <View style={sensorScreenStyles.halfCard}>
                    <Text style={sensorScreenStyles.cardHeader}>Longitude</Text>
                    <View style={sensorScreenStyles.cardRow}>
                        <Text>{location?.longitude ?? '-'}</Text>
                    </View>
                </View>
            </View>
            {isLoading && <Text>Loading...</Text>}
            {locationError && <Text>Error: {locationError}</Text>}
            {(!locationPermission && isLoading) && <Text>Location permission denied</Text>}
            <View style={sensorScreenStyles.cardsContainer}>
                <View style={sensorScreenStyles.fullCard}>
                    <Text style={sensorScreenStyles.cardHeader}>Soil Moisture</Text>
                    <View style={sensorScreenStyles.cardRow}>
                        <Text>{soilData.moisture} %</Text>
                        <StatusIndicator field="Hum" value={soilData.moisture} />
                    </View>
                </View>
                <View style={sensorScreenStyles.fullCard}>
                    <Text style={sensorScreenStyles.cardHeader}>Soil Temperature</Text>
                    <View style={sensorScreenStyles.cardRow}>
                        <Text>{soilData.temperature} °C</Text>
                        <StatusIndicator field="Temp" value={soilData.temperature} />
                    </View>
                </View>
                <View style={sensorScreenStyles.fullCard}>
                    <Text style={sensorScreenStyles.cardHeader}>Electrical Conductivity</Text>
                    <View style={sensorScreenStyles.cardRow}>
                        <Text>{soilData.electricalConductivity} us/cm</Text>
                        <StatusIndicator field="Ec" value={soilData.electricalConductivity} />
                    </View>
                </View>
                <View style={sensorScreenStyles.fullCard}>
                    <Text style={sensorScreenStyles.cardHeader}>pH Level</Text>
                    <View style={sensorScreenStyles.cardRow}>
                        <Text>{soilData.phLevel} pH</Text>
                        <StatusIndicator field="Ph" value={soilData.phLevel} />
                    </View>
                </View>
                    <View style={sensorScreenStyles.fullCard}>
                    <Text style={sensorScreenStyles.cardHeader}>NPK</Text>
                    <View style={sensorScreenStyles.cardRow}>
                        <Text>N: {soilData.nitrogen} mg/kg</Text>
                        <StatusIndicator field="Nitrogen" value={soilData.nitrogen} />
                    </View>
                    <View style={sensorScreenStyles.cardRow}>
                        <Text>P: {soilData.phosphorus} mg/kg</Text>
                        <StatusIndicator field="Phosphorus" value={soilData.phosphorus} />
                    </View>
                    <View style={sensorScreenStyles.cardRow}>
                        <Text>K: {soilData.potassium} mg/kg</Text>
                        <StatusIndicator field="Potassium" value={soilData.potassium} />
                    </View>
                </View>
            </View>
            <TextInput
                multiline
                placeholder="Type comments here..."
                numberOfLines={4}
                textAlignVertical="top"
                style={sensorScreenStyles.textarea}
                value={comments}
                onChangeText={setComments}
            />
        </View>
    );
}

function Update({soilData, setIsModalVisible}) {

    const [soilID, setSoilID] = useState('Select Soil ID');
    const [soilName, setSoilName] = useState('Soil Name');
    const [showPicker, setShowPicker] = useState(false);
    const [comments, setComments] = useState('Comments');
    const [soilIDList, setSoilIDList] = useState([]);
    const navigation = useNavigation();

    const handleUpdate = async () => {
        const newParameterData = {
            Soil_ID: idToNumber(soilID),
            Parameters: {
                Hum: soilData.moisture,
                Temp: soilData.temperature,
                Ec: soilData.electricalConductivity,
                Ph: soilData.phLevel,
                Nitrogen: soilData.nitrogen,
                Phosphorus: soilData.phosphorus,
                Potassium: soilData.potassium,
                Comments: comments
            }
        }
        console.log('New parameter data:', newParameterData);
        const updatedParameterData = await saveParameterData(newParameterData);
        console.log('Updated parameter data:', updatedParameterData);
        Alert.alert('Parameter updated successfully');
        setIsModalVisible(false);
        setComments('Comments');
        navigation.navigate('Home');
    }

    useEffect(() => {
        const getSoilIDList = async () => {
            const soilList = await getSoil();
            setSoilIDList(soilList.map(soil => [soil.Soil_ID, soil.Soil_Name]));
        }
        getSoilIDList();
    },[])

    return(
        <View>
            <Button
                title="Update" 
                onPress={() => {
                    console.log("Updated");
                    handleUpdate();
                    setIsModalVisible(false);
                }}
                color={colors.primary}
            />
            <TouchableOpacity
                onPress={() => setShowPicker(true)}
                style={sensorScreenStyles.selectInput}
            >
                <Text style={sensorScreenStyles.selectInputText}>
                    {soilID} - {soilName}
                </Text>
            </TouchableOpacity>
            <Modal
                visible={showPicker} transparent animationType="slide"
            >
                <View style={sensorScreenStyles.modalContainer}>
                    <View style={sensorScreenStyles.modalContent}>
                        <Text style={sensorScreenStyles.modalTitle}>Select Soil ID</Text>
                        {soilIDList.map(([id, name]) => (
                            <TouchableOpacity 
                                key={id} 
                                style={sensorScreenStyles.modalOption}
                                onPress={() => {
                                    setSoilID(id);
                                    setSoilName(name);
                                    setShowPicker(false);
                                }}
                            >
                                <Text style={sensorScreenStyles.modalOptionText}>{id} - {name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>
            <View style={sensorScreenStyles.cardsContainer}>
                <View style={sensorScreenStyles.fullCard}>
                    <Text style={sensorScreenStyles.cardHeader}>Soil Moisture</Text>
                    <View style={sensorScreenStyles.cardRow}>
                        <Text>{soilData.moisture} %</Text>
                        <StatusIndicator field="Hum" value={soilData.moisture} />
                    </View>
                </View>
                <View style={sensorScreenStyles.fullCard}>
                    <Text style={sensorScreenStyles.cardHeader}>Soil Temperature</Text>
                    <View style={sensorScreenStyles.cardRow}>
                        <Text>{soilData.temperature} °C</Text>
                        <StatusIndicator field="Temp" value={soilData.temperature} />
                    </View>
                </View>
                <View style={sensorScreenStyles.fullCard}>
                    <Text style={sensorScreenStyles.cardHeader}>Electrical Conductivity</Text>
                    <View style={sensorScreenStyles.cardRow}>
                        <Text>{soilData.electricalConductivity} us/cm</Text>
                        <StatusIndicator field="Ec" value={soilData.electricalConductivity} />
                    </View>
                </View>
                <View style={sensorScreenStyles.fullCard}>
                    <Text style={sensorScreenStyles.cardHeader}>pH Level</Text>
                    <View style={sensorScreenStyles.cardRow}>
                        <Text>{soilData.phLevel} pH</Text>
                        <StatusIndicator field="Ph" value={soilData.phLevel} />
                    </View>
                </View>
                    <View style={sensorScreenStyles.fullCard}>
                    <Text style={sensorScreenStyles.cardHeader}>NPK</Text>
                    <View style={sensorScreenStyles.cardRow}>
                        <Text>N: {soilData.nitrogen} mg/kg</Text>
                        <StatusIndicator field="Nitrogen" value={soilData.nitrogen} />
                    </View>
                    <View style={sensorScreenStyles.cardRow}>
                        <Text>P: {soilData.phosphorus} mg/kg</Text>
                        <StatusIndicator field="Phosphorus" value={soilData.phosphorus} />
                    </View>
                    <View style={sensorScreenStyles.cardRow}>
                        <Text>K: {soilData.potassium} mg/kg</Text>
                        <StatusIndicator field="Potassium" value={soilData.potassium} />
                    </View>
                </View>
            </View>
            <TextInput
                multiline
                placeholder="Type comments here..."
                numberOfLines={4}
                textAlignVertical="top"
                style={sensorScreenStyles.textarea}
                value={comments}
                onChangeText={setComments}
            />
        </View>
    );
}