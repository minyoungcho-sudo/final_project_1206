import { generateExerciseWithGPT } from '../utils/gptApi.js';
import { renderChatbot } from '../components/Chatbot.js';
import { setupChatbot } from '../utils/chatbotUtils.js';
import { saveWrongQuestion } from '../utils/activityStorage.js';

// 문제 유형 정의
const QUESTION_TYPES = {
  GRAMMAR: [
    { id: 'grammar_sv_agreement', name: '주어-동사 일치' },
    { id: 'grammar_tense', name: '시제 선택' },
    { id: 'grammar_relative', name: '관계대명사/관계부사' },
    { id: 'grammar_participle', name: '분사 구문' },
    { id: 'grammar_subjunctive', name: '가정법' }
  ],
  READING: [
    { id: 'reading_main_idea', name: '주제 찾기' },
    { id: 'reading_title', name: '제목 고르기' }
  ],
  VOCABULARY: [
    { id: 'vocabulary_context', name: '문맥상 적절한 단어 선택' }
  ]
};

// 카테고리별 랜덤 문제 유형 선택
function getRandomQuestionType(category = null) {
  let typesToChooseFrom = [];
  
  if (category === 'grammar') {
    typesToChooseFrom = QUESTION_TYPES.GRAMMAR;
  } else if (category === 'reading') {
    typesToChooseFrom = QUESTION_TYPES.READING;
  } else if (category === 'vocabulary') {
    typesToChooseFrom = QUESTION_TYPES.VOCABULARY;
  } else {
    // 카테고리가 없으면 모든 유형에서 선택
    typesToChooseFrom = [
      ...QUESTION_TYPES.GRAMMAR,
      ...QUESTION_TYPES.READING,
      ...QUESTION_TYPES.VOCABULARY
    ];
  }
  
  if (typesToChooseFrom.length === 0) {
    return QUESTION_TYPES.GRAMMAR[0]; // 기본값
  }
  
  const randomIndex = Math.floor(Math.random() * typesToChooseFrom.length);
  return typesToChooseFrom[randomIndex];
}

