# Firebase 설정 값 위치 확인 가이드

## 🔍 messagingSenderId와 appId 확인 방법

### 1단계: Firebase 콘솔 접속
1. https://console.firebase.google.com 접속
2. 프로젝트 선택 (또는 새 프로젝트 생성)

### 2단계: 프로젝트 설정 접속
1. 좌측 하단 ⚙️ (톱니바퀴) 아이콘 클릭
2. "프로젝트 설정" 클릭

### 3단계: 일반 탭 확인
1. "일반" 탭이 기본으로 선택됨
2. "내 앱" 섹션에서 웹 앱 확인

### 4단계: 웹 앱 등록 (없는 경우)
1. "내 앱" 섹션에서 "웹 앱 추가" 클릭
2. 앱 닉네임: `3D Tetris Web` 입력
3. "Firebase Hosting도 설정하시겠습니까?" → 체크 해제
4. "앱 등록" 클릭

### 5단계: SDK 설정 확인
1. 등록된 웹 앱 카드에서 "SDK 설정 및 구성" 섹션 확인
2. "구성" 선택
3. 다음과 같은 설정이 표시됩니다:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB...",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",  // ← 여기서 확인
  appId: "1:123456789012:web:abcdef..."  // ← 여기서 확인
};
```

## 📋 각 설정 값의 위치와 의미

### apiKey
- **위치**: SDK 설정 및 구성 → 구성
- **형태**: "AIzaSyB..."로 시작하는 문자열
- **용도**: Firebase API 접근을 위한 키

### authDomain
- **위치**: SDK 설정 및 구성 → 구성
- **형태**: "프로젝트ID.firebaseapp.com"
- **용도**: Firebase Authentication 도메인

### projectId
- **위치**: SDK 설정 및 구성 → 구성
- **형태**: 프로젝트 생성 시 입력한 ID
- **용도**: Firebase 프로젝트 식별자

### storageBucket
- **위치**: SDK 설정 및 구성 → 구성
- **형태**: "프로젝트ID.appspot.com"
- **용도**: Firebase Storage 버킷

### messagingSenderId ⭐
- **위치**: SDK 설정 및 구성 → 구성
- **형태**: 숫자로만 구성된 12자리 문자열
- **예시**: "123456789012"
- **용도**: Firebase Cloud Messaging (FCM) 서비스 식별자
- **중요**: 이 값은 프로젝트당 고유하며 변경되지 않음

### appId ⭐
- **위치**: SDK 설정 및 구성 → 구성
- **형태**: "1:숫자:web:문자열"
- **예시**: "1:123456789012:web:abcdef123456"
- **용도**: Firebase 앱의 고유 식별자
- **중요**: 웹 앱 등록 시 자동으로 생성됨

## 🔧 코드에 적용하는 방법

### 현재 상태 (비활성화)
```javascript
const firebaseConfig = null;
```

### Firebase 콘솔에서 복사한 설정으로 교체
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyB...실제_API_키",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789012",  // ← 실제 값으로 교체
    appId: "1:123456789012:web:abcdef..."  // ← 실제 값으로 교체
};
```

## 📱 Firebase 콘솔 화면 설명

### 프로젝트 설정 화면 구성
```
Firebase Console
├── 프로젝트 개요
├── 개발
│   ├── Authentication
│   ├── Firestore Database
│   └── Storage
├── 배포
└── ⚙️ 프로젝트 설정 ← 여기 클릭
```

### 프로젝트 설정 화면 구성
```
프로젝트 설정
├── 일반 ← 여기 선택
│   ├── 프로젝트 정보
│   ├── 내 앱 ← 여기서 웹 앱 확인
│   └── 사용량 및 결제
├── 사용자 및 권한
├── 통합
└── 계정 연결
```

### 내 앱 섹션 구성
```
내 앱
├── 웹 앱 (웹 아이콘) ← 여기 클릭
│   ├── 앱 닉네임: 3D Tetris Web
│   ├── 앱 ID: 1:123456789012:web:abcdef...
│   └── SDK 설정 및 구성 ← 여기 클릭
│       ├── 구성 ← 여기 선택
│       └── npm
```

## ✅ 확인 체크리스트

### Firebase 콘솔 설정
- [ ] 프로젝트 생성됨
- [ ] 웹 앱 등록됨
- [ ] SDK 설정 및 구성 표시됨
- [ ] 구성 탭에서 설정 복사 가능

### 설정 값 확인
- [ ] apiKey 확인됨
- [ ] authDomain 확인됨
- [ ] projectId 확인됨
- [ ] storageBucket 확인됨
- [ ] messagingSenderId 확인됨 ⭐
- [ ] appId 확인됨 ⭐

### 코드 적용
- [ ] firebaseConfig에 실제 값 입력됨
- [ ] firebaseConfig = null 제거됨
- [ ] 모든 설정 값이 올바르게 입력됨

## 🚨 문제 해결

### 웹 앱이 보이지 않는 경우
1. "웹 앱 추가" 클릭
2. 앱 닉네임 입력
3. "앱 등록" 클릭

### SDK 설정이 보이지 않는 경우
1. 웹 앱 카드 클릭
2. "SDK 설정 및 구성" 섹션 확인
3. "구성" 탭 선택

### 설정 값이 복사되지 않는 경우
1. 브라우저 새로고침
2. 다른 브라우저에서 시도
3. Firebase 콘솔 재접속

이 가이드를 따라하면 messagingSenderId와 appId를 정확히 찾을 수 있습니다!
