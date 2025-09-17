import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../assets/styles/Colors.ts';
import AboutScreen from '../screens/AboutScreen.tsx';

const Stack = createStackNavigator();

export default function AboutStack() {
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
        name="AboutMain" 
        component={AboutScreen}
        options={{
          title: 'About CloudTree',
          headerShown: false, // Hide header since tab navigator handles it
        }}
      />
    </Stack.Navigator>
  );
}
