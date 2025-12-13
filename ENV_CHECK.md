# Firebase 환경변수 설정 가이드

## 문제 해결 체크리스트

.env 파일이 있지만 "Firebase 설정이 필요합니다" 메시지가 나타나는 경우:

### 1. .env 파일 위치 확인
- `.env` 파일은 프로젝트 루트에 있어야 합니다 (`package.json`과 같은 위치)
- 예: `C:\Users\User\Documents\GitHub\final_project_1206\.env`

### 2. 환경변수 이름 확인
**중요**: Vite에서는 환경변수 이름이 `VITE_`로 시작해야 합니다!

✅ 올바른 형식:
```
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

❌ 잘못된 형식:
```
FIREBASE_API_KEY=...  (VITE_ 접두사 없음)
VITE_firebase_api_key=...  (대소문자 주의)
```

### 3. .env 파일 형식 확인
- 등호(`=`) 앞뒤에 공백이 없어야 합니다
- 값에 공백이 있다면 따옴표로 감싸야 합니다
- 주석은 `#`으로 시작합니다

✅ 올바른 형식:
```
VITE_FIREBASE_API_KEY=AIzaSyAbc123...
VITE_FIREBASE_AUTH_DOMAIN=myproject.firebaseapp.com
```

❌ 잘못된 형식:
```
VITE_FIREBASE_API_KEY = AIzaSyAbc123...  (공백 있음)
VITE_FIREBASE_API_KEY=AIzaSyAbc123...  # 주석
```

### 4. 개발 서버 재시작
**중요**: `.env` 파일을 수정한 후에는 **반드시** 개발 서버를 재시작해야 합니다!

1. 현재 실행 중인 서버 중지 (Ctrl+C)
2. `npm run dev` 다시 실행

### 5. 브라우저 콘솔 확인
개발자 도구(F12) → Console 탭에서 다음 메시지를 확인:
- "Firebase 초기화 성공" → 정상
- "Firebase 설정값이 없습니다" → 환경변수 로드 실패
- 환경변수 값들이 제대로 표시되는지 확인

### 6. vite.config.js 확인
현재 vite.config.js는 기본 설정만 있습니다. 특별한 설정이 필요하지 않습니다.

### 디버깅 팁
브라우저 콘솔에서 `import.meta.env`를 입력하면 로드된 모든 환경변수를 확인할 수 있습니다.








