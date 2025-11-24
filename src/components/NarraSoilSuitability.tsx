import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { sensorScreenStyles } from '../assets/styles/SensorScreen.ts';

type SoilData = {
    moisture: number;
    temperature: number;
    electricalConductivity: number;
    phLevel: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
};

type Range = [number, number];

type SoilProfile = {
    ranges: {
        moisture: Range;
        temperature: Range;
        electricalConductivity: Range;
        phLevel: Range;
        nitrogen: Range;
        phosphorus: Range;
        potassium: Range;
    };
};

// Narra tree ideal soil profile based on research
const narraTreeProfile: SoilProfile = {
    ranges: {
        moisture: [20, 60],
        temperature: [18, 35],
        electricalConductivity: [500, 2000],
        phLevel: [5.5, 7.5],
        nitrogen: [40, 100],
        phosphorus: [15, 25],
        potassium: [120, 200],
    },
};

const metricConfig = [
    { key: 'moisture', label: 'Moisture' },
    { key: 'temperature', label: 'Temperature' },
    { key: 'electricalConductivity', label: 'Conductivity' },
    { key: 'phLevel', label: 'pH' },
    { key: 'nitrogen', label: 'Nitrogen' },
    { key: 'phosphorus', label: 'Phosphorus' },
    { key: 'potassium', label: 'Potassium' },
] as const;

function calculateNarraMatchPercentage(data: SoilData): number {
    let inRangeCount = 0;
    
    metricConfig.forEach((metric) => {
        const value = data[metric.key as keyof SoilData] as number;
        const [min, max] = narraTreeProfile.ranges[metric.key as keyof SoilProfile['ranges']];
        const inRange = value >= min && value <= max;
        if (inRange) {
            inRangeCount++;
        }
    });
    
    return Math.round((inRangeCount / metricConfig.length) * 100);
}

function getSuitabilityLevel(percentage: number): {
    label: string;
    description: string;
    statusStyle: any;
} {
    if (percentage >= 85) {
        return {
            label: 'Ideal',
            description: 'Excellent soil conditions for planting Narra trees',
            statusStyle: sensorScreenStyles.suitabilityIdeal,
        };
    } else if (percentage >= 70) {
        return {
            label: 'Good',
            description: 'Suitable for Narra trees with minor adjustments',
            statusStyle: sensorScreenStyles.suitabilityGood,
        };
    } else if (percentage >= 50) {
        return {
            label: 'Moderate',
            description: 'Needs improvement for optimal Narra tree growth',
            statusStyle: sensorScreenStyles.suitabilityModerate,
        };
    } else if (percentage >= 30) {
        return {
            label: 'Poor',
            description: 'Significant changes needed before planting Narra trees',
            statusStyle: sensorScreenStyles.suitabilityPoor,
        };
    } else {
        return {
            label: 'Unsuitable',
            description: 'Not recommended for Narra tree planting without major soil amendments',
            statusStyle: sensorScreenStyles.suitabilityUnsuitable,
        };
    }
}

export default function NarraSoilSuitability({ soilData }: { soilData: SoilData }) {
    const percentage = useMemo(() => calculateNarraMatchPercentage(soilData), [soilData]);
    const suitability = useMemo(() => getSuitabilityLevel(percentage), [percentage]);

    return (
        <View style={sensorScreenStyles.narraSuitabilityCard}>
            <Text style={sensorScreenStyles.narraSuitabilityHeader}>Narra Tree Soil Suitability</Text>
            
            <View style={sensorScreenStyles.narraSuitabilityContent}>
                <Text style={[sensorScreenStyles.narraSuitabilityLabel, suitability.statusStyle]}>
                    {suitability.label}
                </Text>
                <Text style={sensorScreenStyles.narraSuitabilityPercentage}>
                    {percentage}%
                </Text>
            </View>
            
            <Text style={sensorScreenStyles.narraSuitabilityDescription}>
                {suitability.description}
            </Text>
        </View>
    );
}