export function renderExercisePage() {
  const text = window.appState?.inputText || '';
  
  if (!text) {
    return `
      <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div class="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <p class="text-gray-700 dark:text-gray-300 mb-4">연습 문제를 생성할 텍스트가 없습니다.</p>
          <button id="go-back-btn" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
            입력 페이지로 돌아가기
          </button>
        </div>
      </div>
    `;
  }
  
  return `
    <div class="exercise-layout min-h-screen bg-[#f8fafc] dark:bg-[#0f172a]">
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
          <h2 class="absolute left-1/2 transform -translate-x-1/2 text-lg font-black text-[#121417] dark:text-white tracking-tight font-display">연습 문제</h2>
          <div class="flex items-center gap-2">
            <button id="regenerate-btn" class="flex items-center gap-2 h-10 px-4 rounded-lg bg-[#4b91e2] hover:bg-blue-600 text-white text-sm font-bold shadow-md transition-colors">
              <span class="material-symbols-outlined text-[20px]">refresh</span>
              <span>새 문제 생성</span>
            </button>
            <button id="profile-icon-btn" class="p-2 text-gray-600 dark:text-gray-300" aria-label="profile"><span class="material-symbols-outlined">person</span></button>
          </div>
        </div>
      </div>

      <!-- Main Content Area with Chatbot -->
      <div class="flex h-[calc(100vh-64px)] overflow-hidden">
        <!-- Exercise Content -->
        <div class="flex-1 overflow-y-auto">
          <div class="max-w-4xl mx-auto px-6 py-8">
            <!-- Category Selection -->
            <div id="category-selection" class="mb-8">
              <div class="bg-white dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-gray-100/50 dark:border-gray-700/50">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">문제 유형을 선택하세요</h3>
                <div class="grid grid-cols-3 gap-4">
                  <button data-category="grammar" class="category-btn flex flex-col items-center justify-center p-6 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all hover:shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <span class="material-symbols-outlined text-4xl text-blue-600 dark:text-blue-400 mb-2">description</span>
                    <span class="font-semibold text-gray-900 dark:text-gray-100">문법</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">주어-동사, 시제, 관계사 등</span>
                  </button>
                  <button data-category="reading" class="category-btn flex flex-col items-center justify-center p-6 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-400 transition-all hover:shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                    <span class="material-symbols-outlined text-4xl text-purple-600 dark:text-purple-400 mb-2">menu_book</span>
                    <span class="font-semibold text-gray-900 dark:text-gray-100">내용</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">주제, 제목 찾기</span>
                  </button>
                  <button data-category="vocabulary" class="category-btn flex flex-col items-center justify-center p-6 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-amber-500 dark:hover:border-amber-400 transition-all hover:shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                    <span class="material-symbols-outlined text-4xl text-amber-600 dark:text-amber-400 mb-2">translate</span>
                    <span class="font-semibold text-gray-900 dark:text-gray-100">어휘</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">문맥상 단어 선택</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Loading Indicator -->
            <div id="loading-indicator" class="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl text-center border border-purple-100 dark:border-purple-800 shadow-sm" style="display: none;">
              <div class="flex items-center justify-center gap-3">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 dark:border-purple-400"></div>
                <p class="text-purple-700 dark:text-purple-300 font-medium">문제 생성 중... 잠시만 기다려주세요.</p>
              </div>
            </div>
            
            <!-- Exercise Container -->
            <div id="exercise-container" class="space-y-6" style="display: none;">
              <!-- Problem Type Card -->
              <div id="question-type-card" class="bg-white dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-gray-100/50 dark:border-gray-700/50" style="display: none;">
                <div class="flex items-center gap-3">
                  <div class="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 dark:from-purple-600 dark:to-pink-700 flex items-center justify-center shadow-sm">
                    <span class="material-symbols-outlined text-white text-lg">quiz</span>
                  </div>
                  <div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">문제 유형</div>
                    <div id="question-type-name" class="text-lg font-semibold text-gray-900 dark:text-gray-100"></div>
                  </div>
                </div>
              </div>

              <!-- Question Card -->
              <div id="question-card" class="bg-white dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-gray-100/50 dark:border-gray-700/50" style="display: none;">
                <div class="mb-4">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">문제</h3>
                  <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div id="question-text" class="text-base text-gray-800 dark:text-gray-200 leading-relaxed"></div>
                  </div>
                </div>
                
                <!-- Options -->
                <div id="options-container" class="space-y-3 mt-4">
                  <!-- Options will be dynamically inserted here -->
                </div>
              </div>

              <!-- Answer Button -->
              <div id="answer-button-container" class="flex justify-center" style="display: none;">
                <button id="check-answer-btn" class="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg font-medium">
                  정답 확인하기
                </button>
              </div>

              <!-- Explanation Card -->
              <div id="explanation-card" class="bg-white dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-gray-100/50 dark:border-gray-700/50" style="display: none;">
                <div class="flex items-start gap-3 mb-4">
                  <div class="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 dark:from-green-600 dark:to-teal-700 flex items-center justify-center shadow-sm">
                    <span class="material-symbols-outlined text-white text-lg">lightbulb</span>
                  </div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">해설</h3>
                </div>
                
                <div id="explanation-content" class="space-y-4">
                  <!-- Explanation will be dynamically inserted here -->
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chatbot Sidebar -->
        <div id="chatbot-container" class="flex-shrink-0 w-[380px] border-l border-gray-200 dark:border-gray-700"></div>
      </div>
    </div>
  `;
}

export async function setupExercisePage() {
  const goBackBtn = document.getElementById('go-back-btn');
  const regenerateBtn = document.getElementById('regenerate-btn');
  const categorySelection = document.getElementById('category-selection');
  const exerciseContainer = document.getElementById('exercise-container');
  
  if (goBackBtn) {
    goBackBtn.addEventListener('click', () => {
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

  if (regenerateBtn) {
    regenerateBtn.addEventListener('click', () => {
      // 카테고리 선택 화면으로 돌아가기
      if (categorySelection) categorySelection.style.display = 'block';
      if (exerciseContainer) exerciseContainer.style.display = 'none';
      window.selectedCategory = null;
    });
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

  // 카테고리 선택 버튼 이벤트
  const categoryBtns = document.querySelectorAll('.category-btn');
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      
      // 선택된 버튼 스타일 적용
      categoryBtns.forEach(b => {
        b.classList.remove('border-blue-500', 'border-purple-500', 'border-amber-500', 'dark:border-blue-400', 'dark:border-purple-400', 'dark:border-amber-400');
        b.classList.add('border-gray-200', 'dark:border-gray-600');
      });
      
      if (category === 'grammar') {
        btn.classList.add('border-blue-500', 'dark:border-blue-400');
      } else if (category === 'reading') {
        btn.classList.add('border-purple-500', 'dark:border-purple-400');
      } else if (category === 'vocabulary') {
        btn.classList.add('border-amber-500', 'dark:border-amber-400');
      }
      
      // 카테고리 저장
      window.selectedCategory = category;
      
      // 문제 생성
      generateNewQuestion(category);
    });
  });

  // 챗봇 렌더링 및 설정
  const chatbotContainer = document.getElementById('chatbot-container');
  if (chatbotContainer) {
    chatbotContainer.innerHTML = renderChatbot();
    setupChatbot();
  }

  // 초기 상태: 카테고리 선택 화면만 표시
  if (categorySelection) categorySelection.style.display = 'block';
  if (exerciseContainer) exerciseContainer.style.display = 'none';
}

