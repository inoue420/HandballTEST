import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import questions from './questions';
import ChoiceButton from './ChoiceButton';
import AnswerButton from './AnswerButton';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { BannerAd, BannerAdSize, InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { useRank } from './RankContext';

const banneradUnitId = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      android: 'ca-app-pub-4399954903316919/6717510377',
      ios: 'ca-app-pub-4399954903316919/6289016370',
    });

// インタースティシャル広告用ID
const intadUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.select({
      android: 'ca-app-pub-3940256099942544/1033173712',
      ios: 'ca-app-pub-4399954903316919/4148801099',
    });

// REVIEW_COUNT_KEY は累計回答数の保存キー
const REVIEW_COUNT_KEY = 'reviewAnswerCount';

const ReviewPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { fetchStudyData } = useRank();

  // StudySessionsから渡されたstartIndex（なければ0）
  const initialIndex = route.params?.startIndex ? parseInt(route.params.startIndex, 10) : 0;
  const [questionIndex, setQuestionIndex] = useState(initialIndex);
  const [questionIdList, setQuestionIdList] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [bannerRefreshKey, setBannerRefreshKey] = useState(0);
  const [isInterstitialLoaded, setIsInterstitialLoaded] = useState(false);
  const [answerCount, setAnswerCount] = useState(0);
  const pendingNextQuestionRef = useRef(null);
  const [interstitialAd, setInterstitialAd] = useState(null);

  // コンポーネントのマウント時に新しいインタースティシャル広告インスタンスを作成
  useEffect(() => {
    const ad = InterstitialAd.createForAdRequest(intadUnitId, { keywords: ['test'] });
    const loadListener = ad.addAdEventListener(AdEventType.LOADED, () => {
      setIsInterstitialLoaded(true);
      console.log('Interstitial loaded');
    });
    const dismissListener = ad.addAdEventListener(AdEventType.CLOSED, () => {
      setIsInterstitialLoaded(false);
      console.log('Interstitial closed. Resetting answer count.');
      resetAnswerCount();
      if (pendingNextQuestionRef.current) {
        pendingNextQuestionRef.current();
        pendingNextQuestionRef.current = null;
      }
      ad.load();
    });
    ad.load();
    setInterstitialAd(ad);
    return () => {
      loadListener();
      dismissListener();
    };
  }, []);

  // useFocusEffectを利用して、画面に戻ったときに最新の ad 状態とカウンターを再読み込み
  useFocusEffect(
    React.useCallback(() => {
      console.log('ReviewPage focused. Reloading ad and answer count.');
      if (interstitialAd) {
        interstitialAd.load();
      }
      AsyncStorage.getItem(REVIEW_COUNT_KEY)
        .then((countStr) => {
          const count = countStr ? parseInt(countStr, 10) : 0;
          setAnswerCount(count);
          console.log('Reloaded answer count:', count);
        })
        .catch((err) => console.error(err));
    }, [interstitialAd])
  );

  // AsyncStorageから問題IDのリストをロード
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('wrongAnsweredQuestions');
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

  // AsyncStorageから累計回答数をロード
  useEffect(() => {
    const loadAnswerCount = async () => {
      try {
        const countStr = await AsyncStorage.getItem(REVIEW_COUNT_KEY);
        const count = countStr ? parseInt(countStr, 10) : 0;
        setAnswerCount(count);
        console.log('Loaded answer count on mount:', count);
      } catch (error) {
        console.error('Error loading answer count:', error);
      }
    };
    loadAnswerCount();
  }, []);

  // 累計回答数をインクリメントして保存
  const incrementAnswerCount = async () => {
    try {
      const storedCountStr = await AsyncStorage.getItem(REVIEW_COUNT_KEY);
      const storedCount = storedCountStr ? parseInt(storedCountStr, 10) : 0;
      const newCount = storedCount + 1;
      setAnswerCount(newCount);
      await AsyncStorage.setItem(REVIEW_COUNT_KEY, newCount.toString());
      console.log('Incremented answer count to:', newCount);
    } catch (error) {
      console.error('Error incrementing answer count:', error);
    }
  };

  // 累計回答数をリセット
  const resetAnswerCount = async () => {
    try {
      setAnswerCount(0);
      await AsyncStorage.setItem(REVIEW_COUNT_KEY, '0');
      console.log('Answer count reset to 0');
    } catch (error) {
      console.error('Error resetting answer count:', error);
    }
  };

  // 次の問題へ進む共通処理
  const proceedToNextQuestion = async () => {
    if (questionIndex < questionIdList.length - 1) {
      const newIndex = questionIndex + 1;
      setQuestionIndex(newIndex);
      setSelectedAnswers([]);
      setAnswered(false);
      setIsCorrect(false);
      await AsyncStorage.setItem('reviewCurrentIndex', newIndex.toString());
      fetchStudyData();
    } else {
      console.log('End of question list');
      await AsyncStorage.removeItem('reviewCurrentIndex');
      fetchStudyData();
      navigation.navigate('End');
    }
  };

  // 「Next」ボタン押下時の処理
  const handleNextQuestion = async () => {
    const storedCountStr = await AsyncStorage.getItem(REVIEW_COUNT_KEY);
    const currentCount = storedCountStr ? parseInt(storedCountStr, 10) : 0;
    console.log('handleNextQuestion - current answer count:', currentCount);
    if (currentCount >= 5 && isInterstitialLoaded && interstitialAd) {
      pendingNextQuestionRef.current = proceedToNextQuestion;
      interstitialAd.show();
    } else {
      proceedToNextQuestion();
    }
  };

  const handleAnswer = (selectedOption) => {
    setSelectedAnswers(prev => {
      if (prev.includes(selectedOption)) {
        return prev.filter(answer => answer !== selectedOption);
      } else {
        return [...prev, selectedOption];
      }
    });
  };

  const handleAnswerButtonClick = async () => {
    const currentQuestion = questions.find(question => question.id === questionIdList[questionIndex]);
    const correctAnswers = currentQuestion.correctAnswers;
    const isAnswerCorrect =
      selectedAnswers.every(answer => correctAnswers.includes(answer)) &&
      selectedAnswers.length === correctAnswers.length;
    setIsCorrect(isAnswerCorrect);
    setAnswered(true);

    if (isAnswerCorrect) {
      const currentQuestionId = questionIdList[questionIndex];
      await saveSolvedQuestion(currentQuestionId);
    } else {
      const currentQuestionId = questionIdList[questionIndex];
      await saveWrongAnsweredQuestion2(currentQuestionId);
    }
    // 回答完了後、累計回答数をインクリメント
    await incrementAnswerCount();
  };

  const handleExplanation = () => {
    const currentQuestion = questions.find(question => question.id === questionIdList[questionIndex]);
    if (currentQuestion && currentQuestion.ruleIds) {
      navigation.navigate('RuleExplanation', { ruleIds: currentQuestion.ruleIds });
    } else {
      console.log('No ruleIds found for the current question');
    }
  };

  // 正解問題保存用関数
  const saveSolvedQuestion = async (questionId) => {
    try {
      let solvedQuestions = await AsyncStorage.getItem('solvedQuestions');
      solvedQuestions = solvedQuestions ? JSON.parse(solvedQuestions) : [];
      if (!solvedQuestions.includes(questionId)) {
        solvedQuestions.push(questionId);
      }
      await AsyncStorage.setItem('solvedQuestions', JSON.stringify(solvedQuestions));
      console.log('Solved question ID saved:', questionId);
    } catch (error) {
      console.error('Error saving solved question:', error);
    }
  };

  const saveWrongAnsweredQuestion2 = async (questionId) => {
    try {
      let wrongAnsweredQuestions2 = await AsyncStorage.getItem('wrongAnsweredQuestions2');
      wrongAnsweredQuestions2 = wrongAnsweredQuestions2 ? JSON.parse(wrongAnsweredQuestions2) : [];
      const questionIdIndex = questionIdList.findIndex(id => id === questionId);
      if (questionIdIndex !== -1) {
        wrongAnsweredQuestions2.push(questionIdList[questionIdIndex]);
      }
      console.log('Wrong question ID to be saved:', questionId);
      await AsyncStorage.setItem('wrongAnsweredQuestions2', JSON.stringify(wrongAnsweredQuestions2));
    } catch (error) {
      console.error('Error saving wrong answered question2:', error);
    }
  };

  const currentQuestion =
    questionIdList.length > 0
      ? questions.find(question => question.id === questionIdList[questionIndex])
      : null;

  return (
    <View style={styles.mainContainer}>
      <View style={styles.banner}>
        <BannerAd
          key={bannerRefreshKey}
          unitId={banneradUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{ networkExtras: { collapsible: 'bottom' } }}
        />
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.contentContainer}>
          <View style={styles.questionContainer}>
            <Text>{currentQuestion ? currentQuestion.question : 'Loading...'}</Text>
          </View>
          <View style={styles.optionsContainer}>
            {currentQuestion &&
              currentQuestion.options.map((option, index) => (
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
            <AnswerButton title="回答する" onPress={handleAnswerButtonClick} />
            <View style={{ height: 20 }} />
          </View>
          {answered && (
            <View style={styles.resultContainer}>
              <View style={{ marginTop: -15 }} />
              <Text style={styles.resultText}>{isCorrect ? '〇' : '×'}</Text>
            </View>
          )}
          {answered && (
            <View style={styles.nextButtonContainer}>
              <AnswerButton title="Next" onPress={handleNextQuestion} />
                <TouchableOpacity style={styles.explanationButton} onPress={handleExplanation}>
                  <Text style={styles.explanationButtonText}>解説を見る</Text>
                </TouchableOpacity>
              <View style={{ height: 100 }} />
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
    fontSize: 80,
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

export default ReviewPage;
