import { View, TouchableOpacity, ScrollView, Text, Dimensions } from 'react-native';
import { useEffect, useState } from 'react';
// @ts-ignore 
import { Table, Row } from 'react-native-table-component';

import { dashboardStyles } from '../assets/styles/DashboardStyles.ts';
import { getSoil } from '../lib/axios.ts';
import { SoilList } from '../lib/types.ts';

export default function DashboardScreen({ navigation }: { navigation: any }) {

    const [soils, setSoils] = useState<SoilList[]>([]);

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

    return (
        <View style={dashboardStyles.container}>
            <Text style={dashboardStyles.title}>Dashboard</Text>
            <View style={dashboardStyles.section}>
                <TableComponent soilsData={soils} onRowPress={handleRowPress} />
            </View>
        </View>
    );
}

function TableComponent({soilsData, onRowPress}: {soilsData: SoilList[]; onRowPress?: (soil: SoilList) => void}) {

    const header = ['Soil ID', 'Soil Name', 'Latitude', 'Longitude']
    const widthArr = [100, 180, 140, 140]
    const tableWidth = widthArr.reduce((sum, w) => sum + w, 0)
    const screenWidth = Dimensions.get('window').width
    const horizContentWidth = Math.max(tableWidth, screenWidth + 1)

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