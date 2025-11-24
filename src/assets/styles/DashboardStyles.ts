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
    // Editable comments styles - Updated for comment editing functionality
    textareaEditable: {
        backgroundColor: colors.light,
        borderColor: colors.primary,
        borderWidth: 2,
    },
    commentActionBar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
        gap: 8,
    },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.light,
    },
    editButton: {
        backgroundColor: colors.info,
    },
    saveButton: {
        backgroundColor: colors.success,
    },
    cancelButton: {
        backgroundColor: colors.danger,
    },
    // Full Screen Comments Modal Styles
    fullScreenModalContainer: {
        flex: 1,
        backgroundColor: colors.bgLight,
        padding: 20,
    },
    fullScreenModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 2,
        borderBottomColor: colors.secondary,
    },
    fullScreenModalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.dark,
    },
    fullScreenModalCloseButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: colors.danger,
    },
    fullScreenModalCloseText: {
        color: colors.light,
        fontSize: 18,
        fontWeight: 'bold',
    },
    fullScreenModalTextInput: {
        flex: 1,
        backgroundColor: colors.bgLight2,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        textAlignVertical: 'top',
        borderWidth: 2,
        borderColor: colors.secondary,
        marginBottom: 20,
    },
    fullScreenModalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    fullScreenModalButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    fullScreenModalButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.light,
    },
    fullScreenModalCancelButton: {
        backgroundColor: colors.danger,
    },
    fullScreenModalSaveButton: {
        backgroundColor: colors.success,
    },
    // Sort buttons styles
    sortButtonContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    sortButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 4,
        minWidth: 100,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    sortButtonText: {
        color: colors.light,
        fontSize: 14,
        fontWeight: '600',
    },
    sortButtonActive: {
        backgroundColor: colors.accent,
    },
    sortButtonActiveText: {
        color: colors.light,
        fontSize: 14,
        fontWeight: '700',
    },

    // search input styles
    searchContainer: {
        marginBottom: 12,
    },
    searchInput: {
        backgroundColor: colors.light,
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: colors.dark,
    },
    searchInputFocused: {
        borderColor: colors.accent,
        borderWidth: 2,
    },
    // Dashboard Table Styles
    dashboardTableOuterScroll: {
        borderRadius: 8,
        overflow: 'hidden',
        width: '100%',
    },
    dashboardTableInnerScroll: {
        maxHeight: 400,
        width: '100%',
    },
    dashboardTable: {
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 8,
        width: '100%',
    },
    // Soil Details Table Styles
    soilDetailsTableOuterScroll: {
        borderRadius: 8,
        overflow: 'hidden',
        width: '100%',
    },
    soilDetailsTableInnerScroll: {
        maxHeight: 300,
        width: '100%',
    },
    soilDetailsTable: {
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 8,
        width: '100%',
    },
    // Sync UI Styles
    statusBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.bgLight2,
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        flexWrap: 'wrap',
        gap: 8,
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusText: {
        fontSize: 14,
        color: colors.dark,
        fontWeight: '600',
    },
    syncButtonContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    syncButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 8,
        gap: 6,
        minHeight: 44,
        minWidth: 90,
    },
    syncButtonFull: {
        flex: 1.5,
        minWidth: 110,
    },
    syncButtonText: {
        color: colors.light,
        fontSize: 16,
        fontWeight: '600',
    },
    syncButtonTextSmall: {
        color: colors.light,
        fontSize: 14,
        fontWeight: '600',
    },
});
