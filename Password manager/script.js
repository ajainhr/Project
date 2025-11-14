// Password Manager Application
class PasswordManager {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('passwordManagerUsers')) || [];
        this.passwords = JSON.parse(localStorage.getItem('passwordManagerPasswords')) || [];
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.checkLoginStatus();
        this.setupDefaultAdmin();
    }
    
    setupEventListeners() {
        // Login form (for both user and admin login)
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login();
            });
        }

        // Admin login form
        const adminLoginForm = document.getElementById('admin-login-form');
        if (adminLoginForm) {
            adminLoginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.adminLogin();
            });
        }
        
        // Register form (if exists)
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.register();
            });
        }
        
        // Role selection (if exists)
        document.querySelectorAll('.role-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.role-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                document.getElementById('reg-role').value = option.dataset.role;
            });
        });
        
        // Sidebar navigation (for dashboard pages)
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            if (link.getAttribute('data-page')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showPage(link.getAttribute('data-page'));
                    
                    // Update active state
                    document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
                    link.classList.add('active');
                });
            }
        });
        
        // Logout buttons
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        const adminLogoutBtn = document.getElementById('admin-logout-btn');
        if (adminLogoutBtn) {
            adminLogoutBtn.addEventListener('click', () => {
                this.adminLogout();
            });
        }
        
        // Add password form
        const addPasswordForm = document.getElementById('add-password-form');
        if (addPasswordForm) {
            addPasswordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addPassword();
            });
        }

        // Create user form (admin)
        const createUserForm = document.getElementById('create-user-form');
        if (createUserForm) {
            createUserForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createUser();
            });
        }

        // Change password form (user)
        const changePasswordForm = document.getElementById('change-password-form');
        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.changePassword();
            });
        }
        
        // Add new password button
        const addNewBtn = document.getElementById('add-new-btn');
        if (addNewBtn) {
            addNewBtn.addEventListener('click', () => {
                this.showPage('add-password');
                document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
                document.querySelector('[data-page="add-password"]').classList.add('active');
            });
        }
        
        // Back to passwords button
        const backToPasswords = document.getElementById('back-to-passwords');
        if (backToPasswords) {
            backToPasswords.addEventListener('click', () => {
                this.showPage('passwords');
                document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
                document.querySelector('[data-page="passwords"]').classList.add('active');
            });
        }

        // Back to dashboard button
        const backToDashboard = document.getElementById('back-to-dashboard');
        if (backToDashboard) {
            backToDashboard.addEventListener('click', () => {
                this.showPage('dashboard');
                document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
                document.querySelector('[data-page="dashboard"]').classList.add('active');
            });
        }
        
        // Cancel add password
        const cancelAddPassword = document.getElementById('cancel-add-password');
        if (cancelAddPassword) {
            cancelAddPassword.addEventListener('click', () => {
                this.showPage('passwords');
                document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
                document.querySelector('[data-page="passwords"]').classList.add('active');
            });
        }
        
        // View all passwords button
        const viewAllBtn = document.getElementById('view-all-btn');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                this.showPage('passwords');
                document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
                document.querySelector('[data-page="passwords"]').classList.add('active');
            });
        }
        
        // Refresh button
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadDashboard();
            });
        }
        
        // Refresh all passwords button
        const refreshAllPasswords = document.getElementById('refresh-all-passwords');
        if (refreshAllPasswords) {
            refreshAllPasswords.addEventListener('click', () => {
                this.loadAllUserPasswords();
            });
        }

        // Refresh users button (admin)
        const refreshUsers = document.getElementById('refresh-users');
        if (refreshUsers) {
            refreshUsers.addEventListener('click', () => {
                this.loadUserManagement();
            });
        }

        // Refresh users button (admin dashboard)
        const refreshUsersBtn = document.getElementById('refresh-users-btn');
        if (refreshUsersBtn) {
            refreshUsersBtn.addEventListener('click', () => {
                this.loadUserManagement();
            });
        }

        // Refresh stats button (admin)
        const refreshStatsBtn = document.getElementById('refresh-stats-btn');
        if (refreshStatsBtn) {
            refreshStatsBtn.addEventListener('click', () => {
                this.loadSystemStats();
            });
        }
        
        // Toggle password visibility
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('toggle-password')) {
                this.togglePasswordVisibility(e.target);
            }
            
            if (e.target.classList.contains('action-btn') && e.target.classList.contains('view')) {
                this.togglePasswordDisplay(e.target.closest('.password-item'));
            }
            
            if (e.target.classList.contains('action-btn') && e.target.classList.contains('delete')) {
                const passwordItem = e.target.closest('.password-item');
                const isAdminView = document.getElementById('all-passwords-page') && 
                                   !document.getElementById('all-passwords-page').classList.contains('hidden');
                
                if (isAdminView) {
                    this.deletePasswordAsAdmin(passwordItem.dataset.id);
                } else {
                    this.deletePassword(passwordItem.dataset.id);
                }
            }
        });
        
        // Export buttons
        const exportAllBtn = document.getElementById('export-all-btn');
        if (exportAllBtn) {
            exportAllBtn.addEventListener('click', () => {
                this.exportData('json');
            });
        }

        const exportPasswordsBtn = document.getElementById('export-passwords-btn');
        if (exportPasswordsBtn) {
            exportPasswordsBtn.addEventListener('click', () => {
                this.exportData('json');
            });
        }
        
        // Search
        const searchPasswords = document.getElementById('search-passwords');
        if (searchPasswords) {
            searchPasswords.addEventListener('input', (e) => {
                this.filterPasswords(e.target.value);
            });
        }
        
        const searchAllPasswords = document.getElementById('search-all-passwords');
        if (searchAllPasswords) {
            searchAllPasswords.addEventListener('input', (e) => {
                this.filterAllPasswords(e.target.value);
            });
        }
        
        // Username validation
        const regUsername = document.getElementById('reg-username');
        if (regUsername) {
            regUsername.addEventListener('input', (e) => {
                this.validateUsername(e.target);
            });
        }
        
        const username = document.getElementById('username');
        if (username) {
            username.addEventListener('input', (e) => {
                this.validateUsername(e.target);
            });
        }

        const newUsername = document.getElementById('new-username');
        if (newUsername) {
            newUsername.addEventListener('input', (e) => {
                this.validateNewUsername(e.target);
            });
        }
        
        // Email validation
        const regEmail = document.getElementById('reg-email');
        if (regEmail) {
            regEmail.addEventListener('input', (e) => {
                this.validateEmail(e.target);
            });
        }

        const newEmail = document.getElementById('new-email');
        if (newEmail) {
            newEmail.addEventListener('input', (e) => {
                this.validateNewEmail(e.target);
            });
        }
        
        // Password confirmation validation
        const regConfirmPassword = document.getElementById('reg-confirm-password');
        if (regConfirmPassword) {
            regConfirmPassword.addEventListener('input', (e) => {
                this.validatePasswordConfirmation();
            });
        }

        const confirmNewPassword = document.getElementById('confirm-new-password');
        if (confirmNewPassword) {
            confirmNewPassword.addEventListener('input', () => {
                this.validateNewPasswordConfirmation();
            });
        }

        // Dynamic event listeners for admin actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-user')) {
                const userId = e.target.getAttribute('data-id');
                this.deleteUser(userId);
            }

            if (e.target.classList.contains('reset-password')) {
                const userId = e.target.getAttribute('data-id');
                this.resetUserPassword(userId);
            }
        });
    }
    
    validateUsername(input) {
        const value = input.value.trim();
        const errorElement = document.getElementById(input.id === 'reg-username' ? 'reg-username-error' : 'username-error');
        
        if (!errorElement) return true;
        
        if (value.length < 7 || value.length > 8) {
            input.classList.add('input-error');
            errorElement.style.display = 'block';
            return false;
        } else {
            input.classList.remove('input-error');
            errorElement.style.display = 'none';
            return true;
        }
    }

    validateNewUsername(input) {
        const value = input.value.trim();
        const errorElement = document.getElementById('new-username-error');
        
        if (!errorElement) return true;
        
        if (value.length < 7 || value.length > 8) {
            input.classList.add('input-error');
            errorElement.style.display = 'block';
            return false;
        } else {
            input.classList.remove('input-error');
            errorElement.style.display = 'none';
            return true;
        }
    }
    
    validateEmail(input) {
        const value = input.value.trim();
        const errorElement = document.getElementById('reg-email-error');
        
        if (!errorElement) return true;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(value)) {
            input.classList.add('input-error');
            errorElement.style.display = 'block';
            return false;
        } else {
            input.classList.remove('input-error');
            errorElement.style.display = 'none';
            return true;
        }
    }

    validateNewEmail(input) {
        const value = input.value.trim();
        const errorElement = document.getElementById('new-email-error');
        
        if (!errorElement) return true;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(value)) {
            input.classList.add('input-error');
            errorElement.style.display = 'block';
            return false;
        } else {
            input.classList.remove('input-error');
            errorElement.style.display = 'none';
            return true;
        }
    }
    
    validatePasswordConfirmation() {
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;
        const errorElement = document.getElementById('reg-password-error');
        
        if (!errorElement) return true;
        
        if (password !== confirmPassword) {
            document.getElementById('reg-confirm-password').classList.add('input-error');
            errorElement.style.display = 'block';
            return false;
        } else {
            document.getElementById('reg-confirm-password').classList.remove('input-error');
            errorElement.style.display = 'none';
            return true;
        }
    }

    validateNewPasswordConfirmation() {
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-new-password').value;
        const errorElement = document.getElementById('password-match-error');
        
        if (!errorElement) return true;
        
        if (newPassword !== confirmPassword) {
            document.getElementById('confirm-new-password').classList.add('input-error');
            errorElement.style.display = 'block';
            return false;
        } else {
            document.getElementById('confirm-new-password').classList.remove('input-error');
            errorElement.style.display = 'none';
            return true;
        }
    }
    
    showPage(page) {
        document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
        const pageElement = document.getElementById(`${page}-page`);
        if (pageElement) {
            pageElement.classList.remove('hidden');
        }
        
        if (page === 'dashboard') {
            this.loadDashboard();
        } else if (page === 'passwords') {
            this.loadPasswords();
        } else if (page === 'admin') {
            this.loadAdminPanel();
        } else if (page === 'all-passwords') {
            this.loadAllUserPasswords();
        } else if (page === 'user-management') {
            this.loadUserManagement();
        } else if (page === 'system-stats') {
            this.loadSystemStats();
        } else if (page === 'change-password') {
            // Just show the page, no data to load
        }
    }
    
    setupDefaultAdmin() {
        if (this.users.length === 0) {
            const defaultAdmin = {
                id: '1',
                username: 'admin123',
                email: 'admin@securepass.com',
                password: 'admin123',
                role: 'admin',
                createdAt: new Date().toLocaleDateString(),
                lastLogin: new Date().toLocaleString()
            };
            this.users.push(defaultAdmin);
            localStorage.setItem('passwordManagerUsers', JSON.stringify(this.users));
        }
    }
    
    checkLoginStatus() {
        // Check for user login status
        if (window.location.pathname.includes('user_dashboard.html')) {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser && currentUser.role === 'user') {
                this.currentUser = currentUser;
                this.loadDashboard();
                this.updateUI();
            } else {
                window.location.href = 'index.html';
            }
        }
        
        // Check for admin login status
        if (window.location.pathname.includes('admin_dashboard.html')) {
            const currentAdmin = JSON.parse(localStorage.getItem('currentAdmin'));
            if (currentAdmin && currentAdmin.role === 'admin') {
                this.currentUser = currentAdmin;
                this.updateAdminUI();
                this.loadUserManagement();
            } else {
                window.location.href = 'admin_login.html';
            }
        }
    }
    
    login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Validate username length
        if (!this.validateUsername(document.getElementById('username'))) {
            return;
        }
        
        const user = this.users.find(u => u.username === username && u.password === password && u.role === 'user');
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Update last login
            user.lastLogin = new Date().toLocaleString();
            localStorage.setItem('passwordManagerUsers', JSON.stringify(this.users));
            
            // Redirect to user dashboard
            window.location.href = '/user_dashboard.html';
        } else {
            alert('Invalid credentials! Please contact administrator if you need an account.');
        }
    }

    adminLogin() {
        const username = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;

        const admin = this.users.find(u => u.username === username && u.password === password && u.role === 'admin');

        if (admin) {
            // Update last login
            admin.lastLogin = new Date().toLocaleString();
            localStorage.setItem('passwordManagerUsers', JSON.stringify(this.users));
            
            localStorage.setItem('currentAdmin', JSON.stringify(admin));
            window.location.href = '/admin_dashboard.html';
        } else {
            alert('Invalid admin credentials!');
        }
    }
    
    register() {
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;
        const role = document.getElementById('reg-role').value;
        
        // Validate inputs
        if (!this.validateUsername(document.getElementById('reg-username'))) {
            return;
        }
        
        if (!this.validateEmail(document.getElementById('reg-email'))) {
            return;
        }
        
        if (!this.validatePasswordConfirmation()) {
            return;
        }
        
        if (this.users.find(u => u.username === username)) {
            alert('Username already exists!');
            return;
        }
        
        if (this.users.find(u => u.email === email)) {
            alert('Email already registered!');
            return;
        }
        
        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password,
            role,
            createdAt: new Date().toLocaleDateString(),
            lastLogin: new Date().toLocaleString()
        };
        
        this.users.push(newUser);
        localStorage.setItem('passwordManagerUsers', JSON.stringify(this.users));
        
        alert(`Registration successful! You can now login as ${role}.`);
        window.location.href = 'index.html';
    }

    createUser() {
        const username = document.getElementById('new-username').value;
        const email = document.getElementById('new-email').value;
        const password = document.getElementById('new-password').value;

        if (!this.validateNewUsername(document.getElementById('new-username')) || 
            !this.validateNewEmail(document.getElementById('new-email'))) {
            return;
        }

        if (this.users.find(u => u.username === username)) {
            alert('Username already exists!');
            return;
        }

        if (this.users.find(u => u.email === email)) {
            alert('Email already registered!');
            return;
        }

        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password,
            role: 'user',
            createdAt: new Date().toLocaleDateString(),
            lastLogin: 'Never'
        };

        this.users.push(newUser);
        localStorage.setItem('passwordManagerUsers', JSON.stringify(this.users));

        alert(`User ${username} created successfully!`);
        document.getElementById('create-user-form').reset();
        this.loadUserManagement();
    }
    
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }

    adminLogout() {
        this.currentUser = null;
        localStorage.removeItem('currentAdmin');
        window.location.href = 'admin_login.html';
    }
    
    updateUI() {
        // Update user info
        document.getElementById('user-name').textContent = this.currentUser.username;
        document.getElementById('user-role').textContent = this.currentUser.role.charAt(0).toUpperCase() + this.currentUser.role.slice(1);
        document.getElementById('user-avatar').textContent = this.currentUser.username.charAt(0).toUpperCase();
        document.getElementById('welcome-message').textContent = `Welcome back, ${this.currentUser.username}!`;
        
        // Show/hide admin menu
        if (this.currentUser.role === 'admin') {
            document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
        } else {
            document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
        }
    }

    updateAdminUI() {
        document.getElementById('admin-name').textContent = this.currentUser.username;
        document.getElementById('admin-avatar').textContent = this.currentUser.username.charAt(0).toUpperCase();
    }
    
    loadDashboard() {
        // Update stats
        const userPasswords = this.passwords.filter(p => p.userId === this.currentUser.id);
        document.getElementById('total-passwords').textContent = userPasswords.length;
        document.getElementById('last-login').textContent = this.currentUser.lastLogin || 'Today';
        
        // Calculate security score
        const securityScore = userPasswords.length > 0 ? Math.min(100, userPasswords.length * 10) : 0;
        document.getElementById('security-score').textContent = `${securityScore}%`;
        
        // Load recent passwords
        this.displayPasswords(userPasswords.slice(-5), 'recent-passwords');
    }
    
    loadPasswords() {
        const userPasswords = this.passwords.filter(p => p.userId === this.currentUser.id);
        this.displayPasswords(userPasswords, 'all-passwords');
    }
    
    displayPasswords(passwords, containerId, showOwner = false) {
        const container = document.getElementById(containerId);
        
        if (!container) return;
        
        if (passwords.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div>🔒</div>
                    <h3>No passwords saved yet</h3>
                    <p>Add your first password to get started</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        passwords.forEach(password => {
            const passwordEl = document.createElement('div');
            passwordEl.className = 'password-item';
            passwordEl.dataset.id = password.id;
            
            let ownerInfo = '';
            if (showOwner) {
                const owner = this.users.find(u => u.id === password.userId);
                ownerInfo = `<div class="user-badge">👤 ${owner ? owner.username : 'Unknown'}</div>`;
            }
            
            passwordEl.innerHTML = `
                <div class="password-info">
                    <h3>${this.escapeHtml(password.service)} ${ownerInfo}</h3>
                    <p>${this.escapeHtml(password.username)}</p>
                    <div class="password-value hidden">${this.escapeHtml(password.password)}</div>
                </div>
                <div class="password-actions">
                    <button class="action-btn view" title="View Password">👁️</button>
                    <button class="action-btn delete" title="Delete Password">🗑️</button>
                </div>
            `;
            
            container.appendChild(passwordEl);
        });
    }
    
    loadAllUserPasswords() {
        // Show all passwords for all users (admin only)
        this.displayPasswords(this.passwords, 'all-user-passwords', true);
    }

    loadAllPasswords() {
        this.displayAllPasswords(this.passwords);
    }

    displayAllPasswords(passwords) {
        const container = document.getElementById('all-passwords-list');
        
        if (!container) return;
        
        if (passwords.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div>🔒</div>
                    <h3>No passwords stored yet</h3>
                    <p>Users haven't added any passwords</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';

        passwords.forEach(password => {
            const owner = this.users.find(u => u.id === password.userId);
            const passwordEl = document.createElement('div');
            passwordEl.className = 'password-item';
            passwordEl.innerHTML = `
                <div class="password-info">
                    <h3>${this.escapeHtml(password.service)} 
                        <span class="user-badge">👤 ${owner ? owner.username : 'Unknown'}</span>
                    </h3>
                    <p>${this.escapeHtml(password.username)}</p>
                    <div class="password-value">${this.escapeHtml(password.password)}</div>
                </div>
                <div class="password-actions">
                    <button class="action-btn delete" data-id="${password.id}" title="Delete Password">🗑️</button>
                </div>
            `;
            container.appendChild(passwordEl);
        });

        // Add delete event listeners
        document.querySelectorAll('.password-actions .delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const passwordId = e.target.getAttribute('data-id');
                this.deletePassword(passwordId);
            });
        });
    }
    
    addPassword() {
        const service = document.getElementById('service-name').value;
        const username = document.getElementById('account-username').value;
        const password = document.getElementById('account-password').value;
        const notes = document.getElementById('password-notes').value;
        
        if (!service || !username || !password) {
            alert('Please fill in all required fields');
            return;
        }
        
        const newPassword = {
            id: Date.now().toString(),
            userId: this.currentUser.id,
            service,
            username,
            password,
            notes,
            createdAt: new Date().toLocaleString()
        };
        
        this.passwords.push(newPassword);
        localStorage.setItem('passwordManagerPasswords', JSON.stringify(this.passwords));
        
        alert('Password saved successfully!');
        document.getElementById('add-password-form').reset();
        this.showPage('passwords');
    }
    
    deletePassword(id) {
        if (confirm('Are you sure you want to delete this password?')) {
            this.passwords = this.passwords.filter(p => p.id !== id);
            localStorage.setItem('passwordManagerPasswords', JSON.stringify(this.passwords));
            
            // Refresh the display
            if (document.getElementById('passwords-page').classList.contains('hidden')) {
                this.loadDashboard();
            } else {
                this.loadPasswords();
            }
        }
    }
    
    deletePasswordAsAdmin(id) {
        if (confirm('Are you sure you want to delete this password? This action cannot be undone.')) {
            this.passwords = this.passwords.filter(p => p.id !== id);
            localStorage.setItem('passwordManagerPasswords', JSON.stringify(this.passwords));
            this.loadAllUserPasswords();
        }
    }

    changePassword() {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-new-password').value;
        
        if (currentPassword !== this.currentUser.password) {
            alert('Current password is incorrect!');
            return;
        }
        
        if (!this.validateNewPasswordConfirmation()) {
            return;
        }
        
        if (newPassword.length < 4) {
            alert('New password must be at least 4 characters long!');
            return;
        }
        
        // Update password
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex].password = newPassword;
            this.currentUser.password = newPassword;
            localStorage.setItem('passwordManagerUsers', JSON.stringify(this.users));
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            alert('Password changed successfully!');
            document.getElementById('change-password-form').reset();
            this.showPage('dashboard');
        }
    }
    
    togglePasswordVisibility(button) {
        const targetId = button.getAttribute('data-target');
        const input = document.getElementById(targetId);
        
        if (input.type === 'password') {
            input.type = 'text';
            button.textContent = '🙈';
        } else {
            input.type = 'password';
            button.textContent = '👁️';
        }
    }
    
    togglePasswordDisplay(passwordItem) {
        const passwordValue = passwordItem.querySelector('.password-value');
        const viewButton = passwordItem.querySelector('.view');
        
        if (passwordValue.classList.contains('hidden')) {
            passwordValue.classList.remove('hidden');
            viewButton.textContent = '🙈';
        } else {
            passwordValue.classList.add('hidden');
            viewButton.textContent = '👁️';
        }
    }
    
    filterPasswords(query) {
        const userPasswords = this.passwords.filter(p => p.userId === this.currentUser.id);
        const filtered = userPasswords.filter(p => 
            p.service.toLowerCase().includes(query.toLowerCase()) ||
            p.username.toLowerCase().includes(query.toLowerCase()) ||
            (p.notes && p.notes.toLowerCase().includes(query.toLowerCase()))
        );
        
        this.displayPasswords(filtered, 'all-passwords');
    }
    
    filterAllPasswords(query) {
        const filtered = this.passwords.filter(p => 
            p.service.toLowerCase().includes(query.toLowerCase()) ||
            p.username.toLowerCase().includes(query.toLowerCase()) ||
            (p.notes && p.notes.toLowerCase().includes(query.toLowerCase()))
        );
        
        this.displayPasswords(filtered, 'all-user-passwords', true);
    }

    filterAllPasswordsAdmin(query) {
        const filtered = this.passwords.filter(p => 
            p.service.toLowerCase().includes(query.toLowerCase()) ||
            p.username.toLowerCase().includes(query.toLowerCase())
        );
        this.displayAllPasswords(filtered);
    }
    
    loadAdminPanel() {
        // Update admin stats
        document.getElementById('admin-total-users').textContent = this.users.length;
        document.getElementById('admin-total-passwords').textContent = this.passwords.length;
        
        // Calculate storage used
        const dataSize = new Blob([JSON.stringify(this.passwords)]).size + 
                        new Blob([JSON.stringify(this.users)]).size;
        document.getElementById('admin-storage').textContent = `${(dataSize / 1024).toFixed(2)} KB`;
        
        // Set last backup time
        const lastBackup = localStorage.getItem('lastBackup');
        document.getElementById('admin-last-backup').textContent = lastBackup || 'Never';
        
        // Load users table
        const usersTable = document.getElementById('users-table');
        if (usersTable) {
            usersTable.innerHTML = '';
            
            this.users.forEach(user => {
                const userPasswords = this.passwords.filter(p => p.userId === user.id);
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.username}</td>
                    <td>${user.email || 'N/A'}</td>
                    <td>${user.role}</td>
                    <td>${userPasswords.length}</td>
                    <td>${user.lastLogin || 'Never'}</td>
                    <td>
                        <button class="btn btn-danger btn-sm delete-user" data-id="${user.id}">Delete</button>
                    </td>
                `;
                
                usersTable.appendChild(row);
            });
        }
    }

    loadUserManagement() {
        const usersTable = document.getElementById('users-table-body');
        if (usersTable) {
            usersTable.innerHTML = '';

            this.users.forEach(user => {
                if (user.role === 'user') { // Only show regular users, not admins
                    const userPasswords = this.passwords.filter(p => p.userId === user.id);
                    
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${user.username}</td>
                        <td>${user.email}</td>
                        <td>${user.role}</td>
                        <td>${userPasswords.length}</td>
                        <td>${user.lastLogin}</td>
                        <td>
                            <button class="btn btn-danger btn-sm delete-user" data-id="${user.id}">Delete</button>
                            <button class="btn btn-warning btn-sm reset-password" data-id="${user.id}">Reset Password</button>
                        </td>
                    `;
                    
                    usersTable.appendChild(row);
                }
            });
        }
    }

    loadSystemStats() {
        document.getElementById('total-users-count').textContent = this.users.filter(u => u.role === 'user').length;
        document.getElementById('total-passwords-count').textContent = this.passwords.length;
        
        const dataSize = new Blob([JSON.stringify(this.passwords)]).size + 
                        new Blob([JSON.stringify(this.users)]).size;
        document.getElementById('storage-used').textContent = `${(dataSize / 1024).toFixed(2)} KB`;
        
        const lastBackup = localStorage.getItem('lastBackup');
        document.getElementById('last-backup').textContent = lastBackup || 'Never';
    }
    
    deleteUser(id) {
        if (id === this.currentUser.id) {
            alert('You cannot delete your own account!');
            return;
        }
        
        const user = this.users.find(u => u.id === id);
        if (!user) return;

        if (confirm(`Are you sure you want to delete user ${user.username}? All their passwords will be deleted.`)) {
            // Delete user
            this.users = this.users.filter(u => u.id !== id);
            localStorage.setItem('passwordManagerUsers', JSON.stringify(this.users));

            // Delete user's passwords
            this.passwords = this.passwords.filter(p => p.userId !== id);
            localStorage.setItem('passwordManagerPasswords', JSON.stringify(this.passwords));

            this.loadUserManagement();
            this.loadSystemStats();
        }
    }

    resetUserPassword(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const newPassword = prompt(`Enter new password for ${user.username}:`, 'newpassword123');
        if (newPassword && newPassword.length >= 4) {
            user.password = newPassword;
            localStorage.setItem('passwordManagerUsers', JSON.stringify(this.users));
            alert(`Password reset successfully for ${user.username}`);
        }
    }
    
    exportData(format) {
        let data, mimeType, filename;
        
        if (format === 'json') {
            data = JSON.stringify({
                users: this.users.filter(u => u.role === 'user'),
                passwords: this.passwords
            }, null, 2);
            mimeType = 'application/json';
            filename = `securepass-export-${new Date().toISOString().split('T')[0]}.json`;
        }
        
        const blob = new Blob([data], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        localStorage.setItem('lastBackup', new Date().toLocaleString());
        this.loadSystemStats();
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.passwordManager = new PasswordManager();
});