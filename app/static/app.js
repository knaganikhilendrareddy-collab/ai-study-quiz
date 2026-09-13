const state = { view: 'dashboard', dashboard: null, material: null, quiz: null, current: 0, answers: {}, marked: new Set(), startedAt: 0, result: null, chatOpen: false, authenticated: localStorage.getItem('ai-study-auth') === 'true', chatMessages: [{ role: 'assistant', text: 'Hi! I am your AI study assistant. What would you like to learn today?' }] };

const icon = (name) => ({
  home: '⌂', book: '▣', chart: '↗', user: '◉', upload: '↑', arrow: '→', back: '←', check: '✓', spark: '✦', clock: '◷', target: '◎', menu: '☰'
}[name] || '•');

async function api(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Something went wrong.');
  return data;
}

async function loadDashboard() {
  state.dashboard = await api('/api/dashboard');
  render();
}

function appShell(content, active = 'dashboard') {
  return `<div class="app-shell"><aside class="sidebar"><div class="brand"><span class="brand-mark">✦</span><span>nikhil<span class="brand-accent">.</span>ai<span class="brand-accent">.</span>reddy</span></div><nav><button class="nav-item ${active === 'dashboard' ? 'active' : ''}" onclick="go('dashboard')"><span>${icon('home')}</span>Overview</button><button class="nav-item ${active === 'library' ? 'active' : ''}" onclick="openUpload()"><span>${icon('book')}</span>Study library</button><button class="nav-item ${active === 'progress' ? 'active' : ''}" onclick="go('progress')"><span>${icon('chart')}</span>Progress</button></nav><div class="sidebar-bottom"><div class="mini-profile"><div class="avatar">AM</div><div><strong>Alex Morgan</strong><span>Learning streak · 4 days</span></div></div><button class="nav-item"><span>${icon('user')}</span>Profile</button></div></aside><main class="main-content"><header class="topbar"><button class="mobile-menu">${icon('menu')}</button><div class="breadcrumb">Workspace <span>/</span> ${active === 'dashboard' ? 'Overview' : active === 'progress' ? 'Progress' : 'Study session'}</div><div class="top-actions"><span class="date-label">Sunday, Sep 13</span><div class="avatar small">AM</div></div></header>${content}</main></div>`;
}

function loginView() {
  return `<main class="login-page"><div class="login-atmosphere"><span class="login-grid"></span><span class="login-orb orb-a"></span><span class="login-orb orb-b"></span><div class="login-scene"><div class="scene-moon"></div><div class="scene-tree tree-a"></div><div class="scene-tree tree-b"></div><div class="scene-card"><span>STUDY / 01</span><strong>FOCUS<br>FORWARD</strong><small>your next idea is waiting</small></div><div class="scene-ring ring-a"></div><div class="scene-ring ring-b"></div></div><div class="login-quote"><span>✦</span><p>Make every<br>session count.</p><small>AI-powered practice for curious minds.</small></div></div><section class="login-panel"><div class="login-brand"><span class="brand-mark">✦</span><strong>nikhil<span>.</span>ai<span>.</span>reddy</strong></div><div class="login-heading"><p class="eyebrow">WELCOME BACK</p><h1>Return to your<br><em>learning flow.</em></h1><p>Pick up where you left off and turn a few focused minutes into real progress.</p></div><form class="login-form" onsubmit="handleLogin(event)"><label>Email address<input type="email" name="email" placeholder="you@example.com" autocomplete="email" required></label><label>Password<div class="password-field"><input type="password" name="password" placeholder="Enter your password" autocomplete="current-password" required><button type="button" onclick="togglePassword(this)" aria-label="Show password">◉</button></div></label><div class="login-options"><label class="remember"><input type="checkbox" checked> <span>Remember me</span></label><button type="button" class="forgot-link" onclick="showLoginMessage('Password reset links will be available when a live account provider is connected.')">Forgot password?</button></div><button class="button primary login-submit" type="submit"><span>Enter workspace</span>${icon('arrow')}</button><div class="login-divider"><span>OR CONTINUE WITH</span></div><button class="social-login" type="button" onclick="continueAsDemo()"><span class="google-mark">G</span> Continue with Google</button><p class="login-note" id="login-message">Demo mode is ready. No account or API key required.</p></form><p class="login-footer">New to focused learning? <button type="button" onclick="continueAsDemo()">Start with a demo workspace</button></p></section></main>`;
}

