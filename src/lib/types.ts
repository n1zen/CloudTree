// FOR GET FUNCTIONS
export type SoilList = {
    Soil_ID: string,
    Soil_Name: string,
    Loc_Latitude: number,
    Loc_Longitude: number
}

export type ParameterList = {
    Parameter_ID: string,
    Soil_ID: string,
    Hum: number,
    Temp: number,
    Ec: number,
    Ph: number,
    Nitrogen: number,
    Phosphorus: number,
    Potassium: number,
    Comments: string,
    Date_Recorded: string
}

// FOR POST FUNCTIONS
export type SoilRequest = {
    Soil_Name: string,
    Loc_Latitude: number,
    Loc_Longitude: number
}

export type ParameterRequest = {
    Hum: number,
    Temp: number,
    Ec: number,
    Ph: number,
    Nitrogen: number,
    Phosphorus: number,
    Potassium: number,
    Comments: string
}

export type UpdateParameterRequest = {
    Soil_ID: string,
    Parameters: ParameterRequest
}
export type CreateSoilRequest = {
    Soil: SoilRequest,
    Parameters: ParameterRequest
}
