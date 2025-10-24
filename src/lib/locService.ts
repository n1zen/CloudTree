import Geolocation from 'react-native-geolocation-service';
import { Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export async function requestLocationPermission(): Promise<boolean> {
    try {
        const perm =
            Platform.OS === 'android'
                ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
                : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

        const status = await check(perm);
        if (status === RESULTS.GRANTED) return true;
        const req = await request(perm);
        return req === RESULTS.GRANTED;
    } catch (error) {
        console.error('Error requesting location permission:', error);
        return false;
    }
}

export async function getCurrentLocation(): Promise<{latitude: number, longitude: number}> {
    return new Promise((resolve, reject) => {
        // Check if location services are enabled
        Geolocation.getCurrentPosition(
            pos => {
                console.log('Location obtained:', pos.coords);
                resolve({latitude: pos.coords.latitude, longitude: pos.coords.longitude});
            },
            err => {
                console.error('Location error:', err);
                reject(err);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000,
                forceRequestLocation: true,
                forceLocationManager: false, // Use Google Play Services
                showLocationDialog: true,
            }
        );
    });
}

// Add a safer version that handles errors gracefully
export async function getCurrentLocationSafe(): Promise<{latitude: number, longitude: number} | null> {
    try {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
            console.log('Location permission not granted');
            return null;
        }
        
        const location = await getCurrentLocation();
        return location;
    } catch (error) {
        console.error('Error getting location:', error);
        return null;
    }
}