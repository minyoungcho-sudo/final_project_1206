// 관리자 페이지용 데이터 유틸리티 (Firestore 기반)
// 사용자 데이터를 날짜별로 필터링하고 관리하는 함수들

import { db } from '../firebaseConfig.js';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';

// 모든 사용자 데이터 가져오기 (Firestore에서)
export async function getAllUsersActivityData() {
  if (!db) {
    console.error('Firestore가 초기화되지 않았습니다.');
    return [];
  }

  try {
    // users 컬렉션의 모든 문서 가져오기
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    const users = [];
    
    // 각 사용자에 대해 데이터 가져오기
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      const userName = userData.userName || userData.userId || `사용자 ${userId}`;
      
      // 각 서브컬렉션에서 데이터 가져오기
      const [difficultSentences, savedPassages, wrongQuestions] = await Promise.all([
        getDifficultSentencesForUser(userId),
        getSavedPassagesForUser(userId),
        getWrongQuestionsForUser(userId)
      ]);
      
      users.push({
        userId,
        userName,
        difficultSentences,
        savedPassages,
        wrongQuestions
      });
    }
    
    return users;
  } catch (error) {
    console.error('Firestore에서 모든 사용자 활동 데이터 가져오기 실패:', error);
    return [];
  }
}

// 특정 사용자의 어려운 문장 가져오기
async function getDifficultSentencesForUser(userId) {
  try {
    const sentencesRef = collection(db, 'users', userId, 'difficultSentences');
    const sentencesSnapshot = await getDocs(sentencesRef);
    
    const sentences = [];
    sentencesSnapshot.forEach((doc) => {
      const data = doc.data();
      sentences.push({
        id: doc.id,
        userId: data.userId || userId,
        userName: data.userName,
        sentence: data.sentence,
        analysis: data.analysis,
        translation: data.translation,
        savedAt: data.savedAt?.toDate?.()?.toISOString() || 
                 data.createdAt?.toDate?.()?.toISOString() || 
                 new Date().toISOString()
      });
    });
    
    return sentences;
  } catch (error) {
    console.error(`사용자 ${userId}의 어려운 문장 가져오기 실패:`, error);
    return [];
  }
}

// 특정 사용자의 저장한 지문 가져오기
async function getSavedPassagesForUser(userId) {
  try {
    const passagesRef = collection(db, 'users', userId, 'savedPassages');
    const passagesSnapshot = await getDocs(passagesRef);
    
    const passages = [];
    passagesSnapshot.forEach((doc) => {
      const data = doc.data();
      passages.push({
        id: doc.id,
        userId: data.userId || userId,
        userName: data.userName,
        passage: data.passage,
        contentAnalysis: data.contentAnalysis,
        savedAt: data.savedAt?.toDate?.()?.toISOString() || 
                 data.createdAt?.toDate?.()?.toISOString() || 
                 new Date().toISOString()
      });
    });
    
    return passages;
  } catch (error) {
    console.error(`사용자 ${userId}의 저장한 지문 가져오기 실패:`, error);
    return [];
  }
}

// 특정 사용자의 틀린 문제 가져오기
async function getWrongQuestionsForUser(userId) {
  try {
    const questionsRef = collection(db, 'users', userId, 'wrongQuestions');
    const questionsSnapshot = await getDocs(questionsRef);
    
    const questions = [];
    questionsSnapshot.forEach((doc) => {
      const data = doc.data();
      questions.push({
        id: doc.id,
        userId: data.userId || userId,
        userName: data.userName,
        question: data.question,
        selectedAnswer: data.selectedAnswer,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation,
        questionType: data.questionType,
        savedAt: data.savedAt?.toDate?.()?.toISOString() || 
                 data.createdAt?.toDate?.()?.toISOString() || 
                 new Date().toISOString()
      });
    });
    
    return questions;
  } catch (error) {
    console.error(`사용자 ${userId}의 틀린 문제 가져오기 실패:`, error);
    return [];
  }
}

// 날짜별로 필터링된 사용자 데이터 가져오기
export async function getUsersByDate(selectedDate) {
  const allUsers = await getAllUsersActivityData();
  const filteredUsers = [];
  
  // 날짜 문자열 (YYYY-MM-DD 형식)
  const targetDate = selectedDate;
  
  allUsers.forEach(user => {
    const userData = {
      userId: user.userId,
      userName: user.userName,
      difficultSentences: [],
      savedPassages: [],
      wrongQuestions: []
    };
    
    // 어려운 문장 필터링
    if (user.difficultSentences) {
      userData.difficultSentences = user.difficultSentences.filter(item => {
        if (!item.savedAt) return false;
        const itemDate = new Date(item.savedAt).toISOString().split('T')[0];
        return itemDate === targetDate;
      });
    }
    
    // 저장된 지문 필터링
    if (user.savedPassages) {
      userData.savedPassages = user.savedPassages.filter(item => {
        if (!item.savedAt) return false;
        const itemDate = new Date(item.savedAt).toISOString().split('T')[0];
        return itemDate === targetDate;
      });
    }
    
    // 틀린 문제 필터링
    if (user.wrongQuestions) {
      userData.wrongQuestions = user.wrongQuestions.filter(item => {
        if (!item.savedAt) return false;
        const itemDate = new Date(item.savedAt).toISOString().split('T')[0];
        return itemDate === targetDate;
      });
    }
    
    // 해당 날짜에 데이터가 있는 사용자만 추가
    if (userData.difficultSentences.length > 0 || 
        userData.savedPassages.length > 0 || 
        userData.wrongQuestions.length > 0) {
      filteredUsers.push(userData);
    }
  });
  
  return filteredUsers;
}

// 사용 가능한 날짜 목록 가져오기
export async function getAvailableDates() {
  const allUsers = await getAllUsersActivityData();
  const dateSet = new Set();
  
  allUsers.forEach(user => {
    // 모든 데이터 타입에서 날짜 추출
    const allData = [
      ...(user.difficultSentences || []),
      ...(user.savedPassages || []),
      ...(user.wrongQuestions || [])
    ];
    
    allData.forEach(item => {
      if (item.savedAt) {
        const date = new Date(item.savedAt).toISOString().split('T')[0];
        dateSet.add(date);
      }
    });
  });
  
  // 날짜를 내림차순으로 정렬 (최신 날짜가 위로)
  return Array.from(dateSet).sort((a, b) => b.localeCompare(a));
}

// 특정 사용자의 전체 데이터 가져오기
export async function getUserData(userId) {
  if (!db || !userId) {
    console.error('Firestore 또는 userId가 없습니다.');
    return null;
  }

  try {
    // 사용자 문서 가져오기
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }
    
    const userData = userDoc.data();
    const userName = userData.userName || userData.userId || `사용자 ${userId}`;
    
    // 각 서브컬렉션에서 데이터 가져오기
    const [difficultSentences, savedPassages, wrongQuestions] = await Promise.all([
      getDifficultSentencesForUser(userId),
      getSavedPassagesForUser(userId),
      getWrongQuestionsForUser(userId)
    ]);
    
    return {
      userId,
      userName,
      difficultSentences,
      savedPassages,
      wrongQuestions
    };
  } catch (error) {
    console.error(`Firestore에서 사용자 ${userId} 데이터 가져오기 실패:`, error);
    return null;
  }
}