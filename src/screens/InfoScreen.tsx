import { View } from 'react-native';
import { appStyles } from '../assets/styles/AppStyles';
import InfoContent from '../components/InfoContent.tsx';

export default function InfoScreen() {
    return (
        <View style={appStyles.container}>
            <InfoContent />
        </View>
    );
}