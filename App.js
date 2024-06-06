// App.js

import React, { useEffect } from 'react';//use追加
import { View, Text, StyleSheet } from 'react-native';//まるごと
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import StartPage from './components/StartPage';
import QuizPage from './components/QuizPage';
import AnswerHistoryPage from './components/AnswerHistoryPage';
import ChapterEnd from './components/ChapterEnd';
import ReviewPage from './components/ReviewPage';
import ReviewPage2 from './components/ReviewPage2';
import TestPage from './components/TestPage';

import ChapterSelection from './components/ChapterSelection';
import 'expo-dev-client';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

const Stack = createStackNavigator();

const App = () => {
  useEffect(() => {
    (async () => {
      const { status } = await requestTrackingPermissionsAsync();
      if (status === 'granted') {
        console.log('Yay! I have user permission to track data');
      }
    })();
  }, []);


  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="StartPage" component={StartPage} />
        <Stack.Screen name="Quiz" component={QuizPage} />
        <Stack.Screen name="History" component={AnswerHistoryPage} />
        <Stack.Screen name="End" component={ChapterEnd} />
        <Stack.Screen name="Review" component={ReviewPage} />
        <Stack.Screen name="Review2" component={ReviewPage2} />
        <Stack.Screen name="Chapter" component={ChapterSelection} />
        <Stack.Screen name="Test" component={TestPage} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});