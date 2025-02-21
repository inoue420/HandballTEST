import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ChapterEnd = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>すべて終了しました </Text>
      <Text style={styles.title}>お疲れさまでした！</Text>
      
      <Text style={styles.subtitle}>ちなみに・・・</Text>
      <Text style={styles.text}>間違えた問題番号が端末に保存されています。【問題集を好きなだけ解く】　内の　【復習開始(1週目)】　モードでは間違えた問題だけが順番に出題されます。
      </Text>
      <Text style={styles.text}>
        同様に【復習開始(1週目)】で間違えた問題は【復習開始(2週目)】に保存され、順番に解き直せます。
      </Text>
      <Text style={styles.text}>効率的な学習に役立ててください^^</Text>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center', // テキストを左揃え
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'left',
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'left',
  },
});

export default ChapterEnd;
