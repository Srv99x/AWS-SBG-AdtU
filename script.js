/* ============================================================================
   AWS SBG AdtU — Production JavaScript
   Learn. Build. Connect.
   ============================================================================ */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  /* -----------------------------------------------------------------------
     HELPERS: Safe Storage + Toast
     ----------------------------------------------------------------------- */
  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* ignore sandboxed */ }
  }

  function safeSessionGet(key) {
    try { return sessionStorage.getItem(key); } catch (e) { return null; }
  }

  function safeSessionSet(key, value) {
    try { sessionStorage.setItem(key, value); } catch (e) { /* ignore sandboxed */ }
  }

  var toastEl = document.getElementById('toast');
  var toastMsg = document.getElementById('toast-message');
  var toastTimer = null;

  function showToast(message) {
    if (!toastEl || !toastMsg) return;
    toastMsg.textContent = message;
    toastEl.classList.remove('opacity-0', 'translate-y-2');
    toastEl.classList.add('opacity-100', 'translate-y-0');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.add('opacity-0', 'translate-y-2');
      toastEl.classList.remove('opacity-100', 'translate-y-0');
    }, 2400);
  }

  /* -----------------------------------------------------------------------
     1. CINEMATIC PRELOADER (~1.4s, session-cached, skippable)
     ----------------------------------------------------------------------- */
  var preloader = document.getElementById('preloader');
  var preloaderTitle = document.getElementById('preloader-title');
  var preloaderSubtitle = document.getElementById('preloader-subtitle');
  var preloaderBar = document.getElementById('preloader-bar');
  var preloaderStatus = document.getElementById('preloader-status');
  var preloaderDismissed = false;

  var statusMessages = [
    'Warming up serverless Lambdas...',
    'Connecting to ap-south-1 (Mumbai)...',
    'Booting AdtU Cloud Hub...',
    'Mounting FoCT B-Block Labs...',
    'Ready · Learn. Build. Connect.'
  ];

  function dismissPreloader() {
    if (preloaderDismissed || !preloader) return;
    preloaderDismissed = true;
    preloader.classList.add('is-hidden');
    safeSessionSet('aws-sbg-preloader-seen', 'true');
    setTimeout(function () {
      if (preloader && preloader.parentNode) preloader.style.display = 'none';
    }, 460);
  }

  if (preloader) {
    if (safeSessionGet('aws-sbg-preloader-seen') === 'true') {
      preloader.style.display = 'none';
      preloaderDismissed = true;
    } else {
      preloader.addEventListener('click', dismissPreloader);
      var skipBtn = document.getElementById('skip-preloader');
      if (skipBtn) {
        skipBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          dismissPreloader();
        });
      }

      var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var line1Target = 'AWS STUDENT BUILDER GROUP';
      var line2Target = 'ASSAM DOWN TOWN UNIVERSITY';

      if (prefersReduced) {
        if (preloaderBar) preloaderBar.style.width = '100%';
        if (preloaderTitle) preloaderTitle.textContent = line1Target;
        if (preloaderSubtitle) preloaderSubtitle.textContent = line2Target;
        setTimeout(dismissPreloader, 250);
      } else {
        var scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_<>#';
        var totalDuration = 1280;
        var startTime = performance.now();

        function scrambleString(target, progress) {
          var resolved = Math.floor(progress * target.length);
          var out = '';
          for (var i = 0; i < target.length; i++) {
            if (i < resolved || target[i] === ' ') {
              out += target[i];
            } else {
              out += scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
            }
          }
          return out;
        }

        function animatePreloader(now) {
          if (preloaderDismissed) return;
          var elapsed = now - startTime;
          var progress = Math.min(elapsed / totalDuration, 1);

          if (preloaderBar) preloaderBar.style.width = (progress * 100).toFixed(1) + '%';

          if (preloaderStatus) {
            var statusIdx = Math.min(Math.floor(progress * statusMessages.length), statusMessages.length - 1);
            preloaderStatus.textContent = statusMessages[statusIdx];
          }

          if (preloaderTitle) {
            preloaderTitle.textContent = scrambleString(line1Target, Math.min(progress * 1.15, 1));
          }
          if (preloaderSubtitle) {
            preloaderSubtitle.textContent = scrambleString(line2Target, progress);
          }

          if (progress < 1) {
            requestAnimationFrame(animatePreloader);
          } else {
            if (preloaderTitle) preloaderTitle.textContent = line1Target;
            if (preloaderSubtitle) preloaderSubtitle.textContent = line2Target;
            setTimeout(dismissPreloader, 200);
          }
        }

        requestAnimationFrame(animatePreloader);
        setTimeout(dismissPreloader, 1550);
      }
    }
  }

  /* -----------------------------------------------------------------------
     2. LIGHT / DARK MODE TOGGLE
     ----------------------------------------------------------------------- */
  var themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function () {
      var isDark = document.documentElement.classList.toggle('dark');
      safeSet('aws-sbg-adtu-theme', isDark ? 'dark' : 'light');
      showToast(isDark ? 'Dark Mode enabled' : 'Light Mode enabled');
    });
  }

  /* -----------------------------------------------------------------------
     3. FLOATING 2D PARALLAX AWS ICONS (Desktop Mouse Tracking)
     ----------------------------------------------------------------------- */
  var heroSection = document.getElementById('home');
  var floatWrappers = document.querySelectorAll('.hero-float-wrap');

  if (heroSection && floatWrappers.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    heroSection.addEventListener('mousemove', function (e) {
      var rect = heroSection.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;

      floatWrappers.forEach(function (wrap) {
        var depth = parseFloat(wrap.getAttribute('data-depth') || '1');
        var moveX = x * 28 * depth;
        var moveY = y * 20 * depth;
        wrap.style.transform = 'translate3d(' + moveX.toFixed(1) + 'px, ' + moveY.toFixed(1) + 'px, 0)';
      });
    });

    heroSection.addEventListener('mouseleave', function () {
      floatWrappers.forEach(function (wrap) {
        wrap.style.transform = 'translate3d(0, 0, 0)';
      });
    });
  }

  /* -----------------------------------------------------------------------
     4. INTERACTIVE AWS ARCHITECTURE CANVAS (5-Node Live Flow)
     ----------------------------------------------------------------------- */
  var canvasNodeOrder = ['builder-id', 'api-gateway', 'lambda', 'bedrock', 'storage'];
  var canvasNodeData = {
    'builder-id': {
      step: 'NODE 01 // IDENTITY & ACCESS',
      badge: 'Security Foundation',
      title: 'AWS Builder ID & IAM Least-Privilege',
      desc: 'Every AdtU student starts cleanly with a zero-cost AWS Builder ID, MFA protection, IAM developer roles, and $1 budget guardrails before provisioning cloud compute.',
      usage: 'Workshop 01: Cloud account hygiene, AWS CLI config & AWS Builder Center onboarding.',
      tags: ['AWS Builder ID', 'IAM Roles', 'MFA Guardrails', 'AWS CLI']
    },
    'api-gateway': {
      step: 'NODE 02 // EDGE ROUTING',
      badge: 'API Layer',
      title: 'Amazon API Gateway',
      desc: 'Acts as the managed front door for student apps — routing HTTPS requests securely, enforcing CORS headers, throttling bursts, and validating JWT tokens.',
      usage: 'Workshop 01 & 02: Exposing FastAPI & serverless Python endpoints to React or mobile UIs.',
      tags: ['REST & HTTP APIs', 'CORS Rules', 'Rate Limiting', 'Custom Domains']
    },
    'lambda': {
      step: 'NODE 03 // SERVERLESS COMPUTE',
      badge: 'Event-Driven Backend',
      title: 'AWS Lambda & Containerized FastAPI',
      desc: 'Execute Python backend logic and AI orchestration with zero idle server management, scaling automatically from one campus demo to thousands of requests.',
      usage: 'Workshop 02: Packaging Python microservices with Docker and deploying event handlers.',
      tags: ['AWS Lambda', 'Python 3.12', 'FastAPI', 'Docker Images']
    },
    'bedrock': {
      step: 'NODE 04 // GENERATIVE AI',
      badge: 'AI / DS Specialization',
      title: 'Amazon Bedrock & RAG Workflows',
      desc: 'Power intelligent campus assistants and Northeast India regional tools using foundation models, semantic embeddings, and Retrieval-Augmented Generation.',
      usage: 'Event 04 Build Sprint: Building grounded campus Q&A bots & study copilots.',
      tags: ['Amazon Bedrock', 'RAG Pipelines', 'Prompt Engineering', 'Vector Search']
    },
    'storage': {
      step: 'NODE 05 // PERSISTENCE & ASSETS',
      badge: 'Data & Storage',
      title: 'Amazon DynamoDB & Amazon S3',
      desc: 'Store structured application state at millisecond latency in DynamoDB while hosting static sites, PDFs, datasets, and model artifacts durably in S3.',
      usage: 'All Tracks: Static portfolio hosting, dataset ingestion & serverless CRUD state.',
      tags: ['DynamoDB', 'Amazon S3', 'CloudFront CDN', 'Presigned URLs']
    }
  };

  var archFlowNodes = document.querySelectorAll('.arch-flow-node');
  var archFlowPaths = document.querySelectorAll('.arch-flow-connector');
  var expStep = document.getElementById('arch-exp-step');
  var expBadge = document.getElementById('arch-exp-badge');
  var expTitle = document.getElementById('arch-exp-title');
  var expDesc = document.getElementById('arch-exp-desc');
  var expUsage = document.getElementById('arch-exp-usage');
  var expTags = document.getElementById('arch-exp-tags');
  var archNextNodeBtn = document.getElementById('arch-next-node-btn');
  var activeNodeId = 'builder-id';

  function selectCanvasNode(nodeId) {
    var data = canvasNodeData[nodeId];
    if (!data) return;
    activeNodeId = nodeId;
    var activeIdx = canvasNodeOrder.indexOf(nodeId);

    archFlowNodes.forEach(function (btn) {
      var id = btn.getAttribute('data-node-id');
      var isSelected = id === nodeId;
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      if (isSelected) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });

    archFlowPaths.forEach(function (path) {
      var from = path.getAttribute('data-from');
      var to = path.getAttribute('data-to');
      var fromIdx = canvasNodeOrder.indexOf(from);
      var toIdx = canvasNodeOrder.indexOf(to);
      var isLit = from === nodeId || to === nodeId || (toIdx <= activeIdx && fromIdx < activeIdx);
      if (isLit) {
        path.setAttribute('stroke', '#2EA3F2');
        path.setAttribute('stroke-width', '2.75');
        path.setAttribute('opacity', '1');
      } else {
        path.setAttribute('stroke', 'var(--border-subtle)');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('opacity', '0.75');
      }
    });

    if (expStep) expStep.textContent = data.step;
    if (expBadge) expBadge.textContent = data.badge;
    if (expTitle) expTitle.textContent = data.title;
    if (expDesc) expDesc.textContent = data.desc;
    if (expUsage) expUsage.textContent = data.usage;

    if (expTags) {
      expTags.innerHTML = '';
      data.tags.forEach(function (tag) {
        var span = document.createElement('span');
        span.className = 'font-mono text-[11px] px-2.5 py-1 rounded-md bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]';
        span.textContent = tag;
        expTags.appendChild(span);
      });
    }
  }

  archFlowNodes.forEach(function (node) {
    node.addEventListener('click', function () {
      selectCanvasNode(node.getAttribute('data-node-id'));
    });
    node.addEventListener('mouseenter', function () {
      selectCanvasNode(node.getAttribute('data-node-id'));
    });
  });

  if (archNextNodeBtn) {
    archNextNodeBtn.addEventListener('click', function () {
      var nextIdx = (canvasNodeOrder.indexOf(activeNodeId) + 1) % canvasNodeOrder.length;
      selectCanvasNode(canvasNodeOrder[nextIdx]);
    });
  }

  /* -----------------------------------------------------------------------
     5. PILLAR CARDS — 2D/3D TILT ON HOVER (Zero Mousemove Lag)
     ----------------------------------------------------------------------- */
  var pillarCards = document.querySelectorAll('.pillar-card');
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    pillarCards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        card.classList.add('is-tilting');
      });

      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        var y = (e.clientY - rect.top) / rect.height;
        var rotateX = (0.5 - y) * 6;
        var rotateY = (x - 0.5) * 6;
        card.style.transform = 'perspective(850px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg) translateY(-4px)';
      });

      card.addEventListener('mouseleave', function () {
        card.classList.remove('is-tilting');
        card.style.transform = '';
      });
    });
  }

  /* -----------------------------------------------------------------------
     6. EVENT FILTERING & EVENT DETAIL MODAL
     ----------------------------------------------------------------------- */
  var eventsData = {
    'kickoff-ai-api': {
      badge: 'Upcoming · Post-Exams · Event 01',
      title: 'AWS Cloud Kickoff & Deploying Your First AI API',
      meta: 'Venue: FoCT, AdtU Campus & Hybrid · Free for AdtU Students',
      banner: 'brand-asset-banner-small-20261126T123412.png',
      desc: 'Our official Cohort 10 launch session! We will onboard every attendee onto AWS Builder Center, demystify core cloud primitives, and walk step-by-step through deploying a live Python/FastAPI AI endpoint.',
      agenda: [
        'Welcome to AWS SBG AdtU: Cohort 10 roadmap & Core Team intro (15 min)',
        'Live AWS Builder Center onboarding & student verification walkthrough (20 min)',
        'Hands-on Lab: Building & deploying your first Python/FastAPI AI API (50 min)',
        'Open Q&A, peer networking & Meetup group photo (15 min)'
      ],
      prereq: 'Bring a laptop with Python 3.10+ & VS Code installed. Zero prior AWS experience required.',
      host: 'Led by Sourav Chakraborty (SBGL) & Akash Kalita (Technical Lead).'
    },
    'docker-fastapi-lab': {
      badge: 'Planned · Q1 2027 · Event 02',
      title: 'Serverless & Containers Lab: Docker + FastAPI on AWS',
      meta: 'Venue: CS Lab · FoCT B Block · Hands-On Lab',
      banner: 'brand-asset-header-photo-ad598ec5-20261126T125835.png',
      desc: 'Move past "it works on my machine." Learn how to write a clean production Dockerfile for a Python backend, test containers locally, and understand how AWS serverless and container services host real apps.',
      agenda: [
        'Containers vs. VMs vs. Serverless: Picking the right compute model (15 min)',
        'Writing a multi-stage Dockerfile & .dockerignore for FastAPI (30 min)',
        'Environment variables, CORS, and health-check best practices (25 min)',
        'Deploying and testing live endpoints with peer code review (30 min)'
      ],
      prereq: 'Basic Python familiarity and Docker Desktop (or Linux Docker Engine) installed.',
      host: 'Led by AWS SBG AdtU Technical & Events Core Team.'
    },
    'clf-c02-study-jam': {
      badge: 'Planned · Q1 2027 · Event 03',
      title: 'AWS Cloud Practitioner (CLF-C02) 3-Week Study Jam',
      meta: 'Venue: Hybrid · Meetup + FoCT Campus · Community & Study Jam',
      banner: 'brand-asset-linkedin-personal-cover-20261126T124247.png',
      desc: 'A focused 3-week certification prep cohort covering all four CLF-C02 exam domains: Cloud Concepts, Security & Compliance, Cloud Technology & Services, and Billing & Pricing.',
      agenda: [
        'Week 1: Cloud Concepts, Well-Architected Framework & Global Infrastructure',
        'Week 2: Shared Responsibility Model, IAM, VPC basics & Core Compute/Storage',
        'Week 3: Pricing Calculator, Support Plans & Full Timed Mock Exam Drill',
        'Peer debrief: Reviewing tricky exam scenarios & free official practice tests'
      ],
      prereq: 'Open to all branches and semesters at AdtU. AWS Builder ID recommended.',
      host: 'Peer-moderated weekly study circles hosted via Meetup & FoCT.'
    },
    'northeast-genai-sprint': {
      badge: 'Planned · Q2 2027 · Event 04',
      title: 'Northeast Student GenAI & RAG Builders Sprint',
      meta: 'Venue: AdtU Campus · Guwahati · AI & Cloud Buildathon',
      banner: 'brand-asset-facebook-cover-20261126T123840.png',
      desc: 'Form 2–4 member student teams to design and prototype practical AI applications—such as campus assistants, regional language helpers, or developer utilities—using RAG pipelines and cloud APIs.',
      agenda: [
        'Problem framing & RAG architecture blueprint kickoff (25 min)',
        'Guided build sprint with Core Team technical mentors on the floor (3 hours)',
        'Live 3-minute working demos (deployed links or local live runs)',
        'Community feedback, Builder Center write-ups & showcase highlights'
      ],
      prereq: 'Teams of 2–4 students. Basic Git + Python or web prototyping skills helpful.',
      host: 'Coordinated by Khomdram Sanahal (Director of Events) & Core Team.'
    },
    'aws-community-day': {
      badge: 'Planned · Q3 2027 · Event 05',
      title: 'AdtU AWS Community Day — Project Showcase',
      meta: 'Venue: FoCT B Block · AdtU Campus · Community Flagship',
      banner: 'brand-asset-meetup-group-cover-photo-46ffc0c7-20261126T123212.png',
      desc: 'An open-campus event showcasing student-built cloud projects, lightning talks from builders, and guest sessions from AWS Community Builders and regional tech leaders.',
      agenda: [
        'Opening keynote: State of Cloud at AdtU (20 min)',
        'Student project demos — live deployed apps & AI tools (90 min)',
        'Lightning talks: 5-minute tech deep dives from AdtU builders (60 min)',
        'Panel: Career paths in cloud engineering & certifications (40 min)'
      ],
      prereq: 'Open to all AdtU students and faculty. Project demo slots by application.',
      host: 'AWS SBG AdtU Core Team & FoCT Faculty.'
    },
    'cloud-security-workshop': {
      badge: 'Planned · Q3 2027 · Event 06',
      title: 'Cloud Security & IAM Deep Dive Lab',
      meta: 'Venue: CS Lab · FoCT B Block · Hands-On Lab',
      banner: 'brand-asset-company-page-banner-0467ec52-20261126T031528.png',
      desc: 'Go beyond the basics. Learn advanced IAM policies, VPC security groups, AWS WAF, Secrets Manager, and incident response patterns used in real production cloud environments.',
      agenda: [
        'IAM policy anatomy: Conditions, boundaries, and cross-account access (30 min)',
        'Hands-on: Securing a 3-tier app with VPC, NACLs, and Security Groups (40 min)',
        'Secrets management: AWS Secrets Manager & Parameter Store (20 min)',
        'Incident response simulation & CloudTrail log analysis (30 min)'
      ],
      prereq: 'Completed CLF-C02 Study Jam or equivalent cloud fundamentals knowledge.',
      host: 'AWS SBG AdtU Technical Lead & Security-focused guest speakers.'
    }
  };

  var filterButtons = document.querySelectorAll('.event-filter-btn');
  var eventCards = document.querySelectorAll('.event-card');

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var selected = btn.getAttribute('data-filter');

      filterButtons.forEach(function (b) {
        var isSelected = b === btn;
        b.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
        if (isSelected) {
          b.className = 'event-filter-btn px-4 py-2 rounded-full font-mono text-xs font-semibold bg-[#0EA5E9] dark:bg-[#2EA3F2] text-white dark:text-[#0B1120] transition-colors';
        } else {
          b.className = 'event-filter-btn px-4 py-2 rounded-full font-mono text-xs font-semibold border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[#2EA3F2] hover:text-[var(--text-primary)] transition-colors';
        }
      });

      eventCards.forEach(function (card) {
        var cats = (card.getAttribute('data-categories') || '').split(' ');
        if (selected === 'all' || cats.indexOf(selected) !== -1) {
          card.style.display = '';
          card.classList.remove('hidden');
          card.classList.add('is-visible');
        } else {
          card.classList.add('hidden');
          card.style.display = 'none';
        }
      });
    });
  });

  /* -----------------------------------------------------------------------
     7. COHORT SWITCHER PILL (Switches Team Grid <-> Open Seats View)
     ----------------------------------------------------------------------- */
  var cohortBtns = document.querySelectorAll('.cohort-switch-btn');
  var cohortNote = document.getElementById('cohort-status-note');
  var teamCurrentGrid = document.getElementById('team-grid-current');
  var teamOpenGrid = document.getElementById('team-grid-open');

  cohortBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cohort = btn.getAttribute('data-cohort');
      cohortBtns.forEach(function (b) {
        var active = b === btn;
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
        if (active) {
          b.className = 'cohort-switch-btn px-3.5 py-1.5 rounded-full font-mono text-xs font-semibold bg-[#0EA5E9] dark:bg-[#2EA3F2] text-white dark:text-[#0B1120] transition-colors';
        } else {
          b.className = 'cohort-switch-btn px-3.5 py-1.5 rounded-full font-mono text-xs font-semibold border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[#2EA3F2] hover:text-[var(--text-primary)] transition-colors';
        }
      });

      var isCurrent = cohort === 'current';
      if (teamCurrentGrid && teamOpenGrid) {
        if (isCurrent) {
          teamCurrentGrid.classList.remove('hidden');
          teamOpenGrid.classList.add('hidden');
          teamCurrentGrid.querySelectorAll('.reveal-item').forEach(function (el) { el.classList.add('is-visible'); });
        } else {
          teamCurrentGrid.classList.add('hidden');
          teamOpenGrid.classList.remove('hidden');
          teamOpenGrid.querySelectorAll('.reveal-item').forEach(function (el) { el.classList.add('is-visible'); });
        }
      }

      if (cohortNote) {
        cohortNote.textContent = isCurrent
          ? 'Founding AdtU Cohort 10 Core Leadership — Active 2026–27 Academic Season.'
          : 'Recruiting Marketing, Community, Operations & Volunteer Leads for 2026–27 Cohort 10.';
      }
    });
  });

  /* -----------------------------------------------------------------------
     8. ACCESSIBLE MODAL CONTROLLER (Focus Trap + Scroll Reset)
     ----------------------------------------------------------------------- */
  var activeModalId = null;
  var lastFocusedElement = null;

  function getFocusableElements(container) {
    return Array.prototype.slice.call(
      container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) {
      return el.offsetParent !== null;
    });
  }

  function openModal(modalId) {
    var modal = document.getElementById(modalId);
    if (!modal) return;
    lastFocusedElement = document.activeElement;
    activeModalId = modalId;

    var scrollbarGap = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarGap > 0) document.body.style.paddingRight = scrollbarGap + 'px';
    document.body.style.overflow = 'hidden';

    modal.classList.remove('hidden');
    var scrollContainer = modal.querySelector('.modal-scroll-area');
    if (scrollContainer) scrollContainer.scrollTop = 0;

    var closeBtn = modal.querySelector('[data-close-modal]');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal(modalId) {
    var modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('hidden');
    activeModalId = null;
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }

  function openEventDetail(eventId) {
    var item = eventsData[eventId];
    if (!item) return;

    document.getElementById('event-modal-badge').textContent = item.badge;
    document.getElementById('event-modal-title').textContent = item.title;
    document.getElementById('event-modal-meta').textContent = item.meta;
    document.getElementById('event-modal-desc').textContent = item.desc;
    document.getElementById('event-modal-prereq').textContent = item.prereq;
    document.getElementById('event-modal-host').textContent = item.host;

    var bannerImg = document.getElementById('event-modal-banner');
    if (bannerImg && item.banner) {
      bannerImg.src = item.banner;
      bannerImg.alt = item.title + ' banner';
    }

    var agendaList = document.getElementById('event-modal-agenda');
    agendaList.innerHTML = '';
    item.agenda.forEach(function (point) {
      var li = document.createElement('li');
      li.textContent = point;
      agendaList.appendChild(li);
    });

    openModal('event-modal');
  }

  eventCards.forEach(function (card) {
    var id = card.getAttribute('data-event-id');
    card.addEventListener('click', function () { openEventDetail(id); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openEventDetail(id);
      }
    });
  });

  // Publication Articles
  var articlesData = {
    'aws-builder-center-guide': {
      tag: 'ONBOARDING GUIDE · 5 MIN READ',
      title: 'Getting Started with AWS Builder Center & Cloud Foundations at AdtU',
      paragraphs: [
        'Every AWS Student Builder Group member starts with one free identity: an AWS Builder ID. Unlike a full AWS billing account, your Builder ID does not require a credit card and immediately gives you access to AWS Builder Center articles, learning spaces, and community events.',
        'Step 1 — Use a consistent email: Sign up at community.aws using the same email you plan to use for campus workshops and Credly badges. If you have your official @adtu.in email, keep a recent university document handy before starting student verification.',
        'Step 2 — Practice safe sandbox habits: Whenever you move into hands-on cloud accounts later, turn on MFA for your root user, create a separate IAM developer user, and set a $1 Zero-Spend Budget Alert before launching compute resources.',
        'Step 3 — Learn with peers: Join our Meetup chapter so you can build alongside AdtU teammates rather than debugging alone.'
      ]
    },
    'fastapi-cloud-checklist': {
      tag: 'BACKEND & DEPLOYMENT · 7 MIN READ',
      title: "From Local FastAPI to Cloud: A Student Builder's Deployment Checklist",
      paragraphs: [
        'Shipping your first Python AI or backend project beyond localhost takes discipline more than complexity. Use this 5-point checklist we follow during AWS SBG AdtU workshops:',
        '1. Never commit secrets: Store API keys and JWT secrets in a local .env file listed inside .gitignore, and provide a safe .env.example template in your GitHub repo.',
        '2. Add a /health endpoint: Cloud load balancers and container orchestrators rely on a lightweight GET /health route returning HTTP 200 to verify your service is alive.',
        '3. Lock down CORS explicitly: Avoid wildcard "*" origins in production when handling credentials—explicitly allow only your deployed frontend URL.',
        '4. Containerize cleanly: Pin dependencies in requirements.txt, use a slim Python base image (python:3.11-slim), and run Uvicorn bound to 0.0.0.0 so containers accept external traffic.'
      ]
    }
  };

  document.querySelectorAll('.article-card').forEach(function (card) {
    function handleOpen() {
      var id = card.getAttribute('data-article-id');
      var art = articlesData[id];
      if (!art) return;
      document.getElementById('article-modal-tag').textContent = art.tag;
      document.getElementById('article-modal-title').textContent = art.title;
      var bodyEl = document.getElementById('article-modal-body');
      bodyEl.innerHTML = '';
      art.paragraphs.forEach(function (text) {
        var p = document.createElement('p');
        p.textContent = text;
        bodyEl.appendChild(p);
      });
      openModal('article-modal');
    }
    card.addEventListener('click', handleOpen);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleOpen();
      }
    });
  });

  // Quick Start Modal
  var openQS = document.getElementById('open-quickstart-btn');
  if (openQS) openQS.addEventListener('click', function () { openModal('quickstart-modal'); });

  var jumpCL = document.getElementById('quickstart-jump-checklist');
  if (jumpCL) {
    jumpCL.addEventListener('click', function () {
      closeModal('quickstart-modal');
      var target = document.getElementById('resources');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  }

  document.querySelectorAll('[data-close-modal]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      closeModal(btn.getAttribute('data-close-modal'));
    });
  });

  ['event-modal', 'article-modal', 'quickstart-modal'].forEach(function (id) {
    var modal = document.getElementById(id);
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal(id);
      });
    }
  });

  document.addEventListener('keydown', function (e) {
    if (!activeModalId) return;
    if (e.key === 'Escape') {
      closeModal(activeModalId);
      return;
    }
    if (e.key === 'Tab') {
      var modal = document.getElementById(activeModalId);
      if (!modal) return;
      var focusables = getFocusableElements(modal);
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  /* -----------------------------------------------------------------------
     9. INTERACTIVE ONBOARDING CHECKLIST (localStorage)
     ----------------------------------------------------------------------- */
  var CHECKLIST_KEY = 'aws-sbg-adtu-checklist';
  var checkboxes = document.querySelectorAll('.checklist-box');
  var checklistCounter = document.getElementById('checklist-counter');
  var checklistBar = document.getElementById('checklist-progress-bar');
  var checklistStatusMsg = document.getElementById('checklist-status-msg');
  var resetChecklistBtn = document.getElementById('reset-checklist-btn');

  function loadChecklistState() {
    var saved = safeGet(CHECKLIST_KEY);
    if (!saved) return {};
    try { return JSON.parse(saved) || {}; } catch (e) { return {}; }
  }

  function updateChecklistUI(notify) {
    var state = {};
    var done = 0;
    var total = checkboxes.length;

    checkboxes.forEach(function (box) {
      var step = box.getAttribute('data-step');
      state[step] = box.checked;
      if (box.checked) done++;
    });

    safeSet(CHECKLIST_KEY, JSON.stringify(state));
    var pct = Math.round((done / total) * 100);
    if (checklistCounter) checklistCounter.textContent = done + ' / ' + total;
    if (checklistBar) checklistBar.style.width = pct + '%';

    if (checklistStatusMsg) {
      if (done === total) {
        checklistStatusMsg.textContent = 'All 4 steps complete — see you at Workshop 01!';
        checklistStatusMsg.classList.add('text-[#0EA5E9]', 'dark:text-[#2EA3F2]', 'font-semibold');
        if (notify) showToast('Onboarding checklist complete!');
      } else {
        checklistStatusMsg.textContent = done === 0
          ? 'Complete all 4 steps to get lab-ready.'
          : (total - done) + ' step' + ((total - done) > 1 ? 's' : '') + ' left to get lab-ready.';
        checklistStatusMsg.classList.remove('text-[#0EA5E9]', 'dark:text-[#2EA3F2]', 'font-semibold');
      }
    }
  }

  var initialCL = loadChecklistState();
  checkboxes.forEach(function (box) {
    if (initialCL[box.getAttribute('data-step')]) box.checked = true;
    box.addEventListener('change', function () { updateChecklistUI(true); });
  });
  updateChecklistUI(false);

  if (resetChecklistBtn) {
    resetChecklistBtn.addEventListener('click', function () {
      checkboxes.forEach(function (box) { box.checked = false; });
      updateChecklistUI(false);
      showToast('Checklist progress reset');
    });
  }

  /* -----------------------------------------------------------------------
     10. COPY EMAIL
     ----------------------------------------------------------------------- */
  var copyEmailBtn = document.getElementById('copy-email-btn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', function () {
      var email = 'souravchakraborty.bcsm@adtu.in';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(function () {
          showToast('Email copied: ' + email);
        }).catch(function () {
          showToast('Email: ' + email);
        });
      } else {
        var tmp = document.createElement('textarea');
        tmp.value = email;
        tmp.setAttribute('readonly', '');
        tmp.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(tmp);
        tmp.select();
        try { document.execCommand('copy'); showToast('Email copied: ' + email); }
        catch (e) { showToast('Email: ' + email); }
        document.body.removeChild(tmp);
      }
    });
  }

  /* -----------------------------------------------------------------------
     11. SCROLL REVEAL & ROBUST SCROLL-SPY (Desktop Nav + Mobile Dock)
     ----------------------------------------------------------------------- */
  var revealItems = document.querySelectorAll('.reveal-item');
  if ('IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          ro.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });
    revealItems.forEach(function (el) { ro.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add('is-visible'); });
  }

  var dockItems = document.querySelectorAll('.dock-item');
  var navLinks = document.querySelectorAll('.nav-link');
  var allSectionIds = ['home', 'architecture', 'about', 'pillars', 'events', 'team', 'campus', 'resources', 'join'];
  var allSections = allSectionIds.map(function (id) { return document.getElementById(id); }).filter(Boolean);

  var dockSectionMap = {
    home: 'home',
    architecture: 'home',
    about: 'home',
    pillars: 'home',
    events: 'events',
    team: 'team',
    campus: 'team',
    resources: 'resources',
    join: 'join'
  };

  function setActiveDock(id) {
    var mapped = dockSectionMap[id] || 'home';
    dockItems.forEach(function (link) {
      var match = link.getAttribute('data-dock-target') === mapped;
      if (match) {
        link.classList.add('text-[#0EA5E9]', 'dark:text-[#2EA3F2]', 'bg-[#2EA3F2]/[0.12]');
        link.classList.remove('text-[var(--text-muted)]');
      } else {
        link.classList.remove('text-[#0EA5E9]', 'dark:text-[#2EA3F2]', 'bg-[#2EA3F2]/[0.12]');
        link.classList.add('text-[var(--text-muted)]');
      }
    });
  }

  function setActiveNav(id) {
    navLinks.forEach(function (link) {
      if (link.getAttribute('href') === '#' + id) {
        link.classList.add('text-[var(--text-primary)]', 'bg-[var(--bg-tint)]');
        link.classList.remove('text-[var(--text-muted)]');
      } else {
        link.classList.remove('text-[var(--text-primary)]', 'bg-[var(--bg-tint)]');
        link.classList.add('text-[var(--text-muted)]');
      }
    });
  }

  var spyTicking = false;
  function updateScrollSpy() {
    spyTicking = false;
    var scrollBottom = window.innerHeight + window.scrollY;
    var docHeight = document.documentElement.scrollHeight;

    if (scrollBottom >= docHeight - 60) {
      setActiveDock('join');
      setActiveNav('resources');
      return;
    }

    var probeY = window.scrollY + window.innerHeight * 0.34;
    var currentId = 'home';

    for (var i = 0; i < allSections.length; i++) {
      var sec = allSections[i];
      if (sec.offsetTop <= probeY) {
        currentId = sec.id;
      }
    }

    setActiveDock(currentId);
    setActiveNav(currentId);
  }

  window.addEventListener('scroll', function () {
    if (!spyTicking) {
      spyTicking = true;
      requestAnimationFrame(updateScrollSpy);
    }
  }, { passive: true });
  updateScrollSpy();
});
