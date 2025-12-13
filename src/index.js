import { auth, googleProvider, isAdminUser } from './firebaseConfig.js';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

// 인증 상태 관리
let currentUser = null;
let userRole = 'student'; // 기본값은 학생

// DOM 요소 가져오기 함수
function getDOMElements() {
  return {
    loginScreen: document.getElementById('login-screen'),
    googleLoginBtn: document.getElementById('google-login-btn'),
    logoutBtn: document.getElementById('profile-logout-btn'),
    loginStatus: document.getElementById('login-status'),
    loginStatusContent: document.getElementById('login-status-content'),
    firebaseError: document.getElementById('firebase-error'),
    roleStudentBtn: document.getElementById('role-student-btn'),
    roleTeacherBtn: document.getElementById('role-teacher-btn'),
    selectedRoleInput: document.getElementById('selected-role'),
    profileDropdown: document.getElementById('profile-dropdown'),
    profileName: document.getElementById('profile-name'),
    profileEmail: document.getElementById('profile-email'),
    profileAvatar: document.getElementById('profile-avatar'),
    profileRoleBadge: document.getElementById('profile-role-badge')
  };
}

// 역할 선택 함수
function setupRoleSelection() {
  const { roleStudentBtn, roleTeacherBtn, selectedRoleInput } = getDOMElements();
  
  const selectRole = (role) => {
    userRole = role;
    if (selectedRoleInput) {
      selectedRoleInput.value = role;
    }
    
    // 버튼 스타일 업데이트
    if (roleStudentBtn) {
      if (role === 'student') {
        roleStudentBtn.classList.add('selected');
        roleTeacherBtn?.classList.remove('selected');
      } else {
        roleStudentBtn.classList.remove('selected');
      }
    }
    
    if (roleTeacherBtn) {
      if (role === 'teacher') {
        roleTeacherBtn.classList.add('selected');
        roleStudentBtn?.classList.remove('selected');
      } else {
        roleTeacherBtn.classList.remove('selected');
      }
    }
  };
  
  if (roleStudentBtn) {
    roleStudentBtn.addEventListener('click', () => selectRole('student'));
    // 기본값 설정
    roleStudentBtn.classList.add('selected');
  }
  
  if (roleTeacherBtn) {
    roleTeacherBtn.addEventListener('click', () => selectRole('teacher'));
  }
}

// Google 로그인 함수
async function handleGoogleLogin() {
  if (!auth || !googleProvider) {
    const { firebaseError } = getDOMElements();
    if (firebaseError) {
      firebaseError.style.display = 'block';
    }
    console.error('Firebase Auth 또는 Google Provider가 초기화되지 않았습니다.');
    return;
  }
  
  const { loginScreen, loginStatus, loginStatusContent, firebaseError, selectedRoleInput } = getDOMElements();
  
  // 선택된 역할 가져오기
  if (selectedRoleInput) {
    userRole = selectedRoleInput.value || 'student';
  }
  
  // Firebase 오류 메시지 숨기기
  if (firebaseError) {
    firebaseError.style.display = 'none';
  }
  
  try {
    if (loginStatus && loginStatusContent) {
      loginStatus.style.display = 'block';
      loginStatusContent.innerHTML = `
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span class="text-blue-600 dark:text-blue-400">로그인 중...</span>
      `;
      loginStatusContent.className = 'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
    }
    
    const result = await signInWithPopup(auth, googleProvider);
    currentUser = result.user;
    
    // 교사 역할로 로그인한 경우 관리자 권한 확인
    if (userRole === 'teacher') {
      const userId = result.user.uid;
      console.log('교사 로그인 시도 - 사용자 UID:', userId);
      const isAdmin = isAdminUser(userId);
      console.log('관리자 권한 확인 결과:', isAdmin);
      
      if (!isAdmin) {
        // 로그인 상태 메시지 숨기기
        if (loginStatus) {
          loginStatus.style.display = 'none';
        }
        
        // 관리자 권한 없음 팝업 표시
        showAdminAccessDeniedModal();
        
        // 로그인 실패 처리 (사용자 정보 저장하지 않음)
        return;
      }
    }
    
    // 로컬 스토리지에 역할 및 사용자 정보 저장
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('currentUserId', result.user.uid);
    localStorage.setItem('currentUserName', result.user.displayName || result.user.email || '사용자');
    
    if (loginStatus && loginStatusContent) {
      loginStatusContent.innerHTML = `
        <span class="material-symbols-outlined text-green-600">check_circle</span>
        <span class="text-green-600 dark:text-green-400">로그인 성공!</span>
      `;
      loginStatusContent.className = 'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      
      setTimeout(() => {
        if (loginScreen) loginScreen.style.display = 'none';
        if (loginStatus) loginStatus.style.display = 'none';
        
        // 사용자 정보 업데이트 및 페이지 이동 (명시적 로그인이므로 shouldNavigate = true)
        updateUserUI(currentUser, true);
      }, 1000);
    }
  } catch (error) {
    console.error('Google 로그인 오류:', error);
    if (loginStatus && loginStatusContent) {
      loginStatusContent.innerHTML = `
        <span class="material-symbols-outlined text-red-600">error</span>
        <span class="text-red-600 dark:text-red-400">로그인 실패: ${error.message || '알 수 없는 오류'}</span>
      `;
      loginStatusContent.className = 'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400';
    }
  }
}

