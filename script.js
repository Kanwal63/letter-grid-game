document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const elements = {
        formContainer: document.getElementById('form-container'),
        gameContainer: document.getElementById('game-container'),
        recordsContainer: document.getElementById('records-container'),
        playerForm: document.getElementById('player-form'),
        letterGrid: document.getElementById('letter-grid'),
        currentWordEl: document.getElementById('current-word'),
        scoreEl: document.getElementById('score'),
        messageEl: document.getElementById('message'),
        viewRecordsBtn: document.getElementById('view-records-btn'),
        closeRecordsBtn: document.getElementById('close-records-btn'),
        passwordSection: document.getElementById('password-section'),
        passwordBtn: document.getElementById('password-btn'),
        recordsDisplay: document.getElementById('records-display'),
        recordsList: document.getElementById('records-list'),
        foundWordsList: document.getElementById('found-words-list'),
        clearAllRecordsBtn: document.getElementById('clear-all-records-btn'),
        levelDisplay: document.getElementById('level-display'),
        stageDisplay: document.getElementById('stage-display'),
        wordsFoundCount: document.getElementById('words-found-count'),
        wordsToFind: document.getElementById('words-to-find'),
        levelUpModal: document.getElementById('level-up-modal'),
        modalTitle: document.getElementById('modal-title'),
        modalMessage: document.getElementById('modal-message'),
        nextStageBtn: document.getElementById('next-stage-btn'),
    };

    // Game Config
    const levelsConfig = [
        { stages: 8, wordsToFind: 3, abcCount: 3 }, // Level 1
        { stages: 5, wordsToFind: 5, abcCount: 4 }, // Level 2
        { stages: 2, wordsToFind: 7, abcCount: 5 }, // Level 3
        { stages: 1, wordsToFind: 10, abcCount: 6 } // Level 4
    ];
    const dictionary = new Set(['ABLE', 'ACID', 'BAKE', 'BEAM', 'CALM', 'DART', 'ECHO', 'FACE', 'GAME', 'HACK', 'IDEA', 'JUMP', 'KEEN', 'LACE', 'MAGIC', 'NICE', 'OATH', 'PACE', 'RACE', 'SAFE', 'TABLE', 'VAST', 'WAGE', 'YACHT', 'ZEBRA', 'ACT', 'ART', 'ACE', 'APE', 'ARM', 'BAG', 'BAT', 'BED', 'BEE', 'BIG', 'BOX', 'BOY', 'BUG', 'BUS', 'BUT', 'CAB', 'CAN', 'CAP', 'CAR', 'CAT', 'COW', 'CUB', 'CUP', 'CUT', 'DAD', 'DAY', 'DOG', 'EAR', 'EAT', 'EGG', 'FAN', 'FAR', 'FAT', 'FIN', 'FIX', 'FLY', 'FUN', 'GAS', 'GEM', 'GET', 'HAT', 'HEN', 'HER', 'HIM', 'HIT', 'HOT', 'ICE', 'INK', 'JAM', 'JAR', 'JET', 'JOB', 'JOG', 'JOY', 'KEY', 'KID', 'LAB', 'LEG', 'LET', 'LID', 'LIP', 'LOG', 'MAN', 'MAP', 'MAT', 'MOM', 'MUD', 'NET', 'NEW', 'NOW', 'NUT', 'OIL', 'OLD', 'ONE', 'PAN', 'PAR', 'PAT', 'PEA', 'PEN', 'PET', 'PIG', 'PIN', 'POT', 'PUT', 'RAG', 'RAN', 'RAT', 'RED', 'RIB', 'ROB', 'ROT', 'RUB', 'RUG', 'RUN', 'SAD', 'SAT', 'SAW', 'SAY', 'SEA', 'SEE', 'SET', 'SHE', 'SIN', 'SIP', 'SIR', 'SIT', 'SIX', 'SKY', 'SON', 'SUN', 'TAB', 'TAG', 'TAN', 'TAP', 'TEA', 'TEN', 'THE', 'TIE', 'TIN', 'TIP', 'TOE', 'TOP', 'TOY', 'TRY', 'TUB', 'USE', 'WAR', 'WAS', 'WAY', 'WEB', 'WET', 'WHO', 'WHY', 'WIN', 'YES', 'YET', 'YOU', 'ZAP', 'ZIP', 'ZOO', 'SCHOOL', 'COACHING', 'CENTER', 'SHAHEEN']);
    const colorPalette = ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', '#ff9ff3', '#54a0ff'];

    // Game State
    let state = {
        score: 0,
        currentLevel: 0,
        currentStage: 0,
        isDragging: false,
        path: [],
        foundWords: new Set(),
        records: JSON.parse(localStorage.getItem('playerRecords')) || [],
        colorInterval: null
    };

    function generateGrid() {
        elements.letterGrid.innerHTML = '';
        const config = levelsConfig[state.currentLevel];
        let letters = 'ABC'.repeat(Math.ceil(config.abcCount / 3)).slice(0, config.abcCount);
        const remaining = 25 - letters.length;
        const commonLetters = 'EEEEEEAAAAAIIIIIOOOOONNNNNRRRRRTTTTTLLLLUUUUSSSD';
        for (let i = 0; i < remaining; i++) {
            letters += commonLetters[Math.floor(Math.random() * commonLetters.length)];
        }
        letters = letters.split('').sort(() => 0.5 - Math.random());
        
        for (let i = 0; i < 25; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.textContent = letters[i];
            cell.dataset.row = Math.floor(i / 5);
            cell.dataset.col = i % 5;
            if ('ABC'.includes(letters[i])) {
                cell.classList.add('bonus');
            }
            elements.letterGrid.appendChild(cell);
        }
    }

    function updateUI() {
        elements.scoreEl.textContent = state.score;
        elements.levelDisplay.textContent = `Level: ${state.currentLevel + 1}`;
        elements.stageDisplay.textContent = `Stage: ${state.currentStage + 1}`;
        const wordsToFind = levelsConfig[state.currentLevel].wordsToFind;
        elements.wordsFoundCount.textContent = state.foundWords.size;
        elements.wordsToFind.textContent = wordsToFind;
    }

    function loadStage() {
        state.foundWords.clear();
        state.path = [];
        updateFoundWordsDisplay();
        generateGrid();
        updateUI();
        startColorChange();
    }
    
    function advanceLevel() {
        state.currentStage++;
        const levelConf = levelsConfig[state.currentLevel];
        if (state.currentStage >= levelConf.stages) {
            state.currentStage = 0;
            state.currentLevel++;
            if (state.currentLevel >= levelsConfig.length) {
                showModal("Congratulations!", "You have completed all levels!");
                elements.nextStageBtn.onclick = resetGame;
                return;
            } else {
                showModal("Level Up!", `Welcome to Level ${state.currentLevel + 1}`);
            }
        } else {
             showModal("Stage Complete!", `Get ready for Stage ${state.currentStage + 1}`);
        }
    }
    
    function showModal(title, message) {
        elements.modalTitle.textContent = title;
        elements.modalMessage.textContent = message;
        elements.levelUpModal.classList.remove('hidden');
    }
    
    elements.nextStageBtn.onclick = () => {
        elements.levelUpModal.classList.add('hidden');
        loadStage();
    };

    function handleDragStart(e) {
        e.preventDefault();
        const cell = e.target.closest('.grid-cell');
        if (cell) {
            state.isDragging = true;
            addToPath(cell);
        }
    }

    function handleDragMove(e) {
        if (!state.isDragging) return;
        e.preventDefault();
        const { clientX, clientY } = e.touches ? e.touches[0] : e;
        const cell = document.elementFromPoint(clientX, clientY)?.closest('.grid-cell');
        if (cell && state.path[state.path.length - 1] !== cell) {
            const lastCell = state.path[state.path.length - 1];
            if (isAdjacent(cell, lastCell)) {
                addToPath(cell);
            }
        }
    }

    function handleDragEnd() {
        if (!state.isDragging) return;
        state.isDragging = false;
        processWord();
        clearPath();
    }

    function isAdjacent(cell1, cell2) {
        const r1 = +cell1.dataset.row, c1 = +cell1.dataset.col;
        const r2 = +cell2.dataset.row, c2 = +cell2.dataset.col;
        return Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1;
    }

    function addToPath(cell) {
        if (state.path.includes(cell)) return;
        state.path.push(cell);
        cell.classList.add('path');
        elements.currentWordEl.textContent = state.path.map(c => c.textContent).join('');
    }
    
    function clearPath() {
        state.path.forEach(cell => cell.classList.remove('path'));
        state.path = [];
        elements.currentWordEl.textContent = '';
    }

    function processWord() {
        const word = state.path.map(c => c.textContent).join('');
        if (word.length < 3) return;

        if (dictionary.has(word) && !state.foundWords.has(word)) {
            state.foundWords.add(word);
            let wordScore = word.length * 10;
            if (word.includes('A') || word.includes('B') || word.includes('C')) wordScore *= 1.5;
            state.score += Math.round(wordScore);
            elements.messageEl.textContent = `Correct! +${Math.round(wordScore)}`;
            updateFoundWordsDisplay();
            updateUI();

            if (state.foundWords.size >= levelsConfig[state.currentLevel].wordsToFind) {
                advanceLevel();
            }
        } else {
            elements.messageEl.textContent = state.foundWords.has(word) ? 'Already found!' : 'Invalid word';
        }
        setTimeout(() => elements.messageEl.textContent = '', 2000);
    }

    function updateFoundWordsDisplay() {
        elements.foundWordsList.innerHTML = '';
        state.foundWords.forEach(word => {
            const item = document.createElement('div');
            item.className = 'found-word-item';
            item.textContent = word;
            elements.foundWordsList.appendChild(item);
        });
    }

    function startColorChange() {
        clearInterval(state.colorInterval);
        let colorIndex = 0;
        state.colorInterval = setInterval(() => {
            const items = document.querySelectorAll('.found-word-item');
            colorIndex++;
            items.forEach((item, index) => {
                item.style.backgroundColor = colorPalette[(colorIndex + index) % colorPalette.length];
            });
        }, 2000);
    }

    function resetGame() {
        state.score = 0;
        state.currentLevel = 0;
        state.currentStage = 0;
        loadStage();
    }
    
    // Event Listeners
    elements.playerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Record saving logic here...
        elements.formContainer.classList.add('hidden');
        elements.gameContainer.classList.remove('hidden');
        resetGame();
    });
    
    elements.letterGrid.addEventListener('mousedown', handleDragStart);
    elements.letterGrid.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    elements.letterGrid.addEventListener('touchstart', handleDragStart, { passive: false });
    elements.letterGrid.addEventListener('touchmove', handleDragMove, { passive: false });
    window.addEventListener('touchend', handleDragEnd);

    // Records logic (kept from previous version)
    elements.viewRecordsBtn.addEventListener('click', () => {
        elements.gameContainer.classList.add('hidden');
        elements.recordsContainer.classList.remove('hidden');
    });
    elements.closeRecordsBtn.addEventListener('click', () => {
        elements.recordsContainer.classList.add('hidden');
        elements.gameContainer.classList.remove('hidden');
    });
    elements.passwordBtn.addEventListener('click', () => {
        if (document.getElementById('password-input').value === 'HAMIT') {
            elements.passwordSection.classList.add('hidden');
            elements.recordsDisplay.classList.remove('hidden');
            // displayRecords();
        } else { alert('Incorrect Password!'); }
    });

});