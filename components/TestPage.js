import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import questions from './questions';
import ChoiceButton from './ChoiceButton';
import AnswerButton from './AnswerButton';
import { useNavigation } from '@react-navigation/native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const banneradUnitId = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      android: 'ca-app-pub-4399954903316919/6717510377',  // Android本番用ID
      ios: 'ca-app-pub-4399954903316919/6289016370',      // iOS本番用ID
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
  const [solvedQuestionAll, setsolvedQuestionAll] = useState([]); // 状態を追加
  const [wrongAnsweredQuestionAll, setWrongAnsweredQuestionAll] = useState([]); // 状態を追加
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

    if (questionIndex < questionIdList.length + 1) {
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
    const currentQuestionId = questionIdList[questionIndex]; // 現在の質問IDを取得

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
 
    // 正解の場合
    if (isCorrect) {
      setsolvedQuestionAll(prev => {
        const updatedsolvedQuestions = [...prev, currentQuestionId]; // 解いた問題を状態に追加
        return updatedsolvedQuestions; // 状態を更新
      });
  
      await savesolvedQuestion(currentQuestionId); // AsyncStorageにも保存
  
    } else {

      // ユーザーが消せる間違えた問題を保存
      setWrongAnsweredQuestionAll(prev => [...prev, currentQuestionId]); // 間違った問題を状態に追加
      await saveWrongAnsweredQuestion(currentQuestionId); // AsyncStorageにも保存
  
      // 消せない間違えた問題を保存
      await saveWrongAnsweredQuestionAll(currentQuestionId); // AsyncStorageにも保存
    }

  };

// 正解の問題を保存する関数
const savesolvedQuestion = async (currentQuestionId) => {
  try {
    let solvedQuestions = await AsyncStorage.getItem('solvedQuestions');
    if (solvedQuestions === null) {
      solvedQuestions = [];
    } else {
      solvedQuestions = JSON.parse(solvedQuestions);
    }

    solvedQuestions.push(currentQuestionId);
    await AsyncStorage.setItem('solvedQuestions', JSON.stringify(solvedQuestions));

    console.log('After adding solved question:', solvedQuestions); // 追加後の状態を表示
  } catch (error) {
    console.error('Error saving solved question:', error);
  }
};

// ユーザーが消せる間違えた問題を保存する関数
const saveWrongAnsweredQuestion = async (currentQuestionId) => {
  try {
    let wrongAnsweredQuestions = await AsyncStorage.getItem('wrongAnsweredQuestions');
    if (wrongAnsweredQuestions === null) {
      wrongAnsweredQuestions = [];
    } else {
      wrongAnsweredQuestions = JSON.parse(wrongAnsweredQuestions);
    }

    console.log('Before adding wrong answered question:', wrongAnsweredQuestions); // 追加前の状態を表示
    wrongAnsweredQuestions.push(currentQuestionId);
    await AsyncStorage.setItem('wrongAnsweredQuestions', JSON.stringify(wrongAnsweredQuestions));

    console.log('After adding wrong answered question:', wrongAnsweredQuestions); // 追加後の状態を表示
  } catch (error) {
    console.error('Error saving wrong answered question:', error);
  }
};

// 消せない間違えた問題を保存する関数
const saveWrongAnsweredQuestionAll = async (currentQuestionId) => {
  try {
    let wrongAnsweredQuestionAll = await AsyncStorage.getItem('wrongAnsweredQuestionAll');
    if (wrongAnsweredQuestionAll === null) {
      wrongAnsweredQuestionAll = [];
    } else {
      wrongAnsweredQuestionAll = JSON.parse(wrongAnsweredQuestionAll);
    }

    // 重複を避けるため、すでに存在しない場合のみ追加
    if (!wrongAnsweredQuestionAll.includes(currentQuestionId)) {
      wrongAnsweredQuestionAll.push(currentQuestionId);
      await AsyncStorage.setItem('wrongAnsweredQuestionAll', JSON.stringify(wrongAnsweredQuestionAll));

      console.log('After adding wrong answered question all:', wrongAnsweredQuestionAll); // 追加後の状態を表示
    } else {
      console.log('Question ID already exists in wrong answered question all:', currentQuestionId); // 重複した場合のメッセージ
    }
  } catch (error) {
    console.error('Error saving wrong answered question all:', error);
  }
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
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.container}>
{/*           <View style={styles.questionContainer}>
            <Text>
              {questionIdList.length > 0
                ? questions.find(question => question.id === questionIdList[questionIndex]).question
                : 'Loading...'}
            </Text>
          </View> */}
          <View style={styles.questionContainer}>
             <Text>
             {questionIdList.length > 0 && questionIndex < questionIdList.length
               ? questions.find(question => question.id === questionIdList[questionIndex])?.question || 'Question not found'
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
