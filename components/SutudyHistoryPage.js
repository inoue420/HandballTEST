import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { questions, calculateChapterCounts } from './questions';
import { useRank } from './RankContext';

const StudyHistoryPage = () => {
  const [correctCountsByChapter, setCorrectCountsByChapter] = useState({});
  const [incorrectCountsByChapter, setIncorrectCountsByChapter] = useState({});
  const [attemptedCountsByChapter, setAttemptedCountsByChapter] = useState({});
  const [chapterCounts, setChapterCounts] = useState({});
  const [totalSolvedCount, setTotalSolvedCount] = useState(0);
  const [totalIncorrectCount, setTotalIncorrectCount] = useState(0);
  const [totalAttemptedCount, setTotalAttemptedCount] = useState(0);
  const { resetGlobalTotalAttemptedCount } = useRank(); // RankContextからリセット関数を取得
  const [expandedSections, setExpandedSections] = useState({
    correct: false,
    incorrect: false,
    attempted: false,
  });

// RankContextからsetTotalAttemptedCountを取得
/*  const { setGlobalTotalAttemptedCount } = useRank();  */
  
  useEffect(() => {
    setChapterCounts(calculateChapterCounts());

    const fetchStudyData = async () => {
      try {
        const solvedQuestions = await AsyncStorage.getItem('solvedQuestions');
        const wrongAnsweredQuestions = await AsyncStorage.getItem('wrongAnsweredQuestions');

        const uniqueSolvedQuestions = solvedQuestions ? [...new Set(JSON.parse(solvedQuestions))] : [];
        const uniqueWrongAnsweredQuestions = wrongAnsweredQuestions ? [...new Set(JSON.parse(wrongAnsweredQuestions))] : [];

        // 正解・間違えた・取り組んだ問題数
        setTotalSolvedCount(uniqueSolvedQuestions.length);
        setTotalIncorrectCount(uniqueWrongAnsweredQuestions.length);

        // 取り組んだ問題のIDを取得（重複を排除）
        const uniqueAttemptedQuestions = [...new Set([...uniqueSolvedQuestions, ...uniqueWrongAnsweredQuestions])];
        setTotalAttemptedCount(uniqueAttemptedQuestions.length);
/*         setGlobalTotalAttemptedCount(uniqueAttemptedQuestions.length); // RankContextに保存 */

        // 章ごとの集計
        const correctCounts = {};
        uniqueSolvedQuestions.forEach(id => {
          const chapter = id.split('-')[0];
          correctCounts[chapter] = (correctCounts[chapter] || 0) + 1;
        });
        setCorrectCountsByChapter(correctCounts);

        const incorrectCounts = {};
        uniqueWrongAnsweredQuestions.forEach(id => {
          const chapter = id.split('-')[0];
          incorrectCounts[chapter] = (incorrectCounts[chapter] || 0) + 1;
        });
        setIncorrectCountsByChapter(incorrectCounts);

        const attemptedCounts = {};
        uniqueAttemptedQuestions.forEach(id => {
          const chapter = id.split('-')[0];
          attemptedCounts[chapter] = (attemptedCounts[chapter] || 0) + 1;
        });
        setAttemptedCountsByChapter(attemptedCounts);

      } catch (error) {
        console.error('Error fetching study history:', error);
      }
    };

    fetchStudyData();
  }, []);

  const totalQuestionCount = Object.values(chapterCounts).reduce((acc, count) => acc + count, 0);

  const toggleSection = (section) => {
    setExpandedSections((prevSections) => ({
      ...prevSections,
      [section]: !prevSections[section],
    }));
  };

  // 履歴を除去する関数
  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem('solvedQuestions');
      await AsyncStorage.removeItem('wrongAnsweredQuestions');
      resetGlobalTotalAttemptedCount(); // グローバルの取り組んだ問題数をリセット

      setTotalSolvedCount(0);
      setTotalIncorrectCount(0);
      setTotalAttemptedCount(0);
      setCorrectCountsByChapter({});
      setIncorrectCountsByChapter({});
      setAttemptedCountsByChapter({});
      console.log('履歴が削除されました');
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };



  return (
    <View style={styles.container}>
      <Text style={styles.title}>学習履歴</Text>

      {/* 正解した問題 */}
      <TouchableOpacity onPress={() => toggleSection('correct')}>
        <Text style={styles.toggleText}>
          正解した問題: {totalSolvedCount} / {totalQuestionCount}
        </Text>
      </TouchableOpacity>
      {expandedSections.correct && (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {Object.keys(chapterCounts).map(chapter => (
            <Text style={styles.infoText} key={`${chapter}-correct`}>
              {chapter}章: {correctCountsByChapter[chapter] || 0} / {chapterCounts[chapter]}
            </Text>
          ))}
        </ScrollView>
      )}

      {/* 間違えた問題 */}
      <TouchableOpacity onPress={() => toggleSection('incorrect')}>
        <Text style={styles.toggleText}>
          間違えた問題: {totalIncorrectCount} / {totalQuestionCount}
        </Text>
      </TouchableOpacity>
      {expandedSections.incorrect && (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {Object.keys(chapterCounts).map(chapter => (
            <Text style={styles.infoText} key={`${chapter}-incorrect`}>
              {chapter}章: {incorrectCountsByChapter[chapter] || 0} / {chapterCounts[chapter]}
            </Text>
          ))}
        </ScrollView>
      )}

      {/* 取り組んだ問題 */}
      <TouchableOpacity onPress={() => toggleSection('attempted')}>
        <Text style={styles.toggleText}>
          取り組んだ問題: {totalAttemptedCount} / {totalQuestionCount}
        </Text>
      </TouchableOpacity>
      {expandedSections.attempted && (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {Object.keys(chapterCounts).map(chapter => (
            <Text style={styles.infoText} key={`${chapter}-attempted`}>
              {chapter}章: {attemptedCountsByChapter[chapter] || 0} / {chapterCounts[chapter]}
            </Text>
          ))}
        </ScrollView>
      )}

            {/* 履歴除去ボタン */}
{/*             <View style={styles.clearButtonContainer}>
        <Button title="履歴を除去" onPress={clearHistory} color="#FF6347" />
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0FFFF',
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  toggleText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
    color: '#007AFF',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default StudyHistoryPage;
