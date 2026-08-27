// ---------- Problem data ----------
  const PROBLEMS = {
    signal: {
      title: "No Signal / Dropped Calls",
      symptoms: "Bars show but calls fail, service only works near windows, or it drops entirely once you're indoors.",
      fixes: [
        "Toggle airplane mode on, wait ten seconds, then turn it back off.",
        "Check your carrier's outage map for your area before assuming it's the phone.",
        "Remove and reseat the SIM card — a loose tray causes this more often than people expect.",
        "Reset network settings if the problem only started recently."
      ],
      escalation: "Still dropping calls after these steps? Ask for a signal specialist when you call — this usually points to a tower or account issue, not the handset."
    },
    screen: {
      title: "Cracked or Unresponsive Screen",
      symptoms: "Visible cracks, dead zones that don't register touch, or flickering that comes and goes.",
      fixes: [
        "Power off and back on to rule out a software freeze before assuming it's the glass.",
        "Check under any case for shattered glass pressing against the display.",
        "Avoid pressing on dark or discolored spots — that's usually where the digitizer is already failing."
      ],
      escalation: "Cracked glass needs a repair tech, not troubleshooting over the phone — we'll route you straight to a same-day repair slot."
    },
    charge: {
      title: "Won't Charge or Dies Fast",
      symptoms: "Plugged in with no battery icon, charges to 80% and drops fast, or gets hot while charging.",
      fixes: [
        "Try a different cable and wall adapter, not just a different outlet — cables fail more than outlets do.",
        "Clean the charging port with a dry, soft brush; lint blocks the pins more often than you'd think.",
        "Check battery health in settings — anything under 80% explains fast drain on its own."
      ],
      escalation: "Battery health under 80%? An operator can check whether it's still covered under warranty before you pay for anything."
    },
    billing: {
      title: "Billing or Account Issue",
      symptoms: "Charged twice in one cycle, your plan changed without you asking, or a promo credit is missing.",
      fixes: [
        "Screenshot the charge before you call — it speeds up any dispute significantly.",
        "Check if another line on your plan authorized the change without telling you.",
        "Compare the charge date to your billing cycle start — some charges are prorated and look wrong but aren't."
      ],
      escalation: "Disputes over $50 need a live agent rather than the automated line — say that up front and you'll skip straight to one."
    },
    slow: {
      title: "Frozen or Running Slow",
      symptoms: "Apps take seconds to open, the keyboard lags behind your typing, or the phone gets hot doing nothing.",
      fixes: [
        "Restart it — an actual restart, not just locking and unlocking the screen.",
        "Check available storage; under 10% free space slows almost everything down.",
        "Force-close, not just switch away from, whatever app you use most heavily."
      ],
      escalation: "Still crawling after a real restart? That points to a hardware issue, and we'll get you booked in for a diagnostic."
    },
    lost: {
      title: "Lost or Stolen Phone",
      symptoms: "Can't locate it, missing since a specific place or time, or you're worried about someone accessing your data.",
      fixes: [
        "Use Find My Phone / Find My Device from another device immediately, before doing anything else.",
        "Lock it remotely and put a contact message on the lock screen in case someone honest finds it.",
        "Change your email and banking passwords first — that matters more right now than the phone itself."
      ],
      escalation: "If it's stolen, stay on the line — we'll suspend service on that number while you file a police report."
    }
  };

  // ---------- Switchboard interaction ----------
  const jacksEl = document.getElementById('jacks');
  const svg = document.getElementById('cablesSvg');
  const socket = document.getElementById('exchangeSocket');
  const detail = document.getElementById('detail');
  const boardEl = document.getElementById('switchboard');
  let activeKey = null;

  function renderDetail(key) {
    const p = PROBLEMS[key];
    detail.innerHTML = `
      <div class="sub mono">FIX SHEET — LINE CONNECTED</div>
      <h3>${p.title}</h3>
      <p class="symptoms">${p.symptoms}</p>
      <ul class="fix-list">
        ${p.fixes.map(f => `<li>${f}</li>`).join('')}
      </ul>
      <div class="escalate">${p.escalation}</div>
    `;
  }

  function drawCable(jackEl) {
    svg.innerHTML = '';
    const boardRect = boardEl.getBoundingClientRect();
    const jackRect = jackEl.getBoundingClientRect();
    const sockRect = socket.getBoundingClientRect();

    const x1 = jackRect.left + jackRect.width / 2 - boardRect.left;
    const y1 = jackRect.top + jackRect.height - boardRect.top - 6;
    const x2 = sockRect.left + sockRect.width / 2 - boardRect.left;
    const y2 = sockRect.top + sockRect.height / 2 - boardRect.top;
    const midY = (y1 + y2) / 2 + 30;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const d = `M ${x1} ${y1} Q ${x1} ${midY}, ${(x1 + x2) / 2} ${(y1 + midY) / 2 + 20} T ${x2} ${y2}`;
    path.setAttribute('d', d);
    const len = 600;
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    path.style.transition = 'stroke-dashoffset .45s ease';
    svg.appendChild(path);
    requestAnimationFrame(() => { path.style.strokeDashoffset = 0; });
  }

  function selectJack(key) {
    activeKey = key;
    [...jacksEl.children].forEach(j => j.classList.toggle('active', j.dataset.key === key));
    socket.classList.add('lit');
    renderDetail(key);
    const jackEl = jacksEl.querySelector(`[data-key="${key}"]`);
    drawCable(jackEl);
  }

  jacksEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.jack');
    if (!btn) return;
    selectJack(btn.dataset.key);
  });

  window.addEventListener('resize', () => {
    if (activeKey) {
      const jackEl = jacksEl.querySelector(`[data-key="${activeKey}"]`);
      drawCable(jackEl);
    }
  });

  // ---------- FAQ accordion ----------
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-q').addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  // ---------- Open / closed status ----------
  function updateStatus() {
    const now = new Date();
    const day = now.getDay(); // 0 Sun .. 6 Sat
    const hour = now.getHours();
    let open;
    if (day === 0) { open = hour >= 9 && hour < 21; }
    else { open = hour >= 7 && hour < 23; }
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');
    dot.classList.toggle('open', open);
    dot.classList.toggle('closed', !open);
    text.textContent = open ? 'Operators are on the line now' : 'Lines reopen at 7am';
  }
  updateStatus();