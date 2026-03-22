(function () {
  const DEFAULT_REMOTE_API = "https://webelieveacademics.com/api/v1";
  const DEFAULT_LOCAL_API = "http://127.0.0.1:4000/api/v1";

  function getApiBase() {
    const override = localStorage.getItem("wbaApiBase");
    if (override) return override;

    const host = window.location.hostname;
    if (host === "127.0.0.1" || host === "localhost" || host === "") {
      return DEFAULT_LOCAL_API;
    }

    return DEFAULT_REMOTE_API;
  }

  const apiBase = getApiBase();
  const tokenKey = "wbaToken";
  const userKey = "wbaUser";

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function formatDate(value) {
    if (!value) return "Unknown";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  }

  function getToken() {
    return localStorage.getItem(tokenKey);
  }

  function setSession(token, user) {
    localStorage.setItem(tokenKey, token);
    localStorage.setItem(userKey, JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
  }

  function getStoredUser() {
    const raw = localStorage.getItem(userKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  async function api(path, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${apiBase}${path}`, {
      ...options,
      headers
    });

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message = typeof payload === "object" && payload?.message
        ? payload.message
        : typeof payload === "object" && payload?.error_description
          ? payload.error_description
          : typeof payload === "string"
            ? payload
            : "Request failed";
      throw new Error(message);
    }

    return payload;
  }

  function bindContactForm() {
    const form = document.querySelector("[data-contact-form]");
    const status = document.querySelector("[data-contact-status]");
    const apiBaseNode = document.querySelector("[data-api-base]");

    if (apiBaseNode) apiBaseNode.textContent = apiBase;
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (status) status.textContent = "Sending...";

      const formData = new FormData(form);
      const payload = {
        parentName: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        childName: formData.get("child_name"),
        childAge: formData.get("child_age"),
        childGradeLevel: formData.get("child_grade_level"),
        goals: formData.get("goals"),
        challenges: formData.get("challenges"),
        sourcePage: "contact"
      };

      try {
        await api("/consultations", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        form.reset();
        if (status) {
          status.textContent = "Consultation request received. We will reach out within 24 hours.";
          status.className = "alert alert-success mt-3";
        }
      } catch (error) {
        if (status) {
          status.textContent = error.message;
          status.className = "alert alert-danger mt-3";
        }
      }
    });
  }

  function bindPortal() {
    const portalRoot = document.querySelector("[data-portal-root]");
    if (!portalRoot) return;

    const authState = {
      user: getStoredUser(),
      selectedStudentId: null
    };

    const els = {
      apiBase: document.querySelector("[data-portal-api-base]"),
      authSection: document.querySelector("[data-auth-section]"),
      sessionShell: document.querySelector("[data-session-shell]"),
      parentSection: document.querySelector("[data-parent-section]"),
      adminSection: document.querySelector("[data-admin-section]"),
      loginForm: document.querySelector("[data-login-form]"),
      registerForm: document.querySelector("[data-register-form]"),
      logout: document.querySelector("[data-logout]"),
      authStatus: document.querySelector("[data-auth-status]"),
      sessionName: document.querySelector("[data-session-name]"),
      sessionRole: document.querySelector("[data-session-role]"),
      createStudentForm: document.querySelector("[data-student-form]"),
      studentStatus: document.querySelector("[data-student-status]"),
      studentsList: document.querySelector("[data-students-list]"),
      studentDashboard: document.querySelector("[data-student-dashboard]"),
      coursesList: document.querySelector("[data-courses-list]"),
      teachersList: document.querySelector("[data-teachers-list]"),
      standardsForm: document.querySelector("[data-standards-form]"),
      standardsResults: document.querySelector("[data-standards-results]"),
      adminSummaryCards: document.querySelector("[data-admin-summary-cards]"),
      adminRecentUsers: document.querySelector("[data-admin-recent-users]"),
      adminRecentConsultations: document.querySelector("[data-admin-recent-consultations]"),
      adminConsultationFilter: document.querySelector("[data-admin-consultation-filter]"),
      adminConsultationsRefresh: document.querySelector("[data-admin-consultations-refresh]"),
      adminConsultationsStatus: document.querySelector("[data-admin-consultations-status]"),
      adminConsultationsList: document.querySelector("[data-admin-consultations-list]"),
      adminUserFilter: document.querySelector("[data-admin-user-filter]"),
      adminUsersRefresh: document.querySelector("[data-admin-users-refresh]"),
      adminUsersStatus: document.querySelector("[data-admin-users-status]"),
      adminUsersList: document.querySelector("[data-admin-users-list]"),
      switchAccount: document.querySelector("[data-switch-account]")
    };

    if (els.apiBase) els.apiBase.textContent = apiBase;

    function renderSession() {
      const user = authState.user;
      const isLoggedIn = Boolean(user && getToken());

      els.authSection?.classList.toggle("hidden", isLoggedIn);
      els.sessionShell?.classList.toggle("hidden", !isLoggedIn);

      if (!isLoggedIn || !user) return;

      const isAdmin = user.role === "admin";
      els.parentSection?.classList.toggle("hidden", isAdmin);
      els.adminSection?.classList.toggle("hidden", !isAdmin);

      if (els.sessionName) {
        els.sessionName.textContent = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || user.email;
      }
      if (els.sessionRole) {
        els.sessionRole.textContent = user.role;
      }
    }

    async function validateStoredSession() {
      if (!authState.user || !getToken()) return;

      try {
        await api("/auth/me");
      } catch {
        clearSession();
        authState.user = null;
        authState.selectedStudentId = null;
      }
    }

    async function loadStudents() {
      const payload = await api("/parents/me/students");
      const students = payload.students || [];

      if (!els.studentsList) return;

      if (!students.length) {
        els.studentsList.innerHTML = `<p class="muted-note mb-0">No students yet. Add one below to begin building a personalized academic plan.</p>`;
        return;
      }

      els.studentsList.innerHTML = students.map((student) => `
        <button class="list-group-item list-group-item-action" data-student-button="${student.user_id}">
          <div class="fw-semibold">${escapeHtml(student.display_name || `${student.first_name} ${student.last_name || ""}`.trim())}</div>
          <div class="small text-muted">${escapeHtml(student.grade_level || "Grade not set")} ${student.school_name ? `• ${escapeHtml(student.school_name)}` : ""}</div>
        </button>
      `).join("");

      els.studentsList.querySelectorAll("[data-student-button]").forEach((button) => {
        button.addEventListener("click", async () => {
          authState.selectedStudentId = button.getAttribute("data-student-button");
          await loadStudentDashboard();
        });
      });

      if (!authState.selectedStudentId && students[0]) {
        authState.selectedStudentId = students[0].user_id;
        await loadStudentDashboard();
      }
    }

    async function loadStudentDashboard() {
      if (!authState.selectedStudentId || !els.studentDashboard) return;
      els.studentDashboard.innerHTML = `<p class="muted-note">Loading student dashboard...</p>`;

      try {
        const data = await api(`/dashboard/student/${authState.selectedStudentId}`);
        const student = data.student;
        const enrollments = data.enrollments || [];
        const grades = data.recentGrades || [];
        const prefs = data.learningPreferences || [];

        els.studentDashboard.innerHTML = `
          <div class="portal-grid">
            <div class="metric-card">
              <div class="small text-uppercase text-muted mb-2">Student</div>
              <div class="metric-value">${escapeHtml(student.first_name)}</div>
              <div>${escapeHtml(student.grade_level || "Grade not set")}${student.school_name ? ` • ${escapeHtml(student.school_name)}` : ""}</div>
            </div>
            <div class="metric-card">
              <div class="small text-uppercase text-muted mb-2">Enrollments</div>
              <div class="metric-value">${enrollments.length}</div>
              <div>${escapeHtml(enrollments.map((item) => item.title).join(", ") || "No active courses yet")}</div>
            </div>
            <div class="metric-card">
              <div class="small text-uppercase text-muted mb-2">Recent Grades</div>
              <div class="metric-value">${grades.length}</div>
              <div>${grades[0] ? `${escapeHtml(grades[0].percentage)}% on ${escapeHtml(grades[0].test_title || grades[0].assignment_type)}` : "No grade data yet"}</div>
            </div>
          </div>
          <div class="table-card mt-4">
            <h4>Learning Preferences</h4>
            <ul class="mb-0">
              ${prefs.length ? prefs.map((pref) => `<li><strong>${escapeHtml(pref.subject_area)}</strong>: ${escapeHtml(pref.best_method_name)}</li>`).join("") : "<li>No learning preference data yet.</li>"}
            </ul>
          </div>
        `;
      } catch (error) {
        els.studentDashboard.innerHTML = `<div class="alert alert-danger">${escapeHtml(error.message)}</div>`;
      }
    }

    async function loadCourses() {
      const courses = await api("/courses");
      if (!els.coursesList) return;
      if (!courses.length) {
        els.coursesList.innerHTML = `<div class="col-12"><p class="muted-note mb-0">No courses are loaded yet.</p></div>`;
        return;
      }
      els.coursesList.innerHTML = courses.map((course) => `
        <div class="col-md-6">
          <div class="metric-card h-100">
            <div class="status-pill mb-3">${escapeHtml(course.subject_area || "General")}</div>
            <h5>${escapeHtml(course.title)}</h5>
            <p class="muted-note">${escapeHtml(course.description || "No description yet.")}</p>
            <div class="small text-muted">${escapeHtml(course.grade_level || "All grade levels")}${course.teacher_name ? ` • ${escapeHtml(course.teacher_name)}` : ""}</div>
          </div>
        </div>
      `).join("");
    }

    async function loadTeachers() {
      const teachers = await api("/teachers");
      if (!els.teachersList) return;
      if (!teachers.length) {
        els.teachersList.innerHTML = `<div class="col-12"><p class="muted-note mb-0">No teacher profiles are available yet.</p></div>`;
        return;
      }
      els.teachersList.innerHTML = teachers.map((teacher) => `
        <div class="col-md-6">
          <div class="metric-card h-100">
            <h5>${escapeHtml(teacher.display_name || `${teacher.first_name} ${teacher.last_name || ""}`.trim())}</h5>
            <p class="mb-1">${escapeHtml(teacher.subject_specialty || "Subject specialty not set")}</p>
            <p class="muted-note mb-0">${escapeHtml(teacher.certification || "Certification not listed")}</p>
          </div>
        </div>
      `).join("");
    }

    async function searchStandards(subjectArea, gradeLevel) {
      if (!els.standardsResults) return;
      els.standardsResults.innerHTML = `<p class="muted-note">Loading standards...</p>`;
      try {
        const params = new URLSearchParams();
        if (subjectArea) params.set("subjectArea", subjectArea);
        if (gradeLevel) params.set("gradeLevel", gradeLevel);
        const standards = await api(`/standards?${params.toString()}`);
        if (!standards.length) {
          els.standardsResults.innerHTML = `<p class="muted-note mb-0">No standards matched that search yet.</p>`;
          return;
        }
        els.standardsResults.innerHTML = `
          <div class="table-responsive">
            <table class="table">
              <thead><tr><th>Identifier</th><th>Domain</th><th>Description</th></tr></thead>
              <tbody>
                ${standards.map((item) => `
                  <tr>
                    <td>${escapeHtml(item.standard_identifier)}</td>
                    <td>${escapeHtml(item.domain || "")}</td>
                    <td>${escapeHtml(item.description || "")}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        `;
      } catch (error) {
        els.standardsResults.innerHTML = `<div class="alert alert-danger">${escapeHtml(error.message)}</div>`;
      }
    }

    function renderAdminSummary(summary) {
      if (!els.adminSummaryCards) return;

      const usersByRole = Object.fromEntries((summary.usersByRole || []).map((row) => [row.role, row.count]));
      const consultationsByStatus = Object.fromEntries((summary.consultationsByStatus || []).map((row) => [row.status, row.count]));

      els.adminSummaryCards.innerHTML = `
        <div class="metric-card">
          <div class="small text-uppercase text-muted mb-2">Parents</div>
          <div class="metric-value">${usersByRole.parent || 0}</div>
          <div class="muted-note">Registered parent accounts</div>
        </div>
        <div class="metric-card">
          <div class="small text-uppercase text-muted mb-2">Students</div>
          <div class="metric-value">${usersByRole.student || 0}</div>
          <div class="muted-note">Student user records</div>
        </div>
        <div class="metric-card">
          <div class="small text-uppercase text-muted mb-2">Open intake</div>
          <div class="metric-value">${(consultationsByStatus.new || 0) + (consultationsByStatus.in_review || 0)}</div>
          <div class="muted-note">New or in-review consultations</div>
        </div>
      `;

      if (els.adminRecentUsers) {
        const users = summary.recentUsers || [];
        els.adminRecentUsers.innerHTML = users.length
          ? users.map((user) => `
              <div class="console-line">
                <span>${escapeHtml(user.email)} <small>(${escapeHtml(user.role)})</small></span>
                <strong>${user.is_active ? "Active" : "Disabled"}</strong>
              </div>
            `).join("")
          : `<p class="muted-note mb-0">No users yet.</p>`;
      }

      if (els.adminRecentConsultations) {
        const consultations = summary.recentConsultations || [];
        els.adminRecentConsultations.innerHTML = consultations.length
          ? consultations.map((item) => `
              <div class="console-line">
                <span>${escapeHtml(item.parent_name)}${item.child_name ? ` for ${escapeHtml(item.child_name)}` : ""}</span>
                <strong>${escapeHtml(item.status)}</strong>
              </div>
            `).join("")
          : `<p class="muted-note mb-0">No consultation requests yet.</p>`;
      }
    }

    async function loadAdminSummary() {
      const summary = await api("/admin/summary");
      renderAdminSummary(summary);
    }

    async function loadAdminConsultations() {
      if (!els.adminConsultationsList) return;

      const status = els.adminConsultationFilter?.value || "";
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      params.set("limit", "50");

      els.adminConsultationsStatus.textContent = "Loading consultation queue...";
      const payload = await api(`/admin/consultations?${params.toString()}`);
      const consultations = payload.consultations || [];
      els.adminConsultationsStatus.textContent = `${payload.count || 0} consultations loaded`;

      if (!consultations.length) {
        els.adminConsultationsList.innerHTML = `<p class="muted-note mb-0">No consultations matched that filter.</p>`;
        return;
      }

      els.adminConsultationsList.innerHTML = consultations.map((item) => `
        <div class="metric-card">
          <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap">
            <div>
              <h5 class="mb-1">${escapeHtml(item.parent_name)}</h5>
              <div class="muted-note">${escapeHtml(item.email)}${item.phone ? ` • ${escapeHtml(item.phone)}` : ""}</div>
              <div class="small text-muted mt-2">${escapeHtml(item.child_name || "No student name")} ${item.child_grade_level ? `• ${escapeHtml(item.child_grade_level)}` : ""}</div>
            </div>
            <div class="status-pill">${escapeHtml(item.status)}</div>
          </div>
          <p class="mt-3 mb-2"><strong>Goals:</strong> ${escapeHtml(item.goals)}</p>
          <p class="mb-3"><strong>Challenges:</strong> ${escapeHtml(item.challenges || "None provided")}</p>
          <div class="d-flex justify-content-between align-items-center gap-3 flex-wrap">
            <div class="small text-muted">Submitted ${escapeHtml(formatDate(item.created_at))}</div>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-primary" data-consultation-status="${item.consultation_request_id}" data-next-status="in_review">Mark In Review</button>
              <button class="btn btn-sm btn-outline-primary" data-consultation-status="${item.consultation_request_id}" data-next-status="contacted">Mark Contacted</button>
              <button class="btn btn-sm btn-outline-primary" data-consultation-status="${item.consultation_request_id}" data-next-status="scheduled">Mark Scheduled</button>
              <button class="btn btn-sm btn-outline-primary" data-consultation-status="${item.consultation_request_id}" data-next-status="closed">Close</button>
            </div>
          </div>
        </div>
      `).join("");

      els.adminConsultationsList.querySelectorAll("[data-consultation-status]").forEach((button) => {
        button.addEventListener("click", async () => {
          const consultationRequestId = button.getAttribute("data-consultation-status");
          const nextStatus = button.getAttribute("data-next-status");
          button.disabled = true;
          try {
            await api(`/admin/consultations/${consultationRequestId}`, {
              method: "PATCH",
              body: JSON.stringify({ status: nextStatus })
            });
            await Promise.all([loadAdminSummary(), loadAdminConsultations()]);
          } catch (error) {
            els.adminConsultationsStatus.textContent = error.message;
          } finally {
            button.disabled = false;
          }
        });
      });
    }

    async function loadAdminUsers() {
      if (!els.adminUsersList) return;

      const role = els.adminUserFilter?.value || "";
      const params = new URLSearchParams();
      if (role) params.set("role", role);
      params.set("limit", "100");

      els.adminUsersStatus.textContent = "Loading users...";
      const payload = await api(`/admin/users?${params.toString()}`);
      const users = payload.users || [];
      els.adminUsersStatus.textContent = `${payload.count || 0} users loaded`;

      if (!users.length) {
        els.adminUsersList.innerHTML = `<p class="muted-note mb-0">No users matched that filter.</p>`;
        return;
      }

      els.adminUsersList.innerHTML = users.map((user) => `
        <div class="metric-card">
          <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap">
            <div>
              <h5 class="mb-1">${escapeHtml(user.display_name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email)}</h5>
              <div class="muted-note">${escapeHtml(user.email)}</div>
              <div class="small text-muted mt-2">${escapeHtml(user.role)} • Created ${escapeHtml(formatDate(user.created_at))}${user.last_login_at ? ` • Last login ${escapeHtml(formatDate(user.last_login_at))}` : ""}</div>
            </div>
            <div class="status-pill">${user.is_active ? "Active" : "Disabled"}</div>
          </div>
          <div class="d-flex justify-content-end mt-3">
            <button class="btn btn-sm btn-outline-primary" data-user-toggle="${user.user_id}" data-next-active="${user.is_active ? "false" : "true"}">
              ${user.is_active ? "Disable user" : "Enable user"}
            </button>
          </div>
        </div>
      `).join("");

      els.adminUsersList.querySelectorAll("[data-user-toggle]").forEach((button) => {
        button.addEventListener("click", async () => {
          const userId = button.getAttribute("data-user-toggle");
          const nextActive = button.getAttribute("data-next-active") === "true";
          button.disabled = true;
          try {
            await api(`/admin/users/${userId}`, {
              method: "PATCH",
              body: JSON.stringify({ isActive: nextActive })
            });
            await Promise.all([loadAdminSummary(), loadAdminUsers()]);
          } catch (error) {
            els.adminUsersStatus.textContent = error.message;
          } finally {
            button.disabled = false;
          }
        });
      });
    }

    async function loadParentExperience() {
      await Promise.all([loadStudents(), loadCourses(), loadTeachers()]);
      await searchStandards("Mathematics", "7");
    }

    async function loadAdminExperience() {
      await Promise.all([loadAdminSummary(), loadAdminUsers(), loadAdminConsultations()]);
    }

    async function loadRoleExperience() {
      if (!authState.user || !getToken()) return;
      if (authState.user.role === "admin") {
        await loadAdminExperience();
        return;
      }
      await loadParentExperience();
    }

    els.loginForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(els.loginForm);
      try {
        const payload = await api("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email: formData.get("email"),
            password: formData.get("password")
          })
        });
        setSession(payload.token, payload.user);
        authState.user = payload.user;
        if (els.authStatus) {
          els.authStatus.textContent = `Login successful as ${payload.user.role}.`;
          els.authStatus.className = "alert alert-success mt-3";
        }
        renderSession();
        await loadRoleExperience();
      } catch (error) {
        if (els.authStatus) {
          els.authStatus.textContent = error.message;
          els.authStatus.className = "alert alert-danger mt-3";
        }
      }
    });

    els.registerForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(els.registerForm);
      try {
        const payload = await api("/auth/register-parent", {
          method: "POST",
          body: JSON.stringify({
            email: formData.get("email"),
            password: formData.get("password"),
            firstName: formData.get("first_name"),
            lastName: formData.get("last_name"),
            phone: formData.get("phone"),
            preferredContact: formData.get("preferred_contact")
          })
        });
        setSession(payload.token, payload.user);
        authState.user = payload.user;
        if (els.authStatus) {
          els.authStatus.textContent = "Account created and logged in.";
          els.authStatus.className = "alert alert-success mt-3";
        }
        renderSession();
        await loadRoleExperience();
      } catch (error) {
        if (els.authStatus) {
          els.authStatus.textContent = error.message;
          els.authStatus.className = "alert alert-danger mt-3";
        }
      }
    });

    els.logout?.addEventListener("click", () => {
      clearSession();
      authState.user = null;
      authState.selectedStudentId = null;
      renderSession();
    });

    els.switchAccount?.addEventListener("click", () => {
      clearSession();
      authState.user = null;
      authState.selectedStudentId = null;
      renderSession();
    });

    els.createStudentForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(els.createStudentForm);

      try {
        const payload = await api("/students", {
          method: "POST",
          body: JSON.stringify({
            email: formData.get("email"),
            firstName: formData.get("first_name"),
            lastName: formData.get("last_name"),
            displayName: formData.get("display_name"),
            gradeLevel: formData.get("grade_level"),
            schoolName: formData.get("school_name"),
            notes: formData.get("notes")
          })
        });
        if (els.studentStatus) {
          els.studentStatus.textContent = `Student created: ${payload.first_name}`;
          els.studentStatus.className = "alert alert-success mt-3";
        }
        els.createStudentForm.reset();
        await loadStudents();
      } catch (error) {
        if (els.studentStatus) {
          els.studentStatus.textContent = error.message;
          els.studentStatus.className = "alert alert-danger mt-3";
        }
      }
    });

    els.standardsForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(els.standardsForm);
      await searchStandards(formData.get("subject_area"), formData.get("grade_level"));
    });

    els.adminConsultationsRefresh?.addEventListener("click", async () => {
      await loadAdminConsultations();
    });

    els.adminUsersRefresh?.addEventListener("click", async () => {
      await loadAdminUsers();
    });

    Promise.resolve()
      .then(validateStoredSession)
      .then(() => {
        renderSession();
        if (!authState.user || !getToken()) return;
        return loadRoleExperience();
      })
      .catch((error) => {
        if (els.authStatus) {
          els.authStatus.textContent = error.message;
          els.authStatus.className = "alert alert-danger mt-3";
        }
      });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindContactForm();
    bindPortal();
  });
})();
