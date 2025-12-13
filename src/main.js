import './style.css'
import { renderInputPage, setupInputPage } from './pages/InputPage.js'
import { renderAnalysisPage, setupAnalysisPage } from './pages/AnalysisPage.js'
import { renderContentAnalysisPage, setupContentAnalysisPage } from './pages/ContentAnalysisPage.js'
import { renderExercisePage, setupExercisePage } from './pages/ExercisePage.js'
import { renderAdminPage, setupAdminPage } from './pages/AdminPage.js'
import { renderMyActivityPage, setupMyActivityPage } from './pages/MyActivityPage.js'
import { isAdminUser } from './firebaseConfig.js'

// 전역 앱 상태
window.appState = {
  currentPage: 'input',
  inputText: ''
};

// 페이지 네비게이션 함수
window.navigateToPage = function(page) {
  window.appState.currentPage = page;
  render();
};

// 메인 렌더링 함수
function render() {
  const app = document.querySelector('#app');
  if (!app) return;
  
  switch (window.appState.currentPage) {
    case 'input':
      app.innerHTML = renderInputPage();
      setupInputPage();
      break;
    case 'analysis':
      app.innerHTML = renderAnalysisPage();
      // 비동기 함수이므로 즉시 실행
      setupAnalysisPage().catch(err => {
        console.error('Error setting up analysis page:', err);
      });
      break;
    case 'content':
      app.innerHTML = renderContentAnalysisPage();
      // 비동기 함수이므로 즉시 실행
      setupContentAnalysisPage().catch(err => {
        console.error('Error setting up content analysis page:', err);
      });
      break;
    case 'exercise':
      app.innerHTML = renderExercisePage();
      // 비동기 함수이므로 즉시 실행
      setupExercisePage().catch(err => {
        console.error('Error setting up exercise page:', err);
      });
      break;
    case 'admin':
      // 관리자 페이지 접근 권한 확인
      const currentUserId = localStorage.getItem('currentUserId');
      const userRole = localStorage.getItem('userRole');
      
      // 교사 역할이고 관리자 UID인지 확인
      if (userRole !== 'teacher' || !currentUserId || !isAdminUser(currentUserId)) {
        // 관리자 권한이 없으면 입력 페이지로 리다이렉트
        app.innerHTML = `
          <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div class="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
              <span class="material-symbols-outlined text-red-600 dark:text-red-400 text-6xl mb-4">block</span>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">접근 권한 없음</h2>
              <p class="text-gray-600 dark:text-gray-400 mb-6">관리자 페이지에 접근할 권한이 없습니다.</p>
              <button onclick="window.navigateToPage('input')" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                메인 페이지로 이동
              </button>
            </div>
          </div>
        `;
      } else {
        app.innerHTML = renderAdminPage();
        setupAdminPage();
      }
      break;
    case 'myactivity':
      app.innerHTML = renderMyActivityPage();
      setupMyActivityPage();
      break;
    default:
      app.innerHTML = renderInputPage();
      setupInputPage();
  }
}

// 전역으로 내보내기 (index.js에서 사용)
window.render = render;

// 로그인 후에만 초기 렌더링 (index.js에서 호출)
// render(); // 주석 처리 - 로그인 후에만 렌더링
