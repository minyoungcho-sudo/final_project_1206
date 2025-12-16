import { analyzeContentWithGPT } from '../utils/gptApi.js';
import { renderChatbot } from '../components/Chatbot.js';
import { setupChatbot } from '../utils/chatbotUtils.js';
import { savePassage, getSavedPassages, deleteSavedPassage } from '../utils/activityStorage.js';

export function renderContentAnalysisPage() {
  const text = window.appState?.inputText || '';
  
  if (!text) {
    return `
      <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div class="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <p class="text-gray-700 dark:text-gray-300 mb-4">분석할 텍스트가 없습니다.</p>
          <button id="go-back-btn" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
            입력 페이지로 돌아가기
          </button>
        </div>
      </div>
    `;
  }
  
  return `
    <div class="content-analysis-layout min-h-screen bg-[#f8fafc] dark:bg-[#0f172a]">
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
                <button id="menu-item-analysis" class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 font-medium">
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
              <li>
                <button id="menu-item-community" class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <span class="material-symbols-outlined">forum</span>
                  <span>커뮤니티</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      
      <!-- 사이드바 오버레이 -->
      <div id="sidebar-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-[55] hidden"></div>

      <!-- Top App Bar -->
      <div class="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-[#f8fafc] dark:bg-[#1e293b] shadow-sm h-16">
        <div class="px-4 sm:px-10 h-full flex items-center justify-between">
          <div class="flex items-center gap-2">
            <button id="menu-btn" class="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <span class="material-symbols-outlined">menu</span>
            </button>
            <button id="go-back-btn" class="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <span class="material-symbols-outlined">arrow_back_ios_new</span>
            </button>
          </div>
          <h2 class="absolute left-1/2 transform -translate-x-1/2 text-lg font-black text-[#121417] dark:text-white tracking-tight font-display">지문 주제 및 내용 분석</h2>
          <div class="flex items-center gap-2">
            <button id="save-passage-btn" class="flex items-center gap-2 h-10 px-4 rounded-lg bg-[#4b91e2] hover:bg-blue-600 text-white text-sm font-bold shadow-md transition-colors">
              <span class="material-symbols-outlined text-[20px]">bookmark_add</span>
              <span>지문 저장</span>
            </button>
            <button id="next-page-btn" class="flex items-center gap-2 h-10 px-4 rounded-lg bg-[#4b91e2] hover:bg-blue-600 text-white text-sm font-bold shadow-md transition-colors">
              <span>연습 문제</span>
              <span class="material-symbols-outlined text-[20px]">arrow_forward_ios</span>
            </button>
            <button id="profile-icon-btn" class="p-2 text-gray-600 dark:text-gray-300" aria-label="profile"><span class="material-symbols-outlined">person</span></button>
          </div>
        </div>
      </div>

      <!-- Main Content Area with Chatbot -->
      <div class="flex h-[calc(100vh-64px)] overflow-hidden">
        <!-- Content Analysis -->
        <div class="flex-1 overflow-y-auto">
          <div class="w-full max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Loading Indicator -->
            <div id="loading-indicator" class="mb-8 p-6 bg-white dark:bg-[#1e293b] rounded-2xl text-center border border-gray-100 dark:border-gray-800 shadow-sm">
              <div class="flex items-center justify-center gap-3">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400"></div>
                <p class="text-blue-700 dark:text-blue-300 font-medium">지문 분석 중... 잠시만 기다려주세요.</p>
              </div>
            </div>
            
            <!-- Analysis Cards Container -->
            <div id="content-analysis-container" class="space-y-6">
              <!-- 주제 카드 -->
              <div class="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow duration-300">
                <div class="p-6 md:p-8">
                  <div class="flex items-start gap-4">
                    <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-[#4b91e2]/10 dark:bg-[#4b91e2]/20 flex items-center justify-center">
                      <span class="material-symbols-outlined text-[#4b91e2] text-2xl">auto_awesome</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3 class="text-base font-bold text-[#121417] dark:text-white mb-3">지문 주제</h3>
                      <div id="main-idea" class="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                        <div class="flex items-center gap-2 text-gray-400">
                          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                          <span class="text-sm">분석 중...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 전개 방식 카드 -->
              <div class="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow duration-300">
                <div class="p-6 md:p-8">
                  <div class="flex items-start gap-4">
                    <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-[#4b91e2]/10 dark:bg-[#4b91e2]/20 flex items-center justify-center">
                      <span class="material-symbols-outlined text-[#4b91e2] text-2xl">schema</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3 class="text-base font-bold text-[#121417] dark:text-white mb-3">글의 전개 방식</h3>
                      <div id="development-pattern" class="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                        <div class="flex items-center gap-2 text-gray-400">
                          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                          <span class="text-sm">분석 중...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 핵심 키워드 카드 -->
              <div class="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow duration-300">
                <div class="p-6 md:p-8">
                  <div class="flex items-start gap-4">
                    <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-[#4b91e2]/10 dark:bg-[#4b91e2]/20 flex items-center justify-center">
                      <span class="material-symbols-outlined text-[#4b91e2] text-2xl">sell</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3 class="text-base font-bold text-[#121417] dark:text-white mb-3">핵심 키워드</h3>
                      <div id="key-keywords" class="flex flex-wrap gap-2">
                        <div class="flex items-center gap-2 text-gray-400">
                          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                          <span class="text-sm">분석 중...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 주제문 위치 카드 -->
              <div class="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow duration-300">
                <div class="p-6 md:p-8">
                  <div class="flex items-start gap-4">
                    <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-[#4b91e2]/10 dark:bg-[#4b91e2]/20 flex items-center justify-center">
                      <span class="material-symbols-outlined text-[#4b91e2] text-2xl">pin_drop</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3 class="text-base font-bold text-[#121417] dark:text-white mb-3">주제문 위치</h3>
                      <div id="topic-sentence-location" class="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                        <div class="flex items-center gap-2 text-gray-400">
                          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                          <span class="text-sm">분석 중...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chatbot Sidebar -->
        <div id="chatbot-container" class="flex-shrink-0 w-[380px] border-l border-gray-200 dark:border-gray-800"></div>
      </div>
    </div>
  `;
}

