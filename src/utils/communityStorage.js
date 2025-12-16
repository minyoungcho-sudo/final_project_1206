// 커뮤니티 게시글 및 댓글 저장 및 불러오기 유틸리티 (Firestore 기반)
import { db } from '../firebaseConfig.js';
import { collection, doc, setDoc, updateDoc, addDoc, getDocs, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

// 게시글 저장
export async function savePost(title, content, authorId, authorName) {
  if (!db) {
    throw new Error('Firestore가 초기화되지 않았습니다.');
  }
  
  try {
    const postsRef = collection(db, 'communityPosts');
    const newPostRef = await addDoc(postsRef, {
      title,
      content,
      authorId,
      authorName,
      isHidden: false,
      commentCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return {
      id: newPostRef.id,
      title,
      content,
      authorId,
      authorName,
      isHidden: false,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Firestore에 게시글 저장 실패:', error);
    throw error;
  }
}

// 게시글 목록 불러오기 (모든 사용자의 게시글)
export async function getPosts(includeHidden = false) {
  if (!db) return [];
  
  try {
    const postsRef = collection(db, 'communityPosts');
    const postsSnapshot = await getDocs(postsRef);
    
    const posts = [];
    postsSnapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        title: data.title,
        content: data.content,
        authorId: data.authorId,
        authorName: data.authorName,
        isHidden: data.isHidden || false,
        commentCount: data.commentCount || 0,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      });
    });
    
    // createdAt 기준으로 정렬 (최신순)
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // 숨김 처리된 게시글 필터링
    if (!includeHidden) {
      return posts.filter(post => !post.isHidden);
    }
    return posts;
  } catch (error) {
    console.error('Firestore에서 게시글 가져오기 실패:', error);
    return [];
  }
}

// 특정 게시글 가져오기
export async function getPostById(postId) {
  if (!db) return null;
  
  try {
    const postRef = doc(db, 'communityPosts', postId);
    const postDoc = await getDoc(postRef);
    
    if (postDoc.exists()) {
      const data = postDoc.data();
      return {
        id: postDoc.id,
        title: data.title,
        content: data.content,
        authorId: data.authorId,
        authorName: data.authorName,
        isHidden: data.isHidden || false,
        commentCount: data.commentCount || 0,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    }
    return null;
  } catch (error) {
    console.error('Firestore에서 게시글 가져오기 실패:', error);
    return null;
  }
}

// 게시글 업데이트
export async function updatePost(postId, title, content) {
  if (!db) {
    throw new Error('Firestore가 초기화되지 않았습니다.');
  }
  
  try {
    const postRef = doc(db, 'communityPosts', postId);
    await updateDoc(postRef, {
      title,
      content,
      updatedAt: serverTimestamp()
    });
    
    const updatedPost = await getPostById(postId);
    return updatedPost;
  } catch (error) {
    console.error('Firestore에 게시글 업데이트 실패:', error);
    throw error;
  }
}

// 게시글 삭제
export async function deletePost(postId) {
  if (!db) {
    throw new Error('Firestore가 초기화되지 않았습니다.');
  }
  
  try {
    const postRef = doc(db, 'communityPosts', postId);
    
    // 관련 댓글도 삭제
    const commentsRef = collection(db, 'communityPosts', postId, 'comments');
    const commentsSnapshot = await getDocs(commentsRef);
    const deletePromises = commentsSnapshot.docs.map(commentDoc => deleteDoc(commentDoc.ref));
    await Promise.all(deletePromises);
    
    // 게시글 삭제
    await deleteDoc(postRef);
  } catch (error) {
    console.error('Firestore에서 게시글 삭제 실패:', error);
    throw error;
  }
}

// 게시글 숨김/표시 토글
export async function togglePostVisibility(postId) {
  if (!db) {
    throw new Error('Firestore가 초기화되지 않았습니다.');
  }
  
  try {
    const postRef = doc(db, 'communityPosts', postId);
    const postDoc = await getDoc(postRef);
    
    if (postDoc.exists()) {
      const currentData = postDoc.data();
      const newIsHidden = !(currentData.isHidden || false);
      
      await updateDoc(postRef, {
        isHidden: newIsHidden,
        updatedAt: serverTimestamp()
      });
      
      const updatedPost = await getPostById(postId);
      return updatedPost;
    }
    return null;
  } catch (error) {
    console.error('Firestore에 게시글 가시성 변경 실패:', error);
    throw error;
  }
}

// 댓글 저장
export async function saveComment(postId, content, authorId, authorName) {
  if (!db) {
    throw new Error('Firestore가 초기화되지 않았습니다.');
  }
  
  try {
    const commentsRef = collection(db, 'communityPosts', postId, 'comments');
    const newCommentRef = await addDoc(commentsRef, {
      postId,
      content,
      authorId,
      authorName,
      createdAt: serverTimestamp()
    });
    
    // 게시글의 댓글 수 업데이트
    const postRef = doc(db, 'communityPosts', postId);
    const commentsSnapshot = await getDocs(commentsRef);
    await updateDoc(postRef, {
      commentCount: commentsSnapshot.size,
      updatedAt: serverTimestamp()
    });
    
    return {
      id: newCommentRef.id,
      postId,
      content,
      authorId,
      authorName,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Firestore에 댓글 저장 실패:', error);
    throw error;
  }
}

// 댓글 목록 불러오기
export async function getComments(postId = null) {
  if (!db) return [];
  
  try {
    if (postId) {
      // 특정 게시글의 댓글만 가져오기
      const commentsRef = collection(db, 'communityPosts', postId, 'comments');
      const commentsSnapshot = await getDocs(commentsRef);
      
      const comments = [];
      commentsSnapshot.forEach((doc) => {
        const data = doc.data();
        comments.push({
          id: doc.id,
          postId: postId,
          content: data.content,
          authorId: data.authorId,
          authorName: data.authorName,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        });
      });
      
      // createdAt 기준으로 정렬 (오래된 순)
      comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      return comments;
    } else {
      // 모든 댓글 가져오기 (사용하지 않을 가능성이 높음)
      return [];
    }
  } catch (error) {
    console.error('Firestore에서 댓글 가져오기 실패:', error);
    return [];
  }
}

// 댓글 삭제
export async function deleteComment(commentId, postId) {
  if (!db) {
    throw new Error('Firestore가 초기화되지 않았습니다.');
  }
  
  try {
    const commentRef = doc(db, 'communityPosts', postId, 'comments', commentId);
    await deleteDoc(commentRef);
    
    // 게시글의 댓글 수 업데이트
    const postRef = doc(db, 'communityPosts', postId);
    const commentsRef = collection(db, 'communityPosts', postId, 'comments');
    const commentsSnapshot = await getDocs(commentsRef);
    await updateDoc(postRef, {
      commentCount: commentsSnapshot.size,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Firestore에서 댓글 삭제 실패:', error);
    throw error;
  }
}
