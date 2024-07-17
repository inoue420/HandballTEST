import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import rules from './RuleDatas'; // RuleDatas.js から rules をインポート

const RuleExplanation = ({ route }) => {
  const { ruleIds } = route.params;

  // 複数のルールIDに基づいて対応するルールを取得
  const matchedRules = rules.filter(rule => ruleIds.includes(rule.id));

  if (matchedRules.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>関連する競技規則が見つかりません (ガイドライン・競技規則解釈は実装準備中です・・・)</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
  scrollView: {
    paddingBottom: 20, // 下部に余白を追加
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
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  id: {
    fontSize: 16,
    marginRight: 4,
  },
  title: {
    fontSize: 16,
  },
  description: {
    fontSize: 14,
    marginTop: 5,
  },
});

export default RuleExplanation;
