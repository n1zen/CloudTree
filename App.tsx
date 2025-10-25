/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { View, Text, Dimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';

import { NavigationContainer } from '@react-navigation/native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TvMinimalIcon, LeafIcon, ClipboardListIcon } from 'lucide-react-native';

import DashboardStack from './src/navigation/DashboardStack.tsx';
import SensorStack from './src/navigation/SensorStack.tsx';
import InfoStack from './src/navigation/InfoStack.tsx';

import { appStyles, tabBarColors } from './src/assets/styles/AppStyles.ts';
import { colors } from './src/assets/styles/Colors.ts';
import CloudTreeIcon from './src/components/CloudTreeIcon.tsx';

const Tab = createBottomTabNavigator();

function App() {

  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [orientation, setOrientation] = useState<string>('portrait');

  // Orientation change listener
  useEffect(() => {
    const updateOrientation = () => {
      const { width, height } = Dimensions.get('window');
      const newOrientation = width > height ? 'landscape' : 'portrait';
      setOrientation(newOrientation);
    };

    // Set initial orientation
    updateOrientation();

    // Add orientation change listener
    const subscription = Dimensions.addEventListener('change', updateOrientation);

    return () => subscription?.remove();
  }, []);

  const isLandscape = orientation === 'landscape';

  return (
    <View style={appStyles.container}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: isLandscape ? { display: 'none' } : appStyles.tabBarStyle,
            tabBarLabelStyle: appStyles.tabBarLabelStyle,
            tabBarActiveTintColor: tabBarColors.activeTintColor,
            tabBarInactiveTintColor: tabBarColors.inactiveTintColor,
            headerShown: !isLandscape,
            headerStyle: {
              backgroundColor: colors.bgDark,
              borderBottomColor: colors.primary,
              borderBottomWidth: 2,
            },
            headerTitleStyle: {
              color: colors.light,
              fontWeight: 'bold',
            },
          }}
        >
            <Tab.Screen 
              name="Home" 
              component={DashboardStack}
              options={{
                tabBarIcon: ({ color }) => (
                  <TvMinimalIcon size={24} color={color} />
                ),
                headerTitle: () => (
                  <View style={appStyles.headerTitleContainer}>
                    <CloudTreeIcon size={60} color={colors.light} />
                  </View>
                ),
              }}
            /> 
            <Tab.Screen 
              name="Sensor" 
              component={SensorStack}
              options={{
                tabBarIcon: ({ color }) => (
                  <LeafIcon size={24} color={color} />
                ),
                headerTitle: () => (
                  <View style={appStyles.headerTitleContainer}>
                    <LeafIcon size={24} color={colors.light} />
                    <Text style={appStyles.headerTitleStyle}>Sensor</Text>
                  </View>
                )
              }}
            />
            <Tab.Screen 
              name="Info"
              component={InfoStack}
              options={{
                tabBarIcon: ({ color}) => (
                  <ClipboardListIcon size={24} color={color} />
                ),
                headerTitle: () => (
                  <View style={appStyles.headerTitleContainer}>
                    <ClipboardListIcon size={24} color={colors.light} />
                    <Text style={appStyles.headerTitleStyle}>Information</Text>
                  </View>
                )
              }}
            />
        </Tab.Navigator>
      </NavigationContainer>
    </View>
  );

  
}

export default App;