export async function setupContentAnalysisPage() {
  const goBackBtn = document.getElementById('go-back-btn');
  const nextPageBtn = document.getElementById('next-page-btn');
  
  if (goBackBtn) {
    goBackBtn.addEventListener('click', () => {
      if (window.navigateToPage) {
        window.navigateToPage('analysis');
      }
    });
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
      if (window.navigateToPage) {
        window.navigateToPage('exercise');
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
      if (window.navigateToPage) {
        window.navigateToPage('input');
      }
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

  const menuItemCommunity = document.getElementById('menu-item-community');
  if (menuItemCommunity) {
    menuItemCommunity.addEventListener('click', () => {
      if (window.toggleSidebar) {
        window.toggleSidebar();
      }
      if (window.navigateToPage) {
        window.navigateToPage('community');
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

  // 지문 저장 버튼 이벤트 (토글 방식)
  const savePassageBtn = document.getElementById('save-passage-btn');
  if (savePassageBtn) {
    // 현재 지문이 이미 저장되어 있는지 확인
    (async () => {
      const text = window.appState?.inputText || '';
      const savedPassages = await getSavedPassages();
      const existingPassage = savedPassages.find(p => p.passage === text);
    
      if (existingPassage) {
        // 이미 저장된 경우
        savePassageBtn.innerHTML = `
          <span class="material-symbols-outlined text-[20px]">bookmark</span>
          <span>저장 취소</span>
        `;
        savePassageBtn.setAttribute('data-saved-id', existingPassage.id);
        savePassageBtn.setAttribute('data-saved', 'true');
      } else {
        // 저장되지 않은 경우
        savePassageBtn.innerHTML = `
          <span class="material-symbols-outlined text-[20px]">bookmark_add</span>
          <span>지문 저장</span>
        `;
        savePassageBtn.removeAttribute('data-saved-id');
        savePassageBtn.removeAttribute('data-saved');
      }
    })();
    
    savePassageBtn.addEventListener('click', async () => {
      const text = window.appState?.inputText || '';
      if (!text) {
        alert('저장할 지문이 없습니다.');
        return;
      }
      
      const isSaved = savePassageBtn.getAttribute('data-saved') === 'true';
      
      if (isSaved) {
        // 저장 취소 (삭제)
        const savedId = savePassageBtn.getAttribute('data-saved-id');
        if (savedId) {
          try {
            await deleteSavedPassage(savedId);
            savePassageBtn.innerHTML = `
              <span class="material-symbols-outlined text-[20px]">bookmark_add</span>
              <span>지문 저장</span>
            `;
            savePassageBtn.removeAttribute('data-saved-id');
            savePassageBtn.removeAttribute('data-saved');
            showToast('지문 저장이 취소되었습니다.');
          } catch (error) {
            console.error('지문 삭제 오류:', error);
            showToast('삭제 중 오류가 발생했습니다.');
          }
        }
      } else {
        // 저장하기
        const contentAnalysis = window.contentAnalysisData;
        if (contentAnalysis) {
          try {
            const savedEntry = await savePassage(text, contentAnalysis);
            savePassageBtn.innerHTML = `
              <span class="material-symbols-outlined text-[20px]">bookmark</span>
              <span>저장 취소</span>
            `;
            savePassageBtn.setAttribute('data-saved-id', savedEntry.id);
            savePassageBtn.setAttribute('data-saved', 'true');
            showToast('지문이 저장되었습니다.');
          } catch (error) {
            console.error('지문 저장 오류:', error);
            showToast('저장 중 오류가 발생했습니다.');
          }
        } else {
          alert('분석이 완료된 후 저장할 수 있습니다.');
        }
      }
    });
  }

// 토스트 메시지 표시
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-4 right-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2';
  toast.innerHTML = `
    <span class="material-symbols-outlined text-sm">check_circle</span>
    <span class="text-sm">${message}</span>
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 2000);
}

  // 지문 전체 분석 실행
  const text = window.appState?.inputText || '';
  if (!text) return;

  const loadingIndicator = document.getElementById('loading-indicator');
  const mainIdeaElement = document.getElementById('main-idea');
  
  // 분석 데이터 저장용 전역 변수
  window.contentAnalysisData = null;
  const developmentPatternElement = document.getElementById('development-pattern');
  const keyKeywordsElement = document.getElementById('key-keywords');
  const topicSentenceLocationElement = document.getElementById('topic-sentence-location');
  
  try {
    // GPT 지문 분석
    const analysis = await analyzeContentWithGPT(text);
    
    if (!analysis) {
      throw new Error('Analysis failed');
    }

    // 분석 결과 저장 (저장 버튼에서 사용)
    window.contentAnalysisData = analysis;

    // 주제 업데이트
    if (mainIdeaElement) {
      mainIdeaElement.innerHTML = `<p class="text-sm leading-relaxed">${escapeHtml(analysis.mainIdea || '분석 결과를 가져올 수 없습니다.')}</p>`;
    }

    // 전개 방식 업데이트
    if (developmentPatternElement) {
      developmentPatternElement.innerHTML = `<p class="text-sm leading-relaxed">${escapeHtml(analysis.developmentPattern || '분석 결과를 가져올 수 없습니다.')}</p>`;
    }

    // 핵심 키워드 업데이트
    if (keyKeywordsElement && analysis.keyKeywords && analysis.keyKeywords.length > 0) {
      keyKeywordsElement.innerHTML = analysis.keyKeywords.map(keyword => 
        `<span class="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#4b91e2]/10 dark:bg-[#4b91e2]/20 text-[#4b91e2] font-medium text-xs border border-[#4b91e2]/20">${escapeHtml(keyword)}</span>`
      ).join('');
    } else if (keyKeywordsElement) {
      keyKeywordsElement.innerHTML = '<p class="text-gray-400 text-sm">키워드를 찾을 수 없습니다.</p>';
    }

    // 주제문 위치 업데이트
    if (topicSentenceLocationElement) {
      topicSentenceLocationElement.innerHTML = `<p class="text-sm leading-relaxed">${escapeHtml(analysis.topicSentenceLocation || '분석 결과를 가져올 수 없습니다.')}</p>`;
    }

    // 로딩 인디케이터 숨기기
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }

  } catch (error) {
    console.error('Content analysis error:', error);
    
    // 오류 메시지 표시
    if (mainIdeaElement) {
      mainIdeaElement.innerHTML = '<p class="text-red-600 dark:text-red-400">분석 중 오류가 발생했습니다.</p>';
    }
    if (developmentPatternElement) {
      developmentPatternElement.innerHTML = '<p class="text-red-600 dark:text-red-400">분석 중 오류가 발생했습니다.</p>';
    }
    if (keyKeywordsElement) {
      keyKeywordsElement.innerHTML = '<p class="text-red-600 dark:text-red-400">분석 중 오류가 발생했습니다.</p>';
    }
    if (topicSentenceLocationElement) {
      topicSentenceLocationElement.innerHTML = '<p class="text-red-600 dark:text-red-400">분석 중 오류가 발생했습니다.</p>';
    }
    
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
  }
}

// HTML 이스케이프 함수
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

