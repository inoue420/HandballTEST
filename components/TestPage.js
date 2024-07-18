import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import questions from './questions';
import ChoiceButton from './ChoiceButton';
import AnswerButton from './AnswerButton';
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

const TestPage = () => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionIdList, setQuestionIdList] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [correctSelectionCount, setCorrectSelectionCount] = useState(0);
  const [wrongSelectionCount, setWrongSelectionCount] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('randomIds');
        if (storedData) {
          const savedIds = JSON.parse(storedData);
          const uniqueIds = [...new Set(savedIds)];
          const sortedIds = uniqueIds.sort((a, b) => {
            const aParts = a.split('-').map(part => parseInt(part));
            const bParts = b.split('-').map(part => parseInt(part));
            if (aParts[0] !== bParts[0]) {
              return aParts[0] - bParts[0];
            } else {
              return aParts[1] - bParts[1];
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

  const handleAnswerButtonClick = async () => {
    const correctAnswers = questions.find(question => question.id === questionIdList[questionIndex]).correctAnswers;
    const isCorrect = selectedAnswers.every(answer => correctAnswers.includes(answer)) && selectedAnswers.length === correctAnswers.length;

    setIsCorrect(isCorrect);
    setAnswered(true);

    if (isCorrect || !isCorrect) { // 回答が正解であるかどうかに関わらず、正答数を加算
      setCorrectAnswersCount(correctAnswersCount + correctAnswers.length);
    }

    let correctSelections = 0;
    let wrongSelections = 0;
    selectedAnswers.forEach(answer => {
      if (correctAnswers.includes(answer)) {
        correctSelections++;
      } else {
        wrongSelections++;
      }
    });

    setCorrectSelectionCount(correctSelectionCount + correctSelections);
    setWrongSelectionCount(wrongSelectionCount + wrongSelections);
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
            {answered ? (
              <AnswerButton title="Next" onPress={handleNextQuestion} />
            ) : (
              <AnswerButton title="回答する" onPress={handleAnswerButtonClick} disabled={!selectedAnswers.length} />
            )}
          </View>
          {answered && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>{isCorrect ? '〇' : '×'}</Text>
            </View>
          )}
          <View style={styles.countContainer}>
            <Text style={styles.scoreRateText}>
              スコア率: {correctAnswersCount === 0 ? 0 : ((correctSelectionCount - wrongSelectionCount) / correctAnswersCount * 100).toFixed(0)}%
              <Text style={styles.borderText}>  (A級85％, B級80％, C級60％がボーダー)</Text>
            </Text>
            <Text style={styles.countText}>正答数: {correctAnswersCount}</Text>
            <Text style={styles.countText}>正答選択数: {correctSelectionCount}</Text>
            <Text style={styles.countText}>誤答選択数: {wrongSelectionCount}</Text>
            <Text style={styles.countText}>問題番号: {questionIndex + 1}/25</Text>
          </View>
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
    backgroundColor: 'white', // バナーの背景色を調整
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40, // バナーの高さ分の余白を追加
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
  countContainer: {
    marginBottom: 20,
  },
  countText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultText: {
    fontSize: 5 * 16,
  },
  scoreRateText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  borderText: {
    fontSize: 10,
  },
});

export default TestPage;
