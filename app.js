// Fixed & Firebase-enabled app.js for DonateNow (compat API)
// Based on your original file. Make sure index.html loads firebase-compat scripts before this file.

(function () {
    'use strict';

    class DonationPlatform {
        constructor() {
            // Core state
            this.currentUser = null; // { id, name, email, ... } or null
            this.isAdmin = false;
            this.users = JSON.parse(localStorage.getItem('platform_users') || '[]');
            this.donations = JSON.parse(localStorage.getItem('platform_donations') || '[]');
            this.ngos = JSON.parse(localStorage.getItem('platform_ngos') || '[]');

            // Donation modal selections
            this.selectedAmount = null;
            this.selectedPaymentMethod = null;
            this.selectedNeedId = null;

            // Timeline content (kept)
            this.timelineData = [
                { year: '2024', title: 'Vision & Development', description: 'Platform conceptualized by Jaikishan Saharan with a vision to revolutionize charitable giving', icon: 'lightbulb', stats: '' },
                { year: 'Early 2025', title: 'Beta Launch', description: 'Launched with initial NGO partners and donor community', icon: 'rocket', stats: '10+ NGO partners' },
                { year: 'Mid 2025', title: 'Growth Phase', description: 'Expanded reach with advanced features and partnerships', icon: 'chart-line', stats: '₹100K+ raised, 500+ lives impacted' },
                { year: 'Future', title: 'Scale & Impact', description: 'Target nationwide coverage with comprehensive social impact', icon: 'globe', stats: '₹5M+ goal, 10,000+ lives to transform' }
            ];

            // Firebase config (inserted from user)
            this.firebaseConfig = {
                apiKey: "AIzaSyDEYOlBGReEXn2io45wWyq5gulWuox6f24",
                authDomain: "ngodonationplatform.firebaseapp.com",
                projectId: "ngodonationplatform",
                storageBucket: "ngodonationplatform.firebasestorage.app",
                messagingSenderId: "884147909436",
                appId: "1:884147909436:web:e4d533cc4458042e11a439"
            };

            console.log('DonationPlatform constructor called');
            this.init();
        }

        init() {
            console.log('Initializing platform...');
            this.initFirebase();
            this.loadInitialData();
            this.bindAllEvents();
            this.setupAuthStateListener();
            this.loadDynamicContent();
            this.updateRealTimeStats();
            this.startDonationAlerts();
            this.loadTimeline();
            this.setupScrollAnimations();
            console.log('Platform initialization complete');
        }

        // ---------------- Dynamic Content (Needs + Partners) ----------------
        loadDynamicContent() {
            this.loadNeedsGrid();
            this.loadPartnersGrid();
        }

        loadNeedsGrid() {
            const container = document.getElementById('needsGrid');
            if (!container) return;

            const urgentNeeds = [
                {
                    id: 1,
                    title: "Emergency Winter Clothing for 100 Children",
                    priority: "Critical",
                    description: "Urgent need for warm clothes as severe winter approaches.",
                    amountRequired: 25000,
                    amountRaised: 18000,
                    image: "https://images.unsplash.com/photo-1529688530649-47e35cd17b2c"
                },
                {
                    id: 2,
                    title: "School Supplies for Underprivileged Kids",
                    priority: "High",
                    description: "Provide essential learning materials to help children succeed.",
                    amountRequired: 30000,
                    amountRaised: 12000,
                    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7"
                }
            ];

            container.innerHTML = urgentNeeds.map(need => `
        <div class="need-card">
            <div class="need-image" style="background-image:url('${need.image}')"></div>
            <div class="need-content">
                <span class="need-priority ${need.priority.toLowerCase()}">${need.priority}</span>
                <h3>${need.title}</h3>
                <p>${need.description}</p>
                <div class="need-progress">
                    <div class="need-progress-bar" style="width: ${(need.amountRaised / need.amountRequired) * 100}%"></div>
                </div>
                <button class="btn btn--primary donate-btn">Donate Now</button>
            </div>
        </div>
    `).join('');

            // Enable donation buttons
            container.querySelectorAll('.donate-btn').forEach(btn => {
                btn.addEventListener('click', () => this.showDonationModal());
            });
        }

        loadPartnersGrid() {
            const container = document.getElementById('partnersGrid');
            if (!container) return;

            container.innerHTML = this.ngos.map(partner => `
        <div class="partner-card">
            <div class="partner-image" style="background-image:url('${partner.image}')"></div>
            <div class="partner-content">
                <div class="partner-header">
                    <h3 class="partner-name">${partner.name}</h3>
                    <span class="verified-badge">✔ Verified</span>
                </div>
                <p class="partner-location"><i class="fas fa-map-marker-alt"></i> ${partner.location}</p>
                <p class="partner-description">${partner.description}</p>

                <div class="partner-stats">
                    <div class="partner-stat">
                        <span class="partner-stat-number">${partner.beneficiaries}</span>
                        <span class="partner-stat-label">Beneficiaries</span>
                    </div>
                    <div class="partner-stat">
                        <span class="partner-stat-number">${partner.needs}</span>
                        <span class="partner-stat-label">Active Needs</span>
                    </div>
                    <div class="partner-stat">
                        <span class="partner-stat-number">${partner.established}</span>
                        <span class="partner-stat-label">Since</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
        }

        // ---------------- Firebase (compat) ----------------
        initFirebase() {
            if (!window.firebase) {
                console.warn('Firebase not loaded. Make sure firebase-compat scripts are included in index.html.');
                return;
            }
            try {
                if (!firebase.apps.length) {
                    firebase.initializeApp(this.firebaseConfig);
                }
                this.auth = firebase.auth();
                console.log('Firebase initialized (compat).');
            } catch (err) {
                console.error('Firebase init error:', err);
            }
        }

        setupAuthStateListener() {
            if (!this.auth) return;

            // Listen for changes in auth state and update UI accordingly.
            this.auth.onAuthStateChanged((user) => {
                if (user) {
                    // Try to enrich with stored profile in local storage (users array)
                    const saved = this.users.find(u => String(u.id) === String(user.uid) || u.email === user.email);
                    if (saved) {
                        this.currentUser = saved;
                    } else {
                        // minimal profile if not found
                        this.currentUser = {
                            id: user.uid,
                            name: user.displayName || user.email.split('@')[0],
                            email: user.email,
                            phone: user.phoneNumber || '',
                            joinDate: new Date().toISOString().split('T')[0],
                            totalDonated: 0,
                            donationsCount: 0,
                            type: 'donor'
                        };
                        // Save minimal profile to users list so platform features work
                        this.users.push(this.currentUser);
                        this.saveToStorage('platform_users', this.users);
                    }
                    this.saveSession();
                    this.updateAuthUI();
                    // Show user dashboard (unless admin)
                    if (!this.isAdmin) this.showDashboard();
                } else {
                    // logged out
                    this.currentUser = null;
                    this.isAdmin = false;
                    this.clearSession();
                    this.updateAuthUI();
                    this.hideDashboards();
                }
            });
        }

        // ---------------- Initial static data ----------------
        loadInitialData() {
            // Users
            if (this.users.length === 0) {
                this.users = [
                    { id: 1, name: "John Doe", email: "john@example.com", phone: "+91-9876543210", type: "donor", joinDate: "2024-01-15", totalDonated: 5000, donationsCount: 3 },
                    { id: 2, name: "Sarah Wilson", email: "sarah@example.com", phone: "+91-9876543211", type: "volunteer", joinDate: "2024-02-20", totalDonated: 2000, donationsCount: 2 }
                ];
                this.saveToStorage('platform_users', this.users);
            }

            // Donations
            if (this.donations.length === 0) {
                this.donations = [
                    { id: 1, userId: 1, amount: 2000, needId: 1, date: "2024-08-15", method: "upi", status: "completed" },
                    { id: 2, userId: 2, amount: 1500, needId: 1, date: "2024-08-18", method: "card", status: "completed" }
                ];
                this.saveToStorage('platform_donations', this.donations);
            }

            // NGOs
            if (this.ngos.length === 0) {
                this.ngos = [
                    { id: 1, name: "Hope Children's Home", location: "Mumbai, Maharashtra", verified: true, description: "Supporting orphaned children with education and care", image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=300&h=200&fit=crop", needs: 5, totalSupported: 150, established: 2010, beneficiaries: 500 },
                    { id: 2, name: "Sunrise Educational Trust", location: "Delhi, NCR", verified: true, description: "Providing education to underprivileged children", image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=300&h=200&fit=crop", needs: 3, totalSupported: 89, established: 2008, beneficiaries: 300 }
                ];
                this.saveToStorage('platform_ngos', this.ngos);
            }
        }

        // ---------------- UI: timeline, animations ----------------
        loadTimeline() {
            const container = document.getElementById('timelineMilestones');
            if (!container) return;
            const iconMap = { lightbulb: 'fas fa-lightbulb', rocket: 'fas fa-rocket', 'chart-line': 'fas fa-chart-line', globe: 'fas fa-globe' };
            container.innerHTML = this.timelineData.map((milestone, i) => `
        <div class="milestone" data-index="${i}">
          <div class="milestone-marker"><i class="${iconMap[milestone.icon] || 'fas fa-star'}"></i></div>
          <div class="milestone-card">
            <span class="milestone-year">${milestone.year}</span>
            <div class="milestone-content">
              <h3 class="milestone-title">${milestone.title}</h3>
              <p class="milestone-description">${milestone.description}</p>
              ${milestone.stats ? `<span class="milestone-stats">${milestone.stats}</span>` : ''}
            </div>
          </div>
        </div>
      `).join('');
        }

        setupScrollAnimations() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        const index = el.dataset.index || 0;
                        setTimeout(() => el.classList.add('animate'), index * 200);
                    }
                });
            }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });

            document.querySelectorAll('.milestone').forEach(m => observer.observe(m));
        }

        // ---------------- Events ----------------
        bindAllEvents() {
            console.log('Binding events.');

            this.bindEvent('loginBtn', 'click', () => this.showModal('loginModal'));
            this.bindEvent('registerBtn', 'click', () => this.showModal('registerModal'));
            this.bindEvent('adminBtn', 'click', () => this.showModal('adminModal'));
            this.bindEvent('logoutBtn', 'click', () => this.logout());
            this.bindEvent('donateNowBtn', 'click', () => this.showDonationModal());
            this.bindEvent('learnMoreBtn', 'click', () => this.showModal('learnMoreModal'));
            this.bindEvent('loginForm', 'submit', (e) => this.handleLogin(e));
            this.bindEvent('registerForm', 'submit', (e) => this.handleRegister(e));
            this.bindEvent('adminForm', 'submit', (e) => this.handleAdminLogin(e));
            this.bindEvent('googleLogin', 'click', () => this.handleGoogleLogin());
            this.bindEvent('googleRegister', 'click', () => this.handleGoogleLogin());
            this.bindEvent('successOk', 'click', () => this.hideModal('successModal'));
            this.bindEvent('proceedPayment', 'click', () => this.processPayment());

            // Modal close & overlay clicks
            document.querySelectorAll('.modal-close').forEach(btn => btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.hideModal(modal.id);
            }));
            document.querySelectorAll('.modal-overlay').forEach(overlay => overlay.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.hideModal(modal.id);
            }));

            // Smooth scrolling
            this.setupSmoothScrolling();

            // Escape to close modal
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const active = document.querySelector('.modal.show');
                    if (active) this.hideModal(active.id);
                }
            });
        }

        setupSmoothScrolling() {
            document.querySelectorAll('.nav-menu a[href^="#"]').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute('href').substring(1);
                    const target = document.getElementById(targetId);
                    if (!target) return;
                    const hdr = document.querySelector('.header');
                    const headerHeight = hdr ? hdr.offsetHeight : 0;
                    const y = target.offsetTop - headerHeight - 20;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                });
            });
        }

        bindEvent(id, type, handler) {
            const el = document.getElementById(id);
            if (el) el.addEventListener(type, handler);
        }

        // ---------------- Modals, loading, success ----------------
        showModal(id) {
            const m = document.getElementById(id);
            if (!m) return;
            m.classList.remove('hidden');
            setTimeout(() => m.classList.add('show'), 10);
        }
        hideModal(id) {
            const m = document.getElementById(id);
            if (!m) return;
            m.classList.remove('show');
            setTimeout(() => m.classList.add('hidden'), 250);
        }
        showLoading() {
            const l = document.getElementById('loadingOverlay');
            if (l) l.classList.remove('hidden');
        }
        hideLoading() {
            const l = document.getElementById('loadingOverlay');
            if (l) l.classList.add('hidden');
        }
        showSuccess(title, message, cb) {
            const t = document.getElementById('successTitle');
            const m = document.getElementById('successMessage');
            if (t) t.textContent = title;
            if (m) m.textContent = message;
            const ok = document.getElementById('successOk');
            if (ok) ok.onclick = () => { this.hideModal('successModal'); if (cb) cb(); };
            this.showModal('successModal');
        }

        // ---------------- Auth: Login / Register / Logout ----------------
        handleLogin(e) {
            e.preventDefault();
            if (!this.auth) { alert('Auth not initialized.'); return; }
            this.showLoading();

            const email = this.getElementValue('loginEmail');
            const password = this.getElementValue('loginPassword');

            this.auth.signInWithEmailAndPassword(email, password)
                .then((result) => {
                    this.hideLoading();
                    // onAuthStateChanged will update UI & currentUser
                    this.hideModal('loginModal');
                    this.clearForm('loginForm');
                    this.showSuccess('Welcome back!', 'You have successfully logged in.');
                })
                .catch(err => {
                    this.hideLoading();
                    console.error('Login error', err);
                    alert(err.message || 'Login failed');
                });
        }

        handleRegister(e) {
            e.preventDefault();
            if (!this.auth) { alert('Auth not initialized.'); return; }
            this.showLoading();

            const name = this.getElementValue('registerName');
            const email = this.getElementValue('registerEmail');
            const phone = this.getElementValue('registerPhone');
            const password = this.getElementValue('registerPassword');
            const userType = this.getElementValue('registerUserType') || 'donor';

            // Create Firebase account
            this.auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    this.hideLoading();
                    const firebaseUser = userCredential.user;

                    const newUser = {
                        id: firebaseUser.uid,
                        name: name || (firebaseUser.displayName || email.split('@')[0]),
                        email: firebaseUser.email,
                        phone: phone || '',
                        type: userType,
                        joinDate: new Date().toISOString().split('T')[0],
                        totalDonated: 0,
                        donationsCount: 0
                    };

                    // Save to local users list for platform features (you can later migrate to Firestore)
                    this.users.push(newUser);
                    this.saveToStorage('platform_users', this.users);

                    this.hideModal('registerModal');
                    this.showSuccess('Registration successful', 'Please login with your new account.', () => {
                        this.showModal('loginModal');
                        this.setElementValue('loginEmail', email);
                    });
                    this.clearForm('registerForm');
                })
                .catch(err => {
                    this.hideLoading();
                    console.error('Register error', err);
                    alert(err.message || 'Registration failed');
                });
        }

        handleAdminLogin(e) {
            e.preventDefault();
            // small local admin auth (kept as before)
            const email = this.getElementValue('adminEmail');
            const password = this.getElementValue('adminPassword');

            this.showLoading();
            setTimeout(() => {
                this.hideLoading();
                if (email === 'jaikishansaharan@gmail.com' && password === 'JS2006') {
                    this.isAdmin = true;
                    this.saveSession();
                    this.updateAuthUI();
                    this.hideModal('adminModal');
                    this.showAdminDashboard();
                    this.showSuccess('Admin Access Granted', 'Welcome to the admin dashboard!');
                } else {
                    alert('Invalid admin credentials. Use: jaikishansaharan@gmail.com / JS2006');
                }
            }, 800);
        }

        handleGoogleLogin() {
            if (!this.auth) { alert('Auth not initialized.'); return; }
            // Use Google sign-in popup (compat)
            const provider = new firebase.auth.GoogleAuthProvider();

            this.auth.signInWithPopup(provider)
                .then((result) => {
                    // onAuthStateChanged will handle session and UI
                    this.hideModal('loginModal');
                    this.hideModal('registerModal');
                    this.showSuccess('Google Login Success', `Welcome! You're now logged in with Google.`);
                })
                .catch(err => {
                    console.error('Google login error', err);
                    alert(err.message || 'Google login failed');
                });
        }

        logout() {
            if (this.auth) {
                this.auth.signOut().then(() => {
                    this.currentUser = null;
                    this.isAdmin = false;
                    this.clearSession();
                    this.updateAuthUI();
                    this.hideDashboards();
                    this.showSuccess('Logged Out', 'You have been successfully logged out.');
                }).catch(err => {
                    console.error('Sign out error', err);
                    alert('Sign-out failed');
                });
            } else {
                // fallback: clear local session
                this.currentUser = null;
                this.isAdmin = false;
                this.clearSession();
                this.updateAuthUI();
                this.hideDashboards();
            }
        }

        // ---------------- Donation flow (keeps original behavior) ----------------
        showDonationModal(needId = null) {
            if (!this.currentUser) {
                this.showSuccess('Login Required', 'Please login to make a donation.', () => this.showModal('loginModal'));
                return;
            }
            this.selectedNeedId = needId;
            this.showModal('donationModal');
            this.setupDonationModal();
        }

        setupDonationModal() {
            document.querySelectorAll('.amount-btn').forEach(btn => {
                btn.onclick = (e) => {
                    document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    this.selectedAmount = parseInt(e.currentTarget.dataset.amount);
                    this.setElementValue('customAmount', '');
                };
            });
            document.querySelectorAll('.payment-btn').forEach(btn => {
                btn.onclick = (e) => {
                    document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    this.selectedPaymentMethod = e.currentTarget.dataset.method;
                };
            });
            const custom = document.getElementById('customAmount');
            if (custom) custom.addEventListener('input', () => {
                document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
                this.selectedAmount = null;
            });
        }

        processPayment() {
            const customAmount = this.getElementValue('customAmount');
            const amount = customAmount ? parseInt(customAmount) : this.selectedAmount;
            if (!amount || amount < 100) { alert('Please enter/select valid amount (min ₹100)'); return; }
            if (!this.selectedPaymentMethod) { alert('Please select a payment method'); return; }

            this.showLoading();
            this.hideModal('donationModal');

            setTimeout(() => {
                this.hideLoading();
                const donation = {
                    id: Date.now(),
                    userId: this.currentUser.id,
                    amount,
                    needId: this.selectedNeedId || 1,
                    date: new Date().toISOString().split('T')[0],
                    method: this.selectedPaymentMethod,
                    status: 'completed'
                };
                this.donations.push(donation);
                this.saveToStorage('platform_donations', this.donations);

                // update user stats in local users array
                const idx = this.users.findIndex(u => String(u.id) === String(this.currentUser.id) || u.email === this.currentUser.email);
                if (idx !== -1) {
                    this.users[idx].totalDonated = (this.users[idx].totalDonated || 0) + amount;
                    this.users[idx].donationsCount = (this.users[idx].donationsCount || 0) + 1;
                    this.currentUser = this.users[idx];
                    this.saveToStorage('platform_users', this.users);
                } else {
                    // fallback update currentUser object
                    this.currentUser.totalDonated = (this.currentUser.totalDonated || 0) + amount;
                    this.currentUser.donationsCount = (this.currentUser.donationsCount || 0) + 1;
                }
                this.saveSession();
                this.updateRealTimeStats();
                this.resetDonationForm();

                this.showSuccess('Donation Successful!', `Thank you for your donation of ₹${amount.toLocaleString()}!`, () => {
                    if (this.currentUser) this.showDashboard();
                });
                this.showDonationAlert(this.currentUser.name || this.currentUser.email, amount, 'General Cause');
            }, 1200);
        }

        resetDonationForm() {
            document.querySelectorAll('.amount-btn, .payment-btn').forEach(b => b.classList.remove('active'));
            this.setElementValue('customAmount', '');
            this.selectedAmount = null;
            this.selectedPaymentMethod = null;
        }

        // ---------------- Dashboard & Admin ----------------
        showDashboard() {
            if (!this.currentUser) return;
            this.hideDashboards();
            const dashboard = document.getElementById('userDashboard');
            if (dashboard) {
                dashboard.classList.remove('hidden');
                this.updateDashboardContent();
            }
        }

        updateDashboardContent() {
            this.setElementText('userName', this.currentUser.name || this.currentUser.email);
            this.setElementText('userDonations', this.currentUser.donationsCount || 0);
            this.setElementText('userImpact', Math.floor((this.currentUser.totalDonated || 0) / 100));
            this.loadUserDonationHistory();
            this.loadRecommendedNeeds();
        }

        showAdminDashboard() {
            if (!this.isAdmin) return;
            this.hideDashboards();
            const admin = document.getElementById('adminDashboard');
            if (admin) {
                admin.classList.remove('hidden');
                this.updateAdminStats();
                this.loadUsersTable();
                this.setupAdminTabs();
            }
        }

        hideDashboards() {
            const ud = document.getElementById('userDashboard');
            const ad = document.getElementById('adminDashboard');
            if (ud) ud.classList.add('hidden');
            if (ad) ad.classList.add('hidden');
        }

        updateAdminStats() {
            this.setElementText('adminTotalUsers', this.users.length);
            const totalRaised = this.donations.reduce((s, d) => s + d.amount, 0);
            this.setElementText('adminTotalDonations', `₹${totalRaised.toLocaleString()}`);
            this.setElementText('adminActiveNGOs', this.ngos.length);
        }

        setupAdminTabs() {
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const tab = e.currentTarget.dataset.tab;
                    this.switchAdminTab(tab);
                });
            });
        }

        switchAdminTab(tabId) {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            const btn = document.querySelector(`[data-tab="${tabId}"]`);
            if (btn) btn.classList.add('active');
            const content = document.getElementById(`${tabId}Tab`);
            if (content) content.classList.add('active');
            if (tabId === 'users') this.loadUsersTable();
            if (tabId === 'donations') this.loadDonationsTable();
            if (tabId === 'ngos') this.loadNGOsTable();
            if (tabId === 'analytics') this.loadAnalytics();
        }

        loadUsersTable() {
            const container = document.getElementById('usersTable');
            if (!container) return;
            if (!this.users.length) { container.innerHTML = '<p>No users registered yet.</p>'; return; }
            container.innerHTML = `<table class="data-table"><thead><tr><th>Name</th><th>Email</th><th>Type</th><th>Join Date</th><th>Total Donated</th></tr></thead><tbody>${this.users.map(u => `<tr><td>${u.name}</td><td>${u.email}</td><td>${u.type || ''}</td><td>${u.joinDate || ''}</td><td>₹${(u.totalDonated || 0).toLocaleString()}</td></tr>`).join('')
                }</tbody></table>`;
        }

        loadDonationsTable() {
            const container = document.getElementById('donationsTable');
            if (!container) return;
            if (!this.donations.length) { container.innerHTML = '<p>No donations yet.</p>'; return; }
            container.innerHTML = `<table class="data-table"><thead><tr><th>Date</th><th>Donor</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead><tbody>${this.donations.map(d => {
                const donor = this.users.find(u => String(u.id) === String(d.userId)) || {};
                return `<tr><td>${d.date}</td><td>${donor.name || donor.email || 'Unknown'}</td><td>₹${d.amount.toLocaleString()}</td><td>${d.method}</td><td>${d.status}</td></tr>`;
            }).join('')
                }</tbody></table>`;
        }

        loadNGOsTable() {
            const container = document.getElementById('ngosTable');
            if (!container) return;
            if (!this.ngos.length) { container.innerHTML = '<p>No NGOs registered.</p>'; return; }
            container.innerHTML = `<table class="data-table"><thead><tr><th>Name</th><th>Location</th><th>Verified</th><th>Beneficiaries</th><th>Established</th></tr></thead><tbody>${this.ngos.map(n => `<tr><td>${n.name}</td><td>${n.location}</td><td>${n.verified ? 'Verified' : 'Pending'}</td><td>${n.beneficiaries}</td><td>${n.established}</td></tr>`).join('')
                }</tbody></table>`;
        }

        loadAnalytics() {
            const container = document.getElementById('analyticsContent');
            if (!container) return;
            const totalRaised = this.donations.reduce((s, d) => s + d.amount, 0);
            const avgDonation = this.donations.length ? totalRaised / this.donations.length : 0;
            const topDonor = this.users.reduce((top, u) => (u.totalDonated || 0) > (top.totalDonated || 0) ? u : top, { totalDonated: 0 });
            container.innerHTML = `<div class="analytics-grid"><div class="analytics-card"><h4>Platform Overview</h4><div class="analytics-stats"><div class="analytics-stat"><span class="stat-label">Total Users</span><span class="stat-value">${this.users.length}</span></div><div class="analytics-stat"><span class="stat-label">Total Raised</span><span class="stat-value">₹${totalRaised.toLocaleString()}</span></div><div class="analytics-stat"><span class="stat-label">Avg Donation</span><span class="stat-value">₹${Math.round(avgDonation).toLocaleString()}</span></div><div class="analytics-stat"><span class="stat-label">Top Donor</span><span class="stat-value">${topDonor.name || 'N/A'}</span></div></div></div></div>`;
        }

        loadUserDonationHistory() {
            const container = document.getElementById('userDonationHistory');
            if (!container || !this.currentUser) return;
            const userDonations = this.donations.filter(d => String(d.userId) === String(this.currentUser.id));
            if (!userDonations.length) { container.innerHTML = '<p class="empty-state">No donations yet.</p>'; return; }
            container.innerHTML = userDonations.slice(-5).reverse().map(d => `<div class="donation-item"><div class="donation-info"><span class="donation-amount">₹${d.amount.toLocaleString()}</span><span class="donation-date">${d.date}</span></div><span class="donation-status status--success">Completed</span></div>`).join('');
        }

        loadRecommendedNeeds() {
            const container = document.getElementById('recommendedNeeds');
            if (!container) return;
            const recommendations = [
                { title: "Help Build a School Library", amount: "₹25,000 needed", impact: "Will benefit 300+ students" },
                { title: "Sponsor a Child's Education", amount: "₹12,000 needed", impact: "Full year education support" }
            ];
            container.innerHTML = recommendations.map(r => `<div class="recommendation-item"><h4>${r.title}</h4><p class="rec-amount">${r.amount}</p><p class="rec-impact">${r.impact}</p></div>`).join('');
        }

        // ---------------- Small helpers & UI utilities ----------------
        checkUserSession() {
            // kept for backward compatibility; now auth listener is primary source
            const savedUser = localStorage.getItem('current_user');
            const savedAdmin = localStorage.getItem('is_admin');
            if (savedUser) {
                try {
                    this.currentUser = JSON.parse(savedUser);
                    this.updateAuthUI();
                    if (!this.isAdmin) this.showDashboard();
                } catch (e) { /* ignore */ }
            }
            if (savedAdmin === 'true') {
                this.isAdmin = true;
                this.updateAuthUI();
                this.showAdminDashboard();
            }
        }

        updateAuthUI() {
            const loginBtn = document.getElementById('loginBtn');
            const registerBtn = document.getElementById('registerBtn');
            const logoutBtn = document.getElementById('logoutBtn');
            if (this.currentUser || this.isAdmin) {
                if (loginBtn) loginBtn.classList.add('hidden');
                if (registerBtn) registerBtn.classList.add('hidden');
                if (logoutBtn) logoutBtn.classList.remove('hidden');
            } else {
                if (loginBtn) loginBtn.classList.remove('hidden');
                if (registerBtn) registerBtn.classList.remove('hidden');
                if (logoutBtn) logoutBtn.classList.add('hidden');
            }
        }

        getElementValue(id) {
            const el = document.getElementById(id);
            return el ? el.value.trim() : '';
        }
        setElementValue(id, value) {
            const el = document.getElementById(id);
            if (el) el.value = value;
        }
        setElementText(id, text) {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        }
        clearForm(formId) {
            const f = document.getElementById(formId);
            if (f) f.reset();
        }

        saveSession() {
            if (this.currentUser) localStorage.setItem('current_user', JSON.stringify(this.currentUser));
            localStorage.setItem('is_admin', this.isAdmin.toString());
        }
        clearSession() {
            localStorage.removeItem('current_user');
            localStorage.removeItem('is_admin');
        }
        saveToStorage(key, data) {
            localStorage.setItem(key, JSON.stringify(data));
        }

        startDonationAlerts() {
            // random fake alerts for UX
            const alerts = document.getElementById('donationAlerts');
            const donors = ["Anita", "Rahul", "Sneha", "Vikram", "Priya"];
            const causes = ["Education", "Healthcare", "Food", "Shelter", "Environment"];
            setInterval(() => {
                if (!alerts) return;
                const name = donors[Math.floor(Math.random() * donors.length)];
                const cause = causes[Math.floor(Math.random() * causes.length)];
                const amount = Math.floor(Math.random() * 5000) + 200;
                this.showDonationAlert(name, amount, cause);
            }, 6000);
        }

        showDonationAlert(name, amount, cause) {
            const alerts = document.getElementById('donationAlerts');
            if (!alerts) return;
            const alert = document.createElement('div');
            alert.className = 'donation-alert';
            alert.innerHTML = `<i class="fas fa-gift"></i> ${name} donated ₹${amount.toLocaleString()} for ${cause}`;
            alerts.appendChild(alert);
            setTimeout(() => alert.remove(), 3500);
        }

        updateRealTimeStats() {
            const totalRaised = this.donations.reduce((s, d) => s + d.amount, 0);
            const peopleHelped = Math.floor(totalRaised / 350); // example metric
            const activeUsers = this.users.length;
            this.setElementText('totalRaised', `₹${totalRaised.toLocaleString()}`);
            this.setElementText('peopleHelped', peopleHelped.toLocaleString());
            this.setElementText('activeUsers', activeUsers.toLocaleString());
        }
    }

    // Initialize platform when DOM is ready
    function initializePlatform() {
        console.log('DOM ready, initializing platform.');
        window.donationPlatform = new DonationPlatform();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePlatform);
    } else {
        initializePlatform();
    }

    // small UI helpers outside class (back to top)
    const backToTop = document.getElementById("backToTop");
    if (backToTop) {
        window.addEventListener("scroll", () => {
            backToTop.style.display = window.scrollY > 300 ? "block" : "none";
        });
        backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    }

    // animate counters (simple)
    function animateCounter(id, target) {
        const el = document.getElementById(id);
        if (!el) return;
        let count = 0;
        const step = Math.max(1, Math.floor(target / 200));
        const tick = () => {
            count += step;
            if (count < target) {
                el.textContent = Math.floor(count).toLocaleString();
                requestAnimationFrame(tick);
            } else {
                el.textContent = target.toLocaleString();
            }
        };
        tick();
    }

    animateCounter("peopleHelped", 15000);
    animateCounter("activeUsers", 1200);

})();