function dashboardView() {
  const d = state.dashboard || { user: { name: 'Alex Morgan' }, stats: {}, attempts: [], materials: [] };
  const stats = d.stats || {};
  const recent = (d.attempts || []).slice(0, 3).map(attempt => `<div class="recent-row"><div class="subject-icon">${icon('book')}</div><div class="recent-title"><strong>${attempt.topic}</strong><span>${attempt.total_questions} questions · ${new Date(attempt.created_at).toLocaleDateString()}</span></div><div class="recent-score ${attempt.score >= 80 ? 'high' : ''}">${attempt.score}%</div><span class="row-arrow">${icon('arrow')}</span></div>`).join('') || `<div class="empty-state"><span>${icon('spark')}</span><strong>Your first quiz starts here</strong><p>Upload a study guide or try the demo quiz to build your learning history.</p></div>`;
  return appShell(`<section class="page-wrap"><div class="welcome-row"><div><p class="eyebrow">YOUR LEARNING SPACE</p><h1>Good morning, ${d.user.name.split(' ')[0]}.</h1><p class="subtitle">Small sessions, sharper recall. Keep your momentum going.</p></div><button class="button primary" onclick="openUpload()"><span>${icon('upload')}</span> Upload material</button></div><div class="hero-banner"><div class="hero-copy"><span class="pill light">${icon('spark')} DEMO SESSION</span><h2>Turn your notes<br>into <em>confidence.</em></h2><p>Try a quick quiz on the psychology of deep work, or upload your own study material.</p><button class="text-button light-text" onclick="startDemo()">Start demo quiz ${icon('arrow')}</button></div><div class="hero-art"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="art-card card-back"></div><div class="art-card card-front"><span>FOCUS</span><strong>DEEP<br>WORK</strong><small>chapter 01</small></div><div class="art-spark">✦</div></div></div><div class="section-heading"><div><p class="eyebrow">AT A GLANCE</p><h2>Your progress</h2></div><button class="text-button" onclick="go('progress')">View full report ${icon('arrow')}</button></div><div class="stat-grid"><div class="stat-card"><div class="stat-icon mint">${icon('target')}</div><span>QUIZZES COMPLETED</span><strong>${stats.quizzes_completed || 0}</strong><small>Keep building your streak</small></div><div class="stat-card"><div class="stat-icon peach">${icon('chart')}</div><span>AVERAGE SCORE</span><strong>${stats.average_score || 0}<sup>%</sup></strong><small class="positive">${stats.average_score ? '↑ 8% from last week' : 'Your baseline is waiting'}</small></div><div class="stat-card"><div class="stat-icon lilac">${icon('spark')}</div><span>BEST SCORE</span><strong>${stats.best_score || 0}<sup>%</sup></strong><small>Personal best</small></div><div class="stat-card streak-card"><div class="stat-icon yellow">✺</div><span>LEARNING STREAK</span><strong>${stats.streak || 0}<sup> days</sup></strong><div class="streak-dots"><i class="filled"></i><i class="filled"></i><i class="filled"></i><i class="filled"></i><i></i><i></i><i></i></div></div></div><div class="lower-grid"><section class="panel recent-panel"><div class="panel-heading"><div><p class="eyebrow">KEEP GOING</p><h2>Recent quizzes</h2></div><button class="icon-button" aria-label="Open progress" onclick="go('progress')">${icon('arrow')}</button></div>${recent}</section><section class="panel insight-panel"><div class="panel-heading"><div><p class="eyebrow">SMART INSIGHT</p><h2>Your next best step</h2></div><span class="insight-mark">✦</span></div><div class="insight-body"><div class="progress-ring"><span>${stats.average_score || 0}<small>%</small></span></div><div><strong>Build your foundation</strong><p>Complete a quiz to unlock personalized topic recommendations and your first achievement.</p><button class="text-button" onclick="startDemo()">Explore a topic ${icon('arrow')}</button></div></div></section></div></section>`);
}

