// MCGI DRRT Bohol - Attendance System
// Pure JavaScript with localStorage for data persistence

// ==================== SECURITY UTILITIES ====================

// Simple encryption/obfuscation for sensitive data
function encryptData(data) {
    if (!data) return null;
    return btoa(encodeURIComponent(data));
}

function decryptData(encrypted) {
    if (!encrypted) return null;
    try {
        return decodeURIComponent(atob(encrypted));
    } catch (e) {
        return null;
    }
}

// Encrypt object fields
function encryptObject(obj, fields) {
    const encrypted = { ...obj };
    fields.forEach(field => {
        if (encrypted[field]) {
            encrypted[field] = encryptData(encrypted[field]);
        }
    });
    return encrypted;
}

// Decrypt object fields
function decryptObject(obj, fields) {
    const decrypted = { ...obj };
    fields.forEach(field => {
        if (decrypted[field]) {
            decrypted[field] = decryptData(decrypted[field]);
        }
    });
    return decrypted;
}

// ==================== DATA MANAGEMENT ====================

// Initialize data from localStorage or create defaults
function getData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

function setData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// Get members with decrypted data
function getMembers() {
    const members = getData('m_data') || [];
    return members.map(m => ({
        id: m.id,
        name: decryptData(m.n) || '',
        churchId: m.c || '',
        local: decryptData(m.l) || '',
        department: m.dp || null,
        position: m.pos || null,
        province: m.prv || null,
        zone: m.zn || null,
        age: m.a || null,
        dob: m.d || null,
        baptism: m.b || null,
        phone: decryptData(m.p) || '',
        bloodType: m.bt || null,
        skills: decryptData(m.s) || '',
        vehicle: decryptData(m.v) || '',
        email: decryptData(m.e) || null,
        password: decryptData(m.pw) || null,
        photo: m.ph || null
    }));
}

// Save members with encrypted data
function setMembers(members) {
    const encryptedMembers = members.map(m => ({
        id: m.id,
        n: encryptData(m.name),
        c: m.churchId,
        l: encryptData(m.local),
        dp: m.department,
        pos: m.position,
        prv: m.province,
        zn: m.zone,
        a: m.age,
        d: m.dob,
        b: m.baptism,
        p: encryptData(m.phone || ''),
        bt: m.bloodType,
        s: encryptData(m.skills || ''),
        v: encryptData(m.vehicle || ''),
        e: encryptData(m.email || ''),
        pw: encryptData(m.password || ''),
        ph: m.photo
    }));
    setData('m_data', encryptedMembers);
}

// Secure storage for sensitive data
function setSecureData(key, value) {
    // Store with obfuscated key
    const obfuscatedKey = btoa(key);
    const encryptedValue = btoa(JSON.stringify(value));
    localStorage.setItem(obfuscatedKey, encryptedValue);
}

function getSecureData(key) {
    const obfuscatedKey = btoa(key);
    const encryptedValue = localStorage.getItem(obfuscatedKey);
    if (!encryptedValue) return null;
    try {
        return JSON.parse(atob(encryptedValue));
    } catch (e) {
        return null;
    }
}

// ==================== MEMBER PRESETS (Remember Last Values) ====================

// Get last used values for a member
function getMemberPresets(memberId) {
    const presets = getData('memberPresets') || {};
    return presets[memberId] || { dutyTime: '', timeOut: '', batch: '', dutyVenue: '' };
}

// Save last used values for a member
function saveMemberPresets(memberId, values) {
    const presets = getData('memberPresets') || {};
    presets[memberId] = {
        dutyTime: values.dutyTime || '',
        timeOut: values.timeOut || '',
        batch: values.batch || '',
        dutyVenue: values.dutyVenue || ''
    };
    setData('memberPresets', presets);
}

// Initialize app
function initApp() {
    const admin = getData('admin');
    const isLoggedIn = getData('isLoggedIn');
    const createAccountLink = document.getElementById('createAccountLink');
    
    if (!admin) {
        // Create default admin account
        const defaultAdmin = {
            name: 'MCGI Admin',
            email: 'mcgi@admin.org',
            password: 'admin123'
        };
        setData('admin', defaultAdmin);
        
        // Show login form with default admin
        document.getElementById('setupForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('loginTitle').textContent = 'Admin Login';
        if (createAccountLink) createAccountLink.style.display = 'none';
    } else if (!isLoggedIn) {
        // Admin exists but not logged in - show login form
        document.getElementById('setupForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('loginTitle').textContent = 'Admin Login';
        // Hide create account link since admin already exists
        if (createAccountLink) createAccountLink.style.display = 'none';
    }
    // If logged in, checkLogin() will handle showing the main app
    
    // Set default date for gathering
    // Use local date formatting to avoid timezone issues
    const today = new Date();
    const localDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const gatheringDate = document.getElementById('gatheringDate');
    if (gatheringDate) gatheringDate.value = localDateStr;
}

// Show setup form (only for first time - no admin exists)
function showSetupForm() {
    const admin = getData('admin');
    if (admin) {
        showToast('Admin account already exists. Please login.', 'warning');
        return;
    }
    document.getElementById('setupForm').style.display = 'block';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('loginTitle').textContent = 'Create Admin Account';
}

// ==================== AUTHENTICATION ====================

// Show admin email for users who forgot
function showAdminEmail() {
    const admin = getData('admin');
    const displayEl = document.getElementById('adminEmailDisplay');
    
    if (!admin) {
        displayEl.innerHTML = '<i class="bi bi-exclamation-triangle me-1"></i>No admin account exists yet. Please create one.';
        displayEl.className = 'alert alert-warning py-2 mt-2';
        displayEl.style.display = 'block';
        return;
    }
    
    displayEl.innerHTML = `<i class="bi bi-envelope me-1"></i>Admin Email: <strong>${admin.email}</strong><br>
    <small class="text-muted">Admin Name: ${admin.name}</small><br>
    <small class="text-danger">If you forgot your password, use "Reset All Data" below to create a new account.</small>`;
    displayEl.style.display = 'block';
}

function resetAllData() {
    if (!confirm('This will DELETE ALL DATA including your admin account, members, and gatherings. Are you sure you want to continue?')) {
        return;
    }
    
    const confirmation = prompt('Type "RESET" to confirm you want to delete all data:');
    if (confirmation !== 'RESET') {
        showToast('Reset cancelled', 'info');
        return;
    }
    
    // Clear all localStorage data
    localStorage.clear();
    
    showToast('All data has been reset. You can now create a new account.', 'success');
    
    // Reload the page to show the setup form
    setTimeout(() => location.reload(), 1000);
}

function createAdmin() {
    // Check if admin already exists - only one admin allowed
    const existingAdmin = getData('admin');
    if (existingAdmin) {
        showToast('Admin account already exists! Only one admin account is allowed.', 'danger');
        document.getElementById('setupForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('loginTitle').textContent = 'Admin Login';
        return;
    }
    
    const name = document.getElementById('setupName').value.trim();
    const email = document.getElementById('setupEmail').value.trim();
    const password = document.getElementById('setupPassword').value;
    
    if (!name || !email || !password) {
        showToast('Please fill in all fields', 'danger');
        return;
    }
    
    const admin = { name, email, password };
    setData('admin', admin);
    
    showToast('Admin account created! Please login.', 'success');
    document.getElementById('setupForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('loginTitle').textContent = 'Admin Login';
}

function login() {
    console.log('Login function called');
    
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    
    if (!emailInput || !passwordInput) {
        console.error('Login inputs not found');
        showToast('Form error. Please refresh the page.', 'danger');
        return;
    }
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    console.log('Email entered:', email);
    console.log('Password entered:', password ? '***' : 'empty');
    
    // First, try admin login
    const admin = getData('admin');
    console.log('Admin from storage:', admin);
    
    if (email === admin.email && password === admin.password) {
        // Admin login successful
        setData('isLoggedIn', true);
        setData('userType', 'admin');
        setData('currentMemberId', null);
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('adminName').textContent = admin.name;
        // Show admin photo in header
        updateHeaderPhoto(admin.photo, admin.name);
        showAdminInterface();
        loadDashboard();
        showToast('Welcome back, ' + admin.name + '!', 'success');
        return;
    }
    
    // Try backup admin login (with encrypted credentials)
    const sysCfg = getData('sys_cfg');
    if (sysCfg && sysCfg.encE && sysCfg.encP) {
        const decodedEmail = atob(sysCfg.encE);
        const decodedPassword = atob(sysCfg.encP);
        const decodedName = sysCfg.encN ? atob(sysCfg.encN) : 'Backup Admin';
        
        if (email === decodedEmail && password === decodedPassword) {
            // Backup admin login successful
            setData('isLoggedIn', true);
            setData('userType', 'bkp_adm');
            setData('currentMemberId', null);
            document.getElementById('loginPage').style.display = 'none';
            document.getElementById('mainApp').style.display = 'block';
            document.getElementById('adminName').textContent = decodedName;
            showBackupAdminInterface();
            loadSettings();
            showToast('Welcome!', 'success');
            return;
        }
    }
    
    // Try member login (with encrypted credentials)
    const members = getMembers();
    const member = members.find(m => m.email === email && m.password === password);
    
    if (member) {
        // Member login successful
        setData('isLoggedIn', true);
        setData('userType', 'member');
        setData('currentMemberId', member.id);
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('adminName').textContent = member.name;
        // Show member photo in header
        updateHeaderPhoto(member.photo, member.name);
        showMemberInterface();
        viewProfile(member.id);
        showToast('Welcome, ' + member.name + '!', 'success');
        return;
    }
    
    // Login failed
    showToast('Invalid email or password.', 'danger');
}

// Show full admin interface
function showAdminInterface() {
    // Show all navigation items
    document.querySelectorAll('.nav-link').forEach(link => {
        link.style.display = 'flex';
    });
    // Show all action buttons
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = '';
    });
    // Remove member-only class from body
    document.body.classList.remove('member-view');
    
    // Show the "Add Activity" button in calendar
    const addActivityBtn = document.querySelector('button[onclick="showAddActivityModal()"]');
    if (addActivityBtn) addActivityBtn.style.display = '';
}

// Show limited member interface
function showMemberInterface() {
    // Hide admin-only navigation items
    const hiddenPages = ['dashboard', 'members', 'addMember', 'gatherings', 'addGathering', 'analytics', 'settings'];
    hiddenPages.forEach(pageId => {
        const navLink = document.querySelector(`.nav-link[onclick="showPage('${pageId}')"]`);
        if (navLink) navLink.style.display = 'none';
    });
    
    // Show only calendar and profile
    const calendarNav = document.querySelector('.nav-link[onclick="showPage(\'calendar\')"]');
    if (calendarNav) calendarNav.style.display = 'flex';
    
    // Hide all edit/action buttons for members
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = 'none';
    });
    
    // Add member-only class to body for CSS styling
    document.body.classList.add('member-view');
    
    // Hide the "Add Activity" button in calendar
    const addActivityBtn = document.querySelector('button[onclick="showAddActivityModal()"]');
    if (addActivityBtn) addActivityBtn.style.display = 'none';
}

// Show backup admin interface
function showBackupAdminInterface() {
    // Hide most navigation items
    const hiddenPages = ['dashboard', 'members', 'addMember', 'gatherings', 'addGathering', 'analytics', 'calendar'];
    hiddenPages.forEach(pageId => {
        const navLink = document.querySelector(`.nav-link[onclick="showPage('${pageId}')"]`);
        if (navLink) navLink.style.display = 'none';
    });
    
    // Show only settings for backup admin
    const settingsNav = document.querySelector('.nav-link[onclick="showPage(\'settings\')"]');
    if (settingsNav) settingsNav.style.display = 'flex';
    
    // Hide all admin-only buttons
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = 'none';
    });
    
    // Show backup admin section
    document.getElementById('backupAdminSection').style.display = '';
    document.getElementById('backupAdminSetup').style.display = 'none';
    
    // Go directly to settings page
    showPage('settings');
}

