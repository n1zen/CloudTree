
export interface ParameterAnalysis {
    field: string;
    value: number;
    status: 'optimal' | 'low' | 'high' | 'critical';
    message: string;
    recommendation: string;
}

export interface CommentData {
    overallStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    summary: string;
    analyses: ParameterAnalysis[];
    recommendations: string[];
    timestamp: string;
}

const PARAMETER_RANGES = {
    Hum: {
        optimal: [20, 60],
        low: [0, 19],
        high: [61, 100]
    },
    Temp: {
        optimal: [18, 35],
        low: [-40, 17],
        high: [36, 80]
    },
    Ec: {
        optimal: [500, 2000],
        low: [0, 499],
        high: [2001, 20000]
    },
    Ph: {
        optimal: [5.5, 7.5],
        low: [3, 5.4],
        high: [7.6, 9]
    },
    Nitrogen: {
        optimal: [40, 100],
        low: [0, 39],
        high: [101, 2999]
    },
    Phosphorus: {
        optimal: [12, 25],
        low: [0, 11],
        high: [26, 2999]
    },
    Potassium: {
        optimal: [120, 250],
        low: [0, 119],
        high: [251, 2999]
    }
};

const PARAMETER_MESSAGES = {
    Hum: {
        low: "Soil moisture is critically low",
        optimal: "Soil moisture is within the optimal range",
        high: "Soil is waterlogged"
    },
    Temp: {
        low: "Soil temperature is too cold",
        optimal: "Soil temperature is within the optimal range",
        high: "Soil temperature is too hot"
    },
    Ec: {
        low: "Electrical conductivity is too low",
        optimal: "Electrical conductivity is within the optimal range",
        high: "Electrical conductivity is too high"
    },
    Ph: {
        low: "pH level is too acidic",
        optimal: "pH level is within the optimal range",
        high: "pH level is too alkaline"
    },
    Nitrogen: {
        low: "Nitrogen deficiency is present",
        optimal: "Nitrogen level is adequate and within the optimal range",
        high: "Excessive nitrogen"
    },
    Phosphorus: {
        low: "Phosphorus deficiency is present",
        optimal: "Phosphorus is adequate and within the optimal range",
        high: "Excessive phosphorus"
    },
    Potassium: {
        low: "Potassium deficiency is present",
        optimal: "Potassium is adequate and within the optimal range",
        high: "Excessive potassium"
    }
};

const RECOMMENDATIONS = {
    Hum: {
        low: "Water and increase irrigation frequency",
        high: "Imporve drainage and reduce irrigation frequency",
    },
    Temp: {
        low: "Provide additional heat insulation",
        high: "Provide shade and reduce irrigation frequency",
    },
    Ec: {
        low: "Add organic matter and improve drainage",
        high: "Add gypsum and improve drainage",
    },
    Ph: {
        low: "Add lime and organic matter",
        high: "Add sulfur and organic matter",
    },
    Nitrogen: {
        low: "Add nitrogen fertilizer",
        high: "Reduce nitrogen fertilizer",
    },
    Phosphorus: {
        low: "Add phosphorus fertilizer",
        high: "Reduce phosphorus fertilizer",
    },
    Potassium: {
        low: "Add potassium fertilizer",
        high: "Reduce potassium fertilizer",
    }
};

export function analyzeParameter(field: string, value: number): ParameterAnalysis {
    //@ts-ignore
    const ranges = PARAMETER_RANGES[field];
    //@ts-ignore
    const messages = PARAMETER_MESSAGES[field];
    //@ts-ignore
    const recommendations = RECOMMENDATIONS[field];

    let status: 'optimal' | 'low' | 'high' | 'critical';
    let message: string;
    let recommendation: string;

    if (value >= ranges.optimal[0] && value <= ranges.optimal[1]) {
        status = 'optimal';
        message = messages.optimal;
        recommendation = "Maintain current conditions";
    } else if (value < ranges.optimal[0]) {
        status = value < ranges.low[1] ? 'critical' : 'low';
        message = messages.low;
        recommendation = recommendations.low;
    } else {
        status = value > ranges.high[1] ? 'critical' : 'high';
        message = messages.high;
        recommendation = recommendations.high;
    }

    return {
        field,
        value,
        status,
        message,
        recommendation
    };
}

