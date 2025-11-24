import React, { useEffect, useState } from 'react';
import { View, Button, TextInput, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Alert } from 'react-native';

import { colors } from '../assets/styles/Colors.ts';
import { sensorScreenStyles } from '../assets/styles/SensorScreen.ts';
import StatusIndicator from './StatusIndicator.tsx';
import ParameterAdvice from './ParameterAdvice.tsx';
import { getSoil, saveParameterData } from '../lib/axios.ts';
import { useNavigation } from '@react-navigation/native';
import { generateAutoComment, formatCommentData } from '../lib/commentGenerator.ts';
import { buildGeneratorPayload } from '../lib/soilParameterUtils.ts';

interface UpdateModalProps {
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

export default function UpdateModal({ soilData, setIsModalVisible, parameterInsights }: UpdateModalProps) {

    const [soilID, setSoilID] = useState('Select Soil ID');
    const [soilName, setSoilName] = useState('Soil Name');
    const [showPicker, setShowPicker] = useState(false);
    const [comments, setComments] = useState('Comments');
    const [soilIDList, setSoilIDList] = useState<Array<[string, string]>>([]);
    const [isFullScreenModalVisible, setIsFullScreenModalVisible] = useState(false);
    const [fullScreenComments, setFullScreenComments] = useState('');
    const navigation = useNavigation();

    const handleUpdate = async () => {
        const newParameterData = {
            Soil_ID: soilID,
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
        navigation.navigate('Home' as never);
    }

    const generateComment = () => {
        const commentData = generateAutoComment(buildGeneratorPayload(soilData));

        const formattedComment = formatCommentData(commentData);
        setComments(formattedComment);
    }

    const handleOpenFullScreenComments = () => {
        setFullScreenComments(comments);
        setIsFullScreenModalVisible(true);
    }

    const handleSaveFullScreenComments = () => {
        setComments(fullScreenComments);
        setIsFullScreenModalVisible(false);
    }

    const handleCancelFullScreenComments = () => {
        setFullScreenComments(comments);
        setIsFullScreenModalVisible(false);
    }

    const handlePickerClose = () => {
        setShowPicker(false);
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
                onRequestClose={handlePickerClose}
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
                                        setSoilName(name);
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
                    title="Auto Generate Comment"
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

