let chapterMeta = {
    title: "BSEB क्विज़ पोर्टल",
    subtitle: "लोड हो रहा है...",
    description: "कृपया प्रतीक्षा करें..."
};

let rawQuestions = [];
let questions = [];
let currentQuestion = 0;
let score = 0;
let answered = false;
let questionStates = [];

const appDiv = document.getElementById('app');

// URL Parameter से Data File Path प्राप्त करना
const urlParams = new URLSearchParams(window.location.search);
const dataFile = urlParams.get('file');

window.onload = function() {
    if (dataFile) {
        fetch(`./data/${dataFile}`)
            .then(res => res.json())
            .then(data => {
                chapterMeta.title = data.title || "BSEB क्विज़";
                chapterMeta.subtitle = data.subtitle || "";
                chapterMeta.description = data.description || "";
                rawQuestions = data.questions || [];
                
                renderStartScreen();
            })
            .catch(err => {
                appDiv.innerHTML = `<div class="p-8 text-center" style="color: #f87171;">त्रुटि: डेटा फ़ाइल लोड नहीं हो सकी!</div>`;
                console.error("Data load error:", err);
            });
    } else {
        renderStartScreen();
    }
};

// Fisher-Yates Shuffle Algorithm
function shuffleQuestionsAndOptions(array) {
    const shuffled = JSON.parse(JSON.stringify(array));
    
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    shuffled.forEach(item => {
        const correctAnswerText = item.o[item.a];
        for (let i = item.o.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [item.o[i], item.o[j]] = [item.o[j], item.o[i]];
        }
        item.a = item.o.indexOf(correctAnswerText);
    });

    return shuffled;
}

function renderStartScreen() {
    appDiv.innerHTML = `
        <div class="flex-1 flex flex-col items-center justify-center p-8 text-center fade-in h-full">
            <div style="width: 88px; height: 88px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; border: 1px solid rgba(56, 189, 248, 0.3);">
                <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            </div>
            <h1 style="font-size: 2.2rem; font-weight: 800; margin-bottom: 12px; color: #f8fafc;">${chapterMeta.title}</h1>
            <h2 style="font-size: 1.35rem; color: #38bdf8; font-weight: 600; margin-bottom: 16px;">${chapterMeta.subtitle}</h2>
            <p style="color: #94a3b8; margin-bottom: 32px; max-width: 620px; font-size: 1.05rem; line-height: 1.6;">${chapterMeta.description}</p>
            <button onclick="startQuiz()" class="btn-start">क्विज़ प्रारंभ करें</button>
        </div>
    `;
}

function startQuiz() {
    if(rawQuestions.length === 0) {
        alert("कोई प्रश्न उपलब्ध नहीं है!");
        return;
    }
    questions = shuffleQuestionsAndOptions(rawQuestions);
    currentQuestion = 0;
    score = 0;
    questionStates = new Array(questions.length).fill('default');
    renderQuestion();
}

function renderQuestion() {
    answered = false;
    const q = questions[currentQuestion];
    const progress = ((currentQuestion) / questions.length) * 100;

    let optionsHtml = '';
    q.o.forEach((opt, index) => {
        optionsHtml += `
            <button onclick="checkAnswer(${index}, this)" class="option-btn">
                <span>${opt}</span>
                <span class="icon-container hidden"></span>
            </button>
        `;
    });

    appDiv.innerHTML = `
        <div class="quiz-header">
            <div class="flex justify-between items-center" style="margin-bottom: 12px; padding-right: 50px;">
                <span style="font-size: 0.85rem; font-weight: bold; color: #38bdf8; letter-spacing: 0.5px;">प्रश्न ${currentQuestion + 1} / ${questions.length}</span>
                <span style="font-size: 0.85rem; font-weight: bold; color: #e2e8f0; background: rgba(255,255,255,0.1); padding: 4px 14px; border-radius: 9999px;">स्कोर: ${score}</span>
            </div>
            <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${progress}%"></div>
            </div>
            <div class="profile-icon" onclick="openOverview()" title="प्रश्नावली नेविगेशन">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto p-8 fade-in flex flex-col" style="padding: 28px 32px;">
            <h2 style="font-size: 1.35rem; font-weight: 600; margin-bottom: 24px; line-height: 1.5; color: #f1f5f9;">${q.q}</h2>
            <div id="options-container" class="flex-1 flex flex-col justify-center">
                ${optionsHtml}
            </div>
        </div>

        <div class="flex justify-between items-center" style="padding: 20px 32px; background: rgba(15, 23, 42, 0.6); border-top: 1px solid rgba(255, 255, 255, 0.1); min-height: 80px;">
            <div>
                <button id="skip-btn" onclick="skipQuestion()" class="btn-action btn-skip">स्किप करें</button>
            </div>
            <button id="next-btn" onclick="nextQuestion()" class="hidden btn-action btn-next">
                ${currentQuestion === questions.length - 1 ? 'परिणाम देखें' : 'अगला प्रश्न'}
            </button>
        </div>
    `;
}

