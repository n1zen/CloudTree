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
    type: string;
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

const soilTypeProfiles: SoilProfile[] = [
    {
        type: 'Sandy',
        ranges: {
            moisture: [15, 25],
            temperature: [25, 32],
            electricalConductivity: [100, 400],
            phLevel: [5.5, 6.5],
            nitrogen: [40, 80],
            phosphorus: [10, 25],
            potassium: [60, 120],
        },
    },
    {
        type: 'Clay',
        ranges: {
            moisture: [30, 40],
            temperature: [20, 28],
            electricalConductivity: [300, 1000],
            phLevel: [6.0, 7.0],
            nitrogen: [80, 150],
            phosphorus: [20, 35],
            potassium: [120, 250],
        },
    },
    {
        type: 'Silt',
        ranges: {
            moisture: [25, 35],
            temperature: [20, 28],
            electricalConductivity: [200, 600],
            phLevel: [6.0, 7.0],
            nitrogen: [70, 130],
            phosphorus: [15, 30],
            potassium: [100, 220],
        },
    },
    {
        type: 'Loamy',
        ranges: {
            moisture: [20, 30],
            temperature: [22, 30],
            electricalConductivity: [200, 600],
            phLevel: [5.8, 6.5],
            nitrogen: [90, 150],
            phosphorus: [20, 40],
            potassium: [120, 250],
        },
    },
];

const metricConfig = [
    { key: 'moisture', label: 'Moisture', unit: '%', decimals: 1 },
    { key: 'temperature', label: 'Temperature', unit: '°C', decimals: 1 },
    { key: 'electricalConductivity', label: 'Conductivity', unit: ' µS/cm', decimals: 0 },
    { key: 'phLevel', label: 'pH', unit: '', decimals: 1 },
    { key: 'nitrogen', label: 'Nitrogen', unit: ' mg/kg', decimals: 0 },
    { key: 'phosphorus', label: 'Phosphorus', unit: ' mg/kg', decimals: 0 },
    { key: 'potassium', label: 'Potassium', unit: ' mg/kg', decimals: 0 },
] as const;

type MetricConfig = typeof metricConfig[number];

type EvaluatedMetric = MetricConfig & {
    value: number;
    range: Range;
    inRange: boolean;
    deviation: number;
};

type SoilPrediction = {
    type: string;
    metrics: EvaluatedMetric[];
    inRangeCount: number;
    totalDeviation: number;
};

function evaluateProfile(data: SoilData, profile: SoilProfile): SoilPrediction {
    const metrics: EvaluatedMetric[] = metricConfig.map((metric) => {
        const value = data[metric.key as keyof SoilData] as number;
        const [min, max] = profile.ranges[metric.key as keyof SoilProfile['ranges']];
        const inRange = value >= min && value <= max;
        const deviation = inRange ? 0 : value < min ? min - value : value - max;
        return {
            ...metric,
            value,
            range: [min, max],
            inRange,
            deviation,
        };
    });

    const inRangeCount = metrics.filter((metric) => metric.inRange).length;
    const totalDeviation = metrics.reduce((sum, metric) => sum + metric.deviation, 0);

    return {
        type: profile.type,
        metrics,
        inRangeCount,
        totalDeviation,
    };
}

function calculateMatchPercentage(prediction: SoilPrediction): number {
    const totalMetrics = prediction.metrics.length;
    const inRangeCount = prediction.inRangeCount;
    return Math.round((inRangeCount / totalMetrics) * 100);
}

function predictSoilType(soilData: SoilData) {
    const evaluations = soilTypeProfiles.map((profile) => evaluateProfile(soilData, profile));
    const bestMatch = evaluations
        .sort((a, b) => {
            if (b.inRangeCount === a.inRangeCount) {
                return a.totalDeviation - b.totalDeviation;
            }
            return b.inRangeCount - a.inRangeCount;
        })
        .shift();
    
    if (!bestMatch) {
        return null;
    }
    
    // Show "unknown" if less than half of the parameters match (less than 4 out of 7)
    const threshold = Math.ceil(metricConfig.length / 2);
    if (bestMatch.inRangeCount < threshold) {
        return {
            ...bestMatch,
            type: 'Unknown',
        };
    }
    
    return bestMatch;
}

function getAllMatchPercentages(soilData: SoilData) {
    const soilTypeEvaluations = soilTypeProfiles.map((profile) => evaluateProfile(soilData, profile));
    
    return soilTypeEvaluations.map((evaluation) => ({
        type: evaluation.type,
        percentage: calculateMatchPercentage(evaluation),
    }));
}

export default function SoilTypePredictor({ soilData }: { soilData: SoilData }) {
    const prediction = useMemo(() => predictSoilType(soilData), [soilData]);
    const matchPercentages = useMemo(() => getAllMatchPercentages(soilData), [soilData]);

    if (!prediction) {
        return null;
    }

    return (
        <View style={sensorScreenStyles.predictionCard}>
            <Text style={sensorScreenStyles.predictionCardHeader}>Soil Type</Text>
            <Text style={sensorScreenStyles.predictionValue}>{prediction.type}</Text>
            
            <View style={sensorScreenStyles.soilTypeMatchesContainer}>
                {matchPercentages.map((soilType) => (
                    <Text key={soilType.type} style={sensorScreenStyles.soilTypeMatchText}>
                        {soilType.type}: {soilType.percentage}%
                    </Text>
                ))}
            </View>
        </View>
    );
}

