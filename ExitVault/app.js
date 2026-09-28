const views = [...document.querySelectorAll('.view')];
const nav = [...document.querySelectorAll('.nav-item')];
const title = document.getElementById('page-title');
const titles = { overview: 'Good morning, Nisha', interview: 'Exit interview', vault: 'Knowledge vault', verify: 'Verification center', ask: 'Ask ExitVault' };

const toast = document.getElementById('toast');
const interviewInput = document.getElementById('interview-input');
const askInput = document.getElementById('ask-input');
const interviewChat = document.getElementById('chat-body');
const askMessages = document.getElementById('ask-messages');

const interviewState = { turn: 1, total: 18 };

const interviewQuestions = [
  'What was the single most important work item someone else will need to pick up after your departure?',
  'Which customer, vendor, or process issue created the most friction during your last quarter?',
  'What project milestone or launch window should the next owner watch closely?',
  'What recurring handoff detail was easy to miss but critical for continuity?',
  'Which approvals, escalations, or exceptions almost always required extra follow-up?',
  'What customer preference or internal habit kept the work moving smoothly?',
  'Which workarounds were being used because the normal process was unclear or inconsistent?',
  'What external contact or vendor relationship should the next owner maintain proactively?',
  'What information was most often missing during a transition or escalation?',
  'Which issue was known to the team but never fully documented in the system?',
  'What pattern of delays or blockers should the next owner treat as a risk signal?',
  'Which decision or compromise was making work harder than it needed to be?',
  'When did a customer or stakeholder start to get frustrated, and what was the context?',
  'Which process or workflow do you wish the company had standardized earlier?',
  'What is the one thing you would tell a new hire to watch for in the first 90 days?',
  'Which operational record, note, or artifact is most important for continuity?',
  'What should the next owner be prepared to explain if something goes wrong?',
  'What should we stop doing, start doing, or double-check before the next handoff?'
];

const hindsightMemory = {
  employee: {
    name: 'Priya Sharma',
    role: 'Senior Account Manager',
    company: 'NovaTech Solutions'
  },
  claims: [
    {
      id: 'vertex-delay',
      entity: 'Vertex Logistics',
      type: 'vendor',
      status: 'partial',
      confidence: 'Medium',
      summary: 'Vertex Logistics frequently delays deliveries, especially around product launches.',
      evidence: {
        total: 20,
        delayed: 3,
        onTime: 17,
        source: 'Vendor delivery records'
      },
      tags: ['Vendor', 'Employee knowledge'],
      source: 'Priya Sharma',
      note: 'Partially supported by historical records but not a confirmed operational rule.'
    },
    {
      id: 'acme-window',
      entity: 'Acme Corp',
      type: 'deployment',
      status: 'verified',
      confidence: 'High',
      summary: 'Acme prefers Tuesday deployment windows and requires 48-hour security notice.',
      evidence: {
        total: 4,
        delayed: 0,
        onTime: 4,
        source: 'Customer success records'
      },
      tags: ['Customer', 'Process'],
      source: 'Company records',
      note: 'Verified across customer notes, release docs, and security approvals.'
    },
    {
      id: 'approval-workflow',
      entity: 'Enterprise approval workflow',
      type: 'approval',
      status: 'conflict',
      confidence: 'Medium',
      summary: 'Approval routing differs by customer and order scale, with manual signoff required for enterprise deals.',
      evidence: {
        total: 6,
        delayed: 2,
        onTime: 4,
        source: 'Procurement and stakeholder notes'
      },
      tags: ['Process', 'Decision'],
      source: 'Employee interviews',
      note: 'Two sources agree there is a path, but the routing differs by deal type.'
    },
    {
      id: 'hindsight-trust',
      entity: 'Hindsight memory model',
      type: 'memory',
      status: 'verified',
      confidence: 'High',
      summary: 'Hindsight stores source-linked facts and keeps confidence attached to every claim.',
      evidence: {
        total: 12,
        delayed: 0,
        onTime: 12,
        source: 'Memory schema and evidence ledger'
      },
      tags: ['Memory', 'Evidence'],
      source: 'System model',
      note: 'Prevents bad assumptions from being treated as company truth.'
    }
  ]
};

