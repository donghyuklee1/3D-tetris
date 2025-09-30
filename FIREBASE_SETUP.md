# Firebase 설정 가이드

## 🔥 Firebase 프로젝트 생성 및 설정

### 1단계: Firebase 프로젝트 생성
1. https://console.firebase.google.com 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름: `3d-tetris-game` 입력
4. Google Analytics 설정 (선택사항)

### 2단계: Firestore 데이터베이스 설정
1. 좌측 메뉴에서 "Firestore Database" 클릭
2. "데이터베이스 만들기" 클릭
3. 보안 규칙: "테스트 모드에서 시작" 선택
4. 위치: `asia-northeast3` (서울) 선택

### 3단계: Authentication 설정
1. 좌측 메뉴에서 "Authentication" 클릭
2. "시작하기" 클릭
3. "Sign-in method" 탭에서 "익명" 활성화

### 4단계: 웹 앱 등록
1. 프로젝트 설정 (톱니바퀴) 클릭
2. "일반" 탭에서 "웹 앱 추가" 클릭
3. 앱 닉네임: `3D Tetris Web`
4. Firebase SDK 설정 복사

### 5단계: 코드에 설정 적용
`index.html` 파일에서 다음 부분을 찾아서 실제 값으로 교체:

```javascript
// 현재 (비활성화 상태)
const firebaseConfig = null;

// 교체할 내용 (실제 Firebase 설정)
const firebaseConfig = {
    apiKey: "실제_API_키",
    authDomain: "실제_프로젝트_ID.firebaseapp.com",
    projectId: "실제_프로젝트_ID",
    storageBucket: "실제_프로젝트_ID.appspot.com",
    messagingSenderId: "실제_송신자_ID",
    appId: "실제_앱_ID"
};
```

## 🔒 Firestore 보안 규칙

Firebase 콘솔의 Firestore > 규칙에서 다음 규칙을 설정하세요:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 공개 랭킹 데이터 (모든 사용자가 읽기 가능)
    match /scores/{document} {
      allow read: if true;  // 누구나 랭킹 조회 가능
      allow write: if request.auth != null;  // 인증된 사용자만 기록 가능
    }
    
    // 개인 점수 데이터 (본인만 접근 가능)
    match /userScores/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 사용자 프로필 데이터 (본인만 접근 가능)
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 📊 데이터 구조

### scores 컬렉션 (공개 랭킹)
```
scores/{autoId}
├── name: "플레이어 이름"
├── score: 12345
├── userId: "사용자_고유_ID"
└── timestamp: "2024-01-01T00:00:00.000Z"
```

### userScores 컬렉션 (개인 최고 점수)
```
userScores/{userId}
├── score: 12345
├── name: "플레이어 이름"
└── timestamp: "2024-01-01T00:00:00.000Z"
```

### users 컬렉션 (사용자 프로필)
```
users/{userId}
├── nickname: "닉네임"
├── displayName: "표시 이름"
└── createdAt: "2024-01-01T00:00:00.000Z"
```

## ✅ 설정 완료 후 확인사항

1. Firebase 콘솔에서 Authentication > 사용자에 익명 사용자 표시
2. Firestore > 데이터에서 scores, userScores, users 컬렉션 생성 확인
3. 게임에서 점수 기록 및 랭킹 조회 테스트
4. 다른 브라우저/기기에서도 랭킹 동기화 확인

## 🚀 배포 후 테스트

1. Vercel에 배포
2. 실제 도메인에서 Firebase 연결 테스트
3. 랭킹 시스템 정상 작동 확인
4. 다중 사용자 환경에서 테스트
