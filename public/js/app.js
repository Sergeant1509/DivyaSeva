(() => {
  const data = window.DivyaData || { services: [], daanItems: [], testimonials: [] };
  const rupee = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function toast(message) {
    let el = $("#toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 2800);
  }

  function readJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch { return fallback; }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getService(id) {
    return data.services.find(item => item.id === id) || data.daanItems.find(item => item.id === id);
  }

  function queryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function serviceCard(item, mode = "puja") {
    const href = `booking.html?service=${encodeURIComponent(item.id)}&type=${mode}`;
    const meta = item.day ? `${item.day} • ${item.duration}` : item.impact;
    return `
      <article class="service-card card reveal" data-category="${item.category}" data-title="${item.title.toLowerCase()}">
        <div class="service-art"><i class="${item.icon}"></i></div>
        <div class="service-body">
          <span class="tag"><i class="fa-solid fa-star"></i>${item.category}</span>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
          <div class="service-meta">
            <span><i class="fa-regular fa-calendar"></i> ${meta}</span>
            <span><i class="fa-solid fa-location-dot"></i> India</span>
          </div>
          <div class="price-row">
            <span class="price">${rupee.format(item.price)}</span>
            <a class="btn btn-primary" href="${href}">Book</a>
          </div>
        </div>
      </article>
    `;
  }

  function renderCards(containerId, items, mode = "puja", limit = null) {
    const container = $(`#${containerId}`);
    if (!container) return;
    const list = limit ? items.slice(0, limit) : items;
    container.innerHTML = list.map(item => serviceCard(item, mode)).join("");
  }

  function initMenu() {
    const toggle = $("#menuToggle");
    if (!toggle) return;
    toggle.addEventListener("click", () => {
      document.body.classList.toggle("menu-open");
      const open = document.body.classList.contains("menu-open");
      toggle.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    });
    $$(".nav-link").forEach(link => link.addEventListener("click", () => document.body.classList.remove("menu-open")));
  }

  function initActiveLinks() {
    const page = document.body.dataset.page;
    $$(`[data-nav="${page}"]`).forEach(link => link.classList.add("active"));
  }

  function initReveal() {
    const items = $$(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(el => el.classList.add("visible"));
      return;
    }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(el => obs.observe(el));
  }

  function initHome() {
    renderCards("featuredPujas", data.services, "puja", 3);
    renderCards("featuredDaan", data.daanItems, "daan", 3);
    const tBox = $("#testimonials");
    if (tBox) {
      tBox.innerHTML = data.testimonials.map(item => `
        <article class="testimonial card reveal">
          <p>“${item.text}”</p>
          <div class="avatar-row">
            <div class="avatar">${item.name.charAt(0)}</div>
            <div><strong>${item.name}</strong><br><span>${item.city}</span></div>
          </div>
        </article>
      `).join("");
    }
  }

  function initListing() {
    const pujaGrid = $("#pujaGrid");
    const daanGrid = $("#daanGrid");
    if (pujaGrid) renderCards("pujaGrid", data.services, "puja");
    if (daanGrid) renderCards("daanGrid", data.daanItems, "daan");

    const search = $("#serviceSearch");
    const cat = $("#categoryFilter");
    const sort = $("#sortFilter");

    const source = pujaGrid ? data.services : daanGrid ? data.daanItems : [];
    const target = pujaGrid || daanGrid;
    const mode = pujaGrid ? "puja" : "daan";
    if (!target) return;

    if (cat) {
      const categories = [...new Set(source.map(item => item.category))];
      cat.innerHTML = `<option value="all">All categories</option>` + categories.map(c => `<option value="${c}">${c}</option>`).join("");
    }

    function apply() {
      const q = (search?.value || "").trim().toLowerCase();
      const c = cat?.value || "all";
      const s = sort?.value || "recommended";
      let list = [...source].filter(item => {
        const matchesText = !q || `${item.title} ${item.category} ${item.description} ${item.deity || ""}`.toLowerCase().includes(q);
        const matchesCat = c === "all" || item.category === c;
        return matchesText && matchesCat;
      });
      if (s === "low") list.sort((a, b) => a.price - b.price);
      if (s === "high") list.sort((a, b) => b.price - a.price);
      target.innerHTML = list.length ? list.map(item => serviceCard(item, mode)).join("") : `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <i class="fa-solid fa-magnifying-glass"></i>
          <h3>No seva found</h3>
          <p>Try another keyword or category.</p>
        </div>`;
      initReveal();
    }

    [search, cat, sort].forEach(el => el?.addEventListener("input", apply));
  }

  function initBooking() {
    const form = $("#bookingForm");
    const serviceIdInput = $("#serviceId");
    const selectedTitle = $("#selectedTitle");
    const selectedPrice = $("#selectedPrice");
    const selectedType = $("#selectedType");
    const selectedIncludes = $("#selectedIncludes");
    const serviceSelect = $("#serviceSelect");
    if (!form) return;

    const allItems = [...data.services, ...data.daanItems];
    if (serviceSelect) {
      serviceSelect.innerHTML = allItems.map(item => `<option value="${item.id}">${item.title} — ${rupee.format(item.price)}</option>`).join("");
    }

    function setSelected(id) {
      const item = getService(id) || allItems[0];
      if (!item) return;
      serviceIdInput.value = item.id;
      if (serviceSelect) serviceSelect.value = item.id;
      if (selectedTitle) selectedTitle.textContent = item.title;
      if (selectedPrice) selectedPrice.textContent = rupee.format(item.price);
      if (selectedType) selectedType.textContent = item.type || item.category;
      if (selectedIncludes) {
        const inc = item.includes || [item.impact, "Digital confirmation", "Support update"];
        selectedIncludes.innerHTML = inc.map(x => `<li><i class="fa-solid fa-check"></i> ${x}</li>`).join("");
      }
    }

    setSelected(queryParam("service"));
    serviceSelect?.addEventListener("change", e => setSelected(e.target.value));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const item = getService(formData.get("serviceId"));
      const booking = {
        id: `DS-${Date.now()}`,
        serviceId: formData.get("serviceId"),
        serviceTitle: item?.title || "DivyaSeva Booking",
        price: item?.price || 0,
        fullName: formData.get("fullName").trim(),
        phone: formData.get("phone").trim(),
        gotra: formData.get("gotra").trim(),
        city: formData.get("city").trim(),
        preferredDate: formData.get("preferredDate"),
        notes: formData.get("notes").trim(),
        status: "Sankalp received",
        createdAt: new Date().toISOString()
      };

      if (!booking.fullName || !booking.phone) {
        toast("Please enter your name and mobile number.");
        return;
      }

      const bookings = readJSON("ds_bookings", []);
      bookings.unshift(booking);
      writeJSON("ds_bookings", bookings);

      if (window.DivyaFirebase?.ready) {
        try { await window.DivyaFirebase.addBooking(booking); }
        catch (err) { console.warn(err); }
      }

      toast("Booking saved. Check dashboard for details.");
      form.reset();
      setSelected(booking.serviceId);
      setTimeout(() => { window.location.href = "dashboard.html"; }, 800);
    });
  }

  function initDashboard() {
    const list = $("#bookingList");
    if (!list) return;
    const bookings = readJSON("ds_bookings", []);
    if (!bookings.length) {
      list.innerHTML = `
        <div class="empty-state">
          <i class="fa-regular fa-folder-open"></i>
          <h3>No bookings yet</h3>
          <p>Your puja and daan bookings will appear here after submission.</p>
          <a class="btn btn-primary" href="puja.html">Explore Puja</a>
        </div>`;
      return;
    }

    list.innerHTML = bookings.map(item => `
      <article class="booking-item card reveal">
        <div class="icon-tile"><i class="fa-solid fa-hands-praying"></i></div>
        <div>
          <h3>${item.serviceTitle}</h3>
          <p>${item.fullName} • ${item.city || "India"} • ${new Date(item.createdAt).toLocaleDateString("en-IN")}</p>
          <p>${item.phone} ${item.gotra ? "• Gotra: " + item.gotra : ""}</p>
        </div>
        <span class="status-pill">${item.status}</span>
      </article>
    `).join("");
  }

  function initContact() {
    const form = $("#contactForm");
    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const message = {
        name: fd.get("name").trim(),
        phone: fd.get("phone").trim(),
        email: fd.get("email").trim(),
        topic: fd.get("topic"),
        message: fd.get("message").trim(),
        createdAt: new Date().toISOString()
      };
      if (!message.name || !message.phone || !message.message) {
        toast("Please fill required details.");
        return;
      }
      const messages = readJSON("ds_contacts", []);
      messages.unshift(message);
      writeJSON("ds_contacts", messages);
      if (window.DivyaFirebase?.ready) {
        try { await window.DivyaFirebase.addContact(message); }
        catch (err) { console.warn(err); }
      }
      form.reset();
      toast("Message sent. Our team will contact you soon.");
    });
  }

  function initAuth() {
    const authForm = $("#authForm");
    const modeBtn = $("#modeSwitch");
    const authTitle = $("#authTitle");
    const authSub = $("#authSub");
    const submitBtn = $("#authSubmit");
    const userBox = $("#userBox");
    const logoutBtn = $("#logoutBtn");
    if (!authForm) return;

    let mode = "login";
    const localUser = readJSON("ds_user", null);
    showUser(localUser);

    function setMode(next) {
      mode = next;
      authTitle.textContent = mode === "login" ? "Welcome back" : "Create your account";
      authSub.textContent = mode === "login" ? "Login to see bookings and seva updates." : "Create an account for faster bookings.";
      submitBtn.textContent = mode === "login" ? "Login" : "Create Account";
      modeBtn.textContent = mode === "login" ? "New user? Create account" : "Already have account? Login";
    }

    function showUser(user) {
      if (!userBox) return;
      if (!user) {
        userBox.innerHTML = `<p class="form-note">Firebase is optional. Without Firebase, this page works in local demo mode.</p>`;
        return;
      }
      userBox.innerHTML = `<div class="card form-card"><h3>${user.email}</h3><p class="form-note">You are logged in on this device.</p></div>`;
    }

    modeBtn?.addEventListener("click", () => setMode(mode === "login" ? "signup" : "login"));
    logoutBtn?.addEventListener("click", async () => {
      localStorage.removeItem("ds_user");
      try { await window.DivyaFirebase?.logout?.(); } catch {}
      showUser(null);
      toast("Logged out.");
    });

    authForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(authForm);
      const email = fd.get("email").trim();
      const password = fd.get("password").trim();
      if (!email || password.length < 6) {
        toast("Enter a valid email and 6+ character password.");
        return;
      }

      try {
        if (window.DivyaFirebase?.ready) {
          const result = mode === "login"
            ? await window.DivyaFirebase.login(email, password)
            : await window.DivyaFirebase.signUp(email, password);
          writeJSON("ds_user", { email: result.user.email, uid: result.user.uid });
          showUser({ email: result.user.email });
        } else {
          writeJSON("ds_user", { email, uid: `local-${Date.now()}` });
          showUser({ email });
        }
        authForm.reset();
        toast(mode === "login" ? "Logged in successfully." : "Account created successfully.");
      } catch (err) {
        toast(err.message || "Auth failed. Check Firebase setup.");
      }
    });
  }

  function initAccordion() {
    $$(".accordion-btn").forEach(btn => {
      btn.addEventListener("click", () => btn.closest(".accordion-item")?.classList.toggle("open"));
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initMenu();
    initActiveLinks();
    initHome();
    initListing();
    initBooking();
    initDashboard();
    initContact();
    initAuth();
    initAccordion();
    initReveal();
  });
})();