// 로그아웃 함수
async function handleLogout() {
  const { loginScreen, profileDropdown } = getDOMElements();
  
  try {
    if (auth) {
      await signOut(auth);
    }
    currentUser = null;
    userRole = 'student';
    localStorage.removeItem('userRole');
    
    // 프로필 드롭다운 숨기기
    if (profileDropdown) {
      profileDropdown.style.display = 'none';
    }
    
    // 로그인 화면 표시
    if (loginScreen) {
      loginScreen.style.display = 'flex';
    }
    
    // 앱 콘텐츠 숨기기
    const app = document.getElementById('app');
    if (app) {
      app.style.display = 'none';
    }
  } catch (error) {
    console.error('로그아웃 오류:', error);
    alert('로그아웃 중 오류가 발생했습니다.');
  }
}

// 사용자 정보 업데이트
function updateUserUI(user, shouldNavigate = false) {
  const {
    loginScreen,
    firebaseError,
    profileDropdown,
    profileName,
    profileEmail,
    profileAvatar,
    profileRoleBadge
  } = getDOMElements();
  
  const app = document.getElementById('app');
  
  if (user) {
    // 로컬 스토리지에서 역할 가져오기
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) {
      userRole = savedRole;
    }
    
    // 프로필 정보 업데이트
    if (profileName) {
      profileName.textContent = user.displayName || user.email || '사용자';
    }
    if (profileEmail) {
      profileEmail.textContent = user.email || '';
    }
    if (profileAvatar && user.photoURL) {
      profileAvatar.src = user.photoURL;
      profileAvatar.style.display = 'block';
    }
    if (profileRoleBadge) {
      profileRoleBadge.textContent = userRole === 'teacher' ? '교사' : '학생';
      profileRoleBadge.className = `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        userRole === 'teacher' 
          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      }`;
    }
    
    // 명시적으로 로그인한 경우에만 화면 전환 (shouldNavigate가 true일 때만)
    if (shouldNavigate) {
      // 로그인 화면 숨김
      if (loginScreen) {
        loginScreen.style.display = 'none';
      }
      
      // 메인 앱 콘텐츠 표시
      if (app) {
        app.style.display = 'block';
      }
      
      // 앱 초기 렌더링 (main.js의 render 함수 호출)
      if (window.render) {
        window.render();
      }
      
      // 역할에 따라 페이지 이동
      if (window.navigateToPage) {
        if (userRole === 'teacher') {
          window.navigateToPage('admin');
        } else {
          window.navigateToPage('input');
        }
      }
    }
    
    // Firebase 오류 메시지 숨김
    if (firebaseError) {
      firebaseError.style.display = 'none';
    }
  } else {
    // 로그아웃 상태
    if (profileDropdown) {
      profileDropdown.style.display = 'none';
    }
    if (loginScreen) {
      loginScreen.style.display = 'flex';
    }
    
    // 메인 앱 콘텐츠 숨김
    if (app) {
      app.style.display = 'none';
    }
  }
}

// 프로필 드롭다운 토글
function toggleProfileDropdown() {
  const { profileDropdown } = getDOMElements();
  if (profileDropdown) {
    const isVisible = profileDropdown.style.display !== 'none';
    profileDropdown.style.display = isVisible ? 'none' : 'block';
  }
}

// 외부 클릭 시 드롭다운 닫기
document.addEventListener('click', (e) => {
  const { profileDropdown } = getDOMElements();
  const profileIconBtn = document.getElementById('profile-icon-btn');
  
  if (profileDropdown && profileIconBtn) {
    if (!profileDropdown.contains(e.target) && !profileIconBtn.contains(e.target)) {
      profileDropdown.style.display = 'none';
      profileIconBtn.classList.remove('active');
    }
  }
});

