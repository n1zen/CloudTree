import { Button, View } from 'react-native';
import { appStyles } from '../assets/styles/AppStyles';
import InfoContent from '../components/InfoContent.tsx';
import { colors } from '../assets/styles/Colors.ts';

export default function InfoScreen({ navigation }: { navigation: any }) {
    return (
        <View style={appStyles.container}>  
            <InfoContent />
            <Button
                title="View Map"
                onPress={() => navigation.navigate('PhMap')}
                color={colors.primary}
            />
        </View>
    );
}