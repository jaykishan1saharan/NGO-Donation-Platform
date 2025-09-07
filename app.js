// NGO Donation Platform - Enhanced with Organized Timeline
(function() {
    'use strict';

    class DonationPlatform {
        constructor() {
            this.currentUser = null;
            this.isAdmin = false;
            this.users = JSON.parse(localStorage.getItem('platform_users') || '[]');
            this.donations = JSON.parse(localStorage.getItem('platform_donations') || '[]');
            this.ngos = JSON.parse(localStorage.getItem('platform_ngos') || '[]');
            this.selectedAmount = null;
            this.selectedPaymentMethod = null;
            this.selectedNeedId = null;
            
            // Timeline data
            this.timelineData = [
                {
                    year: "2024",
                    title: "Vision & Development",
                    description: "Platform conceptualized by Rishabh Dhami with a vision to revolutionize charitable giving",
                    icon: "lightbulb",
                    stats: ""
                },
                {
                    year: "Early 2025",
                    title: "Beta Launch",
                    description: "Launched with initial NGO partners and donor community",
                    icon: "rocket",
                    stats: "10+ NGO partners"
                },
                {
                    year: "Mid 2025",
                    title: "Growth Phase", 
                    description: "Expanded reach with advanced features and partnerships",
                    icon: "chart-line",
                    stats: "₹100K+ raised, 500+ lives impacted"
                },
                {
                    year: "Future",
                    title: "Scale & Impact",
                    description: "Target nationwide coverage with comprehensive social impact",
                    icon: "globe",
                    stats: "₹5M+ goal, 10,000+ lives to transform"
                }
            ];
            
            console.log('DonationPlatform constructor called');
            this.init();
        }

        init() {
            console.log('Initializing platform...');
            this.loadInitialData();
            this.bindAllEvents();
            this.checkUserSession();
            this.loadDynamicContent();
            this.updateRealTimeStats();
            this.startDonationAlerts();
            this.loadTimeline();
            this.setupScrollAnimations();
            console.log('Platform initialization complete');
        }

        loadInitialData() {
            if (this.users.length === 0) {
                this.users = [
                    {
                        id: 1,
                        name: "John Doe",
                        email: "john@example.com",
                        phone: "+91-9876543210",
                        type: "donor",
                        joinDate: "2024-01-15",
                        totalDonated: 5000,
                        donationsCount: 3
                    },
                    {
                        id: 2,
                        name: "Sarah Wilson", 
                        email: "sarah@example.com",
                        phone: "+91-9876543211",
                        type: "volunteer",
                        joinDate: "2024-02-20",
                        totalDonated: 2000,
                        donationsCount: 2
                    }
                ];
                this.saveToStorage('platform_users', this.users);
            }

            if (this.donations.length === 0) {
                this.donations = [
                    {
                        id: 1,
                        userId: 1,
                        amount: 2000,
                        needId: 1,
                        date: "2024-08-15",
                        method: "upi",
                        status: "completed"
                    },
                    {
                        id: 2,
                        userId: 2,
                        amount: 1500,
                        needId: 1,
                        date: "2024-08-18", 
                        method: "card",
                        status: "completed"
                    }
                ];
                this.saveToStorage('platform_donations', this.donations);
            }

            if (this.ngos.length === 0) {
                this.ngos = [
                    {
                        id: 1,
                        name: "Hope Children's Home",
                        location: "Mumbai, Maharashtra",
                        verified: true,
                        description: "Supporting orphaned children with education and care",
                        image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=300&h=200&fit=crop",
                        needs: 5,
                        totalSupported: 150,
                        established: 2010,
                        beneficiaries: 500
                    },
                    {
                        id: 2,
                        name: "Sunrise Educational Trust",
                        location: "Delhi, NCR", 
                        verified: true,
                        description: "Providing education to underprivileged children",
                        image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=300&h=200&fit=crop",
                        needs: 3,
                        totalSupported: 89,
                        established: 2008,
                        beneficiaries: 300
                    }
                ];
                this.saveToStorage('platform_ngos', this.ngos);
            }
        }

        loadTimeline() {
            const container = document.getElementById('timelineMilestones');
            if (!container) return;

            const iconMap = {
                'lightbulb': 'fas fa-lightbulb',
                'rocket': 'fas fa-rocket',
                'chart-line': 'fas fa-chart-line',
                'globe': 'fas fa-globe'
            };

            container.innerHTML = this.timelineData.map((milestone, index) => `
                <div class="milestone" data-index="${index}">
                    <div class="milestone-marker">
                        <i class="${iconMap[milestone.icon] || 'fas fa-star'}"></i>
                    </div>
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

            console.log('Timeline loaded successfully');
        }

        setupScrollAnimations() {
            // Intersection Observer for timeline animations
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const milestone = entry.target;
                        const index = milestone.dataset.index;
                        
                        setTimeout(() => {
                            milestone.classList.add('animate');
                        }, index * 200); // Stagger animation
                    }
                });
            }, {
                threshold: 0.2,
                rootMargin: '0px 0px -50px 0px'
            });

            // Observe all milestones
            document.querySelectorAll('.milestone').forEach(milestone => {
                observer.observe(milestone);
            });

            console.log('Scroll animations set up');
        }

        bindAllEvents() {
            console.log('Binding events...');
            
            // Auth buttons with null checks
            this.bindEvent('loginBtn', 'click', () => {
                console.log('Login button clicked');
                this.showModal('loginModal');
            });
            
            this.bindEvent('registerBtn', 'click', () => {
                console.log('Register button clicked');
                this.showModal('registerModal');
            });
            
            this.bindEvent('adminBtn', 'click', () => {
                console.log('Admin button clicked');
                this.showModal('adminModal');
            });
            
            this.bindEvent('logoutBtn', 'click', () => {
                console.log('Logout button clicked');
                this.logout();
            });

            // Hero buttons
            this.bindEvent('donateNowBtn', 'click', () => {
                console.log('Donate Now button clicked');
                this.showDonationModal();
            });
            
            this.bindEvent('learnMoreBtn', 'click', () => {
                console.log('Learn More button clicked');
                this.showModal('learnMoreModal');
            });

            // Navigation smooth scrolling
            this.setupSmoothScrolling();

            // Modal close buttons
            document.querySelectorAll('.modal-close').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const modal = e.target.closest('.modal');
                    if (modal) {
                        console.log('Closing modal:', modal.id);
                        this.hideModal(modal.id);
                    }
                });
            });

            // Modal overlays
            document.querySelectorAll('.modal-overlay').forEach(overlay => {
                overlay.addEventListener('click', (e) => {
                    const modal = e.target.closest('.modal');
                    if (modal) {
                        console.log('Overlay clicked, closing modal:', modal.id);
                        this.hideModal(modal.id);
                    }
                });
            });

            // Forms
            this.bindEvent('loginForm', 'submit', (e) => this.handleLogin(e));
            this.bindEvent('registerForm', 'submit', (e) => this.handleRegister(e));
            this.bindEvent('adminForm', 'submit', (e) => this.handleAdminLogin(e));

            // Social buttons
            this.bindEvent('googleLogin', 'click', () => this.handleSocialLogin('google'));
            this.bindEvent('facebookLogin', 'click', () => this.handleSocialLogin('facebook'));
            this.bindEvent('googleRegister', 'click', () => this.handleSocialLogin('google'));
            this.bindEvent('facebookRegister', 'click', () => this.handleSocialLogin('google'));

            // Success modal
            this.bindEvent('successOk', 'click', () => this.hideModal('successModal'));

            // Donation modal buttons
            this.bindEvent('proceedPayment', 'click', () => this.processPayment());

            // Close modal on Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const activeModal = document.querySelector('.modal.show');
                    if (activeModal) {
                        this.hideModal(activeModal.id);
                    }
                }
            });

            console.log('All events bound');
        }

        setupSmoothScrolling() {
            // Smooth scrolling for navigation links
            document.querySelectorAll('.nav-menu a[href^="#"]').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                        const headerHeight = document.querySelector('.header').offsetHeight;
                        const targetPosition = targetElement.offsetTop - headerHeight - 20;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                });
            });
        }

        bindEvent(elementId, eventType, handler) {
            const element = document.getElementById(elementId);
            if (element) {
                element.addEventListener(eventType, handler);
                console.log(`Bound ${eventType} event to ${elementId}`);
            } else {
                console.warn(`Element ${elementId} not found`);
            }
        }

        showModal(modalId) {
            console.log('Showing modal:', modalId);
            const modal = document.getElementById(modalId);
            if (!modal) {
                console.error(`Modal ${modalId} not found`);
                return;
            }

            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
        }

        hideModal(modalId) {
            console.log('Hiding modal:', modalId);
            const modal = document.getElementById(modalId);
            if (!modal) return;

            modal.classList.remove('show');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 250);
        }

        showLoading() {
            const loading = document.getElementById('loadingOverlay');
            if (loading) {
                loading.classList.remove('hidden');
            }
        }

        hideLoading() {
            const loading = document.getElementById('loadingOverlay');
            if (loading) {
                loading.classList.add('hidden');
            }
        }

        showSuccess(title, message, callback) {
            const titleEl = document.getElementById('successTitle');
            const messageEl = document.getElementById('successMessage');
            const okBtn = document.getElementById('successOk');

            if (titleEl) titleEl.textContent = title;
            if (messageEl) messageEl.textContent = message;
            
            if (okBtn) {
                okBtn.onclick = () => {
                    this.hideModal('successModal');
                    if (callback) callback();
                };
            }

            this.showModal('successModal');
        }

        handleLogin(e) {
            e.preventDefault();
            console.log('Handling login...');
            this.showLoading();

            const email = this.getElementValue('loginEmail');
            const password = this.getElementValue('loginPassword');

            setTimeout(() => {
                this.hideLoading();
                
                const user = this.users.find(u => u.email === email);
                if (user && password) {
                    this.currentUser = user;
                    this.saveSession();
                    this.updateAuthUI();
                    this.hideModal('loginModal');
                    this.showDashboard();
                    this.showSuccess('Welcome Back!', `Good to see you again, ${user.name}!`);
                    this.clearForm('loginForm');
                } else {
                    alert('Invalid credentials. Try email: john@example.com with any password');
                }
            }, 1000);
        }

        handleRegister(e) {
            e.preventDefault();
            console.log('Handling registration...');
            this.showLoading();

            const name = this.getElementValue('registerName');
            const email = this.getElementValue('registerEmail');
            const phone = this.getElementValue('registerPhone');
            const password = this.getElementValue('registerPassword');
            const userType = this.getElementValue('registerUserType');

            setTimeout(() => {
                this.hideLoading();

                if (this.users.find(u => u.email === email)) {
                    alert('Email already exists. Please use a different email or login.');
                    return;
                }

                const newUser = {
                    id: Date.now(),
                    name,
                    email,
                    phone,
                    type: userType,
                    joinDate: new Date().toISOString().split('T')[0],
                    totalDonated: 0,
                    donationsCount: 0
                };

                this.users.push(newUser);
                this.saveToStorage('platform_users', this.users);
                this.updateRealTimeStats();

                this.hideModal('registerModal');
                this.showSuccess('Registration Successful!', 'Please login with your new account.', () => {
                    this.showModal('loginModal');
                    this.setElementValue('loginEmail', email);
                });
                
                this.clearForm('registerForm');
            }, 1000);
        }

        handleAdminLogin(e) {
            e.preventDefault();
            console.log('Handling admin login...');
            this.showLoading();

            const email = this.getElementValue('adminEmail');
            const password = this.getElementValue('adminPassword');

            setTimeout(() => {
                this.hideLoading();

                if (email === 'rishabhdhami@gmail.com' && password === 'RD2006') {
                    this.isAdmin = true;
                    this.saveSession();
                    this.updateAuthUI();
                    this.hideModal('adminModal');
                    this.showAdminDashboard();
                    this.showSuccess('Admin Access Granted', 'Welcome to the admin dashboard!');
                    this.clearForm('adminForm');
                } else {
                    alert('Invalid admin credentials. Use: rishabhdhami@gmail.com / RD2006');
                }
            }, 1000);
        }

        handleSocialLogin(provider) {
            console.log(`Social login with ${provider}`);
            this.showLoading();

            setTimeout(() => {
                this.hideLoading();

                const socialUser = {
                    id: Date.now(),
                    name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
                    email: `user@${provider}.com`,
                    phone: '+91-9876543210',
                    type: 'donor',
                    joinDate: new Date().toISOString().split('T')[0],
                    totalDonated: 0,
                    donationsCount: 0
                };

                this.currentUser = socialUser;
                this.users.push(socialUser);
                this.saveToStorage('platform_users', this.users);
                this.saveSession();
                this.updateAuthUI();
                this.hideModal('loginModal');
                this.hideModal('registerModal');
                this.showDashboard();
                this.updateRealTimeStats();

                this.showSuccess(`${provider.charAt(0).toUpperCase() + provider.slice(1)} Login Success`, 
                               `Welcome! You're now logged in with ${provider}.`);
            }, 1500);
        }

        logout() {
            console.log('Logging out...');
            this.currentUser = null;
            this.isAdmin = false;
            this.clearSession();
            this.updateAuthUI();
            this.hideDashboards();
            this.showSuccess('Logged Out', 'You have been successfully logged out.');
        }

        showDonationModal(needId = null) {
            console.log('Showing donation modal for need:', needId);
            
            if (!this.currentUser) {
                this.showSuccess('Login Required', 'Please login to make a donation.', () => {
                    this.showModal('loginModal');
                });
                return;
            }

            this.selectedNeedId = needId;
            this.showModal('donationModal');
            this.setupDonationModal();
        }

        setupDonationModal() {
            // Setup amount buttons
            document.querySelectorAll('.amount-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    this.selectedAmount = parseInt(e.target.dataset.amount);
                    this.setElementValue('customAmount', '');
                });
            });

            // Setup payment buttons
            document.querySelectorAll('.payment-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    this.selectedPaymentMethod = e.target.dataset.method;
                });
            });

            // Custom amount input
            const customAmountEl = document.getElementById('customAmount');
            if (customAmountEl) {
                customAmountEl.addEventListener('input', () => {
                    document.querySelectorAll('.amount-btn').forEach(btn => btn.classList.remove('active'));
                    this.selectedAmount = null;
                });
            }
        }

        processPayment() {
            console.log('Processing payment...');
            
            const customAmount = this.getElementValue('customAmount');
            const amount = customAmount ? parseInt(customAmount) : this.selectedAmount;

            if (!amount || amount < 100) {
                alert('Please select or enter a valid amount (minimum ₹100)');
                return;
            }

            if (!this.selectedPaymentMethod) {
                alert('Please select a payment method');
                return;
            }

            this.showLoading();
            this.hideModal('donationModal');

            setTimeout(() => {
                this.hideLoading();

                const donation = {
                    id: Date.now(),
                    userId: this.currentUser.id,
                    amount: amount,
                    needId: this.selectedNeedId || 1,
                    date: new Date().toISOString().split('T')[0],
                    method: this.selectedPaymentMethod,
                    status: 'completed'
                };

                this.donations.push(donation);
                this.saveToStorage('platform_donations', this.donations);

                // Update user stats
                this.currentUser.totalDonated = (this.currentUser.totalDonated || 0) + amount;
                this.currentUser.donationsCount = (this.currentUser.donationsCount || 0) + 1;

                const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
                if (userIndex !== -1) {
                    this.users[userIndex] = this.currentUser;
                    this.saveToStorage('platform_users', this.users);
                }

                this.saveSession();
                this.updateRealTimeStats();
                this.resetDonationForm();

                this.showSuccess('Donation Successful!', 
                    `Thank you for your donation of ₹${amount.toLocaleString()}! You're making a real difference.`, () => {
                    if (this.currentUser) this.showDashboard();
                });

                this.showDonationAlert(this.currentUser.name, amount);
            }, 2000);
        }

        resetDonationForm() {
            document.querySelectorAll('.amount-btn, .payment-btn').forEach(btn => btn.classList.remove('active'));
            this.setElementValue('customAmount', '');
            this.selectedAmount = null;
            this.selectedPaymentMethod = null;
        }

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
            this.setElementText('userName', this.currentUser.name);
            this.setElementText('userDonations', this.currentUser.donationsCount || 0);
            this.setElementText('userImpact', Math.floor((this.currentUser.totalDonated || 0) / 100));
            this.loadUserDonationHistory();
            this.loadRecommendedNeeds();
        }

        showAdminDashboard() {
            if (!this.isAdmin) return;

            this.hideDashboards();
            
            const dashboard = document.getElementById('adminDashboard');
            if (dashboard) {
                dashboard.classList.remove('hidden');
                this.updateAdminStats();
                this.loadUsersTable();
                this.setupAdminTabs();
            }
        }

        setupAdminTabs() {
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const tabId = e.target.dataset.tab;
                    this.switchAdminTab(tabId);
                });
            });
        }

        switchAdminTab(tabId) {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

            const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
            const activeContent = document.getElementById(`${tabId}Tab`);

            if (activeBtn) activeBtn.classList.add('active');
            if (activeContent) activeContent.classList.add('active');

            switch(tabId) {
                case 'users':
                    this.loadUsersTable();
                    break;
                case 'donations':
                    this.loadDonationsTable();
                    break;
                case 'ngos':
                    this.loadNGOsTable();
                    break;
                case 'analytics':
                    this.loadAnalytics();
                    break;
            }
        }

        updateAdminStats() {
            this.setElementText('adminTotalUsers', this.users.length);
            
            const totalRaised = this.donations.reduce((sum, donation) => sum + donation.amount, 0);
            this.setElementText('adminTotalDonations', `₹${totalRaised.toLocaleString()}`);
            
            this.setElementText('adminActiveNGOs', this.ngos.length);
        }

        hideDashboards() {
            const userDashboard = document.getElementById('userDashboard');
            const adminDashboard = document.getElementById('adminDashboard');

            if (userDashboard) userDashboard.classList.add('hidden');
            if (adminDashboard) adminDashboard.classList.add('hidden');
        }

        loadUsersTable() {
            const container = document.getElementById('usersTable');
            if (!container) return;

            if (this.users.length === 0) {
                container.innerHTML = '<p>No users registered yet.</p>';
                return;
            }

            container.innerHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Type</th>
                            <th>Join Date</th>
                            <th>Total Donated</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.users.map(user => `
                            <tr>
                                <td>${user.name}</td>
                                <td>${user.email}</td>
                                <td><span class="status status--info">${user.type}</span></td>
                                <td>${user.joinDate}</td>
                                <td>₹${(user.totalDonated || 0).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }

        loadDonationsTable() {
            const container = document.getElementById('donationsTable');
            if (!container) return;

            if (this.donations.length === 0) {
                container.innerHTML = '<p>No donations recorded yet.</p>';
                return;
            }

            container.innerHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Donor</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Method</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.donations.map(donation => {
                            const user = this.users.find(u => u.id === donation.userId);
                            return `
                                <tr>
                                    <td>${user ? user.name : 'Unknown'}</td>
                                    <td>₹${donation.amount.toLocaleString()}</td>
                                    <td>${donation.date}</td>
                                    <td>${donation.method.toUpperCase()}</td>
                                    <td><span class="status status--success">${donation.status}</span></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        }

        loadNGOsTable() {
            const container = document.getElementById('ngosTable');
            if (!container) return;

            container.innerHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Location</th>
                            <th>Verified</th>
                            <th>Beneficiaries</th>
                            <th>Established</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.ngos.map(ngo => `
                            <tr>
                                <td>${ngo.name}</td>
                                <td>${ngo.location}</td>
                                <td><span class="status ${ngo.verified ? 'status--success' : 'status--warning'}">${ngo.verified ? 'Verified' : 'Pending'}</span></td>
                                <td>${ngo.beneficiaries}</td>
                                <td>${ngo.established}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }

        loadAnalytics() {
            const container = document.getElementById('analyticsContent');
            if (!container) return;

            const totalRaised = this.donations.reduce((sum, donation) => sum + donation.amount, 0);
            const avgDonation = this.donations.length ? totalRaised / this.donations.length : 0;
            const topDonor = this.users.reduce((top, user) => 
                (user.totalDonated || 0) > (top.totalDonated || 0) ? user : top, {totalDonated: 0});

            container.innerHTML = `
                <div class="analytics-grid">
                    <div class="analytics-card">
                        <h4>Platform Overview</h4>
                        <div class="analytics-stats">
                            <div class="analytics-stat">
                                <span class="stat-label">Total Users</span>
                                <span class="stat-value">${this.users.length}</span>
                            </div>
                            <div class="analytics-stat">
                                <span class="stat-label">Total Raised</span>
                                <span class="stat-value">₹${totalRaised.toLocaleString()}</span>
                            </div>
                            <div class="analytics-stat">
                                <span class="stat-label">Avg Donation</span>
                                <span class="stat-value">₹${Math.round(avgDonation).toLocaleString()}</span>
                            </div>
                            <div class="analytics-stat">
                                <span class="stat-label">Top Donor</span>
                                <span class="stat-value">${topDonor.name || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        loadUserDonationHistory() {
            const container = document.getElementById('userDonationHistory');
            if (!container || !this.currentUser) return;

            const userDonations = this.donations.filter(d => d.userId === this.currentUser.id);

            if (userDonations.length === 0) {
                container.innerHTML = '<p class="empty-state">No donations yet. Start making a difference today!</p>';
                return;
            }

            container.innerHTML = userDonations.slice(-3).reverse().map(donation => `
                <div class="donation-item">
                    <div class="donation-info">
                        <span class="donation-amount">₹${donation.amount.toLocaleString()}</span>
                        <span class="donation-date">${donation.date}</span>
                    </div>
                    <span class="donation-status status--success">Completed</span>
                </div>
            `).join('');
        }

        loadRecommendedNeeds() {
            const container = document.getElementById('recommendedNeeds');
            if (!container) return;

            const recommendations = [
                { title: "Help Build a School Library", amount: "₹25,000 needed", impact: "Will benefit 300+ students" },
                { title: "Sponsor a Child's Education", amount: "₹12,000 needed", impact: "Full year education support" }
            ];

            container.innerHTML = recommendations.map(rec => `
                <div class="recommendation-item">
                    <h4>${rec.title}</h4>
                    <p class="rec-amount">${rec.amount}</p>
                    <p class="rec-impact">${rec.impact}</p>
                    <button class="btn btn--primary btn--sm rec-donate-btn">Donate</button>
                </div>
            `).join('');

            // Add event listeners to recommendation buttons
            container.querySelectorAll('.rec-donate-btn').forEach(btn => {
                btn.addEventListener('click', () => this.showDonationModal());
            });
        }

        showDonationAlert(donorName, amount) {
            const container = document.getElementById('donationAlerts');
            if (!container) return;

            const alert = document.createElement('div');
            alert.className = 'donation-alert';
            alert.innerHTML = `
                <div class="alert-content">
                    <div class="alert-icon">
                        <i class="fas fa-heart"></i>
                    </div>
                    <div class="alert-text">
                        <div class="alert-name">${donorName}</div>
                        <div class="alert-donation">just donated ₹${amount.toLocaleString()}</div>
                    </div>
                </div>
            `;

            container.appendChild(alert);

            setTimeout(() => {
                alert.classList.add('fade-out');
                setTimeout(() => alert.remove(), 500);
            }, 5000);
        }

        startDonationAlerts() {
            const donors = ['Priya Sharma', 'Rajesh Kumar', 'Anjali Patel', 'Vikram Singh', 'Meera Reddy'];
            const amounts = [500, 1000, 1500, 2000, 2500];

            setInterval(() => {
                const randomDonor = donors[Math.floor(Math.random() * donors.length)];
                const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
                this.showDonationAlert(randomDonor, randomAmount);
            }, 20000);
        }

        updateRealTimeStats() {
            const baseDonations = 5200000;
            const totalRaised = baseDonations + this.donations.reduce((sum, d) => sum + d.amount, 0);
            const peopleHelped = 15000 + Math.floor(totalRaised / 500);
            const activeUsers = 1200 + this.users.length;

            this.setElementText('totalRaised', `₹${(totalRaised / 1000000).toFixed(1)}M+`);
            this.setElementText('peopleHelped', `${Math.floor(peopleHelped / 1000)}k+`);
            this.setElementText('activeUsers', `${Math.floor(activeUsers / 100)}00+`);
        }

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
                    description: "Urgent need for warm clothes as severe winter approaches. These children in remote areas are facing harsh cold without proper winter clothing.",
                    targetAmount: 50000,
                    raisedAmount: 12000 + this.donations.filter(d => d.needId === 1).reduce((sum, d) => sum + d.amount, 0),
                    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
                    daysLeft: 10
                },
                {
                    id: 2,
                    title: "Educational Supplies for Rural Schools",
                    priority: "High",
                    description: "Books, stationery, and learning materials needed for 200 students in remote village schools.",
                    targetAmount: 75000,
                    raisedAmount: 25000,
                    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
                    daysLeft: 15
                },
                {
                    id: 3,
                    title: "Medical Equipment for Village Clinic",
                    priority: "Critical",
                    description: "Essential medical equipment and supplies needed for a village clinic serving 500+ families.",
                    targetAmount: 100000,
                    raisedAmount: 35000,
                    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop",
                    daysLeft: 8
                }
            ];

            container.innerHTML = urgentNeeds.map(need => {
                const progressPercentage = Math.min((need.raisedAmount / need.targetAmount) * 100, 100);
                
                return `
                    <div class="need-card">
                        <div class="need-image" style="background-image: url('${need.image}')">
                            <span class="need-priority">${need.priority}</span>
                        </div>
                        <div class="need-content">
                            <h3 class="need-title">${need.title}</h3>
                            <p class="need-description">${need.description}</p>
                            <div class="need-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                                </div>
                                <div class="progress-text">
                                    <span>₹${need.raisedAmount.toLocaleString()} raised</span>
                                    <span>₹${need.targetAmount.toLocaleString()} goal</span>
                                </div>
                            </div>
                            <div class="need-footer">
                                <div class="need-deadline">
                                    <i class="fas fa-clock"></i>
                                    <span>${need.daysLeft} days left</span>
                                </div>
                                <button class="btn btn--primary btn--sm need-donate-btn" data-need-id="${need.id}">
                                    Donate Now
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            // Add event listeners to need donate buttons
            container.querySelectorAll('.need-donate-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const needId = parseInt(e.target.dataset.needId);
                    this.showDonationModal(needId);
                });
            });
        }

        loadPartnersGrid() {
            const container = document.getElementById('partnersGrid');
            if (!container) return;

            const partners = [
                {
                    name: "Hope Children's Home",
                    location: "Mumbai, Maharashtra",
                    verified: true,
                    description: "Supporting orphaned children with education and care",
                    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=300&h=200&fit=crop",
                    beneficiaries: 500,
                    needs: 5,
                    established: 2010
                },
                {
                    name: "Sunrise Educational Trust",
                    location: "Delhi, NCR",
                    verified: true,
                    description: "Providing education to underprivileged children",
                    image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=300&h=200&fit=crop",
                    beneficiaries: 300,
                    needs: 3,
                    established: 2008
                },
                {
                    name: "Green Earth Foundation",
                    location: "Bangalore, Karnataka",
                    verified: true,
                    description: "Environmental conservation and tree plantation",
                    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop",
                    beneficiaries: 200,
                    needs: 2,
                    established: 2015
                }
            ];

            container.innerHTML = partners.map(partner => `
                <div class="partner-card">
                    <div class="partner-image" style="background-image: url('${partner.image}')"></div>
                    <div class="partner-content">
                        <div class="partner-header">
                            <h3 class="partner-name">${partner.name}</h3>
                            ${partner.verified ? '<span class="verified-badge">Verified</span>' : ''}
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
                                <span class="partner-stat-label">Established</span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        checkUserSession() {
            const savedUser = localStorage.getItem('current_user');
            const savedAdmin = localStorage.getItem('is_admin');

            if (savedUser) {
                this.currentUser = JSON.parse(savedUser);
                this.updateAuthUI();
                if (!this.isAdmin) this.showDashboard();
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

        // Helper methods
        getElementValue(id) {
            const el = document.getElementById(id);
            return el ? el.value : '';
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
            const form = document.getElementById(formId);
            if (form) form.reset();
        }

        saveSession() {
            if (this.currentUser) {
                localStorage.setItem('current_user', JSON.stringify(this.currentUser));
            }
            localStorage.setItem('is_admin', this.isAdmin.toString());
        }

        clearSession() {
            localStorage.removeItem('current_user');
            localStorage.removeItem('is_admin');
        }

        saveToStorage(key, data) {
            localStorage.setItem(key, JSON.stringify(data));
        }
    }

    // Initialize platform when DOM is ready
    function initializePlatform() {
        console.log('DOM ready, initializing platform...');
        window.donationPlatform = new DonationPlatform();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePlatform);
    } else {
        initializePlatform();
    }

})();