function progressView() {
  const attempts = state.dashboard?.attempts || [];
  const rows = attempts.map(a => `<div class="history-row"><span class="history-date">${new Date(a.created_at).toLocaleDateString()}</span><strong>${a.topic}</strong><span>${a.total_questions} questions</span><b class="${a.score >= 80 ? 'score-good' : ''}">${a.score}%</b></div>`).join('') || '<div class="empty-state"><span>↗</span><strong>No results yet</strong><p>Complete your first quiz and your performance report will appear here.</p></div>';
  return appShell(`<section class="page-wrap"><div class="welcome-row"><div><p class="eyebrow">YOUR DATA</p><h1>Progress report</h1><p class="subtitle">A calm view of how your understanding is growing.</p></div><button class="button primary" onclick="startDemo()">${icon('spark')} New quiz</button></div><div class="report-banner"><div><span class="pill">PERFORMANCE SNAPSHOT</span><h2>Your learning curve<br>starts with <em>one answer.</em></h2></div><div class="report-number"><strong>${state.dashboard?.stats.average_score || 0}<small>%</small></strong><span>average score</span></div><div class="mini-bars"><i style="height:35%"></i><i style="height:48%"></i><i style="height:42%"></i><i style="height:65%"></i><i style="height:58%"></i><i style="height:82%"></i><i style="height:76%"></i></div></div><div class="section-heading"><div><p class="eyebrow">HISTORY</p><h2>Quiz activity</h2></div></div><section class="panel history-panel"><div class="history-row history-head"><span>DATE</span><span>TOPIC</span><span>FORMAT</span><span>SCORE</span></div>${rows}</section></section>`,'progress');
}

function uploadModal() { return `<div class="modal-backdrop" id="upload-modal" onclick="closeUpload(event)"><div class="modal" onclick="event.stopPropagation()"><button class="modal-close" onclick="closeUpload()">×</button><p class="eyebrow">NEW STUDY SESSION</p><h2>Bring your notes.</h2><p class="modal-subtitle">Upload a JPG, PNG, or PDF and we'll turn it into a focused practice set.</p><label class="drop-zone" for="file-input"><span class="upload-cloud">↑</span><strong>Drop your material here</strong><span>or click to browse · max 10 MB</span><input id="file-input" type="file" accept=".jpg,.jpeg,.png,.pdf" onchange="handleUpload(event)" /></label><div class="demo-divider"><span>or</span></div><button class="button secondary full" onclick="startDemo(); closeUpload()">${icon('spark')} Try the demo material</button><div id="upload-status"></div></div></div>`; }

function quizSetup() { return appShell(`<section class="page-wrap narrow"><button class="back-button" onclick="go('dashboard')">${icon('back')} Back to overview</button><div class="setup-header"><p class="eyebrow">QUIZ BUILDER</p><h1>Make it stick.</h1><p class="subtitle">Choose your session shape. We'll handle the rest.</p></div><section class="setup-panel"><div class="setup-material"><div class="material-thumb">✦</div><div><span>SELECTED MATERIAL</span><strong>${state.material?.filename || 'Demo · The Psychology of Deep Work'}</strong><small>${state.material?.topic || 'The Psychology of Deep Work'}</small></div><button class="text-button" onclick="openUpload()">Change</button></div><div class="form-group"><label>Number of questions</label><div class="segmented">${[5,10,20,30].map((n,i) => `<button class="${(state.setupCount || 5) === n ? 'selected' : ''}" onclick="state.setupCount=${n}; render()">${n}</button>`).join('')}</div></div><div class="form-group"><label>Difficulty</label><div class="choice-grid">${['Easy','Medium','Hard','Mixed'].map((x,i) => `<button class="choice ${state.setupDifficulty === x || (!state.setupDifficulty && x === 'Mixed') ? 'selected' : ''}" onclick="state.setupDifficulty='${x}'; render()"><span class="choice-dot"></span>${x}<small>${['Build the basics','Stretch your recall','Go deeper','A balanced mix'][i]}</small></button>`).join('')}</div></div><button class="button primary full" onclick="createQuiz()">Generate my quiz ${icon('arrow')}</button><p class="privacy-note">✦ AI-generated questions stay private to your workspace.</p></section></section>`,'library'); }

