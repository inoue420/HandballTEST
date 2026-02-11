import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import rules from './RuleDatas'; // RuleDatas.js から rules をインポート

const banneradUnitId = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      android: 'ca-app-pub-4399954903316919/6717510377',  // Android本番用ID
      ios: 'ca-app-pub-4399954903316919/6289016370',      // iOS本番用ID
    });

// グループ定義
const groups = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','競技規則解釈','交代地域規定','競技規則運用に関するガイドライン','チームタイムアウト電子申請システム規定','ビデオ判定システム規定'];
const RuleList = ({ }) => {
  const [currentGroupId, setCurrentGroupId] = useState('1'); // 初期値は'1'のグループ
  const flatListRef = useRef(null); // FlatListの参照を取得するためのuseRef
  const [bannerRefreshKey, setBannerRefreshKey] = useState(0);


  // 条のフィルタリング
  const filteredChapters = rules.filter(rule => {
    if (!rule.chapter || typeof rule.chapter !== 'string') return false;
    // currentGroupIdが数値の場合（例："1","2",...）は "第 {currentGroupId} 条" で判定、
    // それ以外（例："ガイドライン"）は完全一致とする
    if (!isNaN(parseInt(currentGroupId))) {
      return rule.chapter.startsWith(`第 ${currentGroupId} 条`);
    }
    return rule.chapter === currentGroupId;
  });
  
    

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.titleContainer}>
        <Text style={styles.id}>{item.id}</Text>
        <Text style={styles.title}>{item.title}</Text>
      </View>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  useEffect(() => {
    //バナーリセットの除去
/*     const interval = setInterval(() => {
      setBannerRefreshKey((prevKey) => prevKey + 1);
    }, 15000); // 15秒ごとにバナーをリセット
        return () => clearInterval(interval); // クリーンアップ */
  
  }, []);

  const numericChapters = rules.filter(rule => rule.chapter && rule.chapter.startsWith('第 '));
  const maxGroupId = Math.max(...numericChapters.map(rule => parseInt(rule.chapter.match(/\d+/)[0])));
  
// 現在のグループインデックスを計算
const currentIndex = groups.indexOf(currentGroupId);

// 次・前のグループへ移動する handlePress の変更
const handlePress = (newGroupId) => {
  setCurrentGroupId(newGroupId);
  if (flatListRef.current) {
    flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
  }
};


  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <BannerAd
          key={bannerRefreshKey} // リフレッシュのためのキーを追加
          unitId={banneradUnitId}
          size={BannerAdSize.BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
        />
      </View>
      <Text style={styles.header}>{filteredChapters[0]?.chapter}</Text>
      <FlatList
        ref={flatListRef}
        data={filteredChapters}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
        <View style={styles.buttonContainer}>
          {currentIndex > 0 && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => handlePress(groups[currentIndex - 1])}
            >
              <Text>前の条を表示</Text>
            </TouchableOpacity>
          )}
          {currentIndex < groups.length - 1 && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => handlePress(groups[currentIndex + 1])}
            >
              <Text>次の条を表示</Text>
            </TouchableOpacity>
          )}
        </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  banner: {
    alignItems: 'center',
    marginBottom: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  list: {
    width: '100%',
    padding: 10,
  },
  item: {
    backgroundColor: '#F0FFF0',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  titleContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  id: {
    fontSize: 16,
    marginRight: 4,
  },
  title: {
    fontSize: 12,
  },
  description: {
    fontSize: 14,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  button: {
    padding: 10,
    backgroundColor: 'lightblue',
    borderRadius: 5,
    marginHorizontal: 5,
  },
});

export default RuleList;
