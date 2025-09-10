import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";

function HomeScreen( { navigation } : { navigation: any } ) {


    return(
        <View style={styles.container}>
            <Text>Welcome!</Text>
            <Button title="Go to Sensors!"
                onPress={() => navigation.navigate('Sensors')}
            />
            <Button title="Go to About"
                onPress={() => navigation.navigate('About')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    }
});

export default HomeScreen;