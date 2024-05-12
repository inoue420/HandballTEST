import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, KeyboardAvoidingView } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

const ChapterSelection = ({ navigation }) => {
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [directInputValue1, setDirectInputValue1] = useState('');
  const [directInputValue2, setDirectInputValue2] = useState('');

  const handleChapterSelect = (chapter) => {
    setSelectedChapter(chapter);
/*    setDirectInputValue1(''); // inputContainerの情報を初期化
    setDirectInputValue2(''); // inputContainerの情報を初期化
    console.log("Selected Chapter ID:", chapter);*/
  };

  const handleStartChapter = () => {
    let chapterId = selectedChapter;
    // 直接入力の値が有効な場合はそれを使う
    const chapterIdInput = `${directInputValue1.trim()}-${directInputValue2.trim()}`;
    if (chapterIdInput.match(/^\d+-\d+$/) !== null) {
      chapterId = chapterIdInput;
    }
    if (chapterId) {
      navigation.navigate('Quiz', { selectedId: chapterId });
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.innerContainer}>
        <Text style={styles.headerText}>学習開始場所を選択してください</Text>
        <Text style={[styles.label, {marginTop:20}]}>1. 章の先頭から開始する　　　　　</Text>
  
/*    <View style={[styles.pickerContainer, {marginTop: 0}]}>
          <RNPickerSelect
            onValueChange={(value) => handleChapterSelect(value)}
            items={[
              { label: '1章', value: '1-1' },
              { label: '2章', value: '2-1' },
              { label: '3章', value: '3-1' },
              { label: '4章', value: '4-1' },
              { label: '5章', value: '5-1' },
              { label: '6章', value: '6-1' },
              { label: '7章', value: '7-1' },
              { label: '8章', value: '8-1' },
              { label: '9章', value: '9-1' },
              { label: '10章', value: '10-1' },
              { label: '11章', value: '11-1' },
              { label: '12章', value: '12-1' },
              { label: '13章', value: '13-1' },
              { label: '14章', value: '14-1' },
              { label: '15章', value: '15-1' },
              { label: '16章', value: '16-1' },
              { label: '17章', value: '17-1' },
              { label: '18章', value: '18-1' },
              { label: '交代地域規定', value: '19-1' },

              // 必要に応じて他の章を追加
            ]}
            placeholder={{ label: '▼開始する章番号を選択▼', value: null }}
            value={selectedChapter}

            style={{
              inputIOS: {
                fontSize: 18,
                color: 'black',
                paddingVertical: 12, // iOSの場合は選択肢が表示される高さを調整する
                paddingHorizontal: 10,
                borderWidth: 1,
                borderColor: 'gray',
                borderRadius: 4,
                paddingRight: 30, // for the arrow icon
              },
              inputAndroid: {
                fontSize: 18,
                color: 'black',
                paddingVertical: 8, // Androidの場合は選択肢が表示される高さを調整する
                paddingHorizontal: 10,
                borderWidth: 1,
                borderColor: 'gray',
                borderRadius: 8,
                paddingRight: 30, // for the arrow icon
              },
            }}
          />
*/

        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>2. 問題番号を直接入力</Text>
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
            disabled={!selectedChapter && !(directInputValue1 && directInputValue2)}
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
  pickerContainer: {
    marginBottom: 20,
  },
  startButtonContainer: {
    marginTop: 20,
  },
});

export default ChapterSelection;
