import { savePost, getPosts, getPostById, deletePost, saveComment, getComments, deleteComment } from '../utils/communityStorage.js';

export function renderCommunityPage() {
  return `
    <div class="community-layout min-h-screen bg-[#f8fafc] dark:bg-[#0f172a]">
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
              <li>
                <button id="menu-item-community" class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 font-medium">
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

      <header class="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-[#f8fafc] dark:bg-[#1e293b] shadow-sm h-16">
        <div class="px-4 sm:px-10 h-full flex items-center justify-between">
          <button id="menu-btn" class="p-2 text-gray-600 dark:text-gray-300" aria-label="menu"><span class="material-symbols-outlined">menu</span></button>
          <h2 class="text-lg font-black text-[#121417] dark:text-white font-display">커뮤니티</h2>
          <button id="profile-icon-btn" class="p-2 text-gray-600 dark:text-gray-300" aria-label="profile"><span class="material-symbols-outlined">person</span></button>
        </div>
      </header>

      <div class="w-full min-h-[calc(100vh-64px)]">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <!-- 글 작성 버튼 -->
          <div class="mb-6 flex justify-end">
            <button id="write-post-btn" class="flex items-center gap-2 h-10 px-4 rounded-lg bg-[#4b91e2] hover:bg-blue-600 text-white text-sm font-bold shadow-md transition-colors">
              <span class="material-symbols-outlined text-[20px]">edit</span>
              <span>글 작성</span>
            </button>
          </div>

          <!-- 글 작성 폼 (모달) -->
          <div id="write-post-modal" class="hidden fixed inset-0 z-[100] bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div class="bg-white dark:bg-[#1e293b] rounded-2xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div class="p-6 border-b border-gray-200 dark:border-gray-800">
                <div class="flex items-center justify-between">
                  <h3 class="text-xl font-bold text-[#121417] dark:text-white">글 작성</h3>
                  <button id="close-write-modal" class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <span class="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>
              <div class="p-6">
                <form id="post-form">
                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">제목</label>
                    <input type="text" id="post-title" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1e293b] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4b91e2]" placeholder="제목을 입력하세요">
                  </div>
                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">본문</label>
                    <textarea id="post-content" required rows="10" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1e293b] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4b91e2]" placeholder="내용을 입력하세요"></textarea>
                  </div>
                  <div class="flex justify-end gap-3">
                    <button type="button" id="cancel-post" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">취소</button>
                    <button type="submit" class="px-4 py-2 bg-[#4b91e2] hover:bg-blue-600 text-white rounded-lg transition-colors font-medium">작성</button>
                  </div>
                </form>
              </div>
            </div>
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

export function setupCommunityPage() {
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
      if (window.toggleSidebar) window.toggleSidebar();
      if (window.navigateToPage) window.navigateToPage('input');
    });
  }

  const menuItemActivity = document.getElementById('menu-item-activity');
  if (menuItemActivity) {
    menuItemActivity.addEventListener('click', () => {
      if (window.toggleSidebar) window.toggleSidebar();
      if (window.navigateToPage) window.navigateToPage('myactivity');
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

  // 글 작성 버튼
  const writePostBtn = document.getElementById('write-post-btn');
  const writePostModal = document.getElementById('write-post-modal');
  const closeWriteModal = document.getElementById('close-write-modal');
  const cancelPost = document.getElementById('cancel-post');

  if (writePostBtn && writePostModal) {
    writePostBtn.addEventListener('click', () => {
      writePostModal.classList.remove('hidden');
    });
  }

  if (closeWriteModal) {
    closeWriteModal.addEventListener('click', () => {
      writePostModal.classList.add('hidden');
      document.getElementById('post-form').reset();
    });
  }

  if (cancelPost) {
    cancelPost.addEventListener('click', () => {
      writePostModal.classList.add('hidden');
      document.getElementById('post-form').reset();
    });
  }

  // 글 작성 폼 제출
  const postForm = document.getElementById('post-form');
  if (postForm) {
    postForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('post-title').value.trim();
      const content = document.getElementById('post-content').value.trim();
      
      if (!title || !content) {
        alert('제목과 본문을 모두 입력해주세요.');
        return;
      }

      const currentUserId = localStorage.getItem('currentUserId') || 'anonymous';
      const currentUserName = localStorage.getItem('currentUserName') || '익명';
      
      (async () => {
        try {
          await savePost(title, content, currentUserId, currentUserName);
          writePostModal.classList.add('hidden');
          postForm.reset();
          await loadPosts();
        } catch (error) {
          console.error('게시글 저장 오류:', error);
          alert('게시글 저장 중 오류가 발생했습니다.');
        }
      })();
    });
  }

  // 초기 게시글 로드
  (async () => {
    await loadPosts();
  })();
}

// 게시글 목록 로드
async function loadPosts() {
  const container = document.getElementById('posts-container');
  if (!container) return;

  const posts = await getPosts();
  
  if (posts.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-100 dark:border-gray-800">
        <span class="material-symbols-outlined text-gray-400 text-6xl mb-4">forum</span>
        <p class="text-gray-500 dark:text-gray-400">아직 작성된 글이 없습니다.</p>
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
      <div class="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow cursor-pointer" data-post-id="${post.id}">
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <h3 class="text-lg font-bold text-[#121417] dark:text-white mb-2">${escapeHtml(post.title)}</h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">${escapeHtml(post.content)}</p>
          </div>
        </div>
        <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div class="flex items-center gap-4">
            <span>${escapeHtml(post.authorName)}</span>
            <span>${formattedDate}</span>
          </div>
          <div class="flex items-center gap-4">
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-lg">comment</span>
              ${post.commentCount || 0}
            </span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // 게시글 클릭 이벤트
  container.querySelectorAll('[data-post-id]').forEach(element => {
    element.addEventListener('click', () => {
      const postId = element.getAttribute('data-post-id');
      (async () => {
        await showPostDetail(postId);
      })();
    });
  });
}

// 게시글 상세보기
async function showPostDetail(postId) {
  const post = await getPostById(postId);
  if (!post) return;

  const comments = await getComments(postId);
  const currentUserId = localStorage.getItem('currentUserId');
  
  const date = new Date(post.createdAt);
  const formattedDate = date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-[100] bg-black bg-opacity-50 flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="bg-white dark:bg-[#1e293b] rounded-2xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6 border-b border-gray-200 dark:border-gray-800">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold text-[#121417] dark:text-white">${escapeHtml(post.title)}</h3>
          <button class="close-detail-modal p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="mt-3 text-sm text-gray-500 dark:text-gray-400">
          <span>${escapeHtml(post.authorName)}</span>
          <span class="mx-2">·</span>
          <span>${formattedDate}</span>
          ${post.authorId === currentUserId ? `
            <button class="delete-post-btn ml-4 text-red-500 hover:text-red-700" data-post-id="${post.id}">삭제</button>
          ` : ''}
        </div>
      </div>
      <div class="p-6">
        <div class="prose dark:prose-invert max-w-none mb-6">
          <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">${escapeHtml(post.content)}</p>
        </div>
        
        <!-- 댓글 섹션 -->
        <div class="mt-8 border-t border-gray-200 dark:border-gray-800 pt-6">
          <h4 class="text-lg font-bold text-[#121417] dark:text-white mb-4">댓글 (${comments.length})</h4>
          
          <!-- 댓글 작성 폼 -->
          <form id="comment-form" class="mb-6">
            <textarea id="comment-content" required rows="3" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1e293b] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4b91e2]" placeholder="댓글을 입력하세요"></textarea>
            <div class="mt-2 flex justify-end">
              <button type="submit" class="px-4 py-2 bg-[#4b91e2] hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium">댓글 작성</button>
            </div>
          </form>
          
          <!-- 댓글 목록 -->
          <div id="comments-list" class="space-y-4">
            ${comments.length === 0 ? `
              <p class="text-gray-500 dark:text-gray-400 text-center py-4">아직 댓글이 없습니다.</p>
            ` : comments.map(comment => {
              const commentDate = new Date(comment.createdAt);
              const commentFormattedDate = commentDate.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
              return `
                <div class="flex gap-3">
                  <div class="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-2">
                      <span class="font-medium text-[#121417] dark:text-white">${escapeHtml(comment.authorName)}</span>
                      <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-500 dark:text-gray-400">${commentFormattedDate}</span>
                        ${comment.authorId === currentUserId ? `
                          <button class="delete-comment-btn text-red-500 hover:text-red-700 text-xs" data-comment-id="${comment.id}" data-post-id="${postId}">삭제</button>
                        ` : ''}
                      </div>
                    </div>
                    <p class="text-gray-700 dark:text-gray-300 text-sm">${escapeHtml(comment.content)}</p>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);

  // 닫기 버튼
  modal.querySelector('.close-detail-modal').addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  // 게시글 삭제
  const deletePostBtn = modal.querySelector('.delete-post-btn');
  if (deletePostBtn) {
    deletePostBtn.addEventListener('click', () => {
      if (confirm('정말 이 글을 삭제하시겠습니까?')) {
        (async () => {
          try {
            await deletePost(postId);
            document.body.removeChild(modal);
            await loadPosts();
          } catch (error) {
            console.error('게시글 삭제 오류:', error);
            alert('게시글 삭제 중 오류가 발생했습니다.');
          }
        })();
      }
    });
  }

  // 댓글 작성
  const commentForm = modal.querySelector('#comment-form');
  if (commentForm) {
    commentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const content = modal.querySelector('#comment-content').value.trim();
      if (!content) return;

      const currentUserName = localStorage.getItem('currentUserName') || '익명';
      saveComment(postId, content, currentUserId, currentUserName);
      document.body.removeChild(modal);
      showPostDetail(postId);
    });
  }

  // 댓글 삭제
  modal.querySelectorAll('.delete-comment-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const commentId = btn.getAttribute('data-comment-id');
      const postId = btn.getAttribute('data-post-id');
      if (confirm('정말 이 댓글을 삭제하시겠습니까?')) {
        (async () => {
          try {
            await deleteComment(commentId, postId);
            document.body.removeChild(modal);
            await showPostDetail(postId);
          } catch (error) {
            console.error('댓글 삭제 오류:', error);
            alert('댓글 삭제 중 오류가 발생했습니다.');
          }
        })();
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

