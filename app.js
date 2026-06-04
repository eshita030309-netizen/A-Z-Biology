// Simple helper to detect current page by URL
function currentPage() {
  const path = window.location.pathname;
  return path.split('/').pop() || 'index.html';
}

/* ---------- AI Tutor (UI shell) ---------- */

function initTutor() {
  const form = document.getElementById('tutor-form');
  const input = document.getElementById('tutor-input');
  const messages = document.getElementById('tutor-messages');
  const chips = document.querySelectorAll('.chip');

  if (!form || !input || !messages) return;

  function addMessage(text, role) {
    const div = document.createElement('div');
    div.classList.add('message', role);
    div.innerHTML = `<p>${text}</p>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    input.value = '';

    // Placeholder response – later you can connect to a real AI backend
    setTimeout(() => {
      addMessage(
        "This is a placeholder AI tutor response. In the future, this will give real biology explanations, quizzes, and flashcards.",
        'bot'
      );
    }, 400);
  });

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      if (!prompt) return;
      input.value = prompt;
      input.focus();
    });
  });
}

/* ---------- Tools (simple mini-sims) ---------- */

function initTools() {
  const buttons = document.querySelectorAll('.tool-card button[data-tool]');
  const panel = document.getElementById('tool-panel');
  const titleEl = document.getElementById('tool-title');
  const contentEl = document.getElementById('tool-content');
  if (!buttons.length || !panel || !titleEl || !contentEl) return;

  function showTool(name) {
    panel.classList.remove('hidden');
    contentEl.innerHTML = '';

    if (name === 'dna') {
      titleEl.textContent = 'DNA Builder';
      contentEl.innerHTML = `
        <p>Type a DNA strand (A, T, C, G) and see the complementary strand.</p>
        <input id="dna-input" placeholder="e.g. ATGCCGTA" />
        <button id="dna-generate">Build</button>
        <p id="dna-output"></p>
      `;
      const input = contentEl.querySelector('#dna-input');
      const btn = contentEl.querySelector('#dna-generate');
      const out = contentEl.querySelector('#dna-output');
      btn.addEventListener('click', () => {
        const seq = (input.value || '').toUpperCase().replace(/[^ATCG]/g, '');
        const compMap = { A: 'T', T: 'A', C: 'G', G: 'C' };
        const comp = seq
          .split('')
          .map((b) => compMap[b] || '?')
          .join('');
        out.textContent = seq
          ? `Complementary strand: ${comp}`
          : 'Please enter a valid DNA sequence.';
      });
    } else if (name === 'protein') {
      titleEl.textContent = 'Protein Synthesis (simplified)';
      contentEl.innerHTML = `
        <p>Type a DNA coding strand and see the mRNA (complementary) strand.</p>
        <input id="prot-input" placeholder="e.g. ATG GAA TTT" />
        <button id="prot-generate">Transcribe</button>
        <p id="prot-output"></p>
      `;
      const input = contentEl.querySelector('#prot-input');
      const btn = contentEl.querySelector('#prot-generate');
      const out = contentEl.querySelector('#prot-output');
      btn.addEventListener('click', () => {
        const seq = (input.value || '').toUpperCase().replace(/[^ATCG]/g, '');
        const map = { A: 'U', T: 'A', C: 'G', G: 'C' };
        const mrna = seq
          .split('')
          .map((b) => map[b] || '?')
          .join('');
        out.textContent = seq
          ? `mRNA (complementary): ${mrna}`
          : 'Please enter a valid DNA sequence.';
      });
    } else if (name === 'punnett') {
      titleEl.textContent = 'Punnett Square Lab (monohybrid)';
      contentEl.innerHTML = `
        <p>Enter two parent genotypes (e.g. Aa and Aa).</p>
        <input id="p1" placeholder="Parent 1 (e.g. Aa)" />
        <input id="p2" placeholder="Parent 2 (e.g. Aa)" />
        <button id="punnett-run">Calculate</button>
        <p id="punnett-output"></p>
      `;
      const p1 = contentEl.querySelector('#p1');
      const p2 = contentEl.querySelector('#p2');
      const btn = contentEl.querySelector('#punnett-run');
      const out = contentEl.querySelector('#punnett-output');
      btn.addEventListener('click', () => {
        const g1 = (p1.value || '').trim();
        const g2 = (p2.value || '').trim();
        if (g1.length !== 2 || g2.length !== 2) {
          out.textContent = 'Please enter two‑letter genotypes like Aa, AA, or aa.';
          return;
        }
        const combos = [
          g1[0] + g2[0],
          g1[0] + g2[1],
          g1[1] + g2[0],
          g1[1] + g2[1],
        ].map((g) => g[0] + g[1]);
        const counts = {};
        combos.forEach((g) => {
          const sorted = g[0].toUpperCase() + g[1].toLowerCase();
          counts[sorted] = (counts[sorted] || 0) + 1;
        });
        const total = combos.length;
        const parts = Object.entries(counts).map(
          ([geno, c]) => `${geno}: ${c}/${total}`
        );
        out.textContent = `Offspring genotypes: ${parts.join(', ')}`;
      });
    } else if (name === 'hw') {
      titleEl.textContent = 'Hardy–Weinberg Calculator';
      contentEl.innerHTML = `
        <p>Enter allele frequency p (0–1). q will be 1 − p.</p>
        <input id="hw-p" placeholder="p (e.g. 0.6)" />
        <button id="hw-run">Calculate</button>
        <p id="hw-output"></p>
      `;
      const pInput = contentEl.querySelector('#hw-p');
      const btn = contentEl.querySelector('#hw-run');
      const out = contentEl.querySelector('#hw-output');
      btn.addEventListener('click', () => {
        const p = parseFloat(pInput.value);
        if (isNaN(p) || p < 0 || p > 1) {
          out.textContent = 'Please enter a valid p between 0 and 1.';
          return;
        }
        const q = 1 - p;
        const p2 = (p * p).toFixed(2);
        const q2 = (q * q).toFixed(2);
        const twopq = (2 * p * q).toFixed(2);
        out.textContent = `p² (homozygous dominant): ${p2}, 2pq (heterozygous): ${twopq}, q² (homozygous recessive): ${q2}`;
      });
    }
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tool = btn.getAttribute('data-tool');
      showTool(tool);
    });
  });
}

/* ---------- Practice (questions from JSON) ---------- */

async function loadQuestions() {
  try {
    const res = await fetch('data/questions.json');
    return await res.json();
  } catch (e) {
    console.error('Error loading questions:', e);
    return [];
  }
}

async function initPractice() {
  const topicSel = document.getElementById('practice-topic');
  const diffSel = document.getElementById('practice-difficulty');
  const genBtn = document.getElementById('practice-generate');
  const card = document.getElementById('practice-card');
  const qText = document.getElementById('practice-question');
  const qOptions = document.getElementById('practice-options');
  const revealBtn = document.getElementById('practice-reveal');
  const explEl = document.getElementById('practice-explanation');

  if (!genBtn || !card) return;

  const questions = await loadQuestions();

  function pickQuestion() {
    const topic = topicSel ? topicSel.value : 'all';
    const diff = diffSel ? diffSel.value : 'all';
    let pool = questions;
    if (topic !== 'all') pool = pool.filter((q) => q.topic === topic);
    if (diff !== 'all') pool = pool.filter((q) => q.difficulty === diff);
    if (!pool.length) return null;
    const idx = Math.floor(Math.random() * pool.length);
    return pool[idx];
  }

  genBtn.addEventListener('click', () => {
    const q = pickQuestion();
    if (!q) {
      qText.textContent = 'No questions match this filter yet.';
      qOptions.innerHTML = '';
      card.classList.remove('hidden');
      revealBtn.classList.add('hidden');
      explEl.classList.add('hidden');
      return;
    }

    qText.textContent = q.question;
    qOptions.innerHTML = '';
    q.options.forEach((opt, i) => {
      const li = document.createElement('li');
      li.textContent = opt;
      li.classList.add('quiz-option');
      li.addEventListener('click', () => {
        document
          .querySelectorAll('.quiz-option')
          .forEach((o) => o.classList.remove('selected'));
        li.classList.add('selected');
      });
      qOptions.appendChild(li);
    });

    explEl.textContent = `Answer: ${q.options[q.answerIndex]} — ${q.explanation}`;
    card.classList.remove('hidden');
    revealBtn.classList.remove('hidden');
    explEl.classList.add('hidden');

    revealBtn.onclick = () => {
      explEl.classList.remove('hidden');
      // simple local tracking for dashboard
      const count = parseInt(localStorage.getItem('bm_questions') || '0', 10) + 1;
      localStorage.setItem('bm_questions', String(count));
      updateDashboardFromStorage();
    };
  });
}

/* ---------- Dashboard (local storage) ---------- */

function updateDashboardFromStorage() {
  const qEl = document.getElementById('dash-questions');
  const strongEl = document.getElementById('dash-strong');
  const weakEl = document.getElementById('dash-weak');
  const streakEl = document.getElementById('dash-streak');

  const questions = parseInt(localStorage.getItem('bm_questions') || '0', 10);
  if (qEl) qEl.textContent = String(questions);

  // Very simple placeholders
  if (strongEl) strongEl.textContent = questions >= 5 ? 'Foundations topics' : '–';
  if (weakEl) weakEl.textContent = questions >= 5 ? 'Advanced topics' : '–';

  // Fake streak: if you open the site on a new day, increment
  const today = new Date().toISOString().slice(0, 10);
  const lastDay = localStorage.getItem('bm_last_day');
  let streak = parseInt(localStorage.getItem('bm_streak') || '0', 10);
  if (lastDay !== today) {
    streak += 1;
    localStorage.setItem('bm_streak', String(streak));
    localStorage.setItem('bm_last_day', today);
  }
  if (streakEl) streakEl.textContent = `${streak} day${streak === 1 ? '' : 's'}`;
}

/* ---------- Init ---------- */

document.addEventListener('DOMContentLoaded', () => {
  const page = currentPage();
  if (page === 'tutor.html') initTutor();
  if (page === 'tools.html') initTools();
  if (page === 'practice.html') initPractice();
  if (page === 'dashboard.html') updateDashboardFromStorage();
});
