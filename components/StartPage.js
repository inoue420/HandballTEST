import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, Alert, Linking } from 'react-native';
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
  const [currentVersion, setCurrentVersion] = useState('1.4.3'); // アプリの現在のバージョン
  const [latestVersion, setLatestVersion] = useState('');

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

    const fetchVersion = async () => {
      try {
        const response = await fetch('https://inoue420.github.io/version/version.json');
        const data = await response.json();
        setLatestVersion(data.version);

        // バージョンチェック
        if (currentVersion !== data.version) {
          Alert.alert(
            'アップデート通知',
            'アプリのアップデートが利用可能です。最新バージョンにアップデートしてください。',
            [
              {
                text: 'アップデートする',
                onPress: () => Linking.openURL('https://apps.apple.com/app/handball-rules/id6502761559'),
              },
              {
                text: 'キャンセル',
                style: 'cancel',
              },
            ]
          );
        }
      } catch (error) {
        console.error('Error fetching version:', error);
      }
    };

    requestTrackingPermission();
    fetchVersion();
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
        { prefix: '1', start: 1, end: 1 },
        { prefix: '2', start: 2, end: 49 },
        { prefix: '3', start: 1, end: 4 },
        { prefix: '4', start: 1, end: 61 },
        { prefix: '5', start: 1, end: 13 },
        { prefix: '6', start: 1, end: 24 },
        { prefix: '7', start: 1, end: 34 },
        { prefix: '8', start: 1, end: 73 },
        { prefix: '9', start: 1, end: 9 },
        { prefix: '10', start: 1, end: 7 },
        { prefix: '11', start: 1, end: 6 },
        { prefix: '12', start: 1, end: 11 },
        { prefix: '13', start: 1, end: 15 },
        { prefix: '14', start: 1, end: 23 },
        { prefix: '15', start: 1, end: 25 },
        { prefix: '16', start: 1, end: 23 },
        { prefix: '17', start: 1, end: 9 },
        { prefix: '18', start: 1, end: 8 },
        { prefix: '19', start: 1, end: 2 },
      ];
  
      const selectedIds = await selectRandomQuestions(ranges, 4);
  
      await AsyncStorage.setItem('todayIds', JSON.stringify(selectedIds));
      console.log('Today\'s randomIds:', selectedIds);
  
      navigation.navigate('TodayQuestionsPage');
    } catch (error) {
      console.error('Error during generating today\'s questions:', error);
    }
  };
  
  const selectRandomQuestions = async (ranges, numberOfQuestions) => {
    const selectedIds = [];
  
    while (selectedIds.length < numberOfQuestions) {
      const range = ranges[Math.floor(Math.random() * ranges.length)];
      const { prefix, start, end } = range;
  
      const randomId = `${prefix}-${Math.floor(Math.random() * (end - start + 1)) + start}`;
  
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
