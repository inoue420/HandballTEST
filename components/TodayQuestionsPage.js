import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import questions from './questions'; // 問題データのインポート
import ChoiceButton from './ChoiceButton'; // 選択肢ボタンのインポート
import AnswerButton from './AnswerButton'; // 回答ボタンのインポート
import { useNavigation } from '@react-navigation/native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useRank } from './RankContext';


const banneradUnitId = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      android: 'ca-app-pub-4399954903316919/6717510377',  // Android本番用ID
      ios: 'ca-app-pub-4399954903316919/6289016370',      // iOS本番用ID
    });

const TodayQuestionsPage = () => {
  const [questionIndex, setQuestionIndex] = useState(0); // 問題のインデックス
  const [questionIds, setQuestionIds] = useState([]); // 問題IDのリスト
  const [selectedAnswers, setSelectedAnswers] = useState([]); // 選択された回答
  const [answered, setAnswered] = useState(false); // 回答済みフラグ
  const [isCorrect, setIsCorrect] = useState(false); // 正解フラグ
  const [solvedQuestionAll, setsolvedQuestionAll] = useState([]); // 状態を追加
  const [wrongAnsweredQuestionAll, setWrongAnsweredQuestionAll] = useState([]); // 状態を追加
  const navigation = useNavigation();
  const { fetchStudyData } = useRank(); //RankContextからfetchの読み込み
  const [bannerRefreshKey, setBannerRefreshKey] = useState(0);

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

    //バナーリセットの除去
/*     const interval = setInterval(() => {
      setBannerRefreshKey((prevKey) => prevKey + 1);
    }, 15000); // 15秒ごとにバナーをリセット
        return () => clearInterval(interval); // クリーンアップ */

  }, []);

  const handleNextQuestion = () => {
    if (questionIndex < questionIds.length - 1) {
      setQuestionIndex(questionIndex + 1);
      setSelectedAnswers([]);
      setAnswered(false);
      setIsCorrect(false);
      fetchStudyData(); // Nextボタンが押された時にデータを更新

    } else {
      console.log('End of today\'s question list');
      navigation.navigate('End'); // 問題終了時に画面遷移
      fetchStudyData(); // Nextボタンが押された時にデータを更新

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
    const currentQuestionId = questionIds[questionIndex]; // 現在の質問IDを取得


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

  const handleExplanation = () => {
    const currentQuestion = questions.find(question => question.id === questionIds[questionIndex]);
    const ruleIds = currentQuestion.ruleIds; // ルールIDを取得
    navigation.navigate('RuleExplanation', { ruleIds });
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

  const currentQuestion = questions.find(question => question.id === questionIds[questionIndex]);


  
  return (
    <View style={styles.mainContainer}>
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
              <View style={{ height: 150 }} />
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
