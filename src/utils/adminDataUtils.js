// 관리자 페이지용 데이터 유틸리티
// 사용자 데이터를 날짜별로 필터링하고 관리하는 함수들

// 모든 사용자 데이터 가져오기 (로컬스토리지에서)
// 현재는 localStorage에 사용자 ID를 키로 저장하는 방식
// 나중에 Firebase로 확장 가능

// 사용자별로 저장된 모든 활동 데이터 가져오기
export function getAllUsersActivityData() {
  // localStorage의 모든 키를 확인하여 사용자 데이터 찾기
  const users = [];
  const storageKeys = Object.keys(localStorage);
  
  // 사용자별 키 패턴: `user_${userId}_difficult_sentences`, `user_${userId}_saved_passages`, etc.
  const userPattern = /^user_(.+)_(difficult_sentences|saved_passages|wrong_questions)$/;
  const userMap = new Map();
  
  storageKeys.forEach(key => {
    const match = key.match(userPattern);
    if (match) {
      const userId = match[1];
      const dataType = match[2];
      
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          userId,
          difficultSentences: [],
          savedPassages: [],
          wrongQuestions: []
        });
      }
      
      try {
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        userMap.get(userId)[dataType === 'difficult_sentences' ? 'difficultSentences' :
                          dataType === 'saved_passages' ? 'savedPassages' : 'wrongQuestions'] = data;
      } catch (error) {
        console.error(`Failed to parse data for ${key}:`, error);
      }
    }
  });
  
  // 현재 사용자의 데이터도 추가 (기존 localStorage 키 사용)
  const currentUserId = localStorage.getItem('currentUserId') || 'current';
  const currentUserName = localStorage.getItem('currentUserName') || '현재 사용자';
  
  // 현재 사용자의 데이터 (모든 데이터를 가져온 후 필터링)
  const allDifficultSentences = JSON.parse(localStorage.getItem('difficult_sentences') || '[]');
  const allSavedPassages = JSON.parse(localStorage.getItem('saved_passages') || '[]');
  const allWrongQuestions = JSON.parse(localStorage.getItem('wrong_questions') || '[]');
  
  users.push({
    userId: currentUserId,
    userName: currentUserName,
    difficultSentences: allDifficultSentences.filter(s => s.userId === currentUserId),
    savedPassages: allSavedPassages.filter(p => p.userId === currentUserId),
    wrongQuestions: allWrongQuestions.filter(q => q.userId === currentUserId)
  });
  
  // 다른 사용자들도 추가
  userMap.forEach((data, userId) => {
    if (userId !== currentUserId) {
      const userName = localStorage.getItem(`user_${userId}_name`) || `사용자 ${userId}`;
      users.push({
        userId,
        userName,
        ...data
      });
    }
  });
  
  return users;
}

// 날짜별로 필터링된 사용자 데이터 가져오기
export function getUsersByDate(selectedDate) {
  const allUsers = getAllUsersActivityData();
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
export function getAvailableDates() {
  const allUsers = getAllUsersActivityData();
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
export function getUserData(userId) {
  const allUsers = getAllUsersActivityData();
  return allUsers.find(user => user.userId === userId);
}




