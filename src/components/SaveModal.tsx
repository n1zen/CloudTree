import React, { useEffect, useState } from 'react';
import { View, Button, TextInput, Text, Modal, TouchableOpacity } from 'react-native';
import { Alert } from 'react-native';

import { colors } from '../assets/styles/Colors.ts';
import { sensorScreenStyles } from '../assets/styles/SensorScreen.ts';
import StatusIndicator from './StatusIndicator.tsx';
import ParameterAdvice from './ParameterAdvice.tsx';
import { requestLocationPermission, getCurrentLocation } from '../lib/locService.ts';
import { saveSoilData } from '../lib/axios.ts';
import { useNavigation } from '@react-navigation/native';
import { generateAutoComment, formatCommentData } from '../lib/commentGenerator.ts';
import { buildGeneratorPayload } from '../lib/soilParameterUtils.ts';

interface SaveModalProps {
    soilData: {
        moisture: number;
        temperature: number;
        electricalConductivity: number;
        phLevel: number;
        nitrogen: number;
        phosphorus: number;
        potassium: number;
    };
    setIsModalVisible: (visible: boolean) => void;
    parameterInsights: Record<string, any>;
}

export default function SaveModal({ soilData, setIsModalVisible, parameterInsights }: SaveModalProps) {
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationPermission, setLocationPermission] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [comments, setComments] = useState('Comments');
    const [soilName, setSoilName] = useState('Soil Name');
    const [isFullScreenModalVisible, setIsFullScreenModalVisible] = useState(false);
    const [fullScreenComments, setFullScreenComments] = useState('');
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
            } catch (error: any) {
                setLocationPermission(false);
                setLocationError(error.message);
            } finally {
                setIsLoading(false);
            }
        };
        getLocation();
    }, []);

    const generateComment = () => {
        const commentData = generateAutoComment(buildGeneratorPayload(soilData));
        
        const formattedComment = formatCommentData(commentData);
        setComments(formattedComment);
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
        navigation.navigate('Home' as never);
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
                    title="AutoGenerate Comment"
                    onPress={generateComment}
                    color={colors.primary}
                />
                <Button
                    title="Full Screen Comments"
                    onPress={handleOpenFullScreenComments}
                    color={colors.secondary}
                />
            </View>
            
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
    );
}

