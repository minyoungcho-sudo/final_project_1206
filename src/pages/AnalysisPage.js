import { splitIntoSentences, analyzeSentence, extractGrammarPoints, translateSentence, generateStructureString } from '../utils/sentenceAnalyzer.js';
import { analyzeSentenceWithGPT } from '../utils/gptApi.js';
import { renderChatbot } from '../components/Chatbot.js';
import { setupChatbot } from '../utils/chatbotUtils.js';
import { saveDifficultSentence, deleteDifficultSentence, getDifficultSentences } from '../utils/activityStorage.js';

export function renderAnalysisPage() {
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

  const sentences = splitIntoSentences(text);
  
  return `
    <div class="analysis-layout min-h-screen bg-[#f8fafc] dark:bg-[#0f172a]">
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
          <h2 class="absolute left-1/2 transform -translate-x-1/2 text-lg font-black text-[#121417] dark:text-white tracking-tight font-display">문장별 구문 분석</h2>
          <div class="flex items-center gap-2">
            <button id="next-page-btn" class="flex items-center gap-2 h-10 px-4 rounded-lg bg-[#4b91e2] hover:bg-blue-600 text-white text-sm font-bold shadow-md transition-colors">
              <span>내용 분석</span>
              <span class="material-symbols-outlined text-[20px]">arrow_forward_ios</span>
            </button>
            <button id="profile-icon-btn" class="p-2 text-gray-600 dark:text-gray-300" aria-label="profile"><span class="material-symbols-outlined">person</span></button>
          </div>
        </div>
      </div>

      <!-- Main Content Area with Chatbot -->
      <div class="flex h-[calc(100vh-64px)] overflow-hidden">
        <!-- Analysis Content -->
        <div class="flex-1 overflow-y-auto">
          <div class="w-full max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div id="loading-indicator" class="mb-8 p-6 bg-white dark:bg-[#1e293b] rounded-2xl text-center border border-gray-100 dark:border-gray-800 shadow-sm" style="display: none;">
              <div class="flex items-center justify-center gap-3">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400"></div>
                <p class="text-blue-700 dark:text-blue-300 font-medium">분석 중... 잠시만 기다려주세요.</p>
              </div>
            </div>
            
            <!-- Sentence Cards Container -->
            <div class="space-y-5" id="analysis-container">
              ${sentences.map((sentence, index) => {
                const basicAnalysis = analyzeSentence(sentence);
                
                return `
                  <div class="group bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow duration-300" data-sentence-index="${index}">
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                      <div class="flex items-center gap-3">
                        <span class="flex items-center justify-center w-8 h-8 rounded-full bg-[#4b91e2] text-white font-bold text-sm shadow-sm">
                          ${String(index + 1).padStart(2, '0')}
                        </span>
                        <span class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">문장 상세 분석</span>
                      </div>
                      <button class="save-sentence-btn text-[#4b91e2] transition-colors" data-sentence-index="${index}" title="어려운 문장으로 저장">
                        <span class="material-symbols-outlined">bookmark_border</span>
                      </button>
                    </div>
                    <div class="p-6 md:p-8">
                      <!-- Phrase Block Visualizer -->
                      <div class="flex flex-wrap gap-y-8 gap-x-1 items-end leading-loose mb-8 text-lg md:text-xl">
                        <p class="text-gray-900 dark:text-white font-medium" id="sentence-original-${index}">
                          ${highlightGrammarElements(sentence, basicAnalysis)}
                        </p>
                      </div>

                      <!-- Translation -->
                      <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-100 dark:border-gray-800" id="translation-${index}">
                        <div class="flex gap-3">
                          <div class="mt-1 min-w-[20px]">
                            <span class="material-symbols-outlined text-gray-400 text-[20px]">translate</span>
                          </div>
                          <p class="text-gray-700 dark:text-gray-300 leading-relaxed translation-placeholder">번역 중...</p>
                        </div>
                      </div>

                      <!-- Grammar Point -->
                      <div class="flex flex-col md:flex-row gap-4">
                        <div class="flex-1 flex items-start gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700" id="sentence-grammar-${index}">
                          <span class="material-symbols-outlined text-[#4b91e2] text-[20px]">info</span>
                          <div>
                            <h4 class="font-bold text-gray-900 dark:text-white text-sm mb-1">핵심 문법</h4>
                            <div class="text-sm text-gray-600 dark:text-gray-400 grammar-placeholder">분석 중...</div>
                          </div>
                        </div>
                      </div>

                      <!-- Structure (hidden placeholder for JS) -->
                      <div id="sentence-structure-${index}" style="display: none;"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Chatbot Sidebar -->
        <div id="chatbot-container" class="flex-shrink-0 w-[380px] border-l border-gray-200 dark:border-gray-800"></div>
      </div>
    </div>
  `;
}

// 문법 요소 하이라이트 함수 (기본 분석용)
function highlightGrammarElements(sentence, analysis) {
  const elements = {
    subject: analysis.subjects.length > 0 ? analysis.subjects[0].words : '',
    verb: analysis.verbs.length > 0 ? analysis.verbs[0].word : '',
    participialPhrases: [],
    relativeClauses: []
  };
  
  return highlightTextWithPositions(sentence, elements);
}

// 정확한 구문 매칭을 위한 하이라이트 함수
function highlightTextWithPositions(sentence, elements) {
  // 이미 하이라이트된 영역을 추적
  const highlightedRanges = [];
  
  let result = sentence;
  
  // 관계사절을 먼저 대괄호로 표시 (하이라이트 전에 처리)
  if (elements.relativeClauses && elements.relativeClauses.length > 0) {
    elements.relativeClauses.forEach(clause => {
      if (clause.text) {
        const escaped = clause.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escaped})`, 'gi');
        result = result.replace(regex, (match) => {
          if (!match.includes('[') && !match.includes('<span')) {
            return `[${match}]`;
          }
          return match;
        });
      }
    });
  }
  
  // 구문을 길이순으로 정렬 (긴 구문을 먼저 처리하여 부분 매칭 방지)
  const phrases = [
    ...(elements.participialPhrases || []).map(pp => ({ text: pp, type: 'participial' })),
    { text: elements.subject, type: 'subject' },
    { text: elements.verb, type: 'verb' }
  ].filter(p => p.text && p.text.trim()).sort((a, b) => b.text.length - a.text.length);
  
  // 구문 단위로 정확히 매칭하여 하이라이트
  phrases.forEach(phrase => {
    if (!phrase.text) return;
    
    // 동사는 단어 경계를 사용하여 더 정확하게 매칭
    if (phrase.type === 'verb') {
      const escapedPhrase = phrase.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // 동사는 단어 경계를 사용하되, 구문인 경우도 처리
      const regex = phrase.text.split(/\s+/).length > 1 
        ? new RegExp(`(${escapedPhrase})`, 'gi')
        : new RegExp(`\\b(${escapedPhrase})\\b`, 'gi');
      
      result = result.replace(regex, (match, p1, offset) => {
        if (match.includes('<span') || match.includes('[')) return match;
        
        const matchStart = offset;
        const matchEnd = offset + match.length;
        
        const overlaps = highlightedRanges.some(range => 
          (matchStart >= range.start && matchStart < range.end) ||
          (matchEnd > range.start && matchEnd <= range.end) ||
          (matchStart <= range.start && matchEnd >= range.end)
        );
        
        if (!overlaps) {
          highlightedRanges.push({ start: matchStart, end: matchEnd });
          return `<span class="grammar-${phrase.type}">${match}</span>`;
        }
        return match;
      });
    } else {
      // 다른 구문들은 기존 방식 사용
      const escapedPhrase = phrase.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedPhrase})`, 'gi');
      
      result = result.replace(regex, (match, p1, offset) => {
        if (match.includes('<span') || match.includes('[')) return match;
        
        const matchStart = offset;
        const matchEnd = offset + match.length;
        
        const overlaps = highlightedRanges.some(range => 
          (matchStart >= range.start && matchStart < range.end) ||
          (matchEnd > range.start && matchEnd <= range.end) ||
          (matchStart <= range.start && matchEnd >= range.end)
        );
        
        if (!overlaps) {
          highlightedRanges.push({ start: matchStart, end: matchEnd });
          return `<span class="grammar-${phrase.type}">${match}</span>`;
        }
        return match;
      });
    }
  });
  
  return result;
}

export async function setupAnalysisPage() {
  const goBackBtn = document.getElementById('go-back-btn');
  const nextPageBtn = document.getElementById('next-page-btn');
  
  if (goBackBtn) {
    goBackBtn.addEventListener('click', () => {
      if (window.navigateToPage) {
        window.navigateToPage('input');
      }
    });
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
      if (window.navigateToPage) {
        window.navigateToPage('content');
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

  // 각 문장에 대해 종합 분석 실행
  const text = window.appState?.inputText || '';
  if (!text) return;

  const sentences = splitIntoSentences(text);
  const loadingIndicator = document.getElementById('loading-indicator');
  
  // 문장 분석 결과를 저장할 객체
  window.sentenceData = window.sentenceData || {};
  
  if (loadingIndicator) {
    loadingIndicator.style.display = 'block';
  }

  // 모든 문장에 대해 GPT 분석 및 번역을 순차적으로 실행
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    
    try {
      // GPT 종합 분석 (구조, 문법 포인트)
      const gptAnalysis = await analyzeSentenceWithGPT(sentence);
      
      // 번역
      const translation = await translateSentence(sentence);
      
      // 문장 데이터 저장 (저장 버튼에서 사용)
      window.sentenceData[i] = {
        sentence,
        analysis: gptAnalysis,
        translation
      };
      
      // 결과 업데이트
      updateSentenceAnalysis(i, sentence, gptAnalysis, translation);
      
    } catch (error) {
      console.error(`Analysis error for sentence ${i}:`, error);
      // 오류 발생 시 기본 분석 결과 사용
      const basicAnalysis = analyzeSentence(sentence);
      const basicStructure = generateStructureString(basicAnalysis);
      const basicGrammarPoints = extractGrammarPoints(basicAnalysis);
      const translation = '번역 오류가 발생했습니다.';
      
      window.sentenceData[i] = {
        sentence,
        analysis: basicAnalysis,
        translation
      };
      
      updateSentenceAnalysisWithBasic(i, sentence, basicAnalysis, basicStructure, basicGrammarPoints, translation);
    }
    
    // UI 업데이트를 위한 짧은 지연
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  if (loadingIndicator) {
    loadingIndicator.style.display = 'none';
  }

  // 저장 버튼 이벤트 설정
  setupSaveButtons(sentences);
}

// 저장 버튼 이벤트 설정
async function setupSaveButtons(sentences) {
  // 모든 저장 버튼에 이벤트 리스너 추가 (한 번만)
  const buttons = document.querySelectorAll('.save-sentence-btn');
  
  // 모든 버튼의 상태를 먼저 확인
  for (const btn of buttons) {
    if (btn.hasAttribute('data-listener-attached')) {
      continue;
    }
    
    const index = parseInt(btn.getAttribute('data-sentence-index'));
    await checkAndUpdateButtonState(btn, index);
    
    btn.setAttribute('data-listener-attached', 'true');
    
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      
      const index = parseInt(btn.getAttribute('data-sentence-index'));
      const isSaved = btn.getAttribute('data-saved') === 'true';
      const savedId = btn.getAttribute('data-saved-id');
      
      // 저장된 문장 정보 가져오기
      let sentenceText = '';
      let analysis = null;
      let translation = '';
      
      // 저장된 데이터에서 가져오기 (우선순위 높음)
      if (window.sentenceData && window.sentenceData[index]) {
        const data = window.sentenceData[index];
        sentenceText = data.sentence || '';
        analysis = data.analysis || null;
        translation = data.translation || '';
      }
      
      // 데이터가 없으면 DOM에서 직접 가져오기
      if (!sentenceText) {
        const sentenceElement = document.getElementById(`sentence-original-${index}`);
        if (sentenceElement) {
          sentenceText = sentenceElement.textContent.trim();
        }
        
        // 번역 가져오기
        const translationElement = document.getElementById(`translation-${index}`);
        if (translationElement) {
          const translationP = translationElement.querySelector('p');
          if (translationP) {
            translation = translationP.textContent.trim();
          }
        }
      }
      
      if (!sentenceText) {
        console.error('문장 텍스트를 찾을 수 없습니다.', { index, sentenceData: window.sentenceData });
        showToast('문장 정보를 가져올 수 없습니다.');
        return;
      }
      
      if (isSaved && savedId) {
        // 저장 취소 (삭제)
        (async () => {
          try {
            await deleteDifficultSentence(savedId);
          
          // 버튼 상태 변경 - 테두리 형태로 변경
          btn.innerHTML = '<span class="material-symbols-outlined">bookmark_border</span>';
          
          // 색상은 파란색 유지 (테두리만)
          btn.style.color = '#4b91e2';
          btn.title = '어려운 문장으로 저장';
          
          // 저장 상태 제거
          btn.removeAttribute('data-saved');
          btn.removeAttribute('data-saved-id');
          
            // 토스트 메시지 표시
            showToast('저장이 취소되었습니다.');
          } catch (error) {
            console.error('문장 삭제 오류:', error);
            showToast('삭제 중 오류가 발생했습니다.');
          }
        })();
      } else {
        // 저장하기
        (async () => {
          try {
            const savedEntry = await saveDifficultSentence(sentenceText, analysis, translation);
          
          // 버튼 상태 변경 - 책갈피 아이콘을 채워진 형태로 변경
          // innerHTML로 직접 변경하여 확실하게 적용
          btn.innerHTML = '<span class="material-symbols-outlined" style="font-variation-settings: \'FILL\' 1;">bookmark</span>';
          
          // 색상은 파란색 유지 (채워진 형태)
          btn.style.color = '#4b91e2';
          btn.title = '저장 취소';
          
          // 저장된 상태를 표시하기 위한 데이터 속성 추가
          btn.setAttribute('data-saved', 'true');
          btn.setAttribute('data-saved-id', savedEntry.id);
          
            // 토스트 메시지 표시
            showToast('어려운 문장으로 저장되었습니다.');
          } catch (error) {
            console.error('문장 저장 오류:', error);
            showToast('저장 중 오류가 발생했습니다.');
          }
        })();
      }
    });
  }
}

// 페이지 로드 시 버튼 상태 확인 및 업데이트
async function checkAndUpdateButtonState(btn, index) {
  // 문장 텍스트 가져오기
  let sentenceText = '';
  const sentenceElement = document.getElementById(`sentence-original-${index}`);
  if (sentenceElement) {
    sentenceText = sentenceElement.textContent.trim();
  }
  
  if (!sentenceText && window.sentenceData && window.sentenceData[index]) {
    sentenceText = window.sentenceData[index].sentence || '';
  }
  
  if (sentenceText) {
    // 저장된 문장 목록에서 찾기
    const savedSentences = await getDifficultSentences();
    const savedSentence = savedSentences.find(s => s.sentence === sentenceText);
    
      if (savedSentence) {
      // 이미 저장된 경우 버튼 상태 업데이트
      btn.innerHTML = '<span class="material-symbols-outlined" style="font-variation-settings: \'FILL\' 1;">bookmark</span>';
      
      btn.style.color = '#4b91e2';
      btn.title = '저장 취소';
      btn.setAttribute('data-saved', 'true');
      btn.setAttribute('data-saved-id', savedSentence.id);
    }
  }
}

// 토스트 메시지 표시
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-6 right-6 bg-[#1e293b] dark:bg-gray-100 text-white dark:text-[#121417] px-6 py-3 rounded-2xl shadow-lg z-[9999] flex items-center gap-3 animate-fadeIn';
  toast.style.animation = 'fadeIn 0.3s ease-out';
  toast.innerHTML = `
    <span class="material-symbols-outlined text-[#4b91e2] text-xl">check_circle</span>
    <span class="text-sm font-bold">${message}</span>
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2000);
}

