import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, KeyboardAvoidingView, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds,} from 'react-native-google-mobile-ads';

const banneradUnitId = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      android: 'ca-app-pub-4399954903316919/6717510377',  // Android本番用ID
      ios: 'ca-app-pub-4399954903316919/6289016370',      // iOS本番用ID
    });

const ChapterSelection = ({ navigation }) => {
  const [directInputValue1, setDirectInputValue1] = useState('');
  const [directInputValue2, setDirectInputValue2] = useState('');

  const handleStartChapter = () => {
    let chapterId = `${directInputValue1}-${directInputValue2}`;
    navigation.navigate('Quiz', { selectedId: chapterId });
  };

  const handleStartFromBeginning = () => {
    let chapterId = '1-1'; // 最初から開始する場合は常に1-1
    navigation.navigate('Quiz', { selectedId: chapterId });
  };

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <BannerAd
          unitId={banneradUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            networkExtras: {
              collapsible: 'bottom',
            },
          }}
        />
      </View>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  banner: {
    position: 'absolute',
    top: 0,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white', // バナーの背景色を調整
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
