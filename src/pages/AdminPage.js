import { getAvailableDates, getUsersByDate, getUserData } from '../utils/adminDataUtils.js';

export function renderAdminPage() {
  return `
    <div class="admin-layout min-h-screen bg-[#f8fafc] dark:bg-[#0f172a]">
      <!-- 사이드바 메뉴 -->
      <div id="sidebar-menu" class="fixed inset-y-0 left-0 z-[60] w-64 bg-white dark:bg-[#1e293b] shadow-sm transform -translate-x-full transition-transform duration-300 ease-in-out border-r border-gray-200 dark:border-gray-800">
        <div class="flex flex-col h-full">
          <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <h3 class="text-lg font-black text-[#121417] dark:text-white font-display">메뉴</h3>
            <button id="close-sidebar-btn" class="icon-btn" aria-label="close">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <nav class="flex-1 p-4">
            <ul class="space-y-2">
              <li>
                <button id="menu-item-admin-main" class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 font-medium">
                  <span class="material-symbols-outlined">dashboard</span>
                  <span>사용자 활동 관리</span>
                </button>
              </li>
              <li>
                <button id="menu-item-admin-community" class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <span class="material-symbols-outlined">forum</span>
                  <span>커뮤니티 관리</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      
      <!-- 사이드바 오버레이 -->
      <div id="sidebar-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-[55] hidden"></div>

      <header class="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-[#f8fafc] dark:bg-[#1e293b] shadow-sm h-16">
        <div class="px-4 sm:px-10 h-full flex items-center justify-between">
          <button id="menu-btn" class="p-2 text-gray-600 dark:text-gray-300" aria-label="menu"><span class="material-symbols-outlined">menu</span></button>
          <h2 class="text-lg font-black text-[#121417] dark:text-white font-display">관리자 페이지</h2>
          <button id="profile-icon-btn" class="p-2 text-gray-600 dark:text-gray-300" aria-label="profile"><span class="material-symbols-outlined">person</span></button>
        </div>
      </header>

      <div class="flex h-[calc(100vh-64px)] overflow-hidden">
        <!-- 좌측 사이드바: 날짜 선택 및 사용자 목록 -->
        <div class="w-80 bg-white dark:bg-[#1e293b] border-r border-gray-100 dark:border-gray-800 flex flex-col">
          <!-- 날짜 선택 섹션 -->
          <div class="p-4 border-b border-gray-100 dark:border-gray-800">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">날짜 선택</h3>
            <select id="date-select" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">날짜를 선택하세요</option>
            </select>
          </div>

          <!-- 사용자 목록 섹션 -->
          <div class="flex-1 overflow-y-auto p-4">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">사용자 목록</h3>
            <div id="users-list" class="space-y-2">
              <div class="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                날짜를 선택하면 사용자 목록이 표시됩니다.
              </div>
            </div>
          </div>
        </div>

        <!-- 우측 메인 콘텐츠: 선택한 사용자의 상세 정보 -->
        <div class="flex-1 overflow-y-auto">
          <div class="max-w-6xl mx-auto p-6">
            <div id="user-detail-container">
              <div class="text-center py-16">
                <span class="material-symbols-outlined text-gray-400 text-6xl mb-4">person_search</span>
                <p class="text-gray-500 dark:text-gray-400 text-lg mb-2">사용자를 선택하세요</p>
                <p class="text-sm text-gray-400 dark:text-gray-500">좌측 목록에서 사용자를 클릭하면 상세 정보를 확인할 수 있습니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function setupAdminPage() {
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
  const menuItemAdminMain = document.getElementById('menu-item-admin-main');
  if (menuItemAdminMain) {
    menuItemAdminMain.addEventListener('click', () => {
      if (window.toggleSidebar) window.toggleSidebar();
      if (window.navigateToPage) window.navigateToPage('admin');
    });
  }

  const menuItemAdminCommunity = document.getElementById('menu-item-admin-community');
  if (menuItemAdminCommunity) {
    menuItemAdminCommunity.addEventListener('click', () => {
      if (window.toggleSidebar) window.toggleSidebar();
      if (window.navigateToPage) window.navigateToPage('admin-community');
    });
  }

  // 사이드바 닫기
  const closeSidebarBtn = document.getElementById('close-sidebar-btn');
  if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener('click', () => {
      if (window.toggleSidebar) window.toggleSidebar();
    });
  }

  const sidebarOverlay = document.getElementById('sidebar-overlay');
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
      if (window.toggleSidebar) window.toggleSidebar();
    });
  }

  // 프로필 아이콘 버튼 이벤트 설정
  setTimeout(() => {
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
  }, 100);

  // 날짜 선택 드롭다운 초기화
  const dateSelect = document.getElementById('date-select');
  if (dateSelect) {
    loadAvailableDates();

    // 날짜 변경 이벤트
    dateSelect.addEventListener('change', async (e) => {
      const selectedDate = e.target.value;
      if (selectedDate) {
        await loadUsersByDate(selectedDate);
      } else {
        clearUsersList();
        clearUserDetail();
      }
    });
  }
}

// 사용 가능한 날짜 목록 로드
async function loadAvailableDates() {
  const dateSelect = document.getElementById('date-select');
  if (!dateSelect) return;
  
  try {
    const availableDates = await getAvailableDates();
    
    // 기존 옵션 제거 (처음 옵션 제외)
    while (dateSelect.children.length > 1) {
      dateSelect.removeChild(dateSelect.lastChild);
    }
    
    // 날짜 옵션 추가
    availableDates.forEach(date => {
      const option = document.createElement('option');
      option.value = date;
      const dateObj = new Date(date);
      const formattedDate = dateObj.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      });
      option.textContent = formattedDate;
      dateSelect.appendChild(option);
    });
  } catch (error) {
    console.error('날짜 목록 로드 실패:', error);
  }
}

// 날짜별 사용자 목록 로드
async function loadUsersByDate(date) {
  const usersListContainer = document.getElementById('users-list');
  
  if (!usersListContainer) return;

  try {
    // 로딩 표시
    usersListContainer.innerHTML = `
      <div class="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
        사용자 목록을 불러오는 중...
      </div>
    `;

    const users = await getUsersByDate(date);

    if (users.length === 0) {
      usersListContainer.innerHTML = `
        <div class="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
          선택한 날짜에 활동한 사용자가 없습니다.
        </div>
      `;
      return;
    }

    usersListContainer.innerHTML = users.map(user => {
      const totalCount = (user.difficultSentences?.length || 0) + 
                         (user.savedPassages?.length || 0) + 
                         (user.wrongQuestions?.length || 0);
      
      return `
        <button 
          class="user-item w-full text-left p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          data-user-id="${user.userId}"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="font-medium text-gray-900 dark:text-gray-100">${escapeHtml(user.userName)}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                어려운 문장: ${user.difficultSentences?.length || 0} | 
                저장한 지문: ${user.savedPassages?.length || 0} | 
                틀린 문제: ${user.wrongQuestions?.length || 0}
              </div>
            </div>
            <span class="material-symbols-outlined text-gray-400 text-lg ml-2">chevron_right</span>
          </div>
        </button>
      `;
    }).join('');

    // 사용자 클릭 이벤트 추가
    usersListContainer.querySelectorAll('.user-item').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.getAttribute('data-user-id');
        await loadUserDetail(userId, date);
        
        // 선택된 항목 스타일 적용
        usersListContainer.querySelectorAll('.user-item').forEach(item => {
          item.classList.remove('bg-blue-50', 'dark:bg-blue-900/20', 'border-blue-300', 'dark:border-blue-700');
        });
        btn.classList.add('bg-blue-50', 'dark:bg-blue-900/20', 'border-blue-300', 'dark:border-blue-700');
      });
    });
  } catch (error) {
    console.error('사용자 목록 로드 실패:', error);
    usersListContainer.innerHTML = `
      <div class="text-center py-8 text-red-500 dark:text-red-400 text-sm">
        사용자 목록을 불러오는 데 실패했습니다.
      </div>
    `;
  }
}

// 사용자 목록 초기화
function clearUsersList() {
  const usersListContainer = document.getElementById('users-list');
  if (usersListContainer) {
    usersListContainer.innerHTML = `
      <div class="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
        날짜를 선택하면 사용자 목록이 표시됩니다.
      </div>
    `;
  }
}

// 사용자 상세 정보 로드
async function loadUserDetail(userId, date) {
  const container = document.getElementById('user-detail-container');
  
  if (!container) return;

  try {
    // 로딩 표시
    container.innerHTML = `
      <div class="text-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-500 dark:text-gray-400">사용자 정보를 불러오는 중...</p>
      </div>
    `;

    const userData = await getUserData(userId);
  
    if (!userData) {
      container.innerHTML = `
        <div class="text-center py-16">
          <span class="material-symbols-outlined text-gray-400 text-6xl mb-4">error</span>
          <p class="text-gray-500 dark:text-gray-400 text-lg mb-2">사용자 데이터를 찾을 수 없습니다.</p>
        </div>
      `;
      return;
    }

  // 선택한 날짜의 데이터만 필터링
  const filterByDate = (items) => {
    if (!items) return [];
    return items.filter(item => {
      if (!item.savedAt) return false;
      const itemDate = new Date(item.savedAt).toISOString().split('T')[0];
      return itemDate === date;
    });
  };

  const difficultSentences = filterByDate(userData.difficultSentences);
  const savedPassages = filterByDate(userData.savedPassages);
  const wrongQuestions = filterByDate(userData.wrongQuestions);

  container.innerHTML = `
    <div class="space-y-6">
      <!-- 사용자 헤더 -->
      <div class="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
            ${escapeHtml(userData.userName.charAt(0).toUpperCase())}
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">${escapeHtml(userData.userName)}</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">${formatDate(date)}의 활동 기록</p>
          </div>
        </div>
      </div>

      <!-- 어려운 문장 섹션 -->
      ${difficultSentences.length > 0 ? `
        <div class="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-blue-600 dark:text-blue-400">bookmark</span>
            어려운 문장 (${difficultSentences.length})
          </h3>
          <div class="space-y-4">
            ${difficultSentences.map(item => `
              <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <p class="text-gray-900 dark:text-gray-100 font-medium mb-2">${escapeHtml(item.sentence)}</p>
                ${item.translation ? `<p class="text-sm text-gray-600 dark:text-gray-400 mb-2">${escapeHtml(item.translation)}</p>` : ''}
                ${item.analysis?.structure ? `<p class="text-xs text-blue-600 dark:text-blue-400">${escapeHtml(item.analysis.structure)}</p>` : ''}
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">${formatDateTime(item.savedAt)}</p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- 저장한 지문 섹션 -->
      ${savedPassages.length > 0 ? `
        <div class="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-green-600 dark:text-green-400">description</span>
            저장한 지문 (${savedPassages.length})
          </h3>
          <div class="space-y-4">
            ${savedPassages.map(item => `
              <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <div class="mb-3">
                  <p class="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">${escapeHtml(item.passage)}</p>
                </div>
                ${item.contentAnalysis?.mainIdea ? `
                  <div class="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 class="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">주제</h4>
                    <p class="text-sm text-blue-800 dark:text-blue-200">${escapeHtml(item.contentAnalysis.mainIdea)}</p>
                  </div>
                ` : ''}
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-3">${formatDateTime(item.savedAt)}</p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- 틀린 문제 섹션 -->
      ${wrongQuestions.length > 0 ? `
        <div class="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-red-600 dark:text-red-400">quiz</span>
            틀린 문제 (${wrongQuestions.length})
          </h3>
          <div class="space-y-4">
            ${wrongQuestions.map(item => `
              <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <div class="mb-3">
                  <span class="inline-block px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs font-medium rounded mb-2">
                    ${item.questionType || '문제'}
                  </span>
                  <p class="text-gray-900 dark:text-gray-100 font-medium mb-3">${escapeHtml(item.question?.question || '문제 내용')}</p>
                  ${item.question?.options ? `
                    <div class="space-y-2 mb-3">
                      ${Object.entries(item.question.options).map(([key, value]) => `
                        <div class="flex items-center gap-2">
                          <span class="font-medium ${item.correctAnswer === key ? 'text-green-600 dark:text-green-400' : item.selectedAnswer === key ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}">${key}.</span>
                          <span class="${item.correctAnswer === key ? 'text-green-600 dark:text-green-400 font-medium' : item.selectedAnswer === key ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}">${escapeHtml(value)}</span>
                          ${item.correctAnswer === key ? '<span class="text-xs text-green-600 dark:text-green-400">(정답)</span>' : ''}
                          ${item.selectedAnswer === key && item.correctAnswer !== key ? '<span class="text-xs text-red-600 dark:text-red-400">(선택한 답)</span>' : ''}
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}
                  ${item.explanation?.correctAnswerExplanation ? `
                    <div class="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h4 class="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">정답 설명</h4>
                      <p class="text-sm text-green-800 dark:text-green-200">${escapeHtml(item.explanation.correctAnswerExplanation)}</p>
                    </div>
                  ` : ''}
                </div>
                <p class="text-xs text-gray-400 dark:text-gray-500">${formatDateTime(item.savedAt)}</p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${difficultSentences.length === 0 && savedPassages.length === 0 && wrongQuestions.length === 0 ? `
        <div class="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 text-center">
          <p class="text-gray-500 dark:text-gray-400">선택한 날짜에 활동 데이터가 없습니다.</p>
        </div>
      ` : ''}
    </div>
  `;
  } catch (error) {
    console.error('사용자 상세 정보 로드 실패:', error);
    container.innerHTML = `
      <div class="text-center py-16">
        <span class="material-symbols-outlined text-red-400 text-6xl mb-4">error</span>
        <p class="text-red-500 dark:text-red-400 text-lg mb-2">사용자 정보를 불러오는 데 실패했습니다.</p>
      </div>
    `;
  }
}

// 사용자 상세 정보 초기화
function clearUserDetail() {
  const container = document.getElementById('user-detail-container');
  if (container) {
    container.innerHTML = `
      <div class="text-center py-16">
        <span class="material-symbols-outlined text-gray-400 text-6xl mb-4">person_search</span>
        <p class="text-gray-500 dark:text-gray-400 text-lg mb-2">사용자를 선택하세요</p>
        <p class="text-sm text-gray-400 dark:text-gray-500">좌측 목록에서 사용자를 클릭하면 상세 정보를 확인할 수 있습니다.</p>
      </div>
    `;
  }
}

// 유틸리티 함수
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
}

function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