// GPT 분석 결과로 문장 업데이트
function updateSentenceAnalysis(index, sentence, gptAnalysis, translation) {
  if (!gptAnalysis) {
    // GPT 분석 실패 시 기본 분석 사용
    const basicAnalysis = analyzeSentence(sentence);
    const basicStructure = generateStructureString(basicAnalysis);
    const basicGrammarPoints = extractGrammarPoints(basicAnalysis);
    updateSentenceAnalysisWithBasic(index, sentence, basicAnalysis, basicStructure, basicGrammarPoints, translation);
    return;
  }
  
  // 하이라이트 업데이트 (GPT 분석 결과 사용)
  const originalElement = document.getElementById(`sentence-original-${index}`);
  if (originalElement) {
    originalElement.innerHTML = highlightGrammarElementsWithGPT(sentence, gptAnalysis);
  }
  
  // 구조 분석 업데이트
  const structureElement = document.getElementById(`sentence-structure-${index}`);
  if (structureElement) {
    const structureParts = [];
    if (gptAnalysis.subject) structureParts.push(`[주어: ${gptAnalysis.subject}]`);
    if (gptAnalysis.verb) structureParts.push(`[동사: ${gptAnalysis.verb}]`);
    if (gptAnalysis.object) structureParts.push(`[목적어: ${gptAnalysis.object}]`);
    if (gptAnalysis.complement) structureParts.push(`[보어: ${gptAnalysis.complement}]`);
    if (gptAnalysis.participialPhrases && gptAnalysis.participialPhrases.length > 0) {
      structureParts.push(`[분사구문: ${gptAnalysis.participialPhrases.join(', ')}]`);
    }
    if (gptAnalysis.relativeClauses && gptAnalysis.relativeClauses.length > 0) {
      const clauseTexts = gptAnalysis.relativeClauses.map(c => c.text).join(', ');
      structureParts.push(`[관계사절: ${clauseTexts}]`);
    }
    
    const structureText = structureParts.length > 0 
      ? structureParts.join(' + ')
      : (gptAnalysis.structure || '구조 분석 완료');
    
    // Structure는 원본 문장에 하이라이트로 표시되므로 여기서는 표시하지 않음
    // 필요시 다른 위치에 표시 가능
  }
  
  // 번역 업데이트
  const translationElement = document.getElementById(`translation-${index}`);
  if (translationElement) {
    const translationContent = translationElement.querySelector('p');
    if (translationContent) {
      translationContent.textContent = translation;
      translationContent.classList.remove('translation-placeholder');
    } else {
      translationElement.innerHTML = `
        <div class="flex gap-3">
          <div class="mt-1 min-w-[20px]">
            <span class="material-symbols-outlined text-gray-400 text-[20px]">translate</span>
          </div>
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed">${translation}</p>
        </div>
      `;
    }
  }
  
  // 문법 포인트 업데이트
  const grammarElement = document.getElementById(`sentence-grammar-${index}`);
  if (grammarElement) {
    const grammarPoints = gptAnalysis.grammarPoints && gptAnalysis.grammarPoints.length > 0
      ? gptAnalysis.grammarPoints
      : ['기본 문법 분석 완료'];
    
    grammarElement.innerHTML = `
      <div class="flex items-start gap-3">
        <span class="material-symbols-outlined text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5">auto_awesome</span>
        <div class="flex-1">
          <div class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">핵심 문법 포인트</div>
          <ul class="space-y-2 text-gray-700 dark:text-gray-300">
            ${grammarPoints.map(point => `
              <li class="flex items-start gap-2">
                <span class="text-amber-500 dark:text-amber-400 mt-1 flex-shrink-0">•</span>
                <span class="leading-relaxed">${point}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;
  }
}

