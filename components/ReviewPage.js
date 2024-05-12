import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native'; // ScrollView をインポート
import AsyncStorage from '@react-native-async-storage/async-storage';
import questions from './questions';
import ChoiceButton from './ChoiceButton'; // ChoiceButtonのインポートを追加
import AnswerButton from './AnswerButton'; // AnswerButtonのインポートを追加
import { useNavigation } from '@react-navigation/native';


const ReviewPage = () => {
  const [questionIndex, setQuestionIndex] = useState(0); // AsyncStorageから取得した問題のインデックス
  const [questionIdList, setQuestionIdList] = useState([]); // AsyncStorageから取得した問題IDのリスト
  const [selectedAnswers, setSelectedAnswers] = useState([]); // 選択された回答の配列
  const [answered, setAnswered] = useState(false); // 回答済みかどうか
  const [isCorrect, setIsCorrect] = useState(false); // 正誤判定
  const navigation = useNavigation();



useEffect(() => {
  const loadStoredData = async () => {
    try {
      // AsyncStorageから保存データを読み出す
      const storedData = await AsyncStorage.getItem('wrongAnsweredQuestions');
      if (storedData) {
        // JSON形式の文字列を配列にパースし、重複を除去して昇順にソート
        const savedIds = JSON.parse(storedData);
        const uniqueIds = [...new Set(savedIds)]; // 重複を除去
        const sortedIds = uniqueIds.sort((a, b) => {
          // 文字列としての数値を比較して降順にソート
          const aParts = a.split('-').map(part => parseInt(part));
          const bParts = b.split('-').map(part => parseInt(part));
          if (aParts[0] !== bParts[0]) {
            return aParts[0] - bParts[0]; // 〇を降順にソート
          } else {
            return aParts[1] - bParts[1]; // △を降順にソート
          }
        });
        
        setQuestionIdList(sortedIds);
      } else {
        console.log('No stored data or empty data in AsyncStorage');
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
  };
  loadStoredData();
}, []);

  const handleNextQuestion = () => {
    if (questionIndex < questionIdList.length - 1) {
      setQuestionIndex(questionIndex + 1);
      setSelectedAnswers([]);
      setAnswered(false);
      setIsCorrect(false);
    } else {
      console.log('End of question list');
      navigation.navigate('End');
 
    }
  };

  const handleAnswer = (selectedOption) => {
    setSelectedAnswers((prevSelectedAnswers) => {
      if (prevSelectedAnswers.includes(selectedOption)) {
        return prevSelectedAnswers.filter((answer) => answer !== selectedOption);
      } else {
        return [...prevSelectedAnswers, selectedOption];
      }
    });
  };

  const handleAnswerButtonClick = async() => {
    const correctAnswers = questions.find(question => question.id === questionIdList[questionIndex]).correctAnswers;
    const isCorrect = selectedAnswers.every(answer => correctAnswers.includes(answer)); // 全ての選択肢が正解かチェック
  
    setIsCorrect(isCorrect);
    setAnswered(true);
  
    if (!isCorrect) {
      const currentQuestionId = questionIdList[questionIndex];
      await saveWrongAnsweredQuestion2(currentQuestionId);
    }
  };
  
  const saveWrongAnsweredQuestion2 = async (questionId) => {
    try {
      let wrongAnsweredQuestions2 = await AsyncStorage.getItem('wrongAnsweredQuestions2');
      if (wrongAnsweredQuestions2 === null) {
        wrongAnsweredQuestions2 = [];
      } else {
        wrongAnsweredQuestions2 = JSON.parse(wrongAnsweredQuestions2);
      }
      // 問題IDのインデックスを取得
      const questionIdIndex = questionIdList.findIndex(id => id === questionId);
      // インデックスが見つかった場合のみセット
      if (questionIdIndex !== -1) {
        wrongAnsweredQuestions2.push(questionIdList[questionIdIndex]);
      }
      console.log('Wrong question ID to be saved:', questionId);
      console.log('Data to be saved:', JSON.stringify(wrongAnsweredQuestions2));
      await AsyncStorage.setItem('wrongAnsweredQuestions2', JSON.stringify(wrongAnsweredQuestions2));
    } catch (error) {
      console.error('Error saving wrong answered question2:', error);
    }
  };
  



  return (
 <ScrollView contentContainerStyle={styles.scrollViewContainer}>
    <View style={styles.container}>
      <View style={styles.questionContainer}>
        <Text>
          {questionIdList.length > 0
            ? questions.find(question => question.id === questionIdList[questionIndex]).question
            : 'Loading...'}
        </Text>
      </View>
      <View style={styles.optionsContainer}>
        {questionIdList.length > 0 && (
          questions.find(question => question.id === questionIdList[questionIndex]).options.map((option, index) => (
            <ChoiceButton
              key={index}
              label={`${String.fromCharCode(97 + index)}) ${option}`}
              onPress={() => handleAnswer(option)}
              selected={selectedAnswers.includes(option)}
              disabled={answered}
            />
          ))
        )}
      </View>
      <View style={styles.answerButtonContainer}>
        <AnswerButton title="回答する" onPress={handleAnswerButtonClick} disabled={!selectedAnswers.length || answered} />
      </View>
      {answered && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>{isCorrect ? '〇' : '×'}</Text>
        </View>
      )}

        <View style={styles.nextButtonContainer}>
          <AnswerButton title="Next" onPress={handleNextQuestion} disabled={!answered} />
        </View>

    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1, // ビューポートの高さに対して成長する
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionContainer: {
    marginBottom: 20,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  answerButtonContainer: {
    marginBottom: 'auto',
  },
  resultContainer: {
    marginBottom: 'auto',
  },

  resultText: {
    fontSize: 5 * 16,
  },
  nextButtonContainer: {
    marginTop: 'auto',
  },
});

export default ReviewPage;
