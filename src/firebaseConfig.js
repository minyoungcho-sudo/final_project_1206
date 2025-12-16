import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 환경변수에서 Firebase 설정값 불러오기
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// 디버깅: 환경변수 확인 (개발 환경에서만)
if (import.meta.env.DEV) {
  console.log('Firebase 환경변수 확인:', {
    hasApiKey: !!firebaseConfig.apiKey,
    hasAuthDomain: !!firebaseConfig.authDomain,
    hasProjectId: !!firebaseConfig.projectId,
    apiKeyLength: firebaseConfig.apiKey?.length || 0,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    allEnvKeys: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_FIREBASE'))
  });
}

// Firebase 설정값 확인 (값이 있고 빈 문자열이 아닌지 확인)
const hasFirebaseConfig = firebaseConfig.apiKey && 
                          firebaseConfig.apiKey.trim() !== '' &&
                          firebaseConfig.authDomain && 
                          firebaseConfig.authDomain.trim() !== '' &&
                          firebaseConfig.projectId &&
                          firebaseConfig.projectId.trim() !== '';

let app = null;
let auth = null;
let googleProvider = null;
let db = null;

if (hasFirebaseConfig) {
  try {
    // Firebase 초기화
    app = initializeApp(firebaseConfig);
    
    // Auth 및 Google Auth Provider 초기화
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    
    // Firestore 초기화
    db = getFirestore(app);
    
    console.log('Firebase 초기화 성공');
    console.log('Firestore 초기화:', !!db);
  } catch (error) {
    console.error('Firebase 초기화 오류:', error);
  }
} else {
  console.warn('Firebase 설정값이 없습니다. 환경변수를 확인해주세요.');
  console.warn('현재 로드된 값:', {
    apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'undefined',
    authDomain: firebaseConfig.authDomain || 'undefined',
    projectId: firebaseConfig.projectId || 'undefined'
  });
}

// 관리자 UID 확인 함수
export function isAdminUser(userId) {
  // 환경 변수에서 관리자 UID 리스트 가져오기 (쉼표로 구분)
  const adminUids = import.meta.env.VITE_ADMIN_UIDS || '';
  
  // 디버깅: 환경 변수 확인
  if (import.meta.env.DEV) {
    console.log('관리자 UID 확인:', {
      envValue: adminUids,
      envValueType: typeof adminUids,
      envValueLength: adminUids?.length || 0,
      userId: userId,
      allEnvKeys: Object.keys(import.meta.env).filter(key => key.includes('ADMIN'))
    });
  }
  
  if (!adminUids || adminUids.trim() === '') {
    console.warn('관리자 UID가 설정되지 않았습니다.');
    console.warn('VITE_ADMIN_UIDS 환경 변수를 .env 파일에 추가해주세요.');
    return false;
  }
  
  // 쉼표로 구분된 UID 리스트를 배열로 변환
  const adminUidList = adminUids.split(',').map(uid => uid.trim()).filter(uid => uid.length > 0);
  
  // 디버깅: 파싱된 UID 리스트 확인
  if (import.meta.env.DEV) {
    console.log('파싱된 관리자 UID 리스트:', adminUidList);
    console.log('현재 사용자 UID:', userId);
    console.log('일치 여부:', adminUidList.includes(userId));
  }
  
  // 현재 사용자 UID가 관리자 리스트에 있는지 확인
  return adminUidList.includes(userId);
}

export { auth, googleProvider, db };
export default app;
