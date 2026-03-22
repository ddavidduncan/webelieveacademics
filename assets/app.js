(function () {
  'use strict';

  // ── API base detection ────────────────────────────────────────────────────────
  const DEFAULT_REMOTE_API = 'https://webelieveacademics.com/api/v1';
  const DEFAULT_LOCAL_API  = 'http://127.0.0.1:4000/api/v1';

  function getApiBase() {
    const override = localStorage.getItem('wbaApiBase');
    if (override) return override;
    const host = window.location.hostname;
    if (host === '127.0.0.1' || host === 'localhost' || host === '') return DEFAULT_LOCAL_API;
    return DEFAULT_REMOTE_API;
  }

  const apiBase  = getApiBase();
  const tokenKey = 'wbaToken';
  const userKey  = 'wbaUser';

  // ── Utilities ─────────────────────────────────────────────────────────────────
  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function formatDate(value) {
    if (!value) return 'Unknown';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  }

  function statusPill(status) {
    const colors = {
      new:       'background:var(--wba-mint-light);color:var(--wba-mint-deep)',
      in_review: 'background:var(--wba-steel-light);color:var(--wba-steel-deep)',
      contacted: 'background:var(--wba-cream);color:var(--wba-navy-mid)',
      scheduled: 'background:#e8f5e9;color:#2e7d32',
      closed:    'background:var(--wba-sand);color:var(--wba-body)',
      Active:    'background:var(--wba-mint-light);color:var(--wba-mint-deep)',
      Disabled:  'background:var(--wba-sand);color:var(--wba-body)',
    };
    const style = colors[status] || 'background:var(--wba-sand);color:var(--wba-body)';
    return `<span class="status-pill" style="${style}">${escapeHtml(status)}</span>`;
  }

  // ── Session helpers ───────────────────────────────────────────────────────────
  function getToken()      { return localStorage.getItem(tokenKey); }
  function getStoredUser() {
    try { return JSON.parse(localStorage.getItem(userKey) || 'null'); } catch { return null; }
  }
  function setSession(token, user) {
    localStorage.setItem(tokenKey, token);
    localStorage.setItem(userKey, JSON.stringify(user));
  }
  function clearSession() {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
  }

  // ── API fetch wrapper ─────────────────────────────────────────────────────────
  async function api(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${apiBase}${path}`, { ...options, headers });
    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message =
        (typeof payload === 'object' && payload?.message) ||
        (typeof payload === 'object' && payload?.error_description) ||
        (typeof payload === 'string' && payload) ||
        'Request failed';
      throw new Error(message);
    }
    return payload;
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  CONTACT FORM  (contact.html)
  // ════════════════════════════════════════════════════════════════════════════
  function bindContactForm() {
    const form       = document.querySelector('[data-contact-form]');
    const status     = document.querySelector('[data-contact-status]');
    const apiBaseNode = document.querySelector('[data-api-base]');
    if (apiBaseNode) apiBaseNode.textContent = apiBase;
    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (status) status.textContent = 'Sending…';
      const fd = new FormData(form);
      try {
        await api('/consultations', {
          method: 'POST',
          body: JSON.stringify({
            parentName:       fd.get('name'),
            email:            fd.get('email'),
            phone:            fd.get('phone'),
            childName:        fd.get('child_name'),
            childAge:         fd.get('child_age'),
            childGradeLevel:  fd.get('child_grade_level'),
            goals:            fd.get('goals'),
            challenges:       fd.get('challenges'),
            sourcePage:       'contact'
          })
        });
        form.reset();
        if (status) {
          status.textContent = 'Consultation request received. We will reach out within 24 hours.';
          status.className   = 'alert alert-success mt-3';
        }
      } catch (err) {
        if (status) {
          status.textContent = err.message;
          status.className   = 'alert alert-danger mt-3';
        }
      }
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  PORTAL  (portal.html)
  // ════════════════════════════════════════════════════════════════════════════
  function bindPortal() {
    if (!document.querySelector('[data-portal-root]')) return;

    const authState = { user: getStoredUser(), selectedStudentId: null };

    // ── Element refs ──────────────────────────────────────────────────────────
    const el = (sel) => document.querySelector(sel);
    const els = {
      apiBase:                    el('[data-portal-api-base]'),
      authSection:                el('[data-auth-section]'),
      sessionShell:               el('[data-session-shell]'),
      parentSection:              el('[data-parent-section]'),
      adminSection:               el('[data-admin-section]'),
      loginForm:                  el('[data-login-form]'),
      registerForm:               el('[data-register-form]'),
      logout:                     el('[data-logout]'),
      switchAccount:              el('[data-switch-account]'),
      authStatus:                 el('[data-auth-status]'),
      sessionName:                el('[data-session-name]'),
      sessionRoleBadge:           el('[data-session-role-badge]'),
      // parent
      studentForm:                el('[data-student-form]'),
      studentStatus:              el('[data-student-status]'),
      studentsList:               el('[data-students-list]'),
      studentDashboard:           el('[data-student-dashboard]'),
      coursesList:                el('[data-courses-list]'),
      teachersList:               el('[data-teachers-list]'),
      standardsForm:              el('[data-standards-form]'),
      standardsResults:           el('[data-standards-results]'),
      // admin — summary
      adminSummaryCards:          el('[data-admin-summary-cards]'),
      adminSummaryRefresh:        el('[data-admin-summary-refresh]'),
      adminRecentUsers:           el('[data-admin-recent-users]'),
      adminRecentConsultations:   el('[data-admin-recent-consultations]'),
      // admin — intake
      adminConsultationFilter:    el('[data-admin-consultation-filter]'),
      adminConsultationsRefresh:  el('[data-admin-consultations-refresh]'),
      adminConsultationsStatus:   el('[data-admin-consultations-status]'),
      adminConsultationsList:     el('[data-admin-consultations-list]'),
      // admin — users
      adminUserFilter:            el('[data-admin-user-filter]'),
      adminUsersRefresh:          el('[data-admin-users-refresh]'),
      adminUsersStatus:           el('[data-admin-users-status]'),
      adminUsersList:             el('[data-admin-users-list]'),
      // admin — create user
      adminCreateUserForm:        el('[data-admin-create-user-form]'),
      adminCreateUserReset:       el('[data-admin-create-user-reset]'),
      createUserRoleSelect:       el('[data-create-user-role]'),
      createUserStatus:           el('[data-create-user-status]'),
      // admin — all students
      adminStudentsRefresh:       el('[data-admin-students-refresh]'),
      adminStudentsStatus:        el('[data-admin-students-status]'),
      adminStudentsList:          el('[data-admin-students-list]'),
    };

    if (els.apiBase) els.apiBase.textContent = apiBase;

    // ── Admin tab switching ───────────────────────────────────────────────────
    document.querySelectorAll('[data-admin-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-admin-tab');

        // Update button states
        document.querySelectorAll('[data-admin-tab]').forEach((b) => {
          b.classList.remove('active');
          if (b.getAttribute('data-admin-tab') === 'create-user') b.classList.add('active-mint');
          else b.classList.remove('active-mint');
        });
        btn.classList.add('active');
        if (target !== 'create-user') btn.classList.remove('active-mint');

        // Show/hide panels
        document.querySelectorAll('[data-admin-panel]').forEach((panel) => {
          panel.classList.toggle('active', panel.getAttribute('data-admin-panel') === target);
        });

        // Lazy-load data when a tab is first opened
        if (target === 'students') loadAdminAllStudents();
        if (target === 'recent')   loadAdminSummary();  // refreshes recent lists
      });
    });

    // ── Role badge helper ─────────────────────────────────────────────────────
    function renderSession() {
      const user      = authState.user;
      const loggedIn  = Boolean(user && getToken());

      els.authSection?.classList.toggle('hidden', loggedIn);
      els.sessionShell?.classList.toggle('hidden', !loggedIn);

      if (!loggedIn || !user) return;

      const isAdmin = user.role === 'admin';
      els.parentSection?.classList.toggle('hidden', isAdmin);
      els.adminSection?.classList.toggle('hidden', !isAdmin);

      // Name
      if (els.sessionName) {
        els.sessionName.textContent = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.email;
      }

      // Role badge
      if (els.sessionRoleBadge) {
        els.sessionRoleBadge.textContent  = user.role.charAt(0).toUpperCase() + user.role.slice(1);
        els.sessionRoleBadge.className    = `session-role-badge ${user.role}`;
      }
    }

    // ── Session validation ────────────────────────────────────────────────────
    async function validateStoredSession() {
      if (!authState.user || !getToken()) return;
      try {
        await api('/auth/me');
      } catch {
        clearSession();
        authState.user = null;
        authState.selectedStudentId = null;
      }
    }

    // ════════════════════════════════════════════════════════════════
    //  PARENT FUNCTIONS
    // ════════════════════════════════════════════════════════════════

    async function loadStudents() {
      const payload  = await api('/parents/me/students');
      const students = payload.students || [];
      if (!els.studentsList) return;

      if (!students.length) {
        els.studentsList.innerHTML = `<p class="muted-note mb-0">No students yet. Add one above to get started.</p>`;
        return;
      }

      els.studentsList.innerHTML = students.map((s) => `
        <div class="student-item${s.user_id === authState.selectedStudentId ? ' active' : ''}"
             data-student-btn="${escapeHtml(s.user_id)}">
          <div class="name">${escapeHtml(s.display_name || `${s.first_name} ${s.last_name || ''}`.trim())}</div>
          <div class="meta">${escapeHtml(s.grade_level || 'Grade not set')}${s.school_name ? ` · ${escapeHtml(s.school_name)}` : ''}</div>
        </div>
      `).join('');

      els.studentsList.querySelectorAll('[data-student-btn]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          authState.selectedStudentId = btn.getAttribute('data-student-btn');
          // Update active state
          els.studentsList.querySelectorAll('[data-student-btn]').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          await loadStudentDashboard();
        });
      });

      // Auto-load first student
      if (!authState.selectedStudentId && students[0]) {
        authState.selectedStudentId = students[0].user_id;
        await loadStudentDashboard();
      }
    }

    async function loadStudentDashboard() {
      if (!authState.selectedStudentId || !els.studentDashboard) return;
      els.studentDashboard.innerHTML = `<p class="muted-note">Loading…</p>`;

      try {
        const data        = await api(`/dashboard/student/${authState.selectedStudentId}`);
        const student     = data.student;
        const enrollments = data.enrollments || [];
        const grades      = data.recentGrades || [];
        const prefs       = data.learningPreferences || [];

        els.studentDashboard.innerHTML = `
          <div class="summary-grid mb-4">
            <div class="summary-card">
              <div class="lbl">Student</div>
              <div class="val" style="font-size:1.4rem">${escapeHtml(student.first_name)}</div>
              <div class="muted-note" style="font-size:.82rem">${escapeHtml(student.grade_level || 'Grade not set')}${student.school_name ? ` · ${escapeHtml(student.school_name)}` : ''}</div>
            </div>
            <div class="summary-card mint">
              <div class="lbl">Enrollments</div>
              <div class="val">${enrollments.length}</div>
              <div class="muted-note" style="font-size:.82rem">${escapeHtml(enrollments.map((e) => e.title).join(', ') || 'No active courses yet')}</div>
            </div>
            <div class="summary-card navy">
              <div class="lbl">Recent grades</div>
              <div class="val">${grades.length}</div>
              <div class="muted-note" style="font-size:.82rem">${grades[0] ? `${escapeHtml(String(grades[0].percentage))}% on ${escapeHtml(grades[0].test_title || grades[0].assignment_type)}` : 'No grade data yet'}</div>
            </div>
          </div>
          ${prefs.length ? `
            <div>
              <div class="eyebrow dark mb-3">Learning preferences</div>
              <ul class="mb-0">
                ${prefs.map((p) => `<li class="mb-1"><strong>${escapeHtml(p.subject_area)}</strong>: ${escapeHtml(p.best_method_name)}</li>`).join('')}
              </ul>
            </div>
          ` : `<p class="muted-note mb-0">No learning preference data yet.</p>`}
        `;
      } catch (err) {
        els.studentDashboard.innerHTML = `<div class="alert alert-danger mb-0">${escapeHtml(err.message)}</div>`;
      }
    }

    async function loadCourses() {
      const courses = await api('/courses');
      if (!els.coursesList) return;
      if (!courses.length) {
        els.coursesList.innerHTML = `<div class="col-12"><p class="muted-note mb-0">No courses loaded yet.</p></div>`;
        return;
      }
      els.coursesList.innerHTML = courses.map((c) => `
        <div class="col-md-6">
          <div class="metric-card h-100">
            <div class="status-pill mb-3">${escapeHtml(c.subject_area || 'General')}</div>
            <h5>${escapeHtml(c.title)}</h5>
            <p class="muted-note">${escapeHtml(c.description || 'No description yet.')}</p>
            <div class="small text-muted">${escapeHtml(c.grade_level || 'All grade levels')}${c.teacher_name ? ` · ${escapeHtml(c.teacher_name)}` : ''}</div>
          </div>
        </div>
      `).join('');
    }

    async function loadTeachers() {
      const teachers = await api('/teachers');
      if (!els.teachersList) return;
      if (!teachers.length) {
        els.teachersList.innerHTML = `<div class="col-12"><p class="muted-note mb-0">No teacher profiles available yet.</p></div>`;
        return;
      }
      els.teachersList.innerHTML = teachers.map((t) => `
        <div class="col-md-6">
          <div class="metric-card h-100">
            <h5>${escapeHtml(t.display_name || `${t.first_name} ${t.last_name || ''}`.trim())}</h5>
            <p class="mb-1">${escapeHtml(t.subject_specialty || 'Subject specialty not set')}</p>
            <p class="muted-note mb-0">${escapeHtml(t.certification || 'Certification not listed')}</p>
          </div>
        </div>
      `).join('');
    }

    async function searchStandards(subjectArea, gradeLevel) {
      if (!els.standardsResults) return;
      els.standardsResults.innerHTML = `<p class="muted-note">Loading standards…</p>`;
      try {
        const params = new URLSearchParams();
        if (subjectArea) params.set('subjectArea', subjectArea);
        if (gradeLevel)  params.set('gradeLevel',  gradeLevel);
        const standards = await api(`/standards?${params.toString()}`);
        if (!standards.length) {
          els.standardsResults.innerHTML = `<p class="muted-note mb-0">No standards matched that search.</p>`;
          return;
        }
        els.standardsResults.innerHTML = `
          <div class="table-responsive">
            <table class="table table-sm">
              <thead><tr><th>Identifier</th><th>Domain</th><th>Description</th></tr></thead>
              <tbody>
                ${standards.map((s) => `
                  <tr>
                    <td class="fw-semibold" style="color:var(--wba-steel)">${escapeHtml(s.standard_identifier)}</td>
                    <td>${escapeHtml(s.domain || '')}</td>
                    <td>${escapeHtml(s.description || '')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      } catch (err) {
        els.standardsResults.innerHTML = `<div class="alert alert-danger">${escapeHtml(err.message)}</div>`;
      }
    }

    // ════════════════════════════════════════════════════════════════
    //  ADMIN FUNCTIONS
    // ════════════════════════════════════════════════════════════════

    // ── Summary ───────────────────────────────────────────────────────────────
    async function loadAdminSummary() {
      const summary = await api('/admin/summary');

      const byRole   = Object.fromEntries((summary.usersByRole           || []).map((r) => [r.role, r.count]));
      const byStatus = Object.fromEntries((summary.consultationsByStatus || []).map((r) => [r.status, r.count]));
      const openIntake = (byStatus.new || 0) + (byStatus.in_review || 0);

      if (els.adminSummaryCards) {
        els.adminSummaryCards.innerHTML = `
          <div class="summary-card">
            <div class="lbl">Parents</div>
            <div class="val">${byRole.parent || 0}</div>
          </div>
          <div class="summary-card">
            <div class="lbl">Students</div>
            <div class="val">${byRole.student || 0}</div>
          </div>
          <div class="summary-card">
            <div class="lbl">Teachers</div>
            <div class="val">${byRole.teacher || 0}</div>
          </div>
          <div class="summary-card mint">
            <div class="lbl">Open intake</div>
            <div class="val">${openIntake}</div>
          </div>
          <div class="summary-card navy">
            <div class="lbl">Active courses</div>
            <div class="val">${summary.activeCourseCount || 0}</div>
          </div>
          <div class="summary-card" style="border-top-color:var(--wba-cream-deep)">
            <div class="lbl">Admins</div>
            <div class="val" style="color:var(--wba-ink)">${byRole.admin || 0}</div>
          </div>
        `;
      }

      // Recent users panel
      if (els.adminRecentUsers) {
        const users = summary.recentUsers || [];
        els.adminRecentUsers.innerHTML = users.length
          ? users.map((u) => `
              <div class="console-line">
                <span>${escapeHtml(u.email)} <small style="color:var(--wba-body)">(${escapeHtml(u.role)})</small></span>
                <strong class="${u.is_active ? 'mint' : 'muted'}">${u.is_active ? 'Active' : 'Disabled'}</strong>
              </div>
            `).join('')
          : `<p class="muted-note mb-0">No users yet.</p>`;
      }

      // Recent consultations panel
      if (els.adminRecentConsultations) {
        const consultations = summary.recentConsultations || [];
        els.adminRecentConsultations.innerHTML = consultations.length
          ? consultations.map((c) => `
              <div class="console-line">
                <span>${escapeHtml(c.parent_name)}${c.child_name ? ` for <em>${escapeHtml(c.child_name)}</em>` : ''}</span>
                <strong>${escapeHtml(c.status)}</strong>
              </div>
            `).join('')
          : `<p class="muted-note mb-0">No consultations yet.</p>`;
      }
    }

    // ── Consultations ─────────────────────────────────────────────────────────
    async function loadAdminConsultations() {
      if (!els.adminConsultationsList) return;
      const status = els.adminConsultationFilter?.value || '';
      const params = new URLSearchParams({ limit: '50' });
      if (status) params.set('status', status);

      if (els.adminConsultationsStatus) els.adminConsultationsStatus.textContent = 'Loading…';
      const payload       = await api(`/admin/consultations?${params}`);
      const consultations = payload.consultations || [];
      if (els.adminConsultationsStatus) {
        els.adminConsultationsStatus.textContent = `${payload.count || 0} consultation${payload.count === 1 ? '' : 's'} loaded`;
      }

      if (!consultations.length) {
        els.adminConsultationsList.innerHTML = `<p class="muted-note mb-0">No consultations match that filter.</p>`;
        return;
      }

      els.adminConsultationsList.innerHTML = consultations.map((item) => `
        <div class="intake-card">
          <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap">
            <div>
              <h5>${escapeHtml(item.parent_name)}</h5>
              <div class="muted-note">${escapeHtml(item.email)}${item.phone ? ` · ${escapeHtml(item.phone)}` : ''}</div>
              <div class="small mt-1" style="color:var(--wba-body)">
                ${escapeHtml(item.child_name || 'No student name')}
                ${item.child_grade_level ? ` · Grade ${escapeHtml(item.child_grade_level)}` : ''}
                ${item.child_age ? ` · Age ${escapeHtml(String(item.child_age))}` : ''}
              </div>
            </div>
            ${statusPill(item.status)}
          </div>
          <div class="mt-3">
            <div class="mb-1"><strong style="color:var(--wba-ink)">Goals:</strong> ${escapeHtml(item.goals)}</div>
            <div><strong style="color:var(--wba-ink)">Challenges:</strong> ${escapeHtml(item.challenges || 'None provided')}</div>
          </div>
          <div class="d-flex justify-content-between align-items-center gap-3 flex-wrap mt-3 pt-2" style="border-top:1px solid var(--wba-line)">
            <div class="small" style="color:var(--wba-body)">Submitted ${escapeHtml(formatDate(item.created_at))}</div>
            <div class="status-actions">
              <button class="btn btn-sm btn-outline-primary" data-consultation-status="${item.consultation_request_id}" data-next-status="in_review">In Review</button>
              <button class="btn btn-sm btn-outline-primary" data-consultation-status="${item.consultation_request_id}" data-next-status="contacted">Contacted</button>
              <button class="btn btn-sm btn-outline-primary" data-consultation-status="${item.consultation_request_id}" data-next-status="scheduled">Scheduled</button>
              <button class="btn btn-sm btn-outline-primary" data-consultation-status="${item.consultation_request_id}" data-next-status="closed">Close</button>
            </div>
          </div>
        </div>
      `).join('');

      els.adminConsultationsList.querySelectorAll('[data-consultation-status]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id         = btn.getAttribute('data-consultation-status');
          const nextStatus = btn.getAttribute('data-next-status');
          btn.disabled = true;
          try {
            await api(`/admin/consultations/${id}`, { method: 'PATCH', body: JSON.stringify({ status: nextStatus }) });
            await Promise.all([loadAdminSummary(), loadAdminConsultations()]);
          } catch (err) {
            if (els.adminConsultationsStatus) els.adminConsultationsStatus.textContent = err.message;
          } finally {
            btn.disabled = false;
          }
        });
      });
    }

    // ── Users ─────────────────────────────────────────────────────────────────
    async function loadAdminUsers() {
      if (!els.adminUsersList) return;
      const role   = els.adminUserFilter?.value || '';
      const params = new URLSearchParams({ limit: '100' });
      if (role) params.set('role', role);

      if (els.adminUsersStatus) els.adminUsersStatus.textContent = 'Loading…';
      const payload = await api(`/admin/users?${params}`);
      const users   = payload.users || [];
      if (els.adminUsersStatus) {
        els.adminUsersStatus.textContent = `${payload.count || 0} user${payload.count === 1 ? '' : 's'} loaded`;
      }

      if (!users.length) {
        els.adminUsersList.innerHTML = `<p class="muted-note mb-0">No users match that filter.</p>`;
        return;
      }

      els.adminUsersList.innerHTML = users.map((u) => `
        <div class="user-card" id="user-card-${u.user_id}">
          <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap">
            <div>
              <h5>${escapeHtml(u.display_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email)}</h5>
              <div class="muted-note">${escapeHtml(u.email)}</div>
              <div class="small mt-1" style="color:var(--wba-body)">
                ${escapeHtml(u.role)} · Created ${escapeHtml(formatDate(u.created_at))}
                ${u.last_login_at ? ` · Last login ${escapeHtml(formatDate(u.last_login_at))}` : ''}
              </div>
            </div>
            ${statusPill(u.is_active ? 'Active' : 'Disabled')}
          </div>
          <!-- Action row -->
          <div class="d-flex gap-2 flex-wrap mt-3">
            <button class="btn btn-sm btn-outline-primary"
                    data-user-toggle="${u.user_id}"
                    data-next-active="${u.is_active ? 'false' : 'true'}">
              ${u.is_active ? 'Disable' : 'Enable'} user
            </button>
            <button class="btn btn-sm btn-outline-primary"
                    data-reset-toggle="${u.user_id}">
              Reset password
            </button>
          </div>
          <!-- Inline password reset (hidden by default) -->
          <div class="reset-row" id="reset-row-${u.user_id}">
            <input type="password" class="form-control form-control-sm"
                   id="reset-pw-${u.user_id}"
                   placeholder="New password (min 8 chars)"
                   minlength="8">
            <button class="btn btn-sm btn-success"
                    data-reset-submit="${u.user_id}">Set password</button>
            <button class="btn btn-sm btn-outline-primary"
                    data-reset-cancel="${u.user_id}">Cancel</button>
          </div>
        </div>
      `).join('');

      // Enable / disable toggles
      els.adminUsersList.querySelectorAll('[data-user-toggle]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const userId     = btn.getAttribute('data-user-toggle');
          const nextActive = btn.getAttribute('data-next-active') === 'true';
          btn.disabled = true;
          try {
            await api(`/admin/users/${userId}`, { method: 'PATCH', body: JSON.stringify({ isActive: nextActive }) });
            await Promise.all([loadAdminSummary(), loadAdminUsers()]);
          } catch (err) {
            if (els.adminUsersStatus) els.adminUsersStatus.textContent = err.message;
          } finally {
            btn.disabled = false;
          }
        });
      });

      // Password reset — show/hide row
      els.adminUsersList.querySelectorAll('[data-reset-toggle]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const userId   = btn.getAttribute('data-reset-toggle');
          const row      = document.getElementById(`reset-row-${userId}`);
          if (row) row.classList.toggle('open');
        });
      });
      els.adminUsersList.querySelectorAll('[data-reset-cancel]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const userId = btn.getAttribute('data-reset-cancel');
          const row    = document.getElementById(`reset-row-${userId}`);
          if (row) row.classList.remove('open');
        });
      });

      // Password reset — submit
      els.adminUsersList.querySelectorAll('[data-reset-submit]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const userId    = btn.getAttribute('data-reset-submit');
          const pwInput   = document.getElementById(`reset-pw-${userId}`);
          const newPw     = pwInput?.value?.trim();
          const statusEl  = els.adminUsersStatus;

          if (!newPw || newPw.length < 8) {
            if (statusEl) statusEl.textContent = 'Password must be at least 8 characters.';
            return;
          }
          btn.disabled = true;
          try {
            await api(`/admin/users/${userId}/reset-password`, {
              method: 'PATCH',
              body: JSON.stringify({ newPassword: newPw })
            });
            const row = document.getElementById(`reset-row-${userId}`);
            if (row) row.classList.remove('open');
            if (pwInput) pwInput.value = '';
            if (statusEl) statusEl.textContent = 'Password updated successfully.';
          } catch (err) {
            if (statusEl) statusEl.textContent = err.message;
          } finally {
            btn.disabled = false;
          }
        });
      });
    }

    // ── All students (admin-scoped) ───────────────────────────────────────────
    async function loadAdminAllStudents() {
      if (!els.adminStudentsList) return;
      if (els.adminStudentsStatus) els.adminStudentsStatus.textContent = 'Loading…';

      try {
        const payload  = await api('/admin/students');
        const students = payload.students || [];
        if (els.adminStudentsStatus) {
          els.adminStudentsStatus.textContent = `${payload.count || 0} student${payload.count === 1 ? '' : 's'} loaded`;
        }

        if (!students.length) {
          els.adminStudentsList.innerHTML = `<p class="muted-note mb-0">No students in the system yet.</p>`;
          return;
        }

        els.adminStudentsList.innerHTML = students.map((s) => `
          <div class="user-card">
            <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap">
              <div>
                <h5>${escapeHtml(s.display_name || `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.email)}</h5>
                <div class="muted-note">${escapeHtml(s.email)}</div>
                <div class="small mt-1" style="color:var(--wba-body)">
                  ${s.grade_level ? `Grade ${escapeHtml(s.grade_level)}` : 'Grade not set'}
                  ${s.school_name ? ` · ${escapeHtml(s.school_name)}` : ''}
                </div>
                ${s.parent_email ? `
                  <div class="small mt-1" style="color:var(--wba-steel)">
                    Parent: ${escapeHtml(`${s.parent_first_name || ''} ${s.parent_last_name || ''}`.trim() || s.parent_email)}
                    (${escapeHtml(s.parent_email)})
                  </div>
                ` : '<div class="small mt-1" style="color:var(--wba-body)">No parent linked</div>'}
              </div>
              ${statusPill(s.is_active ? 'Active' : 'Disabled')}
            </div>
            <div class="small mt-2" style="color:var(--wba-body)">
              Created ${escapeHtml(formatDate(s.created_at))}
            </div>
          </div>
        `).join('');
      } catch (err) {
        if (els.adminStudentsList) {
          els.adminStudentsList.innerHTML = `<div class="alert alert-danger">${escapeHtml(err.message)}</div>`;
        }
      }
    }

    // ── Admin create user form ────────────────────────────────────────────────
    function wireCreateUserForm() {
      const form = els.adminCreateUserForm;
      if (!form) return;

      // Show / hide role-specific fields when role changes
      if (els.createUserRoleSelect) {
        els.createUserRoleSelect.addEventListener('change', () => {
          const role = els.createUserRoleSelect.value;
          document.querySelectorAll('[data-role-field]').forEach((el) => {
            const show = el.getAttribute('data-role-field') === role;
            el.classList.toggle('d-none', !show);
          });
        });
      }

      // Clear form button
      els.adminCreateUserReset?.addEventListener('click', () => {
        form.reset();
        document.querySelectorAll('[data-role-field]').forEach((el) => el.classList.add('d-none'));
        if (els.createUserStatus) els.createUserStatus.innerHTML = '';
      });

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const fd   = new FormData(form);
        const role = fd.get('role');

        const body = {
          email:     fd.get('email'),
          firstName: fd.get('first_name'),
          lastName:  fd.get('last_name') || undefined,
          role,
          password:  fd.get('password') || undefined,
        };

        // Role-specific extras
        if (role === 'parent') {
          body.phone            = fd.get('phone') || undefined;
          body.preferredContact = fd.get('preferred_contact') || 'email';
        }
        if (role === 'student') {
          body.gradeLevel  = fd.get('grade_level')  || undefined;
          body.parentId    = fd.get('parent_id')    || undefined;
          body.schoolName  = fd.get('school_name')  || undefined;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        try {
          const created = await api('/admin/users', { method: 'POST', body: JSON.stringify(body) });
          if (els.createUserStatus) {
            els.createUserStatus.innerHTML = `
              <div class="alert alert-success mb-0">
                <strong>${escapeHtml(role.charAt(0).toUpperCase() + role.slice(1))} created:</strong>
                ${escapeHtml(created.first_name)} (${escapeHtml(created.email)})
                ${body.password ? '— account can now log in.' : '— no password set yet.'}
              </div>`;
          }
          form.reset();
          document.querySelectorAll('[data-role-field]').forEach((el) => el.classList.add('d-none'));
          // Refresh summary + user list silently
          loadAdminSummary();
          if (document.querySelector('[data-admin-panel="users"]')?.classList.contains('active')) {
            loadAdminUsers();
          }
        } catch (err) {
          if (els.createUserStatus) {
            els.createUserStatus.innerHTML = `<div class="alert alert-danger mb-0">${escapeHtml(err.message)}</div>`;
          }
        } finally {
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    }

    // ── Load role-appropriate data ────────────────────────────────────────────
    async function loadParentExperience() {
      await Promise.all([loadStudents(), loadCourses(), loadTeachers()]);
      await searchStandards('Mathematics', '7');
    }

    async function loadAdminExperience() {
      await Promise.all([loadAdminSummary(), loadAdminConsultations(), loadAdminUsers()]);
    }

    async function loadRoleExperience() {
      if (!authState.user || !getToken()) return;
      return authState.user.role === 'admin' ? loadAdminExperience() : loadParentExperience();
    }

    // ── Event listeners ───────────────────────────────────────────────────────

    els.loginForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(els.loginForm);
      try {
        const payload = await api('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: fd.get('email'), password: fd.get('password') })
        });
        setSession(payload.token, payload.user);
        authState.user = payload.user;
        renderSession();
        await loadRoleExperience();
      } catch (err) {
        if (els.authStatus) {
          els.authStatus.textContent = err.message;
          els.authStatus.className   = 'alert alert-danger mt-3';
        }
      }
    });

    els.registerForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(els.registerForm);
      try {
        const payload = await api('/auth/register-parent', {
          method: 'POST',
          body: JSON.stringify({
            email:            fd.get('email'),
            password:         fd.get('password'),
            firstName:        fd.get('first_name'),
            lastName:         fd.get('last_name'),
            phone:            fd.get('phone'),
            preferredContact: fd.get('preferred_contact')
          })
        });
        setSession(payload.token, payload.user);
        authState.user = payload.user;
        renderSession();
        await loadRoleExperience();
      } catch (err) {
        if (els.authStatus) {
          els.authStatus.textContent = err.message;
          els.authStatus.className   = 'alert alert-danger mt-3';
        }
      }
    });

    els.logout?.addEventListener('click', () => {
      clearSession();
      authState.user = authState.selectedStudentId = null;
      renderSession();
    });

    els.switchAccount?.addEventListener('click', () => {
      clearSession();
      authState.user = authState.selectedStudentId = null;
      renderSession();
    });

    els.studentForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(els.studentForm);
      try {
        const payload = await api('/students', {
          method: 'POST',
          body: JSON.stringify({
            email:       fd.get('email'),
            firstName:   fd.get('first_name'),
            lastName:    fd.get('last_name'),
            displayName: fd.get('display_name'),
            gradeLevel:  fd.get('grade_level'),
            schoolName:  fd.get('school_name'),
            notes:       fd.get('notes')
          })
        });
        if (els.studentStatus) {
          els.studentStatus.innerHTML = `<div class="alert alert-success">Student created: ${escapeHtml(payload.first_name)}</div>`;
        }
        els.studentForm.reset();
        await loadStudents();
      } catch (err) {
        if (els.studentStatus) {
          els.studentStatus.innerHTML = `<div class="alert alert-danger">${escapeHtml(err.message)}</div>`;
        }
      }
    });

    els.standardsForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(els.standardsForm);
      await searchStandards(fd.get('subject_area'), fd.get('grade_level'));
    });

    els.adminConsultationsRefresh?.addEventListener('click', loadAdminConsultations);
    els.adminConsultationFilter?.addEventListener('change', loadAdminConsultations);
    els.adminUsersRefresh?.addEventListener('click', loadAdminUsers);
    els.adminUserFilter?.addEventListener('change', loadAdminUsers);
    els.adminSummaryRefresh?.addEventListener('click', loadAdminSummary);
    els.adminStudentsRefresh?.addEventListener('click', loadAdminAllStudents);

    // Wire create user form
    wireCreateUserForm();

    // ── Boot ──────────────────────────────────────────────────────────────────
    Promise.resolve()
      .then(validateStoredSession)
      .then(() => {
        renderSession();
        if (!authState.user || !getToken()) return;
        return loadRoleExperience();
      })
      .catch((err) => {
        if (els.authStatus) {
          els.authStatus.textContent = err.message;
          els.authStatus.className   = 'alert alert-danger mt-3';
        }
      });
  }

  // ── Init ─────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    bindContactForm();
    bindPortal();
  });
})();