function computeMemoryStats() {
  const claims = hindsightMemory.claims;
  const verified = claims.filter(item => item.status === 'verified').length;
  const partial = claims.filter(item => item.status === 'partial').length;
  const conflicts = claims.filter(item => item.status === 'conflict').length;
  const total = claims.length;
  const verifiedPct = Math.round((verified / total) * 100);

  return {
    total,
    verified,
    partial,
    conflicts,
    verifiedPct,
    activeTransitions: 12
  };
}

function getStatusConfig(status) {
  return {
    verified: { icon: '✓', className: 'verified' },
    partial: { icon: '◒', className: 'partial' },
    conflict: { icon: '↯', className: 'conflict' }
  }[status] || { icon: '◒', className: 'partial' };
}

function renderOverviewMetrics() {
  const stats = computeMemoryStats();
  const metricNumbers = document.querySelectorAll('.metric strong');
  const metricEm = document.querySelectorAll('.metric em');

  if (metricNumbers[0]) metricNumbers[0].textContent = stats.total;
  if (metricNumbers[1]) metricNumbers[1].textContent = `${stats.verifiedPct}%`;
  if (metricNumbers[2]) metricNumbers[2].textContent = String(stats.conflicts).padStart(2, '0');
  if (metricNumbers[3]) metricNumbers[3].textContent = stats.activeTransitions;

  if (metricEm[0]) metricEm[0].textContent = '+18 this month';
  if (metricEm[1]) metricEm[1].textContent = '+4.2% from last cycle';
  if (metricEm[2]) metricEm[2].textContent = 'Needs review';
  if (metricEm[3]) metricEm[3].textContent = '2 this week';

  const transitionBlocks = document.querySelectorAll('.transition-stats b');
  if (transitionBlocks[0]) transitionBlocks[0].textContent = stats.total;
  if (transitionBlocks[1]) transitionBlocks[1].textContent = stats.verified;

  const insightList = document.getElementById('insight-list');
  if (insightList) {
    const topClaims = hindsightMemory.claims.slice(0, 3);
    insightList.innerHTML = topClaims.map((claim) => {
      const status = getStatusConfig(claim.status);
      return `
        <article>
          <span class="status ${status.className}">${status.icon}</span>
          <div>
            <strong>${claim.entity}</strong>
            <p>${claim.summary}</p>
          </div>
          <time>${claim.confidence} confidence</time>
        </article>
      `;
    }).join('');
  }
}

function renderVerificationCenter() {
  const claim = hindsightMemory.claims.find(item => item.entity === 'Vertex Logistics') || hindsightMemory.claims[0];
  const quoteEl = document.getElementById('verification-quote');
  const statusEl = document.getElementById('verification-status');
  const summaryEl = document.getElementById('verification-summary');
  const confidenceEl = document.getElementById('verification-confidence');

  if (quoteEl) quoteEl.textContent = `“${claim.summary}”`;

  if (statusEl) {
    const status = getStatusConfig(claim.status);
    statusEl.textContent = claim.status === 'partial' ? 'Partially supported' : claim.status === 'verified' ? 'Verified' : 'Conflict detected';
    statusEl.className = `status ${status.className}`;
  }

  if (summaryEl) {
    summaryEl.textContent = `Historical records show ${claim.evidence.delayed} delayed deliveries out of ${claim.evidence.total}. This is enough to flag the issue, but not enough to treat it as a guaranteed pattern.`;
  }

  if (confidenceEl) {
    confidenceEl.textContent = `${claim.confidence} confidence`;
  }
}

