# Firestore 설정 가이드

## Firestore 보안 규칙 설정

Firebase Console에서 Firestore Database의 보안 규칙을 다음과 같이 설정해야 합니다:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자 데이터 접근 규칙
    match /users/{userId} {
      // 사용자는 자신의 데이터만 읽고 쓸 수 있음
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // 서브컬렉션 규칙
      match /difficultSentences/{sentenceId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /savedPassages/{passageId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /wrongQuestions/{questionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## 데이터 구조

Firestore에 저장되는 데이터 구조:

```
users/
  {userId}/
    - userId: string
    - userName: string
    - lastAccess: timestamp
    - createdAt: timestamp
    - updatedAt: timestamp
    difficultSentences/
      {sentenceId}/
        - userId: string
        - userName: string
        - sentence: string
        - analysis: object
        - translation: string
        - savedAt: timestamp
        - createdAt: timestamp
    savedPassages/
      {passageId}/
        - userId: string
        - userName: string
        - passage: string
        - contentAnalysis: object
        - savedAt: timestamp
        - createdAt: timestamp
    wrongQuestions/
      {questionId}/
        - userId: string
        - userName: string
        - question: string
        - selectedAnswer: string
        - correctAnswer: string
        - explanation: string
        - questionType: string
        - savedAt: timestamp
        - createdAt: timestamp
```

## 디버깅

브라우저 콘솔에서 다음 로그를 확인하세요:
- "Firebase 초기화 성공"
- "Firestore 초기화: true"
- "Firestore 저장 시도: ..."
- "Firestore에 ... 저장 성공"

에러가 발생하면 콘솔에 상세한 에러 메시지가 표시됩니다.