function quizView() { const q = state.quiz.questions[state.current]; const selected = state.answers[q.id]; const answered = selected !== undefined && selected !== null; const percent = Math.round((state.current / state.quiz.questions.length) * 100); return `<div class="quiz-shell"><header class="quiz-top"><button class="back-button" onclick="go('dashboard')">${icon('back')} Exit quiz</button><div class="quiz-brand">study<span>/</span>quiz</div><div class="quiz-timer">${icon('clock')} <span id="timer">${formatTime(Math.floor((Date.now()-state.startedAt)/1000))}</span></div></header><div class="quiz-progress"><div style="width:${percent}%"></div></div><main class="question-wrap"><div class="question-meta"><span>QUESTION ${state.current + 1} <i>/</i> ${state.quiz.questions.length}</span><button class="review-toggle ${state.marked.has(q.id) ? 'marked' : ''}" onclick="toggleMark()">${state.marked.has(q.id) ? '★' : '☆'} Mark for review</button></div><p class="question-topic">${q.topic} · ${q.difficulty}</p><h1>${q.question}</h1><div class="option-list">${q.options.map((option,index) => `<button class="option ${selected === index ? 'selected' : ''} ${answered && index === q.correct_answer ? 'correct' : ''} ${answered && selected === index && selected !== q.correct_answer ? 'wrong' : ''}" onclick="answer(${index})"><span class="option-letter">${String.fromCharCode(65+index)}</span><span>${option}</span>${answered && index === q.correct_answer ? `<b>${icon('check')}</b>` : ''}</button>`).join('')}</div>${answered ? `<div class="feedback ${selected === q.correct_answer ? 'good' : 'needs-work'}"><strong>${selected === q.correct_answer ? 'Nice work.' : 'Keep this one in your review set.'}</strong><p>${q.explanation}</p></div>` : ''}<div class="question-actions"><button class="button secondary" ${state.current === 0 ? 'disabled' : ''} onclick="previousQuestion()">${icon('back')} Previous</button>${state.current === state.quiz.questions.length - 1 ? `<button class="button primary" ${!answered ? 'disabled' : ''} onclick="finishQuiz()">Finish quiz ${icon('check')}</button>` : `<button class="button primary" ${!answered ? 'disabled' : ''} onclick="nextQuestion()">Next question ${icon('arrow')}</button>`}</div></main></div>`; }

