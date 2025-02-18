import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import questions from './questions';
import ChoiceButton from './ChoiceButton';
import AnswerButton from './AnswerButton';
import { useNavigation } from '@react-navigation/native';
import { BannerAd, BannerAdSize, InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { useRank } from './RankContext';

// バナー広告用ID
const banneradUnitId = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      android: 'ca-app-pub-4399954903316919/6717510377',  // Android本番用ID
      ios: 'ca-app-pub-4399954903316919/6289016370',      // iOS本番用ID
    });

// インタースティシャル広告用ID
const intadUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.select({
      android: 'ca-app-pub-3940256099942544/1033173712',  // Androidの広告ID（例）
      ios: 'ca-app-pub-4399954903316919/4148801099',       // iOSの広告ID（例）
    });

// インタースティシャル広告のインスタンス作成
const interstitial = InterstitialAd.createForAdRequest(intadUnitId, {
  keywords: ['test'],
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
  const [solvedQuestionAll, setsolvedQuestionAll] = useState([]); 
  const [wrongAnsweredQuestionAll, setWrongAnsweredQuestionAll] = useState([]); 
  const navigation = useNavigation();
  const { fetchStudyData } = useRank();
  const [bannerRefreshKey, setBannerRefreshKey] = useState(0);
  const [isInterstitialLoaded, setIsInterstitialLoaded] = useState(false);
  const pendingNextQuestionRef = useRef(null);

  // インタースティシャル広告のリスナー設定
  useEffect(() => {
    const loadListener = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      setIsInterstitialLoaded(true);
    });
    const dismissListener = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setIsInterstitialLoaded(false);
      // 広告終了後、もし次の問題進行が保留されていれば実行する
      if (pendingNextQuestionRef.current) {
        pendingNextQuestionRef.current();
        pendingNextQuestionRef.current = null;
      }
      interstitial.load(); // 次回用に再度読み込む
    });
    // 初回の読み込み
    interstitial.load();
    return () => {
      loadListener();
      dismissListener();
    };
  }, []);

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

  // 次の問題へ進む共通処理
  const proceedToNextQuestion = () => {
    if (questionIndex < questionIdList.length - 1) {
      setQuestionIndex(prev => prev + 1);
      setSelectedAnswers([]);
      setAnswered(false);
      setIsCorrect(false);
      fetchStudyData();
    } else {
      fetchStudyData();
      navigation.navigate('End');
    }
  };

  // 「Next」ボタン押下時の処理（広告表示の有無を判断）
  const handleNextQuestion = () => {
    // 現在の問題番号（1-indexed）
    const currentQuestionNumber = questionIndex + 1;
    // 広告表示する問題番号のリスト
    const adTriggerQuestions = [5, 10, 15, 20];
    if (adTriggerQuestions.includes(currentQuestionNumber)) {
      if (isInterstitialLoaded) {
        // 広告終了後に次の問題に進むよう、コールバックを保留
        pendingNextQuestionRef.current = proceedToNextQuestion;
        interstitial.show();
        return;
      }
    }
    // 広告表示が不要な場合、または広告が未読込の場合はそのまま進む
    proceedToNextQuestion();
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
    const isAnswerCorrect = selectedAnswers.every(answer => correctAnswers.includes(answer)) && selectedAnswers.length === correctAnswers.length;

    setIsCorrect(isAnswerCorrect);
    setAnswered(true);
    const currentQuestionId = questionIdList[questionIndex];

    // 正誤に関わらず正答数（＝問題ごとの正解数）を加算
    setCorrectAnswersCount(prev => prev + correctAnswers.length);

    let correctSelections = 0;
    let wrongSelections = 0;
    selectedAnswers.forEach(answer => {
      if (correctAnswers.includes(answer)) {
        correctSelections++;
      } else {
        wrongSelections++;
      }
    });
    setCorrectSelectionCount(prev => prev + correctSelections);
    setWrongSelectionCount(prev => prev + wrongSelections);

    if (isAnswerCorrect) {
      setsolvedQuestionAll(prev => [...prev, currentQuestionId]);
      await savesolvedQuestion(currentQuestionId);
    } else {
      setWrongAnsweredQuestionAll(prev => [...prev, currentQuestionId]);
      await saveWrongAnsweredQuestion(currentQuestionId);
      await saveWrongAnsweredQuestionAll(currentQuestionId);
    }
  };

  // 正解問題保存用関数
  const savesolvedQuestion = async (currentQuestionId) => {
    try {
      let solvedQuestions = await AsyncStorage.getItem('solvedQuestions');
      solvedQuestions = solvedQuestions ? JSON.parse(solvedQuestions) : [];
      solvedQuestions.push(currentQuestionId);
      await AsyncStorage.setItem('solvedQuestions', JSON.stringify(solvedQuestions));
      console.log('After adding solved question:', solvedQuestions);
    } catch (error) {
      console.error('Error saving solved question:', error);
    }
  };

  // ユーザーが消せる間違えた問題保存用関数
  const saveWrongAnsweredQuestion = async (currentQuestionId) => {
    try {
      let wrongAnsweredQuestions = await AsyncStorage.getItem('wrongAnsweredQuestions');
      wrongAnsweredQuestions = wrongAnsweredQuestions ? JSON.parse(wrongAnsweredQuestions) : [];
      console.log('Before adding wrong answered question:', wrongAnsweredQuestions);
      wrongAnsweredQuestions.push(currentQuestionId);
      await AsyncStorage.setItem('wrongAnsweredQuestions', JSON.stringify(wrongAnsweredQuestions));
      console.log('After adding wrong answered question:', wrongAnsweredQuestions);
    } catch (error) {
      console.error('Error saving wrong answered question:', error);
    }
  };

  // 消せない間違えた問題保存用関数
  const saveWrongAnsweredQuestionAll = async (currentQuestionId) => {
    try {
      let wrongAnsweredQuestionAll = await AsyncStorage.getItem('wrongAnsweredQuestionAll');
      wrongAnsweredQuestionAll = wrongAnsweredQuestionAll ? JSON.parse(wrongAnsweredQuestionAll) : [];
      if (!wrongAnsweredQuestionAll.includes(currentQuestionId)) {
        wrongAnsweredQuestionAll.push(currentQuestionId);
        await AsyncStorage.setItem('wrongAnsweredQuestionAll', JSON.stringify(wrongAnsweredQuestionAll));
        console.log('After adding wrong answered question all:', wrongAnsweredQuestionAll);
      } else {
        console.log('Question ID already exists in wrong answered question all:', currentQuestionId);
      }
    } catch (error) {
      console.error('Error saving wrong answered question all:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <BannerAd
          key={bannerRefreshKey}
          unitId={banneradUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{ networkExtras: { collapsible: 'bottom' } }}
        />
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.container}>
          <View style={styles.questionContainer}>
            <Text>
              {questionIdList.length > 0 && questionIndex < questionIdList.length
                ? questions.find(question => question.id === questionIdList[questionIndex])?.question || 'Question not found'
                : 'Loading...'}
            </Text>
          </View>
          <View style={styles.optionsContainer}>
            {questionIdList.length > 0 && (
              questions
                .find(question => question.id === questionIdList[questionIndex])
                .options.map((option, index) => (
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
              スコア率: {correctAnswersCount === 0 ? 0 : (((correctSelectionCount - wrongSelectionCount) / correctAnswersCount) * 100).toFixed(0)}%
              <Text style={styles.borderText}>  (A級85％, B級80％, C級60％がボーダー)</Text>
            </Text>
            <Text style={styles.countText}>正答数: {correctAnswersCount}</Text>
            <Text style={styles.countText}>正答選択数: {correctSelectionCount}</Text>
            <Text style={styles.countText}>誤答選択数: {wrongSelectionCount}</Text>
            <Text style={styles.countText}>問題番号: {questionIndex + 1}/{questionIdList.length}</Text>
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
  countContainer: {
    marginBottom: 20,
  },
  countText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultText: {
    fontSize: 80,
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
