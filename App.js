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
import 'expo-dev-client';
import RuleList from './components/RuleList';
import RuleExplanation from './components/RuleExplanation'
import StudySessions from './components/StudySessions';
import TodayQuestionsPage from './components/TodayQuestionsPage';
import StudyHistoryPage from './components/SutudyHistoryPage';
import RankUpModal from './components/RankUpModal'; // ランクアップ用モーダルのインポート
import { RankProvider } from './components/RankContext'; // RankContextのプロバイダをインポート 



const Stack = createStackNavigator();

const App = () => {
  return (
    // RankProviderでアプリ全体をラップ
    <RankProvider>
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
          <Stack.Screen name="RuleList" component={RuleList} />
          <Stack.Screen name="RuleExplanation" component={RuleExplanation} />
          <Stack.Screen name="StudySessions" component={StudySessions} />
          <Stack.Screen name="TodayQuestionsPage" component={TodayQuestionsPage} />
          <Stack.Screen name="StudyHistory" component={StudyHistoryPage} />
          <Stack.Screen 
            name="RankUpModal" 
            component={RankUpModal} 
            options={{ headerShown: false, presentation: 'modal' }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </RankProvider>
  );
};

export default App;
