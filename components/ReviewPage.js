import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native'; // Added TouchableOpacity
import AsyncStorage from '@react-native-async-storage/async-storage';
import questions from './questions';
import ChoiceButton from './ChoiceButton'; // ChoiceButtonのインポートを追加
import AnswerButton from './AnswerButton'; // AnswerButtonのインポートを追加
import { useNavigation } from '@react-navigation/native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useRank } from './RankContext';

const banneradUnitId = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      android: 'ca-app-pub-4399954903316919/6717510377',  // Android本番用ID
      ios: 'ca-app-pub-4399954903316919/6289016370',      // iOS本番用ID
    });

const ReviewPage = () => {
  const [questionIndex, setQuestionIndex] = useState(0); // AsyncStorageから取得した問題のインデックス
  const [questionIdList, setQuestionIdList] = useState([]); // AsyncStorageから取得した問題IDのリスト
  const [selectedAnswers, setSelectedAnswers] = useState([]); // 選択された回答の配列
  const [answered, setAnswered] = useState(false); // 回答済みかどうか
  const [isCorrect, setIsCorrect] = useState(false); // 正誤判定
  const navigation = useNavigation();
  const { fetchStudyData } = useRank(); //RankContextからfetchの読み込み
  const [bannerRefreshKey, setBannerRefreshKey] = useState(0);

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

    //バナーリセットの除去
/*     const interval = setInterval(() => {
      setBannerRefreshKey((prevKey) => prevKey + 1);
    }, 15000); // 15秒ごとにバナーをリセット
        return () => clearInterval(interval); // クリーンアップ */

  }, []);

  const handleNextQuestion = () => {
    if (questionIndex < questionIdList.length - 1) {
      setQuestionIndex(questionIndex + 1);
      setSelectedAnswers([]);
      setAnswered(false);
      setIsCorrect(false);
      fetchStudyData(); // Nextボタンが押された時にデータを更新

    } else {
      console.log('End of question list');
      navigation.navigate('End');
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
    const currentQuestion = questions.find(question => question.id === questionIdList[questionIndex]);
    const correctAnswers = currentQuestion.correctAnswers;
    const isCorrect = selectedAnswers.every(answer => correctAnswers.includes(answer)) && selectedAnswers.length === correctAnswers.length;
    // 全ての選択肢が正解かチェック
    
    setIsCorrect(isCorrect);
    setAnswered(true);

    if (isCorrect) {
      const currentQuestionId = questionIdList[questionIndex];
      await saveSolvedQuestion(currentQuestionId); // 正解の場合にIDを保存
    } else {
      const currentQuestionId = questionIdList[questionIndex];
      await saveWrongAnsweredQuestion2(currentQuestionId);

    } 
  };

  const handleExplanation = () => {
    const currentQuestion = questions.find(question => question.id === questionIdList[questionIndex]);
    if (currentQuestion && currentQuestion.ruleIds) {
      const ruleIds = currentQuestion.ruleIds; // ルールIDを取得
      navigation.navigate('RuleExplanation', { ruleIds });
    } else {
      console.log('No ruleIds found for the current question');
    }
  };

// 正解した問題を保存する関数
const saveSolvedQuestion = async (questionId) => {
  try {
    let solvedQuestions = await AsyncStorage.getItem('solvedQuestions');
    if (solvedQuestions === null) {
      solvedQuestions = [];
    } else {
      solvedQuestions = JSON.parse(solvedQuestions);
    }

    // 重複を防ぐためにIDが既に存在するか確認
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

  const currentQuestion = questionIdList.length > 0 ? questions.find(question => question.id === questionIdList[questionIndex]) : null;

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
                key={option} // Use option as key if unique
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
    backgroundColor: 'white', // バナーの背景色を調整
  },
  scrollViewContainer: {
    flexGrow: 1, // ビューポートの高さに対して成長する
  },
  mainContainer: {
    flex: 1,
    paddingTop: 40, // バナーの高さ分の余白を追加
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

export default ReviewPage;
