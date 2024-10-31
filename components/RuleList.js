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

const RuleList = ({ }) => {
  const [currentGroupId, setCurrentGroupId] = useState('1'); // 初期値は'1'のグループ
  const flatListRef = useRef(null); // FlatListの参照を取得するためのuseRef
  const [bannerRefreshKey, setBannerRefreshKey] = useState(0);

  // 条のフィルタリング
  const filteredChapters = rules.filter(rule => rule.chapter.startsWith(`第 ${currentGroupId} 条`));

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
    const interval = setInterval(() => {
      setBannerRefreshKey((prevKey) => prevKey + 1);
    }, 15000); // 15秒ごとにバナーをリセット
        return () => clearInterval(interval); // クリーンアップ
  
  }, []);


  const maxGroupId = Math.max(...rules.map(rule => parseInt(rule.chapter.match(/\d+/)[0])));

  const handlePress = (newGroupId) => {
    setCurrentGroupId(newGroupId.toString());
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ animated: true, offset: 0 }); // 一番上にスクロール
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
        {parseInt(currentGroupId) > 1 && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => handlePress(parseInt(currentGroupId) - 1)}
          >
            <Text>前の条を表示</Text>
          </TouchableOpacity>
        )}
        {parseInt(currentGroupId) < maxGroupId && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => handlePress(parseInt(currentGroupId) + 1)}
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