// 기본 분석 결과로 업데이트 (fallback)
function updateSentenceAnalysisWithBasic(index, sentence, analysis, structure, grammarPoints, translation) {
  const originalElement = document.getElementById(`sentence-original-${index}`);
  if (originalElement) {
    originalElement.innerHTML = highlightGrammarElements(sentence, analysis);
  }
  
  const structureElement = document.getElementById(`sentence-structure-${index}`);
  if (structureElement) {
    structureElement.innerHTML = `
      <div class="flex items-start gap-3">
        <span class="material-symbols-outlined text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5">account_tree</span>
        <div class="flex-1">
          <div class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">구조 분석</div>
          <div class="text-gray-600 dark:text-gray-400 leading-relaxed">${structure}</div>
        </div>
      </div>
    `;
  }
  
  const translationElement = document.getElementById(`translation-${index}`);
  if (translationElement) {
    const translationContent = translationElement.querySelector('p');
    if (translationContent && translationContent.classList.contains('translation-placeholder')) {
      translationContent.textContent = translation;
      translationContent.classList.remove('translation-placeholder');
    } else {
      translationElement.innerHTML = `
        <div class="flex gap-3">
          <div class="mt-1 min-w-[20px]">
            <span class="material-symbols-outlined text-gray-400 text-[20px]">translate</span>
          </div>
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed">${translation}</p>
        </div>
      `;
    }
  }
  
  const grammarElement = document.getElementById(`sentence-grammar-${index}`);
  if (grammarElement) {
    grammarElement.innerHTML = `
      <div class="flex items-start gap-3">
        <span class="material-symbols-outlined text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5">auto_awesome</span>
        <div class="flex-1">
          <div class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">핵심 문법 포인트</div>
          <ul class="space-y-2 text-gray-700 dark:text-gray-300">
            ${grammarPoints.map(point => `
              <li class="flex items-start gap-2">
                <span class="text-amber-500 dark:text-amber-400 mt-1 flex-shrink-0">•</span>
                <span class="leading-relaxed">${point}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;
  }
}

// GPT 분석 결과를 사용한 하이라이트 함수
function highlightGrammarElementsWithGPT(sentence, gptAnalysis) {
  return highlightTextWithPositions(sentence, {
    subject: gptAnalysis.subject || '',
    verb: gptAnalysis.verb || '',
    participialPhrases: gptAnalysis.participialPhrases || [],
    relativeClauses: gptAnalysis.relativeClauses || []
  });
}


