import React from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { infoStyles } from '../assets/styles/InfoScreen';

interface SoilCondition {
    deficiency: string;
    good: string;
    excessive: string;
}

interface SoilProperty {
    property: string;
    conditions: SoilCondition;
}

const PlantingInstructionsTable: React.FC = () => {
    const soilProperties: SoilProperty[] = [
        {
            property: 'pH Level',
            conditions: {
                deficiency: '< 5.5 (Acidic)\nMix in 200-500 g of agricultural lime and organic compost. Avoid too much chemical fertilizer.',
                good: '5.5 – 7.5 (Optimal)\nJust dig a 30-45 cm deep hole, loosen the soil, and mix a bit of compost.',
                excessive: '> 7.5 (Alkaline)\nAdd organic compost, peat moss, or rice hulls. You can also use small amounts of sulfur. Avoid alkaline water.'
            }
        },
        {
            property: 'Moisture',
            conditions: {
                deficiency: '< 20% VWC (Dry soil)\nWater 2-3 times a week. Add a thick layer of mulch (like dried leaves or straw). You can dig small basins to catch rainwater.',
                good: '20% – 60% VWC (Moist but well-drained)\nWater right after planting (about 2-3 liters). Add a thin layer of mulch. Water weekly or as needed.',
                excessive: '> 60% VWC (Waterlogged Soils)\nPlant on a small mound (15-20 cm high). Make small canals to drain extra water. Avoid overwatering.'
            }
        },
        {
            property: 'Soil Temperature',
            conditions: {
                deficiency: '< 18°C (Too cold)\nPlant in sunny areas. Use mulch or simple covers to keep the soil warm.',
                good: '18°C – 35°C (Optimal)\nPlant in full sunlight. Keep soil naturally covered with leaves or grass.',
                excessive: '> 35°C (Too hot)\nUse shade nets or bamboo screens. Water early morning or late afternoon. Don\'t apply fertilizer during extreme heat.'
            }
        },
        {
            property: 'Electrical Conductivity',
            conditions: {
                deficiency: '< 0.5 (Too Low)\nAdd compost or manure. You may also apply 10-20 g of balanced fertilizer (NPK 14-14-14).',
                good: '0.5 – 2.0 dS/m (Optimal)\nPlant directly and add a small amount of compost or fertilizer.',
                excessive: '> 2.0 dS/m (Too high)\nRinse soil with freshwater to remove salt. Mix in compost or rice hulls. Use gypsum if needed.'
            }
        },
        {
            property: 'Nitrogen (N)',
            conditions: {
                deficiency: '< 40 mg/kg (Low)\nMix compost or manure into the soil. Use a small amount of nitrogen-rich fertilizer (like NPK 14-14-14).',
                good: '40 – 100 mg/kg (Ideal)\nKeep adding compost or mulch once in a while. No need for heavy fertilizer.',
                excessive: '> 120 mg/kg (High)\nStop nitrogen fertilizers. Use a balanced fertilizer with more P and K (like 10-20-20). Avoid overfeeding.'
            }
        },
        {
            property: 'Phosphorus (P)',
            conditions: {
                deficiency: '< 12 mg/kg (Low)\nAdd P-rich fertilizer such as rock phosphate, 10-20-10, or 16-20-0. Mix well with topsoil before planting.',
                good: '15 – 25 mg/kg (Ideal)\nKeep soil pH healthy (5.5-7.5). Add compost once a year to maintain it.',
                excessive: '> 30 mg/kg (High)\nStop using P fertilizers. Too much P can block other nutrients like iron and zinc. Focus on watering and organic mulch instead.'
            }
        },
        {
            property: 'Potassium (K)',
            conditions: {
                deficiency: '< 100 mg/kg (Low)\nAdd potassium sulfate (K2SO4) or NPK fertilizer with higher K (like 12-12-17). Use mulch to keep moisture and reduce nutrient loss.',
                good: '120 – 200 mg/kg (Ideal)\nMaintain by adding compost or organic mulch once or twice a year. Monitor leaf color and growth.',
                excessive: '> 250 mg/kg (High)\nAvoid K fertilizers for a while. Too much can block calcium or magnesium. Focus on watering and organic matter balance.'
            }
        }
    ];

    // Calculate minimum width for the table
    const screenWidth = Dimensions.get('window').width;
    const minTableWidth = Math.max(screenWidth, 800); // Ensure minimum width for readability

    return (
        <View style={infoStyles.tableContainer}>
            <Text style={infoStyles.tableTitle}>
                Planting Instructions for Narra Seedlings Based on Soil Parameters
            </Text>
            
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={true}
                style={infoStyles.tableScrollContainer}
                contentContainerStyle={{ minWidth: minTableWidth }}
            >
                <View style={infoStyles.tableContent}>
                    {/* Table Header */}
                    <View style={infoStyles.tableHeader}>
                        <View style={[infoStyles.tableHeaderCell, infoStyles.propertyHeaderCell]}>
                            <Text style={infoStyles.tableHeaderText}>Soil Property</Text>
                        </View>
                        <View style={infoStyles.tableHeaderCell}>
                            <Text style={infoStyles.tableHeaderText}>Deficient</Text>
                        </View>
                        <View style={infoStyles.tableHeaderCell}>
                            <Text style={infoStyles.tableHeaderText}>Good</Text>
                        </View>
                        <View style={infoStyles.tableHeaderCell}>
                            <Text style={infoStyles.tableHeaderText}>Excessive</Text>
                        </View>
                    </View>

                    {/* Table Rows */}
                    {soilProperties.map((item, index) => (
                        <View key={index} style={infoStyles.tableRow}>
                            <View style={[infoStyles.propertyCell, infoStyles.propertyCellFixed]}>
                                <Text style={infoStyles.propertyText}>{item.property}</Text>
                            </View>
                            <View style={[infoStyles.conditionCell, infoStyles.deficiencyCell]}>
                                <Text style={infoStyles.conditionText}>{item.conditions.deficiency}</Text>
                            </View>
                            <View style={[infoStyles.conditionCell, infoStyles.goodCell]}>
                                <Text style={infoStyles.conditionText}>{item.conditions.good}</Text>
                            </View>
                            <View style={[infoStyles.conditionCell, infoStyles.excessiveCell]}>
                                <Text style={infoStyles.conditionText}>{item.conditions.excessive}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

export default PlantingInstructionsTable;