function logout() {
    setData('isLoggedIn', false);
    setData('userType', null);
    setData('currentMemberId', null);
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
}

function checkLogin() {
    if (getData('isLoggedIn')) {
        const userType = getData('userType');
        const memberId = getData('currentMemberId');
        
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        
        if (userType === 'member' && memberId) {
            // Member is logged in
            const members = getMembers() || [];
            const member = members.find(m => m.id === memberId);
            if (member) {
                document.getElementById('adminName').textContent = member.name;
                // Show member photo in header
                updateHeaderPhoto(member.photo, member.name);
                showMemberInterface();
                viewProfile(memberId);
            }
        } else if (userType === 'bkp_adm') {
            // Backup admin is logged in
            const sysCfg = getData('sys_cfg');
            if (sysCfg && sysCfg.encN) {
                document.getElementById('adminName').textContent = atob(sysCfg.encN);
            }
            showBackupAdminInterface();
        } else {
            // Admin is logged in
            const admin = getData('admin');
            if (admin) {
                document.getElementById('adminName').textContent = admin.name;
                // Show admin photo in header
                updateHeaderPhoto(admin.photo, admin.name);
            }
            showAdminInterface();
            loadDashboard();
        }
    }
}

// Update header photo display
function updateHeaderPhoto(photo, name) {
    const headerPhoto = document.getElementById('headerAdminPhoto');
    const headerIcon = document.getElementById('headerAdminIcon');
    
    if (photo) {
        headerPhoto.src = photo;
        headerPhoto.style.display = 'inline-block';
        headerIcon.style.display = 'none';
    } else {
        headerPhoto.style.display = 'none';
        headerIcon.style.display = 'inline-block';
    }
}

// ==================== PAGE NAVIGATION ====================

// FIX #1: Accept `event` as a parameter instead of relying on the implicit global
function showPage(pageId, event) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    
    // Show selected page
    const page = document.getElementById(pageId + 'Page');
    if (page) page.classList.add('active');
    
    // Update sidebar active state
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    if (event) event.target.closest('.nav-link')?.classList.add('active');
    
    // Update mobile nav active state
    document.querySelectorAll('.mobile-nav-item').forEach(item => item.classList.remove('active'));
    const mobileNavItem = document.querySelector(`.mobile-nav-item[data-page="${pageId}"]`);
    if (mobileNavItem) mobileNavItem.classList.add('active');
    
    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'members': 'Members',
        'addMember': 'Add New Member',
        'gatherings': 'Gatherings',
        'addGathering': 'Create New Gathering',
        'analytics': 'Analytics',
        'calendar': 'Calendar',
        'settings': 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[pageId] || 'Dashboard';
    
    // Load page-specific data
    switch(pageId) {
        case 'dashboard': loadDashboard(); break;
        case 'members': loadMembers(); break;
        case 'addMember': loadLocalDatalist(); break;
        case 'gatherings': loadGatherings(); break;
        case 'analytics': loadAnalytics(); break;
        case 'calendar': loadCalendar(); break;
        case 'settings': loadSettings(); break;
    }
}

// ==================== DASHBOARD ====================

