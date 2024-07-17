import React from 'react';
import { View, StyleSheet } from 'react-native';
import CustomButton from './CustomButton'; // カスタムボタンのインポート

const StudySessions = ({ navigation }) => {
  // 学習開始
  const handleChapterSelection = () => {
    navigation.navigate('Chapter');
  };

  // 復習ボタンが押されたときの処理
  const handleReview = () => {
    navigation.navigate('Review');
  };

  // 復習ボタンが押されたときの処理
  const handleReview2 = () => {
    navigation.navigate('Review2');
  };

  // Answer Historyボタンが押されたときの処理
  const handleAnswerHistory = () => {
    navigation.navigate('History');
  };

  return (
    <View style={styles.container}>
      <CustomButton
        title="学習開始"
        onPress={handleChapterSelection}
      />

      <CustomButton
        title="復習開始(1週目)"
        onPress={handleReview}
      />

      <CustomButton
        title="復習開始(2週目)"
        onPress={handleReview2}
      />

      <CustomButton
        title="誤答履歴を確認"
        onPress={handleAnswerHistory}
      />
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