function renderVault() {
  const vault = document.getElementById('vault-items');
  if (!vault) return;

  vault.innerHTML = hindsightMemory.claims.map((claim) => {
    const status = getStatusConfig(claim.status);
    return `
      <article class="vault-item" data-status="${claim.status}">
        <span class="status ${status.className}">${status.icon}</span>
        <div>
          <div class="item-tags">
            ${claim.tags.map(tag => `<i>${tag}</i>`).join('')}
          </div>
          <h3>${claim.entity}</h3>
          <p>${claim.note}</p>
          <footer>${claim.source} · ${claim.evidence.source} <span>${claim.confidence} confidence</span></footer>
        </div>
        <button>→</button>
      </article>
    `;
  }).join('');

  const filterButtons = document.querySelectorAll('.filter');
  filterButtons.forEach(button => {
    const label = button.textContent.trim().split(' ')[0].toLowerCase();
    if (label === 'all') button.innerHTML = `All knowledge <b>${hindsightMemory.claims.length}</b>`;
    if (label === 'verified') button.innerHTML = `Verified <b>${hindsightMemory.claims.filter(item => item.status === 'verified').length}</b>`;
    if (label === 'employee-reported') button.innerHTML = `Employee-reported <b>${hindsightMemory.claims.filter(item => item.status === 'partial').length}</b>`;
    if (label === 'conflicts') button.innerHTML = `Conflicts <b>${hindsightMemory.claims.filter(item => item.status === 'conflict').length}</b>`;
  });
}

function classifyIntent(text) {
  const lower = text.toLowerCase();
  let score = { approval: 0, deployment: 0, vendor: 0, memory: 0, general: 0 };

  if (/(approval|workflow|procurement|signoff|stakeholder|review|manual approval)/.test(lower)) score.approval += 4;
  if (/(acme|deployment|tuesday|security|48-hour|launch|release)/.test(lower)) score.deployment += 4;
  if (/(vertex|vendor|delivery|delay|logistics|shipment)/.test(lower)) score.vendor += 4;
  if (/(memory|source|evidence|hindsight|confidence|verified|knowledge)/.test(lower)) score.memory += 4;
  if (/(handoff|replace|transition|replacement|owner)/.test(lower)) score.general += 2;

  if (score.approval >= score.deployment && score.approval >= score.vendor && score.approval >= score.memory) return 'approval';
  if (score.deployment >= score.vendor && score.deployment >= score.memory) return 'deployment';
  if (score.vendor >= score.memory) return 'vendor';
  if (score.memory > 0) return 'memory';
  return 'general';
}

function getRelevantClaims(query) {
  const intent = classifyIntent(query);
  const matches = hindsightMemory.claims.filter(claim => {
    if (intent === 'general') return true;
    return claim.type === intent || claim.entity.toLowerCase().includes(query.toLowerCase()) || claim.summary.toLowerCase().includes(query.toLowerCase());
  });

  return matches.length ? matches.slice(0, 2) : [hindsightMemory.claims[0]];
}

function buildInterviewReply(inputText) {
  const text = inputText.toLowerCase();
  const intent = classifyIntent(inputText);
  const vendorClaim = hindsightMemory.claims.find(item => item.type === 'vendor');
  const deploymentClaim = hindsightMemory.claims.find(item => item.type === 'deployment');
  const approvalClaim = hindsightMemory.claims.find(item => item.type === 'approval');

  if (/dont remember|don.t remember|skip|no idea|not sure|not remember/i.test(text)) {
    return 'No problem. I’ll mark that as unknown for now and keep it separate from verified company knowledge until we can confirm it against records or follow-up notes.';
  }

  if (intent === 'vendor' && vendorClaim) {
    return 'Okay — I’ll keep that in the vendor record and move to the next question.';
  }

  if (intent === 'deployment' && deploymentClaim) {
    return 'Got it — that looks like a verified deployment pattern, so let’s keep moving.';
  }

  if (intent === 'approval' && approvalClaim) {
    return 'Okay — that approval path looks mixed, so we’ll note it and move to the next question.';
  }

  if (intent === 'memory') {
    return 'Nice — that’s the kind of context Hindsight should preserve.';
  }

  if (/(handoff|replace|transition|replacement|owner|handover|continuity|next owner)/i.test(text)) {
    return 'Good note — we’ll keep that for continuity and move on.';
  }

  const generalTopics = [
    'Okay, let’s move to the next question.',
    'Noted — I’ll keep that in the record.',
    'Got it — we’ll capture that and keep moving.',
    'Thanks, I’ve noted it and we can continue.'
  ];

  const fallback = generalTopics[Math.abs(text.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)) % generalTopics.length];
  return fallback;
}

