import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AnswerHistoryPage = () => {
  const [wrongAnsweredQuestions, setWrongAnsweredQuestions] = useState([]);
  const [wrongAnsweredQuestions2, setWrongAnsweredQuestions2] = useState([]);

  useEffect(() => {
    loadWrongAnsweredQuestions();
    loadWrongAnsweredQuestions2();
  }, []);

  const loadWrongAnsweredQuestions = async () => {
    try {
      const storedData = await AsyncStorage.getItem('wrongAnsweredQuestions');
      if (storedData !== null) {
        const parsedData = JSON.parse(storedData);
        const sortedData = [...new Set(parsedData)].sort();
        setWrongAnsweredQuestions(sortedData);
      } else {
        console.log('No wrong answered questions found');
      }
    } catch (error) {
      console.error('Error loading wrong answered questions:', error);
    }
  };

  const loadWrongAnsweredQuestions2 = async () => {
    try {
      const storedData = await AsyncStorage.getItem('wrongAnsweredQuestions2');
      if (storedData !== null) {
        const parsedData = JSON.parse(storedData);
        const sortedData = [...new Set(parsedData)].sort();
        setWrongAnsweredQuestions2(sortedData);
      } else {
        console.log('No wrong answered questions2 found');
      }
    } catch (error) {
      console.error('Error loading wrong answered questions2:', error);
    }
  };

  const handleReset = async () => {
    try {
      await AsyncStorage.removeItem('wrongAnsweredQuestions');
      setWrongAnsweredQuestions([]);
    } catch (error) {
      console.error('Error resetting wrong answered questions:', error);
    }
  };

  const handleReset2 = async () => {
    try {
      await AsyncStorage.removeItem('wrongAnsweredQuestions2');
      setWrongAnsweredQuestions2([]);
    } catch (error) {
      console.error('Error resetting wrong answered questions2:', error);
    }
  };

  const copyToWrongAnsweredQuestions = async () => {
    try {
      // まず、wrongAnsweredQuestions の情報を取得する
      const storedData = await AsyncStorage.getItem('wrongAnsweredQuestions');
      let currentWrongAnsweredQuestions = [];
      if (storedData !== null) {
        currentWrongAnsweredQuestions = JSON.parse(storedData);
      }
  
      // wrongAnsweredQuestions2 の情報を取得する
      const storedData2 = await AsyncStorage.getItem('wrongAnsweredQuestions2');
      let wrongAnsweredQuestions2 = [];
      if (storedData2 !== null) {
        wrongAnsweredQuestions2 = JSON.parse(storedData2);
      }
  
      // wrongAnsweredQuestions に wrongAnsweredQuestions2 の情報を追加する
      const updatedWrongAnsweredQuestions = [
        ...currentWrongAnsweredQuestions,
        ...wrongAnsweredQuestions2,
      ];
  
      // 更新された情報を AsyncStorage に保存する
      await AsyncStorage.setItem('wrongAnsweredQuestions', JSON.stringify(updatedWrongAnsweredQuestions));
  
      // ステートを更新する
      setWrongAnsweredQuestions(updatedWrongAnsweredQuestions);
    } catch (error) {
      console.error('Error copying wrong answered questions:', error);
    }
  };
  

  
  
  return (
    <View style={styles.container}>
      <View style={styles.column}>
        <Text style={styles.title}>1度目の間違い履歴</Text>
        {wrongAnsweredQuestions.length > 0 ? (
          <FlatList
            data={wrongAnsweredQuestions}
            renderItem={({ item }) => (
              <Text style={styles.item}>{item}</Text>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        ) : (
          <Text>間違いの履歴はありません</Text>
        )}
        <View style={styles.buttonContainer}>
          <Button title="履歴1を除去する" onPress={handleReset} />
        </View>
      </View>
      <View style={styles.column}>
        <Text style={styles.title}>2度目の間違い履歴</Text>
        {wrongAnsweredQuestions2.length > 0 ? (
          <FlatList
            data={wrongAnsweredQuestions2}
            renderItem={({ item }) => (
              <Text style={styles.item}>{item}</Text>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        ) : (
          <Text>間違いの履歴はありません</Text>
        )}
        <View style={styles.buttonContainer}>
          <Button title="履歴2を除去する" onPress={handleReset2} />
          <Button title="コピー
          (履歴2→履歴1)" onPress={copyToWrongAnsweredQuestions} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  column: {
    flex: 1,
    marginHorizontal: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    fontSize: 16,
    marginBottom: 5,
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default AnswerHistoryPage;
