# XAI Model Integration Documentation

## Overview
This document describes the integration of the XAI (Explainable AI) model for predicting Narra tree soil suitability into the CloudTree mobile application.

## API Endpoint
- **URL**: `POST /predict/suitability`
- **Purpose**: Predict if soil is suitable for planting Narra trees using machine learning

### Request Format
```json
{
  "moisture": 0,
  "temperature": 0,
  "ec": 0,
  "ph": 0,
  "nitrogen": 0,
  "phosphorus": 0,
  "potassium": 0
}
```

### Response Format
```json
{
  "suitable": true/false,
  "confidence": 0.0-1.0,
  "ideal_score": 0.0-1.0,
  "explanation": "human-readable text",
  "recommendations": ["list", "of", "actionable", "suggestions"]
}
```

## Implementation Details

### 1. API Integration (`src/lib/axios.ts`)
Added new function `predictNarraSuitability()` that:
- Accepts soil parameters in the format expected by the XAI API
- Returns a typed response with suitability prediction, confidence, ideal score, explanation, and recommendations
- Includes proper error handling

### 2. NarraSoilSuitability Component (`src/components/NarraSoilSuitability.tsx`)
Enhanced component to:
- **Fetch XAI predictions** when soil data changes
- **Display AI predictions** with confidence percentage and ideal score
- **Show AI-generated recommendations** directly in the component
- **Fallback to local calculation** if XAI API is unavailable or fails
- **Indicate data source** by showing "(AI)" or "(Local)" in the header
- **Loading state** with ActivityIndicator while fetching predictions
- **Error handling** with user-friendly error messages

Key Features:
- Real-time prediction updates when sensor values change
- Graceful degradation to rule-based calculation if AI unavailable
- Component cleanup to prevent memory leaks
- Color-coded suitability status based on AI confidence levels

### 3. Comment Generator (`src/lib/commentGenerator.ts`)
Updated `formatCommentData()` function to:
- Accept optional `xaiPrediction` parameter
- **Prioritize XAI predictions** over local calculations when available
- Format AI predictions with:
  - Confidence percentage
  - Ideal score percentage
  - AI-generated explanation
  - List of AI recommendations
- Include clear indicator "🤖 AI Narra Tree Suitability Analysis:" for AI predictions
- Fallback to "🌳 Narra Tree Suitability (Local):" when XAI unavailable

### 4. Sensor Screen (`src/screens/SensorScreen.jsx`)
Modified to:
- Import `predictNarraSuitability` from axios
- **Auto-generate comments with XAI** when modal opens
- Fetch XAI prediction asynchronously
- Pass XAI prediction to `formatCommentData()`
- Handle XAI API failures gracefully with console logging
- Updated `generateComment()` function to be async and fetch XAI data

## User Experience Flow

1. **Sensor Data Collection**: App receives soil parameter values from MQTT sensor
2. **Real-time AI Prediction**: `NarraSoilSuitability` component automatically fetches AI prediction
3. **Visual Feedback**: 
   - Loading indicator while fetching
   - AI prediction displayed with confidence and ideal score
   - Color-coded status based on suitability
   - AI recommendations listed below
4. **Save/Update Modal**: When user opens save/update modal:
   - Comments are auto-generated with AI prediction included
   - Full AI analysis appears in comment section
   - User can review AI recommendations before saving

## Fallback Strategy

The implementation includes multiple layers of fallback:
1. **Primary**: XAI API prediction (when available and working)
2. **Secondary**: Local rule-based calculation (if XAI fails or unavailable)
3. **Indicator**: Clear labeling of data source ("AI" vs "Local")

This ensures the app remains fully functional even if:
- XAI API server is down
- Network connectivity issues occur
- API request times out

## Benefits

1. **Machine Learning Insights**: Leverages trained ML model for more accurate predictions
2. **Explainability**: Provides human-readable explanations for predictions
3. **Actionable Recommendations**: AI-generated specific suggestions for soil improvement
4. **Confidence Metrics**: Users know how certain the model is about predictions
5. **Reliability**: Fallback ensures app always provides value to users

## Testing Recommendations

1. Test with XAI API server running
2. Test with XAI API server offline (verify fallback)
3. Test with various soil parameter values
4. Verify comment generation includes AI data
5. Check loading states and error messages
6. Validate data formatting in comments

## Future Enhancements

- Cache XAI predictions to reduce API calls
- Add retry logic for failed API requests
- Display feature importance/SHAP values from XAI model
- Allow users to toggle between AI and local predictions
- Add historical prediction tracking

