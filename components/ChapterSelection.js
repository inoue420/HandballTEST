import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, KeyboardAvoidingView } from 'react-native';

const ChapterSelection = ({ navigation }) => {
  const [directInputValue1, setDirectInputValue1] = useState('');
  const [directInputValue2, setDirectInputValue2] = useState('');

  const handleStartChapter = () => {
    let chapterId = '1-1'; // デフォルトの章番号
    navigation.navigate('Quiz', { selectedId: chapterId });
  };

  const handleStartFromBeginning = () => {
    let chapterId = '1-1'; // 最初から開始する場合は常に1-1
    navigation.navigate('Quiz', { selectedId: chapterId });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.innerContainer}>
        <Text style={styles.headerText}>学習開始場所を選択してください</Text>
        <Text style={[styles.label, {marginTop:20}]}>1. 最初から開始する　　　　　</Text>

        <Button
          title="Start"      　　
          onPress={handleStartFromBeginning}
          style={styles.startButton}
        />
        <Text style={[styles.label, {marginTop:20}]}>2. 問題番号を直接入力する</Text>
        <View style={styles.inputContainer}>
          <View style={styles.directInputContainer}>
            <TextInput
              style={[styles.input, { marginRight: 10 }]}
              onChangeText={setDirectInputValue1}
              value={directInputValue1}
              keyboardType="numeric"
              maxLength={2} // 最大文字数を2に設定
              placeholder="例：1"
            />
            <Text style={{ fontSize: 20, lineHeight: 40 }}>-</Text>
            <TextInput
              style={[styles.input, { marginLeft: 10 }]}
              onChangeText={setDirectInputValue2}
              value={directInputValue2}
              keyboardType="numeric"
              maxLength={2} // 最大文字数を2に設定
              placeholder="例：1"
            />
          </View>
        </View>
        <View style={styles.startButtonContainer}>
          <Button
            title="Start"
            onPress={handleStartChapter}
            disabled={!(directInputValue1 && directInputValue2)}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    width: '80%', // 画面幅の80%に制限する
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
  },
  inputContainer: {
    marginTop: 20,
  },
  directInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    height: 40,
    width: 60,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  startButtonContainer: {
    marginTop: 20,
  },
  startButton: {
    marginBottom: 20,
    textAlign: 'left', // テキストを左に配置
  },
});

export default ChapterSelection;
