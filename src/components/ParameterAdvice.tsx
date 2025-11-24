import React from 'react';
import { View, Text } from 'react-native';

import { sensorScreenStyles } from '../assets/styles/SensorScreen.ts';

interface ParameterAdviceProps {
    field: string;
    parameterInsights: Record<string, {
        status: 'optimal' | 'low' | 'high' | 'critical';
        message: string;
        recommendation: string;
    }>;
}

export default function ParameterAdvice({ field, parameterInsights }: ParameterAdviceProps) {
    const analysis = parameterInsights?.[field];
    if (!analysis) {
        return null;
    }

    const isOptimal = analysis.status === 'optimal';
    const statusColorStyle = isOptimal
        ? sensorScreenStyles.adviceStatusOptimal
        : analysis.status === 'critical'
            ? sensorScreenStyles.adviceStatusCritical
            : sensorScreenStyles.adviceStatusWarning;

    return (
        <View style={sensorScreenStyles.adviceContainer}>
            <Text style={[sensorScreenStyles.adviceStatusText, statusColorStyle]}>
                {analysis.message}
            </Text>
            {!isOptimal && (
                <Text style={sensorScreenStyles.adviceRecommendationText}>
                    {analysis.recommendation}
                </Text>
            )}
        </View>
    );
}

