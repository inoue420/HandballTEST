// App.js

import React from 'react';
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


const Stack = createStackNavigator();

const App = () => {
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