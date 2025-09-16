import { StyleSheet } from 'react-native';
import { colors } from './Colors.ts'

export const radioButtonStyles = StyleSheet.create({
    mainContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        gap: 20,
        marginVertical: 5
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8
    },
    outerButton: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.bgDark,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    innerButton: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: colors.success
    }
});