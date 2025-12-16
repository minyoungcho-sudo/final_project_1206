// 활동 기록 저장 및 불러오기 유틸리티 (Firestore 기반)
import { db } from '../firebaseConfig.js';
import { collection, doc, setDoc, updateDoc, getDocs, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

// 현재 사용자 UID 가져오기
function getCurrentUserId() {
  const currentUser = window.currentUser ? window.currentUser() : null;
  return currentUser?.uid || null;
}

// 사용자 문서 참조 가져오기
function getUserDocRef(userId) {
  if (!db || !userId) return null;
  return doc(db, 'users', userId);
}

// 마지막 접속 시간 업데이트
export async function updateLastAccess() {
  const userId = getCurrentUserId();
  if (!db || !userId) return;
  
  try {
    const userRef = getUserDocRef(userId);
    if (!userRef) return; // userRef가 null이면 조기 반환
    
    await updateDoc(userRef, {
      lastAccess: serverTimestamp(),
      updatedAt: serverTimestamp()
    }).catch(async (error) => {
      if (error.code === 'not-found') {
        // 사용자 문서가 없으면 생성
        const currentUser = window.currentUser ? window.currentUser() : null;
        await setDoc(userRef, {
          userId,
          userName: currentUser?.displayName || currentUser?.email || '사용자',
          lastAccess: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    });
  } catch (error) {
    console.error('Firestore에 마지막 접속 시간 저장 실패:', error);
  }
}

// 연속 학습일 업데이트
async function updateContinuousDays() {
  const userId = getCurrentUserId();
  if (!db || !userId) return;
  
  try {
    const userRef = getUserDocRef(userId);
    if (!userRef) return; // userRef가 null이면 조기 반환
    const userDoc = await getDoc(userRef);
    
    const today = new Date().toDateString();
    let currentContinuousDays = 0;
    let lastActivityDate = null;
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      currentContinuousDays = userData.continuousDays || 0;
      if (userData.lastActivityDate) {
        lastActivityDate = userData.lastActivityDate.toDate ? userData.lastActivityDate.toDate().toDateString() : null;
      }
    }
    
    if (!lastActivityDate) {
      // 첫 활동
      await updateDoc(userRef, {
        continuousDays: 1,
        lastActivityDate: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } else if (lastActivityDate === today) {
      // 오늘 이미 활동함 - 변경 없음
    } else {
      const lastDate = new Date(lastActivityDate);
      const todayDate = new Date(today);
      const diffTime = todayDate - lastDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // 연속 - 하루 증가
        await updateDoc(userRef, {
          continuousDays: currentContinuousDays + 1,
          lastActivityDate: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        // 불연속 - 초기화
        await updateDoc(userRef, {
          continuousDays: 1,
          lastActivityDate: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    }
  } catch (error) {
    console.error('Firestore에 연속 학습일 업데이트 실패:', error);
  }
}

// 마지막 접속 시간 가져오기
export async function getLastAccess() {
  const userId = getCurrentUserId();
  if (!db || !userId) return null;
  
  try {
    const userRef = getUserDocRef(userId);
    if (!userRef) return null;
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.lastAccess) {
        return userData.lastAccess.toDate ? userData.lastAccess.toDate().toISOString() : null;
      }
    }
    return null;
  } catch (error) {
    console.error('Firestore에서 마지막 접속 시간 가져오기 실패:', error);
    return null;
  }
}

// 연속 학습일 가져오기
export async function getContinuousDays() {
  const userId = getCurrentUserId();
  if (!db || !userId) return 0;
  
  try {
    const userRef = getUserDocRef(userId);
    if (!userRef) return 0;
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.continuousDays || 0;
    }
    return 0;
  } catch (error) {
    console.error('Firestore에서 연속 학습일 가져오기 실패:', error);
    return 0;
  }
}

// 어려운 문장 저장
export async function saveDifficultSentence(sentence, analysis, translation) {
  const userId = getCurrentUserId();
  if (!db || !userId) {
    throw new Error('로그인이 필요합니다.');
  }
  
  const currentUser = window.currentUser ? window.currentUser() : null;
  const userName = currentUser?.displayName || currentUser?.email || '사용자';
  
  try {
    const sentenceId = Date.now().toString();
    const sentenceRef = doc(db, 'users', userId, 'difficultSentences', sentenceId);
    
    await setDoc(sentenceRef, {
      userId,
      userName,
      sentence,
      analysis: analysis || null,
      translation: translation || '',
      savedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    
    // 사용자 문서 업데이트
    const userRef = getUserDocRef(userId);
    await updateDoc(userRef, {
      userName,
      updatedAt: serverTimestamp()
    }).catch(async (error) => {
      if (error.code === 'not-found') {
        await setDoc(userRef, {
          userId,
          userName,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    });
    
    // 연속 학습일 업데이트
    await updateContinuousDays();
    
    return {
      id: sentenceId,
      userId,
      userName,
      sentence,
      analysis,
      translation,
      savedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Firestore에 어려운 문장 저장 실패:', error);
    throw error;
  }
}

// 어려운 문장 목록 불러오기
export async function getDifficultSentences() {
  const userId = getCurrentUserId();
  if (!db || !userId) return [];
  
  try {
    const sentencesRef = collection(db, 'users', userId, 'difficultSentences');
    const sentencesSnapshot = await getDocs(sentencesRef);
    
    const sentences = [];
    sentencesSnapshot.forEach((doc) => {
      const data = doc.data();
      sentences.push({
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        sentence: data.sentence,
        analysis: data.analysis,
        translation: data.translation,
        savedAt: data.savedAt?.toDate?.()?.toISOString() || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      });
    });
    
    // savedAt 기준으로 정렬 (최신순)
    sentences.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    
    return sentences;
  } catch (error) {
    console.error('Firestore에서 어려운 문장 가져오기 실패:', error);
    return [];
  }
}

// 어려운 문장 삭제
export async function deleteDifficultSentence(id) {
  const userId = getCurrentUserId();
  if (!db || !userId) {
    throw new Error('로그인이 필요합니다.');
  }
  
  try {
    const sentenceRef = doc(db, 'users', userId, 'difficultSentences', id);
    await deleteDoc(sentenceRef);
  } catch (error) {
    console.error('Firestore에서 어려운 문장 삭제 실패:', error);
    throw error;
  }
}

// 지문 저장
export async function savePassage(passage, contentAnalysis) {
  const userId = getCurrentUserId();
  if (!db || !userId) {
    throw new Error('로그인이 필요합니다.');
  }
  
  const currentUser = window.currentUser ? window.currentUser() : null;
  const userName = currentUser?.displayName || currentUser?.email || '사용자';
  
  try {
    const passageId = Date.now().toString();
    const passageRef = doc(db, 'users', userId, 'savedPassages', passageId);
    
    await setDoc(passageRef, {
      userId,
      userName,
      passage,
      contentAnalysis: contentAnalysis || null,
      savedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    
    // 사용자 문서 업데이트
    const userRef = getUserDocRef(userId);
    await updateDoc(userRef, {
      userName,
      updatedAt: serverTimestamp()
    }).catch(async (error) => {
      if (error.code === 'not-found') {
        await setDoc(userRef, {
          userId,
          userName,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    });
    
    // 연속 학습일 업데이트
    await updateContinuousDays();
    
    return {
      id: passageId,
      userId,
      userName,
      passage,
      contentAnalysis,
      savedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Firestore에 지문 저장 실패:', error);
    throw error;
  }
}

// 저장된 지문 목록 불러오기
export async function getSavedPassages() {
  const userId = getCurrentUserId();
  if (!db || !userId) return [];
  
  try {
    const passagesRef = collection(db, 'users', userId, 'savedPassages');
    const passagesSnapshot = await getDocs(passagesRef);
    
    const passages = [];
    passagesSnapshot.forEach((doc) => {
      const data = doc.data();
      passages.push({
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        passage: data.passage,
        contentAnalysis: data.contentAnalysis,
        savedAt: data.savedAt?.toDate?.()?.toISOString() || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      });
    });
    
    // savedAt 기준으로 정렬 (최신순)
    passages.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    
    return passages;
  } catch (error) {
    console.error('Firestore에서 저장된 지문 가져오기 실패:', error);
    return [];
  }
}

// 지문 삭제
export async function deleteSavedPassage(id) {
  const userId = getCurrentUserId();
  if (!db || !userId) {
    throw new Error('로그인이 필요합니다.');
  }
  
  try {
    const passageRef = doc(db, 'users', userId, 'savedPassages', id);
    await deleteDoc(passageRef);
  } catch (error) {
    console.error('Firestore에서 지문 삭제 실패:', error);
    throw error;
  }
}

// 틀린 문제 저장
export async function saveWrongQuestion(question, selectedAnswer, correctAnswer, explanation, questionType) {
  const userId = getCurrentUserId();
  if (!db || !userId) {
    throw new Error('로그인이 필요합니다.');
  }
  
  const currentUser = window.currentUser ? window.currentUser() : null;
  const userName = currentUser?.displayName || currentUser?.email || '사용자';
  
  try {
    const questionId = Date.now().toString();
    const questionRef = doc(db, 'users', userId, 'wrongQuestions', questionId);
    
    await setDoc(questionRef, {
      userId,
      userName,
      question,
      selectedAnswer,
      correctAnswer,
      explanation,
      questionType,
      savedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    
    // 사용자 문서 업데이트
    const userRef = getUserDocRef(userId);
    await updateDoc(userRef, {
      userName,
      updatedAt: serverTimestamp()
    }).catch(async (error) => {
      if (error.code === 'not-found') {
        await setDoc(userRef, {
          userId,
          userName,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    });
    
    // 연속 학습일 업데이트
    await updateContinuousDays();
    
    return {
      id: questionId,
      userId,
      userName,
      question,
      selectedAnswer,
      correctAnswer,
      explanation,
      questionType,
      savedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Firestore에 틀린 문제 저장 실패:', error);
    throw error;
  }
}

// 틀린 문제 목록 불러오기
export async function getWrongQuestions() {
  const userId = getCurrentUserId();
  if (!db || !userId) return [];
  
  try {
    const questionsRef = collection(db, 'users', userId, 'wrongQuestions');
    const questionsSnapshot = await getDocs(questionsRef);
    
    const questions = [];
    questionsSnapshot.forEach((doc) => {
      const data = doc.data();
      questions.push({
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        question: data.question,
        selectedAnswer: data.selectedAnswer,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation,
        questionType: data.questionType,
        savedAt: data.savedAt?.toDate?.()?.toISOString() || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      });
    });
    
    // savedAt 기준으로 정렬 (최신순)
    questions.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    
    return questions;
  } catch (error) {
    console.error('Firestore에서 틀린 문제 가져오기 실패:', error);
    return [];
  }
}

// 틀린 문제 삭제
export async function deleteWrongQuestion(id) {
  const userId = getCurrentUserId();
  if (!db || !userId) {
    throw new Error('로그인이 필요합니다.');
  }
  
  try {
    const questionRef = doc(db, 'users', userId, 'wrongQuestions', id);
    await deleteDoc(questionRef);
  } catch (error) {
    console.error('Firestore에서 틀린 문제 삭제 실패:', error);
    throw error;
  }
}