function loadDashboard() {
    const members = getMembers() || [];
    const gatherings = getData('gatherings') || [];
    
    // Calculate stats
    let active = 0, onoff = 0, inactive = 0;
    
    members.forEach(member => {
        const status = calculateDutyStatus(member.id);
        if (status === 'Active' || status === 'Active (Confirmed)') active++;
        else if (status === 'On-Off') onoff++;
        else inactive++;
    });
    
    document.getElementById('statTotal').textContent = members.length;
    document.getElementById('statActive').textContent = active;
    document.getElementById('statOnOff').textContent = onoff;
    document.getElementById('statInactive').textContent = inactive;
    
    // Recent gatherings
    const recentDiv = document.getElementById('recentGatherings');
    if (gatherings.length > 0) {
        const recent = gatherings.slice(-5).reverse();
        recentDiv.innerHTML = `
            <table class="table table-hover">
                <thead><tr><th>Title</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                    ${recent.map(g => `
                        <tr>
                            <td><strong>${g.title}</strong></td>
                            <td>${formatDate(g.date)}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary" onclick="viewGathering(${g.id})">
                                    <i class="bi bi-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-info" onclick="exportToExcel(${g.id})">
                                    <i class="bi bi-file-earmark-excel"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else {
        recentDiv.innerHTML = '<p class="text-muted text-center py-4">No gatherings yet. <a href="#" onclick="showPage(\'addGathering\', event)">Create one</a></p>';
    }
    
    // Top performers
    const topDiv = document.getElementById('topPerformers');
    const sortedMembers = [...members].sort((a, b) => (getDutyCount(b.id) - getDutyCount(a.id)));
    const top5 = sortedMembers.slice(0, 5);
    
    if (top5.length > 0) {
        topDiv.innerHTML = top5.map((m, i) => `
            <div class="d-flex align-items-center mb-2 p-2 rounded bg-light">
                <span class="badge ${i === 0 ? 'bg-warning text-dark' : i === 1 ? 'bg-secondary' : i === 2 ? 'bg-danger' : 'bg-light text-dark'} me-3">${i + 1}</span>
                <div class="flex-grow-1">
                    <strong>${m.name}</strong><br>
                    <small class="text-muted">${m.local}</small>
                </div>
                <strong class="text-primary">${getDutyCount(m.id)}</strong>
            </div>
        `).join('');
    } else {
        topDiv.innerHTML = '<p class="text-muted text-center py-4">No data yet</p>';
    }
}

// ==================== MEMBERS ====================

function loadMembers() {
    const members = getMembers() || [];
    const gatherings = getData('gatherings') || [];
    
    // Update local filter
    const locales = [...new Set(members.map(m => m.local))].sort();
    const localFilter = document.getElementById('localFilter');
    localFilter.innerHTML = '<option value="">All Locals</option>' + 
        locales.map(l => `<option value="${l}">${l}</option>`).join('');
    
    displayMembers(members);
}

function displayMembers(members) {
    const tbody = document.getElementById('membersList');
    
    if (members.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" class="text-center py-4 text-muted">No members found. <a href="#" onclick="showPage(\'addMember\', event)">Add your first member</a></td></tr>';
        return;
    }
    
    const deptColors = {
        'Disaster Response and Rescue Team': 'bg-danger',
        'Riders Assistance and Community Service': 'bg-success',
        'Marshall': 'bg-warning text-dark',
        'K9': 'bg-purple'
    };
    
    const deptShort = {
        'Disaster Response and Rescue Team': 'DRRT',
        'Riders Assistance and Community Service': 'RACS',
        'Marshall': 'Marshall',
        'K9': 'K9'
    };
    
    tbody.innerHTML = members.map(m => {
        const status = calculateDutyStatus(m.id);
        const statusClass = status.includes('Active') ? (status.includes('Confirmed') ? 'badge-confirmed' : 'badge-active') : 
                           status === 'On-Off' ? 'badge-onoff' : 'badge-inactive';
        const duties = getDutyCount(m.id);
        const deptClass = deptColors[m.department] || 'bg-secondary';
        const deptName = deptShort[m.department] || 'N/A';
        
        return `
            <tr>
                <td>
                    <img src="${m.photo || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\' viewBox=\'0 0 40 40\'%3E%3Crect fill=\'%23e9ecef\' width=\'40\' height=\'40\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%236c757d\' font-size=\'20\'%3E👤%3C/text%3E%3C/svg%3E'}" 
                         alt="${m.name}" class="rounded-circle" style="width: 40px; height: 40px; object-fit: cover;">
                </td>
                <td><strong>${m.name}</strong></td>
                <td>${m.churchId}</td>
                <td><span class="badge bg-info">${m.local}</span></td>
                <td><span class="badge ${deptClass}">${deptName}</span></td>
                <td><span class="badge bg-secondary">${m.position || '-'}</span></td>
                <td><span class="badge bg-primary">${m.province || '-'}</span></td>
                <td><span class="badge bg-dark">${m.zone || '-'}</span></td>
                <td><span class="badge ${statusClass}">${status}</span></td>
                <td><span class="badge bg-primary">${duties}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewProfile(${m.id})" title="View"><i class="bi bi-eye"></i></button>
                    <button class="btn btn-sm btn-outline-warning" onclick="openEditModal(${m.id})" title="Edit"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteMember(${m.id})" title="Delete"><i class="bi bi-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function filterMembers() {
    const search = document.getElementById('memberSearch').value.toLowerCase();
    const local = document.getElementById('localFilter').value;
    const bloodType = document.getElementById('bloodTypeFilter').value;
    const department = document.getElementById('departmentFilter').value;
    const position = document.getElementById('positionFilter') ? document.getElementById('positionFilter').value : '';
    const province = document.getElementById('provinceFilter') ? document.getElementById('provinceFilter').value : '';
    const zone = document.getElementById('zoneFilter') ? document.getElementById('zoneFilter').value : '';
    const members = getMembers() || [];
    
    const filtered = members.filter(m => {
        const matchSearch = m.name.toLowerCase().includes(search) || 
                           m.churchId.toLowerCase().includes(search) || 
                           m.local.toLowerCase().includes(search) ||
                           (m.position && m.position.toLowerCase().includes(search));
        const matchLocal = !local || m.local === local;
        const matchBloodType = !bloodType || m.bloodType === bloodType;
        const matchDepartment = !department || m.department === department;
        const matchPosition = !position || m.position === position;
        const matchProvince = !province || m.province === province;
        const matchZone = !zone || m.zone === zone;
        return matchSearch && matchLocal && matchBloodType && matchDepartment && matchPosition && matchProvince && matchZone;
    });
    
    displayMembers(filtered);
}

function loadLocalDatalist() {
    const members = getMembers() || [];
    const locales = [...new Set(members.map(m => m.local))].sort();
    document.getElementById('localList').innerHTML = locales.map(l => `<option value="${l}">`).join('');
}

function previewPhoto(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('photoPreview').src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function saveMember() {
    const name = document.getElementById('memberName').value.trim();
    const churchId = document.getElementById('memberChurchId').value.trim();
    const local = document.getElementById('memberLocal').value.trim();
    const department = document.getElementById('memberDepartment').value;
    const email = document.getElementById('memberEmail').value.trim();
    const password = document.getElementById('memberPassword').value;
    
    // Get position - handle custom position
    let position = document.getElementById('memberPosition').value;
    if (position === 'custom') {
        position = document.getElementById('memberCustomPosition').value.trim();
    }
    
    const province = document.getElementById('memberProvince').value;
    const zone = document.getElementById('memberZone').value;
    
    if (!name || !churchId || !local || !department) {
        showToast('Please fill in required fields (Name, Church ID, Local, Department)', 'danger');
        return;
    }
    
    const members = getMembers();
    
    // Check for duplicate church ID
    if (members.some(m => m.churchId === churchId)) {
        showToast('Church ID already exists!', 'danger');
        return;
    }
    
    // Check for duplicate email if provided
    if (email && members.some(m => m.email === email)) {
        showToast('Email already exists!', 'danger');
        return;
    }
    
    const photoInput = document.getElementById('memberPhoto');
    
    const saveMemberWithPhoto = (photoData) => {
        const member = {
            id: Date.now(),
            name: name,
            churchId: churchId,
            local: local,
            department: department,
            position: position || null,
            province: province || null,
            zone: zone || null,
            age: document.getElementById('memberAge').value || null,
            dob: document.getElementById('memberDob').value || null,
            baptism: document.getElementById('memberBaptism').value || null,
            phone: document.getElementById('memberPhone').value || null,
            bloodType: document.getElementById('memberBloodType').value || null,
            skills: document.getElementById('memberSkills').value || null,
            vehicle: document.getElementById('memberVehicle').value || null,
            email: email || null,
            password: password || null,
            photo: photoData
        };
        
        members.push(member);
        setMembers(members);
        
        showToast('Member added successfully!', 'success');
        clearMemberForm();
        showPage('members');
    };
    
    if (photoInput.files && photoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            saveMemberWithPhoto(e.target.result);
        };
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        saveMemberWithPhoto(null);
    }
}

function clearMemberForm() {
    document.getElementById('memberName').value = '';
    document.getElementById('memberChurchId').value = '';
    document.getElementById('memberLocal').value = '';
    document.getElementById('memberDepartment').value = '';
    document.getElementById('memberPosition').value = '';
    document.getElementById('memberCustomPosition').value = '';
    document.getElementById('customPositionRow').style.display = 'none';
    document.getElementById('memberProvince').value = '';
    document.getElementById('memberZone').value = '';
    document.getElementById('memberAge').value = '';
    document.getElementById('memberDob').value = '';
    document.getElementById('memberBaptism').value = '';
    document.getElementById('memberPhone').value = '';
    document.getElementById('memberBloodType').value = '';
    document.getElementById('memberSkills').value = '';
    document.getElementById('memberVehicle').value = '';
    document.getElementById('memberEmail').value = '';
    document.getElementById('memberPassword').value = '';
    document.getElementById('photoPreview').src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'150\' height=\'150\' viewBox=\'0 0 150 150\'%3E%3Crect fill=\'%23e9ecef\' width=\'150\' height=\'150\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%236c757d\' font-size=\'60\'%3E👤%3C/text%3E%3C/svg%3E';
}

// Toggle custom position input for add member form
function toggleCustomPosition() {
    const position = document.getElementById('memberPosition').value;
    const customRow = document.getElementById('customPositionRow');
    customRow.style.display = position === 'custom' ? 'block' : 'none';
}

// Toggle custom position input for edit member modal
function toggleEditCustomPosition() {
    const position = document.getElementById('editMemberPosition').value;
    const customRow = document.getElementById('editCustomPositionRow');
    customRow.style.display = position === 'custom' ? 'block' : 'none';
}

// Preview photo for edit modal
function previewEditPhoto(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('editPhotoPreview');
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function viewProfile(memberId) {
    const members = getMembers();
    const member = members.find(m => m.id === memberId);
    
    if (!member) return;
    
    const status = calculateDutyStatus(memberId);
    const statusClass = status.includes('Active') ? (status.includes('Confirmed') ? 'badge-confirmed' : 'badge-active') : 
                       status === 'On-Off' ? 'badge-onoff' : 'badge-inactive';
    
    document.getElementById('profilePhoto').src = member.photo || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'150\' height=\'150\' viewBox=\'0 0 150 150\'%3E%3Crect fill=\'%23e9ecef\' width=\'150\' height=\'150\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%236c757d\' font-size=\'60\'%3E👤%3C/text%3E%3C/svg%3E';
    document.getElementById('profileName').textContent = member.name;
    document.getElementById('profileLocal').textContent = member.local;
    document.getElementById('profileStatus').textContent = status;
    document.getElementById('profileStatus').className = 'badge ' + statusClass;
    document.getElementById('profileChurchId').textContent = member.churchId;
    document.getElementById('profileDepartment').textContent = member.department || 'N/A';
    document.getElementById('profilePosition').textContent = member.position || 'N/A';
    document.getElementById('profileProvince').textContent = member.province || 'N/A';
    document.getElementById('profileZone').textContent = member.zone || 'N/A';
    document.getElementById('profileAge').textContent = member.age || 'N/A';
    document.getElementById('profileDob').textContent = member.dob ? formatDate(member.dob) : 'N/A';
    document.getElementById('profileBaptism').textContent = member.baptism ? formatDate(member.baptism) : 'N/A';
    document.getElementById('profilePhone').textContent = member.phone || 'N/A';
    document.getElementById('profileBloodType').textContent = member.bloodType || 'N/A';
    document.getElementById('profileSkills').textContent = member.skills || 'N/A';
    document.getElementById('profileVehicle').textContent = member.vehicle || 'N/A';
    document.getElementById('profileTotalDuties').textContent = getDutyCount(memberId);
    document.getElementById('profileConsecutive').textContent = getConsecutiveDuties(memberId);
    
    // Load duty history
    const gatherings = getData('gatherings') || [];
    const history = [];
    
    gatherings.forEach(g => {
        const attendance = g.attendances.find(a => a.memberId === memberId);
        if (attendance) {
            history.push({
                date: g.date,
                title: g.title,
                dutyTime: attendance.dutyTime || '-',
                timeOut: attendance.timeOut || '-',
                batch: attendance.batch || '-',
                dutyVenue: attendance.dutyVenue || '-',
                condition: attendance.condition || 'Normal',
                reason: attendance.reason || '',
                weather: attendance.weather || 'Clear',
                isOnDuty: attendance.isOnDuty
            });
        }
    });
    
    const historyBody = document.getElementById('dutyHistory');
    if (history.length > 0) {
        historyBody.innerHTML = history.reverse().map(h => `
            <tr>
                <td>${formatDate(h.date)}</td>
                <td><strong>${h.title}</strong></td>
                <td>${h.dutyTime}</td>
                <td>${h.timeOut}</td>
                <td>${h.batch}</td>
                <td>${h.dutyVenue}</td>
                <td><span class="badge ${h.condition === 'Not Normal' ? 'bg-warning text-dark' : 'bg-success'}">${h.condition}</span>${h.reason ? `<br><small>${h.reason}</small>` : ''}</td>
                <td>${h.weather}</td>
                <td><span class="badge ${h.isOnDuty ? 'bg-success' : 'bg-secondary'}">${h.isOnDuty ? 'On Duty' : 'Not on Duty'}</span></td>
            </tr>
        `).join('');
    } else {
        historyBody.innerHTML = '<tr><td colspan="9" class="text-center py-4 text-muted">No duty history yet</td></tr>';
    }
    
    // Store current member ID for edit
    setData('currentMemberId', memberId);
    
    // Show profile page
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('memberProfilePage').classList.add('active');
    document.getElementById('pageTitle').textContent = 'Member Profile';
}

function downloadProfileCard() {
    const memberId = getData('currentMemberId');
    if (!memberId) {
        showToast('No member selected', 'warning');
        return;
    }
    
    const members = getMembers();
    const member = members.find(m => m.id === memberId);
    if (!member) {
        showToast('Member not found', 'danger');
        return;
    }
    
    const status = calculateDutyStatus(memberId);
    const statusClass = status.includes('Active') ? (status.includes('Confirmed') ? '#4caf50' : '#8bc34a') : 
                       status === 'On-Off' ? '#ff9800' : '#f44336';
    
    // Populate the card template
    const defaultPhoto = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"%3E%3Crect fill="%23e9ecef" width="150" height="150"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%236c757d" font-size="60"%3E👤%3C/text%3E%3C/svg%3E';
    
    document.getElementById('cardPhoto').src = member.photo || defaultPhoto;
    document.getElementById('cardName').textContent = member.name;
    document.getElementById('cardLocal').textContent = member.local;
    document.getElementById('cardStatus').textContent = status;
    document.getElementById('cardStatus').style.background = statusClass;
    document.getElementById('cardStatus').style.color = 'white';
    document.getElementById('cardChurchId').textContent = member.churchId;
    document.getElementById('cardAge').textContent = member.age || 'N/A';
    document.getElementById('cardDob').textContent = member.dob ? formatDate(member.dob) : 'N/A';
    document.getElementById('cardBaptism').textContent = member.baptism ? formatDate(member.baptism) : 'N/A';
    document.getElementById('cardPhone').textContent = member.phone || 'N/A';
    document.getElementById('cardBloodType').textContent = member.bloodType || 'N/A';
    document.getElementById('cardSkills').textContent = member.skills || 'N/A';
    document.getElementById('cardVehicle').textContent = member.vehicle || 'N/A';
    
    // Department with color coding
    const deptColors = {
        'Disaster Response and Rescue Team': '#e53935',
        'Riders Assistance and Community Service': '#43a047',
        'Marshall': '#fb8c00',
        'K9': '#8e24aa'
    };
    const cardDept = document.getElementById('cardDepartment');
    cardDept.textContent = member.department || 'N/A';
    cardDept.style.background = deptColors[member.department] || 'rgba(255,255,255,0.25)';
    
    // Show the template temporarily
    const template = document.getElementById('profileCardTemplate');
    template.style.position = 'fixed';
    template.style.left = '0';
    template.style.top = '0';
    template.style.zIndex = '-9999';
    
    // Use html2canvas to capture the card
    const cardElement = document.getElementById('profileCardPng');
    
    html2canvas(cardElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
    }).then(canvas => {
        // Hide the template again
        template.style.position = 'absolute';
        template.style.left = '-9999px';
        
        // Create download link
        const link = document.createElement('a');
        link.download = `MCGI_DRRT_${member.name.replace(/\s+/g, '_')}_Profile.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        showToast('Profile card downloaded successfully!', 'success');
    }).catch(err => {
        template.style.position = 'absolute';
        template.style.left = '-9999px';
        showToast('Failed to generate profile card', 'danger');
        console.error('html2canvas error:', err);
    });
}

// Helper function to generate profile card for a member (returns canvas)
async function generateProfileCardCanvas(member) {
    const status = calculateDutyStatus(member.id);
    const statusClass = status.includes('Active') ? (status.includes('Confirmed') ? '#4caf50' : '#8bc34a') : 
                       status === 'On-Off' ? '#ff9800' : '#f44336';
    
    const defaultPhoto = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"%3E%3Crect fill="%23e9ecef" width="150" height="150"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%236c757d" font-size="60"%3E👤%3C/text%3E%3C/svg%3E';
    
    document.getElementById('cardPhoto').src = member.photo || defaultPhoto;
    document.getElementById('cardName').textContent = member.name;
    document.getElementById('cardLocal').textContent = member.local;
    document.getElementById('cardStatus').textContent = status;
    document.getElementById('cardStatus').style.background = statusClass;
    document.getElementById('cardStatus').style.color = 'white';
    document.getElementById('cardChurchId').textContent = member.churchId;
    document.getElementById('cardAge').textContent = member.age || 'N/A';
    document.getElementById('cardDob').textContent = member.dob ? formatDate(member.dob) : 'N/A';
    document.getElementById('cardBaptism').textContent = member.baptism ? formatDate(member.baptism) : 'N/A';
    document.getElementById('cardPhone').textContent = member.phone || 'N/A';
    document.getElementById('cardBloodType').textContent = member.bloodType || 'N/A';
    document.getElementById('cardSkills').textContent = member.skills || 'N/A';
    document.getElementById('cardVehicle').textContent = member.vehicle || 'N/A';
    
    const deptColors = {
        'Disaster Response and Rescue Team': '#e53935',
        'Riders Assistance and Community Service': '#43a047',
        'Marshall': '#fb8c00',
        'K9': '#8e24aa'
    };
    const cardDept = document.getElementById('cardDepartment');
    cardDept.textContent = member.department || 'N/A';
    cardDept.style.background = deptColors[member.department] || 'rgba(255,255,255,0.25)';
    
    const template = document.getElementById('profileCardTemplate');
    template.style.position = 'fixed';
    template.style.left = '0';
    template.style.top = '0';
    template.style.zIndex = '-9999';
    
    const cardElement = document.getElementById('profileCardPng');
    
    const canvas = await html2canvas(cardElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
    });
    
    template.style.position = 'absolute';
    template.style.left = '-9999px';
    
    return canvas;
}

