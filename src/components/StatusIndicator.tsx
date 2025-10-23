import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { colors } from '../assets/styles/Colors.ts';

export default function StatusIndicator({ field, value }: { field: string, value: number }) {

    const [status, setStatus] = useState<string>('');
    const [color, setColor] = useState<string>('');

    useEffect(() => {
        if (field === 'Hum' && value < 20) {
            setStatus('Dry');
            setColor(colors.danger);
        } else if (field === 'Hum' && value > 20 && value < 60) {
            setStatus('Optimal');
            setColor(colors.success);
        } else if (field === 'Hum' && value > 60) {
            setStatus('Waterlogged');
            setColor(colors.danger);
        }
        if (field === 'Temp' && value < 18) {
            setStatus('Cold');
            setColor(colors.danger);
        } else if (field === 'Temp' && value > 18 && value < 35) {
            setStatus('Optimal');
            setColor(colors.success);
        } else if (field === 'Temp' && value > 35) {
            setStatus('Hot');
            setColor(colors.danger);
        }
        if (field === 'Ec' && value < 100) {
            setStatus('Low ');
            setColor(colors.danger);
        } else if (field === 'Ec' && value > 100 && value < 4000) {
            setStatus('Optimal');
            setColor(colors.success);
        } else if (field === 'Ec' && value > 4000) {
            setStatus('High');
            setColor(colors.danger);
        }
        if (field === 'Ph' && value < 5.5) {
            setStatus('Acidic');
            setColor(colors.danger);
        } else if (field === 'Ph' && value > 5.5 && value < 7.5) {
            setStatus('Optimal');
            setColor(colors.success);
        } else if (field === 'Ph' && value > 7.5) {
            setStatus('Alkaline');
            setColor(colors.danger);
        }
        if (field === 'Nitrogen' && value < 40) {
            setStatus('Low');
            setColor(colors.danger);
        } else if (field === 'Nitrogen' && value > 40 && value < 100) {
            setStatus('Optimal');
            setColor(colors.success);
        } else if (field === 'Nitrogen' && value > 100) {
            setStatus('High');
            setColor(colors.danger);
        }
        if (field === 'Phosphorus' && value < 12) {
            setStatus('Low');
            setColor(colors.danger);
        } else if (field === 'Phosphorus' && value > 12 && value < 25) {
            setStatus('Optimal');
            setColor(colors.success);
        } else if (field === 'Phosphorus' && value > 30) {
            setStatus('High');
            setColor(colors.danger);
        }
        if (field === 'Potassium' && value < 120) {
            setStatus('Low');
            setColor(colors.danger);
        } else if (field === 'Potassium' && value > 120 && value < 250) {
            setStatus('Optimal');
            setColor(colors.success);
        } else if (field === 'Potassium' && value > 250) {
            setStatus('High');
            setColor(colors.danger);
        }
    }, [field, value])
    return (
        <View>
            <Text style={{ color: color }}>{status}</Text>
        </View>
    )
}