// 새 문제 생성
async function generateNewQuestion(category = null) {
  const text = window.appState?.inputText || '';
  if (!text) return;

  const categorySelection = document.getElementById('category-selection');
  const loadingIndicator = document.getElementById('loading-indicator');
  const exerciseContainer = document.getElementById('exercise-container');
  const questionTypeCard = document.getElementById('question-type-card');
  const questionCard = document.getElementById('question-card');
  const answerButtonContainer = document.getElementById('answer-button-container');
  const explanationCard = document.getElementById('explanation-card');

  // 카테고리 선택 화면 숨기기
  if (categorySelection) categorySelection.style.display = 'none';
  if (exerciseContainer) exerciseContainer.style.display = 'block';

  // 로딩 상태로 전환
  if (loadingIndicator) loadingIndicator.style.display = 'block';
  if (questionTypeCard) questionTypeCard.style.display = 'none';
  if (questionCard) questionCard.style.display = 'none';
  if (answerButtonContainer) answerButtonContainer.style.display = 'none';
  if (explanationCard) explanationCard.style.display = 'none';

  // 선택된 카테고리 또는 전달받은 카테고리 사용
  const selectedCategory = category || window.selectedCategory || null;
  
  // 랜덤 문제 유형 선택
  const randomType = getRandomQuestionType(selectedCategory);

  try {
    // GPT 문제 생성
    const exercise = await generateExerciseWithGPT(text, randomType.id);
    
    if (!exercise) {
      throw new Error('Exercise generation failed');
    }

    // 문제 유형 표시
    if (questionTypeCard && document.getElementById('question-type-name')) {
      document.getElementById('question-type-name').textContent = exercise.questionTypeName || randomType.name;
      questionTypeCard.style.display = 'block';
    }

    // 문제 표시
    if (questionCard) {
      const questionText = document.getElementById('question-text');
      const optionsContainer = document.getElementById('options-container');

      if (questionText) {
        questionText.textContent = exercise.question || '';
      }

      // 선택지 생성
      if (optionsContainer && exercise.options) {
        optionsContainer.innerHTML = '';
        const options = ['A', 'B', 'C', 'D', 'E'];
        options.forEach(option => {
          if (exercise.options[option]) {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'flex items-start gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-colors option-item';
            optionDiv.dataset.option = option;
            optionDiv.innerHTML = `
              <div class="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-semibold text-gray-700 dark:text-gray-300 option-label">
                ${option}
              </div>
              <div class="flex-1 text-gray-800 dark:text-gray-200 option-text">
                ${escapeHtml(exercise.options[option])}
              </div>
            `;
            
            // 선택 이벤트
            optionDiv.addEventListener('click', () => {
              selectOption(option, exercise.correctAnswer);
            });
            
            optionsContainer.appendChild(optionDiv);
          }
        });
      }

      questionCard.style.display = 'block';
    }

    // 정답 확인 버튼 표시
    if (answerButtonContainer) {
      answerButtonContainer.style.display = 'flex';
      const checkAnswerBtn = document.getElementById('check-answer-btn');
      if (checkAnswerBtn) {
        checkAnswerBtn.onclick = () => {
          showExplanation(exercise);
        };
      }
    }

    // 전역에 문제 데이터 저장
    window.currentExercise = exercise;

    // 로딩 숨기기
    if (loadingIndicator) loadingIndicator.style.display = 'none';

  } catch (error) {
    console.error('Exercise generation error:', error);
    
    if (loadingIndicator) {
      loadingIndicator.innerHTML = `
        <div class="text-red-600 dark:text-red-400">
          <p class="font-medium">문제 생성 중 오류가 발생했습니다.</p>
          <button onclick="location.reload()" class="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            다시 시도
          </button>
        </div>
      `;
    }
  }
}

