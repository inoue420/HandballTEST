// AnswerButton.js

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const AnswerButton = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#3498db',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  text: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default AnswerButton;