function resultsView() { const r = state.result; const a = r.analysis; return appShell(`<section class="page-wrap results-wrap"><div class="result-top"><div><p class="eyebrow">QUIZ COMPLETE</p><h1>That was a good<br><em>mental workout.</em></h1><p class="subtitle">${r.performance}. Here's what your answers tell us.</p></div><div class="score-circle" style="--score:${r.score}"><div><strong>${r.score}<small>%</small></strong><span>score</span></div></div></div><div class="result-stats"><div><span>CORRECT</span><strong>${r.correct}</strong><small>answers</small></div><div><span>WRONG</span><strong>${r.wrong}</strong><small>to revisit</small></div><div><span>UNANSWERED</span><strong>${r.unanswered}</strong><small>questions</small></div><div><span>TIME TAKEN</span><strong>${formatTime(r.time_taken)}</strong><small>focused time</small></div></div><div class="analysis-grid"><section class="panel analysis-panel"><div class="panel-heading"><div><p class="eyebrow">AI PERFORMANCE ANALYSIS</p><h2>What to focus on next</h2></div><span class="insight-mark">✦</span></div><div class="topic-columns"><div><span class="topic-label strong-label">STRONG TOPICS</span>${(a.strong_topics.length ? a.strong_topics : ['Keep practicing recall']).map(t => `<div class="topic-chip strong-chip">${icon('check')} ${t}</div>`).join('')}</div><div><span class="topic-label weak-label">NEEDS REVISION</span>${(a.revision_topics.length ? a.revision_topics : ['You are in a good place']).map(t => `<div class="topic-chip weak-chip">↗ ${t}</div>`).join('')}</div></div><div class="recommendation"><span>${icon('spark')}</span><div><strong>Your next best step</strong><p>${a.recommendation}</p></div></div></section><section class="panel next-panel"><p class="eyebrow">RECOMMENDED NEXT</p><div class="next-icon">${icon('arrow')}</div><h2>${a.next_difficulty} difficulty</h2><p>Keep the concepts active with another short session.</p><button class="button primary full" onclick="startDemo()">Take another quiz</button></section></div><section class="review-section"><div class="section-heading"><div><p class="eyebrow">LOOK BACK</p><h2>Question review</h2></div><button class="text-button" onclick="toggleReview()">Show ${state.showAllReview ? 'less' : 'all'} ${icon('arrow')}</button></div><div class="review-list">${state.quiz.questions.map((q,i) => `<div class="review-row ${state.result.answers[q.id] === q.correct_answer ? 'review-correct' : 'review-wrong'}"><span class="review-index">${String(i+1).padStart(2,'0')}</span><div><strong>${q.question}</strong><p>${state.result.answers[q.id] === undefined || state.result.answers[q.id] === null ? 'Not answered' : state.result.answers[q.id] === q.correct_answer ? 'Correct answer' : `Correct: ${q.options[q.correct_answer]}`}</p></div><span>${state.result.answers[q.id] === q.correct_answer ? icon('check') : '↗'}</span></div>`).join('')}</div></section></section>`,'progress'); }

function enhance3D() {
  const scene = document.querySelector('.hero-banner');
  if (scene && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    scene.addEventListener('pointermove', (event) => {
      const bounds = scene.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      scene.style.setProperty('--tilt-x', `${(-y * 5).toFixed(2)}deg`);
      scene.style.setProperty('--tilt-y', `${(x * 7).toFixed(2)}deg`);
      scene.style.setProperty('--pointer-x', `${(x * 18).toFixed(1)}px`);
      scene.style.setProperty('--pointer-y', `${(y * 14).toFixed(1)}px`);
    });
    scene.addEventListener('pointerleave', () => {
      scene.style.setProperty('--tilt-x', '0deg');
      scene.style.setProperty('--tilt-y', '0deg');
      scene.style.setProperty('--pointer-x', '0px');
      scene.style.setProperty('--pointer-y', '0px');
    });
  }
  document.querySelectorAll('.stat-card, .panel').forEach((card, index) => {
    card.style.setProperty('--card-delay', `${index * 70}ms`);
  });
  ensureAnimeFigure();
  ensureForest();
  ensureChatWidget();
}

function ensureForest() {
  const art = document.querySelector('.hero-art');
  if (art && !art.querySelector('.forest')) {
    art.insertAdjacentHTML('afterbegin', '<div class="forest" aria-hidden="true"><i class="tree tree-far tree-far-one"></i><i class="tree tree-far tree-far-two"></i><i class="tree tree-mid tree-mid-one"></i><i class="tree tree-mid tree-mid-two"></i><i class="tree tree-near tree-near-one"></i></div>');
  }
}

function ensureAnimeFigure() {
  const art = document.querySelector('.hero-art');
  if (art && !art.querySelector('.anime-figure')) {
    art.insertAdjacentHTML('beforeend', '<div class="anime-figure" role="button" tabindex="0" aria-label="Study navigator" onclick="figureReact()" onkeydown="if(event.key === \'Enter\' || event.key === \' \') figureReact()"><div class="figure-hair"></div><div class="figure-head"><i class="eye eye-left"></i><i class="eye eye-right"></i><span class="figure-mouth"></span></div><div class="figure-neck"></div><div class="figure-scarf"></div><div class="figure-body"><span class="figure-badge">✦</span></div><div class="figure-arm arm-left"></div><div class="figure-arm arm-right"></div><div class="figure-shadow"></div></div>');
  }
}

