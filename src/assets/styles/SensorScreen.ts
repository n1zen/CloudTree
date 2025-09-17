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
    },
    modalContainer: {
        flex: 1,
        backgroundColor: colors.bgLight,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '90%',
        maxWidth: 600,
        backgroundColor: colors.bgLight,
        borderRadius: 12,
        padding: 20,
        gap: 16,
        borderWidth: 1,
        borderColor: colors.bgLight2,
    },
    textarea: {
        height: 120,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.bgDark,
        borderRadius: 10,
        textAlignVertical: 'top',
    },
    soilIDInput: {
        padding: 12,
        borderWidth: 1,
        borderColor: colors.bgDark,
        borderRadius: 10,
    },
});