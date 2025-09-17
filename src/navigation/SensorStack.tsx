import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../assets/styles/Colors.ts';
import SensorScreen from '../screens/SensorScreen.jsx';

const Stack = createStackNavigator();

export default function SensorStack() {
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
        name="SensorMain" 
        component={SensorScreen}
        options={{
          title: 'Sensor Data',
          headerShown: false, // Hide header since tab navigator handles it
        }}
      />
    </Stack.Navigator>
  );
}
