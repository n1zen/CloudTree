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

