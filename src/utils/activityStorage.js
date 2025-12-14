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
  // 저장 시에는 모든 데이터 가져오기 (필터링 없이)
  const allSentences = getAllDifficultSentences();
  
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
    sentence,
    analysis,
    translation,
    savedAt: new Date().toISOString()
  };
  allSentences.unshift(newEntry); // 최신이 위로
  localStorage.setItem(STORAGE_KEYS.DIFFICULT_SENTENCES, JSON.stringify(allSentences));
  updateContinuousDays(); // 연속 학습일 업데이트
  return newEntry;
}

// 모든 어려운 문장 목록 불러오기 (필터링 없이 - 내부용)
function getAllDifficultSentences() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DIFFICULT_SENTENCES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load difficult sentences:', error);
    return [];
  }
}

// 어려운 문장 목록 불러오기 (현재 사용자만)
export function getDifficultSentences(userId = null) {
  const allSentences = getAllDifficultSentences();
  
  // userId가 제공되지 않으면 현재 사용자의 데이터만 반환
  if (!userId) {
    const currentUserId = localStorage.getItem('currentUserId') || 'current';
    // 현재 사용자의 데이터만 반환 (userId가 없는 오래된 데이터는 제외)
    return allSentences.filter(s => s.userId === currentUserId);
  }
  
  // 특정 사용자의 데이터 반환
  return allSentences.filter(s => s.userId === userId);
}

// 어려운 문장 삭제
export function deleteDifficultSentence(id) {
  const allSentences = getAllDifficultSentences();
  const filtered = allSentences.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.DIFFICULT_SENTENCES, JSON.stringify(filtered));
}

// 지문 저장
export function savePassage(passage, contentAnalysis) {
  // 저장 시에는 모든 데이터 가져오기 (필터링 없이)
  const allPassages = getAllSavedPassages();
  
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
  allPassages.unshift(newEntry);
  localStorage.setItem(STORAGE_KEYS.SAVED_PASSAGES, JSON.stringify(allPassages));
  updateContinuousDays(); // 연속 학습일 업데이트
  return newEntry;
}

// 모든 저장된 지문 목록 불러오기 (필터링 없이 - 내부용)
function getAllSavedPassages() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SAVED_PASSAGES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load saved passages:', error);
    return [];
  }
}

// 저장된 지문 목록 불러오기 (현재 사용자만)
export function getSavedPassages(userId = null) {
  const allPassages = getAllSavedPassages();
  
  // userId가 제공되지 않으면 현재 사용자의 데이터만 반환
  if (!userId) {
    const currentUserId = localStorage.getItem('currentUserId') || 'current';
    // 현재 사용자의 데이터만 반환 (userId가 없는 오래된 데이터는 제외)
    return allPassages.filter(p => p.userId === currentUserId);
  }
  
  // 특정 사용자의 데이터 반환
  return allPassages.filter(p => p.userId === userId);
}

// 지문 삭제
export function deleteSavedPassage(id) {
  const allPassages = getAllSavedPassages();
  const filtered = allPassages.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.SAVED_PASSAGES, JSON.stringify(filtered));
}

// 틀린 문제 저장
export function saveWrongQuestion(question, selectedAnswer, correctAnswer, explanation, questionType) {
  // 저장 시에는 모든 데이터 가져오기 (필터링 없이)
  const allQuestions = getAllWrongQuestions();
  
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
  allQuestions.unshift(newEntry);
  localStorage.setItem(STORAGE_KEYS.WRONG_QUESTIONS, JSON.stringify(allQuestions));
  updateContinuousDays(); // 연속 학습일 업데이트
  return newEntry;
}

// 모든 틀린 문제 목록 불러오기 (필터링 없이 - 내부용)
function getAllWrongQuestions() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.WRONG_QUESTIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load wrong questions:', error);
    return [];
  }
}

// 틀린 문제 목록 불러오기 (현재 사용자만)
export function getWrongQuestions(userId = null) {
  const allQuestions = getAllWrongQuestions();
  
  // userId가 제공되지 않으면 현재 사용자의 데이터만 반환
  if (!userId) {
    const currentUserId = localStorage.getItem('currentUserId') || 'current';
    // 현재 사용자의 데이터만 반환 (userId가 없는 오래된 데이터는 제외)
    return allQuestions.filter(q => q.userId === currentUserId);
  }
  
  // 특정 사용자의 데이터 반환
  return allQuestions.filter(q => q.userId === userId);
}

// 틀린 문제 삭제
export function deleteWrongQuestion(id) {
  const allQuestions = getAllWrongQuestions();
  const filtered = allQuestions.filter(q => q.id !== id);
  localStorage.setItem(STORAGE_KEYS.WRONG_QUESTIONS, JSON.stringify(filtered));
}

