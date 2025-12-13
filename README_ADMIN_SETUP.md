# 관리자 페이지 접근 제어 설정

관리자 페이지에 접근하려면 관리자 UID를 환경 변수에 설정해야 합니다.

## 환경 변수 설정

`.env` 파일에 다음 변수를 추가하세요:

```env
VITE_ADMIN_UIDS=your-admin-uid-1,your-admin-uid-2,your-admin-uid-3
```

### 여러 관리자 UID 설정
여러 관리자 UID를 설정하려면 쉼표(`,`)로 구분하세요:
```env
VITE_ADMIN_UIDS=uid1,uid2,uid3
```

## 관리자 UID 확인 방법

1. Firebase Console에 로그인합니다.
2. Authentication > Users 메뉴로 이동합니다.
3. 관리자 계정의 UID를 복사합니다.
4. `.env` 파일에 `VITE_ADMIN_UIDS` 변수에 UID를 추가합니다.

## 동작 방식

1. 로그인 화면에서 **교사** 역할을 선택합니다.
2. Google 로그인을 진행합니다.
3. 로그인한 사용자의 UID가 `VITE_ADMIN_UIDS`에 포함되어 있는지 확인합니다.
4. 관리자 UID가 아니면 "관리자 권한이 없습니다" 오류 메시지가 표시됩니다.
5. 관리자 UID가 맞으면 관리자 페이지로 이동합니다.

## .env 파일 예시

`.env` 파일에 다음과 같이 추가하세요:

```env
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

VITE_ADMIN_UIDS=your-admin-uid-1,your-admin-uid-2
```

**중요:**
- `VITE_ADMIN_UIDS`는 마지막 줄에 추가해도 됩니다
- 등호(`=`) 앞뒤에 공백이 없어야 합니다
- 여러 UID는 쉼표(`,`)로 구분합니다
- 따옴표는 필요하지 않습니다

## 문제 해결

### 관리자 UID가 인식되지 않는 경우:

1. **브라우저 콘솔 확인**
   - 개발자 도구(F12) → Console 탭 열기
   - 교사로 로그인 시도 시 다음 로그 확인:
     - "관리자 UID 확인:" - 환경 변수 값 확인
     - "파싱된 관리자 UID 리스트:" - 파싱된 UID 배열 확인
     - "현재 사용자 UID:" - 로그인한 사용자의 UID
     - "일치 여부:" - true/false

2. **.env 파일 형식 확인**
   ```
   ✅ 올바른 형식:
   VITE_ADMIN_UIDS=abc123def456,xyz789ghi012
   
   ❌ 잘못된 형식:
   VITE_ADMIN_UIDS = abc123def456  (공백 있음)
   VITE_ADMIN_UIDS="abc123def456"  (따옴표 불필요)
   ADMIN_UIDS=abc123def456  (VITE_ 접두사 없음)
   ```

3. **개발 서버 재시작**
   - `.env` 파일 수정 후 반드시 개발 서버를 중지하고 다시 시작해야 합니다
   - Ctrl+C로 중지 후 `npm run dev` 다시 실행

4. **UID 확인**
   - Firebase Console > Authentication > Users에서 정확한 UID 복사
   - UID에 공백이나 특수문자가 없는지 확인

## 참고

- 환경 변수 변경 후 개발 서버를 재시작해야 합니다.
- Vite에서는 환경 변수 이름이 `VITE_`로 시작해야 클라이언트 코드에서 접근할 수 있습니다.
- 관리자가 아닌 사용자가 교사로 로그인하면 접근이 차단됩니다.