function checkAnswer(selectedIndex, btnElement) {
    if (answered) return;
    answered = true;

    const q = questions[currentQuestion];
    const allBtns = document.querySelectorAll('.option-btn');
    const nextBtn = document.getElementById('next-btn');
    const skipBtn = document.getElementById('skip-btn');

    if(skipBtn) skipBtn.classList.add('hidden');

    allBtns.forEach((btn, index) => {
        btn.classList.add('disabled-option');
        btn.disabled = true;
        const iconContainer = btn.querySelector('.icon-container');
        iconContainer.classList.remove('hidden');

        if (index === q.a) {
            btn.classList.add('correct');
            btn.classList.remove('disabled-option');
            iconContainer.innerHTML = `<svg style="color: #4ade80; width: 22px; height: 22px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
        }
        
        if (index === selectedIndex && selectedIndex !== q.a) {
            btn.classList.add('wrong');
            btn.classList.remove('disabled-option');
            iconContainer.innerHTML = `<svg style="color: #f87171; width: 22px; height: 22px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
        } 
    });

    if (selectedIndex === q.a) {
        score++;
        questionStates[currentQuestion] = 'correct';
    } else {
        questionStates[currentQuestion] = 'wrong';
    }

    nextBtn.classList.remove('hidden');
    nextBtn.classList.add('fade-in');
}

function skipQuestion() {
    questionStates[currentQuestion] = 'skipped';
    nextQuestion();
}

function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        renderQuestion();
    } else {
        renderResultScreen();
    }
}

function openOverview() {
    let gridHtml = '';
    for(let i = 0; i < questions.length; i++) {
        let stateClass = 'state-default';
        if(questionStates[i] === 'correct') stateClass = 'state-correct';
        if(questionStates[i] === 'wrong') stateClass = 'state-wrong';
        if(questionStates[i] === 'skipped') stateClass = 'state-skipped';
        
        gridHtml += `<button onclick="jumpToQuestion(${i})" class="q-circle ${stateClass}">${i + 1}</button>`;
    }

    const overviewDiv = document.createElement('div');
    overviewDiv.id = 'overview-overlay';
    overviewDiv.className = 'overview-panel fade-in';
    overviewDiv.innerHTML = `
        <h3 style="font-size: 1.35rem; font-weight: bold; margin-bottom: 16px; text-align: center; color: #f8fafc;">प्रश्नावली ओवरव्यू (कुल ${questions.length} प्रश्न)</h3>
        <div class="grid-container">
            ${gridHtml}
        </div>
        <div class="flex justify-center" style="padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
            <button onclick="closeOverview()" class="btn-action btn-skip" style="margin: 0 8px;">वापस जाएँ</button>
            <button onclick="submitQuizFromOverview()" class="btn-action btn-next" style="margin: 0 8px;">सबमिट करें</button>
        </div>
    `;
    appDiv.appendChild(overviewDiv);
}

function closeOverview() {
    const overlay = document.getElementById('overview-overlay');
    if(overlay) overlay.remove();
}

