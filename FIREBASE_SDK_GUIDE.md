# Firebase SDK 설정 확인 및 적용 가이드

## 🔍 Firebase SDK 설정 확인 방법

### 1단계: Firebase 콘솔 접속
1. https://console.firebase.google.com 접속
2. 프로젝트 선택 또는 새 프로젝트 생성

### 2단계: 프로젝트 설정 접속
1. 좌측 하단 ⚙️ (톱니바퀴) 아이콘 클릭
2. "프로젝트 설정" 클릭

### 3단계: 웹 앱 등록 확인
1. "일반" 탭의 "내 앱" 섹션 확인
2. 웹 앱이 없으면 "웹 앱 추가" 클릭
3. 앱 닉네임: `3D Tetris Web` 입력
4. "앱 등록" 클릭

### 4단계: SDK 설정 복사
1. "SDK 설정 및 구성" 섹션에서 "구성" 선택
2. 다음과 같은 설정이 표시됩니다:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB...",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef..."
};
```

## 🔧 코드에 설정 적용

### index.html 파일 수정
`index.html` 파일의 1389번째 줄 근처에서 다음 부분을 찾습니다:

```javascript
// 현재 상태 (비활성화)
const firebaseConfig = null;
```

이 부분을 Firebase 콘솔에서 복사한 실제 설정으로 교체합니다:

```javascript
// Firebase 콘솔에서 복사한 실제 설정
const firebaseConfig = {
    apiKey: "AIzaSyB...실제_API_키",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef..."
};
```

## 🔒 Firestore 보안 규칙 설정

Firebase 콘솔의 Firestore > 규칙에서 다음 규칙을 설정:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 공개 랭킹 데이터
    match /scores/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // 개인 점수 데이터
    match /userScores/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 사용자 프로필 데이터
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🔐 Authentication 설정

1. Firebase 콘솔 > Authentication > Sign-in method
2. "익명" 인증 방법 활성화
3. "저장" 클릭

## ✅ 설정 확인 체크리스트

### Firebase 콘솔 설정
- [ ] 프로젝트 생성됨
- [ ] 웹 앱 등록됨
- [ ] SDK 설정 복사됨
- [ ] Firestore 데이터베이스 생성됨
- [ ] 보안 규칙 설정됨
- [ ] Authentication 활성화됨
- [ ] 익명 인증 활성화됨

### 코드 설정
- [ ] firebaseConfig에 실제 값 입력됨
- [ ] firebaseConfig = null 제거됨
- [ ] 설정이 올바른 위치에 있음

### 테스트
- [ ] 게임 실행됨
- [ ] Firebase 연결 성공 메시지 확인
- [ ] 점수 저장 테스트
- [ ] 랭킹 조회 테스트

## 🚨 문제 해결

### Firebase 연결 실패 시
1. firebaseConfig 값 확인
2. Firebase 콘솔에서 프로젝트 상태 확인
3. 브라우저 콘솔에서 오류 메시지 확인
4. 네트워크 연결 상태 확인

### 인증 오류 시
1. Authentication 설정 확인
2. 익명 인증 활성화 확인
3. 보안 규칙 확인
4. 브라우저 캐시 삭제

### 데이터 저장 실패 시
1. Firestore 데이터베이스 생성 확인
2. 보안 규칙 설정 확인
3. 사용자 인증 상태 확인
4. 데이터 구조 확인

## 📱 현재 Firebase SDK 버전

현재 사용 중인 Firebase SDK 버전: **10.7.1**

```javascript
// 현재 사용 중인 Firebase SDK
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
```

이 버전은 2024년 기준 최신 안정 버전입니다.
