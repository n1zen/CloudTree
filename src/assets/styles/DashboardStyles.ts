import { StyleSheet } from 'react-native';
import { colors } from './Colors.ts';

export const dashboardStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgLight,
        padding: 16,
        gap: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.dark,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: colors.dark,
        marginBottom: 12,
    },
    section: {
        backgroundColor: colors.light,
        borderRadius: 8,
        padding: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },
    card: {
        backgroundColor: colors.light,
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.accent,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    cardHeader: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.dark,
        marginBottom: 8,
    },
    fieldRow: {
        marginBottom: 6,
    },
    fieldLabel: {
        fontSize: 12,
        color: colors.dark,
        opacity: 0.7,
        marginBottom: 2,
    },
    fieldValue: {
        fontSize: 14,
        color: colors.dark,
    },
    textareaReadOnly: {
        borderWidth: 1,
        borderColor: colors.secondary,
        borderRadius: 8,
        padding: 8,
        minHeight: 72,
        textAlignVertical: 'top',
        color: colors.dark,
        backgroundColor: colors.bgLight2,
    },
    actionBar: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    tableOuterScroll: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    tableInnerScroll: {
        maxHeight: 360,
    },
    table: {
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 8,
    },
    tableHeader: {
        backgroundColor: colors.primary,
    },
    tableHeaderText: {
        color: colors.light,
        fontWeight: '700',
        padding: 8,
        fontSize: 12,
        textAlign: 'center',
    },
    tableRow: {
        backgroundColor: colors.bgLight,
    },
    tableRowAlt: {
        backgroundColor: '#ffffff',
    },
    tableRowText: {
        color: colors.dark,
        padding: 8,
        fontSize: 12,
        textAlign: 'center',
    },
});
