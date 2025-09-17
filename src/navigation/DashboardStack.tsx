import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../assets/styles/Colors.ts';
import HomeScreen from '../screens/HomeScreen.tsx';
import DashboardScreen from '../screens/DashboardScreen.tsx';
import SoilDetailsScreen from '../screens/SoilDetailsScreen.tsx';

const Stack = createStackNavigator();

export default function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.bgDark,
          borderBottomColor: colors.primary,
          borderBottomWidth: 2,
        },
        headerTintColor: colors.light,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Home',
          headerShown: false, // Hide header since tab navigator handles it
        }}
      />
      <Stack.Screen 
        name="DashboardScreen" 
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          headerShown: false, // Show header for nested screens
        }}
      />
      <Stack.Screen
        name="SoilDetails"
        component={SoilDetailsScreen}
        options={{
          title: 'Soil Details',
          headerShown: false, // Show header for nested screens
        }}
      />
    </Stack.Navigator>
  );
}
