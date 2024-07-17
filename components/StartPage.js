import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from './CustomButton';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

const adUnitIds = {
  android: 'ca-app-pub-4399954903316919/6717510377',
  ios: 'ca-app-pub-4399954903316919/7557182852'
};

const adUnitId = Platform.select({
  android: adUnitIds.android,
  ios: adUnitIds.ios,
});

const StartPage = ({ navigation }) => {
  useEffect(() => {
    const requestTrackingPermission = async () => {
      try {
        const { status } = await requestTrackingPermissionsAsync();
        if (status === 'granted') {
          console.log('User has granted permission for tracking data');
        }
      } catch (error) {
        console.error('Error requesting tracking permission:', error);
      }
    };
    
    requestTrackingPermission();
  }, []);

  const handleStudySessions = () => {
    navigation.navigate('StudySessions');
  };

  const handleRuleList = () => {
    navigation.navigate('RuleList');
  };

  const handleTest = async () => {
    try {
      await AsyncStorage.removeItem('randomIds');
      const prefixCountPairs = [
        ['1', 1, 3, 1],
        ['2', 2, 49, 2],
        ['3', 1, 4, 1],
        ['4', 1, 61, 3],
        ['5', 1, 13, 1],
        ['6', 1, 24, 1],
        ['7', 1, 34, 1],
        ['8', 1, 73, 3],
        ['9', 1, 9, 1],
        ['10', 1, 7, 1],
        ['11', 1, 6, 1],
        ['12', 1, 11, 1],
        ['13', 1, 15, 1],
        ['14', 1, 23, 1],
        ['15', 1, 25, 1],
        ['16', 1, 23, 2],
        ['17', 1, 9, 1],
        ['18', 1, 8, 1],
        ['19', 1, 2, 1],
      ];

      for (const [prefix, start, end, count] of prefixCountPairs) {
        await saveRandomIds(prefix, start, end, count);
      }

      const randomIds = await AsyncStorage.getItem('randomIds');
      console.log('randomIds:', JSON.parse(randomIds));
    } catch (error) {
      console.error('Error during test:', error);
    }
   
    navigation.navigate('Test');
  };

  const handleTodayQuestions = async () => {
    try {
      await AsyncStorage.removeItem('todayIds'); // 既存の todayIds を削除
  
      const ranges = [
        { prefix: '1', start: 1, end: 1 },     // 1-1から1-1までの1問を選択
        { prefix: '2', start: 2, end: 49 },    // 2-2から2-49までの2問を選択
        { prefix: '3', start: 1, end: 4 },     // 3-1から3-4までの1問を選択
        { prefix: '4', start: 1, end: 61 },    // 4-1から4-61までの1問を選択
        { prefix: '5', start: 1, end: 13 },    // 5-1から5-13までの1問を選択
        { prefix: '6', start: 1, end: 24 },    // 6-1から6-24までの1問を選択
        { prefix: '7', start: 1, end: 34 },    // 7-1から7-34までの1問を選択
        { prefix: '8', start: 1, end: 73 },    // 8-1から8-73までの1問を選択
        { prefix: '9', start: 1, end: 9 },     // 9-1から9-9までの1問を選択
        { prefix: '10', start: 1, end: 7 },    // 10-1から10-7までの1問を選択
        { prefix: '11', start: 1, end: 6 },    // 11-1から11-6までの1問を選択
        { prefix: '12', start: 1, end: 11 },   // 12-1から12-11までの1問を選択
        { prefix: '13', start: 1, end: 15 },   // 13-1から13-15までの1問を選択
        { prefix: '14', start: 1, end: 23 },   // 14-1から14-23までの1問を選択
        { prefix: '15', start: 1, end: 25 },   // 15-1から15-25までの1問を選択
        { prefix: '16', start: 1, end: 23 },   // 16-1から16-23までの2問を選択
        { prefix: '17', start: 1, end: 9 },    // 17-1から17-9までの1問を選択
        { prefix: '18', start: 1, end: 8 },    // 18-1から18-8までの1問を選択
        { prefix: '19', start: 1, end: 2 },    // 19-1から19-2までの1問を選択
      ];
  
      // ランダムに問題を選ぶ
      const selectedIds = await selectRandomQuestions(ranges, 4);
  
      // 選択されたIDを保存する
      await AsyncStorage.setItem('todayIds', JSON.stringify(selectedIds));
      console.log('Today\'s randomIds:', selectedIds);
  
      // 今日の問題ページにナビゲートする
      navigation.navigate('TodayQuestionsPage');
    } catch (error) {
      console.error('Error during generating today\'s questions:', error);
    }
  };
  
  // ランダムに問題を選ぶ関数
  const selectRandomQuestions = async (ranges, numberOfQuestions) => {
    const selectedIds = [];
  
    while (selectedIds.length < numberOfQuestions) {
      // 範囲からランダムに1つを選ぶ
      const range = ranges[Math.floor(Math.random() * ranges.length)];
      const { prefix, start, end } = range;
  
      // ランダムに問題を選ぶ
      const randomId = `${prefix}-${Math.floor(Math.random() * (end - start + 1)) + start}`;
  
      // 選択済みでないことを確認
      if (!selectedIds.includes(randomId)) {
        selectedIds.push(randomId);
      }
    }
  
    return selectedIds;
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

      <View style={styles.titleBox}>
        <Text style={[styles.title, { textAlign: 'center' }]}>Handball Rules</Text>
        <Text style={[styles.title, { fontSize: 25, textAlign: 'center' }]}>～2min study～</Text>
      </View>

      <View style={styles.buttonContainer}>
      <CustomButton
          title="今日の4問(ランダム出題)"
          onPress={handleTodayQuestions}
        />

        <CustomButton
          title="問題集を好きなだけ解く"
          onPress={handleStudySessions}
        />

        <CustomButton
          title="競技規則(2024年版)を見る"
          onPress={handleRuleList}
        />

        <CustomButton
          title="実力確認テストをする　25問"
          onPress={handleTest}
        />


      </View>
    </View>
  );
};

const saveRandomIds = async (prefix, start, end, count, storageKey = 'randomIds') => {
  try {
    let randomIds = await AsyncStorage.getItem(storageKey);
    if (randomIds === null) {
      randomIds = [];
    } else {
      randomIds = JSON.parse(randomIds);
    }

    for (let i = 0; i < count; i++) {
      let randomId;
      do {
        randomId = `${prefix}-${Math.floor(Math.random() * (end - start + 1)) + start}`;
      } while (randomIds.includes(randomId));

      randomIds.push(randomId);
    }

    console.log('Random IDs to be saved:', randomIds);
    await AsyncStorage.setItem(storageKey, JSON.stringify(randomIds));
  } catch (error) {
    console.error('Error saving random IDs:', error);
  }
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleBox: {
    marginBottom: 40,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'blue',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
});

export default StartPage;