function figureReact() {
  const figure = document.querySelector('.anime-figure');
  if (!figure) return;
  figure.classList.remove('figure-react');
  void figure.offsetWidth;
  figure.classList.add('figure-react');
  state.chatMessages.push({ role: 'assistant', text: 'Ahoy! Your study navigator is ready. Touch me anytime for a quick study tip.' });
  ensureChatWidget();
}

function escapeHTML(value) { return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character])); }

function ensureChatWidget() {
  if (!document.getElementById('ai-chat')) {
    document.body.insertAdjacentHTML('beforeend', `<button type="button" aria-expanded="${state.chatOpen}" class="ai-launcher ${state.chatOpen ? 'open' : ''}"><span class="ai-orbit">✦</span><span>ASK AI</span><i></i></button><section class="ai-chat ${state.chatOpen ? 'visible' : ''}" id="ai-chat" aria-label="Study intelligence assistant"><header class="ai-chat-head"><div class="ai-avatar">✦</div><div><strong>Study intelligence</strong><span><i></i> PERSONAL STUDY COPILOT / READY</span></div><button type="button" aria-label="Close assistant">×</button></header><div class="ai-chat-body" id="chat-messages" aria-live="polite"></div><div class="ai-suggestions"><span class="suggestion-label">QUICK ACTIONS</span><button type="button" onclick="sendChatPrompt('Give me a quick study tip')">Study tip <small>Focus now</small></button><button type="button" onclick="sendChatPrompt('Make me a quiz')">Make a quiz <small>Test recall</small></button><button type="button" onclick="sendChatPrompt('Explain deep work')">Explain a topic <small>Learn clearly</small></button></div><form class="ai-chat-form" onsubmit="sendChat(event)"><input id="chat-input" autocomplete="off" placeholder="Ask anything about your study..." /><button type="submit" aria-label="Send message">${icon('arrow')}</button></form><div class="ai-chat-foot">AI responses can be checked against your study material.</div></section>`);
    document.querySelector('.ai-launcher')?.addEventListener('click', toggleChat);
    document.querySelector('.ai-chat-head > button')?.addEventListener('click', toggleChat);
  }
  document.querySelector('.ai-launcher')?.classList.toggle('open', state.chatOpen);
  document.querySelector('.ai-launcher')?.setAttribute('aria-expanded', String(state.chatOpen));
  document.getElementById('ai-chat')?.classList.toggle('visible', state.chatOpen);
  const messages = document.getElementById('chat-messages');
  if (messages) {
    messages.innerHTML = state.chatMessages.map(message => `<div class="chat-message ${message.role}"><span class="message-mark">${message.role === 'assistant' ? '✦' : 'AM'}</span><p>${escapeHTML(message.text)}</p></div>`).join('');
    messages.scrollTop = messages.scrollHeight;
  }
}

