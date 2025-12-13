// 활동 기록 저장 및 불러오기 유틸리티

const STORAGE_KEYS = {
  DIFFICULT_SENTENCES: 'difficult_sentences',
  SAVED_PASSAGES: 'saved_passages',
  WRONG_QUESTIONS: 'wrong_questions',
  LAST_ACCESS: 'last_access',
  CONTINUOUS_DAYS: 'continuous_days',
  LAST_ACTIVITY_DATE: 'last_activity_date'
};

// 마지막 접속 시간 업데이트
export function updateLastAccess() {
  const now = new Date().toISOString();
  localStorage.setItem(STORAGE_KEYS.LAST_ACCESS, now);
}

// 연속 학습일 업데이트
function updateContinuousDays() {
  const today = new Date().toDateString();
  const lastActivityDate = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY_DATE);
  const currentContinuousDays = parseInt(localStorage.getItem(STORAGE_KEYS.CONTINUOUS_DAYS) || '0', 10);
  
  if (!lastActivityDate) {
    // 첫 활동
    localStorage.setItem(STORAGE_KEYS.CONTINUOUS_DAYS, '1');
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY_DATE, today);
  } else if (lastActivityDate === today) {
    // 오늘 이미 활동함 - 변경 없음
  } else {
    const lastDate = new Date(lastActivityDate);
    const todayDate = new Date(today);
    const diffTime = todayDate - lastDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // 연속 - 하루 증가
      localStorage.setItem(STORAGE_KEYS.CONTINUOUS_DAYS, (currentContinuousDays + 1).toString());
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY_DATE, today);
    } else {
      // 불연속 - 초기화
      localStorage.setItem(STORAGE_KEYS.CONTINUOUS_DAYS, '1');
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY_DATE, today);
    }
  }
}

// 마지막 접속 시간 가져오기
export function getLastAccess() {
  const lastAccess = localStorage.getItem(STORAGE_KEYS.LAST_ACCESS);
  return lastAccess || null;
}

// 연속 학습일 가져오기
export function getContinuousDays() {
  return parseInt(localStorage.getItem(STORAGE_KEYS.CONTINUOUS_DAYS) || '0', 10);
}

// 어려운 문장 저장
export function saveDifficultSentence(sentence, analysis, translation) {
  const sentences = getDifficultSentences();
  const newEntry = {
    id: Date.now().toString(),
    sentence,
    analysis,
    translation,
    savedAt: new Date().toISOString()
  };
  sentences.unshift(newEntry); // 최신이 위로
  localStorage.setItem(STORAGE_KEYS.DIFFICULT_SENTENCES, JSON.stringify(sentences));
  updateContinuousDays(); // 연속 학습일 업데이트
  return newEntry;
}

// 어려운 문장 목록 불러오기
export function getDifficultSentences() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DIFFICULT_SENTENCES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load difficult sentences:', error);
    return [];
  }
}

// 어려운 문장 삭제
export function deleteDifficultSentence(id) {
  const sentences = getDifficultSentences();
  const filtered = sentences.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.DIFFICULT_SENTENCES, JSON.stringify(filtered));
}

// 지문 저장
export function savePassage(passage, contentAnalysis) {
  const passages = getSavedPassages();
  
  // 현재 사용자 정보 가져오기
  const currentUser = window.currentUser ? window.currentUser() : null;
  const userId = currentUser?.uid || localStorage.getItem('currentUserId') || 'current';
  const userName = currentUser?.displayName || currentUser?.email || localStorage.getItem('currentUserName') || '사용자';
  
  // 사용자 정보 저장
  if (!localStorage.getItem('currentUserId')) {
    localStorage.setItem('currentUserId', userId);
  }
  if (!localStorage.getItem('currentUserName')) {
    localStorage.setItem('currentUserName', userName);
  }
  
  const newEntry = {
    id: Date.now().toString(),
    userId,
    userName,
    passage,
    contentAnalysis,
    savedAt: new Date().toISOString()
  };
  passages.unshift(newEntry);
  localStorage.setItem(STORAGE_KEYS.SAVED_PASSAGES, JSON.stringify(passages));
  updateContinuousDays(); // 연속 학습일 업데이트
  return newEntry;
}

// 저장된 지문 목록 불러오기
export function getSavedPassages() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SAVED_PASSAGES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load saved passages:', error);
    return [];
  }
}

// 지문 삭제
export function deleteSavedPassage(id) {
  const passages = getSavedPassages();
  const filtered = passages.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.SAVED_PASSAGES, JSON.stringify(filtered));
}

// 틀린 문제 저장
export function saveWrongQuestion(question, selectedAnswer, correctAnswer, explanation, questionType) {
  const questions = getWrongQuestions();
  
  // 현재 사용자 정보 가져오기
  const currentUser = window.currentUser ? window.currentUser() : null;
  const userId = currentUser?.uid || localStorage.getItem('currentUserId') || 'current';
  const userName = currentUser?.displayName || currentUser?.email || localStorage.getItem('currentUserName') || '사용자';
  
  // 사용자 정보 저장
  if (!localStorage.getItem('currentUserId')) {
    localStorage.setItem('currentUserId', userId);
  }
  if (!localStorage.getItem('currentUserName')) {
    localStorage.setItem('currentUserName', userName);
  }
  
  const newEntry = {
    id: Date.now().toString(),
    userId,
    userName,
    question,
    selectedAnswer,
    correctAnswer,
    explanation,
    questionType,
    savedAt: new Date().toISOString()
  };
  questions.unshift(newEntry);
  localStorage.setItem(STORAGE_KEYS.WRONG_QUESTIONS, JSON.stringify(questions));
  updateContinuousDays(); // 연속 학습일 업데이트
  return newEntry;
}

// 틀린 문제 목록 불러오기
export function getWrongQuestions() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.WRONG_QUESTIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load wrong questions:', error);
    return [];
  }
}

// 틀린 문제 삭제
export function deleteWrongQuestion(id) {
  const questions = getWrongQuestions();
  const filtered = questions.filter(q => q.id !== id);
  localStorage.setItem(STORAGE_KEYS.WRONG_QUESTIONS, JSON.stringify(filtered));
}

