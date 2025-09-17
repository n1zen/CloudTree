import { StyleSheet } from 'react-native';
import { colors } from './Colors.ts';

export const appStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgLight,
    },
    tabBarStyle: {
        backgroundColor: colors.bgDark,
        borderTopColor: colors.primary,
        borderTopWidth: 2,
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
    },
    tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.light,
    },
    headerTitleStyle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.light,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
});

export const tabBarColors = {
    activeTintColor: colors.moss,
    inactiveTintColor: colors.accent,
};
