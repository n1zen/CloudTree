import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import { radioButtonStyles } from '../assets/styles/RadioButton.ts';

const options = ['Save', 'Update'] as const;
type Option = typeof options[number];

export default function UpdateSaveRadio() {
    const [selected, setSelected] = useState<Option>(options[0]);

    return(
        <View style={radioButtonStyles.mainContainer}>
            {options.map((option) => (
                <TouchableOpacity
                    key={option}
                    onPress={() => setSelected(option)}
                    style={radioButtonStyles.buttonContainer}
                >
                    <View style={radioButtonStyles.outerButton}>
                        {selected === option && (
                            <View style={radioButtonStyles.innerButton}/>
                        )}
                    </View>
                    <Text>{option}</Text>
                </TouchableOpacity>
            ))}
        </View>
    )
}