function updateInterviewCounter() {
  const counter = document.getElementById('question-number');
  if (!counter) return;
  const visibleTurn = Math.min(interviewState.turn, interviewState.total);
  counter.textContent = visibleTurn;
}

function syncInterviewPrompt() {
  const counter = document.getElementById('question-number');
  if (counter) {
    counter.textContent = Math.min(interviewState.turn, interviewState.total);
  }

  const chatBody = document.getElementById('chat-body');
  if (!chatBody || chatBody.dataset.initialized === 'true') return;

  const firstAiMessage = chatBody.querySelector('.message.ai .message-text');
  if (firstAiMessage) {
    firstAiMessage.textContent = interviewQuestions[0];
  }
  chatBody.dataset.initialized = 'true';
}

function addChatBubble({ box, kind, text }) {
  const bubble = document.createElement('div');
  bubble.className = `message ${kind}`;

  if (kind === 'employee') {
    const wrapper = document.createElement('div');
    const label = document.createElement('span');
    label.className = 'message-label user-label';
    label.textContent = 'Priya';
    const content = document.createElement('div');
    content.className = 'message-text';
    content.textContent = text;
    wrapper.appendChild(label);
    wrapper.appendChild(content);
    const avatar = document.createElement('span');
    avatar.className = 'avatar tiny';
    avatar.textContent = 'PS';
    bubble.appendChild(wrapper);
    bubble.appendChild(avatar);
  } else {
    const mark = document.createElement('span');
    mark.className = 'message-mark';
    mark.textContent = '✦';
    const inner = document.createElement('div');
    const label = document.createElement('span');
    label.className = 'message-label';
    label.textContent = 'ExitVault';
    const content = document.createElement('div');
    content.className = 'message-text';
    content.textContent = text;
    inner.appendChild(label);
    inner.appendChild(content);
    bubble.appendChild(mark);
    bubble.appendChild(inner);
  }

  box.appendChild(bubble);
  box.scrollTop = box.scrollHeight;
}

async function saveInterviewEntry(question, answer) {
  try {
    await fetch('/api/interview/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        answer,
        user_name: 'Priya'
      })
    });
  } catch (error) {
    console.warn('Interview memory save failed', error);
  }
}

function sendInterviewMessage() {
  const text = interviewInput.value.trim();
  if (!text) return;

  addChatBubble({ box: interviewChat, kind: 'employee', text });
  interviewInput.value = '';

  setTimeout(async () => {
    const reply = buildInterviewReply(text);
    addChatBubble({ box: interviewChat, kind: 'ai', text: reply });

    await saveInterviewEntry(interviewQuestions[Math.max(interviewState.turn - 1, 0)] || 'Exit interview capture', text);

    if (interviewState.turn < interviewState.total) {
      interviewState.turn += 1;
      updateInterviewCounter();
      setTimeout(() => {
        const nextQuestion = interviewQuestions[Math.min(interviewState.turn - 1, interviewQuestions.length - 1)];
        addChatBubble({ box: interviewChat, kind: 'ai', text: nextQuestion });
      }, 400);
    } else {
      interviewState.turn = interviewState.total;
      updateInterviewCounter();
      setTimeout(() => {
        addChatBubble({
          box: interviewChat,
          kind: 'ai',
          text: 'This interview is complete. I’ve captured the operational context and tied it to the company evidence records so it can be reviewed before handoff.'
        });
      }, 400);
    }
  }, 350);
}

function buildAskAnswer(query) {
  const relevant = getRelevantClaims(query);
  const primary = relevant[0];
  const status = getStatusConfig(primary.status);

  const cardBody = primary.status === 'verified'
    ? `${primary.entity} is backed by company records and recent operational notes.`
    : primary.status === 'partial'
      ? `Historical records show ${primary.evidence.delayed} delayed events out of ${primary.evidence.total}. This is a useful signal, but not a confirmed pattern.`
      : `The company sees conflicting signals here, so the answer should be treated as context to confirm before action.`;

  const lead = primary.type === 'memory'
    ? 'ExitVault keeps the context traceable:'
    : `Here is the evidence-aware context I found for ${primary.entity}:`;

  return {
    lead,
    status: { icon: status.icon, className: status.className, label: primary.status },
    title: primary.entity,
    body: cardBody,
    detail: primary.note,
    confidence: `${primary.confidence} confidence · ${primary.evidence.source}`
  };
}

