# 🔑 환경 변수 설정 가이드

## 문제 확인
`.env` 파일이 비어있거나 올바르게 설정되지 않았습니다.

## 해결 방법

### 1. .env 파일 편집
프로젝트 루트 디렉토리의 `.env` 파일을 열고 다음 형식으로 API 키를 입력하세요:

```
VITE_GPT_API_KEY=sk-proj-your-actual-api-key-here
```

### 2. 주의사항
- ✅ 반드시 `VITE_` 접두사를 사용하세요
- ✅ 등호(`=`) 양쪽에 공백이 없어야 합니다
- ✅ 따옴표는 사용하지 않습니다
- ✅ 한 줄로 작성합니다
- ✅ 파일 끝에 빈 줄이 있어도 괜찮습니다

### 3. 올바른 예시
```
VITE_GPT_API_KEY=sk-proj-1234567890abcdefghijklmnopqrstuvwxyz
```

### 4. 잘못된 예시
```
❌ VITE_GPT_API_KEY = sk-proj-... (공백 있음)
❌ VITE_GPT_API_KEY="sk-proj-..." (따옴표 사용)
❌ GPT_API_KEY=sk-proj-... (VITE_ 접두사 없음)
```

### 5. 서버 재시작
`.env` 파일을 저장한 후:
1. 개발 서버를 중지 (Ctrl+C)
2. `npm run dev`로 서버 재시작
3. 브라우저에서 페이지 새로고침 (F5)

### 6. 확인 방법
브라우저 개발자 도구(F12) → Console 탭에서:
- `=== API Key Debug Info ===` 메시지 확인
- `존재함 (길이: XX)` 메시지가 보이면 성공!













