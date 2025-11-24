export function buildGeneratorPayload(soilData: {
    moisture: number;
    temperature: number;
    electricalConductivity: number;
    phLevel: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
}) {
    return {
        Hum: soilData.moisture,
        Temp: soilData.temperature,
        Ec: soilData.electricalConductivity,
        Ph: soilData.phLevel,
        Nitrogen: soilData.nitrogen,
        Phosphorus: soilData.phosphorus,
        Potassium: soilData.potassium,
    };
}

// Narra tree ideal soil profile
const narraTreeProfile = {
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

// Soil type profiles
const soilTypeProfiles = [
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

const metricKeys = ['moisture', 'temperature', 'electricalConductivity', 'phLevel', 'nitrogen', 'phosphorus', 'potassium'];

export function calculateNarraSuitability(soilData: {
    moisture: number;
    temperature: number;
    electricalConductivity: number;
    phLevel: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
}): { label: string; percentage: number; description: string } {
    let inRangeCount = 0;
    
    metricKeys.forEach((key) => {
        const value = soilData[key as keyof typeof soilData];
        const range = narraTreeProfile.ranges[key as keyof typeof narraTreeProfile.ranges];
        if (value >= range[0] && value <= range[1]) {
            inRangeCount++;
        }
    });
    
    const percentage = Math.round((inRangeCount / metricKeys.length) * 100);
    
    let label: string;
    let description: string;
    
    if (percentage >= 85) {
        label = 'Ideal';
        description = 'Excellent soil conditions for planting Narra trees';
    } else if (percentage >= 70) {
        label = 'Good';
        description = 'Suitable for Narra trees with minor adjustments';
    } else if (percentage >= 50) {
        label = 'Moderate';
        description = 'Needs improvement for optimal Narra tree growth';
    } else if (percentage >= 30) {
        label = 'Poor';
        description = 'Significant changes needed before planting Narra trees';
    } else {
        label = 'Unsuitable';
        description = 'Not recommended for Narra tree planting without major soil amendments';
    }
    
    return { label, percentage, description };
}

export function predictSoilType(soilData: {
    moisture: number;
    temperature: number;
    electricalConductivity: number;
    phLevel: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
}): { type: string; matchPercentages: Array<{ type: string; percentage: number }> } {
    const evaluations = soilTypeProfiles.map((profile) => {
        let inRangeCount = 0;
        let totalDeviation = 0;
        
        metricKeys.forEach((key) => {
            const value = soilData[key as keyof typeof soilData];
            const range = profile.ranges[key as keyof typeof profile.ranges];
            const inRange = value >= range[0] && value <= range[1];
            
            if (inRange) {
                inRangeCount++;
            } else {
                const deviation = value < range[0] ? range[0] - value : value - range[1];
                totalDeviation += deviation;
            }
        });
        
        const percentage = Math.round((inRangeCount / metricKeys.length) * 100);
        
        return {
            type: profile.type,
            inRangeCount,
            totalDeviation,
            percentage,
        };
    });
    
    const matchPercentages = evaluations.map(({ type, percentage }) => ({ type, percentage }));
    
    const bestMatch = evaluations.sort((a, b) => {
        if (b.inRangeCount === a.inRangeCount) {
            return a.totalDeviation - b.totalDeviation;
        }
        return b.inRangeCount - a.inRangeCount;
    })[0];
    
    const threshold = Math.ceil(metricKeys.length / 2);
    const predictedType = bestMatch.inRangeCount < threshold ? 'Unknown' : bestMatch.type;
    
    return { type: predictedType, matchPercentages };
}