async function sendAskMessage() {
  const text = askInput.value.trim();
  if (!text) return;

  const box = askMessages;
  const question = document.createElement('div');
  question.className = 'question';
  const avatar = document.createElement('div');
  avatar.className = 'avatar tiny blue-avatar';
  avatar.textContent = 'AM';
  const body = document.createElement('div');
  body.textContent = text;
  question.appendChild(avatar);
  question.appendChild(body);
  box.appendChild(question);
  askInput.value = '';
  box.scrollTop = box.scrollHeight;

  try {
    const response = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: text, user_name: 'AM' })
    });

    if (!response.ok) {
      throw new Error('Unable to fetch answer');
    }

    const payload = await response.json();
    const answer = document.createElement('div');
    answer.className = 'answer';
    const mark = document.createElement('span');
    mark.className = 'message-mark';
    mark.textContent = '✦';

    const content = document.createElement('div');
    const claim = payload.claims?.[0] || null;
    const status = claim ? getStatusConfig(claim.status) : { icon: '◒', className: 'partial' };
    const bodyText = claim
      ? `${claim.summary} Evidence: ${claim.evidence.delayed}/${claim.evidence.total} delayed records.`
      : payload.answer;

    content.innerHTML = `
      <span class="message-label">ExitVault</span>
      <p>Here is the evidence-aware context I found for you:</p>
      <div class="answer-card ${status.className === 'verified' ? 'verified-answer' : ''}">
        <span class="status ${status.className}">${status.icon}</span>
        <div>
          <b>${claim ? claim.entity : 'Evidence-backed answer'}</b>
          <p>${bodyText}</p>
          <small>${claim ? `${claim.confidence} confidence · ${claim.evidence.source}` : 'Memory-backed answer'}</small>
        </div>
      </div>
      <p class="answer-end">${payload.answer}</p>
    `;

    answer.appendChild(mark);
    answer.appendChild(content);
    box.appendChild(answer);
    box.scrollTop = box.scrollHeight;
  } catch (error) {
    const fallback = buildAskAnswer(text);
    const answer = document.createElement('div');
    answer.className = 'answer';
    const mark = document.createElement('span');
    mark.className = 'message-mark';
    mark.textContent = '✦';
    const content = document.createElement('div');
    content.innerHTML = `
      <span class="message-label">ExitVault</span>
      <p>${fallback.lead}</p>
      <div class="answer-card ${fallback.status.className === 'verified' ? 'verified-answer' : ''}">
        <span class="status ${fallback.status.className}">${fallback.status.icon}</span>
        <div>
          <b>${fallback.title}</b>
          <p>${fallback.body}</p>
          <small>${fallback.confidence}</small>
        </div>
      </div>
      <p class="answer-end">${fallback.detail}</p>
    `;
    answer.appendChild(mark);
    answer.appendChild(content);
    box.appendChild(answer);
    box.scrollTop = box.scrollHeight;
  }
}

function setupFilterButtons() {
  document.querySelectorAll('.filter').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.filter').forEach(item => item.classList.toggle('active', item === button));
      const term = button.textContent.trim().split(' ')[0].toLowerCase();
      const items = document.querySelectorAll('.vault-item');

      items.forEach(item => {
        const status = item.dataset.status;
        const match = term === 'all' || status === term || (term === 'employee-reported' && status === 'partial');
        item.style.display = match ? 'flex' : 'none';
      });
    });
  });
}

