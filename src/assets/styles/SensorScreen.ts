import { StyleSheet } from "react-native";
import { colors } from "./Colors.ts";

export const sensorScreenStyles = StyleSheet.create({
    mainContainer: {
        marginTop: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    sdcSuccess: {
        padding: 20,
        marginVertical: 'auto',
        width: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: colors.success,
    },
    sdcError: {
        padding: 20,
        marginVertical: 'auto',
        width: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: colors.danger,
    },
    sdcDisconnected: {
        padding: 20,
        marginVertical: 'auto',
        width: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: colors.dark,
    },
    sensorStatusContainer: {
        alignItems: 'center',
    },
    sensorStatusIndicator: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    actionsContainer: {
        marginTop: 20,
        gap: 10
    },
    button: {
        color: colors.info,
        padding: 20,
        borderRadius: 10,
    }
});