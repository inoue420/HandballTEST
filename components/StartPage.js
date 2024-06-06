import React, { } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from './CustomButton'; // カスタムボタンのインポート
import { BannerAd, BannerAdSize, TestIds,} from 'react-native-google-mobile-ads';

const adUnitId ='ca-app-pub-4399954903316919/7557182852'; //バナー実装のためのコマンド

const StartPage = ({ navigation }) => {

  // 復習ボタンが押されたときの処理
  const handleReview = () => {
    navigation.navigate('Review');
  };

  // 復習ボタンが押されたときの処理
  const handleReview2 = () => {
    navigation.navigate('Review2');
  };

  // Answer Historyボタンが押されたときの処理
  const handleAnswerHistory = () => {
    navigation.navigate('History');
  };

  // ChapterSelectionへのリンクが押されたときの処理
  const handleChapterSelection = () => {
    navigation.navigate('Chapter');
  };

// テストボタンが押されたときの処理
const handleTest = async () => {
  try {
    // randomIds を削除する
    await AsyncStorage.removeItem('randomIds');

    // 各 prefix ごとに乱数を生成し、randomIds に保存する
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

    // randomIds の内容を表示する
    const randomIds = await AsyncStorage.getItem('randomIds');
    console.log('randomIds:', JSON.parse(randomIds));
  } catch (error) {
    console.error('Error during test:', error);
  }
 
  navigation.navigate('Test');

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
  <Text style={[styles.title, { fontSize: 25, textAlign: 'center' }]}>～ツーミニッツの館～</Text>
      </View>

      <View style={styles.buttonContainer}>
        <CustomButton
          title="学習開始"
          onPress={handleChapterSelection} 
        />

        <CustomButton
          title="復習開始(1週目)"
          onPress={handleReview}
        />

        <CustomButton
          title="復習開始(2週目)"
          onPress={handleReview2}
        />

        <CustomButton
          title="誤答履歴を確認"
          onPress={handleAnswerHistory}
        />

        <CustomButton
          title="テスト"
          onPress={handleTest}
        />
      </View>
    </View>
  );
};

const saveRandomIds = async (prefix, start, end, count) => {
  try {
    let randomIds = await AsyncStorage.getItem('randomIds');
    if (randomIds === null) {
      randomIds = [];
    } else {
      randomIds = JSON.parse(randomIds);
    }

    for (let i = 0; i < count; i++) {
      let randomId;
      do {
        randomId = `${prefix}-${Math.floor(Math.random() * (end - start + 1)) + start}`;
      } while (randomIds.includes(randomId)); // 既に含まれている乱数の場合は再生成する

      randomIds.push(randomId);
    }

    console.log('Random IDs to be saved:', randomIds);
    await AsyncStorage.setItem('randomIds', JSON.stringify(randomIds));
  } catch (error) {
    console.error('Error saving random IDs:', error);
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  banner: {
    position: 'absolute',
    top: 0,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white', // バナーの背景色を調整
  },

  titleBox: {
    marginBottom: 40,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'blue', // タイトルの色を変更する場合はここを変更
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
});

export default StartPage;
