// src/components/PreBundledPhilippinesMap.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MapView, { LocalTile, Marker } from 'react-native-maps';
import { getCurrentLocation } from '../lib/locService';

export default function PreBundledPhilippinesMap() {
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [region, setRegion] = useState({
    latitude: 12.8797,
    longitude: 121.7740,
    latitudeDelta: 8.0,
    longitudeDelta: 8.0,
  });

  useEffect(() => {
    getCurrentLocationAsync();
  }, []);

  const getCurrentLocationAsync = async () => {
    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      
      if (isLocationInPhilippines(location)) {
        setRegion({
          ...location,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const isLocationInPhilippines = (location: {latitude: number, longitude: number}): boolean => {
    return location.longitude >= 116.9 && 
           location.longitude <= 126.6 && 
           location.latitude >= 4.6 && 
           location.latitude <= 21.1;
  };

  const centerOnPhilippines = () => {
    setRegion({
      latitude: 12.8797,
      longitude: 121.7740,
      latitudeDelta: 8.0,
      longitudeDelta: 8.0,
    });
  };

  const centerOnLocation = () => {
    if (currentLocation) {
      setRegion({
        ...currentLocation,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        mapType="standard"
        maxZoomLevel={18}
        minZoomLevel={3}
        loadingEnabled={false}
      >
        {/* Pre-bundled tiles from assets - USING JPG FORMAT */}
        <LocalTile
          pathTemplate={'file:///android_asset/maps/philippines/{z}/{x}/{y}.jpg'}
          tileSize={256}
        />
        
        {/* Current location marker */}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Current Location"
            description="Your current position"
            pinColor="#FF5722"
          />
        )}
        
        {/* Agricultural area markers */}
        <Marker
          coordinate={{ latitude: 15.5, longitude: 120.5 }}
          title="Central Luzon"
          description="Rice Fields"
          pinColor="#4CAF50"
        />
        
        <Marker
          coordinate={{ latitude: 17.5, longitude: 121.5 }}
          title="Cagayan Valley"
          description="Corn Fields"
          pinColor="#4CAF50"
        />
        
        <Marker
          coordinate={{ latitude: 10.5, longitude: 123.5 }}
          title="Negros"
          description="Sugar Plantations"
          pinColor="#4CAF50"
        />
      </MapView>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>✅ Always Offline Ready</Text>
          <Text style={styles.statusSubtext}>Pre-bundled Philippines Map (JPG)</Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={centerOnPhilippines}
          >
            <Text style={styles.buttonText}>🇵🇭 Philippines</Text>
          </TouchableOpacity>
          
          {currentLocation && (
            <TouchableOpacity 
              style={styles.button}
              onPress={centerOnLocation}
            >
              <Text style={styles.buttonText}>📍 My Location</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  statusContainer: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusSubtext: {
    color: 'white',
    fontSize: 12,
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
});