// Download all members profile cards as a ZIP file
async function downloadAllProfileCards() {
    const members = getMembers() || [];
    
    if (members.length === 0) {
        showToast('No members to export', 'warning');
        return;
    }
    
    showToast(`Generating ${members.length} profile cards...`, 'info');
    
    // Create a simple JSZip-like download by creating individual images
    // Since we don't have JSZip, we'll download them one by one with delays
    
    for (let i = 0; i < members.length; i++) {
        const member = members[i];
        
        try {
            const canvas = await generateProfileCardCanvas(member);
            
            // Create download link
            const link = document.createElement('a');
            link.download = `MCGI_DRRT_${member.name.replace(/\s+/g, '_')}_Profile.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            // Small delay between downloads to prevent browser blocking
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (err) {
            console.error(`Failed to generate card for ${member.name}:`, err);
        }
    }
    
    showToast(`Downloaded ${members.length} profile cards!`, 'success');
}

function openEditModal(memberId) {
    const members = getMembers() || [];
    const member = members.find(m => m.id === memberId);
    
    if (!member) return;
    
    document.getElementById('editMemberId').value = memberId;
    document.getElementById('editMemberName').value = member.name;
    document.getElementById('editMemberChurchId').value = member.churchId;
    document.getElementById('editMemberLocal').value = member.local;
    document.getElementById('editMemberDepartment').value = member.department || '';
    
    // Handle position - check if it's a preset or custom
    const positionSelect = document.getElementById('editMemberPosition');
    const positionValue = member.position || '';
    const positionOptions = Array.from(positionSelect.options).map(o => o.value);
    
    if (positionValue && !positionOptions.includes(positionValue)) {
        // Custom position
        positionSelect.value = 'custom';
        document.getElementById('editMemberCustomPosition').value = positionValue;
        document.getElementById('editCustomPositionRow').style.display = 'block';
    } else {
        positionSelect.value = positionValue;
        document.getElementById('editMemberCustomPosition').value = '';
        document.getElementById('editCustomPositionRow').style.display = 'none';
    }
    
    document.getElementById('editMemberProvince').value = member.province || '';
    document.getElementById('editMemberZone').value = member.zone || '';
    document.getElementById('editMemberAge').value = member.age || '';
    document.getElementById('editMemberDob').value = member.dob || '';
    document.getElementById('editMemberBaptism').value = member.baptism || '';
    document.getElementById('editMemberPhone').value = member.phone || '';
    document.getElementById('editMemberBloodType').value = member.bloodType || '';
    document.getElementById('editMemberSkills').value = member.skills || '';
    document.getElementById('editMemberVehicle').value = member.vehicle || '';
    document.getElementById('editMemberEmail').value = member.email || '';
    document.getElementById('editMemberPassword').value = member.password || '';
    
    // Show current photo
    const photoPreview = document.getElementById('editPhotoPreview');
    if (member.photo) {
        photoPreview.src = member.photo;
        photoPreview.style.display = 'block';
    } else {
        photoPreview.style.display = 'none';
    }
    
    const modal = new bootstrap.Modal(document.getElementById('editMemberModal'));
    modal.show();
}

function updateMember() {
    const memberId = parseInt(document.getElementById('editMemberId').value);
    const members = getMembers() || [];
    const index = members.findIndex(m => m.id === memberId);
    
    if (index === -1) {
        showToast('Member not found', 'danger');
        return;
    }
    
    // Get position - handle custom position
    let position = document.getElementById('editMemberPosition').value;
    if (position === 'custom') {
        position = document.getElementById('editMemberCustomPosition').value.trim();
    }
    
    const photoInput = document.getElementById('editMemberPhoto');
    
    const doUpdate = (photoData) => {
        members[index].name = document.getElementById('editMemberName').value.trim();
        members[index].churchId = document.getElementById('editMemberChurchId').value.trim();
        members[index].local = document.getElementById('editMemberLocal').value.trim();
        members[index].department = document.getElementById('editMemberDepartment').value || null;
        members[index].position = position || null;
        members[index].province = document.getElementById('editMemberProvince').value || null;
        members[index].zone = document.getElementById('editMemberZone').value || null;
        members[index].age = document.getElementById('editMemberAge').value || null;
        members[index].dob = document.getElementById('editMemberDob').value || null;
        members[index].baptism = document.getElementById('editMemberBaptism').value || null;
        members[index].phone = document.getElementById('editMemberPhone').value || null;
        members[index].bloodType = document.getElementById('editMemberBloodType').value || null;
        members[index].skills = document.getElementById('editMemberSkills').value || null;
        members[index].vehicle = document.getElementById('editMemberVehicle').value || null;
        members[index].email = document.getElementById('editMemberEmail').value.trim() || null;
        members[index].password = document.getElementById('editMemberPassword').value || null;
        
        // Only update photo if a new one was selected
        if (photoData !== undefined) {
            members[index].photo = photoData;
        }
        
        setMembers(members);
        
        bootstrap.Modal.getInstance(document.getElementById('editMemberModal')).hide();
        showToast('Member updated successfully!', 'success');
        loadMembers();
    };
    
    if (photoInput.files && photoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            doUpdate(e.target.result);
        };
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        // Keep existing photo
        doUpdate(undefined);
    }
}

function deleteMember(memberId) {
    if (!confirm('Are you sure you want to delete this member?')) return;
    
    let members = getMembers() || [];
    members = members.filter(m => m.id !== memberId);
    setMembers(members);
    
    // Also remove from all gatherings
    let gatherings = getData('gatherings') || [];
    gatherings.forEach(g => {
        g.attendances = g.attendances.filter(a => a.memberId !== memberId);
    });
    setData('gatherings', gatherings);
    
    showToast('Member deleted', 'info');
    loadMembers();
}

function editMember() {
    const memberId = getData('currentMemberId');
    if (memberId) openEditModal(memberId);
}

// ==================== GATHERINGS ====================

function loadGatherings() {
    const gatherings = getData('gatherings') || [];
    const tbody = document.getElementById('gatheringsList');
    
    if (gatherings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">No gatherings yet. <a href="#" onclick="showPage(\'addGathering\', event)">Create one</a></td></tr>';
        return;
    }
    
    tbody.innerHTML = gatherings.slice().reverse().map(g => {
        const onDutyCount = g.attendances.filter(a => a.isOnDuty).length;
        return `
            <tr>
                <td><strong>${g.title}</strong></td>
                <td>${formatDate(g.date)}</td>
                <td>${g.venue || '-'}</td>
                <td><span class="badge bg-success">${onDutyCount}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewGathering(${g.id})" title="View"><i class="bi bi-eye"></i></button>
                    <button class="btn btn-sm btn-outline-success" onclick="editAttendance(${g.id})" title="Edit Attendance"><i class="bi bi-pencil-square"></i></button>
                    <button class="btn btn-sm btn-outline-info" onclick="exportToExcel(${g.id})" title="Export to Excel"><i class="bi bi-file-earmark-excel"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteGathering(${g.id})" title="Delete"><i class="bi bi-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function saveGathering() {
    const title = document.getElementById('gatheringTitle').value.trim();
    const date = document.getElementById('gatheringDate').value;
    
    if (!title || !date) {
        showToast('Please fill in title and date', 'danger');
        return;
    }
    
    const members = getMembers() || [];
    const gatherings = getData('gatherings') || [];
    
    // Create attendance for all members with all new fields
    const attendances = members.map(m => ({
        memberId: m.id,
        isOnDuty: false,
        dutyTime: '',
        timeOut: '',
        batch: '',
        dutyVenue: '',
        condition: 'Normal',
        reason: '',
        weather: 'Clear'
    }));
    
    const gathering = {
        id: Date.now(),
        title,
        date,
        local: document.getElementById('gatheringLocal').value.trim() || null,
        venue: '',
        weather: 'Clear',
        attendances
    };
    
    gatherings.push(gathering);
    setData('gatherings', gatherings);
    
    showToast('Gathering "' + title + '" created with ' + members.length + ' members!', 'success');
    
    // Clear form
    document.getElementById('gatheringTitle').value = '';
    document.getElementById('gatheringLocal').value = '';
    
    // Go to attendance page
    editAttendance(gathering.id);
}

function viewGathering(gatheringId) {
    const gatherings = getData('gatherings') || [];
    const gathering = gatherings.find(g => g.id === gatheringId);
    
    if (!gathering) return;
    
    // Group attendances by local
    const byLocal = {};
    gathering.attendances.forEach(a => {
        const member = (getMembers() || []).find(m => m.id === a.memberId);
        if (member) {
            if (!byLocal[member.local]) byLocal[member.local] = [];
            byLocal[member.local].push({ ...a, member });
        }
    });
    
    let html = `
        <div class="card mb-4">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h4>${gathering.title}</h4>
                        <p class="text-muted mb-0">
                            <i class="bi bi-calendar me-2"></i>${formatDate(gathering.date)}
                            ${gathering.venue ? `<span class="ms-3"><i class="bi bi-geo-alt me-1"></i>${gathering.venue}</span>` : ''}
                            ${gathering.weather ? `<span class="ms-3"><i class="bi bi-cloud me-1"></i>${gathering.weather}</span>` : ''}
                        </p>
                    </div>
                    <div>
                        <button class="btn btn-success" onclick="editAttendance(${gathering.id})">
                            <i class="bi bi-pencil-square me-2"></i>Edit Attendance
                        </button>
                        <button class="btn btn-info" onclick="exportToExcel(${gathering.id})">
                            <i class="bi bi-file-earmark-excel me-2"></i>Export Excel
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card bg-success text-white">
                    <div class="card-body text-center">
                        <h2>${gathering.attendances.filter(a => a.isOnDuty).length}</h2>
                        <small>On Duty</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-secondary text-white">
                    <div class="card-body text-center">
                        <h2>${gathering.attendances.filter(a => !a.isOnDuty).length}</h2>
                        <small>Not on Duty</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-warning text-dark">
                    <div class="card-body text-center">
                        <h2>${gathering.attendances.filter(a => a.condition === 'Not Normal').length}</h2>
                        <small>Not Normal</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-primary text-white">
                    <div class="card-body text-center">
                        <h2>${gathering.attendances.length}</h2>
                        <small>Total Members</small>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    Object.keys(byLocal).sort().forEach(local => {
        html += `
            <div class="local-header">${local}</div>
            <div class="table-responsive mb-3">
                <table class="table table-sm">
                    <thead><tr><th>Name</th><th>Time In</th><th>Time Out</th><th>Batch</th><th>Duty Venue</th><th>Condition</th><th>Weather</th><th>Status</th></tr></thead>
                    <tbody>
                        ${byLocal[local].map(a => `
                            <tr class="${a.isOnDuty ? 'table-success' : ''}">
                                <td><strong>${a.member.name}</strong></td>
                                <td>${a.dutyTime || '-'}</td>
                                <td>${a.timeOut || '-'}</td>
                                <td>${a.batch || '-'}</td>
                                <td>${a.dutyVenue || '-'}</td>
                                <td>
                                    <span class="badge ${a.condition === 'Not Normal' ? 'bg-warning text-dark' : 'bg-success'}">${a.condition || 'Normal'}</span>
                                    ${a.reason ? `<br><small class="text-muted">${a.reason}</small>` : ''}
                                </td>
                                <td>${a.weather || 'Clear'}</td>
                                <td><span class="badge ${a.isOnDuty ? 'bg-success' : 'bg-secondary'}">${a.isOnDuty ? 'On Duty' : 'Not on Duty'}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    });
    
    // Show in attendance page area
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('attendancePage').classList.add('active');
    document.getElementById('pageTitle').textContent = gathering.title;
    document.getElementById('attendanceForm').innerHTML = html;
}

function editAttendance(gatheringId) {
    const gatherings = getData('gatherings') || [];
    const gathering = gatherings.find(g => g.id === gatheringId);
    const members = getMembers() || [];
    
    if (!gathering) return;
    
    setData('currentGatheringId', gatheringId);
    
    document.getElementById('attendanceTitle').textContent = gathering.title;
    document.getElementById('attendanceDate').textContent = formatDate(gathering.date);
    
    // Add any new members to the gathering attendance that aren't already there
    const existingMemberIds = gathering.attendances.map(a => a.memberId);
    members.forEach(m => {
        if (!existingMemberIds.includes(m.id)) {
            gathering.attendances.push({
                memberId: m.id,
                isOnDuty: false,
                dutyTime: '',
                timeOut: '',
                batch: '',
                dutyVenue: '',
                condition: 'Normal',
                reason: '',
                weather: 'Clear'
            });
        }
    });
    // Save updated gathering
    const gatheringIndex = gatherings.findIndex(g => g.id === gatheringId);
    gatherings[gatheringIndex] = gathering;
    setData('gatherings', gatherings);
    
    // Get all unique locals for duty venue dropdown (with "Local ng" prefix)
    const allLocals = [...new Set(members.map(m => m.local))].sort().map(l => `Local ng ${l}`);
    
    // Group by local (member's origin)
    const byLocal = {};
    gathering.attendances.forEach(a => {
        const member = members.find(m => m.id === a.memberId);
        if (member) {
            if (!byLocal[member.local]) byLocal[member.local] = [];
            byLocal[member.local].push({ ...a, member });
        }
    });
    
    // Duty time preset options
    const dutyTimePresets = [
        'Wednesday - 3:00AM',
        'Wednesday - 5:00PM',
        'Saturday - 3:00AM',
        'Saturday - 11:00AM',
        'Saturday - 3:00PM',
        'Sunday - 5:00AM',
        'Sunday - 1:00PM',
        'Monday - 6:00PM',
        'Tuesday - 6:00PM',
        'Wednesday - 6:00PM',
        'Thursday - 6:00PM',
        'Friday - 6:00PM'
    ];
    
    // Weather options
    const weatherOptions = ['Clear', 'Cloudy', 'Rainy', 'Stormy', 'Windy'];
    
    let html = '';
    // Add venue information at the top
    html += `
        <div class="card mb-3">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <label class="form-label"><strong>Venue of Event:</strong></label>
                        <input type="text" class="form-control" id="eventVenue" 
                               value="${gathering.venue || ''}" 
                               placeholder="Enter venue/location of the event">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label"><strong>Weather Condition:</strong></label>
                        <select class="form-select" id="eventWeather">
                            ${weatherOptions.map(w => `<option value="${w}" ${gathering.weather === w ? 'selected' : ''}>${w}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    Object.keys(byLocal).sort().forEach(local => {
        const onDutyCount = byLocal[local].filter(a => a.isOnDuty).length;
        html += `
            <div class="card mb-3">
                <div class="local-header" style="margin: 0; border-radius: 8px 8px 0 0;">
                    ${local}
                    <span class="float-end"><span class="badge bg-light text-dark">${onDutyCount}/${byLocal[local].length} On Duty</span></span>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead>
                                <tr>
                                    <th style="width: 30px;"><input type="checkbox" class="form-check-input" onchange="toggleLocal('${local}', this.checked)"></th>
                                    <th>Name</th>
                                    <th style="width: 140px;">Time In</th>
                                    <th style="width: 100px;">Time Out</th>
                                    <th style="width: 110px;">Batch</th>
                                    <th style="width: 150px;">Duty Venue</th>
                                    <th style="width: 100px;">Condition</th>
                                    <th style="width: 100px;">Weather</th>
                                    <th style="width: 100px;">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${byLocal[local].map(a => {
                                    const presets = getMemberPresets(a.memberId);
                                    const timeInValue = a.dutyTime || presets.dutyTime || '';
                                    const timeOutValue = a.timeOut || presets.timeOut || '';
                                    const batchValue = a.batch || presets.batch || '';
                                    const dutyVenueValue = a.dutyVenue || presets.dutyVenue || '';
                                    
                                    return `
                                    <tr id="row-${a.memberId}">
                                        <td>
                                            <input type="checkbox" class="form-check-input attendance-check" 
                                                   data-member="${a.memberId}" data-local="${local}"
                                                   ${a.isOnDuty ? 'checked' : ''} 
                                                   onchange="updateRowStatus(${a.memberId}, this.checked)">
                                        </td>
                                        <td>
                                            <strong>${a.member.name}</strong><br>
                                            <small class="text-muted">${a.member.churchId}</small>
                                        </td>
                                        <td>
                                            <div class="d-flex flex-column gap-1">
                                                <select class="form-select form-select-sm duty-time-select" 
                                                        data-member="${a.memberId}"
                                                        onchange="handleDutyTimeChange(${a.memberId}, this.value)">
                                                    <option value="">Select...</option>
                                                    ${dutyTimePresets.map(p => `<option value="${p}" ${timeInValue === p ? 'selected' : ''}>${p}</option>`).join('')}
                                                    <option value="custom" ${timeInValue && !dutyTimePresets.includes(timeInValue) ? 'selected' : ''}>Custom...</option>
                                                </select>
                                                <input type="text" class="form-control form-control-sm duty-time-custom" 
                                                       data-member="${a.memberId}"
                                                       value="${timeInValue && !dutyTimePresets.includes(timeInValue) ? timeInValue : ''}" 
                                                       placeholder="Type custom time..."
                                                       style="${timeInValue && !dutyTimePresets.includes(timeInValue) ? '' : 'display:none;'}">
                                            </div>
                                        </td>
                                        <td>
                                            <input type="text" class="form-control form-control-sm time-out" 
                                                   data-member="${a.memberId}"
                                                   value="${timeOutValue}" 
                                                   placeholder="e.g., 7:00PM">
                                        </td>
                                        <td>
                                            <input type="text" class="form-control form-control-sm batch-input" 
                                                   data-member="${a.memberId}"
                                                   value="${batchValue}" 
                                                   placeholder="Batch">
                                        </td>
                                        <td>
                                            <select class="form-select form-select-sm duty-venue" data-member="${a.memberId}">
                                                <option value="">Select venue...</option>
                                                ${allLocals.map(l => `<option value="${l}" ${dutyVenueValue === l ? 'selected' : ''}>${l}</option>`).join('')}
                                            </select>
                                        </td>
                                        <td>
                                            <select class="form-select form-select-sm duty-condition" 
                                                    data-member="${a.memberId}"
                                                    onchange="toggleReasonField(${a.memberId}, this.value)">
                                                <option value="Normal" ${a.condition === 'Normal' || !a.condition ? 'selected' : ''}>Normal</option>
                                                <option value="Not Normal" ${a.condition === 'Not Normal' ? 'selected' : ''}>Not Normal</option>
                                            </select>
                                            <input type="text" class="form-control form-control-sm mt-1 reason-field" 
                                                   data-member="${a.memberId}"
                                                   value="${a.reason || ''}" 
                                                   placeholder="Reason..."
                                                   style="${a.condition === 'Not Normal' ? '' : 'display:none;'}">
                                        </td>
                                        <td>
                                            <select class="form-select form-select-sm duty-weather" data-member="${a.memberId}">
                                                ${weatherOptions.map(w => `<option value="${w}" ${a.weather === w ? 'selected' : ''}>${w}</option>`).join('')}
                                            </select>
                                        </td>
                                        <td>
                                            <span class="badge ${a.isOnDuty ? 'bg-success' : 'bg-secondary'} status-badge">
                                                ${a.isOnDuty ? 'On Duty' : 'Off'}
                                            </span>
                                        </td>
                                    </tr>
                                `}).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    });
    
    document.getElementById('attendanceForm').innerHTML = html;
    
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('attendancePage').classList.add('active');
    document.getElementById('pageTitle').textContent = 'Attendance: ' + gathering.title;
}

// Handle duty time dropdown change
function handleDutyTimeChange(memberId, value) {
    const customInput = document.querySelector(`.duty-time-custom[data-member="${memberId}"]`);
    if (value === 'custom') {
        customInput.style.display = 'block';
        customInput.focus();
    } else {
        customInput.style.display = 'none';
        customInput.value = '';
    }
}

// Toggle reason field visibility based on condition
function toggleReasonField(memberId, condition) {
    const reasonField = document.querySelector(`.reason-field[data-member="${memberId}"]`);
    if (condition === 'Not Normal') {
        reasonField.style.display = 'block';
    } else {
        reasonField.style.display = 'none';
        reasonField.value = '';
    }
}

function toggleLocal(local, checked) {
    document.querySelectorAll(`.attendance-check[data-local="${local}"]`).forEach(cb => {
        cb.checked = checked;
        updateRowStatus(cb.dataset.member, checked);
    });
}

function updateRowStatus(memberId, checked) {
    const row = document.getElementById('row-' + memberId);
    const badge = row.querySelector('.status-badge');
    
    if (checked) {
        row.classList.add('table-success');
        badge.className = 'badge bg-success status-badge';
        badge.textContent = 'On Duty';
    } else {
        row.classList.remove('table-success');
        badge.className = 'badge bg-secondary status-badge';
        badge.textContent = 'Off';
    }
}

function markAllOnDuty() {
    document.querySelectorAll('.attendance-check').forEach(cb => {
        cb.checked = true;
        updateRowStatus(cb.dataset.member, true);
    });
}

function markAllOffDuty() {
    document.querySelectorAll('.attendance-check').forEach(cb => {
        cb.checked = false;
        updateRowStatus(cb.dataset.member, false);
    });
}

function saveAttendance() {
    const gatheringId = getData('currentGatheringId');
    const gatherings = getData('gatherings') || [];
    const gatheringIndex = gatherings.findIndex(g => g.id === gatheringId);
    
    if (gatheringIndex === -1) {
        showToast('Gathering not found', 'danger');
        return;
    }
    
    // Save venue and weather
    const venueInput = document.getElementById('eventVenue');
    const weatherSelect = document.getElementById('eventWeather');
    if (venueInput) gatherings[gatheringIndex].venue = venueInput.value;
    if (weatherSelect) gatherings[gatheringIndex].weather = weatherSelect.value;
    
    document.querySelectorAll('.attendance-check').forEach(cb => {
        const memberId = parseInt(cb.dataset.member);
        const attendanceIndex = gatherings[gatheringIndex].attendances.findIndex(a => a.memberId === memberId);
        
        if (attendanceIndex !== -1) {
            gatherings[gatheringIndex].attendances[attendanceIndex].isOnDuty = cb.checked;
            
            // Get duty time - from dropdown or custom input
            const dutyTimeSelect = document.querySelector(`.duty-time-select[data-member="${memberId}"]`);
            const dutyTimeCustom = document.querySelector(`.duty-time-custom[data-member="${memberId}"]`);
            const timeOut = document.querySelector(`.time-out[data-member="${memberId}"]`);
            const batch = document.querySelector(`.batch-input[data-member="${memberId}"]`);
            const dutyVenue = document.querySelector(`.duty-venue[data-member="${memberId}"]`);
            const condition = document.querySelector(`.duty-condition[data-member="${memberId}"]`);
            const reason = document.querySelector(`.reason-field[data-member="${memberId}"]`);
            const weather = document.querySelector(`.duty-weather[data-member="${memberId}"]`);
            
            // Determine duty time value
            let dutyTimeValue = '';
            if (dutyTimeSelect) {
                if (dutyTimeSelect.value === 'custom' && dutyTimeCustom) {
                    dutyTimeValue = dutyTimeCustom.value;
                } else if (dutyTimeSelect.value && dutyTimeSelect.value !== 'custom') {
                    dutyTimeValue = dutyTimeSelect.value;
                }
            }
            
            gatherings[gatheringIndex].attendances[attendanceIndex].dutyTime = dutyTimeValue;
            if (timeOut) gatherings[gatheringIndex].attendances[attendanceIndex].timeOut = timeOut.value;
            if (batch) gatherings[gatheringIndex].attendances[attendanceIndex].batch = batch.value;
            
            // Auto-populate duty venue with event venue if on duty and no duty venue selected
            let dutyVenueValue = dutyVenue ? dutyVenue.value : '';
            const isOnDuty = cb.checked;
            const eventVenue = venueInput ? venueInput.value : '';
            if (isOnDuty && !dutyVenueValue && eventVenue) {
                dutyVenueValue = eventVenue;
            }
            gatherings[gatheringIndex].attendances[attendanceIndex].dutyVenue = dutyVenueValue;
            
            if (condition) gatherings[gatheringIndex].attendances[attendanceIndex].condition = condition.value;
            if (reason) gatherings[gatheringIndex].attendances[attendanceIndex].reason = reason.value;
            if (weather) gatherings[gatheringIndex].attendances[attendanceIndex].weather = weather.value;
            
            // Save presets for this member (remember last used values)
            if (isOnDuty) {
                saveMemberPresets(memberId, {
                    dutyTime: dutyTimeValue,
                    timeOut: timeOut ? timeOut.value : '',
                    batch: batch ? batch.value : '',
                    dutyVenue: dutyVenueValue
                });
            }
        }
    });
    
    setData('gatherings', gatherings);
    showToast('Attendance saved successfully!', 'success');
    showPage('gatherings');
}

function deleteGathering(gatheringId) {
    if (!confirm('Are you sure you want to delete this gathering?')) return;
    
    let gatherings = getData('gatherings') || [];
    gatherings = gatherings.filter(g => g.id !== gatheringId);
    setData('gatherings', gatherings);
    
    showToast('Gathering deleted', 'info');
    loadGatherings();
}

// ==================== DUTY STATUS CALCULATION ====================

function calculateDutyStatus(memberId) {
    const gatherings = getData('gatherings') || [];
    const threeWeeksAgo = new Date();
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
    threeWeeksAgo.setHours(0, 0, 0, 0);
    
    // Count duties in last 3 weeks
    let recentDuties = 0;
    let consecutiveDuties = 0;
    let lastWasOnDuty = true;
    
    // Sort gatherings by date descending (most recent first)
    const sortedGatherings = [...gatherings].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    for (const g of sortedGatherings) {
        const attendance = g.attendances.find(a => a.memberId === memberId);
        if (!attendance) continue;
        
        const gatheringDate = new Date(g.date);
        gatheringDate.setHours(0, 0, 0, 0);
        
        if (gatheringDate >= threeWeeksAgo && attendance.isOnDuty) {
            recentDuties++;
        }
        
        // Check consecutive duties (from most recent backwards)
        if (lastWasOnDuty && attendance.isOnDuty) {
            consecutiveDuties++;
        } else if (!attendance.isOnDuty) {
            lastWasOnDuty = false;
        }
    }
    
    // Duty Status Logic:
    // - Inactive: No duty in the last 3 weeks
    // - On-Off: 1 or 2 duties only in the last 3 weeks
    // - Active: 5+ consecutive duties (Active status without duty in 3 weeks -> Inactive)
    // - Active (Confirmed): 5+ consecutive duties and has duty in last 3 weeks
    
    if (recentDuties === 0) {
        return 'Inactive';
    }
    
    if (recentDuties <= 2) {
        return 'On-Off';
    }
    
    // Has 3+ duties in last 3 weeks
    if (consecutiveDuties >= 5) {
        return 'Active (Confirmed)';
    }
    
    return 'Active';
}

function getDutyCount(memberId) {
    const gatherings = getData('gatherings') || [];
    let count = 0;
    
    gatherings.forEach(g => {
        const attendance = g.attendances.find(a => a.memberId === memberId);
        if (attendance && attendance.isOnDuty) count++;
    });
    
    return count;
}

function getConsecutiveDuties(memberId) {
    const gatherings = getData('gatherings') || [];
    let consecutive = 0;
    
    const sortedGatherings = [...gatherings].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    for (const g of sortedGatherings) {
        const attendance = g.attendances.find(a => a.memberId === memberId);
        if (!attendance) continue;
        
        if (attendance.isOnDuty) {
            consecutive++;
        } else {
            break;
        }
    }
    
    return consecutive;
}

// ==================== ANALYTICS ====================

function loadAnalytics() {
    const members = getMembers() || [];
    
    let active = 0, onoff = 0, inactive = 0;
    const leaderboardData = [];
    
    members.forEach(m => {
        const status = calculateDutyStatus(m.id);
        if (status === 'Active' || status === 'Active (Confirmed)') active++;
        else if (status === 'On-Off') onoff++;
        else inactive++;
        
        leaderboardData.push({
            ...m,
            status,
            totalDuties: getDutyCount(m.id),
            consecutive: getConsecutiveDuties(m.id)
        });
    });
    
    document.getElementById('analyticsActive').textContent = active;
    document.getElementById('analyticsOnOff').textContent = onoff;
    document.getElementById('analyticsInactive').textContent = inactive;
    
    // Sort by total duties
    leaderboardData.sort((a, b) => b.totalDuties - a.totalDuties);
    
    const tbody = document.getElementById('leaderboard');
    tbody.innerHTML = leaderboardData.map((m, i) => {
        const statusClass = m.status.includes('Active') ? (m.status.includes('Confirmed') ? 'badge-confirmed' : 'badge-active') : 
                           m.status === 'On-Off' ? 'badge-onoff' : 'badge-inactive';
        return `
            <tr>
                <td>
                    ${i < 3 ? `<span class="badge ${i === 0 ? 'bg-warning text-dark' : i === 1 ? 'bg-secondary' : 'bg-danger'}">${i + 1}</span>` : i + 1}
                </td>
                <td><strong>${m.name}</strong></td>
                <td><span class="badge bg-info">${m.local}</span></td>
                <td><span class="badge ${statusClass}">${m.status}</span></td>
                <td class="text-center"><strong class="text-primary">${m.totalDuties}</strong></td>
                <td class="text-center"><strong class="text-success">${m.consecutive}</strong></td>
            </tr>
        `;
    }).join('');
}

// ==================== EXPORT TO EXCEL ====================

function exportToExcel(gatheringId) {
    const gatherings = getData('gatherings') || [];
    const members = getMembers() || [];
    const gathering = gatherings.find(g => g.id === gatheringId);
    
    if (!gathering) {
        showToast('Gathering not found', 'danger');
        return;
    }
    
    // Create HTML table for Excel with colors
    let html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="UTF-8">
            <style>
                .header-blue { background-color: #1e3a5f; color: white; font-weight: bold; text-align: center; }
                .header-orange { background-color: #d4881e; color: white; font-weight: bold; text-align: center; }
                .subheader { background-color: #4a90d9; color: white; font-weight: bold; }
                .local-header { background-color: #1e3a5f; color: white; font-weight: bold; }
                .on-duty { background-color: #d4edda; }
                .not-duty { background-color: #f8d7da; }
                .not-normal { background-color: #fff3cd; }
                table { border-collapse: collapse; width: 100%; }
                td, th { border: 1px solid #000; padding: 5px; }
                .title { font-size: 18px; font-weight: bold; text-align: center; }
                .center { text-align: center; }
            </style>
        </head>
        <body>
            <table>
                <tr><td colspan="11" class="title header-blue">MCGI DRRT ON DUTY BOHOL REPORT</td></tr>
                <tr><td colspan="11" class="title" style="background-color: #f5f5f5;">${gathering.title.toUpperCase()}</td></tr>
                <tr>
                    <td colspan="5" style="font-weight: bold;">Date: ${formatDate(gathering.date)}</td>
                    <td colspan="3" style="font-weight: bold;">Venue: ${gathering.venue || 'N/A'}</td>
                    <td colspan="3" style="font-weight: bold;">Weather: ${gathering.weather || 'N/A'}</td>
                </tr>
                <tr><td colspan="11"></td></tr>
                <tr class="subheader">
                    <td>NO.</td>
                    <td>NAME</td>
                    <td>LOCALE</td>
                    <td>BATCH</td>
                    <td>DUTY</td>
                    <td>TIME IN</td>
                    <td>TIME OUT</td>
                    <td>DUTY VENUE</td>
                    <td>CONDITION</td>
                    <td>WEATHER</td>
                    <td>DUTY STATUS</td>
                </tr>
    `;
    
    // Group by local
    const byLocal = {};
    gathering.attendances.forEach(a => {
        const member = members.find(m => m.id === a.memberId);
        if (member) {
            if (!byLocal[member.local]) byLocal[member.local] = [];
            byLocal[member.local].push({ ...a, member });
        }
    });
    
    let rowNum = 1;
    Object.keys(byLocal).sort().forEach(local => {
        html += `<tr class="local-header"><td colspan="11">${local.toUpperCase()}</td></tr>`;
        byLocal[local].forEach(a => {
            const rowClass = a.isOnDuty ? 'on-duty' : 'not-duty';
            const conditionClass = a.condition === 'Not Normal' ? 'not-normal' : '';
            html += `
                <tr class="${rowClass} ${conditionClass}">
                    <td class="center">${rowNum}</td>
                    <td><strong>${a.member.name}</strong></td>
                    <td>${a.member.local}</td>
                    <td>${a.batch || '-'}</td>
                    <td>${a.dutyTime || '-'}</td>
                    <td>${a.dutyTime || '-'}</td>
                    <td>${a.timeOut || '-'}</td>
                    <td>${a.dutyVenue || '-'}</td>
                    <td>${a.condition || 'Normal'}${a.reason ? ` (${a.reason})` : ''}</td>
                    <td>${a.weather || 'Clear'}</td>
                    <td class="center"><strong>${a.isOnDuty ? 'ON DUTY' : ''}</strong></td>
                </tr>
            `;
            rowNum++;
        });
    });
    
    // Summary
    const onDutyCount = gathering.attendances.filter(a => a.isOnDuty).length;
    const notNormalCount = gathering.attendances.filter(a => a.condition === 'Not Normal').length;
    
    html += `
                <tr><td colspan="11"></td></tr>
                <tr class="header-orange">
                    <td colspan="3">TOTAL ON DUTY: ${onDutyCount}</td>
                    <td colspan="4">TOTAL NOT ON DUTY: ${gathering.attendances.length - onDutyCount}</td>
                    <td colspan="4">NOT NORMAL CONDITIONS: ${notNormalCount}</td>
                </tr>
            </table>
        </body>
        </html>
    `;
    
    // Download as Excel file
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `MCGI_DRRT_${gathering.title.replace(/\s+/g, '_')}_${gathering.date}.xls`;
    link.click();
    
    showToast('Excel file downloaded!', 'success');
}

// ==================== UTILITIES ====================

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toast.className = 'toast';
    if (type === 'success') toast.classList.add('bg-success', 'text-white');
    else if (type === 'danger') toast.classList.add('bg-danger', 'text-white');
    else if (type === 'warning') toast.classList.add('bg-warning');
    
    toastMessage.textContent = message;
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

// ==================== REAL-TIME CLOCK ====================

function updateRealTimeClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: true,
        timeZone: 'Asia/Manila'
    });
    const dateStr = now.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        timeZone: 'Asia/Manila'
    });
    
    const timeEl = document.getElementById('currentTime');
    const dateEl = document.getElementById('currentDate');
    
    if (timeEl) timeEl.textContent = timeStr + ' (PH)';
    if (dateEl) dateEl.textContent = dateStr;
}

setInterval(updateRealTimeClock, 1000);

// ==================== CALENDAR ====================

let currentCalendarDate = new Date();
let selectedCalendarDate = null;

function loadCalendar() {
    renderCalendar();
    loadUpcomingActivities();
    loadTodayActivities();
    checkAutoCreateGatherings();
}

function renderCalendar() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('calendarMonthYear').textContent = `${monthNames[month]} ${year}`;
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const activities = getData('activities') || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let html = '';
    let dayCount = 1;
    let nextMonthDay = 1;
    
    const totalCells = 42;
    
    for (let i = 0; i < totalCells; i++) {
        let dayNum, isOtherMonth = false, dateStr;
        
        if (i < firstDay) {
            dayNum = daysInPrevMonth - firstDay + i + 1;
            isOtherMonth = true;
            // Previous month - use proper year/month calculation
            let prevMonthYear = month === 0 ? year - 1 : year;
            let prevMonthNum = month === 0 ? 12 : month;
            dateStr = `${prevMonthYear}-${String(prevMonthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
        } else if (dayCount > daysInMonth) {
            dayNum = nextMonthDay++;
            isOtherMonth = true;
            // Next month - use proper year/month calculation
            let nextMonthYear = month === 11 ? year + 1 : year;
            let nextMonthNum = month === 11 ? 1 : month + 2;
            dateStr = `${nextMonthYear}-${String(nextMonthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
        } else {
            dayNum = dayCount++;
            // Current month
            dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
        }
        
        const cellDate = new Date(year, month - (isOtherMonth && i < firstDay ? 1 : 0), dayNum);
        cellDate.setHours(0, 0, 0, 0);
        const isToday = cellDate.getTime() === today.getTime();
        
        const dayActivities = activities.filter(a => a.date === dateStr);
        const hasActivity = dayActivities.length > 0;
        
        let classes = 'calendar-day';
        if (isOtherMonth) classes += ' other-month';
        if (isToday) classes += ' today';
        if (hasActivity) classes += ' has-activity';
        
        html += `
            <div class="${classes}" onclick="showDayActivities('${dateStr}')">
                <div class="calendar-day-number">${dayNum}</div>
                ${dayActivities.slice(0, 3).map(a => `
                    <div class="calendar-activity" onclick="event.stopPropagation(); viewActivity(${a.id})" title="${a.title}">
                        ${a.time} ${a.title}
                    </div>
                `).join('')}
                ${dayActivities.length > 3 ? `<span class="activity-badge">+${dayActivities.length - 3} more</span>` : ''}
            </div>
        `;
    }
    
    document.getElementById('calendarDays').innerHTML = html;
}

function previousMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar();
}

function showAddActivityModal(date = null) {
    document.getElementById('editActivityId').value = '';
    document.getElementById('activityTitle').value = '';
    // Use local date formatting to avoid timezone issues
    const today = new Date();
    const localDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    document.getElementById('activityDate').value = date || localDateStr;
    document.getElementById('activityTime').value = '09:00';
    document.getElementById('autoCreateGathering').checked = true;
    document.getElementById('autoCreateMinutes').value = '30';
    
    new bootstrap.Modal(document.getElementById('addActivityModal')).show();
}

function saveActivity() {
    const id = document.getElementById('editActivityId').value;
    const title = document.getElementById('activityTitle').value.trim();
    const date = document.getElementById('activityDate').value;
    const time = document.getElementById('activityTime').value;
    const autoCreate = document.getElementById('autoCreateGathering').checked;
    const autoCreateMinutes = parseInt(document.getElementById('autoCreateMinutes').value) || 30;
    
    if (!title || !date || !time) {
        showToast('Please fill in all required fields', 'danger');
        return;
    }
    
    const activities = getData('activities') || [];
    
    if (id) {
        const index = activities.findIndex(a => a.id === parseInt(id));
        if (index !== -1) {
            activities[index] = { ...activities[index], title, date, time, autoCreate, autoCreateMinutes };
        }
    } else {
        const activity = {
            id: Date.now(),
            title,
            date,
            time,
            autoCreate,
            autoCreateMinutes,
            gatheringCreated: false,
            created_at: new Date().toISOString()
        };
        activities.push(activity);
    }
    
    setData('activities', activities);
    showToast('Activity saved successfully!', 'success');
    
    bootstrap.Modal.getInstance(document.getElementById('addActivityModal')).hide();
    loadCalendar();
    
    // Immediately check if we need to auto-create a gathering
    checkAutoCreateGatherings();
}

function viewActivity(activityId) {
    const activities = getData('activities') || [];
    const activity = activities.find(a => a.id === activityId);
    
    if (!activity) return;
    
    document.getElementById('editActivityId').value = activity.id;
    document.getElementById('activityTitle').value = activity.title;
    document.getElementById('activityDate').value = activity.date;
    document.getElementById('activityTime').value = activity.time;
    document.getElementById('autoCreateGathering').checked = activity.autoCreate;
    document.getElementById('autoCreateMinutes').value = activity.autoCreateMinutes || 30;
    
    new bootstrap.Modal(document.getElementById('addActivityModal')).show();
}

function deleteActivity(activityId) {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    
    let activities = getData('activities') || [];
    activities = activities.filter(a => a.id !== activityId);
    setData('activities', activities);
    
    showToast('Activity deleted', 'info');
    loadCalendar();
}

// FIX #2: Removed the duplicate orphaned closing block that appeared after this function
function showDayActivities(dateStr) {
    const activities = getData('activities') || [];
    const dayActivities = activities.filter(a => a.date === dateStr);
    const userType = getData('userType');
    const isAdmin = userType === 'admin';
    
    selectedCalendarDate = dateStr;
    
    // Parse date string properly to avoid timezone issues (format: YYYY-MM-DD)
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    document.getElementById('dayActivitiesTitle').textContent = formattedDate;
    
    if (dayActivities.length === 0) {
        document.getElementById('dayActivitiesList').innerHTML = `
            <p class="text-muted text-center py-4">No activities scheduled for this day.</p>
        `;
    } else {
        document.getElementById('dayActivitiesList').innerHTML = dayActivities.map(a => `
            <div class="d-flex justify-content-between align-items-center p-2 mb-2 bg-light rounded">
                <div>
                    <strong>${a.time}</strong> - ${a.title}
                    ${a.autoCreate ? '<span class="badge bg-success ms-2">Auto-gathering</span>' : ''}
                    ${a.gatheringCreated ? '<span class="badge bg-info ms-2">Gathering Created</span>' : ''}
                </div>
                ${isAdmin ? `
                <div>
                    ${!a.gatheringCreated ? `
                        <button class="btn btn-sm btn-outline-success me-1" onclick="createGatheringNow(${a.id})" title="Create Gathering Now">
                            <i class="bi bi-plus-circle"></i>
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="viewActivity(${a.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteActivity(${a.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
                ` : ''}
            </div>
        `).join('');
    }
    
    // Hide add activity button for members
    const addBtn = document.getElementById('addActivityForDayBtn');
    if (addBtn) {
        addBtn.style.display = isAdmin ? '' : 'none';
    }
    
    new bootstrap.Modal(document.getElementById('dayActivitiesModal')).show();
}

function addActivityForSelectedDay() {
    bootstrap.Modal.getInstance(document.getElementById('dayActivitiesModal')).hide();
    showAddActivityModal(selectedCalendarDate);
}

function loadUpcomingActivities() {
    const activities = getData('activities') || [];
    const userType = getData('userType');
    const isAdmin = userType === 'admin';
    
    // Use local date formatting to avoid timezone issues
    const todayObj = new Date();
    const today = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;
    
    const upcoming = activities
        .filter(a => a.date >= today)
        .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
        .slice(0, 10);
    
    const container = document.getElementById('upcomingActivities');
    
    if (upcoming.length === 0) {
        container.innerHTML = '<p class="text-muted text-center py-4">No upcoming activities</p>';
        return;
    }
    
    container.innerHTML = upcoming.map(a => `
        <div class="d-flex justify-content-between align-items-center p-2 mb-2 border rounded">
            <div>
                <strong>${a.title}</strong><br>
                <small class="text-muted">${formatDate(a.date)} at ${a.time}</small>
                ${a.gatheringCreated ? '<span class="badge bg-success ms-2">Gathering Created</span>' : 
                  (a.autoCreate ? '<span class="badge bg-warning text-dark ms-2">Auto-create pending</span>' : '')}
            </div>
            ${isAdmin ? `
            <div>
                ${!a.gatheringCreated ? `
                    <button class="btn btn-sm btn-outline-success" onclick="createGatheringNow(${a.id})" title="Create Gathering Now">
                        <i class="bi bi-plus-circle"></i>
                    </button>
                ` : ''}
                <button class="btn btn-sm btn-outline-primary" onclick="viewActivity(${a.id})" title="Edit Activity">
                    <i class="bi bi-pencil"></i>
                </button>
            </div>
            ` : ''}
        </div>
    `).join('');
}

function loadTodayActivities() {
    const activities = getData('activities') || [];
    const userType = getData('userType');
    const isAdmin = userType === 'admin';
    
    // Use local date formatting to avoid timezone issues
    const todayObj = new Date();
    const today = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;
    
    const todayActs = activities
        .filter(a => a.date === today)
        .sort((a, b) => a.time.localeCompare(b.time));
    
    const container = document.getElementById('todayActivities');
    
    if (todayActs.length === 0) {
        container.innerHTML = '<p class="text-muted text-center py-4">No activities today</p>';
        return;
    }
    
    container.innerHTML = todayActs.map(a => `
        <div class="d-flex justify-content-between align-items-center p-2 mb-2 bg-light rounded">
            <div>
                <strong>${a.time}</strong> - ${a.title}
            </div>
            ${isAdmin ? `
            <button class="btn btn-sm btn-outline-primary" onclick="viewActivity(${a.id})">
                <i class="bi bi-pencil"></i>
            </button>
            ` : ''}
        </div>
    `).join('');
}

function checkAutoCreateGatherings() {
    const activities = getData('activities') || [];
    const members = getMembers() || [];
    const gatherings = getData('gatherings') || [];
    
    if (members.length === 0) {
        console.log('No members found, skipping auto-create check');
        return;
    }
    
    // Get current time in Philippines timezone
    const now = new Date();
    const phTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    
    let updatedActivities = false;
    let updatedGatherings = false;
    
    activities.forEach((activity, index) => {
        if (!activity.autoCreate || activity.gatheringCreated) return;
        
        // Parse the activity date and time properly (date is YYYY-MM-DD, time is HH:MM)
        const [year, month, day] = activity.date.split('-').map(Number);
        const [hours, minutes] = activity.time.split(':').map(Number);
        
        // Create activity datetime in Philippines timezone
        const activityDateTime = new Date(year, month - 1, day, hours, minutes, 0);
        
        // Calculate when to create the gathering (X minutes before activity)
        const createTime = new Date(activityDateTime.getTime() - (activity.autoCreateMinutes || 30) * 60000);
        
        console.log(`Checking activity: ${activity.title}`);
        console.log(`  Activity time: ${activityDateTime.toLocaleString()}`);
        console.log(`  Create time: ${createTime.toLocaleString()}`);
        console.log(`  Current PH time: ${phTime.toLocaleString()}`);
        console.log(`  Should create: ${phTime >= createTime}`);
        
        if (phTime >= createTime) {
            const existingGathering = gatherings.find(g => g.title === activity.title && g.date === activity.date);
            
            if (!existingGathering) {
                const attendances = members.map(m => ({
                    memberId: m.id,
                    isOnDuty: false,
                    dutyTime: '',
                    timeOut: '',
                    batch: '',
                    dutyVenue: '',
                    condition: 'Normal',
                    reason: '',
                    weather: 'Clear'
                }));
                
                const gathering = {
                    id: Date.now() + Math.random(),
                    title: activity.title,
                    date: activity.date,
                    local: '',
                    venue: '',
                    weather: 'Clear',
                    attendances,
                    createdByActivity: activity.id
                };
                
                gatherings.push(gathering);
                activities[index].gatheringCreated = true;
                updatedActivities = true;
                updatedGatherings = true;
                
                console.log(`Auto-created gathering for: ${activity.title}`);
            }
        }
    });
    
    if (updatedActivities) setData('activities', activities);
    if (updatedGatherings) {
        setData('gatherings', gatherings);
        showToast('New gathering(s) created from scheduled activities!', 'success');
        // Refresh the gatherings list if on that page
        if (document.getElementById('gatheringsPage')?.classList.contains('active')) {
            loadGatherings();
        }
        // Also refresh calendar to show updated status
        if (document.getElementById('calendarPage')?.classList.contains('active')) {
            loadCalendar();
        }
    }
}

function createGatheringNow(activityId) {
    const activities = getData('activities') || [];
    const members = getMembers() || [];
    const gatherings = getData('gatherings') || [];
    
    const activityIndex = activities.findIndex(a => a.id === activityId);
    if (activityIndex === -1) return;
    
    const activity = activities[activityIndex];
    
    const existingGathering = gatherings.find(g => g.title === activity.title && g.date === activity.date);
    if (existingGathering) {
        showToast('Gathering already exists for this activity', 'warning');
        return;
    }
    
    if (members.length === 0) {
        showToast('No members to add to gathering', 'warning');
        return;
    }
    
    const attendances = members.map(m => ({
        memberId: m.id,
        isOnDuty: false,
        dutyTime: '',
        timeOut: '',
        batch: '',
        dutyVenue: '',
        condition: 'Normal',
        reason: '',
        weather: 'Clear'
    }));
    
    const gathering = {
        id: Date.now() + Math.random(),
        title: activity.title,
        date: activity.date,
        local: '',
        venue: '',
        weather: 'Clear',
        attendances,
        createdByActivity: activity.id
    };
    
    gatherings.push(gathering);
    activities[activityIndex].gatheringCreated = true;
    
    setData('activities', activities);
    setData('gatherings', gatherings);
    
    showToast(`Gathering "${activity.title}" created successfully!`, 'success');
    loadCalendar();
}

// Check for auto-create gatherings every 10 seconds for more responsive behavior
setInterval(checkAutoCreateGatherings, 10000);

// ==================== SETTINGS ====================

let verificationCodeData = null;

function loadSettings() {
    const admin = getData('admin');
    if (admin) {
        document.getElementById('currentAdminName').value = admin.name;
        document.getElementById('currentAdminEmail').value = admin.email;
        
        // Load admin profile photo
        const adminPhoto = document.getElementById('adminProfilePhoto');
        if (admin.photo) {
            adminPhoto.src = admin.photo;
        } else {
            adminPhoto.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'120\' height=\'120\' viewBox=\'0 0 120 120\'%3E%3Crect fill=\'%23e9ecef\' width=\'120\' height=\'120\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%236c757d\' font-size=\'50\'%3E👤%3C/text%3E%3C/svg%3E';
        }
    }
    // Load backup admin status
    loadBackupAdminStatus();
}

// Preview admin photo before saving
function previewAdminPhoto(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('adminProfilePhoto').src = e.target.result;
            document.getElementById('saveAdminPhotoBtn').style.display = 'inline-block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Save admin profile photo
function saveAdminPhoto() {
    const admin = getData('admin');
    const photoSrc = document.getElementById('adminProfilePhoto').src;
    
    if (photoSrc && !photoSrc.includes('data:image/svg+xml')) {
        admin.photo = photoSrc;
        setData('admin', admin);
        
        // Update header photo
        updateHeaderPhoto(photoSrc, admin.name);
        
        document.getElementById('saveAdminPhotoBtn').style.display = 'none';
        showToast('Profile photo saved successfully!', 'success');
    } else {
        showToast('Please select a valid photo first', 'warning');
    }
}

function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function sendVerificationCode() {
    const admin = getData('admin');
    if (!admin) {
        showToast('No admin account found', 'danger');
        return;
    }
    
    const code = generateVerificationCode();
    const expiry = Date.now() + (10 * 60 * 1000); // 10 minutes
    
    verificationCodeData = { code, expiry };
    
    // Show verification code in demo mode (EmailJS removed)
    showToast('Verification code generated!', 'success');
    document.getElementById('verificationSection').style.display = 'block';
    alert(`Your verification code is: ${code}\n\nThis code will expire in 10 minutes.`);
}

function verifyCode() {
    const enteredCode = document.getElementById('verificationCode').value;
    
    if (!verificationCodeData) {
        showToast('Please request a verification code first', 'warning');
        return;
    }
    
    if (Date.now() > verificationCodeData.expiry) {
        showToast('Verification code has expired. Please request a new one.', 'danger');
        verificationCodeData = null;
        return;
    }
    
    // FIX #3: Removed incorrect `verificationCodeData.verificationCodeData` reference;
    // only compare against verificationCodeData.code
    if (enteredCode === verificationCodeData.code) {
        showToast('Verified successfully! You can now change your credentials.', 'success');
        document.getElementById('verificationSection').style.display = 'none';
        document.getElementById('changeCredentialsForm').style.display = 'block';
        verificationCodeData = null;
    } else {
        showToast('Invalid verification code', 'danger');
    }
}

function saveCredentials() {
    const newName = document.getElementById('newAdminName').value.trim();
    const newPassword = document.getElementById('newAdminPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    if (!newName && !newPassword) {
        showToast('Please enter at least a new name or new password', 'warning');
        return;
    }
    
    if (newPassword && newPassword !== confirmPassword) {
        showToast('Passwords do not match', 'danger');
        return;
    }
    
    if (newPassword && newPassword.length < 6) {
        showToast('Password must be at least 6 characters', 'warning');
        return;
    }
    
    const admin = getData('admin');
    if (newName) admin.name = newName;
    if (newPassword) admin.password = newPassword;
    
    setData('admin', admin);
    
    showToast('Credentials updated successfully!', 'success');
    
    document.getElementById('currentAdminName').value = admin.name;
    document.getElementById('adminName').textContent = admin.name;
    
    document.getElementById('newAdminName').value = '';
    document.getElementById('newAdminPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
    document.getElementById('changeCredentialsForm').style.display = 'none';
}

function cancelChangeCredentials() {
    document.getElementById('verificationSection').style.display = 'none';
    document.getElementById('changeCredentialsForm').style.display = 'none';
    document.getElementById('verificationCode').value = '';
    document.getElementById('newAdminName').value = '';
    document.getElementById('newAdminPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
    verificationCodeData = null;
}

function exportAllData() {
    const data = {
        admin: getData('admin'),
        members: getMembers() || [],
        gatherings: getData('gatherings') || [],
        memberPresets: getData('memberPresets') || {},
        activities: getData('activities') || [],
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mcgi_drrt_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Data exported successfully!', 'success');
}

function importAllData() {
    const fileInput = document.getElementById('importDataFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showToast('Please select a file to import', 'warning');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (!confirm('This will replace all existing data. Are you sure?')) {
                return;
            }
            
            if (data.admin) setData('admin', data.admin);
            if (data.members) setMembers(data.members);
            if (data.gatherings) setData('gatherings', data.gatherings);
            if (data.memberPresets) setData('memberPresets', data.memberPresets);
            if (data.activities) setData('activities', data.activities);
            
            showToast('Data imported successfully! Refreshing...', 'success');
            setTimeout(() => location.reload(), 1500);
        } catch (err) {
            showToast('Invalid file format. Please select a valid backup file.', 'danger');
        }
    };
    reader.readAsText(file);
}

function clearAllData() {
    // This function is disabled - clear all data button removed
    showToast('This function is disabled for security', 'warning');
}

// ==================== BACKUP ADMIN SYSTEM ====================

function createBackupAdmin() {
    const name = document.getElementById('backupAdminName').value.trim();
    const email = document.getElementById('backupAdminEmail').value.trim();
    const password = document.getElementById('backupAdminPassword').value;
    
    if (!name || !email || !password) {
        showToast('Please fill in all fields', 'warning');
        return;
    }
    
    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'warning');
        return;
    }
    
    // Encrypt credentials before storing
    const encryptedPassword = btoa(password); // Basic encoding (not secure encryption)
    const encryptedEmail = btoa(email);
    const encryptedName = btoa(name);
    
    const backupAdmin = {
        encN: encryptedName,
        encE: encryptedEmail,
        encP: encryptedPassword,
        createdAt: new Date().toISOString()
    };
    
    setData('sys_cfg', backupAdmin); // Store with obscure key name
    
    showToast('Secondary account created successfully!', 'success');
    
    // Hide the form completely - no status shown
    document.getElementById('backupAdminSetup').style.display = 'none';
}

function loadBackupAdminStatus() {
    const backupAdmin = getData('sys_cfg');
    const userType = getData('userType');
    
    if (userType === 'bkp_adm') {
        // Show backup admin controls
        document.getElementById('backupAdminSection').style.display = '';
        document.getElementById('backupAdminSetup').style.display = 'none';
        
        // Show last backup time
        const lastBackup = localStorage.getItem('lst_bkp');
        if (lastBackup) {
            document.getElementById('lastBackupTime').textContent = `Last backup: ${new Date(lastBackup).toLocaleString()}`;
        } else {
            document.getElementById('lastBackupTime').textContent = 'No automatic backup yet';
        }
    } else {
        // Hide backup admin section for main admin
        document.getElementById('backupAdminSection').style.display = 'none';
        
        // Only show setup form if no backup admin exists
        if (!backupAdmin) {
            document.getElementById('backupAdminSetup').style.display = '';
        } else {
            document.getElementById('backupAdminSetup').style.display = 'none';
        }
    }
}

function downloadAutoBackup() {
    const backupData = localStorage.getItem('autoBackupData');
    
    if (!backupData) {
        showToast('No backup data available. Wait for automatic backup.', 'warning');
        return;
    }
    
    const data = JSON.parse(backupData);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mcgi_drrt_auto_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Backup downloaded successfully!', 'success');
}

function resetAdminAccount() {
    const newName = document.getElementById('resetAdminName').value.trim();
    const newEmail = document.getElementById('resetAdminEmail').value.trim();
    const newPassword = document.getElementById('resetAdminPassword').value;
    
    if (!newName && !newEmail && !newPassword) {
        showToast('Please enter at least one field to update', 'warning');
        return;
    }
    
    if (!confirm('Are you sure you want to reset the main admin account? This will update the admin credentials.')) {
        return;
    }
    
    const admin = getData('admin');
    if (newName) admin.name = newName;
    if (newEmail) admin.email = newEmail;
    if (newPassword) {
        if (newPassword.length < 6) {
            showToast('Password must be at least 6 characters', 'warning');
            return;
        }
        admin.password = newPassword;
    }
    
    setData('admin', admin);
    
    showToast('Admin account reset successfully!', 'success');
    
    // Clear the form
    document.getElementById('resetAdminName').value = '';
    document.getElementById('resetAdminEmail').value = '';
    document.getElementById('resetAdminPassword').value = '';
}

function restoreBackupToAdmin() {
    const fileInput = document.getElementById('restoreBackupFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showToast('Please select a backup file', 'warning');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (!confirm('This will replace all data. Are you sure?')) {
                return;
            }
            
            if (data.admin) setData('admin', data.admin);
            if (data.members) setMembers(data.members);
            if (data.gatherings) setData('gatherings', data.gatherings);
            if (data.memberPresets) setData('memberPresets', data.memberPresets);
            if (data.activities) setData('activities', data.activities);
            
            showToast('Data restored successfully!', 'success');
        } catch (err) {
            showToast('Invalid backup file format', 'danger');
        }
    };
    reader.readAsText(file);
}

// Auto-backup function - runs every 24 hours
function performAutoBackup() {
    const data = {
        admin: getData('admin'),
        members: getMembers() || [],
        gatherings: getData('gatherings') || [],
        memberPresets: getData('memberPresets') || {},
        activities: getData('activities') || [],
        autoBackupDate: new Date().toISOString()
    };
    
    localStorage.setItem('autoBackupData', JSON.stringify(data));
    localStorage.setItem('lastAutoBackup', new Date().toISOString());
    
    console.log('Auto-backup completed at', new Date().toLocaleString());
}

// Check and perform auto-backup if needed
function checkAutoBackup() {
    const lastBackup = localStorage.getItem('lastAutoBackup');
    const now = new Date();
    
    if (!lastBackup) {
        // No backup exists, create one
        performAutoBackup();
        return;
    }
    
    const lastBackupDate = new Date(lastBackup);
    const hoursSinceBackup = (now - lastBackupDate) / (1000 * 60 * 60);
    
    // If more than 24 hours since last backup
    if (hoursSinceBackup >= 24) {
        performAutoBackup();
    }
}

// ==================== INITIALIZE ====================

document.addEventListener('DOMContentLoaded', function() {
    initApp();
    checkLogin();
    updateRealTimeClock();
    checkAutoCreateGatherings();
    checkAutoBackup(); // Start auto-backup check
    
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            login();
        });
    }
    
    const loginPassword = document.getElementById('loginPassword');
    if (loginPassword) {
        loginPassword.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                login();
            }
        });
    }
    
    const loginEmail = document.getElementById('loginEmail');
    if (loginEmail) {
        loginEmail.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                login();
            }
        });
    }
});

// Auto-backup interval - check every hour
setInterval(checkAutoBackup, 60 * 60 * 1000);