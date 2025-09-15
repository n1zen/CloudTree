/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from './src/screens/HomeScreen.tsx';
import AboutScreen from './src/screens/AboutScreen.tsx';
import SensorScreen from './src/screens/SensorScreen.jsx';

// const Stack = createNativeStackNavigator();

const Tab = createBottomTabNavigator();

function App() {

  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {

  return (
    <View style={styles.container}>
      <NavigationContainer>
        {/* <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen}
            options={{ title: 'CloudTree' }}
          />
          <Stack.Screen name="Sensors" component={SensorScreen}
            options={{ title: 'Sensors' }}
          />
          <Stack.Screen name="About" component={AboutScreen}
            options={{ title: 'About' }}
          />
        </Stack.Navigator> */}
        <Tab.Navigator>
          <Tab.Screen name="Home" component={HomeScreen} /> 
          <Tab.Screen name="Sensors" component={SensorScreen} />
          <Tab.Screen name="About" component={AboutScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </View>
  );

  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
