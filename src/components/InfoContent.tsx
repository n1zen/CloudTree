import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { infoStyles } from '../assets/styles/InfoScreen';
import PlantingInstructionsTable from './PlantingInstructionsTable';

const InfoContent: React.FC = () => {

    const soilProperties = [
        {
            property: 'Soil Moisture',
            range: '20% - 60%',
            unit: '(VWC - Volumetric Water Content)',
            description: 'Soil should be moist but not waterlogged.'
        },
        {
            property: 'Soil Temperature',
            range: '18°C - 35°C',
            unit: '',
            description: 'Narra grows best in tropical to subtropical conditions; below 18°C slows growth, above 35°C stresses seedlings.'
        },
        {
            property: 'Electrical Conductivity (EC)',
            range: '500 - 2000',
            unit: 'us/cm (microsiemens per centimeter)',
            description: 'Indicates moderate nutrient availability; values below 0.5 mean nutrient-poor soil, above 2.0 suggest salinity problems.'
        },
        {
            property: 'pH Level',
            range: '5.5 – 7.5',
            unit: '',
            description: 'Slightly acidic to neutral'
        },
        {
            property: 'Nitrogen (N)',
            range: '40 – 100',
            unit: 'mg/kg (milligrams of nutrient per kilogram of soil)',
            description: 'Builds leaves, stems, and chlorophyll. Helps growth of the tree\'s foliage.'
        },
        {
            property: 'Phosphorus (P)',
            range: '15 – 25',
            unit: 'mg/kg',
            description: 'Helps root growth, energy transfer in plants, flowering/wood formation.'
        },
        {
            property: 'Potassium (K)',
            range: '120 – 200',
            unit: 'mg/kg',
            description: 'Regulates water movement, strengthens stems/leaves, aids stress resistance.'
        }
    ];

    const definitions = [
        {
            term: 'Compost',
            definition: 'Decayed organic matter that helps plants grow.'
        },
        {
            term: 'Mulch',
            definition: 'Dried leaves, straw, or other cover to keep soil cool and moist.'
        },
        {
            term: 'Lime',
            definition: 'Powder that reduces soil acidity.'
        },
        {
            term: 'NPK Fertilizer',
            definition: 'Provides Nitrogen (N), Phosphorus (P), and Potassium (K) for healthy growth.'
        },
        {
            term: 'Raised Bed/Mound',
            definition: 'Elevated soil area to avoid flooding.'
        }
    ];

    return (
        <ScrollView style={infoStyles.container} showsVerticalScrollIndicator={false}>
            <Text style={infoStyles.title}>Narra Tree Planting Guide</Text>
            
            <View style={infoStyles.section}>
                <Text style={infoStyles.sectionTitle}>Soil Property Ranges for Narra Tree Planting</Text>
                
                {soilProperties.map((item, index) => (
                    <View key={index} style={infoStyles.bulletContainer}>
                        <View style={infoStyles.bulletItem}>
                            <Text style={infoStyles.bullet}>•</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={infoStyles.bulletText}>
                                    <Text style={infoStyles.highlightText}>{item.property}</Text>
                                    {': '}
                                    <Text style={infoStyles.rangeText}>{item.range}</Text>
                                    {item.unit && ` ${item.unit}`}
                                </Text>
                                <Text style={infoStyles.descriptionText}>
                                    {item.description}
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            {/* Planting Instructions Table */}
            <PlantingInstructionsTable />

            {/* Definitions Section */}
            <View style={infoStyles.section}>
                <Text style={infoStyles.definitionsTitle}>Definition of Terms</Text>
                
                {definitions.map((item, index) => (
                    <View key={index} style={infoStyles.definitionItem}>
                        <Text style={infoStyles.definitionBullet}>•</Text>
                        <Text style={infoStyles.definitionText}>
                            <Text style={infoStyles.definitionTerm}>{item.term}</Text>
                            {': '}{item.definition}
                        </Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

export default InfoContent;