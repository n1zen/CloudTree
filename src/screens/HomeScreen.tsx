import React from "react";
import { View, Text, Button } from "react-native";

import CloudTreeIcon from "../components/CloudTreeIcon.tsx";
import { homeScreenStyles } from "../assets/styles/HomeScreen.ts";
import { colors } from "../assets/styles/Colors.ts";

function HomeScreen({ navigation }: any) {
    return(
        <View style={homeScreenStyles.container}>
            <View style={homeScreenStyles.iconContainer}>
                <CloudTreeIcon size={80} color={colors.primary}/>
            </View>
            <Text style={homeScreenStyles.title}>CloudTree</Text>
            <Text style={homeScreenStyles.subtitle}>Finding a suitable place for your tree.</Text>
            <Button 
                title="Open Dashboard" 
                onPress={() => navigation.navigate('DashboardScreen')} 
                color={colors.primary} 
            />
        </View>
    );
}

export default HomeScreen;