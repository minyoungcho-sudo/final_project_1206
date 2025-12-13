import { splitIntoSentences, analyzeSentence, extractGrammarPoints, translateSentence, generateStructureString } from '../utils/sentenceAnalyzer.js';
import { analyzeSentenceWithGPT } from '../utils/gptApi.js';
import { renderChatbot } from '../components/Chatbot.js';
import { setupChatbot } from '../utils/chatbotUtils.js';
import { saveDifficultSentence } from '../utils/activityStorage.js';

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
    <div class="analysis-layout min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
            </ul>
          </nav>
        </div>
      </div>
      
      <!-- 사이드바 오버레이 -->
      <div id="sidebar-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-[25] hidden"></div>

      <!-- Top App Bar -->
      <div class="sticky top-0 z-20 flex items-center justify-between bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div class="flex items-center gap-2">
          <button id="menu-btn" class="flex items-center justify-center w-10 h-10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
            <span class="material-symbols-outlined text-xl">menu</span>
          </button>
          <button id="go-back-btn" class="flex items-center justify-center w-10 h-10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
            <span class="material-symbols-outlined text-xl">arrow_back_ios_new</span>
          </button>
        </div>
        <h2 class="absolute left-1/2 transform -translate-x-1/2 text-xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">문장별 구문 분석</h2>
        <div class="flex items-center gap-2">
          <button id="next-page-btn" class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all shadow-sm hover:shadow-md">
            <span class="text-sm font-medium">내용 분석</span>
            <span class="material-symbols-outlined text-lg">arrow_forward_ios</span>
          </button>
          <button id="profile-icon-btn" class="icon-btn" aria-label="profile"><span class="material-symbols-outlined">person</span></button>
        </div>
      </div>

      <!-- Main Content Area with Chatbot -->
      <div class="flex h-[calc(100vh-73px)] overflow-hidden">
        <!-- Analysis Content -->
        <div class="flex-1 overflow-y-auto">
          <div class="max-w-4xl mx-auto px-6 py-8">
            <div id="loading-indicator" class="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl text-center border border-blue-100 dark:border-blue-800 shadow-sm" style="display: none;">
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
                  <div class="group bg-white dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100/50 dark:border-gray-700/50" data-sentence-index="${index}">
                    <div class="flex items-start gap-4 mb-5">
                      <div class="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                        ${index + 1}
                      </div>
                      <div class="flex-1">
                        <div class="flex items-start justify-between gap-4">
                          <p class="text-gray-900 dark:text-gray-100 text-lg leading-relaxed font-normal tracking-wide flex-1" id="sentence-original-${index}">
                            ${highlightGrammarElements(sentence, basicAnalysis)}
                          </p>
                          <button class="save-sentence-btn flex-shrink-0 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" data-sentence-index="${index}" title="어려운 문장으로 저장">
                            <span class="material-symbols-outlined text-base">bookmark_add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div class="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700/50">
                      <div class="space-y-3">
                        <div class="bg-gradient-to-r from-gray-50/80 to-gray-100/40 dark:from-gray-800/40 dark:to-gray-700/20 rounded-xl p-4" id="sentence-structure-${index}">
                          <div class="flex items-start gap-3">
                            <span class="material-symbols-outlined text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5 text-lg">account_tree</span>
                            <div class="flex-1">
                              <div class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">구조 분석</div>
                              <div class="text-sm text-gray-600 dark:text-gray-400 structure-placeholder">분석 중...</div>
                            </div>
                          </div>
                        </div>
                        
                        <div class="bg-gradient-to-r from-indigo-50/80 to-purple-50/40 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4" id="translation-${index}">
                          <div class="flex items-start gap-3">
                            <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5 text-lg">translate</span>
                            <div class="flex-1">
                              <div class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">해석</div>
                              <div class="text-sm text-gray-600 dark:text-gray-400 translation-placeholder leading-relaxed">번역 중...</div>
                            </div>
                          </div>
                        </div>
                        
                        <div class="bg-gradient-to-r from-amber-50/80 to-orange-50/40 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4" id="sentence-grammar-${index}">
                          <div class="flex items-start gap-3">
                            <span class="material-symbols-outlined text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5 text-lg">auto_awesome</span>
                            <div class="flex-1">
                              <div class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">핵심 문법 포인트</div>
                              <ul class="grammar-points-list space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
                                <li class="grammar-placeholder flex items-start gap-2">
                                  <span class="text-amber-500 dark:text-amber-400 mt-1 text-xs">•</span>
                                  <span>분석 중...</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Chatbot Sidebar -->
        <div id="chatbot-container" class="flex-shrink-0 w-[380px] border-l border-gray-200 dark:border-gray-700"></div>
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
function setupSaveButtons(sentences) {
  document.querySelectorAll('.save-sentence-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(btn.getAttribute('data-sentence-index'));
      
      if (window.sentenceData && window.sentenceData[index]) {
        const data = window.sentenceData[index];
        saveDifficultSentence(data.sentence, data.analysis, data.translation);
        
        // 버튼 상태 변경
        btn.innerHTML = '<span class="material-symbols-outlined text-base">bookmark</span>';
        btn.classList.add('text-blue-600', 'dark:text-blue-400');
        btn.classList.remove('text-gray-600', 'dark:text-gray-400');
        btn.disabled = true;
        btn.title = '저장됨';
        
        // 토스트 메시지 표시 (선택사항)
        showToast('어려운 문장으로 저장되었습니다.');
      }
    });
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
    
    structureElement.innerHTML = `
      <div class="flex items-start gap-3">
        <span class="material-symbols-outlined text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5">account_tree</span>
        <div class="flex-1">
          <div class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">구조 분석</div>
          <div class="text-gray-600 dark:text-gray-400 leading-relaxed">${structureText}</div>
        </div>
      </div>
    `;
  }
  
  // 번역 업데이트
  const translationElement = document.getElementById(`translation-${index}`);
  if (translationElement) {
    translationElement.innerHTML = `
      <div class="flex items-start gap-3">
        <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5">translate</span>
        <div class="flex-1">
          <div class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">해석</div>
          <div class="text-gray-600 dark:text-gray-400 leading-relaxed">${translation}</div>
        </div>
      </div>
    `;
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
    translationElement.innerHTML = `
      <div class="flex items-start gap-3">
        <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5">translate</span>
        <div class="flex-1">
          <div class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">해석</div>
          <div class="text-gray-600 dark:text-gray-400 leading-relaxed">${translation}</div>
        </div>
      </div>
    `;
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


