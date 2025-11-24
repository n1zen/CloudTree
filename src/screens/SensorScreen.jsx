import React, { useEffect, useState } from 'react';
import { View, Text, Button, Modal, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import * as Paho from 'paho-mqtt';
import { useNavigation } from '@react-navigation/native';

import { colors } from '../assets/styles/Colors.ts';
import { sensorScreenStyles } from '../assets/styles/SensorScreen.ts';
import { getDefaultIp, getWebSocketPort } from '../lib/config.ts';
import UpdateSaveRadio from '../components/UpdateSaveRadio.tsx';
import StatusIndicator from '../components/StatusIndicator.tsx';
import ParameterAdvice from '../components/ParameterAdvice.tsx';
import SoilTypePredictor from '../components/SoilTypePredictor.tsx';
import NarraSoilSuitability from '../components/NarraSoilSuitability.tsx';
import { generateAutoComment, formatCommentData } from '../lib/commentGenerator.ts';
import { buildGeneratorPayload, calculateNarraSuitability, predictSoilType } from '../lib/soilParameterUtils.ts';
import { requestLocationPermission, getCurrentLocation } from '../lib/locService.ts';
import { saveSoilData, getSoil, saveParameterData, idToNumber } from '../lib/axios.ts';

export default function SensorScreen() {
    const navigation = useNavigation();
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
    
    // Save Modal state
    const [location, setLocation] = useState(null);
    const [locationPermission, setLocationPermission] = useState(false);
    const [locationError, setLocationError] = useState(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [comments, setComments] = useState('Comments');
    const [soilName, setSoilName] = useState('Soil Name');
    const [isFullScreenModalVisible, setIsFullScreenModalVisible] = useState(false);
    const [fullScreenComments, setFullScreenComments] = useState('');
    
    // Update Modal state
    const [soilID, setSoilID] = useState('Select Soil ID');
    const [updateSoilName, setUpdateSoilName] = useState('Soil Name');
    const [showPicker, setShowPicker] = useState(false);
    const [soilIDList, setSoilIDList] = useState([]);

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

    // Get location when modal opens and action is Save
    useEffect(() => {
        const getLocation = async () => {
            if (!isModalVisible || selectAction !== 'Save') return;
            
            setIsLoadingLocation(true);
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
                setIsLoadingLocation(false);
            }
        };
        getLocation();
    }, [isModalVisible, selectAction]);

    // Get soil ID list when modal opens and action is Update
    useEffect(() => {
        const getSoilIDList = async () => {
            if (!isModalVisible || selectAction !== 'Update') return;
            
            try {
                const soilList = await getSoil();
                setSoilIDList(soilList.map(soil => [soil.Soil_ID, soil.Soil_Name]));
            } catch (error) {
                console.error('Error getting soil list:', error);
            }
        };
        getSoilIDList();
    }, [isModalVisible, selectAction]);

    // Auto-generate comments when modal opens
    useEffect(() => {
        if (!isModalVisible) return;
        
        try {
            const commentData = generateAutoComment(buildGeneratorPayload(soilData));
            const soilSuitability = calculateNarraSuitability(soilData);
            const soilTypeData = predictSoilType(soilData);
            
            const formattedComment = formatCommentData(
                commentData, 
                selectAction === 'Save' ? 'save' : 'update',
                soilSuitability,
                soilTypeData
            );
            setComments(formattedComment);
        } catch (error) {
            console.error('Error generating comments:', error);
            setComments('Comments');
        }
    }, [isModalVisible, selectAction]);

    const connectToBroker = () => {
        setShouldConnect(true);
    };

    const handleSaveBtnPress = () => {
        console.log('Save button pressed');
        setShouldConnect(false);
        setIsModalVisible(true);
        console.log('Modal visibility set to true');
    };

    const generateComment = () => {
        try {
            const commentData = generateAutoComment(buildGeneratorPayload(soilData));
            const soilSuitability = calculateNarraSuitability(soilData);
            const soilTypeData = predictSoilType(soilData);
            
            const formattedComment = formatCommentData(
                commentData,
                selectAction === 'Save' ? 'save' : 'update',
                soilSuitability,
                soilTypeData
            );
            setComments(formattedComment);
        } catch (error) {
            console.error('Error generating comments:', error);
        }
    };

    const handleOpenFullScreenComments = () => {
        setFullScreenComments(comments);
        setIsFullScreenModalVisible(true);
    };

    const handleSaveFullScreenComments = () => {
        setComments(fullScreenComments);
        setIsFullScreenModalVisible(false);
    };

    const handleCancelFullScreenComments = () => {
        setFullScreenComments(comments);
        setIsFullScreenModalVisible(false);
    };

    const handleSave = async () => {
        try {
            const newSoilData = {
                Soil: {
                    Soil_Name: soilName,
                    Loc_Latitude: location?.latitude ?? 0,
                    Loc_Longitude: location?.longitude ?? 0
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
        } catch (error) {
            console.error('Error saving soil data:', error);
            Alert.alert('Error', 'Failed to save soil data');
        }
    };

    const handleUpdate = async () => {
        // Validate that a soil ID has been selected
        if (soilID === 'Select Soil ID' || !soilID) {
            Alert.alert('Error', 'Please select a Soil ID before updating');
            return;
        }

        // Convert soil ID from "S0026" format to numeric 26
        const numericSoilID = idToNumber(soilID);
        if (isNaN(numericSoilID)) {
            Alert.alert('Error', 'Invalid Soil ID format');
            return;
        }

        try {
            const newParameterData = {
                Soil_ID: numericSoilID,
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
            console.log('New parameter data:', newParameterData);
            const updatedParameterData = await saveParameterData(newParameterData);
            console.log('Updated parameter data:', updatedParameterData);
            Alert.alert('Success', 'Parameter updated successfully');
            setIsModalVisible(false);
            setComments('Comments');
            setSoilID('Select Soil ID');
            setUpdateSoilName('Soil Name');
            navigation.navigate('Home');
        } catch (error) {
            console.error('Error updating parameter data:', error);
            Alert.alert('Error', 'Failed to update parameter data. Please check the console for details.');
        }
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
                    transparent={false}
                    visible={isModalVisible}
                    onRequestClose={() => setIsModalVisible(false)}
                >
                    <ScrollView style={{ flex: 1, backgroundColor: colors.bgLight }}>
                        <View style={{ padding: 20 }}>
                            <View style={{ 
                                padding: 20,
                                marginVertical: 10,
                                borderStyle: 'solid',
                                borderWidth: 2,
                                borderRadius: 15,
                                borderColor: colors.success,
                                backgroundColor: colors.bgLight2
                            }}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>
                                    Save/Update Soil Data
                                </Text>
                                <UpdateSaveRadio onSelect={setSelectAction} selected={selectAction} />
                            
                                {selectAction === 'Save' ? (
                                <View>
                                    <Button
                                        title="Save"
                                        onPress={handleSave}
                                        color={colors.primary}
                                    />
                                    <TextInput 
                                        placeholder="Soil Name" 
                                        value={soilName} 
                                        onChangeText={setSoilName} 
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
                                    {isLoadingLocation && <Text>Loading location...</Text>}
                                    {locationError && <Text>Error: {locationError}</Text>}
                                </View>
                            ) : (
                                <View>
                                    <Button
                                        title="Update" 
                                        onPress={handleUpdate}
                                        color={colors.primary}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPicker(true)}
                                        style={sensorScreenStyles.selectInput}
                                    >
                                        <Text style={sensorScreenStyles.selectInputText}>
                                            {soilID} - {updateSoilName}
                                        </Text>
                                    </TouchableOpacity>
                                    <Modal
                                        visible={showPicker} 
                                        transparent 
                                        animationType="slide"
                                        onRequestClose={() => setShowPicker(false)}
                                    >
                                        <View style={sensorScreenStyles.pickerModalContainer}>
                                            <View style={sensorScreenStyles.pickerModalContent}>
                                                <Text style={sensorScreenStyles.modalTitle}>Select Soil ID</Text>
                                                <ScrollView style={sensorScreenStyles.pickerScrollView}>
                                                    {soilIDList.map(([id, name]) => (
                                                        <TouchableOpacity 
                                                            key={id} 
                                                            style={sensorScreenStyles.modalOption}
                                                            onPress={() => {
                                                                setSoilID(id);
                                                                setUpdateSoilName(name);
                                                                setShowPicker(false);
                                                            }}
                                                        >
                                                            <Text style={sensorScreenStyles.modalOptionText}>{id} - {name}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </ScrollView>
                                            </View>
                                        </View>
                                    </Modal>
                                </View>
                            )}
                            
                            {/* Soil Data Display */}
                            <View style={{ marginTop: 12 }}>
                            <View style={sensorScreenStyles.cardsContainer}>
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
                                        <Text>{soilData.electricalConductivity} us/cm</Text>
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
                            
                            {/* Comments Section */}
                            <TextInput
                                multiline
                                placeholder="Type comments here..."
                                numberOfLines={4}
                                textAlignVertical="top"
                                style={sensorScreenStyles.textarea}
                                value={comments}
                                onChangeText={setComments}
                            />
                            <View style={sensorScreenStyles.commentsActionContainer}>
                                <Button
                                    title="Full Screen Comments"
                                    onPress={handleOpenFullScreenComments}
                                    color={colors.secondary}
                                />
                            </View>
                            
                            <View style={sensorScreenStyles.actionsContainer}>
                                <Button
                                    title="Close"
                                    onPress={() => setIsModalVisible(false)}
                                    color={colors.danger}
                                />
                            </View>
                            </View>
                        </View>
                    </ScrollView>
                </Modal>
                
                {/* Full Screen Comments Modal */}
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={isFullScreenModalVisible}
                    onRequestClose={handleCancelFullScreenComments}
                >
                    <View style={sensorScreenStyles.fullScreenModalContainer}>
                        <View style={sensorScreenStyles.fullScreenModalHeader}>
                            <Text style={sensorScreenStyles.fullScreenModalTitle}>Edit Comments</Text>
                            <TouchableOpacity
                                onPress={handleCancelFullScreenComments}
                                style={sensorScreenStyles.fullScreenModalCloseButton}
                            >
                                <Text style={sensorScreenStyles.fullScreenModalCloseText}>×</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <TextInput
                            style={sensorScreenStyles.fullScreenModalTextInput}
                            value={fullScreenComments}
                            onChangeText={setFullScreenComments}
                            multiline
                            placeholder="Add detailed comments about this soil reading..."
                            placeholderTextColor={colors.secondary}
                        />
                        
                        <View style={sensorScreenStyles.fullScreenModalButtonContainer}>
                            <TouchableOpacity
                                style={[sensorScreenStyles.fullScreenModalButton, sensorScreenStyles.fullScreenModalCancelButton]}
                                onPress={handleCancelFullScreenComments}
                            >
                                <Text style={sensorScreenStyles.fullScreenModalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={[sensorScreenStyles.fullScreenModalButton, sensorScreenStyles.fullScreenModalSaveButton]}
                                onPress={handleSaveFullScreenComments}
                            >
                                <Text style={sensorScreenStyles.fullScreenModalButtonText}>Save Comments</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </ScrollView>
    );
}