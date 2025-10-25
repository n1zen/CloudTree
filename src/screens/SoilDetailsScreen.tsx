import { View, Text, Button, Alert, TouchableOpacity, ScrollView, Dimensions, TextInput, Modal, Touchable } from 'react-native';
import { useEffect, useState } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { ParameterList, SoilList, ParameterRequest, UpdateParameterRequest } from '../lib/types.ts';
import { getParameters, deleteParameter, deleteSoil, saveParameterData, idToNumber } from '../lib/axios.ts';
// @ts-ignore
import { Table, Row } from 'react-native-table-component';
import { dashboardStyles } from '../assets/styles/DashboardStyles.ts';
import { colors } from '../assets/styles/Colors.ts';
import StatusIndicator from '../components/StatusIndicator.tsx';
import { ChevronUpIcon, ChevronDownIcon } from 'lucide-react-native';

type DashboardStackParamList = {
    SoilDetails: { soil: SoilList };
};

type SoilDetailsRouteProp = RouteProp<DashboardStackParamList, 'SoilDetails'>;

export default function SoilDetailsScreen() {
    const route = useRoute<SoilDetailsRouteProp>();
    const { soil } = route.params;
    const [parameters, setParameters] = useState<ParameterList[]>([]);
    const [latestParameter, setLatestParameter] = useState<ParameterList | null>(null);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isFullScreenModalVisible, setIsFullScreenModalVisible] = useState<boolean>(false);
    const [fullScreenComments, setFullScreenComments] = useState<string>('');
    const navigation = useNavigation<any>();
    const [sortOrder, setSortOrder] = useState<string>('Newest First');


    const fetchParameters = async () => {
        const newParameters = await getParameters(soil.Soil_ID);
        const getTime = (p: any) => {
                const ts = p?.Date_Recorded ?? p?.Date_Recorded;
            const t = ts ? Date.parse(ts) : NaN;
            // If timestamp is invalid, fall back to Parameter_ID numeric part
            if (!Number.isFinite(t)) {
                const idNum = parseInt(String(p?.Parameter_ID).match(/\d+/)?.[0] ?? '0', 10);
                // Return negative so higher idNum sorts first when we do b - a
                return idNum;
            }
            return t;
        };
        const sorted = [...newParameters].sort((a, b) => getTime(b) - getTime(a)); // newest first
        console.log('Sorted parameters (desc by time):', sorted.map(p => ({ id: p.Parameter_ID, created: p.Date_Recorded, recorded: (p as any).Date_Recorded })));
        setParameters(sorted);
        setLatestParameter(sorted[0] ?? null);
    }
    useEffect(() => {
        fetchParameters();
    }, []);

    const handleDelete = (parameterID: string) => {
        deleteParameter(parameterID) .then(() => {
            fetchParameters();
            setLatestParameter(parameters[0] ?? null);
        })
        .catch((error) => {
            console.error('Failed to delete parameter data: ' + error);
        });
    }

    const handleDeleteAll = (soilID: string) => {
        deleteSoil(soilID) .then(() => {
            Alert.alert('Soil deleted successfully');
            navigation.navigate('Home');
        })
        .catch((error) => {
            console.error('Failed to delete soil data: ' + error);
        });
    }

    const handleRowPress = (parameter: ParameterList) => {
        setLatestParameter(parameter);
    }


    const handleOpenFullScreenComments = () => {
        setFullScreenComments(latestParameter?.Comments || '');
        setIsFullScreenModalVisible(true);
    }

    const handleSaveFullScreenComments = async () => {
        if (!latestParameter) return;
        
        setIsSaving(true);
        try {
            const parameterData: ParameterRequest = {
                Hum: latestParameter.Hum,
                Temp: latestParameter.Temp,
                Ec: latestParameter.Ec,
                Ph: latestParameter.Ph,
                Nitrogen: latestParameter.Nitrogen,
                Phosphorus: latestParameter.Phosphorus,
                Potassium: latestParameter.Potassium,
                Comments: fullScreenComments
            };

            const updateParameterData: UpdateParameterRequest = {
                Soil_ID: idToNumber(soil.Soil_ID).toString(),
                Parameters: parameterData
            };

            await saveParameterData(updateParameterData);
            
            setIsFullScreenModalVisible(false);
            Alert.alert('Success',`Successfully updated comments for:\nSoil ID: ${soil.Soil_ID}\nSoil Name: ${soil.Soil_Name}`, [
                {
                    text: 'OK',
                    onPress: () => fetchParameters()
                }
            ]);
        } catch (error) {
            console.error('Error saving comments:', error);
            Alert.alert('Error', `Failed to save comments for soil ${soil.Soil_ID}: ${soil.Soil_Name}. Please try again.`);
        } finally {
            setIsSaving(false);
        }
    }

    const handleCancelFullScreenComments = () => {
        setFullScreenComments(latestParameter?.Comments || '');
        setIsFullScreenModalVisible(false);
    }

    const handleSortOrderChange = () => {
        if (sortOrder === 'Newest First') {
            setSortOrder('Oldest First');
            const sorted = [...parameters].sort((a, b) => idToNumber(a.Parameter_ID) - idToNumber(b.Parameter_ID));
            setParameters(sorted);
        } else {
            setSortOrder('Newest First');
            const sorted = [...parameters].sort((a, b) => idToNumber(b.Parameter_ID) - idToNumber(a.Parameter_ID));
            setParameters(sorted);
        }
    }

    return (
        <>
            <ScrollView>
            <View style={dashboardStyles.container}>
                 <View style={dashboardStyles.section}>
                     <Text style={dashboardStyles.title}>Soil Details</Text>
                     <View style={dashboardStyles.card}>
                         <View style={dashboardStyles.fieldRow}>
                             <Text style={dashboardStyles.fieldLabel}>Soil Name</Text>
                             <Text style={dashboardStyles.fieldValue}>{soil.Soil_Name}</Text>
                         </View>
                         <View style={dashboardStyles.fieldRow}>
                             <Text style={dashboardStyles.fieldLabel}>Soil ID</Text>
                             <Text style={dashboardStyles.fieldValue}>{soil.Soil_ID}</Text>
                         </View>
                         <View style={dashboardStyles.fieldRow}>
                             <Text style={dashboardStyles.fieldLabel}>Latitude</Text>
                             <Text style={dashboardStyles.fieldValue}>{soil.Loc_Latitude}</Text>
                         </View>
                         <View style={dashboardStyles.fieldRow}>
                             <Text style={dashboardStyles.fieldLabel}>Longitude</Text>
                             <Text style={dashboardStyles.fieldValue}>{soil.Loc_Longitude}</Text>
                         </View>
                         <View style={dashboardStyles.actionBar}>
                             <Button title="Delete All" onPress={() => handleDeleteAll(soil.Soil_ID)} color={colors.danger} />
                         </View>
                     </View>
                     {latestParameter && (
                         <View key={`latest-${latestParameter.Parameter_ID}`} style={dashboardStyles.card}>
                            <Text style={dashboardStyles.cardHeader}>Latest Reading</Text>
                            <View style={dashboardStyles.fieldRow}>
                                <Text style={dashboardStyles.fieldLabel}>ID</Text>
                                <Text style={dashboardStyles.fieldValue}>{latestParameter.Parameter_ID}</Text>
                             </View>
                            <View style={dashboardStyles.fieldRow}>
                                <Text style={dashboardStyles.fieldLabel}>Hum</Text>
                                <View style={{flexDirection: 'row', gap: 8}}>
                                    <Text style={dashboardStyles.fieldValue}>{latestParameter.Hum} %</Text>
                                    <StatusIndicator field="Hum" value={latestParameter.Hum} />
                                </View>
                            </View>
                            <View style={dashboardStyles.fieldRow}>
                                <Text style={dashboardStyles.fieldLabel}>Temp</Text>   
                                <View style={{flexDirection: 'row', gap: 8}}>
                                    <Text style={dashboardStyles.fieldValue}>{latestParameter.Temp} °C</Text>
                                    <StatusIndicator field="Temp" value={latestParameter.Temp} />
                                </View>
                            </View>
                            <View style={dashboardStyles.fieldRow}>
                                <Text style={dashboardStyles.fieldLabel}>Ec</Text>
                                <View style={{flexDirection: 'row', gap: 8}}>
                                    <Text style={dashboardStyles.fieldValue}>{latestParameter.Ec} us/cm</Text>
                                    <StatusIndicator field="Ec" value={latestParameter.Ec} />
                                </View>
                            </View>
                            <View style={dashboardStyles.fieldRow}>
                                <Text style={dashboardStyles.fieldLabel}>Ph</Text>
                                <View style={{flexDirection: 'row', gap: 8}}>
                                    <Text style={dashboardStyles.fieldValue}>{latestParameter.Ph} pH</Text>
                                    <StatusIndicator field="Ph" value={latestParameter.Ph} />
                                </View>
                            </View>
                            <View style={dashboardStyles.fieldRow}>
                                <Text style={dashboardStyles.fieldLabel}>Nitrogen</Text>
                                <View style={{flexDirection: 'row', gap: 8}}>
                                    <Text style={dashboardStyles.fieldValue}>{latestParameter.Nitrogen} mg/kg</Text>
                                    <StatusIndicator field="Nitrogen" value={latestParameter.Nitrogen} />
                                </View>
                            </View>
                            <View style={dashboardStyles.fieldRow}>
                                <Text style={dashboardStyles.fieldLabel}>Phosphorus</Text>
                                <View style={{flexDirection: 'row', gap: 8}}>
                                    <Text style={dashboardStyles.fieldValue}>{latestParameter.Phosphorus} mg/kg</Text>
                                    <StatusIndicator field="Phosphorus" value={latestParameter.Phosphorus} />
                                </View>
                            </View>
                            <View style={dashboardStyles.fieldRow}>
                                <Text style={dashboardStyles.fieldLabel}>Potassium</Text>
                                <View style={{flexDirection: 'row', gap: 8}}>
                                    <Text style={dashboardStyles.fieldValue}>{latestParameter.Potassium} mg/kg</Text>
                                    <StatusIndicator field="Potassium" value={latestParameter.Potassium} />
                                </View>
                            </View>
                            <View style={dashboardStyles.fieldRow}>
                                <Text style={dashboardStyles.fieldLabel}>Comments</Text>
                                <View style={{ flex: 1 }}>
                                    <TextInput 
                                        style={[
                                            dashboardStyles.textareaReadOnly,
                                        ]} 
                                        value={latestParameter.Comments || ''} 
                                        multiline 
                                        numberOfLines={5}
                                    />
                                    <View style={{
                                        flexDirection: 'row',
                                        marginTop: 8,
                                        gap: 8,
                                    }}>
                                        <TouchableOpacity 
                                            style={{
                                                paddingHorizontal: 16,
                                                paddingVertical: 8,
                                                borderRadius: 6,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                minWidth: 80,
                                                backgroundColor: colors.primary,
                                            }}
                                            onPress={handleOpenFullScreenComments}
                                        >
                                            <Text style={{
                                                fontSize: 14,
                                                fontWeight: '600',
                                                color: colors.light,
                                            }}>Full Screen</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                             <View style={dashboardStyles.fieldRow}>
                                <Text style={dashboardStyles.fieldLabel}>Recorded</Text>
                                <Text style={dashboardStyles.fieldValue}>{latestParameter.Date_Recorded}</Text></View>
                            <View style={dashboardStyles.actionBar}>
                                <Button title="Delete" onPress={() => handleDelete(latestParameter.Parameter_ID)} color={colors.danger} />
                            </View>
                         </View>
                     )}
                 </View>
                 <View style={dashboardStyles.section}>
                    <Text style={dashboardStyles.title}>Readings List</Text>
                    <View style={dashboardStyles.sortButtonContainer}>
                        <TouchableOpacity style={dashboardStyles.sortButton} onPress={handleSortOrderChange}>
                            <Text style={dashboardStyles.sortButtonText}>Sort order: {sortOrder}</Text>
                            {
                                sortOrder === 'Newest First' ? (
                                    <ChevronUpIcon color={colors.light} />
                                ) : (
                                    <ChevronDownIcon color={colors.light} />
                                )
                            }
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        horizontal>
                            {
                                parameters.length > 0 ? (
                                    <TableComponent parametersData={parameters} onRowPress={handleRowPress} />
                                ) : (
                                    <Text>No readings found</Text>
                                )
                            }
                    </ScrollView>
                </View>
            </View>
        </ScrollView>
        
        {/* Full Screen Comments Modal */}
        <Modal
            animationType="slide"
            transparent={false}
            visible={isFullScreenModalVisible}
            onRequestClose={handleCancelFullScreenComments}
        >
            <View style={dashboardStyles.fullScreenModalContainer}>
                <View style={dashboardStyles.fullScreenModalHeader}>
                    <Text style={dashboardStyles.fullScreenModalTitle}>Edit Comments</Text>
                    <TouchableOpacity
                        onPress={handleCancelFullScreenComments}
                        style={dashboardStyles.fullScreenModalCloseButton}
                    >
                        <Text style={dashboardStyles.fullScreenModalCloseText}>×</Text>
                    </TouchableOpacity>
                </View>
                
                <TextInput
                    style={dashboardStyles.fullScreenModalTextInput}
                    value={fullScreenComments}
                    onChangeText={setFullScreenComments}
                    multiline
                    placeholder="Add detailed comments about this soil reading..."
                    placeholderTextColor={colors.secondary}
                />
                
                <View style={dashboardStyles.fullScreenModalButtonContainer}>
                    <TouchableOpacity
                        style={[dashboardStyles.fullScreenModalButton, dashboardStyles.fullScreenModalCancelButton]}
                        onPress={handleCancelFullScreenComments}
                        disabled={isSaving}
                    >
                        <Text style={dashboardStyles.fullScreenModalButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[dashboardStyles.fullScreenModalButton, dashboardStyles.fullScreenModalSaveButton]}
                        onPress={handleSaveFullScreenComments}
                        disabled={isSaving}
                    >
                        <Text style={dashboardStyles.fullScreenModalButtonText}>
                            {isSaving ? 'Saving...' : 'Save Comments'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
             </Modal>
         </>
     );
}

