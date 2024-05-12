// ChoiceButton.js

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const ChoiceButton = ({ label, onPress, selected }) => {
  return (
    <TouchableOpacity
      style={[styles.button, selected && styles.selectedButton]}
      onPress={onPress}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 50,
    backgroundColor: 'lightblue',
    marginVertical: 5,
    padding: 10,
  },
  selectedButton: {
    backgroundColor: 'blue',
  },
  label: {
    textAlign: 'center',
    color: 'black',
  },
  selectedLabel: {
    color: 'white',
  },
});

export default ChoiceButton;