// 이벤트 리스너 설정
function setupAuth() {
  // DOM 요소 다시 가져오기 (페이지 로드 후 실행 보장)
  const { loginScreen, googleLoginBtn, logoutBtn, firebaseError } = getDOMElements();
  
  console.log('setupAuth 실행됨', { loginScreen, googleLoginBtn, logoutBtn, auth });
  
  // 역할 선택 설정
  setupRoleSelection();
  
  // Google 로그인 버튼 클릭
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', handleGoogleLogin);
  }
  
  // 로그아웃 버튼 클릭
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // 프로필 아이콘 버튼 클릭 (페이지에서 동적으로 추가됨)
  setTimeout(() => {
    const profileIconBtn = document.getElementById('profile-icon-btn');
    if (profileIconBtn) {
      profileIconBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleProfileDropdown();
        profileIconBtn.classList.toggle('active');
      });
    }
  }, 100);
  
  // Firebase가 초기화된 경우에만 인증 상태 감지
  if (auth) {
    try {
      onAuthStateChanged(auth, (user) => {
        console.log('Auth state changed:', user ? '로그인됨' : '로그아웃됨');
        currentUser = user;
        
        // 자동 이동하지 않음 - 명시적 로그인 시에만 이동
        // 프로필 정보만 업데이트
        updateUserUI(user, false);
        
        // 항상 로그인 화면 표시 (사용자가 명시적으로 로그인할 때까지)
        if (loginScreen) {
          loginScreen.style.display = 'flex';
          const app = document.getElementById('app');
          if (app) {
            app.style.display = 'none';
          }
        }
        
        // 로그인되지 않은 경우 오류 메시지 처리
        if (!user && firebaseError) {
          // Firebase 오류 메시지는 Firebase 초기화 실패 시에만 표시
          // (이미 위에서 로그인 화면 표시됨)
        }
      });
    } catch (error) {
      console.error('Firebase Auth 초기화 오류:', error);
      // Firebase 초기화 실패 시에도 화면 표시
      if (loginScreen) {
        loginScreen.style.display = 'flex';
      }
      if (firebaseError) {
        firebaseError.style.display = 'block';
      }
    }
  } else {
    // Firebase가 초기화되지 않은 경우에도 화면 표시
    console.warn('Firebase가 초기화되지 않았습니다. 로그인 화면을 표시합니다.');
    if (loginScreen) {
      loginScreen.style.display = 'flex';
    }
    // Firebase 설정 오류 메시지 표시
    if (firebaseError) {
      firebaseError.style.display = 'block';
    }
    if (googleLoginBtn) {
      googleLoginBtn.disabled = true;
      googleLoginBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
  }
}

// 사이드바 토글 함수
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar-menu');
  const overlay = document.getElementById('sidebar-overlay');
  
  if (sidebar && overlay) {
    const isOpen = !sidebar.classList.contains('-translate-x-full');
    
    if (isOpen) {
      // 사이드바 닫기
      sidebar.classList.add('-translate-x-full');
      overlay.classList.add('hidden');
    } else {
      // 사이드바 열기
      sidebar.classList.remove('-translate-x-full');
      overlay.classList.remove('hidden');
    }
  }
}

// 관리자 권한 없음 팝업 표시
function showAdminAccessDeniedModal() {
  const modal = document.getElementById('admin-access-denied-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // 확인 버튼 클릭 시 팝업 닫기
    const closeBtn = document.getElementById('close-admin-modal-btn');
    if (closeBtn) {
      const closeModal = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      };
      
      // 기존 이벤트 리스너 제거 후 새로 추가
      closeBtn.replaceWith(closeBtn.cloneNode(true));
      const newCloseBtn = document.getElementById('close-admin-modal-btn');
      newCloseBtn.addEventListener('click', closeModal);
      
      // 모달 배경 클릭 시 닫기
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal();
        }
      });
    }
  }
}

// 전역에서 접근 가능하도록 내보내기
window.currentUser = () => currentUser;
window.isAuthenticated = () => currentUser !== null;
window.getUserRole = () => userRole;
window.toggleProfileDropdown = toggleProfileDropdown;
window.toggleSidebar = toggleSidebar;

// DOM 로드 후 초기화 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // 로그인 화면이 표시되는 동안 메인 앱 콘텐츠 숨기기
    const app = document.getElementById('app');
    if (app) {
      app.style.display = 'none';
    }
    setupAuth();
  });
} else {
  // DOM이 이미 로드된 경우
  const app = document.getElementById('app');
  if (app) {
    app.style.display = 'none';
  }
  setupAuth();
}
