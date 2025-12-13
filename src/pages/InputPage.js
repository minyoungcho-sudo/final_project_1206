import { renderChatbot } from '../components/Chatbot.js';
import { setupChatbot } from '../utils/chatbotUtils.js';

export function renderInputPage() {
  return `
    <div class="input-layout min-h-screen bg-[#f8fafc] dark:bg-[#0f172a]">
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
                <button id="menu-item-analysis" class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <span class="material-symbols-outlined">description</span>
                  <span>지문 분석 활동</span>
                </button>
              </li>
              <li>
                <button id="menu-item-activity" class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <span class="material-symbols-outlined">history</span>
                  <span>내 활동 기록</span>
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
          <div class="flex items-center gap-4">
            <button id="menu-btn" class="icon-btn p-2 text-gray-600 dark:text-gray-300" aria-label="menu"><span class="material-symbols-outlined">menu</span></button>
            <div class="flex items-center gap-4 cursor-pointer">
              <div class="w-8 h-8 text-[#4b91e2] flex items-center justify-center bg-[#4b91e2]/10 rounded-lg">
                <span class="material-symbols-outlined">school</span>
              </div>
              <h2 class="text-lg font-black tracking-tight text-[#121417] dark:text-white font-display">SoolSool</h2>
            </div>
          </div>
          <button id="profile-icon-btn" class="icon-btn p-2 text-gray-600 dark:text-gray-300" aria-label="profile"><span class="material-symbols-outlined">person</span></button>
        </div>
      </header>

      <!-- Main Content with Chatbot -->
      <div class="flex h-[calc(100vh-64px)] overflow-hidden">
        <!-- Input Content -->
        <div class="flex-1 overflow-y-auto">
          <div class="max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="input-head mb-6">
              <h1 class="text-3xl md:text-4xl font-black text-[#121417] dark:text-white mb-2 tracking-tight font-display">새 지문을 분석해보세요</h1>
              <p class="text-gray-500 dark:text-gray-400 text-base max-w-2xl">PDF에서 붙여넣거나 직접 입력하면 바로 문장 구조와 해석을 제공합니다.</p>
            </div>

            <form id="text-input-form" class="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8">
              <label class="input-label-row" for="english-text">
                <span>지문 입력</span>
              </label>
              <textarea
                id="english-text"
                name="english-text"
                class="textarea-large"
                rows="16"
                placeholder="Paste or type your passage here..."
                required
              ></textarea>
              <div class="input-meta">
                <span id="word-count" class="muted">0 words</span>
              </div>
              <div class="cta-sticky">
                <button type="submit" class="btn-primary wide">Start Analysis</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Chatbot Sidebar -->
        <div id="chatbot-container" class="flex-shrink-0 w-[380px] border-l border-gray-200 dark:border-gray-800"></div>
      </div>
    </div>
  `;
}

export function setupInputPage() {
  const form = document.getElementById('text-input-form');
  const textarea = document.getElementById('english-text');
  const wordCount = document.getElementById('word-count');
  
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = textarea.value.trim();
      
      if (text) {
        // 전역 상태에 텍스트 저장
        window.appState = window.appState || {};
        window.appState.inputText = text;
        
        // 2페이지로 이동
        if (window.navigateToPage) {
          window.navigateToPage('analysis');
        }
      }
    });
  }

  if (textarea && wordCount) {
    const updateCount = () => {
      const text = textarea.value.trim();
      const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
      wordCount.textContent = `${words} word${words === 1 ? '' : 's'}`;
    };
    textarea.addEventListener('input', updateCount);
    updateCount();
  }

  // 챗봇 렌더링 및 설정
  const chatbotContainer = document.getElementById('chatbot-container');
  if (chatbotContainer) {
    chatbotContainer.innerHTML = renderChatbot();
    setupChatbot();
  }

  // 프로필 아이콘 버튼 이벤트 설정
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

  // 햄버거 메뉴 버튼 이벤트 설정
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
      // 이미 입력 페이지에 있으므로 아무 동작 안 함
    });
  }

  const menuItemActivity = document.getElementById('menu-item-activity');
  if (menuItemActivity) {
    menuItemActivity.addEventListener('click', () => {
      if (window.toggleSidebar) {
        window.toggleSidebar();
      }
      if (window.navigateToPage) {
        window.navigateToPage('myactivity');
      }
    });
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
}