function toggleChat() { state.chatOpen = !state.chatOpen; ensureChatWidget(); if (state.chatOpen) setTimeout(() => document.getElementById('chat-input')?.focus(), 80); }
function useSuggestion(message) { const input = document.getElementById('chat-input'); if (input) { input.value = message; input.focus(); } }
function sendChatPrompt(message) { const input = document.getElementById('chat-input'); if (!input) return; input.value = message; sendChat(); }
async function sendChat(event) { event?.preventDefault(); const input = document.getElementById('chat-input'); const message = input?.value.trim(); if (!message) return; state.chatMessages.push({ role: 'user', text: message }); input.value = ''; ensureChatWidget(); state.chatMessages.push({ role: 'assistant', text: 'Thinking through that...' }); ensureChatWidget(); try { const response = await api('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, history: state.chatMessages.slice(0, -1) }) }); state.chatMessages[state.chatMessages.length - 1].text = response.reply; } catch (error) { state.chatMessages[state.chatMessages.length - 1].text = 'I could not reach the study engine right now. Please try again.'; } ensureChatWidget(); }

function render() { document.getElementById('app').innerHTML = state.authenticated ? (state.view === 'dashboard' ? dashboardView() : state.view === 'progress' ? progressView() : state.view === 'setup' ? quizSetup() : state.view === 'quiz' ? quizView() : resultsView()) : loginView(); if (state.authenticated) enhance3D(); }
function go(view) { state.view = view; render(); window.scrollTo(0,0); }
function openUpload() { document.body.insertAdjacentHTML('beforeend', uploadModal()); }
function closeUpload(event) { if (!event || event.target.id === 'upload-modal' || event.target.classList.contains('modal-close')) document.getElementById('upload-modal')?.remove(); }
function startDemo() { state.material = null; state.view = 'setup'; render(); }
function formatTime(seconds) { const mins = Math.floor(seconds / 60).toString().padStart(2,'0'); const secs = Math.floor(seconds % 60).toString().padStart(2,'0'); return `${mins}:${secs}`; }
async function handleUpload(event) { const file = event.target.files[0]; if (!file) return; const status = document.getElementById('upload-status'); status.innerHTML = '<div class="processing"><span class="spinner"></span><div><strong>Reading your material...</strong><p>Extracting text and finding the important ideas.</p></div></div>'; const form = new FormData(); form.append('file', file); try { state.material = await api('/api/materials/upload', { method:'POST', body: form }); closeUpload(); state.view = 'setup'; render(); } catch (error) { status.innerHTML = `<div class="error-message">${error.message}</div>`; } }
async function createQuiz() { try { state.quiz = await api('/api/quiz/generate', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({material_id:state.material?.id || null, question_count:state.setupCount || 5, difficulty:state.setupDifficulty || 'Mixed'}) }); state.current = 0; state.answers = {}; state.marked = new Set(); state.startedAt = Date.now(); state.view = 'quiz'; render(); } catch(error) { alert(error.message); } }
function answer(index) { const q = state.quiz.questions[state.current]; if (state.answers[q.id] !== undefined) return; state.answers[q.id] = index; render(); }
function nextQuestion() { if (state.current < state.quiz.questions.length - 1) { state.current++; render(); } }
function previousQuestion() { if (state.current > 0) { state.current--; render(); } }
function toggleMark() { const id = state.quiz.questions[state.current].id; state.marked.has(id) ? state.marked.delete(id) : state.marked.add(id); render(); }
async function finishQuiz() { const time = Math.floor((Date.now()-state.startedAt)/1000); state.result = await api('/api/attempts', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({material_id:state.material?.id || null, topic:state.quiz.topic, questions:state.quiz.questions, answers:state.answers, time_taken:time}) }); state.result.answers = state.answers; await loadDashboard(); state.view = 'results'; render(); }
function toggleReview() { state.showAllReview = !state.showAllReview; render(); }

function handleLogin(event) { event.preventDefault(); state.authenticated = true; localStorage.setItem('ai-study-auth', 'true'); loadDashboard().catch(() => { state.dashboard = { user:{name:'Alex Morgan'}, stats:{}, attempts:[], materials:[] }; render(); }); }
function continueAsDemo() { state.authenticated = true; localStorage.setItem('ai-study-auth', 'true'); loadDashboard().catch(() => { state.dashboard = { user:{name:'Alex Morgan'}, stats:{}, attempts:[], materials:[] }; render(); }); }
function togglePassword(button) { const input = button.parentElement.querySelector('input'); const visible = input.type === 'text'; input.type = visible ? 'password' : 'text'; button.textContent = visible ? '◉' : '◌'; button.setAttribute('aria-label', visible ? 'Show password' : 'Hide password'); }
function showLoginMessage(message) { const status = document.getElementById('login-message'); if (status) status.textContent = message; }

if (state.authenticated) {
  loadDashboard().catch(() => { state.dashboard = { user:{name:'Alex Morgan'}, stats:{}, attempts:[], materials:[] }; render(); });
} else {
  render();
}
setInterval(() => { if (state.view === 'quiz') { const timer = document.getElementById('timer'); if (timer) timer.textContent = formatTime(Math.floor((Date.now()-state.startedAt)/1000)); } }, 1000);
