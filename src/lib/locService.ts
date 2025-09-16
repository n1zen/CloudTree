import Geolocation from 'react-native-geolocation-service';
import { Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export async function requestLocationPermission(): Promise<boolean> {
    const perm =
        Platform.OS === 'android'
            ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
            : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

    const status = await check(perm);
    if (status === RESULTS.GRANTED) return true;
    const req = await request(perm);
    return req === RESULTS.GRANTED;
}

export async function getCurrentLocation(): Promise<{latitude: number, longitude: number}> {
    return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
            pos => resolve({latitude: pos.coords.latitude, longitude: pos.coords.longitude}),
            err => reject(err),
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000,
            }
        )
    })
}
