(function(){
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));
  const DATA = window.DIVYASEVA_DATA || { services: [], donations: [] };

  const icon = {
    diya: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15c3 3 13 3 16 0-2 5-14 5-16 0Z"/><path d="M12 4c5 4 2 8 0 9-2-1-5-5 0-9Z"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    temple: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21v-8h14v8M7 13V9l5-5 5 5v4M10 21v-5a2 2 0 0 1 4 0v5"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L8 9.5a16 16 0 0 0 6.5 6.5l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.6.5 2.5.6A2 2 0 0 1 22 16.9Z"/></svg>'
  };

  function setIcons(){
    $$('[data-icon]').forEach(el => {
      const name = el.dataset.icon;
      if(icon[name]) el.innerHTML = icon[name];
    });
  }

  function activeNav(){
    const current = location.pathname.split('/').pop() || 'index.html';
    $$('[data-nav]').forEach(link => {
      const href = link.getAttribute('href');
      const clean = href.split('/').pop();
      link.classList.toggle('active', clean === current || (current === '' && clean === 'index.html'));
    });
  }

  function mobileMenu(){
    const btn = $('#menuBtn');
    const links = $('#navLinks');
    if(!btn || !links) return;
    btn.addEventListener('click', () => links.classList.toggle('open'));
    links.addEventListener('click', e => {
      if(e.target.closest('a')) links.classList.remove('open');
    });
  }

  function revealOnScroll(){
    const items = $$('.reveal');
    if(!items.length) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('show');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    items.forEach(item => observer.observe(item));
  }

  function rupees(amount){ return `₹${Number(amount || 0).toLocaleString('en-IN')}`; }

  function serviceCard(item){
    return `
      <article class="service-card reveal">
        <div class="service-img">
          <img src="${item.image}" alt="${item.title}">
          <span class="badge">${item.category}</span>
        </div>
        <div class="service-body">
          <h3>${item.title}</h3>
          <p>${item.desc}</p>
          <div class="meta">
            <span>${icon.temple}${item.temple}</span>
            <span>${icon.calendar}${item.day}</span>
          </div>
          <div class="service-foot">
            <div class="price"><small>Starts from</small>${rupees(item.price)}</div>
            <a class="btn btn-primary" href="booking.html?service=${encodeURIComponent(item.id)}">Book ${icon.arrow}</a>
          </div>
        </div>
      </article>
    `;
  }

  function donationCard(item){
    return `
      <article class="service-card reveal">
        <div class="service-img">
          <img src="${item.image}" alt="${item.title}">
          <span class="badge">${item.tag}</span>
        </div>
        <div class="service-body">
          <h3>${item.title}</h3>
          <p>${item.desc}</p>
          <div class="meta"><span>${icon.heart}${item.category}</span></div>
          <div class="service-foot">
            <div class="price"><small>Seva from</small>${rupees(item.price)}</div>
            <a class="btn btn-primary" href="booking.html?type=daan&service=${encodeURIComponent(item.id)}">Offer ${icon.arrow}</a>
          </div>
        </div>
      </article>
    `;
  }

  function renderHome(){
    const preview = $('#homeServices');
    if(preview){
      preview.innerHTML = DATA.services.slice(0,3).map(serviceCard).join('');
    }
  }

  function uniqueCategories(items){ return ['All', ...new Set(items.map(i => i.category))]; }

  function setupListing({ gridId, searchId, categoryId, sortId, source, cardFn }){
    const grid = document.getElementById(gridId);
    if(!grid) return;
    const search = document.getElementById(searchId);
    const category = document.getElementById(categoryId);
    const sort = document.getElementById(sortId);

    if(category){
      category.innerHTML = uniqueCategories(source).map(cat => `<option value="${cat}">${cat}</option>`).join('');
    }

    function render(){
      const query = (search?.value || '').trim().toLowerCase();
      const cat = category?.value || 'All';
      const sortBy = sort?.value || 'popular';
      let items = source.filter(item => {
        const text = `${item.title} ${item.category} ${item.temple || ''} ${item.desc}`.toLowerCase();
        return (!query || text.includes(query)) && (cat === 'All' || item.category === cat);
      });
      if(sortBy === 'low') items = [...items].sort((a,b) => a.price - b.price);
      if(sortBy === 'high') items = [...items].sort((a,b) => b.price - a.price);
      grid.innerHTML = items.length ? items.map(cardFn).join('') : '<div class="empty-state">No seva found. Try another search or category.</div>';
      setTimeout(revealOnScroll, 20);
    }
    [search, category, sort].forEach(el => el && el.addEventListener('input', render));
    render();
  }

  function firebaseReady(){
    const cfg = window.DIVYASEVA_FIREBASE_CONFIG || {};
    return !!(window.firebase && cfg.apiKey && cfg.projectId && cfg.authDomain);
  }

  function initFirebase(){
    if(!firebaseReady()) return null;
    if(!window.__divyaFirebaseApp){
      window.__divyaFirebaseApp = firebase.initializeApp(window.DIVYASEVA_FIREBASE_CONFIG);
    }
    return window.__divyaFirebaseApp;
  }

  function getAllOfferings(){
    return [...DATA.services.map(x => ({...x, type:'puja'})), ...DATA.donations.map(x => ({...x, type:'daan', temple:'Seva Partner', day:'Daily Seva'}))];
  }

  function setupBooking(){
    const form = $('#bookingForm');
    if(!form) return;
    const offeringSelect = $('#serviceSelect');
    const amountInput = $('#amountInput');
    const all = getAllOfferings();
    offeringSelect.innerHTML = '<option value="">Choose seva</option>' + all.map(item => `<option value="${item.id}" data-price="${item.price}">${item.title} — ${rupees(item.price)}</option>`).join('');

    const params = new URLSearchParams(location.search);
    const serviceId = params.get('service');
    if(serviceId){ offeringSelect.value = serviceId; }
    function syncAmount(){
      const item = all.find(x => x.id === offeringSelect.value);
      if(item && amountInput) amountInput.value = item.price;
      const selectedBox = $('#selectedOffering');
      if(selectedBox && item){
        selectedBox.innerHTML = `<h3>${item.title}</h3><p>${item.desc}</p><ul>${(item.benefits || ['Digital update','Sankalp with name','Support confirmation']).map(b => `<li>${b}</li>`).join('')}</ul>`;
      }
    }
    offeringSelect.addEventListener('change', syncAmount);
    syncAmount();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const message = $('#bookingMessage');
      const formData = new FormData(form);
      const booking = Object.fromEntries(formData.entries());
      const chosen = all.find(x => x.id === booking.serviceId);
      booking.id = `DS-${Date.now()}`;
      booking.title = chosen?.title || 'DivyaSeva Booking';
      booking.createdAt = new Date().toISOString();
      booking.status = 'Sankalp Received';
      booking.amount = Number(booking.amount || chosen?.price || 0);

      const bookings = JSON.parse(localStorage.getItem('divyasevaBookings') || '[]');
      bookings.unshift(booking);
      localStorage.setItem('divyasevaBookings', JSON.stringify(bookings));

      try{
        const app = initFirebase();
        if(app){
          await firebase.firestore().collection('bookings').add(booking);
        }
        form.reset();
        if(serviceId) offeringSelect.value = serviceId;
        syncAmount();
        message.className = 'message success';
        message.textContent = 'Your sankalp has been saved. You can check it in Dashboard.';
      }catch(err){
        message.className = 'message success';
        message.textContent = 'Saved locally. Firebase is not configured or could not save right now.';
      }
    });
  }

  function setupDashboard(){
    const list = $('#bookingList');
    if(!list) return;
    const bookings = JSON.parse(localStorage.getItem('divyasevaBookings') || '[]');
    if(!bookings.length){
      list.innerHTML = '<div class="empty-state">No booking yet. Book a puja or daan seva and it will appear here.</div>';
      return;
    }
    list.innerHTML = bookings.map(b => `
      <article class="booking-item">
        <div>
          <h3>${b.title || 'DivyaSeva Booking'}</h3>
          <p><b>Name:</b> ${b.fullName || 'Not added'} ${b.gotra ? `• <b>Gotra:</b> ${b.gotra}` : ''}</p>
          <p><b>Phone:</b> ${b.phone || '-'} • <b>Amount:</b> ${rupees(b.amount)}</p>
          <p><b>Date:</b> ${new Date(b.createdAt).toLocaleString('en-IN')}</p>
        </div>
        <span class="status">${b.status || 'Received'}</span>
      </article>
    `).join('');
  }

  function setupContact(){
    const form = $('#contactForm');
    if(!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const message = $('#contactMessage');
      const request = Object.fromEntries(new FormData(form).entries());
      request.createdAt = new Date().toISOString();
      const requests = JSON.parse(localStorage.getItem('divyasevaContacts') || '[]');
      requests.unshift(request);
      localStorage.setItem('divyasevaContacts', JSON.stringify(requests));
      try{
        const app = initFirebase();
        if(app) await firebase.firestore().collection('contactRequests').add(request);
      }catch(err){}
      form.reset();
      message.className = 'message success';
      message.textContent = 'Message received. Our seva team will contact you soon.';
    });
  }

  function setupAuth(){
    const tabs = $$('.auth-tabs button');
    const forms = $$('.auth-form');
    if(!tabs.length) return;
    tabs.forEach(tab => tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.toggle('active', t === tab));
      forms.forEach(form => form.classList.toggle('active', form.dataset.form === tab.dataset.tab));
    }));

    const loginForm = $('#loginForm');
    const registerForm = $('#registerForm');
    loginForm?.addEventListener('submit', async e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(loginForm).entries());
      const msg = $('#authMessage');
      try{
        const app = initFirebase();
        if(app){ await firebase.auth().signInWithEmailAndPassword(data.email, data.password); }
        localStorage.setItem('divyasevaUser', JSON.stringify({ email:data.email, name:data.email.split('@')[0] }));
        msg.className = 'message success'; msg.textContent = 'Login successful. You can now open your dashboard.';
      }catch(err){ msg.className = 'message error'; msg.textContent = err.message || 'Login failed.'; }
    });
    registerForm?.addEventListener('submit', async e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(registerForm).entries());
      const msg = $('#authMessage');
      try{
        const app = initFirebase();
        if(app){ await firebase.auth().createUserWithEmailAndPassword(data.email, data.password); }
        localStorage.setItem('divyasevaUser', JSON.stringify({ email:data.email, name:data.name }));
        msg.className = 'message success'; msg.textContent = 'Account created. Firebase mode will activate after config is added.';
      }catch(err){ msg.className = 'message error'; msg.textContent = err.message || 'Registration failed.'; }
    });
  }

  function init(){
    setIcons();
    activeNav();
    mobileMenu();
    renderHome();
    setupListing({ gridId:'servicesGrid', searchId:'serviceSearch', categoryId:'serviceCategory', sortId:'serviceSort', source:DATA.services, cardFn:serviceCard });
    setupListing({ gridId:'donationGrid', searchId:'donationSearch', categoryId:'donationCategory', sortId:'donationSort', source:DATA.donations, cardFn:donationCard });
    setupBooking();
    setupDashboard();
    setupContact();
    setupAuth();
    revealOnScroll();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