function jumpToQuestion(index) {
    currentQuestion = index;
    closeOverview();
    renderQuestion();
}

function submitQuizFromOverview() {
    closeOverview();
    renderResultScreen();
}

function renderResultScreen() {
    const percentage = Math.round((score / questions.length) * 100);
    let message = "";
    
    if (percentage === 100) { message = "उत्कृष्ट! आपने इस अध्याय में पूरे अंक प्राप्त किए हैं!"; }
    else if (percentage >= 80) { message = "शानदार प्रदर्शन! आपकी तैयारी बहुत अच्छी है।"; }
    else if (percentage >= 50) { message = "अच्छा प्रयास! पाठ को एक बार और दोहराएँ।"; }
    else { message = "अभ्यास जारी रखें! पाठ्यपुस्तक को ध्यान से पढ़ें और पुनः प्रयास करें।"; }

    const strokeDasharray = `${percentage}, 100`;
    const colorClass = percentage >= 80 ? '#22c55e' : percentage >= 50 ? '#eab308' : '#ef4444';

    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    questionStates.forEach(st => {
        if(st === 'correct') correctCount++;
        else if(st === 'wrong') wrongCount++;
        else if(st === 'skipped') skippedCount++;
    });

    appDiv.innerHTML = `
        <div class="flex-1 flex flex-col items-center justify-center p-8 text-center fade-in overflow-y-auto" style="padding: 32px;">
            <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 4px; color: #f8fafc;">${chapterMeta.title}</h2>
            <p style="font-size: 1rem; color: #94a3b8; margin-bottom: 20px;">${chapterMeta.subtitle} (कुल प्रश्न: ${questions.length})</p>
            
            <h3 style="font-size: 1.6rem; font-weight: 700; margin-bottom: 20px; color: #38bdf8;">क्विज़ पूर्ण हुई!</h3>

            <div style="position: relative; width: 180px; height: 180px; margin-bottom: 24px; display: flex; align-items: center; justify-content: center;">
                <svg viewBox="0 0 36 36" class="circular-chart" style="width: 100%; height: 100%;">
                    <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                    <path class="circle" stroke="${colorClass}" stroke-dasharray="${strokeDasharray}" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                </svg>
                <div style="position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <span style="font-size: 2.25rem; font-weight: 900; color: #38bdf8;">${percentage}%</span>
                </div>
            </div>

            <div class="stats-box">
                <div class="flex justify-between items-center text-center">
                    <div>
                        <p style="font-size: 0.8rem; color: #94a3b8; font-weight: bold; margin-bottom: 4px;">कुल प्रश्न</p>
                        <p style="font-size: 1.4rem; font-weight: 800; color: #f8fafc;">${questions.length}</p>
                    </div>
                    <div>
                        <p style="font-size: 0.8rem; color: #94a3b8; font-weight: bold; margin-bottom: 4px;">सही उत्तर</p>
                        <p style="font-size: 1.4rem; font-weight: 800; color: #4ade80;">${correctCount}</p>
                    </div>
                    <div>
                        <p style="font-size: 0.8rem; color: #94a3b8; font-weight: bold; margin-bottom: 4px;">गलत उत्तर</p>
                        <p style="font-size: 1.4rem; font-weight: 800; color: #f87171;">${wrongCount}</p>
                    </div>
                    <div>
                        <p style="font-size: 0.8rem; color: #94a3b8; font-weight: bold; margin-bottom: 4px;">छोड़े गए</p>
                        <p style="font-size: 1.4rem; font-weight: 800; color: #facc15;">${skippedCount}</p>
                    </div>
                </div>
            </div>

            <p style="font-size: 1.05rem; color: #cbd5e1; margin-bottom: 28px; max-width: 450px; line-height: 1.5;">${message}</p>
            
            <button onclick="startQuiz()" class="btn-action" style="padding: 14px 40px; border-radius: 12px; font-size: 1.05rem; background: #22c55e; color: white;">
                पुनः प्रयास करें
            </button>
        </div>
    `;
}
