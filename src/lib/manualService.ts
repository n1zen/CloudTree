import { PermissionsAndroid, Platform, Share } from 'react-native';
import RNFS from 'react-native-fs';

const MANUAL_FILE_NAME = 'CloudTree_UserManual.pdf';

const getDocumentPath = () => `${RNFS.DocumentDirectoryPath}/${MANUAL_FILE_NAME}`;
const getDownloadPath = () => {
    if (Platform.OS !== 'android') {
        return getDocumentPath();
    }

    const basePath = RNFS.DownloadDirectoryPath ?? RNFS.ExternalDirectoryPath;
    return `${basePath}/${MANUAL_FILE_NAME}`;
};

const ensureDirectory = async (path: string) => {
    const directoryPath = path.substring(0, path.lastIndexOf('/'));
    const exists = await RNFS.exists(directoryPath);
    if (!exists) {
        await RNFS.mkdir(directoryPath);
    }
};

const copyManualToDocuments = async (destination: string) => {
    if (Platform.OS === 'android') {
        await RNFS.copyFileAssets(MANUAL_FILE_NAME, destination);
        return;
    }

    const bundlePath = `${RNFS.MainBundlePath}/${MANUAL_FILE_NAME}`;
    const bundleExists = await RNFS.exists(bundlePath);

    if (!bundleExists) {
        throw new Error('Manual not found in iOS bundle. Add it to Xcode resources.');
    }

    await RNFS.copyFile(bundlePath, destination);
};

export const ensureManualAvailable = async () => {
    const manualPath = getDocumentPath();
    const exists = await RNFS.exists(manualPath);

    if (exists) {
        return manualPath;
    }

    await ensureDirectory(manualPath);
    await copyManualToDocuments(manualPath);
    return manualPath;
};

const requestAndroidDownloadPermission = async () => {
    if (Platform.OS !== 'android') {
        return;
    }

    const version = Number(Platform.Version);

    if (!Number.isNaN(version) && version >= 33) {
        // Android 13+ no permission required for Downloads
        return;
    }

    const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
            title: 'Storage permission required',
            message: 'CloudTree needs access to save the manual to your Downloads folder.',
            buttonPositive: 'Allow',
        }
    );

    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        throw new Error('Storage permission denied. Unable to save the manual.');
    }
};

export const saveManualToDevice = async () => {
    const manualPath = await ensureManualAvailable();

    if (Platform.OS === 'android') {
        await requestAndroidDownloadPermission();
        const destination = getDownloadPath();

        if (await RNFS.exists(destination)) {
            await RNFS.unlink(destination);
        }

        await RNFS.copyFile(manualPath, destination);

        try {
            await RNFS.scanFile(destination);
        } catch {
            // Best effort: some Android versions do not support scanFile
        }

        return destination;
    }

    const fileUri = `file://${manualPath}`;

    await Share.share({
        title: 'CloudTree User Manual',
        url: fileUri,
        message: 'CloudTree User Manual',
    });

    return manualPath;
};

