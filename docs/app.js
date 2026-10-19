(function () {
  "use strict";

  const STORE = "relieflink-data-v1";
  const app = document.getElementById("app");
  const skillOptions = ["Medical / First aid", "Search & rescue", "Delivery & logistics", "Teaching / counselling", "Other"];
  let session = readSession();

  function readData() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORE) || "{}");
      return { users: Array.isArray(parsed.users) ? parsed.users : [], requests: Array.isArray(parsed.requests) ? parsed.requests : [] };
    } catch (error) {
      console.error("Unable to read ReliefLink data from local storage.", error);
      return { users: [], requests: [] };
    }
  }

  function saveData(data) {
    try {
      localStorage.setItem(STORE, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Unable to save ReliefLink data to local storage.", error);
      toast("Could not save your changes. Check browser storage permissions.", true);
      return false;
    }
  }

  function readSession() {
    try { return JSON.parse(localStorage.getItem("relieflink-session-v1") || "null"); }
    catch (error) { console.error("Unable to read the saved session.", error); return null; }
  }

  function saveSession(value) {
    try {
      if (value) localStorage.setItem("relieflink-session-v1", JSON.stringify(value));
      else localStorage.removeItem("relieflink-session-v1");
      session = value;
      return true;
    } catch (error) {
      console.error("Unable to save the session.", error);
      toast("Could not save your session. Check browser storage permissions.", true);
      return false;
    }
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  }

  function toast(message, error) {
    const region = document.getElementById("toast-region");
    if (!region) return;
    const item = document.createElement("div");
    item.className = "toast" + (error ? " error" : "");
    item.textContent = message;
    region.appendChild(item);
    window.setTimeout(() => item.remove(), 4200);
  }

  function icon(name) {
    const paths = {
      bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
      people: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
      grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>'
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths[name] + "</svg>";
  }

  function brand() {
    return '<div class="brand"><span class="brand-mark">R</span><span>RELIEFLINK</span></div>';
  }

  function landing() {
    app.innerHTML = '<section class="landing"><div class="landing-inner">' +
      '<div class="brandline"><span class="brand-dot"></span> RELIEFLINK · AI DISASTER RESPONSE</div>' +
      '<h1 class="hero-title">When disaster strikes,<em>we respond.</em></h1>' +
      '<p class="hero-subtitle">Choose how you want to connect with our relief network.</p>' +
      '<div class="role-list">' +
      '<button class="role-card" data-action="help"><span class="role-icon">' + icon("bell") + '</span><span class="role-copy"><span class="role-kicker">Affected Person</span><span class="role-name">I Need Help</span><span class="role-detail">Send SOS · Find shelter · AI guidance</span></span><span class="role-arrow">›</span></button>' +
      '<button class="role-card volunteer" data-action="volunteer"><span class="role-icon">' + icon("people") + '</span><span class="role-copy"><span class="role-kicker">Community Hero</span><span class="role-name">I Want to Volunteer</span><span class="role-detail">Join the network · Get matched · Save lives</span></span><span class="role-arrow">›</span></button>' +
      '<button class="role-card admin" data-action="admin"><span class="role-icon">' + icon("grid") + '</span><span class="role-copy"><span class="role-kicker">Command Center</span><span class="role-name">Admin / Manager</span><span class="role-detail">Dashboard · Assign volunteers · Monitor</span></span><span class="role-arrow">›</span></button>' +
      '</div><p class="landing-foot">A community-powered network for when every minute matters.</p></div></section>';
    app.querySelectorAll("[data-action]").forEach(button => button.addEventListener("click", () => openFlow(button.dataset.action)));
  }

  function shell(title, intro, content, opts) {
    const actions = opts && opts.session
      ? '<div class="top-actions"><div class="profile-chip"><span class="avatar">' + esc((session.name || "A").charAt(0).toUpperCase()) + '</span><span>' + esc(session.name || session.email || "Admin") + '</span></div><button class="button secondary small" data-action="logout">Sign out</button></div>'
      : '<button class="button secondary small" data-action="home">Back to home</button>';
    app.innerHTML = '<section class="screen"><header class="topbar">' + brand() + actions + '</header><div class="page-content"><p class="eyebrow">' + esc(opts && opts.eyebrow || "ReliefLink · Community response") + '</p><h1 class="page-title">' + esc(title) + '</h1><p class="page-intro">' + esc(intro) + '</p>' + content + '</div></section>';
    app.querySelectorAll('[data-action="home"]').forEach(el => el.addEventListener("click", landing));
    app.querySelectorAll('[data-action="logout"]').forEach(el => el.addEventListener("click", () => { saveSession(null); landing(); }));
  }

  function openFlow(type) {
    if (type === "help") helpForm();
    if (type === "volunteer") volunteerForm();
    if (type === "admin") adminForm();
  }

  function loginLink(role) {
    return '<p class="form-footer">' + (role === "volunteer" ? 'Already have an account? <button class="text-button" data-action="login-volunteer">Sign in</button> · Need help yourself? <button class="text-button" data-action="go-help">Ask for help</button>' : 'Want to help others? <button class="text-button" data-action="go-volunteer">Volunteer</button> · <button class="text-button" data-action="go-login">Have an account? Sign in</button>') + '</p>';
  }

  function bindLinks() {
    app.querySelectorAll('[data-action="go-help"]').forEach(el => el.addEventListener("click", helpForm));
    app.querySelectorAll('[data-action="go-volunteer"]').forEach(el => el.addEventListener("click", volunteerForm));
    app.querySelectorAll('[data-action="go-login"]').forEach(el => el.addEventListener("click", () => personLogin("help")));
    app.querySelectorAll('[data-action="login-volunteer"]').forEach(el => el.addEventListener("click", () => personLogin("volunteer")));
  }

  function helpForm() {
    const content = '<div class="panel"><div class="panel-title"><h2>Tell us what you need</h2><span class="badge urgent">SOS support</span></div><form id="help-form">' +
      '<div class="form-grid">' +
      '<div class="field"><label for="name">Full name</label><input id="name" name="name" placeholder="Your full name" autocomplete="name" required></div>' +
      '<div class="field"><label for="phone">Phone / WhatsApp</label><input id="phone" name="phone" placeholder="03001234567" inputmode="tel" autocomplete="tel" required></div>' +
      '<div class="field"><label for="city">Area / City</label><input id="city" name="city" placeholder="Your location" autocomplete="address-level2" required></div>' +
      '<div class="field"><label for="password">Password</label><input id="password" name="password" type="password" placeholder="At least 6 characters" minlength="6" autocomplete="new-password" required></div>' +
      '<div class="field"><label for="confirm">Confirm password</label><input id="confirm" name="confirm" type="password" placeholder="Re-enter password" minlength="6" autocomplete="new-password" required></div>' +
      '<label class="check-row field full"><input type="checkbox" name="urgent"> Mark this request as urgent</label>' +
      '<div class="field full"><label for="need">What do you need help with?</label><textarea id="need" name="need" placeholder="Tell us briefly what happened and what kind of help you need" required></textarea><button class="button secondary small triage-button" type="button" data-analyze>✦ Analyze needs with AI</button><div id="triage-result" class="triage-result hidden" aria-live="polite"></div></div>' +
      '</div><button class="button wide form-submit" type="submit">Create account &amp; send request</button><p class="note">A nearby volunteer can contact you using the number you provide. If you are in immediate danger, contact your local emergency services too.</p></form>' + loginLink("help") + '</div>';
    shell("Tell us what you need.", "A trained volunteer near you will be in touch as soon as possible.", content, { eyebrow: "Affected person · Request help" });
    bindLinks();
    bindTriage();
    document.getElementById("help-form").addEventListener("submit", createHelpAccount);
  }

  function bindTriage() {
    const button = app.querySelector("[data-analyze]");
    if (!button) return;
    button.addEventListener("click", () => {
      const text = document.getElementById("need").value.trim();
      if (text.length < 8) { toast("Add a few details so the AI can suggest the right response.", true); return; }
      if (!window.ReliefTriage) { toast("The triage model could not load. Refresh and try again.", true); return; }
      showTriage(window.ReliefTriage.classify(text), "triage-result");
    });
  }

  function showTriage(result, elementId) {
    const target = document.getElementById(elementId);
    if (!target) return;
    const priorityClass = result.priority === "critical" || result.priority === "urgent" ? " urgent" : "";
    const priorityLabel = result.priority === "critical" ? "Immediate attention" : result.priority === "urgent" ? "Priority review" : "Standard review";
    const alternatives = result.alternatives.length ? '<div class="triage-alt">Also considered: ' + result.alternatives.map(item => esc(item.label) + " (" + item.confidence + "%)").join(" · ") + "</div>" : "";
    const signals = result.prioritySignals.length ? '<div class="triage-signals">Safety terms detected: ' + esc(result.prioritySignals.join(", ")) + "</div>" : "";
    target.innerHTML = '<div class="triage-head"><span class="triage-spark">✦</span><strong>AI triage suggestion</strong><span class="badge' + priorityClass + '">' + esc(priorityLabel) + '</span></div>' +
      '<div class="triage-category">' + esc(result.label) + ' <span>' + result.confidence + '% match</span></div>' +
      '<p>' + esc(result.advice) + '</p>' +
      (result.evidence.length ? '<div class="triage-evidence">Signals: ' + result.evidence.map(esc).join(" · ") + "</div>" : "") +
      alternatives + signals +
      '<div class="triage-disclaimer">Decision support only — a trained human responder must review every request. For immediate danger, contact local emergency services. Your description is analyzed on this device and is not sent to an AI service.</div>';
    target.classList.remove("hidden");
  }

  function volunteerForm() {
    const options = skillOptions.map(skill => '<option value="' + esc(skill) + '">' + esc(skill) + "</option>").join("");
    const content = '<div class="panel"><div class="panel-title"><h2>Join the volunteer network</h2><span class="badge">Community hero</span></div><form id="volunteer-form">' +
      '<div class="form-grid"><div class="field"><label for="name">Full name</label><input id="name" name="name" placeholder="Your full name" autocomplete="name" required></div>' +
      '<div class="field"><label for="phone">Phone / WhatsApp</label><input id="phone" name="phone" placeholder="03001234567" inputmode="tel" autocomplete="tel" required></div>' +
      '<div class="field"><label for="city">Area / City</label><input id="city" name="city" placeholder="Where are you based?" required></div>' +
      '<div class="field"><label for="skill">How can you help?</label><select id="skill" name="skill" required><option value="" disabled selected>Choose a skill…</option>' + options + '</select></div>' +
      '<div class="field"><label for="password">Password</label><input id="password" name="password" type="password" placeholder="At least 6 characters" minlength="6" autocomplete="new-password" required></div>' +
      '<div class="field"><label for="confirm">Confirm password</label><input id="confirm" name="confirm" type="password" placeholder="Re-enter password" minlength="6" autocomplete="new-password" required></div>' +
      '<label class="check-row field full"><input type="checkbox" name="weekends"> Available weekends only</label></div>' +
      '<button class="button wide form-submit" type="submit">Register as volunteer</button></form>' + loginLink("volunteer") + '</div>';
    shell("Lend a hand.", "We match you with people who need your skills, close to you.", content, { eyebrow: "Community hero · Volunteer" });
    bindLinks();
    document.getElementById("volunteer-form").addEventListener("submit", createVolunteer);
  }

  function adminForm() {
    const content = '<div class="panel"><div class="panel-title"><h2>Admin sign in</h2><span class="badge">Command center</span></div><form id="admin-form"><div class="form-grid">' +
      '<div class="field full"><label for="email">Admin email</label><input id="email" name="email" type="email" placeholder="admin@relieflink.pk" autocomplete="username" required></div>' +
      '<div class="field full"><label for="password">Password</label><input id="password" name="password" type="password" placeholder="Enter password" autocomplete="current-password" required></div>' +
      '<label class="check-row field full"><input type="checkbox" name="remember" checked> Keep me signed in</label>' +
      '</div><button class="button wide form-submit" type="submit">Sign in to dashboard</button></form><p class="note">Demo admin access: <strong>admin@relieflink.pk</strong> / <strong>relief123</strong>. This local prototype stores data only in this browser.</p></div>';
    shell("Welcome back.", "Review live requests and coordinate your response teams.", content, { eyebrow: "Command center · Admin" });
    document.getElementById("admin-form").addEventListener("submit", event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      if (String(form.get("email")).trim().toLowerCase() !== "admin@relieflink.pk" || form.get("password") !== "relief123") {
        toast("Email or password is incorrect.", true);
        return;
      }
      if (saveSession({ role: "admin", email: "admin@relieflink.pk", name: "ReliefLink Admin" })) dashboard();
    });
  }

  function personLogin(role) {
    const roleLabel = role === "volunteer" ? "Volunteer" : "ReliefLink";
    const content = '<div class="panel"><div class="panel-title"><h2>Sign in to your account</h2><span class="badge">' + roleLabel + '</span></div><form id="login-form"><div class="form-grid">' +
      '<div class="field full"><label for="phone">Mobile number</label><input id="phone" name="phone" placeholder="03001234567" inputmode="tel" autocomplete="username" required></div>' +
      '<div class="field full"><label for="password">Password</label><input id="password" name="password" type="password" placeholder="Your password" autocomplete="current-password" required></div>' +
      '</div><button class="button wide form-submit" type="submit">Sign in</button></form><p class="form-footer"><button class="text-button" data-action="go-help">Create help account</button> · <button class="text-button" data-action="go-volunteer">Join as volunteer</button></p></div>';
    shell("Welcome back.", "Sign in with your mobile number and password to track your request status.", content, { eyebrow: "ReliefLink account · Sign in" });
    bindLinks();
    document.getElementById("login-form").addEventListener("submit", async event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const user = readData().users.find(entry => entry.phone === cleanPhone(form.get("phone")) && entry.role === role);
      if (!user) { toast("We couldn't find that account. Check your details and account type.", true); return; }
      try {
        if (!(await verifyPassword(String(form.get("password") || ""), user))) { toast("We couldn't find that account. Check your details and account type.", true); return; }
      } catch (error) {
        console.error("Unable to verify account credentials.", error);
        toast("Secure sign-in is unavailable in this browser. Open the app on HTTPS or localhost.", true);
        return;
      }
      if (saveSession({ role: user.role, phone: user.phone, name: user.name })) dashboard();
    });
  }

  function cleanPhone(phone) { return String(phone || "").replace(/[^\d+]/g, ""); }

  function formUser(formData, role) {
    return { id: newId(), role, name: String(formData.get("name") || "").trim(), phone: cleanPhone(formData.get("phone")), city: String(formData.get("city") || "").trim(), skill: role === "volunteer" ? String(formData.get("skill") || "") : "", weekends: formData.get("weekends") === "on" };
  }

  async function hashPassword(password, salt) {
    if (!window.crypto || !window.crypto.subtle) throw new Error("Web Crypto is unavailable.");
    const saltBytes = salt ? Uint8Array.from(salt.match(/.{2}/g), byte => parseInt(byte, 16)) : window.crypto.getRandomValues(new Uint8Array(16));
    const key = await window.crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await window.crypto.subtle.deriveBits({ name: "PBKDF2", salt: saltBytes, iterations: 120000, hash: "SHA-256" }, key, 256);
    const hash = Array.from(new Uint8Array(bits), byte => byte.toString(16).padStart(2, "0")).join("");
    return { salt: Array.from(saltBytes, byte => byte.toString(16).padStart(2, "0")).join(""), hash };
  }

  async function verifyPassword(password, user) {
    if (!user.passwordSalt || !user.passwordHash) return false;
    const result = await hashPassword(password, user.passwordSalt);
    return result.hash === user.passwordHash;
  }

  function passwordMatches(form) {
    if (form.get("password") !== form.get("confirm")) { toast("Your passwords don't match.", true); return false; }
    if (String(form.get("password") || "").length < 6) { toast("Use a password with at least 6 characters.", true); return false; }
    return true;
  }

  function accountExists(data, user) {
    return data.users.some(item => item.phone === user.phone);
  }

  async function createHelpAccount(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (!passwordMatches(form)) return;
    const user = formUser(form, "help");
    if (!user.phone || !user.name || !user.city) { toast("Please fill in all required details.", true); return; }
    const data = readData();
    if (accountExists(data, user)) { toast("An account with this phone already exists. Please sign in.", true); return; }
    try {
      const credentials = await hashPassword(String(form.get("password") || ""));
      user.passwordSalt = credentials.salt;
      user.passwordHash = credentials.hash;
    } catch (error) {
      console.error("Unable to securely create the account.", error);
      toast("Secure account creation requires HTTPS or localhost in a modern browser.", true);
      return;
    }
    const triage = window.ReliefTriage.classify(String(form.get("need") || ""));
    const request = { id: newId(), userId: user.id, name: user.name, phone: user.phone, city: user.city, need: String(form.get("need") || "").trim(), urgent: form.get("urgent") === "on" || triage.priority === "critical" || triage.priority === "urgent", triage, status: "open", createdAt: new Date().toISOString(), volunteerId: null };
    data.users.push(user);
    data.requests.unshift(request);
    if (saveData(data) && saveSession({ role: "help", phone: user.phone, name: user.name })) { toast("Your help request has been sent."); dashboard(); }
  }

  async function createVolunteer(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (!passwordMatches(form)) return;
    const user = formUser(form, "volunteer");
    if (!user.phone || !user.name || !user.city || !user.skill) { toast("Please fill in all required details.", true); return; }
    const data = readData();
    if (accountExists(data, user)) { toast("An account with this phone already exists. Please sign in.", true); return; }
    try {
      const credentials = await hashPassword(String(form.get("password") || ""));
      user.passwordSalt = credentials.salt;
      user.passwordHash = credentials.hash;
    } catch (error) {
      console.error("Unable to securely create the volunteer account.", error);
      toast("Secure account creation requires HTTPS or localhost in a modern browser.", true);
      return;
    }
    data.users.push(user);
    if (saveData(data) && saveSession({ role: "volunteer", phone: user.phone, name: user.name })) { toast("Welcome to the volunteer network."); dashboard(); }
  }

  function newId() { return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2); }

  function dateLabel(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  }

  function requestCard(request, action, users) {
    const volunteer = users.find(user => user.id === request.volunteerId);
    const status = request.status === "resolved" ? "Resolved" : request.status === "assigned" ? "Assigned" : "Open";
    let actions = "";
    if (action === "admin" && request.status !== "resolved") {
      const volunteers = users.filter(user => user.role === "volunteer");
      const select = '<select aria-label="Choose volunteer" data-assign-select="' + esc(request.id) + '" style="min-height:34px;padding:6px 8px;border:1px solid #dce5df;border-radius:8px;font:12px DM Sans">' +
        '<option value="">Assign volunteer…</option>' + volunteers.map(user => '<option value="' + esc(user.id) + '"' + (user.id === request.volunteerId ? " selected" : "") + ">" + esc(user.name + " · " + user.city) + "</option>").join("") + "</select>";
      actions = select + ' <button class="button small" data-assign="' + esc(request.id) + '">Save</button>';
    } else if (action === "volunteer" && request.status === "open") {
      actions = '<button class="button small" data-accept="' + esc(request.id) + '">Accept request</button>';
    } else if (action === "volunteer" && request.status === "assigned" && request.volunteerId === (users.find(user => user.phone === session.phone) || {}).id) {
      actions = '<button class="button small" data-resolve="' + esc(request.id) + '">Mark resolved</button>';
    }
    const triage = request.triage ? '<div class="request-triage"><span class="badge">' + esc(request.triage.label) + '</span><span>' + request.triage.confidence + '% AI match</span></div><p class="triage-advice">' + esc(request.triage.advice) + '</p>' : "";
    return '<article class="request-card"><div class="request-top"><div><h3>' + esc(request.need || "Help request") + '</h3><p>' + esc(request.name) + ' · ' + esc(request.city) + '</p></div><span class="badge ' + (request.urgent ? "urgent" : request.status === "open" ? "open" : request.status === "assigned" ? "assigned" : "") + '">' + (request.urgent ? "Urgent · " : "") + status + '</span></div><div class="request-meta"><span>☎ ' + esc(request.phone) + '</span><span>◷ ' + esc(dateLabel(request.createdAt)) + '</span>' + (volunteer ? '<span>Volunteer: ' + esc(volunteer.name) + '</span>' : "") + '</div>' + triage + (actions ? '<div style="display:flex;justify-content:flex-end;align-items:center;gap:7px;margin-top:13px">' + actions + '</div>' : "") + '</article>';
  }

  function dashboard() {
    if (!session) { landing(); return; }
    const data = readData();
    if (session.role === "admin") return adminDashboard(data);
    const user = data.users.find(entry => entry.phone === session.phone && entry.role === session.role);
    if (!user) { saveSession(null); toast("Your account could not be found. Please sign in again.", true); landing(); return; }
    session.name = user.name;
    if (session.role === "help") helpDashboard(data, user);
    else volunteerDashboard(data, user);
  }

  function helpDashboard(data, user) {
    const requests = data.requests.filter(request => request.userId === user.id);
    const open = requests.filter(request => request.status === "open").length;
    const cards = requests.length ? requests.map(request => requestCard(request, "help", data.users)).join("") : '<div class="empty"><strong>No requests yet</strong>Your help requests will appear here.</div>';
    const content = '<div class="stats"><div class="stat"><strong>' + requests.length + '</strong><span>Total requests</span></div><div class="stat"><strong>' + open + '</strong><span>Awaiting volunteer</span></div><div class="stat"><strong>' + requests.filter(request => request.status === "resolved").length + '</strong><span>Resolved</span></div></div>' +
      '<div class="panel"><div class="panel-title"><h2>Your requests</h2><button class="button small" data-action="new-request">+ New request</button></div><div class="request-list">' + cards + '</div></div>';
    shell("Your requests, in one place.", "Track your request and stay connected with your response team.", content, { session: true, eyebrow: "Affected person · My dashboard" });
    app.querySelector('[data-action="new-request"]').addEventListener("click", () => newRequestForm(user));
  }

  function newRequestForm(user) {
    const content = '<div class="panel"><div class="panel-title"><h2>Send a new help request</h2></div><form id="request-form"><div class="form-grid">' +
      '<div class="field"><label for="city">Area / City</label><input id="city" name="city" value="' + esc(user.city) + '" required></div><div class="field"><label for="phone">Contact number</label><input id="phone" name="phone" value="' + esc(user.phone) + '" required></div>' +
      '<div class="field full"><label for="need">What do you need?</label><textarea id="need" name="need" placeholder="Describe what kind of support you need" required></textarea></div><label class="check-row field full"><input type="checkbox" name="urgent"> Mark as urgent</label></div><button class="button wide form-submit">Send request</button></form></div>';
    shell("Ask for help.", "Describe what you need and our response network will be notified.", content, { session: true, eyebrow: "Affected person · New request" });
    document.getElementById("request-form").addEventListener("submit", event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const data = readData();
      const need = String(form.get("need")).trim();
      const triage = window.ReliefTriage.classify(need);
      data.requests.unshift({ id: newId(), userId: user.id, name: user.name, phone: cleanPhone(form.get("phone")), city: String(form.get("city")).trim(), need, urgent: form.get("urgent") === "on" || triage.priority === "critical" || triage.priority === "urgent", triage, status: "open", createdAt: new Date().toISOString(), volunteerId: null });
      if (saveData(data)) { toast("Your request has been sent."); dashboard(); }
    });
  }

  function volunteerDashboard(data, user) {
    const assigned = data.requests.filter(request => request.volunteerId === user.id && request.status !== "resolved");
    const available = data.requests.filter(request => request.status === "open");
    const list = assigned.concat(available.filter(request => !assigned.some(item => item.id === request.id)));
    const cards = list.length ? list.map(request => requestCard(request, "volunteer", data.users)).join("") : '<div class="empty"><strong>All clear for now</strong>New requests in your network will show up here.</div>';
    const done = data.requests.filter(request => request.volunteerId === user.id && request.status === "resolved").length;
    const content = '<div class="stats"><div class="stat"><strong>' + available.length + '</strong><span>Open requests</span></div><div class="stat"><strong>' + assigned.length + '</strong><span>Your active matches</span></div><div class="stat"><strong>' + done + '</strong><span>Helped so far</span></div></div>' +
      '<div class="panel"><div class="panel-title"><h2>Requests near you</h2><span class="badge">' + esc(user.skill) + '</span></div><p class="note">Please contact the person directly after accepting a request. Share updates with the local response team where appropriate.</p><div class="request-list" style="margin-top:15px">' + cards + '</div></div>';
    shell("Your help can make a difference.", "See community requests and choose where you can lend a hand.", content, { session: true, eyebrow: "Community hero · Volunteer dashboard" });
    app.querySelectorAll("[data-accept]").forEach(button => button.addEventListener("click", () => updateRequest(button.dataset.accept, request => { request.status = "assigned"; request.volunteerId = user.id; }, "Request accepted. Please contact the person directly.")));
    app.querySelectorAll("[data-resolve]").forEach(button => button.addEventListener("click", () => updateRequest(button.dataset.resolve, request => { request.status = "resolved"; }, "Request marked as resolved.")));
  }

  function adminDashboard(data) {
    const all = data.requests;
    const volunteers = data.users.filter(user => user.role === "volunteer");
    const open = all.filter(request => request.status === "open");
    const content = '<div class="stats"><div class="stat"><strong>' + all.length + '</strong><span>Total requests</span></div><div class="stat"><strong>' + open.length + '</strong><span>Needs assignment</span></div><div class="stat"><strong>' + volunteers.length + '</strong><span>Registered volunteers</span></div></div>' +
      '<div class="tabs"><button class="tab active" data-filter="all">All requests (' + all.length + ')</button><button class="tab" data-filter="open">Open (' + open.length + ')</button><button class="tab" data-filter="assigned">Assigned</button><button class="tab" data-filter="resolved">Resolved</button></div>' +
      '<div class="panel"><div class="panel-title"><h2>Response requests</h2><span class="badge">' + all.length + ' total</span></div><div id="admin-requests" class="request-list">' + (all.length ? all.map(request => requestCard(request, "admin", data.users)).join("") : '<div class="empty"><strong>No requests yet</strong>New community requests will appear here.</div>') + '</div></div>' +
      '<div class="section-head"><h2>Volunteer network</h2><span class="badge">' + volunteers.length + ' registered</span></div>' +
      '<div class="panel"><div class="request-list">' + (volunteers.length ? volunteers.map(volunteer => '<article class="request-card"><div class="request-top"><div><h3>' + esc(volunteer.name) + '</h3><p>' + esc(volunteer.city) + ' · ' + esc(volunteer.skill) + '</p></div><span class="badge">' + (volunteer.weekends ? "Weekends" : "Available") + '</span></div><div class="request-meta"><span>☎ ' + esc(volunteer.phone) + '</span></div></article>').join("") : '<div class="empty"><strong>No volunteers registered yet</strong>Volunteer registrations appear here.</div>') + '</div></div>';
    shell("Command center.", "Monitor community needs, coordinate volunteers, and follow response progress.", content, { session: true, eyebrow: "ReliefLink · Admin dashboard" });
    app.querySelectorAll("[data-assign]").forEach(button => button.addEventListener("click", () => {
      const select = app.querySelector('[data-assign-select="' + CSS.escape(button.dataset.assign) + '"]');
      if (!select || !select.value) { toast("Choose a volunteer to assign.", true); return; }
      updateRequest(button.dataset.assign, request => { request.status = "assigned"; request.volunteerId = select.value; }, "Volunteer assigned successfully.");
    }));
    app.querySelectorAll("[data-filter]").forEach(button => button.addEventListener("click", () => {
      app.querySelectorAll(".tab").forEach(tab => tab.classList.toggle("active", tab === button));
      const filtered = button.dataset.filter === "all" ? all : all.filter(request => request.status === button.dataset.filter);
      const list = document.getElementById("admin-requests");
      list.innerHTML = filtered.length ? filtered.map(request => requestCard(request, "admin", data.users)).join("") : '<div class="empty"><strong>No ' + esc(button.dataset.filter) + ' requests</strong>Requests in this category will show here.</div>';
      bindAdminAssignments();
    }));
  }

  function bindAdminAssignments() {
    app.querySelectorAll("[data-assign]").forEach(button => button.addEventListener("click", () => {
      const select = app.querySelector('[data-assign-select="' + CSS.escape(button.dataset.assign) + '"]');
      if (!select || !select.value) { toast("Choose a volunteer to assign.", true); return; }
      updateRequest(button.dataset.assign, request => { request.status = "assigned"; request.volunteerId = select.value; }, "Volunteer assigned successfully.");
    }));
  }

  function updateRequest(id, update, message) {
    const data = readData();
    const request = data.requests.find(item => item.id === id);
    if (!request) { toast("That request is no longer available. Refreshing the dashboard.", true); dashboard(); return; }
    update(request);
    if (saveData(data)) { toast(message); dashboard(); }
  }

  if (session) dashboard();
  else landing();
})();
