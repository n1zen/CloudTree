import { StyleSheet } from 'react-native';
import { colors } from './Colors.ts';

export const homeScreenStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.bgLight,
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: colors.dark,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: colors.secondary,
        textAlign: 'center',
        marginBottom: 30,
    },
    iconContainer: {
        backgroundColor: colors.bgLight2,
        borderRadius: 50,
        padding: 20,
        marginBottom: 20,
        shadowColor: colors.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    welcomeText: {
        fontSize: 18,
        color: colors.dark,
        textAlign: 'center',
        marginBottom: 20,
    },
});