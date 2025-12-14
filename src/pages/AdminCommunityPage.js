import { getPosts, togglePostVisibility, deletePost } from '../utils/communityStorage.js';

export function renderAdminCommunityPage() {
  return `
    <div class="admin-community-layout min-h-screen bg-[#f8fafc] dark:bg-[#0f172a]">
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
                <button id="menu-item-admin-main" class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <span class="material-symbols-outlined">dashboard</span>
                  <span>사용자 활동 관리</span>
                </button>
              </li>
              <li>
                <button id="menu-item-admin-community" class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 font-medium">
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
          <h2 class="text-lg font-black text-[#121417] dark:text-white font-display">커뮤니티 관리</h2>
          <button id="profile-icon-btn" class="p-2 text-gray-600 dark:text-gray-300" aria-label="profile"><span class="material-symbols-outlined">person</span></button>
        </div>
      </header>

      <div class="w-full min-h-[calc(100vh-64px)]">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <!-- 필터 옵션 -->
          <div class="mb-6 flex items-center gap-4">
            <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" id="show-hidden" class="rounded border-gray-300 dark:border-gray-600">
              숨김 처리된 글 포함
            </label>
          </div>

          <!-- 게시글 목록 -->
          <div id="posts-container" class="space-y-4">
            <!-- 동적으로 추가됨 -->
          </div>
        </div>
      </div>
    </div>
  `;
}

export function setupAdminCommunityPage() {
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

  // 프로필 아이콘
  const profileIconBtn = document.getElementById('profile-icon-btn');
  if (profileIconBtn) {
    profileIconBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.toggleProfileDropdown) {
        window.toggleProfileDropdown();
      }
    });
  }

  // 숨김 처리된 글 포함 체크박스
  const showHiddenCheckbox = document.getElementById('show-hidden');
  if (showHiddenCheckbox) {
    showHiddenCheckbox.addEventListener('change', () => {
      loadPosts(showHiddenCheckbox.checked);
    });
  }

  // 초기 게시글 로드
  loadPosts(false);
}

// 게시글 목록 로드
function loadPosts(includeHidden = false) {
  const container = document.getElementById('posts-container');
  if (!container) return;

  const posts = getPosts(includeHidden);
  
  if (posts.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-100 dark:border-gray-800">
        <span class="material-symbols-outlined text-gray-400 text-6xl mb-4">forum</span>
        <p class="text-gray-500 dark:text-gray-400">등록된 게시글이 없습니다.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = posts.map(post => {
    const date = new Date(post.createdAt);
    const formattedDate = date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div class="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 ${post.isHidden ? 'opacity-60' : ''}">
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <h3 class="text-lg font-bold text-[#121417] dark:text-white">${escapeHtml(post.title)}</h3>
              ${post.isHidden ? `
                <span class="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">숨김</span>
              ` : ''}
            </div>
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3">${escapeHtml(post.content)}</p>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>${escapeHtml(post.authorName)}</span>
            <span>${formattedDate}</span>
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-lg">comment</span>
              ${post.commentCount || 0}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button class="toggle-visibility-btn px-4 py-2 text-sm rounded-lg transition-colors ${
              post.isHidden 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }" data-post-id="${post.id}" data-is-hidden="${post.isHidden}">
              ${post.isHidden ? '표시' : '숨김'}
            </button>
            <button class="delete-post-btn px-4 py-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors" data-post-id="${post.id}">
              삭제
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // 숨김/표시 버튼 이벤트
  container.querySelectorAll('.toggle-visibility-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const postId = btn.getAttribute('data-post-id');
      const isHidden = btn.getAttribute('data-is-hidden') === 'true';
      
      if (confirm(isHidden ? '이 글을 다시 표시하시겠습니까?' : '이 글을 숨기시겠습니까?')) {
        togglePostVisibility(postId);
        const showHiddenCheckbox = document.getElementById('show-hidden');
        loadPosts(showHiddenCheckbox ? showHiddenCheckbox.checked : false);
      }
    });
  });

  // 삭제 버튼 이벤트
  container.querySelectorAll('.delete-post-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const postId = btn.getAttribute('data-post-id');
      
      if (confirm('정말 이 글을 삭제하시겠습니까? (댓글도 함께 삭제됩니다)')) {
        deletePost(postId);
        const showHiddenCheckbox = document.getElementById('show-hidden');
        loadPosts(showHiddenCheckbox ? showHiddenCheckbox.checked : false);
      }
    });
  });
}

// HTML 이스케이프
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

