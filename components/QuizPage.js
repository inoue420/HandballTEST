import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import ChoiceButton from './ChoiceButton';
import questions from './questions';
import AnswerButton from './AnswerButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const adUnitIds = {
  android: 'ca-app-pub-4399954903316919/6717510377',
  ios: 'ca-app-pub-4399954903316919/9606510513',
};

const adUnitId = Platform.select({
  android: adUnitIds.android,
  ios: adUnitIds.ios,
});

const QuizPage = ({ route }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    if (route.params && route.params.selectedId) {
      const selectedId = route.params.selectedId;
      const index = questions.findIndex(question => question.id === selectedId);
      if (index !== -1) {
        setCurrentQuestionIndex(index);
      }
    }
  }, [route.params.selectedId]);

  const handleAnswer = (selectedAnswer) => {
    setSelectedAnswers((prevSelectedAnswers) => {
      if (prevSelectedAnswers.includes(selectedAnswer)) {
        return prevSelectedAnswers.filter((answer) => answer !== selectedAnswer);
      } else {
        return [...prevSelectedAnswers, selectedAnswer];
      }
    });
  };

  const handleAnswerButtonClick = async () => {
    const correctAnswers = questions[currentQuestionIndex].correctAnswers;
    const selectedAnswersSorted = [...selectedAnswers].sort();
    const correctAnswersSorted = [...correctAnswers].sort();
    const isCorrect = selectedAnswersSorted.length > 0 && JSON.stringify(selectedAnswersSorted) === JSON.stringify(correctAnswersSorted);
    setIsCorrect(isCorrect);
    setAnswered(true);

    if (!isCorrect) {
      const wrongQuestionId = questions[currentQuestionIndex].id;
      await saveWrongAnsweredQuestion(wrongQuestionId);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex === questions.length - 1) {
      console.log('End of quiz');
      navigation.navigate('End');
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswers([]);
      setAnswered(false);
      setIsCorrect(null);
    }
  };

  const handleExplanation = () => {
    const ruleIds = questions[currentQuestionIndex].ruleIds; // ルールIDを取得
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
      wrongAnsweredQuestions.push(questionId);
      console.log('Wrong question ID to be saved:', questionId);
      console.log('Data to be saved:', JSON.stringify(wrongAnsweredQuestions));
      await AsyncStorage.setItem('wrongAnsweredQuestions', JSON.stringify(wrongAnsweredQuestions));
    } catch (error) {
      console.error('Error saving wrong answered question:', error);
    }
  };

  return (
    <View style={styles.container}>
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
        <View style={styles.container}>
          <View style={styles.questionContainer}>
            <Text>{questions[currentQuestionIndex].question}</Text>
          </View>
          <View style={styles.optionsContainer}>
            {questions[currentQuestionIndex].options.map((option, index) => (
              <ChoiceButton
                key={index}
                label={`${String.fromCharCode(97 + index)}) ${option}`}
                onPress={() => handleAnswer(option)}
                selected={selectedAnswers.includes(option)}
              />
            ))}
          </View>
          <View style={styles.answerButtonContainer}>
            <AnswerButton title="回答する" onPress={handleAnswerButtonClick} />
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
  container: {
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

export default QuizPage;