export function generateAutoComment(parameters: {
    Hum: number,
    Temp: number,
    Ec: number,
    Ph: number,
    Nitrogen: number,
    Phosphorus: number,
    Potassium: number,
}): CommentData {

    const analyses = Object.entries(parameters).map(([field, value]) => analyzeParameter(field, value));

    const criticalCount = analyses.filter(analysis => analysis.status === 'critical').length;
    const highCount = analyses.filter(analysis => analysis.status === 'high').length;
    const lowCount = analyses.filter(analysis => analysis.status === 'low').length;
    const optimalCount = analyses.filter(analysis => analysis.status === 'optimal').length;

    let overallStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    if(criticalCount > 0) {
        overallStatus = 'critical';
    } else if (highCount + lowCount >= 3) {
        overallStatus = 'poor';
    } else if (highCount + lowCount >= 2) {
        overallStatus = 'fair';
    } else if (optimalCount >= 5) {
        overallStatus = 'excellent';
    } else {
        overallStatus = 'good';
    }

    const summary = generateSummary(overallStatus, analyses);

    const recommendations = [...new Set(analyses.map(a => a.recommendation))];

    return {
        overallStatus,
        summary,
        analyses,
        recommendations,
        timestamp: new Date().toISOString(),
    };
}

function generateSummary(status: string, analyses: ParameterAnalysis[]): string {

    const criticalIssues = analyses.filter(a => a.status === 'critical');
    const highIssues = analyses.filter(a => a.status === 'high');
    const lowIssues = analyses.filter(a => a.status === 'low');
    const optimalIssues = analyses.filter(a => a.status === 'optimal');

    switch(status) {
        case 'excellent':
            return `Excellent soil conditions! All parameters are within optimal ranges. Maitain soil conditions to keep it healthy.`
        case 'good':
            return `Good soil health overall. ${optimalIssues.length} parameters are optimal. Minor adjustments may be needed.`
        case 'fair':
            return `Fair soil conditions. ${optimalIssues.length} parameters are optimal, but ${highIssues.length + lowIssues.length} require attention.`
        case 'poor':
            return `Poor soil conditions detected. Multiple parameters need immediate attention. ${criticalIssues.length} critical issues found.`
        case 'critical':
            return `CRITICAL: Immediate intervention required! ${criticalIssues.length} parameters are in critical ranges.`;
        default:
            return "Soil analysis completed. Review individual parameter recommendations.";
    }
}

export function formatCommentData(
    commentData: CommentData, 
    prefix: 'save' | 'update' = 'save',
    soilSuitability?: { label: string; percentage: number; description: string },
    soilType?: { type: string; matchPercentages: Array<{ type: string; percentage: number }> }
): string {
    const header = prefix === 'save' 
        ? '🌱 AUTO-GENERATED RECOMMENDATIONS\n' 
        : '🔄 UPDATED RECOMMENDATIONS\n';
    
    let comment = header;
    comment += `\n📊 Overall Status: ${commentData.overallStatus.toUpperCase()}\n`;
    comment += `📝 Summary: ${commentData.summary}\n\n`;
    
    // Add Narra Tree Suitability
    if (soilSuitability) {
        const suitabilityEmoji = soilSuitability.percentage >= 85 ? '🌟' :
                                soilSuitability.percentage >= 70 ? '✅' :
                                soilSuitability.percentage >= 50 ? '⚠️' :
                                soilSuitability.percentage >= 30 ? '⚡' : '🚨';
        comment += `🌳 Narra Tree Suitability:\n`;
        comment += `${suitabilityEmoji} ${soilSuitability.label} (${soilSuitability.percentage}%)\n`;
        comment += `   ${soilSuitability.description}\n\n`;
    }
    
    // Add Soil Type Prediction
    if (soilType) {
        comment += `🔬 Soil Type: ${soilType.type}\n`;
        comment += `   Match Analysis:\n`;
        soilType.matchPercentages.forEach(match => {
            comment += `   • ${match.type}: ${match.percentage}%\n`;
        });
        comment += `\n`;
    }
    
    comment += `📈 Parameter Analysis:\n`;
    commentData.analyses.forEach(analysis => {
        const emoji = analysis.status === 'optimal' ? '✅' : 
                     analysis.status === 'critical' ? '🚨' : '⚠️';
        comment += `${emoji} ${analysis.field}: ${analysis.value} - ${analysis.message}\n`;
    });
    
    comment += `\n💡 Recommendations:\n`;
    commentData.recommendations.forEach((rec, index) => {
        comment += `${index + 1}. ${rec}\n`;
    });
    
    comment += `\n🕒 Generated: ${new Date(commentData.timestamp).toLocaleString()}`;
    
    return comment;
}