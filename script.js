/**
 * script.js
 * Minimalist Retro-Tech Portfolio — GitHub Pages static version
 *
 * Features:
 *   1. Terminal typing animation  (hero section)
 *   2. Mobile hamburger menu toggle
 *   3. Scroll-reveal for sections and cards
 *   4. Active nav-link highlight on scroll
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ANIMATION SPEED SETTINGS
 * Adjust the values in the ANIM object below to change how fast the
 * terminal types. All values are in milliseconds (ms).
 *
 *   charSpeed    – Base delay per character when typing a command.
 *                  Lower = faster. Range: 10–150. Default: 40.
 *   charJitter   – Random extra delay added per character (human feel).
 *                  Set to 0 to disable. Range: 0–80. Default: 40.
 *   outputSpeed  – Base delay per character in output lines. Default: 28.
 *   outputJitter – Random jitter for output characters. Default: 30.
 *   linePause    – Pause between output lines. Default: 65.
 *   cmdPause     – Pause after a command finishes, before output. Default: 380.
 *   initDelay    – Delay before the very first keystroke. Default: 600.
 *
 * Preset examples:
 *   Slow  (dramatic) : charSpeed=80, charJitter=60, outputSpeed=50, linePause=100, cmdPause=600
 *   Normal (default) : charSpeed=40, charJitter=40, outputSpeed=28, linePause=65,  cmdPause=380
 *   Fast   (snappy)  : charSpeed=15, charJitter=10, outputSpeed=10, linePause=30,  cmdPause=150
 *   Instant          : charSpeed=5,  charJitter=0,  outputSpeed=5,  linePause=10,  cmdPause=50
 * ─────────────────────────────────────────────────────────────────────────
 */

'use strict';

/* ── Helper shortcuts ──────────────────────────────────────────────────── */
const $id  = id  => document.getElementById(id);
const $all = sel => document.querySelectorAll(sel);


/* ══════════════════════════════════════════════════════════════════════════
   1. TERMINAL TYPING ANIMATION
══════════════════════════════════════════════════════════════════════════ */
(function initTerminal() {

  const container = $id('terminal-body');
  if (!container) return;

  /* ── Speed config (edit these values to change animation speed) ── */
  const ANIM = {
    charSpeed:    40,   /* ms — base delay per command char   */
    charJitter:   40,   /* ms — random extra delay per char   */
    outputSpeed:  28,   /* ms — base delay per output char    */
    outputJitter: 30,   /* ms — random jitter for output      */
    linePause:    65,   /* ms — pause between output lines    */
    cmdPause:     380,  /* ms — pause after command, before output */
    initDelay:    600,  /* ms — delay before first keystroke  */
  };

  /* ── Terminal script — the "commands" to act out ── */
  const HANDLE = 'romansyahaman';
  const NAME   = 'Muh. Aman Romansyah';
  const TAGLINE_PARTS = ['IoT Enthusiast', 'Robotics Researcher', 'Programmer'];

  const PROMPT = `<span class="t-prompt">${HANDLE}@linux:~/portfolio$</span>`;

  const SCRIPT = [
    {
      type:  'command',
      cmd:   'cat welcome.txt',
      delay: ANIM.initDelay,
    },
    {
      type: 'output',
      lines: [
        `Welcome to <span class="t-success">${NAME}</span>'s personal portfolio!`,
        `<span class="t-success">[✓]</span> Electrical Engineering Graduate`,
        `<span class="t-success">[✓]</span> Universitas Dian Nuswantoro · 2021`,
      ],
      delay: ANIM.linePause,
    },
    {
      type:  'command',
      cmd:   './fetch_profile.sh',
      delay: ANIM.cmdPause,
    },
    {
      type: 'output',
      lines: [
        'Loading data...',
        ...TAGLINE_PARTS.map(p => `<span class="t-success">[✓]</span> ${p}`),
        '<span class="t-success">[✓]</span> ESP32 · AWS · Raspberry Pi',
        '',
        '<span class="t-success">Status:</span> <span class="t-cmd">open to opportunities</span>',
      ],
      delay: ANIM.linePause,
    },
    { type: 'idle' },
  ];

  /* ── Internal state ── */
  let scriptIdx = 0;   // which SCRIPT step we're on
  let charIdx   = 0;   // position within the current string
  let lineIdx   = 0;   // which output line we're on
  let cursorEl  = null;

  /* ── DOM helpers ── */
  function removeCursor() {
    if (cursorEl) { cursorEl.remove(); cursorEl = null; }
  }

  function addCursor(parent) {
    removeCursor();
    cursorEl = document.createElement('span');
    cursorEl.className = 'cursor-blink';
    cursorEl.setAttribute('aria-hidden', 'true');
    parent.appendChild(cursorEl);
  }

  function appendLine(innerHTML) {
    const el = document.createElement('span');
    el.className = 't-line';
    el.innerHTML = innerHTML;
    container.appendChild(el);
    return el;
  }

  /* ── Character-by-character typing ── */
  function typeChar(el, text, speed, jitter, onDone) {
    if (charIdx >= text.length) {
      charIdx = 0;
      onDone();
      return;
    }

    // Fast-forward entire HTML tag so we never break mid-tag
    if (text[charIdx] === '<') {
      const closeIdx = text.indexOf('>', charIdx);
      if (closeIdx !== -1) {
        el.innerHTML += text.slice(charIdx, closeIdx + 1);
        charIdx = closeIdx + 1;
        setTimeout(() => typeChar(el, text, speed, jitter, onDone), 0);
        return;
      }
    }

    el.innerHTML += text[charIdx++];
    container.scrollTop = container.scrollHeight;
    setTimeout(
      () => typeChar(el, text, speed, jitter, onDone),
      speed + Math.random() * jitter
    );
  }

  /* ── Step runner ── */
  function runStep() {
    if (scriptIdx >= SCRIPT.length) return;
    const step = SCRIPT[scriptIdx++];

    /* ── command step: show prompt + type the command text ── */
    if (step.type === 'command') {
      setTimeout(() => {
        const lineEl = appendLine('');
        lineEl.innerHTML = PROMPT + ' ';

        const cmdEl = document.createElement('span');
        cmdEl.className = 't-cmd';
        lineEl.appendChild(cmdEl);
        addCursor(lineEl);

        // Type command characters one by one
        function typeCmd() {
          if (charIdx < step.cmd.length) {
            cmdEl.textContent += step.cmd[charIdx++];
            container.scrollTop = container.scrollHeight;
            setTimeout(typeCmd, ANIM.charSpeed + Math.random() * ANIM.charJitter);
          } else {
            charIdx = 0;
            addCursor(lineEl); // keep cursor while "processing"
            setTimeout(runStep, ANIM.cmdPause);
          }
        }
        typeCmd();
      }, step.delay);
    }

    /* ── output step: type each line in sequence ── */
    else if (step.type === 'output') {
      removeCursor();

      // Flatten multi-line strings (split on \n) into a flat array
      const buf = step.lines.flatMap(l => l.split('\n'));
      lineIdx = 0;

      function nextLine() {
        if (lineIdx >= buf.length) {
          setTimeout(runStep, 200);
          return;
        }

        const raw   = buf[lineIdx++];
        const lineEl = appendLine('');
        lineEl.classList.add('t-output');

        // Empty line — just pause
        if (!raw) {
          setTimeout(nextLine, step.delay);
          return;
        }

        // Type the line character by character
        charIdx = 0;
        typeChar(
          lineEl,
          raw,
          ANIM.outputSpeed,
          ANIM.outputJitter,
          () => setTimeout(nextLine, step.delay)
        );
      }

      setTimeout(nextLine, 120);
    }

    /* ── idle step: show final blinking cursor ── */
    else if (step.type === 'idle') {
      const lineEl = appendLine('');
      lineEl.innerHTML = PROMPT + ' ';
      addCursor(lineEl);
    }
  }

  // Kick off the sequence
  setTimeout(runStep, ANIM.initDelay);
})();


