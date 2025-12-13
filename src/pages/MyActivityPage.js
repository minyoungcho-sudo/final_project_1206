import { getDifficultSentences, deleteDifficultSentence, getSavedPassages, deleteSavedPassage, getWrongQuestions, deleteWrongQuestion, updateLastAccess, getLastAccess, getContinuousDays } from '../utils/activityStorage.js';

export function renderMyActivityPage() {
  return `
    <div class="my-activity-layout min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <!-- 사이드바 메뉴 -->
      <div id="sidebar-menu" class="fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-xl transform -translate-x-full transition-transform duration-300 ease-in-out border-r border-gray-200 dark:border-gray-700">
        <div class="flex flex-col h-full">
          <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">메뉴</h3>
            <button id="close-sidebar-btn" class="icon-btn" aria-label="close">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <nav class="flex-1 p-4">
            <ul class="space-y-2">
              <li>
                <button id="menu-item-analysis" class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <span class="material-symbols-outlined">description</span>
                  <span>지문 분석 활동</span>
                </button>
              </li>
              <li>
                <button id="menu-item-activity" class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 font-medium">
                  <span class="material-symbols-outlined">history</span>
                  <span>내 활동 기록</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      
      <!-- 사이드바 오버레이 -->
      <div id="sidebar-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-[25] hidden"></div>

      <header class="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <button id="menu-btn" class="icon-btn" aria-label="menu"><span class="material-symbols-outlined">menu</span></button>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">내 활동 기록</h2>
        <button id="profile-icon-btn" class="icon-btn" aria-label="profile"><span class="material-symbols-outlined">person</span></button>
      </header>

      <div class="flex w-full min-h-[calc(100vh-73px)]">
        <!-- 좌측: 학생 정보 패널 (고정 너비) -->
        <div class="hidden lg:block w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div class="sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto">
            <div class="p-6">
              <div id="student-info-panel" class="space-y-6">
                <!-- 학생 이름 -->
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span class="material-symbols-outlined text-white text-xl">person</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">학생 이름</p>
                    <p id="student-name" class="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">로딩 중...</p>
                  </div>
                </div>
                
                <!-- 마지막 접속 -->
                <div class="flex items-start gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div class="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <span class="material-symbols-outlined text-white text-xl">schedule</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">마지막 접속</p>
                    <p id="last-access" class="text-base font-medium text-gray-900 dark:text-gray-100">로딩 중...</p>
                  </div>
                </div>
                
                <!-- 연속 학습일 -->
                <div class="flex items-start gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div class="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <span class="material-symbols-outlined text-white text-xl">calendar_month</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">연속 학습일</p>
                    <p id="continuous-days" class="text-base font-medium text-gray-900 dark:text-gray-100">로딩 중...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 우측: 콘텐츠 영역 -->
        <div class="flex-1 min-w-0">
          <div class="max-w-6xl mx-auto px-6 py-8">
            <!-- 모바일: 학생 정보 (상단에 표시) -->
            <div class="lg:hidden mb-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div class="grid grid-cols-3 gap-4">
                <div class="text-center">
                  <div class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mb-2">
                    <span class="material-symbols-outlined text-white text-lg">person</span>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">학생 이름</p>
                  <p id="student-name-mobile" class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">-</p>
                </div>
                <div class="text-center">
                  <div class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-2">
                    <span class="material-symbols-outlined text-white text-lg">schedule</span>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">마지막 접속</p>
                  <p id="last-access-mobile" class="text-sm font-medium text-gray-900 dark:text-gray-100">-</p>
                </div>
                <div class="text-center">
                  <div class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 mb-2">
                    <span class="material-symbols-outlined text-white text-lg">calendar_month</span>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">연속 학습일</p>
                  <p id="continuous-days-mobile" class="text-sm font-medium text-gray-900 dark:text-gray-100">-</p>
                </div>
              </div>
            </div>
            
        <!-- 탭 네비게이션 -->
        <div class="mb-8">
          <div class="border-b border-gray-200 dark:border-gray-700">
            <nav class="flex space-x-8">
              <button id="tab-difficult" class="tab-button active py-4 px-1 border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 font-medium">
                어려운 문장
              </button>
              <button id="tab-passages" class="tab-button py-4 px-1 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium">
                저장한 지문
              </button>
              <button id="tab-wrong" class="tab-button py-4 px-1 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium">
                틀린 문제
              </button>
            </nav>
          </div>
        </div>

        <!-- 어려운 문장 탭 -->
        <div id="content-difficult" class="tab-content">
          <div class="mb-6">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">어려운 문장</h3>
            <p class="text-gray-600 dark:text-gray-400">분석 중 어려웠던 문장들을 확인하세요.</p>
          </div>
          <div id="difficult-sentences-list" class="space-y-4">
            <!-- 동적으로 추가됨 -->
          </div>
        </div>

        <!-- 저장한 지문 탭 -->
        <div id="content-passages" class="tab-content hidden">
          <div class="mb-6">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">저장한 지문</h3>
            <p class="text-gray-600 dark:text-gray-400">중요한 지문들을 모아보세요.</p>
          </div>
          <div id="saved-passages-list" class="space-y-4">
            <!-- 동적으로 추가됨 -->
          </div>
        </div>

        <!-- 틀린 문제 탭 -->
        <div id="content-wrong" class="tab-content hidden">
          <div class="mb-6">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">틀린 문제</h3>
            <p class="text-gray-600 dark:text-gray-400">다시 복습하고 싶은 문제들을 확인하세요.</p>
          </div>
          <div id="wrong-questions-list" class="space-y-4">
            <!-- 동적으로 추가됨 -->
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function setupMyActivityPage() {
  // 탭 전환
  const tabButtons = {
    difficult: document.getElementById('tab-difficult'),
    passages: document.getElementById('tab-passages'),
    wrong: document.getElementById('tab-wrong')
  };
  
  const tabContents = {
    difficult: document.getElementById('content-difficult'),
    passages: document.getElementById('content-passages'),
    wrong: document.getElementById('content-wrong')
  };

  Object.keys(tabButtons).forEach(tab => {
    const button = tabButtons[tab];
    if (button) {
      button.addEventListener('click', () => {
        // 모든 탭 비활성화
        Object.values(tabButtons).forEach(btn => {
          if (btn) {
            btn.classList.remove('active', 'border-blue-600', 'text-blue-600', 'dark:text-blue-400');
            btn.classList.add('border-transparent', 'text-gray-500', 'dark:text-gray-400');
          }
        });
        Object.values(tabContents).forEach(content => {
          if (content) content.classList.add('hidden');
        });

        // 선택한 탭 활성화
        button.classList.add('active', 'border-blue-600', 'text-blue-600', 'dark:text-blue-400');
        button.classList.remove('border-transparent', 'text-gray-500', 'dark:text-gray-400');
        if (tabContents[tab]) {
          tabContents[tab].classList.remove('hidden');
        }

        // 콘텐츠 로드
        loadTabContent(tab);
      });
    }
  });

  // 메뉴 버튼
  const menuBtn = document.getElementById('menu-btn');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      if (window.toggleSidebar) {
        window.toggleSidebar();
      }
    });
  }

  // 사이드바 메뉴 항목 이벤트
  const menuItemAnalysis = document.getElementById('menu-item-analysis');
  if (menuItemAnalysis) {
    menuItemAnalysis.addEventListener('click', () => {
      if (window.toggleSidebar) {
        window.toggleSidebar();
      }
      if (window.navigateToPage) {
        window.navigateToPage('input');
      }
    });
  }

  const menuItemActivity = document.getElementById('menu-item-activity');
  if (menuItemActivity) {
    // 이미 활동 기록 페이지에 있으므로 아무 동작 안 함
  }

  // 사이드바 닫기 버튼
  const closeSidebarBtn = document.getElementById('close-sidebar-btn');
  if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener('click', () => {
      if (window.toggleSidebar) {
        window.toggleSidebar();
      }
    });
  }

  // 사이드바 오버레이 클릭 시 닫기
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
      if (window.toggleSidebar) {
        window.toggleSidebar();
      }
    });
  }

  // 프로필 아이콘
  const profileIconBtn = document.getElementById('profile-icon-btn');
  if (profileIconBtn) {
    profileIconBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.toggleProfileDropdown) {
        window.toggleProfileDropdown();
        profileIconBtn.classList.toggle('active');
      }
    });
  }

  // 초기 로드
  loadTabContent('difficult');
  
  // 학생 정보 로드
  loadStudentInfo();
  
  // 마지막 접속 시간 업데이트
  updateLastAccess();
}

// 학생 정보 로드
function loadStudentInfo() {
  const studentName = localStorage.getItem('currentUserName') || '사용자';
  const lastAccess = getLastAccess();
  const continuousDays = getContinuousDays();
  
  // 마지막 접속 시간 포맷팅
  let timeText = '기록 없음';
  if (lastAccess) {
    try {
      const date = new Date(lastAccess);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffMins < 1) {
        timeText = '방금 전';
      } else if (diffMins < 60) {
        timeText = `${diffMins}분 전`;
      } else if (diffHours < 24) {
        timeText = `${diffHours}시간 전`;
      } else if (diffDays === 1) {
        timeText = '어제';
      } else if (diffDays < 7) {
        timeText = `${diffDays}일 전`;
      } else {
        timeText = date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    } catch (error) {
      console.error('마지막 접속 시간 파싱 오류:', error);
      timeText = '알 수 없음';
    }
  }
  
  // 연속 학습일 포맷팅
  const daysText = continuousDays > 0 ? `${continuousDays}일` : '0일';
  
  // 데스크톱 버전 업데이트
  const studentNameEl = document.getElementById('student-name');
  if (studentNameEl) studentNameEl.textContent = studentName;
  
  const lastAccessEl = document.getElementById('last-access');
  if (lastAccessEl) lastAccessEl.textContent = timeText;
  
  const continuousDaysEl = document.getElementById('continuous-days');
  if (continuousDaysEl) continuousDaysEl.textContent = daysText;
  
  // 모바일 버전 업데이트
  const studentNameMobileEl = document.getElementById('student-name-mobile');
  if (studentNameMobileEl) studentNameMobileEl.textContent = studentName;
  
  const lastAccessMobileEl = document.getElementById('last-access-mobile');
  if (lastAccessMobileEl) lastAccessMobileEl.textContent = timeText;
  
  const continuousDaysMobileEl = document.getElementById('continuous-days-mobile');
  if (continuousDaysMobileEl) continuousDaysMobileEl.textContent = daysText;
}

function loadTabContent(tab) {
  switch (tab) {
    case 'difficult':
      loadDifficultSentences();
      break;
    case 'passages':
      loadSavedPassages();
      break;
    case 'wrong':
      loadWrongQuestions();
      break;
  }
}

function loadDifficultSentences() {
  const container = document.getElementById('difficult-sentences-list');
  if (!container) return;

  const sentences = getDifficultSentences();
  
  if (sentences.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <span class="material-symbols-outlined text-gray-400 text-6xl mb-4">inbox</span>
        <p class="text-gray-500 dark:text-gray-400">저장된 어려운 문장이 없습니다.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = sentences.map(s => `
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <p class="text-gray-900 dark:text-gray-100 font-medium mb-2">${escapeHtml(s.sentence)}</p>
          ${s.translation ? `<p class="text-gray-600 dark:text-gray-400 text-sm mb-2">${escapeHtml(s.translation)}</p>` : ''}
          ${s.analysis?.structure ? `<p class="text-sm text-blue-600 dark:text-blue-400 mb-2">${escapeHtml(s.analysis.structure)}</p>` : ''}
        </div>
        <button class="delete-sentence-btn ml-4 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" data-id="${s.id}">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
      <p class="text-xs text-gray-400 dark:text-gray-500">저장일: ${formatDate(s.savedAt)}</p>
    </div>
  `).join('');

  // 삭제 버튼 이벤트
  container.querySelectorAll('.delete-sentence-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('이 문장을 삭제하시겠습니까?')) {
        deleteDifficultSentence(id);
        loadDifficultSentences();
      }
    });
  });
}

function loadSavedPassages() {
  const container = document.getElementById('saved-passages-list');
  if (!container) return;

  const passages = getSavedPassages();
  
  if (passages.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <span class="material-symbols-outlined text-gray-400 text-6xl mb-4">inbox</span>
        <p class="text-gray-500 dark:text-gray-400">저장된 지문이 없습니다.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = passages.map(p => `
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <div class="mb-3">
            <p class="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">${escapeHtml(p.passage)}</p>
          </div>
          ${p.contentAnalysis?.mainIdea ? `
            <div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 class="font-semibold text-blue-900 dark:text-blue-100 mb-2">주제</h4>
              <p class="text-sm text-blue-800 dark:text-blue-200">${escapeHtml(p.contentAnalysis.mainIdea)}</p>
            </div>
          ` : ''}
        </div>
        <button class="delete-passage-btn ml-4 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" data-id="${p.id}">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
      <p class="text-xs text-gray-400 dark:text-gray-500">저장일: ${formatDate(p.savedAt)}</p>
    </div>
  `).join('');

  // 삭제 버튼 이벤트
  container.querySelectorAll('.delete-passage-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('이 지문을 삭제하시겠습니까?')) {
        deleteSavedPassage(id);
        loadSavedPassages();
      }
    });
  });
}

function loadWrongQuestions() {
  const container = document.getElementById('wrong-questions-list');
  if (!container) return;

  const questions = getWrongQuestions();
  
  if (questions.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <span class="material-symbols-outlined text-gray-400 text-6xl mb-4">inbox</span>
        <p class="text-gray-500 dark:text-gray-400">저장된 틀린 문제가 없습니다.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = questions.map(q => `
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <div class="mb-3">
            <span class="inline-block px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs font-medium rounded mb-2">
              ${q.questionType || '문제'}
            </span>
            <p class="text-gray-900 dark:text-gray-100 font-medium mb-3">${escapeHtml(q.question.question)}</p>
            ${q.question.options ? `
              <div class="space-y-2 mb-3">
                ${Object.entries(q.question.options).map(([key, value]) => `
                  <div class="flex items-center gap-2">
                    <span class="font-medium ${q.correctAnswer === key ? 'text-green-600 dark:text-green-400' : q.selectedAnswer === key ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}">${key}.</span>
                    <span class="${q.correctAnswer === key ? 'text-green-600 dark:text-green-400 font-medium' : q.selectedAnswer === key ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}">${escapeHtml(value)}</span>
                    ${q.correctAnswer === key ? '<span class="text-xs text-green-600 dark:text-green-400">(정답)</span>' : ''}
                    ${q.selectedAnswer === key && q.correctAnswer !== key ? '<span class="text-xs text-red-600 dark:text-red-400">(선택한 답)</span>' : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}
            ${q.explanation?.correctAnswerExplanation ? `
              <div class="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 class="font-semibold text-green-900 dark:text-green-100 mb-2">정답 설명</h4>
                <p class="text-sm text-green-800 dark:text-green-200">${escapeHtml(q.explanation.correctAnswerExplanation)}</p>
              </div>
            ` : ''}
          </div>
        </div>
        <button class="delete-question-btn ml-4 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" data-id="${q.id}">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
      <p class="text-xs text-gray-400 dark:text-gray-500">저장일: ${formatDate(q.savedAt)}</p>
    </div>
  `).join('');

  // 삭제 버튼 이벤트
  container.querySelectorAll('.delete-question-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('이 문제를 삭제하시겠습니까?')) {
        deleteWrongQuestion(id);
        loadWrongQuestions();
      }
    });
  });
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

