import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../assets/styles/Colors.ts';
import InfoScreen from '../screens/InfoScreen.tsx';

const Stack = createStackNavigator();

export default function InfoStack() {
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
        name="InfoMain" 
        component={InfoScreen}
        options={{
          title: 'Information',
          headerShown: false, // Hide header since tab navigator handles it
        }}
      />
    </Stack.Navigator>
  );
}
