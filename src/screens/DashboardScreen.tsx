import { View, TouchableOpacity, ScrollView, Text, Dimensions } from 'react-native';
import { useEffect, useState } from 'react';
// @ts-ignore 
import { Table, Row } from 'react-native-table-component';

import { dashboardStyles } from '../assets/styles/DashboardStyles.ts';
import { getSoil, idToNumber } from '../lib/axios.ts';
import { SoilList } from '../lib/types.ts';
import { ChevronUpIcon, ChevronDownIcon } from 'lucide-react-native';
import { colors } from '../assets/styles/Colors.ts';

export default function DashboardScreen({ navigation }: { navigation: any }) {

    const [soils, setSoils] = useState<SoilList[]>([]);
    const [sortBy, setSortBy] = useState<string>('id');
    const [sortOrder, setSortOrder] = useState<string>('asc');

    const getSoils = async () => {
        const newSoils = await getSoil();
        setSoils(newSoils);
    };

    useEffect(() => {
        console.log('DashboardScreen mounted');
        getSoils();
        console.log('soils', soils);
    }, []);

    useEffect(() => {
        console.log('soils', soils);
    }, [soils]);

    const handleRowPress = (soil: SoilList) => {
        console.log('Row pressed:', soil);
        navigation.navigate('SoilDetails', { soil });
    };

    const sortBtID = () => {
        setSortBy('id');
        if (sortOrder === 'asc') {
            const sortedSoils = [...soils].sort((a, b) => idToNumber(b.Soil_ID) - idToNumber(a.Soil_ID))
            setSoils(sortedSoils);
            setSortOrder('desc');
        } else {
            const sortedSoils = [...soils].sort((a, b) => idToNumber(a.Soil_ID) - idToNumber(b.Soil_ID));
            setSoils(sortedSoils);
            setSortOrder('asc');
        }
    }

    const sortByName = () => {
        setSortBy('name');
        if (sortOrder === 'asc') {
            const sortedSoils = [...soils].sort((a, b) => b.Soil_Name.localeCompare(a.Soil_Name));
            setSoils(sortedSoils);
            setSortOrder('desc');
        } else {
            const sortedSoils = [...soils].sort((a, b) => a.Soil_Name.localeCompare(b.Soil_Name));
            setSoils(sortedSoils);
            setSortOrder('asc');
        }
    }

    return (
        <ScrollView>
            <View style={dashboardStyles.container}>
                <Text style={dashboardStyles.title}>Dashboard</Text>
                <View style={dashboardStyles.section}>
                    <View style={dashboardStyles.sortButtonContainer}>
                        <TouchableOpacity 
                            style={dashboardStyles.sortButton} 
                            onPress={sortBtID}
                        >
                            <Text style={dashboardStyles.sortButtonText}>Sort by ID</Text>
                            {
                                sortBy === 'id' ? (
                                    sortOrder === 'asc' ? <ChevronUpIcon color={colors.light} /> : <ChevronDownIcon color={colors.light} />
                                ) : (
                                    <></>
                                )
                            }
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={dashboardStyles.sortButton} 
                            onPress={sortByName}
                        >
                            <Text style={dashboardStyles.sortButtonText}>Sort by Name</Text>
                            {
                                sortBy === 'name' ? (
                                    sortOrder === 'asc' ? <ChevronUpIcon color={colors.light} /> : <ChevronDownIcon color={colors.light} />
                                ) : (
                                    <></>
                                )
                            }
                        </TouchableOpacity>
                    </View>
                    <TableComponent soilsData={soils} onRowPress={handleRowPress} />
                </View>
            </View>
        </ScrollView>
    );
}

function TableComponent({soilsData, onRowPress}: {soilsData: SoilList[]; onRowPress?: (soil: SoilList) => void}) {

    const header = ['Soil ID', 'Soil Name', 'Latitude', 'Longitude']
    const screenWidth = Dimensions.get('window').width
    const widthArr = [screenWidth * 0.2, screenWidth * 0.35, screenWidth * 0.225, screenWidth * 0.225]
    const tableWidth = screenWidth
    const horizContentWidth = screenWidth

    return (
        <ScrollView
            horizontal
            nestedScrollEnabled
            style={dashboardStyles.tableOuterScroll}
            contentContainerStyle={{ width: horizContentWidth }}
            showsHorizontalScrollIndicator
            persistentScrollbar
            keyboardShouldPersistTaps="handled"
            directionalLockEnabled
        >
            <ScrollView nestedScrollEnabled style={dashboardStyles.tableInnerScroll}>
                <Table style={[dashboardStyles.table, { width: tableWidth }]} borderStyle={{ borderWidth: 1, borderColor: '#4a7c59' }}>
                    <Row data={header} widthArr={widthArr} style={dashboardStyles.tableHeader} textStyle={dashboardStyles.tableHeaderText} />
                    {soilsData.length === 0 ? (
                        <Row data={["", "", "", ""]} widthArr={widthArr} style={dashboardStyles.tableRow} />
                    ) : (
                        soilsData.map((soil, idx) => (
                            <TouchableOpacity key={soil.Soil_ID} activeOpacity={0.6} onPress={() => onRowPress?.(soil)}>
                                <Row
                                    data={[soil.Soil_ID, soil.Soil_Name, soil.Loc_Latitude, soil.Loc_Longitude]}
                                    widthArr={widthArr}
                                    style={idx % 2 === 0 ? dashboardStyles.tableRow : dashboardStyles.tableRowAlt}
                                    textStyle={dashboardStyles.tableRowText}
                                />
                            </TouchableOpacity>
                        ))
                    )}
                </Table>
            </ScrollView>
        </ScrollView>
    )
}