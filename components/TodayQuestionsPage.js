import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import questions from './questions'; // 問題データのインポート
import ChoiceButton from './ChoiceButton'; // 選択肢ボタンのインポート
import AnswerButton from './AnswerButton'; // 回答ボタンのインポート
import { useNavigation } from '@react-navigation/native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

const adUnitIds = {
  android: 'ca-app-pub-4399954903316919/6717510377', // Android用の広告ユニットID
  ios: 'ca-app-pub-4399954903316919/7557182852' // iOS用の広告ユニットID
};

const adUnitId = Platform.select({
  android: adUnitIds.android,
  ios: adUnitIds.ios,
});

const TodayQuestionsPage = () => {
  const [questionIndex, setQuestionIndex] = useState(0); // 問題のインデックス
  const [questionIds, setQuestionIds] = useState([]); // 問題IDのリスト
  const [selectedAnswers, setSelectedAnswers] = useState([]); // 選択された回答
  const [answered, setAnswered] = useState(false); // 回答済みフラグ
  const [isCorrect, setIsCorrect] = useState(false); // 正解フラグ
  const navigation = useNavigation();

  useEffect(() => {
    const loadTodayQuestionIds = async () => {
      try {
        const storedIds = await AsyncStorage.getItem('todayIds'); // AsyncStorageから今日の問題IDを取得
        if (storedIds) {
          const ids = JSON.parse(storedIds);
          setQuestionIds(ids);
        } else {
          console.log('No todayIds stored in AsyncStorage');
        }
      } catch (error) {
        console.error('Error loading todayIds:', error);
      }
    };

    loadTodayQuestionIds();
  }, []);

  const handleNextQuestion = () => {
    if (questionIndex < questionIds.length - 1) {
      setQuestionIndex(questionIndex + 1);
      setSelectedAnswers([]);
      setAnswered(false);
      setIsCorrect(false);
    } else {
      console.log('End of today\'s question list');
      navigation.navigate('End'); // 問題終了時に画面遷移
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

  const handleAnswerButtonClick = async () => {
    const currentQuestion = questions.find(question => question.id === questionIds[questionIndex]);
    const correctAnswers = currentQuestion.correctAnswers;
    const isCorrect = selectedAnswers.every(answer => correctAnswers.includes(answer)) && selectedAnswers.length === correctAnswers.length;

    setIsCorrect(isCorrect);
    setAnswered(true);

    if (!isCorrect) {
      const currentQuestionId = questionIds[questionIndex];
      await saveWrongAnsweredQuestion(currentQuestionId); // 間違った問題IDを保存
    }
  };

  const handleExplanation = () => {
    const ruleIds = questions[questionIndex].ruleIds; // ルールIDを取得
    navigation.navigate('RuleExplanation', { ruleIds });
  };

  const saveWrongAnsweredQuestion = async (questionId) => {
    try {
      let wrongAnsweredQuestions = await AsyncStorage.getItem('wrongAnsweredQuestions');
      if (wrongAnsweredQuestions === null) {
        wrongAnsweredQuestions = [];
      } else {
        wrongAnsweredQuestions = JSON.parse(wrongAnsweredQuestions);
      }

      wrongAnsweredQuestions.push(questionId); // 間違った問題IDを配列に追加
      await AsyncStorage.setItem('wrongAnsweredQuestions', JSON.stringify(wrongAnsweredQuestions));
    } catch (error) {
      console.error('Error saving wrong answered question:', error);
    }
  };

  const currentQuestion = questions.find(question => question.id === questionIds[questionIndex]);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.banner}>
        <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            networkExtras: {
              collapsible: 'bottom',
            },
          }}
        />
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.contentContainer}>
          <View style={styles.questionContainer}>
            <Text>{currentQuestion ? currentQuestion.question : 'Loading...'}</Text>
          </View>
          <View style={styles.optionsContainer}>
            {currentQuestion && currentQuestion.options.map((option, index) => (
              <ChoiceButton
                key={option}
                label={`${String.fromCharCode(97 + index)}) ${option}`}
                onPress={() => handleAnswer(option)}
                selected={selectedAnswers.includes(option)}
                disabled={answered}
              />
            ))}
          </View>
          <View style={styles.answerButtonContainer}>
            <AnswerButton title="回答する" onPress={handleAnswerButtonClick} disabled={!selectedAnswers.length || answered} />
          </View>
          {answered && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>{isCorrect ? '〇' : '×'}</Text>
            </View>
          )}
          {answered && (
            <View style={styles.nextButtonContainer}>
              <AnswerButton title="Next" onPress={handleNextQuestion} />
              {!isCorrect && (
                <TouchableOpacity style={styles.explanationButton} onPress={handleExplanation}>
                  <Text style={styles.explanationButtonText}>解説を見る</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
  mainContainer: {
    flex: 1,
    paddingTop: 40,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
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
  explanationButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'lightblue',
    borderRadius: 5,
  },
  explanationButtonText: {
    fontSize: 16,
  },
});

export default TodayQuestionsPage;