// 선택지 선택
function selectOption(selectedOption, correctAnswer) {
  // 모든 선택지에서 선택 상태 제거
  document.querySelectorAll('.option-item').forEach(item => {
    item.classList.remove('selected', 'correct', 'incorrect');
    item.classList.add('border-gray-200', 'dark:border-gray-600');
    item.classList.remove('border-blue-500', 'border-green-500', 'border-red-500');
  });

  // 선택한 옵션 표시
  const selectedItem = document.querySelector(`[data-option="${selectedOption}"]`);
  if (selectedItem) {
    selectedItem.classList.add('selected');
    selectedItem.classList.add('border-blue-500', 'dark:border-blue-400');
    selectedItem.classList.remove('border-gray-200', 'dark:border-gray-600');
    
    // 선택된 옵션 저장
    window.selectedOption = selectedOption;
  }
}

// 해설 표시
function showExplanation(exercise) {
  if (!exercise) return;

  const explanationCard = document.getElementById('explanation-card');
  const explanationContent = document.getElementById('explanation-content');
  const answerButtonContainer = document.getElementById('answer-button-container');

  if (!explanationCard || !explanationContent) return;

  // 선택한 답안 표시
  const selectedOption = window.selectedOption;
  let explanationHTML = '';

  // 틀린 문제인 경우 자동 저장
  if (selectedOption && selectedOption !== exercise.correctAnswer) {
    try {
      saveWrongQuestion(
        exercise,
        selectedOption,
        exercise.correctAnswer,
        exercise.explanation,
        exercise.questionType || exercise.questionTypeName || '문제'
      );
      console.log('틀린 문제가 저장되었습니다.');
    } catch (error) {
      console.error('틀린 문제 저장 오류:', error);
    }
  }

  // 정답 표시
  explanationHTML += `
    <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
      <div class="flex items-start gap-3 mb-2">
        <span class="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
        <div class="flex-1">
          <div class="font-semibold text-green-900 dark:text-green-100 mb-1">정답: ${exercise.correctAnswer}</div>
          <p class="text-sm text-green-800 dark:text-green-200 leading-relaxed">${escapeHtml(exercise.explanation.correctAnswerExplanation)}</p>
        </div>
      </div>
    </div>
  `;

  // 오답 설명
  if (exercise.explanation.incorrectOptions && Object.keys(exercise.explanation.incorrectOptions).length > 0) {
    explanationHTML += `
      <div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
        <div class="font-semibold text-red-900 dark:text-red-100 mb-3">오답 설명</div>
        <div class="space-y-2">
    `;
    
    Object.entries(exercise.explanation.incorrectOptions).forEach(([option, reason]) => {
      explanationHTML += `
        <div class="flex items-start gap-2">
          <span class="font-semibold text-red-700 dark:text-red-300">${option}:</span>
          <span class="text-sm text-red-800 dark:text-red-200">${escapeHtml(reason)}</span>
        </div>
      `;
    });
    
    explanationHTML += `
        </div>
      </div>
    `;
  }

  // 추가 설명
  if (exercise.explanation.additionalNotes) {
    explanationHTML += `
      <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div class="flex items-start gap-3">
          <span class="material-symbols-outlined text-blue-600 dark:text-blue-400">info</span>
          <div class="flex-1">
            <div class="font-semibold text-blue-900 dark:text-blue-100 mb-1">추가 설명</div>
            <p class="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">${escapeHtml(exercise.explanation.additionalNotes)}</p>
          </div>
        </div>
      </div>
    `;
  }

  explanationContent.innerHTML = explanationHTML;
  explanationCard.style.display = 'block';

  // 선택한 답안과 정답 비교하여 시각적 피드백
  document.querySelectorAll('.option-item').forEach(item => {
    const option = item.dataset.option;
    item.classList.remove('border-blue-500', 'border-green-500', 'border-red-500');
    
    if (option === exercise.correctAnswer) {
      item.classList.add('border-green-500', 'dark:border-green-400');
      item.classList.add('correct');
      item.querySelector('.option-label').classList.add('bg-green-500', 'text-white');
    } else if (option === selectedOption && option !== exercise.correctAnswer) {
      item.classList.add('border-red-500', 'dark:border-red-400');
      item.classList.add('incorrect');
      item.querySelector('.option-label').classList.add('bg-red-500', 'text-white');
    }
  });

  // 정답 확인 버튼 숨기기
  if (answerButtonContainer) {
    answerButtonContainer.style.display = 'none';
  }

  // 스크롤을 해설 카드로 이동
  explanationCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// HTML 이스케이프 함수
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