function TableComponent({parametersData, onRowPress}: {parametersData: ParameterList[]; onRowPress?: (parameter: ParameterList) => void}) {

    const header = ['Parameter ID', 'Date Recorded'] 
    const widthArr = [130, 220]
    const tableWidth = widthArr.reduce((sum, w) => sum + w, 0)
    const screenWidth = Dimensions.get('window').width

    return (
        <Table style={[dashboardStyles.table, { width: tableWidth }]} borderStyle={{ borderWidth: 1, borderColor: '#4a7c59' }}>
            <Row data={header} widthArr={widthArr} style={dashboardStyles.tableHeader} textStyle={dashboardStyles.tableHeaderText} />
            {parametersData.length === 0 ? (
                <Row data={["", ""]} widthArr={widthArr} style={dashboardStyles.tableRow} />
            ) : (
                parametersData.map((parameter, idx) => (
                    <TouchableOpacity key={parameter.Parameter_ID} activeOpacity={0.6} onPress={() => onRowPress?.(parameter)}>
                        <Row
                            data={[parameter.Parameter_ID, parameter.Date_Recorded]}
                            widthArr={widthArr}
                            style={idx % 2 === 0 ? dashboardStyles.tableRow : dashboardStyles.tableRowAlt}
                            textStyle={dashboardStyles.tableRowText}
                        />
                    </TouchableOpacity>
                ))
            )}
        </Table>
    )
}