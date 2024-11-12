import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RankUpModal from './RankUpModal';

const RankContext = createContext();

export const useRank = () => useContext(RankContext);

export const RankProvider = ({ children }) => {
  const [isModalVisible, setRankModalVisible] = useState(false);
  const [rank, setRank] = useState('(ランク1) 初心者'); 
  const [previousRank, setPreviousRank] = useState(null); // 前の(レベル
  const [globalTotalAttemptedCount, setGlobalTotalAttemptedCount] = useState(0);
  
  // globalTotalAttemptedCount をリセットする関数
  const resetGlobalTotalAttemptedCount = () => setGlobalTotalAttemptedCount(0);


  const ranks = [
    { name: '(ランク2) ボールキャッチで突き指するプレイヤー', threshold: 5 },
    { name: '(ランク3) 速攻練習で5歩ぐらい歩くプレイヤー', threshold: 10 },
    { name: '(ランク4) 中級プレイヤー', threshold: 15 },
    { name: '(ランク5) 試合直前に爪切らされるプレイヤー', threshold: 20 },
    { name: '(ランク6) 街中の障害物にフェイントかけるプレイヤー', threshold: 25 },
    { name: '(ランク7) 脳筋プレイヤー', threshold: 30 },
    { name: '(ランク8) 試合前メンバーチェックで食い気味に自分の名前を言うプレイヤー', threshold: 35 },
    { name: '(ランク9) 上級プレイヤー', threshold: 40 },
    { name: '(ランク10) オーバーステップ時、笛より早くボールを置くプレイヤー', threshold: 50 },
    { name: '(ランク11) コート上の監督', threshold: 600 },
    { name: '(ランク12) 駆け出しレフェリー', threshold: 70 },
    { name: '(ランク13) 飲み会に笛とイエローカード持参するレフェリー', threshold: 80 },
    { name: '(ランク14) C級レフェリー', threshold: 90 },
    { name: '(ランク15) テンションが高い時、2ステップ踏んで2分間退場出すレフェリー', threshold: 100 },
    { name: '(ランク16) B級レフェリー', threshold: 150 },
    { name: '(ランク17) 飲み会でぼけた人がいたらタイムアウトのジェスチャーするレフェリー', threshold: 200 },
    { name: '(ランク18) A級レフェリー', threshold: 250 },
    { name: '(ランク19) 笛を定期的に超音波洗浄するレフェリー', threshold: 300 },
    { name: '(ランク20) 退場についてベンチから質問されたら 8-4です　と答えるレフェリー', threshold: 350 },



  ];

  const updateRank = async (attemptedCount) => {
    const currentRankIndex = ranks.findIndex(r => r.name === rank);
    if (currentRankIndex >= ranks.length - 1) return;

    const nextRank = ranks[currentRankIndex + 1];
    if (nextRank && attemptedCount >= nextRank.threshold) {
     setPreviousRank(rank); // Update previousRank before changing the rank      
      setRank(nextRank.name);
      setRankModalVisible(true);

      // AsyncStorageにランクとカウントを保存
      await AsyncStorage.setItem('currentRank', nextRank.name);
      await AsyncStorage.setItem('totalAttemptedCount', JSON.stringify(attemptedCount));

    }
  };

  // fetchStudyDataを他のコンポーネントから利用できるようにする
  const fetchStudyData = async () => {
    try {
      const solvedQuestions = await AsyncStorage.getItem('solvedQuestions');
      const wrongAnsweredQuestions = await AsyncStorage.getItem('wrongAnsweredQuestions');
      const uniqueSolvedQuestions = solvedQuestions ? [...new Set(JSON.parse(solvedQuestions))] : [];
      const uniqueWrongAnsweredQuestions = wrongAnsweredQuestions ? [...new Set(JSON.parse(wrongAnsweredQuestions))] : [];　//間違えた数　今は使わないがいつかは。。

/*       const uniqueAttemptedQuestions = [...new Set([...uniqueSolvedQuestions, ...uniqueWrongAnsweredQuestions])];*/ 　//デバッグ用に問題数で実装
     const uniqueAttemptedQuestions = [...new Set([...uniqueSolvedQuestions])];
      
      setGlobalTotalAttemptedCount(uniqueAttemptedQuestions.length);
    } catch (error) {
      console.error('Error fetching study history:', error);
    }
  };


  // アプリ起動時にランクとカウントを復元
  useEffect(() => {
    const initializeData = async () => {
      const savedRank = await AsyncStorage.getItem('currentRank');
      const savedAttemptedCount = await AsyncStorage.getItem('totalAttemptedCount');
      
      if (savedRank) {
        setRank(savedRank);
      }
      
      if (savedAttemptedCount) {
        setGlobalTotalAttemptedCount(JSON.parse(savedAttemptedCount));
      } else {
        await fetchStudyData();
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    updateRank(globalTotalAttemptedCount);
  }, [globalTotalAttemptedCount]);

  const value = {
    isModalVisible,
    setRankModalVisible,
    rank,
    previousRank, // 前のランクも提供
    globalTotalAttemptedCount,
    fetchStudyData, // fetchStudyDataを追加
    resetGlobalTotalAttemptedCount //rest用の関数
  };

  return (
    <RankContext.Provider value={value}>
      {children}
      <RankUpModal 
        visible={isModalVisible} 
        onClose={() => setRankModalVisible(false)} 
        currentRank={rank} 
        previousRank={previousRank} // 前のランクを渡す
      />
    </RankContext.Provider>
  );
};

