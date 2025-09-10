import React from "react";
import {
    View,
    Text,
    StyleSheet
} from "react-native";

function Header() {

    return(
        <View style={styles.headerContainer}>
            <Text>Cloud Tree</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        flex: 1,
        flexWrap: "nowrap",
        flexShrink: 1,
        flexBasis: "auto"
    }
});

export default Header;