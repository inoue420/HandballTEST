import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from './CustomButton';

const StudySessions = ({ navigation }) => {
  // 学習開始
  const handleChapterSelection = () => {
    navigation.navigate('Chapter');
  };

  // 復習(1週目)ボタンが押されたときの処理
  const handleReview = async () => {
    try {
      // "reviewCurrentIndex" で保存された現在の問題番号を取得
      const savedIndexStr = await AsyncStorage.getItem('reviewCurrentIndex');
      const savedIndex = savedIndexStr ? parseInt(savedIndexStr, 10) : 0;
      
      if (savedIndex > 0) {
        Alert.alert(
          '復習を続けますか？',
          '以前の続きから始めますか？',
          [
            {
              text: '続きから始める',
              onPress: () => navigation.navigate('Review', { startIndex: savedIndex }),
            },
            {
              text: '最初から始める',
              onPress: async () => {
                // 初めから始める場合、保存された番号をリセット
                await AsyncStorage.removeItem('reviewCurrentIndex');
                navigation.navigate('Review', { startIndex: 0 });
              },
              style: 'cancel',
            },
          ],
          { cancelable: false }
        );
      } else {
        navigation.navigate('Review', { startIndex: 0 });
      }
    } catch (error) {
      console.error('Error handling review start:', error);
      navigation.navigate('Review', { startIndex: 0 });
    }
  };

  // 復習(2週目)ボタンが押されたときの処理
  const handleReview2 = async () => {
    try {
      // "review2CurrentIndex" で保存された現在の問題番号を取得
      const savedIndexStr = await AsyncStorage.getItem('review2CurrentIndex');
      const savedIndex = savedIndexStr ? parseInt(savedIndexStr, 10) : 0;
      
      if (savedIndex > 0) {
        Alert.alert(
          '復習(2週目)を続けますか？',
          '以前の続きから始めますか？',
          [
            {
              text: '続きから始める',
              onPress: () => navigation.navigate('Review2', { startIndex: savedIndex }),
            },
            {
              text: '最初から始める',
              onPress: async () => {
                // 初めから始める場合、保存された番号をリセット
                await AsyncStorage.removeItem('review2CurrentIndex');
                navigation.navigate('Review2', { startIndex: 0 });
              },
              style: 'cancel',
            },
          ],
          { cancelable: false }
        );
      } else {
        navigation.navigate('Review2', { startIndex: 0 });
      }
    } catch (error) {
      console.error('Error handling review2 start:', error);
      navigation.navigate('Review2', { startIndex: 0 });
    }
  };

  // Answer Historyボタンが押されたときの処理
  const handleAnswerHistory = () => {
    navigation.navigate('History');
  };

  // 学習履歴を確認ボタンが押されたときの処理
  const handleStudyHistory = () => {
    navigation.navigate('StudyHistory');
  };

  return (
    <View style={styles.container}>
      <CustomButton title="学習開始" onPress={handleChapterSelection} />
      <CustomButton title="復習開始(1週目)" onPress={handleReview} />
      <CustomButton title="復習開始(2週目)" onPress={handleReview2} />
      <CustomButton title="誤答履歴を確認" onPress={handleAnswerHistory} />
      <CustomButton title="学習履歴を確認" onPress={handleStudyHistory} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StudySessions;
