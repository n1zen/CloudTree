import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { sensorScreenStyles } from '../assets/styles/SensorScreen.ts';
import { predictNarraSuitability } from '../lib/axios.ts';
import { XAISuitabilityResponse } from '../lib/types.ts';
import { colors } from '../assets/styles/Colors.ts';

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
    const [prediction, setPrediction] = useState<XAISuitabilityResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchPrediction = async () => {
            // Don't show loading state, just fetch in background
            setError(null);
            
            try {
                const response = await predictNarraSuitability({
                    moisture: soilData.moisture,
                    temperature: soilData.temperature,
                    ec: soilData.electricalConductivity,
                    ph: soilData.phLevel,
                    nitrogen: soilData.nitrogen,
                    phosphorus: soilData.phosphorus,
                    potassium: soilData.potassium,
                });
                
                if (isMounted) {
                    setPrediction(response);
                }
            } catch (err) {
                if (isMounted) {
                    console.error('Error fetching XAI prediction:', err);
                    setError('Failed to get prediction');
                }
            }
        };

        fetchPrediction();

        return () => {
            isMounted = false;
        };
    }, [soilData.moisture, soilData.temperature, soilData.electricalConductivity, 
        soilData.phLevel, soilData.nitrogen, soilData.phosphorus, soilData.potassium]);

    // Fallback to local calculation if no prediction yet or API fails
    const percentage = calculateNarraMatchPercentage(soilData);
    const fallbackSuitability = getSuitabilityLevel(percentage);

    // Use XAI prediction if available, otherwise fallback to local calculation
    const suitabilityLabel = prediction 
        ? (prediction.suitable ? 'Suitable' : 'Not Suitable')
        : fallbackSuitability.label;
    
    const confidencePercentage = prediction 
        ? Math.round(prediction.confidence) 
        : percentage;
    
    const idealScore = prediction 
        ? Math.round(prediction.ideal_score)
        : percentage;
    
    const description = prediction 
        ? prediction.explanation 
        : fallbackSuitability.description;

    // Determine style based on suitability
    const getSuitabilityStyle = () => {
        if (prediction) {
            if (prediction.suitable && prediction.confidence >= 85) return sensorScreenStyles.suitabilityIdeal;
            if (prediction.suitable && prediction.confidence >= 70) return sensorScreenStyles.suitabilityGood;
            if (prediction.suitable) return sensorScreenStyles.suitabilityModerate;
            if (prediction.confidence >= 70) return sensorScreenStyles.suitabilityPoor;
            return sensorScreenStyles.suitabilityUnsuitable;
        }
        return fallbackSuitability.statusStyle;
    };

    // Get color for percentage based on value
    const getPercentageColor = (value: number) => {
        if (value >= 85) return colors.success;
        if (value >= 70) return '#4CAF50';
        if (value >= 50) return colors.warning;
        if (value >= 30) return '#FF9800';
        return colors.danger;
    };

    // Get word indicator for quality score
    const getQualityIndicator = (value: number) => {
        if (value >= 85) return 'Excellent';
        if (value >= 70) return 'Good';
        if (value >= 50) return 'Moderate';
        if (value >= 30) return 'Poor';
        return 'Very Poor';
    };

    // Get word indicator for confidence level
    const getConfidenceIndicator = (value: number) => {
        if (value >= 90) return 'Very High';
        if (value >= 75) return 'High';
        if (value >= 60) return 'Moderate';
        if (value >= 40) return 'Low';
        return 'Very Low';
    };

    return (
        <View style={sensorScreenStyles.fullCard}>
            <Text style={sensorScreenStyles.cardHeader}>
                Narra Tree Soil Suitability {prediction ? '(AI)' : '(Local)'}
            </Text>
            
            {error && (
                <Text style={{ color: colors.danger, fontSize: 12, marginBottom: 4 }}>
                    {error}
                </Text>
            )}
            
            <Text style={[sensorScreenStyles.narraSuitabilityLabel, getSuitabilityStyle()]}>
                {suitabilityLabel}
            </Text>

            {prediction && (
                <View style={{ marginTop: 8 }}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
                        <Text style={{ fontSize: 12, color: colors.dark, fontWeight: '500' }}>
                            Confidence:{' '}
                            <Text style={{ color: getPercentageColor(confidencePercentage), fontWeight: '700' }}>
                                {confidencePercentage}% ({getConfidenceIndicator(confidencePercentage)})
                            </Text>
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        <Text style={{ fontSize: 12, color: colors.dark, fontWeight: '500' }}>
                            Quality Score:{' '}
                            <Text style={{ color: getPercentageColor(idealScore), fontWeight: '700' }}>
                                {idealScore}% ({getQualityIndicator(idealScore)})
                            </Text>
                        </Text>
                    </View>
                </View>
            )}
            
            {/* Separator before explanation */}
            <View style={{ 
                height: 1, 
                backgroundColor: colors.secondary, 
                marginVertical: 10,
                width: '100%' 
            }} />
            
            {/* Explanation Section */}
            <View style={{ 
                backgroundColor: colors.bgLight2, 
                padding: 10, 
                borderRadius: 8,
                borderLeftWidth: 3,
                borderLeftColor: colors.primary 
            }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.dark, marginBottom: 4 }}>
                    Explanation:
                </Text>
                <Text style={[sensorScreenStyles.narraSuitabilityDescription, { marginTop: 0 }]}>
                    {description}
                </Text>
            </View>

            {/* Separator before recommendations */}
            {prediction && prediction.recommendations && prediction.recommendations.length > 0 && (
                <>
                    <View style={{ 
                        height: 1, 
                        backgroundColor: colors.secondary, 
                        marginVertical: 10,
                        width: '100%' 
                    }} />
                    
                    <View>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.dark, marginBottom: 6 }}>
                            AI Recommendations:
                        </Text>
                        {prediction.recommendations.map((rec, idx) => (
                            <Text key={idx} style={{ fontSize: 12, color: colors.dark, marginTop: 3, lineHeight: 18 }}>
                                • {rec}
                            </Text>
                        ))}
                    </View>
                </>
            )}
        </View>
    );
}

