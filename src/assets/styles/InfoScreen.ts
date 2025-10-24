import { StyleSheet } from 'react-native';
import { colors } from './Colors.ts';

export const infoStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgLight,
        padding: 16,
        gap: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.dark,
        textAlign: 'center',
        marginBottom: 16,
    },
    section: {
        backgroundColor: colors.light,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.accent,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.dark,
        marginBottom: 12,
        textAlign: 'center',
    },
    bulletContainer: {
        marginBottom: 8,
    },
    bulletItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    bullet: {
        fontSize: 16,
        color: colors.primary,
        marginRight: 8,
        marginTop: 2,
        fontWeight: 'bold',
    },
    bulletText: {
        fontSize: 14,
        color: colors.dark,
        flex: 1,
        lineHeight: 20,
    },
    highlightText: {
        fontWeight: '600',
        color: colors.primary,
    },
    rangeText: {
        fontWeight: '600',
        color: colors.moss,
    },
    descriptionText: {
        fontSize: 13,
        color: colors.dark,
        opacity: 0.8,
        fontStyle: 'italic',
        marginTop: 4,
    },
    // Table styles
    tableContainer: {
        backgroundColor: colors.light,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.accent,
    },
    tableTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.dark,
        marginBottom: 16,
        textAlign: 'center',
    },
    tableScrollContainer: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    tableContent: {
        minWidth: 800, // Minimum width for proper table display
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        borderRadius: 8,
        marginBottom: 8,
        overflow: 'hidden',
    },
    tableHeaderCell: {
        width: 200, // Fixed width for each column
        padding: 12,
        alignItems: 'center',
    },
    propertyHeaderCell: {
        width: 200, // Same width as other columns
    },
    tableHeaderText: {
        color: colors.light,
        fontWeight: '700',
        fontSize: 12,
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        marginBottom: 8,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.accent,
    },
    propertyCell: {
        width: 200, // Fixed width to match header
        backgroundColor: colors.bgLight2,
        padding: 12,
        justifyContent: 'center',
        borderRightWidth: 1,
        borderRightColor: colors.accent,
    },
    propertyCellFixed: {
        width: 200, // Ensure consistent width
    },
    propertyText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.dark,
        textAlign: 'center',
    },
    conditionCell: {
        width: 200, // Fixed width for each condition column
        padding: 12,
        alignItems: 'center',
    },
    conditionText: {
        fontSize: 11,
        color: colors.light,
        textAlign: 'center',
        lineHeight: 16,
    },
    deficiencyCell: {
        backgroundColor: colors.danger,
    },
    goodCell: {
        backgroundColor: colors.success,
    },
    excessiveCell: {
        backgroundColor: colors.warning,
    },
    definitionsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.dark,
        marginBottom: 12,
        marginTop: 8,
    },
    definitionItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    definitionBullet: {
        fontSize: 14,
        color: colors.primary,
        marginRight: 8,
        marginTop: 2,
        fontWeight: 'bold',
    },
    definitionText: {
        fontSize: 13,
        color: colors.dark,
        flex: 1,
        lineHeight: 18,
    },
    definitionTerm: {
        fontWeight: '600',
        color: colors.primary,
    },
});
