import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import ChoiceButton from './ChoiceButton';
import questions from './questions';
import AnswerButton from './AnswerButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useRank } from './RankContext';

const banneradUnitId = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      android: 'ca-app-pub-4399954903316919/6717510377',  // Android本番用ID
      ios: 'ca-app-pub-4399954903316919/6289016370',      // iOS本番用ID
    });

const QuizPage = ({ route }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [solvedQuestionAll, setSolvedQuestionAll] = useState([]); // 状態を追加
  const [wrongAnsweredQuestionAll, setWrongAnsweredQuestionAll] = useState([]); // 状態を追加
  const navigation = useNavigation();
  const { fetchStudyData } = useRank(); //RankContextからfetchの読み込み
  const [bannerRefreshKey, setBannerRefreshKey] = useState(0);


  useEffect(() => {
    if (route.params && route.params.selectedId) {
      const selectedId = route.params.selectedId;
      const index = questions.findIndex(question => question.id === selectedId);
      if (index !== -1) {
        setCurrentQuestionIndex(index);
      }
    }

    //バナーリセットの除去
/*     const interval = setInterval(() => {
      setBannerRefreshKey((prevKey) => prevKey + 1);
    }, 15000); // 15秒ごとにバナーをリセット
        return () => clearInterval(interval); // クリーンアップ */
  
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

/*     if (!isCorrect) {
      const wrongQuestionId = questions[currentQuestionIndex].id;
      await saveWrongAnsweredQuestion(wrongQuestionId);
    }
  }; */

  const questionId = questions[currentQuestionIndex].id; // 現在の問題のIDを取得

  // 正解の場合
  if (isCorrect) {
    setSolvedQuestionAll(prev => {
      const updatedSolvedQuestions = [...prev, questionId]; // 解いた問題を状態に追加
      return updatedSolvedQuestions; // 状態を更新
    });

    await saveSolvedQuestion(questionId); // AsyncStorageにも保存

  } else {
    // ユーザーが消せる間違えた問題を保存
    setWrongAnsweredQuestionAll(prev => [...prev, questionId]); // 間違った問題を状態に追加
    await saveWrongAnsweredQuestion(questionId); // AsyncStorageにも保存

    // 消せない間違えた問題を保存
    await saveWrongAnsweredQuestionAll(questionId); // AsyncStorageにも保存
  }
};


  const handleNextQuestion = () => {
    if (currentQuestionIndex === questions.length - 1) {
      console.log('End of quiz');
      navigation.navigate('End');
            fetchStudyData(); // Nextボタンが押された時にデータを更新

    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswers([]);
      setAnswered(false);
      setIsCorrect(null);
      fetchStudyData(); // Nextボタンが押された時にデータを更新
    }
  };

  const handleExplanation = () => {
    const ruleIds = questions[currentQuestionIndex].ruleIds; // ルールIDを取得
    navigation.navigate('RuleExplanation', { ruleIds });
  };

/*   const saveWrongAnsweredQuestion = async (questionId) => {
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
  }; */
// 正解の問題を保存する関数
const saveSolvedQuestion = async (questionId) => {
  try {
    let solvedQuestions = await AsyncStorage.getItem('solvedQuestions');
    if (solvedQuestions === null) {
      solvedQuestions = [];
    } else {
      solvedQuestions = JSON.parse(solvedQuestions);
    }

    solvedQuestions.push(questionId);
    await AsyncStorage.setItem('solvedQuestions', JSON.stringify(solvedQuestions));

    console.log('After adding solved question:', solvedQuestions); // 追加後の状態を表示
  } catch (error) {
    console.error('Error saving solved question:', error);
  }
};

// ユーザーが消せる間違えた問題を保存する関数
const saveWrongAnsweredQuestion = async (questionId) => {
  try {
    let wrongAnsweredQuestions = await AsyncStorage.getItem('wrongAnsweredQuestions');
    if (wrongAnsweredQuestions === null) {
      wrongAnsweredQuestions = [];
    } else {
      wrongAnsweredQuestions = JSON.parse(wrongAnsweredQuestions);
    }

    console.log('Before adding wrong answered question:', wrongAnsweredQuestions); // 追加前の状態を表示
    wrongAnsweredQuestions.push(questionId);
    await AsyncStorage.setItem('wrongAnsweredQuestions', JSON.stringify(wrongAnsweredQuestions));

    console.log('After adding wrong answered question:', wrongAnsweredQuestions); // 追加後の状態を表示
  } catch (error) {
    console.error('Error saving wrong answered question:', error);
  }
};

// 消せない間違えた問題を保存する関数
const saveWrongAnsweredQuestionAll = async (questionId) => {
  try {
    let wrongAnsweredQuestionAll = await AsyncStorage.getItem('wrongAnsweredQuestionAll');
    if (wrongAnsweredQuestionAll === null) {
      wrongAnsweredQuestionAll = [];
    } else {
      wrongAnsweredQuestionAll = JSON.parse(wrongAnsweredQuestionAll);
    }

    // 重複を避けるため、すでに存在しない場合のみ追加
    if (!wrongAnsweredQuestionAll.includes(questionId)) {
      wrongAnsweredQuestionAll.push(questionId);
      await AsyncStorage.setItem('wrongAnsweredQuestionAll', JSON.stringify(wrongAnsweredQuestionAll));

      console.log('After adding wrong answered question all:', wrongAnsweredQuestionAll); // 追加後の状態を表示
    } else {
      console.log('Question ID already exists in wrong answered question all:', questionId); // 重複した場合のメッセージ
    }
  } catch (error) {
    console.error('Error saving wrong answered question all:', error);
  }
};




  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <BannerAd
          key={bannerRefreshKey} // リフレッシュのためのキーを追加
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
