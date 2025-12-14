// 커뮤니티 게시글 및 댓글 저장 및 불러오기 유틸리티

const STORAGE_KEYS = {
  POSTS: 'community_posts',
  COMMENTS: 'community_comments'
};

// 게시글 저장
export function savePost(title, content, authorId, authorName) {
  const posts = getPosts();
  const newPost = {
    id: Date.now().toString(),
    title,
    content,
    authorId,
    authorName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isHidden: false,
    commentCount: 0
  };
  posts.unshift(newPost); // 최신이 위로
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  return newPost;
}

// 게시글 목록 불러오기
export function getPosts(includeHidden = false) {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.POSTS);
    const posts = data ? JSON.parse(data) : [];
    // 숨김 처리된 게시글 필터링
    if (!includeHidden) {
      return posts.filter(post => !post.isHidden);
    }
    return posts;
  } catch (error) {
    console.error('Failed to load posts:', error);
    return [];
  }
}

// 특정 게시글 가져오기
export function getPostById(postId) {
  const posts = getPosts(true); // 숨김 포함
  return posts.find(post => post.id === postId);
}

// 게시글 업데이트
export function updatePost(postId, title, content) {
  const posts = getPosts(true);
  const index = posts.findIndex(post => post.id === postId);
  if (index !== -1) {
    posts[index].title = title;
    posts[index].content = content;
    posts[index].updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return posts[index];
  }
  return null;
}

// 게시글 삭제
export function deletePost(postId) {
  const posts = getPosts(true);
  const filtered = posts.filter(post => post.id !== postId);
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(filtered));
  
  // 관련 댓글도 삭제
  const comments = getComments();
  const filteredComments = comments.filter(comment => comment.postId !== postId);
  localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(filteredComments));
}

// 게시글 숨김/표시 토글
export function togglePostVisibility(postId) {
  const posts = getPosts(true);
  const index = posts.findIndex(post => post.id === postId);
  if (index !== -1) {
    posts[index].isHidden = !posts[index].isHidden;
    posts[index].updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return posts[index];
  }
  return null;
}

// 댓글 저장
export function saveComment(postId, content, authorId, authorName) {
  const comments = getComments();
  const newComment = {
    id: Date.now().toString(),
    postId,
    content,
    authorId,
    authorName,
    createdAt: new Date().toISOString()
  };
  comments.push(newComment);
  localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
  
  // 게시글의 댓글 수 업데이트
  const posts = getPosts(true);
  const postIndex = posts.findIndex(post => post.id === postId);
  if (postIndex !== -1) {
    const postComments = comments.filter(c => c.postId === postId);
    posts[postIndex].commentCount = postComments.length;
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  }
  
  return newComment;
}

// 댓글 목록 불러오기
export function getComments(postId = null) {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const comments = data ? JSON.parse(data) : [];
    if (postId) {
      return comments.filter(comment => comment.postId === postId);
    }
    return comments;
  } catch (error) {
    console.error('Failed to load comments:', error);
    return [];
  }
}

// 댓글 삭제
export function deleteComment(commentId, postId) {
  const comments = getComments();
  const filtered = comments.filter(comment => comment.id !== commentId);
  localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(filtered));
  
  // 게시글의 댓글 수 업데이트
  const posts = getPosts(true);
  const postIndex = posts.findIndex(post => post.id === postId);
  if (postIndex !== -1) {
    const postComments = filtered.filter(c => c.postId === postId);
    posts[postIndex].commentCount = postComments.length;
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  }
}