function bindEvents() {
  nav.forEach(n => n.addEventListener('click', () => openView(n.dataset.view)));
  document.querySelectorAll('[data-view-jump]').forEach(button => {
    button.addEventListener('click', () => openView(button.dataset.viewJump));
  });

  document.querySelectorAll('[data-action="start"]').forEach(button => {
    button.addEventListener('click', () => openView('interview'));
  });

  document.querySelectorAll('[data-action="store"]').forEach(button => {
    button.addEventListener('click', () => {
      openView('verify');
      showToast('Knowledge stored in Hindsight', 'Linked to Priya, Vertex Logistics, and evidence.');
    });
  });

  document.querySelectorAll('[data-action="show-conflict"]').forEach(button => {
    button.addEventListener('click', () => {
      const panel = document.getElementById('conflict-center');
      if (panel) panel.classList.toggle('show');
    });
  });

  document.querySelectorAll('[data-action="refuse"]').forEach(button => {
    button.addEventListener('click', () => {
      interviewInput.value = 'I don’t remember the details.';
      sendInterviewMessage();
    });
  });

  document.querySelectorAll('[data-suggestion]').forEach(button => {
    button.addEventListener('click', () => {
      interviewInput.value = button.dataset.suggestion;
      sendInterviewMessage();
    });
  });

  document.getElementById('send-interview').addEventListener('click', sendInterviewMessage);
  interviewInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendInterviewMessage();
    }
  });

  document.getElementById('send-ask').addEventListener('click', sendAskMessage);
  askInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendAskMessage();
    }
  });

  const vaultSearch = document.getElementById('vault-search');
  if (vaultSearch) {
    vaultSearch.addEventListener('input', event => {
      const query = event.target.value.toLowerCase();
      document.querySelectorAll('.vault-item').forEach(item => {
        const matches = item.textContent.toLowerCase().includes(query);
        item.style.display = matches ? 'flex' : 'none';
      });
    });
  }

  const bellButton = document.querySelector('.icon-btn.bell');
  if (bellButton) {
    bellButton.addEventListener('click', () => showToast('Update ready', '3 knowledge items need review before handoff.'));
  }

  const helpButton = document.querySelector('.help-btn');
  if (helpButton) {
    helpButton.addEventListener('click', () => {
      openView('ask');
      askInput.value = 'How do I verify whether Vertex delays are a pattern or just an outlier?';
      setTimeout(() => sendAskMessage(), 150);
    });
  }

  const promptButtons = document.querySelectorAll('.suggestions button:not([data-action="refuse"])');
  promptButtons.forEach(button => {
    button.dataset.suggestion = button.textContent.trim();
  });
}

function openView(id) {
  views.forEach(v => v.classList.toggle('active-view', v.id === id));
  nav.forEach(n => n.classList.toggle('active', n.dataset.view === id));
  title.textContent = titles[id];
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showToast(titleText, bodyText) {
  const titleEl = toast.querySelector('b');
  const bodyEl = toast.querySelector('p');
  titleEl.textContent = titleText;
  bodyEl.textContent = bodyText;
  toast.classList.add('show');
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => toast.classList.remove('show'), 3200);
}

async function hydrateDashboard() {
  try {
    const response = await fetch('/api/memory/stats');
    if (!response.ok) return;
    const payload = await response.json();
    const stats = payload.stats || {};
    const metricNumbers = document.querySelectorAll('.metric strong');
    if (metricNumbers[0]) metricNumbers[0].textContent = stats.total ?? 0;
    if (metricNumbers[1]) metricNumbers[1].textContent = `${stats.verified_pct ?? 0}%`;
    if (metricNumbers[2]) metricNumbers[2].textContent = String(stats.conflicts ?? 0).padStart(2, '0');
    if (metricNumbers[3]) metricNumbers[3].textContent = stats.active_transitions ?? 0;

    const transitionBlocks = document.querySelectorAll('.transition-stats b');
    if (transitionBlocks[0]) transitionBlocks[0].textContent = stats.total ?? 0;
    if (transitionBlocks[1]) transitionBlocks[1].textContent = stats.verified ?? 0;
  } catch (error) {
    console.warn('Memory dashboard sync unavailable', error);
  }
}

syncInterviewPrompt();
renderOverviewMetrics();
renderVerificationCenter();
renderVault();
setupFilterButtons();
bindEvents();
hydrateDashboard();
showToast('Hindsight active', 'The memory core is now synchronizing with evidence.');

