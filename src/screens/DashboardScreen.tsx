import { View, TouchableOpacity, ScrollView, Text, Dimensions, TextInput, Alert, ActivityIndicator, Switch } from 'react-native';
import { useEffect, useState } from 'react';
// @ts-ignore 
import { Table, Row } from 'react-native-table-component';

import { dashboardStyles } from '../assets/styles/DashboardStyles.ts';
import { idToNumber } from '../lib/axios.ts';
import { getSoils as getDataSoils, checkConnectivity, getOfflineMode, setOfflineMode } from '../lib/dataService.ts';
import { fullSync, syncFromServer, syncToServer, getPendingCount } from '../lib/syncService.ts';
import { SoilList } from '../lib/types.ts';
import { ChevronUpIcon, ChevronDownIcon, RefreshCwIcon, CloudIcon, CloudOffIcon, UploadIcon, DownloadIcon } from 'lucide-react-native';
import { colors } from '../assets/styles/Colors.ts';

export default function DashboardScreen({ navigation }: { navigation: any }) {

    const [soils, setSoils] = useState<SoilList[]>([]);
    const [sortBy, setSortBy] = useState<string>('id');
    const [sortOrder, setSortOrder] = useState<string>('asc');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filteredSoils, setFilteredSoils] = useState<SoilList[]>([]);
    const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
    const [orientation, setOrientation] = useState<string>('portrait');
    const [isOnline, setIsOnline] = useState<boolean>(false);
    const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
    const [isSyncing, setIsSyncing] = useState<boolean>(false);
    const [pendingCount, setPendingCount] = useState<{soils: number, parameters: number}>({soils: 0, parameters: 0});

    const getSoils = async () => {
        try {
            const newSoils = await getDataSoils();
            setSoils(newSoils);
        } catch (error) {
            console.error('Error fetching soils:', error);
            Alert.alert('Error', 'Failed to load soil data');
        }
    };

    const checkStatus = async () => {
        const online = await checkConnectivity();
        setIsOnline(online);
        const offline = await getOfflineMode();
        setIsOfflineMode(offline);
        const pending = await getPendingCount();
        setPendingCount(pending);
    };

    const handleToggleOfflineMode = async (value: boolean) => {
        await setOfflineMode(value);
        setIsOfflineMode(value);
        Alert.alert(
            value ? 'Offline Mode Enabled' : 'Online Mode Enabled',
            value ? 'All changes will be saved locally until you sync.' : 'Changes will be saved to the server automatically.'
        );
    };

    const handleFullSync = async () => {
        setIsSyncing(true);
        try {
            const result = await fullSync();
            if (result.success) {
                Alert.alert('Sync Complete', result.message);
                await getSoils();
                await checkStatus();
            } else {
                Alert.alert('Sync Error', result.message + '\n\nErrors: ' + result.errors.join('\n'));
            }
        } catch (error) {
            Alert.alert('Sync Failed', String(error));
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSyncToServer = async () => {
        setIsSyncing(true);
        try {
            const result = await syncToServer();
            if (result.success) {
                Alert.alert('Upload Complete', result.message);
                await checkStatus();
            } else {
                Alert.alert('Upload Error', result.message + '\n\nErrors: ' + result.errors.join('\n'));
            }
        } catch (error) {
            Alert.alert('Upload Failed', String(error));
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSyncFromServer = async () => {
        setIsSyncing(true);
        try {
            const result = await syncFromServer();
            if (result.success) {
                Alert.alert('Download Complete', result.message);
                await getSoils();
                await checkStatus();
            } else {
                Alert.alert('Download Error', result.message + '\n\nErrors: ' + result.errors.join('\n'));
            }
        } catch (error) {
            Alert.alert('Download Failed', String(error));
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        console.log('DashboardScreen mounted');
        getSoils();
        checkStatus();
        console.log('soils', soils);
        
        // Refresh status every 30 seconds
        const interval = setInterval(checkStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        filterSoils(searchQuery);
    }, [soils]);

    // Orientation change listener
    useEffect(() => {
        const updateOrientation = () => {
            const { width, height } = Dimensions.get('window');
            const newOrientation = width > height ? 'landscape' : 'portrait';
            setOrientation(newOrientation);
        };

        // Set initial orientation
        updateOrientation();

        // Add orientation change listener
        const subscription = Dimensions.addEventListener('change', updateOrientation);

        return () => subscription?.remove();
    }, []);

    const handleRowPress = (soil: SoilList) => {
        console.log('Row pressed:', soil);
        navigation.navigate('SoilDetails', { soil });
    };

    const filterSoils = (query: string) => {
        if(!query.trim()) {
            setFilteredSoils(soils);
        } else {
            const filtered = soils.filter(soil =>
                soil.Soil_Name.toLowerCase().includes(query.toLowerCase()) ||
                soil.Soil_ID.toLowerCase().includes(query.toLowerCase()) ||
                soil.Loc_Latitude.toString().includes(query.toLowerCase()) ||
                soil.Loc_Longitude.toString().includes(query.toLowerCase())
            );
            setFilteredSoils(filtered);
        }
    };

    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
        filterSoils(text);
    }

    const sortBtID = () => {
        setSortBy('id');
        if (sortOrder === 'asc') {
            const sortedSoils = [...filteredSoils].sort((a, b) => idToNumber(b.Soil_ID) - idToNumber(a.Soil_ID))
            setFilteredSoils(sortedSoils);
            setSortOrder('desc');
        } else {
            const sortedSoils = [...filteredSoils].sort((a, b) => idToNumber(a.Soil_ID) - idToNumber(b.Soil_ID));
            setFilteredSoils(sortedSoils);
            setSortOrder('asc');
        }
    }

    const sortByName = () => {
        setSortBy('name');
        if (sortOrder === 'asc') {
            const sortedSoils = [...filteredSoils].sort((a, b) => b.Soil_Name.localeCompare(a.Soil_Name));
            setFilteredSoils(sortedSoils);
            setSortOrder('desc');
        } else {
            const sortedSoils = [...filteredSoils].sort((a, b) => a.Soil_Name.localeCompare(b.Soil_Name));
            setFilteredSoils(sortedSoils);
            setSortOrder('asc');
        }
    }

    return (
        <ScrollView>
            <View style={dashboardStyles.container}>
                <Text style={dashboardStyles.title}>Dashboard</Text>
                
                {/* Status Bar */}
                <View style={dashboardStyles.statusBar}>
                    <View style={dashboardStyles.statusItem}>
                        {isOnline ? (
                            <CloudIcon color={colors.success} size={20} />
                        ) : (
                            <CloudOffIcon color={colors.danger} size={20} />
                        )}
                        <Text style={dashboardStyles.statusText}>
                            {isOnline ? 'Backend Connected' : 'Backend Offline'}
                        </Text>
                    </View>
                    
                    <View style={dashboardStyles.statusItem}>
                        <Text style={dashboardStyles.statusText}>Offline Mode</Text>
                        <Switch
                            value={isOfflineMode}
                            onValueChange={handleToggleOfflineMode}
                            trackColor={{ false: colors.secondary, true: colors.success }}
                            thumbColor={colors.light}
                        />
                    </View>
                    
                    {(pendingCount.soils > 0 || pendingCount.parameters > 0) && (
                        <View style={dashboardStyles.statusItem}>
                            <Text style={[dashboardStyles.statusText, { color: colors.warning }]}>
                                Pending: {pendingCount.soils + pendingCount.parameters}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Sync Buttons */}
                <View style={dashboardStyles.syncButtonContainer}>
                    <TouchableOpacity 
                        style={[dashboardStyles.syncButton, dashboardStyles.syncButtonFull]}
                        onPress={handleFullSync}
                        disabled={isSyncing || !isOnline}
                    >
                        {isSyncing ? (
                            <ActivityIndicator color={colors.light} />
                        ) : (
                            <>
                                <RefreshCwIcon color={colors.light} size={20} />
                                <Text style={dashboardStyles.syncButtonText}>Full Sync</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={dashboardStyles.syncButton}
                        onPress={handleSyncToServer}
                        disabled={isSyncing || !isOnline || (pendingCount.soils === 0 && pendingCount.parameters === 0)}
                    >
                        <UploadIcon color={colors.light} size={16} />
                        <Text style={dashboardStyles.syncButtonTextSmall}>Upload</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={dashboardStyles.syncButton}
                        onPress={handleSyncFromServer}
                        disabled={isSyncing || !isOnline}
                    >
                        <DownloadIcon color={colors.light} size={16} />
                        <Text style={dashboardStyles.syncButtonTextSmall}>Download</Text>
                    </TouchableOpacity>
                </View>

                <View style={dashboardStyles.section}>
                    <View style={dashboardStyles.searchContainer}>
                        <TextInput
                            style={[dashboardStyles.searchInput, isSearchFocused && dashboardStyles.searchInputFocused]}
                            placeholder="Search soils by ID, name, or coordinates"
                            value={searchQuery}
                            onChangeText={handleSearchChange}
                            placeholderTextColor={colors.dark}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                        />
                    </View>
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
                    {filteredSoils.length > 0 ? (
                        <TableComponent soilsData={filteredSoils} onRowPress={handleRowPress} orientation={orientation} />
                    ) : (
                        <Text>No results found</Text>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}

function TableComponent({soilsData, onRowPress, orientation}: {soilsData: SoilList[]; onRowPress?: (soil: SoilList) => void; orientation: string}) {

    const header = ['Soil ID', 'Soil Name', 'Latitude', 'Longitude']
    const screenWidth = Dimensions.get('window').width
    const isLandscape = orientation === 'landscape'
    
    let widthArr, tableWidth, horizContentWidth
    
    if (isLandscape) {
        // Use full of screen width in landscape
        const landscapeWidth = screenWidth * 1
        widthArr = [landscapeWidth * 0.2, landscapeWidth * 0.35, landscapeWidth * 0.225, landscapeWidth * 0.225]
        tableWidth = landscapeWidth
        horizContentWidth = landscapeWidth
    } else {
        // Static column widths for portrait
        widthArr = [100, 200, 150, 150] // Fixed widths for each column
        tableWidth = widthArr.reduce((sum, w) => sum + w, 0) // Total table width
        horizContentWidth = tableWidth
    }

    return (
        <ScrollView
            horizontal
            nestedScrollEnabled
            style={dashboardStyles.dashboardTableOuterScroll}
            contentContainerStyle={{ width: horizContentWidth }}
            showsHorizontalScrollIndicator
            persistentScrollbar
            keyboardShouldPersistTaps="handled"
            directionalLockEnabled
        >
            <ScrollView nestedScrollEnabled style={dashboardStyles.dashboardTableInnerScroll}>
                <Table style={[dashboardStyles.dashboardTable, { width: tableWidth }]} borderStyle={{ borderWidth: 1, borderColor: '#4a7c59' }}>
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