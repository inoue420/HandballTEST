import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import rules from './RuleDatas'; // RuleDatas.js から rules をインポート

const banneradUnitId = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      android: 'ca-app-pub-4399954903316919/6717510377',  // Android本番用ID
      ios: 'ca-app-pub-4399954903316919/6289016370',      // iOS本番用ID
    });

const RuleExplanation = ({ route }) => {
  const { ruleIds } = route.params;
  const [bannerRefreshKey, setBannerRefreshKey] = useState(0);

  useEffect(() => {

    const interval = setInterval(() => {
      setBannerRefreshKey((prevKey) => prevKey + 1);
    }, 15000); // 15秒ごとにバナーをリセット
        return () => clearInterval(interval); // クリーンアップ
  
  }, []);


  // 複数のルールIDに基づいて対応するルールを取得
  const matchedRules = rules.filter(rule => ruleIds.includes(rule.id));

  if (matchedRules.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>関連する競技規則が見つかりません (交代地域規定・ガイドライン・競技規則解釈は実装準備中です・・・)</Text>
      </View>
    );
  }

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
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>関連する競技規則</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {matchedRules.map(rule => (
          <View key={rule.id} style={styles.item}>
            <View style={styles.titleContainer}>
              <Text style={styles.id}>{rule.id}</Text>
              <Text style={styles.title}>{rule.title}</Text>
            </View>
            <Text style={styles.description}>{rule.description}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// スタイルシート
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  banner: {
    alignItems: 'center',
    marginBottom: 10,
  },
  scrollView: {
    paddingBottom: 20,
  },
  headerContainer: {
    padding: 10,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
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
});

export default RuleExplanation;
