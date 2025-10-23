/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NavigationContainer } from '@react-navigation/native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TvMinimalIcon, LeafIcon, InfoIcon } from 'lucide-react-native';

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

  return (
    <View style={appStyles.container}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: appStyles.tabBarStyle,
            tabBarLabelStyle: appStyles.tabBarLabelStyle,
            tabBarActiveTintColor: tabBarColors.activeTintColor,
            tabBarInactiveTintColor: tabBarColors.inactiveTintColor,
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
              name="HomeScreen" 
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
            {/* <Tab.Screen 
              name="About CloudTree" 
              component={AboutStack}
              options={{
                tabBarIcon: ({ color }) => (
                  <InfoIcon size={24} color={color} />
                ),
                headerTitle: () => (
                  <View style={appStyles.headerTitleContainer}>
                    <InfoIcon size={24} color={colors.light} />
                    <Text style={appStyles.headerTitleStyle}>About CloudTree</Text>
                  </View>
                ),
                tabBarLabel: 'About',
              }}
            /> */}
        </Tab.Navigator>
      </NavigationContainer>
    </View>
  );

  
}

export default App;
