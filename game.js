class Tetris3D {
    constructor() {
        try {
            console.log('Tetris3D 생성자 시작');
            
            // Canvas 요소 확인
            this.canvas = document.getElementById('gameCanvas');
            if (!this.canvas) {
                throw new Error('Canvas 요소를 찾을 수 없습니다!');
            }
            console.log('Canvas 요소 확인됨:', this.canvas);
            
            // Three.js 기본 설정
            this.scene = new THREE.Scene();
            console.log('Scene 생성됨');
            
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            console.log('Camera 생성됨');
            
            this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
            console.log('Renderer 생성됨');
        
        // 게임 설정
        this.BOARD_WIDTH = 4;
        this.BOARD_HEIGHT = 12;
        this.BOARD_DEPTH = 4;
        this.BLOCK_SIZE = 1;
        
        // 게임 상태
        this.board = this.initializeBoard();
        this.boardColors = this.initializeBoard(); // 블록 색상 저장용
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 1;
        this.gameRunning = false;
        this.gamePaused = false;
        this.dropTime = 0;
        this.dropInterval = 1000; // 1초
        
        // 랭킹 시스템 (Firebase 연동)
        this.ranking = [];
        this.currentUser = null;
        this.userBestScore = 0;
        console.log('랭킹 시스템 초기화');
        this.loadRanking();
        
        // 미니맵 업데이트 플래그
        this.minimapNeedsUpdate = false;
        
        // 3D 오브젝트들
        this.boardGroup = new THREE.Group();
        this.pieceGroup = new THREE.Group();
        this.fixedBlocks = new THREE.Group();
        this.shadowGroup = new THREE.Group();
        
        // 미니맵 관련 (게임 시작 시에만 초기화)
        this.miniCamera = null;
        this.miniRenderer = null;
        this.miniScene = null;
        
        // 카메라 설정
        this.camera.position.set(8, 10, 8);
        this.camera.lookAt(1.5, 6, 1.5);
        
        // 렌더러 설정
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x1a1a2e);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.scene.add(this.boardGroup);
        this.scene.add(this.pieceGroup);
        this.scene.add(this.fixedBlocks);
        this.scene.add(this.shadowGroup);
        
        // 조명 설정
        this.setupLighting();
        
        // 미니맵 설정 (게임 시작 시에만)
        // this.setupMinimap();
        
        // 이벤트 리스너
        this.setupEventListeners();
        
        // 테트리스 피스 정의 (4개 블록으로 구성, 4x4 보드에 맞춤)
        this.pieceTypes = [
            // O-피스 (정사각형) - 가장 안전한 피스
            {
                name: 'O',
                blocks: [[0,0,0], [1,0,0], [0,1,0], [1,1,0]],
                color: 0xffff00
            },
            // 작은 I-피스 (2x2 크기)
            {
                name: 'I',
                blocks: [[0,0,0], [1,0,0], [0,1,0], [1,1,0]],
                color: 0x00f5ff
            },
            // 작은 T-피스 (2x2 크기)
            {
                name: 'T',
                blocks: [[0,0,0], [1,0,0], [2,0,0], [1,1,0]],
                color: 0x800080
            },
            // 작은 L-피스 (2x2 크기)
            {
                name: 'L',
                blocks: [[0,0,0], [0,1,0], [1,1,0], [1,2,0]],
                color: 0xff8c00
            },
            // 작은 J-피스 (2x2 크기)
            {
                name: 'J',
                blocks: [[1,0,0], [1,1,0], [0,1,0], [0,2,0]],
                color: 0x0000ff
            },
            // 작은 S-피스 (2x2 크기)
            {
                name: 'S',
                blocks: [[0,0,0], [1,0,0], [1,1,0], [2,1,0]],
                color: 0x00ff00
            },
            // 작은 Z-피스 (2x2 크기)
            {
                name: 'Z',
                blocks: [[1,0,0], [2,0,0], [0,1,0], [1,1,0]],
                color: 0xff0000
            },
            // 3D L-피스 (3차원, 2x2x2 크기)
            {
                name: '3DL',
                blocks: [[0,0,0], [0,1,0], [0,0,1], [1,0,0]],
                color: 0xff69b4
            },
            // 3D T-피스 (3차원, 2x2x2 크기)
            {
                name: '3DT',
                blocks: [[0,0,0], [1,0,0], [0,1,0], [0,0,1]],
                color: 0x32cd32
            }
        ];
        
            try {
                console.log('게임 초기화 시작');
                this.initializeGame();
                console.log('게임 초기화 완료');
                this.setupEventListeners();
                console.log('이벤트 리스너 설정 완료');
                this.gameLoop();
                console.log('게임 루프 시작');
            } catch (error) {
                console.error('게임 초기화 중 오류:', error);
                console.error('오류 스택:', error.stack);
                throw error;
            }
        } catch (error) {
            console.error('Tetris3D 생성자에서 오류 발생:', error);
            console.error('오류 스택:', error.stack);
            throw error;
        }
    }
    
    initializeBoard() {
        // 3차원 배열로 보드 초기화
        const board = [];
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            board[y] = [];
            for (let z = 0; z < this.BOARD_DEPTH; z++) {
                board[y][z] = [];
                for (let x = 0; x < this.BOARD_WIDTH; x++) {
                    board[y][z][x] = 0; // 0 = 빈 공간, 1 = 블록 있음
                }
            }
        }
        return board;
    }
    
    setupLighting() {
        // 주 조명
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // 방향 조명
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        this.scene.add(directionalLight);
        
        // 포인트 라이트 (게임 보드 중앙)
        const pointLight = new THREE.PointLight(0xffffff, 0.5, 20);
        pointLight.position.set(1.5, 6, 1.5);
        this.scene.add(pointLight);
    }
    
    setupMinimap() {
        // 미니맵 캔버스 생성
        const miniCanvas = document.createElement('canvas');
        miniCanvas.id = 'miniCanvas';
        miniCanvas.style.position = 'absolute';
        miniCanvas.style.bottom = '20px';
        miniCanvas.style.right = '20px';
        miniCanvas.style.width = '400px';
        miniCanvas.style.height = '450px';
        miniCanvas.style.border = '3px solid rgba(255, 255, 255, 0.4)';
        miniCanvas.style.borderRadius = '15px';
        miniCanvas.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        miniCanvas.style.zIndex = '100';
        miniCanvas.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        miniCanvas.style.display = 'none'; // 처음에는 숨김
        document.body.appendChild(miniCanvas);
        
        // 미니맵 렌더러 설정 (메인 게임과 동일한 설정)
        this.miniRenderer = new THREE.WebGLRenderer({ 
            canvas: miniCanvas, 
            antialias: true,
            alpha: true
        });
        this.miniRenderer.setSize(400, 450);
        this.miniRenderer.setClearColor(0x000000, 0);
        this.miniRenderer.shadowMap.enabled = true;
        this.miniRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // 미니맵 씬 생성 (메인 게임과 동일한 구조)
        if (!this.miniScene) {
            this.miniScene = new THREE.Scene();
        }
        
        // 미니맵 카메라 설정 (메인 카메라의 정반대편 시점)
        this.miniCamera = new THREE.PerspectiveCamera(75, 400 / 450, 0.1, 1000);
        // 메인 카메라: (8, 10, 8)에서 (1.5, 6, 1.5)를 바라봄
        // 미니맵 카메라: 메인 카메라의 정반대편 위치에서 같은 지점을 바라봄
        // 메인 카메라의 정반대편: (8, 10, 8)의 반대는 (-8, 10, -8)
        this.miniCamera.position.set(-8, 10, -8); // 메인 카메라의 정반대편
        this.miniCamera.lookAt(1.5, 6, 1.5); // 같은 지점을 바라보도록
        
        // 미니맵 조명 설정 (메인 게임과 동일)
        const miniAmbientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.miniScene.add(miniAmbientLight);
        
        const miniDirectionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        miniDirectionalLight.position.set(-10, 10, -5);
        miniDirectionalLight.castShadow = true;
        miniDirectionalLight.shadow.mapSize.width = 1024;
        miniDirectionalLight.shadow.mapSize.height = 1024;
        this.miniScene.add(miniDirectionalLight);
        
        // 미니맵용 포인트 라이트 (메인 게임과 동일)
        const miniPointLight = new THREE.PointLight(0xffffff, 0.5, 100);
        miniPointLight.position.set(1.5, 6, 1.5);
        this.miniScene.add(miniPointLight);
    }
    
    updateMinimap() {
        if (!this.miniRenderer || !this.miniCamera) return;
        
        try {
            // 미니맵 씬 완전히 초기화
            this.miniScene.clear();
            
            // 미니맵 조명 다시 추가 (매번 새로 추가해야 함)
            const miniAmbientLight = new THREE.AmbientLight(0x404040, 0.6);
            this.miniScene.add(miniAmbientLight);
            
            const miniDirectionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            miniDirectionalLight.position.set(-10, 10, -5);
            miniDirectionalLight.castShadow = true;
            miniDirectionalLight.shadow.mapSize.width = 1024;
            miniDirectionalLight.shadow.mapSize.height = 1024;
            this.miniScene.add(miniDirectionalLight);
            
            const miniPointLight = new THREE.PointLight(0xffffff, 0.5, 100);
            miniPointLight.position.set(1.5, 6, 1.5);
            this.miniScene.add(miniPointLight);
            
            // 게임이 시작되지 않았으면 빈 화면만 표시
            if (!this.gameRunning) {
                this.miniRenderer.render(this.miniScene, this.miniCamera);
                return;
            }
            
            // 일시정지 상태에서는 현재 상태를 유지하면서 렌더링
            
            // 보드 틀 생성 (메인 게임과 동일)
            const boardGeometry = new THREE.BoxGeometry(
                this.BOARD_WIDTH * this.BLOCK_SIZE,
                this.BOARD_HEIGHT * this.BLOCK_SIZE,
                this.BOARD_DEPTH * this.BLOCK_SIZE
            );
            const boardMaterial = new THREE.MeshLambertMaterial({
                color: 0x333333,
                transparent: true,
                opacity: 0.1,
                wireframe: true
            });
            const boardMesh = new THREE.Mesh(boardGeometry, boardMaterial);
            boardMesh.position.set(
                this.BOARD_WIDTH / 2 - 0.5,
                this.BOARD_HEIGHT / 2 - 0.5,
                this.BOARD_DEPTH / 2 - 0.5
            );
            this.miniScene.add(boardMesh);
            
            // 바닥 그리드 생성 (메인 게임과 동일)
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                for (let z = 0; z < this.BOARD_DEPTH; z++) {
                    const gridGeometry = new THREE.PlaneGeometry(0.9, 0.9);
                    const gridMaterial = new THREE.MeshLambertMaterial({
                        color: 0x444444,
                        transparent: true,
                        opacity: 0.3
                    });
                    const gridMesh = new THREE.Mesh(gridGeometry, gridMaterial);
                    gridMesh.rotation.x = -Math.PI / 2;
                    gridMesh.position.set(x, -0.5, z);
                    this.miniScene.add(gridMesh);
                }
            }
            
            // 고정된 블록들 생성 (미니맵에서도 표시)
            for (let y = 0; y < this.BOARD_HEIGHT; y++) {
                for (let z = 0; z < this.BOARD_DEPTH; z++) {
                    for (let x = 0; x < this.BOARD_WIDTH; x++) {
                        if (this.board[y][z][x] === 1) {
                            const geometry = new THREE.BoxGeometry(0.95, 0.95, 0.95);
                            const blockColor = this.boardColors[y][z][x] || 0x888888;
                            const material = new THREE.MeshPhysicalMaterial({
                                color: blockColor,
                                transparent: true,
                                opacity: 0.9,
                                roughness: 0.2,
                                metalness: 0.0,
                                clearcoat: 0.6,
                                clearcoatRoughness: 0.2,
                                transmission: 0.2,
                                thickness: 0.3,
                                envMapIntensity: 0.8
                            });
                            const cube = new THREE.Mesh(geometry, material);
                            cube.castShadow = true;
                            cube.receiveShadow = true;
                            cube.position.set(x, y, z);
                            this.miniScene.add(cube);
                        }
                    }
                }
            }
            
            // 현재 블록은 미니맵에서 생성하지 않음 - 메인 게임과의 동기화 문제 방지
            /*
            if (this.currentPiece && this.currentPiece.blocks && this.currentPiece.type && this.gameRunning && !this.gamePaused) {
                this.currentPiece.blocks.forEach(block => {
                    const geometry = new THREE.BoxGeometry(0.95, 0.95, 0.95);
                    const material = new THREE.MeshPhysicalMaterial({
                        color: this.currentPiece.type.color,
                        transparent: true,
                        opacity: 0.85,
                        roughness: 0.1,
                        metalness: 0.0,
                        clearcoat: 0.8,
                        clearcoatRoughness: 0.1,
                        transmission: 0.3,
                        thickness: 0.5,
                        envMapIntensity: 1.0
                    });
                    const cube = new THREE.Mesh(geometry, material);
                    cube.castShadow = true;
                    cube.receiveShadow = true;
                    
                    // 격자에 정확히 맞도록 위치 조정 (메인 게임과 동일)
                    const gridX = Math.round(this.currentPiece.position.x + block[0]);
                    const gridY = Math.round(this.currentPiece.position.y - block[1]);
                    const gridZ = Math.round(this.currentPiece.position.z + block[2]);
                    
                    cube.position.set(gridX, gridY, gridZ);
                    this.miniScene.add(cube);
                });
                
                // 그림자 생성 (메인 게임과 동일한 조건)
                if (this.shadowGroup && this.shadowGroup.children.length > 0) {
                    try {
                        const shadowPosition = this.getShadowPosition();
                        if (shadowPosition) {
                            this.currentPiece.blocks.forEach(block => {
                                const geometry = new THREE.PlaneGeometry(0.9, 0.9);
                                const material = new THREE.MeshBasicMaterial({
                                    color: this.currentPiece.type.color,
                                    transparent: true,
                                    opacity: 0.3
                                });
                                const shadow = new THREE.Mesh(geometry, material);
                                shadow.rotation.x = -Math.PI / 2;
                                
                                const gridX = Math.round(shadowPosition.x + block[0]);
                                const gridZ = Math.round(shadowPosition.z + block[2]);
                                
                                shadow.position.set(gridX, -0.4, gridZ);
                                this.miniScene.add(shadow);
                            });
                        }
                    } catch (error) {
                        console.log('미니맵 그림자 생성 오류:', error);
                    }
                }
            }
            */
            
            // 미니맵 렌더링
            this.miniRenderer.render(this.miniScene, this.miniCamera);
        } catch (error) {
            console.log('미니맵 업데이트 오류:', error);
        }
    }
    
    setupEventListeners() {
        // 키보드 이벤트
        document.addEventListener('keydown', (event) => {
            if (!this.gameRunning || this.gamePaused) {
                if (event.code === 'KeyP') {
                    this.togglePause();
                }
                return;
            }
            
            switch (event.code) {
                case 'KeyA': // 왼쪽
                    this.movePiece(-1, 0, 0);
                    break;
                case 'KeyD': // 오른쪽
                    this.movePiece(1, 0, 0);
                    break;
                case 'KeyW': // 위쪽
                    this.movePiece(0, 0, -1);
                    break;
                case 'KeyS': // 아래쪽
                    this.movePiece(0, 0, 1);
                    break;
                case 'KeyQ': // Z축 회전
                    this.rotatePiece('z');
                    break;
                case 'KeyE': // Z축 반대 회전
                    this.rotatePiece('z', true);
                    break;
                case 'KeyR': // Y축 회전
                    this.rotatePiece('y');
                    break;
                case 'KeyF': // X축 회전
                    this.rotatePiece('x');
                    break;
                case 'Space': // 빠른 낙하
                    event.preventDefault();
                    this.dropPiece();
                    break;
                case 'KeyP': // 일시정지
                    this.togglePause();
                    break;
            }
        });
        
        // 윈도우 리사이즈
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // 모바일 터치 컨트롤
        this.setupTouchControls();
        
        // 재시작 버튼 (HTML에서 직접 처리하므로 제거)
        // document.getElementById('restartBtn').addEventListener('click', () => {
        //     this.restartGame();
        // });
    }

    setupTouchControls() {
        // 터치 시작 위치
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;
        
        // 캔버스에 터치 이벤트 추가
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!this.gameRunning || this.gamePaused) return;
            
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchStartTime = Date.now();
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!this.gameRunning || this.gamePaused) return;
            
            const touch = e.changedTouches[0];
            const touchEndX = touch.clientX;
            const touchEndY = touch.clientY;
            const touchEndTime = Date.now();
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const deltaTime = touchEndTime - touchStartTime;
            
            // 스와이프 감지 (최소 50px 이동)
            if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // 가로 스와이프
                    if (deltaX > 0) {
                        this.movePiece(1, 0, 0); // 오른쪽
                    } else {
                        this.movePiece(-1, 0, 0); // 왼쪽
                    }
                } else {
                    // 세로 스와이프
                    if (deltaY > 0) {
                        this.movePiece(0, 0, 1); // 앞쪽
                    } else {
                        this.movePiece(0, 0, -1); // 뒤쪽
                    }
                }
            } else if (deltaTime < 200) {
                // 짧은 터치 (탭) - 회전
                this.rotatePiece('y');
            } else {
                // 긴 터치 - 빠른 낙하
                this.dropPiece();
            }
        });
        
        // 더블 탭 감지
        let lastTapTime = 0;
        this.canvas.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTapTime;
            
            if (tapLength < 500 && tapLength > 0) {
                // 더블 탭 - 빠른 낙하
                this.dropPiece();
            }
            
            lastTapTime = currentTime;
        });
    }
    
    initializeGame() {
        console.log('보드 시각화 생성 중...');
        this.createBoardVisual();
        
        console.log('첫 피스 생성 중...');
        this.spawnNewPiece();
        
        console.log('게임 루프 시작 중...');
        this.gameRunning = true;
        
        // 게임 시작 직후 미니맵 설정은 별도로 처리
        
        this.gameLoop();
        
        // 랭킹 UI 초기화
        this.updateRankingUI();
        
        // 미니맵 초기화 (게임 시작 후에만)
        // this.minimapNeedsUpdate = true;
        // this.updateMinimap();
        
        console.log('게임 초기화 완료!');
    }
    
    createBoardVisual() {
        try {
            console.log('보드 테두리 생성 중...');
            // 보드 테두리 생성
            const boardGeometry = new THREE.BoxGeometry(
                this.BOARD_WIDTH * this.BLOCK_SIZE,
                this.BOARD_HEIGHT * this.BLOCK_SIZE,
                this.BOARD_DEPTH * this.BLOCK_SIZE
            );
            const boardMaterial = new THREE.MeshLambertMaterial({
                color: 0x333333,
                transparent: true,
                opacity: 0.1,
                wireframe: true
            });
            const boardMesh = new THREE.Mesh(boardGeometry, boardMaterial);
            boardMesh.position.set(
                this.BOARD_WIDTH / 2 - 0.5,
                this.BOARD_HEIGHT / 2 - 0.5,
                this.BOARD_DEPTH / 2 - 0.5
            );
            this.boardGroup.add(boardMesh);
            
            console.log('바닥 그리드 생성 중...');
            // 바닥 그리드 생성
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                for (let z = 0; z < this.BOARD_DEPTH; z++) {
                    const gridGeometry = new THREE.PlaneGeometry(0.9, 0.9);
                    const gridMaterial = new THREE.MeshLambertMaterial({
                        color: 0x444444,
                        transparent: true,
                        opacity: 0.3
                    });
                    const gridMesh = new THREE.Mesh(gridGeometry, gridMaterial);
                    gridMesh.rotation.x = -Math.PI / 2;
                    gridMesh.position.set(x, -0.5, z);
                    this.boardGroup.add(gridMesh);
                }
            }
            console.log('보드 시각화 생성 완료!');
        } catch (error) {
            console.error('보드 시각화 생성 중 오류:', error);
            throw error;
        }
    }
    
    spawnNewPiece() {
        const pieceType = this.pieceTypes[Math.floor(Math.random() * this.pieceTypes.length)];
        this.currentPiece = {
            type: pieceType,
            position: { x: 1, y: this.BOARD_HEIGHT - 1, z: 1 }, // 4x4 보드의 중앙에서 시작
            rotation: { x: 0, y: 0, z: 0 },
            blocks: [...pieceType.blocks]
        };
        
        this.createPieceVisual();
        this.minimapNeedsUpdate = true; // 미니맵 업데이트 필요
        
        // 게임 오버 체크
        if (this.checkCollision(this.currentPiece.position, this.currentPiece.blocks)) {
            console.log('게임 오버: 새 피스 생성 시 충돌');
            this.gameOver();
        }
    }
    
    createPieceVisual() {
        // 기존 피스 시각화 완전 제거
        this.pieceGroup.clear();
        this.shadowGroup.clear();
        
        // 현재 피스가 존재하는지 확인
        if (!this.currentPiece || !this.currentPiece.blocks) {
            console.log('현재 피스가 없습니다');
            return;
        }
        
        // 현재 피스의 블록들 생성
        this.currentPiece.blocks.forEach((block, index) => {
            const geometry = new THREE.BoxGeometry(0.95, 0.95, 0.95);
            const material = new THREE.MeshPhysicalMaterial({
                color: this.currentPiece.type.color,
                transparent: true,
                opacity: 0.85,
                roughness: 0.1,
                metalness: 0.0,
                clearcoat: 0.8,
                clearcoatRoughness: 0.1,
                transmission: 0.3,
                thickness: 0.5,
                envMapIntensity: 1.0
            });
            const cube = new THREE.Mesh(geometry, material);
            cube.castShadow = true;
            cube.receiveShadow = true;
            
            // 격자에 정확히 맞도록 위치 조정
            const gridX = Math.round(this.currentPiece.position.x + block[0]);
            const gridY = Math.round(this.currentPiece.position.y - block[1]);
            const gridZ = Math.round(this.currentPiece.position.z + block[2]);
            
            cube.position.set(gridX, gridY, gridZ);
            cube.userData = { blockIndex: index }; // 디버깅용
            this.pieceGroup.add(cube);
        });
        
        // 그림자/사영 생성
        this.createShadow();
    }
    
    createShadow() {
        // 현재 피스가 어디에 착지할지 계산
        const shadowPosition = this.getShadowPosition();
        
        // 각 블록에 대해 그림자 생성
        this.currentPiece.blocks.forEach(block => {
            const shadowGeometry = new THREE.PlaneGeometry(0.95, 0.95);
            const shadowMaterial = new THREE.MeshLambertMaterial({
                color: this.currentPiece.type.color,
                transparent: true,
                opacity: 0.4,
                emissive: this.currentPiece.type.color,
                emissiveIntensity: 0.3
            });
            
            const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
            shadow.rotation.x = -Math.PI / 2; // 바닥에 평행하게 회전
            
            // 그림자 위치 설정 (바닥 레벨에, 격자에 맞춤)
            const gridX = Math.round(shadowPosition.x + block[0]);
            const gridZ = Math.round(shadowPosition.z + block[2]);
            
            shadow.position.set(gridX, -0.45, gridZ); // 바닥 바로 위
            
            this.shadowGroup.add(shadow);
        });
    }
    
    getShadowPosition() {
        // 현재 위치에서 아래로 떨어뜨려서 착지 지점 찾기
        let testPosition = { 
            x: Math.round(this.currentPiece.position.x),
            y: Math.round(this.currentPiece.position.y),
            z: Math.round(this.currentPiece.position.z)
        };
        
        while (true) {
            const nextPosition = {
                x: testPosition.x,
                y: testPosition.y - 1,
                z: testPosition.z
            };
            
            if (this.checkCollision(nextPosition, this.currentPiece.blocks)) {
                break; // 충돌하면 현재 위치가 착지 지점
            }
            
            testPosition = nextPosition;
        }
        
        return testPosition;
    }
    
    movePiece(dx, dy, dz) {
        const newPosition = {
            x: Math.round(this.currentPiece.position.x + dx),
            y: Math.round(this.currentPiece.position.y + dy),
            z: Math.round(this.currentPiece.position.z + dz)
        };
        
        if (!this.checkCollision(newPosition, this.currentPiece.blocks)) {
            this.currentPiece.position = newPosition;
            this.createPieceVisual();
            this.minimapNeedsUpdate = true; // 블록 이동 시 미니맵 업데이트
            return true;
        }
        return false;
    }
    
    rotatePiece(axis, reverse = false) {
        const newBlocks = this.rotateBlocks(this.currentPiece.blocks, axis, reverse);
        
        if (!this.checkCollision(this.currentPiece.position, newBlocks)) {
            this.currentPiece.blocks = newBlocks;
            this.createPieceVisual(); // 그림자도 함께 업데이트됨
            this.minimapNeedsUpdate = true; // 미니맵 업데이트 필요
            return true;
        }
        return false;
    }
    
    rotateBlocks(blocks, axis, reverse = false) {
        const angle = reverse ? -Math.PI / 2 : Math.PI / 2;
        
        return blocks.map(block => {
            let [x, y, z] = block;
            
            switch (axis) {
                case 'x':
                    if (reverse) {
                        return [x, z, -y];
                    } else {
                        return [x, -z, y];
                    }
                case 'y':
                    if (reverse) {
                        return [z, y, -x];
                    } else {
                        return [-z, y, x];
                    }
                case 'z':
                    if (reverse) {
                        return [-y, x, z];
                    } else {
                        return [y, -x, z];
                    }
            }
        });
    }
    
    checkCollision(position, blocks) {
        for (const block of blocks) {
            const x = Math.round(position.x + block[0]);
            const y = Math.round(position.y - block[1]);
            const z = Math.round(position.z + block[2]);
            
            // 보드 경계 체크
            if (x < 0 || x >= this.BOARD_WIDTH || 
                y < 0 || y >= this.BOARD_HEIGHT || 
                z < 0 || z >= this.BOARD_DEPTH) {
                console.log(`충돌: 경계 밖 (${x}, ${y}, ${z}) - 보드 크기: ${this.BOARD_WIDTH}x${this.BOARD_HEIGHT}x${this.BOARD_DEPTH}`);
                return true;
            }
            
            // 다른 블록과 충돌 체크
            if (this.board[y][z][x] === 1) {
                console.log(`충돌: 기존 블록과 충돌 (${x}, ${y}, ${z})`);
                return true;
            }
        }
        return false;
    }
    
    dropPiece() {
        while (this.movePiece(0, -1, 0)) {
            // 계속 떨어뜨림
        }
        this.placePiece();
        this.minimapNeedsUpdate = true; // 블록 드롭 시 미니맵 업데이트
    }
    
    placePiece() {
        // 현재 피스를 보드에 고정
        if (this.currentPiece && this.currentPiece.blocks) {
            this.currentPiece.blocks.forEach(block => {
                const x = Math.round(this.currentPiece.position.x + block[0]);
                const y = Math.round(this.currentPiece.position.y - block[1]);
                const z = Math.round(this.currentPiece.position.z + block[2]);
                
                if (y >= 0 && y < this.BOARD_HEIGHT && 
                    x >= 0 && x < this.BOARD_WIDTH && 
                    z >= 0 && z < this.BOARD_DEPTH) {
                    this.board[y][z][x] = 1;
                    this.boardColors[y][z][x] = this.currentPiece.type.color; // 색상 저장
                }
            });
            
            // 블록 배치 효과 추가
            this.addPlacementEffect();
            
            // 점수 추가 (Tetrio 방식)
            this.addScore(10); // 블록 하나당 10점
        }
        
        // 완성된 레이어 체크 및 제거
        this.checkAndClearLayers();
        
        // 고정된 블록들 다시 생성
        this.updateFixedBlocks();
        
        // 현재 피스 그룹 완전히 정리
        this.pieceGroup.clear();
        this.shadowGroup.clear();
        this.currentPiece = null;
        
        // 새 피스 생성
        this.spawnNewPiece();
    }
    
    checkAndClearLayers() {
        let layersCleared = 0;
        
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            let isLayerFull = true;
            
            // 레이어가 완성되었는지 체크
            for (let z = 0; z < this.BOARD_DEPTH; z++) {
                for (let x = 0; x < this.BOARD_WIDTH; x++) {
                    if (this.board[y][z][x] === 0) {
                        isLayerFull = false;
                        break;
                    }
                }
                if (!isLayerFull) break;
            }
            
            if (isLayerFull) {
                // 레이어 제거
                this.clearLayer(y);
                layersCleared++;
                y--; // 같은 y 인덱스 다시 체크
            }
        }
        
        if (layersCleared > 0) {
            // 레이어 제거 효과
            this.addLayerClearEffect();
            
            // Tetrio 방식 점수 계산
            const baseScore = [0, 100, 300, 500, 800][layersCleared] || 800;
            this.addScore(baseScore * this.level);
            this.level = Math.floor(this.score / 1000) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
            this.updateUI();
            this.updateFixedBlocks();
        }
    }
    
    clearLayer(y) {
        // 보드에서 레이어 제거
        for (let z = 0; z < this.BOARD_DEPTH; z++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                this.board[y][z][x] = 0;
                this.boardColors[y][z][x] = 0; // 색상도 제거
            }
        }
        
        // 위쪽 레이어들을 아래로 이동
        for (let layerY = y + 1; layerY < this.BOARD_HEIGHT; layerY++) {
            for (let z = 0; z < this.BOARD_DEPTH; z++) {
                for (let x = 0; x < this.BOARD_WIDTH; x++) {
                    this.board[layerY - 1][z][x] = this.board[layerY][z][x];
                    this.boardColors[layerY - 1][z][x] = this.boardColors[layerY][z][x]; // 색상도 이동
                    this.board[layerY][z][x] = 0;
                    this.boardColors[layerY][z][x] = 0; // 색상도 초기화
                }
            }
        }
    }
    
    updateFixedBlocks() {
        // 모든 고정된 블록 제거 후 다시 생성
        this.fixedBlocks.clear();
        
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let z = 0; z < this.BOARD_DEPTH; z++) {
                for (let x = 0; x < this.BOARD_WIDTH; x++) {
                    if (this.board[y][z][x] === 1) {
                        const geometry = new THREE.BoxGeometry(0.95, 0.95, 0.95);
                        const blockColor = this.boardColors[y][z][x] || 0x888888; // 저장된 색상 사용
                        const material = new THREE.MeshPhysicalMaterial({
                            color: blockColor,
                            transparent: true,
                            opacity: 0.9,
                            roughness: 0.2,
                            metalness: 0.0,
                            clearcoat: 0.6,
                            clearcoatRoughness: 0.2,
                            transmission: 0.2,
                            thickness: 0.3,
                            envMapIntensity: 0.8
                        });
                        const cube = new THREE.Mesh(geometry, material);
                        cube.castShadow = true;
                        cube.receiveShadow = true;
                        cube.position.set(x, y, z);
                        this.fixedBlocks.add(cube);
                    }
                }
            }
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = `점수: ${this.score}`;
        document.getElementById('level').textContent = `레벨: ${this.level}`;
    }

    addScore(points) {
        this.score += points;
        this.updateUI();
    }

    addPlacementEffect() {
        // 화면 흔들림 효과
        this.addScreenShake();
        
        // 파티클 효과
        this.addParticleEffect();
    }

    addScreenShake() {
        const originalPosition = this.camera.position.clone();
        const shakeIntensity = 0.1;
        const shakeDuration = 200; // 200ms
        
        let shakeTime = 0;
        const shakeInterval = setInterval(() => {
            shakeTime += 16; // 60fps
            
            const randomX = (Math.random() - 0.5) * shakeIntensity;
            const randomY = (Math.random() - 0.5) * shakeIntensity;
            const randomZ = (Math.random() - 0.5) * shakeIntensity;
            
            this.camera.position.set(
                originalPosition.x + randomX,
                originalPosition.y + randomY,
                originalPosition.z + randomZ
            );
            
            if (shakeTime >= shakeDuration) {
                clearInterval(shakeInterval);
                this.camera.position.copy(originalPosition);
            }
        }, 16);
    }

    addParticleEffect() {
        // 현재 피스 위치에서 파티클 생성
        if (!this.currentPiece) return;
        
        const particleCount = 20;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.05, 8, 6);
            const material = new THREE.MeshBasicMaterial({
                color: this.currentPiece.type.color,
                transparent: true,
                opacity: 0.8
            });
            const particle = new THREE.Mesh(geometry, material);
            
            // 현재 피스 중앙에서 파티클 시작
            const centerX = this.currentPiece.position.x + 1.5;
            const centerY = this.currentPiece.position.y;
            const centerZ = this.currentPiece.position.z + 1.5;
            
            particle.position.set(centerX, centerY, centerZ);
            
            // 랜덤 방향으로 파티클 이동
            particle.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.2,
                    Math.random() * 0.3 + 0.1,
                    (Math.random() - 0.5) * 0.2
                ),
                life: 1.0
            };
            
            this.scene.add(particle);
            particles.push(particle);
        }
        
        // 파티클 애니메이션
        let animationTime = 0;
        const animationDuration = 1000; // 1초
        
        const animateParticles = () => {
            animationTime += 16;
            
            particles.forEach((particle, index) => {
                if (particle.userData.life <= 0) return;
                
                // 파티클 이동
                particle.position.add(particle.userData.velocity);
                particle.userData.velocity.y -= 0.01; // 중력
                
                // 투명도 감소
                particle.userData.life -= 0.02;
                particle.material.opacity = particle.userData.life;
                
                // 파티클 제거
                if (particle.userData.life <= 0) {
                    this.scene.remove(particle);
                    particles.splice(index, 1);
                }
            });
            
            if (animationTime < animationDuration && particles.length > 0) {
                requestAnimationFrame(animateParticles);
            } else {
                // 남은 파티클들 정리
                particles.forEach(particle => {
                    this.scene.remove(particle);
                });
            }
        };
        
        animateParticles();
    }

    addLayerClearEffect() {
        // 레이어 클리어 시 더 강한 화면 흔들림
        this.addScreenShake();
        
        // 레이어 클리어 파티클 (더 많은 파티클)
        this.addLayerClearParticles();
    }

    addLayerClearParticles() {
        const particleCount = 50;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.08, 8, 6);
            const material = new THREE.MeshBasicMaterial({
                color: 0xffff00, // 노란색
                transparent: true,
                opacity: 0.9
            });
            const particle = new THREE.Mesh(geometry, material);
            
            // 보드 중앙에서 파티클 시작
            particle.position.set(
                1.5 + (Math.random() - 0.5) * 3,
                6 + Math.random() * 6,
                1.5 + (Math.random() - 0.5) * 3
            );
            
            // 더 강한 파티클 효과
            particle.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.5,
                    Math.random() * 0.8 + 0.3,
                    (Math.random() - 0.5) * 0.5
                ),
                life: 1.0
            };
            
            this.scene.add(particle);
            particles.push(particle);
        }
        
        // 파티클 애니메이션
        let animationTime = 0;
        const animationDuration = 1500; // 1.5초
        
        const animateParticles = () => {
            animationTime += 16;
            
            particles.forEach((particle, index) => {
                if (particle.userData.life <= 0) return;
                
                // 파티클 이동
                particle.position.add(particle.userData.velocity);
                particle.userData.velocity.y -= 0.008; // 중력
                
                // 투명도 감소
                particle.userData.life -= 0.015;
                particle.material.opacity = particle.userData.life;
                
                // 파티클 제거
                if (particle.userData.life <= 0) {
                    this.scene.remove(particle);
                    particles.splice(index, 1);
                }
            });
            
            if (animationTime < animationDuration && particles.length > 0) {
                requestAnimationFrame(animateParticles);
            } else {
                // 남은 파티클들 정리
                particles.forEach(particle => {
                    this.scene.remove(particle);
                });
            }
        };
        
        animateParticles();
    }
    
    togglePause() {
        this.gamePaused = !this.gamePaused;
        console.log('게임 일시정지:', this.gamePaused ? 'ON' : 'OFF');
        
        // 일시정지/재시작 시 미니맵 동기화
        this.minimapNeedsUpdate = true;
        
        // 일시정지 상태를 미니맵에 반영하기 위해 즉시 업데이트
        if (this.miniRenderer && this.miniCamera) {
            this.updateMinimap();
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        document.getElementById('finalScore').textContent = this.score;
        
        // 모든 모드에서 랭킹에 점수 추가 (익명 모드도 포함)
        console.log('게임 오버 - 점수 랭킹에 추가:', this.score);
        this.addScoreToRanking(this.score);
        
        document.getElementById('gameOverModal').classList.add('show');
    }
    
    loadRanking() {
        // Firebase에서 랭킹 로드 시도, 실패 시 로컬 스토리지 사용
        if (window.firebaseDb && window.firebaseCollection && window.firebaseQuery && window.firebaseOrderBy && window.firebaseLimit && window.firebaseGetDocs) {
            this.loadRankingFromFirebase();
        } else {
            this.loadRankingFromLocal();
        }
    }

    async loadRankingFromFirebase() {
        try {
            const q = window.firebaseQuery(
                window.firebaseCollection(window.firebaseDb, 'scores'),
                window.firebaseOrderBy('score', 'desc'),
                window.firebaseLimit(10)
            );
            const querySnapshot = await window.firebaseGetDocs(q);
            this.ranking = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                this.ranking.push({
                    id: doc.id,
                    name: data.name || '익명',
                    score: data.score,
                    timestamp: data.timestamp
                });
            });
            console.log('Firebase에서 랭킹 로드 완료:', this.ranking);
        } catch (error) {
            console.error('Firebase 랭킹 로드 실패, 로컬 스토리지 사용:', error);
            this.loadRankingFromLocal();
        }
    }

    loadRankingFromLocal() {
        const saved = localStorage.getItem('tetris3d-ranking');
        if (saved) {
            this.ranking = JSON.parse(saved);
        } else {
            this.ranking = [
                { name: '동혁', score: 10000, date: new Date().toISOString() },
                { name: '세윤', score: 8500, date: new Date().toISOString() },
                { name: 'AI', score: 7200, date: new Date().toISOString() }
            ];
        }
    }
    
    saveRanking() {
        localStorage.setItem('tetris3d-ranking', JSON.stringify(this.ranking));
    }
    
    async addScoreToRanking(score) {
        // Firebase 사용자 확인
        if (this.currentUser && window.firebaseDb) {
            await this.saveScoreToFirebase(score);
        } else {
            // 로컬 스토리지에 저장
            this.saveScoreToLocal(score);
        }
        this.updateRankingUI();
    }

    async saveScoreToFirebase(score) {
        try {
            const userName = this.currentUser.nickname || this.currentUser.displayName || '익명';
            const scoreData = {
                name: userName,
                score: score,
                userId: this.currentUser.uid,
                timestamp: new Date().toISOString()
            };

            // 개인 최고 점수 업데이트 (인당 1개 기록만 유지)
            if (score > this.userBestScore) {
                this.userBestScore = score;
                
                // 사용자 개인 최고 점수 업데이트
                await window.firebaseSetDoc(
                    window.firebaseDoc(window.firebaseDb, 'userScores', this.currentUser.uid),
                    scoreData
                );

                // 전체 랭킹에서 해당 사용자의 기존 기록 삭제 후 새 기록 추가
                await this.updateGlobalRanking(scoreData);
            }

            console.log('Firebase에 점수 저장 완료:', score);
            this.loadRankingFromFirebase(); // 랭킹 새로고침
        } catch (error) {
            console.error('Firebase 점수 저장 실패:', error);
            this.saveScoreToLocal(score);
        }
    }

    async updateGlobalRanking(scoreData) {
        try {
            // 해당 사용자의 기존 기록 찾기 및 삭제
            const q = window.firebaseQuery(
                window.firebaseCollection(window.firebaseDb, 'scores'),
                window.firebaseOrderBy('userId', 'asc')
            );
            const querySnapshot = await window.firebaseGetDocs(q);
            
            for (const doc of querySnapshot.docs) {
                const data = doc.data();
                if (data.userId === this.currentUser.uid) {
                    // 기존 기록 삭제
                    await doc.ref.delete();
                    console.log('기존 기록 삭제:', data.score);
                }
            }

            // 새 기록 추가
            await window.firebaseSetDoc(
                window.firebaseDoc(window.firebaseCollection(window.firebaseDb, 'scores')),
                scoreData
            );
            
            console.log('글로벌 랭킹 업데이트 완료');
        } catch (error) {
            console.error('글로벌 랭킹 업데이트 실패:', error);
        }
    }

    saveScoreToLocal(score) {
        let playerName;
        
        if (this.isAnonymousMode) {
            // 익명 모드에서는 자동으로 이름 설정
            playerName = '익명 사용자';
        } else {
            // 일반 모드에서는 사용자 입력 요청
            playerName = prompt('플레이어 이름을 입력하세요:', '플레이어');
        }
        
        if (playerName) {
            this.ranking.push({
                name: playerName,
                score: score,
                date: new Date().toISOString()
            });
            
            // 점수순으로 정렬 (내림차순)
            this.ranking.sort((a, b) => b.score - a.score);
            
            // 상위 10개만 유지
            this.ranking = this.ranking.slice(0, 10);
            
            this.saveRanking();
            console.log('로컬 랭킹에 저장됨:', playerName, score);
        }
    }
    
    updateRankingUI() {
        const rankingList = document.getElementById('rankingList');
        const totalPlayers = document.getElementById('totalPlayers');
        const yourRank = document.getElementById('yourRank');
        
        if (!rankingList) return;
        
        rankingList.innerHTML = '';
        
        // 총 플레이어 수 업데이트
        if (totalPlayers) {
            totalPlayers.textContent = this.ranking.length;
        }
        
        // 내 순위 찾기
        let myRank = -1;
        if (this.currentUser) {
            const myIndex = this.ranking.findIndex(entry => entry.userId === this.currentUser.uid);
            if (myIndex !== -1) {
                myRank = myIndex + 1;
            }
        }
        
        if (yourRank) {
            yourRank.textContent = myRank > 0 ? myRank : '-';
        }
        
        // 랭킹 아이템 생성
        this.ranking.forEach((entry, index) => {
            const rankingItem = document.createElement('div');
            const rank = index + 1;
            
            // 클래스 설정
            let itemClass = 'ranking-item';
            if (rank <= 3) {
                itemClass += ' top3';
            }
            if (this.currentUser && entry.userId === this.currentUser.uid) {
                itemClass += ' current-user';
            }
            
            rankingItem.className = itemClass;
            
            // 순위 배지 클래스
            let rankBadgeClass = 'rank-other';
            if (rank === 1) rankBadgeClass = 'rank-1';
            else if (rank === 2) rankBadgeClass = 'rank-2';
            else if (rank === 3) rankBadgeClass = 'rank-3';
            
            rankingItem.innerHTML = `
                <div class="rank-badge ${rankBadgeClass}">${rank}</div>
                <div class="player-info">
                    <div class="player-name">${entry.name}</div>
                    <div class="player-score">${entry.timestamp ? new Date(entry.timestamp).toLocaleDateString() : '오늘'}</div>
                </div>
                <div class="score-value">${entry.score.toLocaleString()}</div>
            `;
            
            rankingList.appendChild(rankingItem);
        });
        
        // 랭킹이 비어있을 때 메시지 표시
        if (this.ranking.length === 0) {
            rankingList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: rgba(255, 255, 255, 0.5);">
                    아직 기록이 없습니다.<br>
                    첫 번째 기록을 만들어보세요!
                </div>
            `;
        }
    }
    
    restartGame() {
        // 게임 상태 초기화
        this.board = this.initializeBoard();
        this.boardColors = this.initializeBoard(); // 색상 보드도 초기화
        this.score = 0;
        this.level = 1;
        this.gameRunning = true;
        this.gamePaused = false;
        this.dropTime = 0;
        this.dropInterval = 1000;
        
        // 시각적 요소 초기화
        this.pieceGroup.clear();
        this.fixedBlocks.clear();
        this.shadowGroup.clear();
        
        // 미니맵 관련 변수 초기화 (미니맵은 유지하고 새 게임 상태만 반영)
        // this.miniRenderer = null;  // 미니맵 렌더러는 유지
        // this.miniCamera = null;    // 미니맵 카메라는 유지
        // this.miniScene = null;     // 미니맵 씬은 유지
        
        // 미니맵 업데이트 (게임 재시작 시 즉시 동기화)
        this.minimapNeedsUpdate = true;
        
        // 게임 재시작 시 미니맵 즉시 업데이트
        if (this.miniRenderer && this.miniCamera) {
            this.updateMinimap();
        }
        
        // UI 초기화
        document.getElementById('gameOverModal').classList.remove('show');
        this.updateUI();
        
        // 새 게임 시작
        this.spawnNewPiece();
        
        // 첫 번째 피스 생성 후 미니맵 업데이트 (약간의 지연 후)
        this.minimapNeedsUpdate = true;
        setTimeout(() => {
            if (this.miniRenderer && this.miniCamera) {
                this.updateMinimap();
            }
        }, 50);
        
        // 익명 모드 상태 로그
        if (this.isAnonymousMode) {
            console.log('익명 모드로 게임 재시작됨 - 랭킹에 저장되지 않음');
        }
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        // 첫 번째 게임 루프에서 미니맵 설정
        if (!this.miniRenderer) {
            this.setupMinimap();
            this.minimapNeedsUpdate = true;
            
            // 미니맵 캔버스 표시
            const miniCanvas = document.getElementById('miniCanvas');
            if (miniCanvas) {
                miniCanvas.style.display = 'block';
            }
        }
        
        const currentTime = Date.now();
        
        if (!this.gamePaused && currentTime - this.dropTime > this.dropInterval) {
            if (!this.movePiece(0, -1, 0)) {
                this.placePiece();
                this.minimapNeedsUpdate = true; // 블록 고정 시 미니맵 업데이트
            } else {
                this.minimapNeedsUpdate = true; // 블록 이동 시 미니맵 업데이트
            }
            this.dropTime = currentTime;
        }
        
        // 렌더링
        this.renderer.render(this.scene, this.camera);
        
        // 미니맵 업데이트 (미니맵이 존재할 때만)
        if (this.miniRenderer && this.miniCamera) {
            if (this.minimapNeedsUpdate) {
                this.updateMinimap();
                this.minimapNeedsUpdate = false;
            }
            
            // 일시정지 상태에서는 미니맵을 계속 업데이트 (상태 동기화 유지)
            if (this.gamePaused) {
                this.updateMinimap();
            }
        }
        
        // 다음 프레임 요청
        requestAnimationFrame(() => this.gameLoop());
    }

    // Firebase 인증 함수들
    async signInWithNickname(nickname) {
        try {
            if (window.firebaseSignIn && window.firebaseAuth) {
                const result = await window.firebaseSignIn(window.firebaseAuth);
                console.log('익명 로그인 성공:', result.user);
                
                // 닉네임을 사용자 객체에 추가
                result.user.nickname = nickname;
                this.currentUser = result.user;
                
                // Firebase에 사용자 정보 저장
                await this.saveUserProfile(nickname);
                
                return result.user;
            } else {
                // Firebase가 사용 불가능한 경우 로컬 사용자 객체 생성
                console.log('Firebase 사용 불가 - 로컬 모드로 로그인');
                this.currentUser = {
                    uid: 'local_' + Date.now(),
                    nickname: nickname,
                    displayName: nickname
                };
                return this.currentUser;
            }
        } catch (error) {
            console.error('닉네임 로그인 실패:', error);
            // Firebase 실패 시에도 로컬 사용자 객체 생성
            console.log('Firebase 오류 - 로컬 모드로 로그인');
            this.currentUser = {
                uid: 'local_' + Date.now(),
                nickname: nickname,
                displayName: nickname
            };
            return this.currentUser;
        }
    }

    async saveUserProfile(nickname) {
        try {
            if (window.firebaseDb && this.currentUser) {
                const userData = {
                    nickname: nickname,
                    uid: this.currentUser.uid,
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString()
                };
                
                await window.firebaseSetDoc(
                    window.firebaseDoc(window.firebaseDb, 'users', this.currentUser.uid),
                    userData
                );
                console.log('사용자 프로필 저장 완료:', nickname);
            }
        } catch (error) {
            console.error('사용자 프로필 저장 실패:', error);
        }
    }

    async signOut() {
        try {
            if (window.firebaseAuth && window.firebaseAuth.signOut) {
                await window.firebaseAuth.signOut();
                console.log('로그아웃 성공');
                this.currentUser = null;
                this.userBestScore = 0;
            }
        } catch (error) {
            console.error('로그아웃 실패:', error);
            throw error;
        }
    }
}

// 게임은 startGame() 함수에서 수동으로 시작됩니다