/* ══════════════════════════════════════════════════════════════════════════
   2. HAMBURGER / MOBILE MENU TOGGLE
══════════════════════════════════════════════════════════════════════════ */
(function initHamburger() {
  const btn  = $id('hamburger');
  const menu = $id('mobile-menu');
  if (!btn || !menu) return;

  function openMenu() {
    btn.setAttribute('aria-expanded', 'true');
    menu.removeAttribute('hidden');
  }

  function closeMenu() {
    btn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('hidden', '');
  }

  // Toggle on button click
  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  // Close when a mobile link is tapped
  $all('[data-close-menu]').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on click outside the header
  document.addEventListener('click', e => {
    const header = $id('site-header');
    if (header && !header.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
})();


/* ══════════════════════════════════════════════════════════════════════════
   3. SCROLL-REVEAL ANIMATION
   Adds the 'reveal' class to targeted elements, then IntersectionObserver
   adds 'visible' when they enter the viewport — CSS handles the transition.
══════════════════════════════════════════════════════════════════════════ */
(function initScrollReveal() {
  const targets = $all(
    '.skills-section, .projects-section, .contact-footer, .project-card'
  );

  // Graceful fallback for very old browsers
  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('visible'));
    return;
  }

  // Mark all targets as initially hidden
  targets.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // fire once only
        }
      });
    },
    { threshold: 0.08 }
  );

  targets.forEach(el => observer.observe(el));
})();


/* ══════════════════════════════════════════════════════════════════════════
   4. ACTIVE NAV-LINK HIGHLIGHT ON SCROLL
   Watches each section; when it enters the viewport the matching nav link
   gets the --green colour applied inline.
══════════════════════════════════════════════════════════════════════════ */
(function initActiveNav() {
  const sections = $all('section[id], footer[id]');
  const links    = $all('.nav-link');
  if (!sections.length || !links.length) return;
  if (!('IntersectionObserver' in window)) return;

  // Build a map of  sectionId → navLink element
  const linkMap = {};
  links.forEach(link => {
    const id = link.getAttribute('href')?.replace('#', '');
    if (id) linkMap[id] = link;
  });

  function clearActiveLinks() {
    links.forEach(l => l.style.color = '');
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          clearActiveLinks();
          const activeLink = linkMap[entry.target.id];
          if (activeLink) activeLink.style.color = 'var(--green)';
        }
      });
    },
    {
      // Trigger when section is roughly centred in viewport
      rootMargin: '-40% 0px -55% 0px',
    }
  );

  sections.forEach(s => observer.observe(s));
})();
