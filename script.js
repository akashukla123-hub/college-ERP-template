// Core Multi-Tenant Database State Engine Archetype
let students = JSON.parse(localStorage.getItem('v2_studs')) || [];
let teachers = JSON.parse(localStorage.getItem('v2_techs')) || [];
let courses = JSON.parse(localStorage.getItem('v2_courses')) || {};
let notices = JSON.parse(localStorage.getItem('v2_notices')) || [];
let marksRegistry = JSON.parse(localStorage.getItem('v2_marks')) || {};
let feeLedgers = JSON.parse(localStorage.getItem('v2_fee_ledgers')) || {};
let receiptsHistory = JSON.parse(localStorage.getItem('v2_receipts')) || {};
let warningsRegistry = JSON.parse(localStorage.getItem('v2_warnings')) || {};
let messageVault = JSON.parse(localStorage.getItem('v2_vault')) || [];

let currentUser = null;

// Auto Database Seeding Logic Matrix
if (Object.keys(courses).length === 0) {
    courses = {
        'B.Tech': { fee: 48000, salary: 65000 },
        'BSc': { fee: 32000, salary: 55000 },
        'BCom': { fee: 28000, salary: 50000 },
        'BA': { fee: 24000, salary: 45000 }
    };

    students = [
        { id: 101, roll: 'ROLL-101', name: 'Rajesh Kumar', course: 'B.Tech', parent: 'Manoj Kumar', photo: '' },
        { id: 102, roll: 'ROLL-102', name: 'Anjali Sharma', course: 'BSc', parent: 'Devendra Sharma', photo: '' },
        { id: 103, roll: 'ROLL-103', name: 'Amit Verma', course: 'BCom', parent: 'Suresh Verma', photo: '' }
    ];

    teachers = [
        { id: 501, empId: 'EMP-501', name: 'Prof. Amit Sharma', subject: 'B.Tech' },
        { id: 502, empId: 'EMP-502', name: 'Dr. Sarah Khan', subject: 'BSc' }
    ];

    students.forEach((s) => {
        feeLedgers[s.roll] = { due: courses[s.course].fee, paid: 0 };
        marksRegistry[s.roll] = {
            'Subject-I': { mid: 22, final: 56 },
            'Subject-II': { mid: 24, final: 61 },
            'Practical-Lab': { mid: 27, final: 64 }
        };
    });

    notices = [
        { id: 1, author: 'Global Administration Hub', title: 'Integrated ERP Systems Operational', content: 'Autonomous multi-tenant engine running live layers with modular file structure.', date: '06/06/2026' }
    ];
    syncStorageArrays();
}

function syncStorageArrays() {
    localStorage.setItem('v2_studs', JSON.stringify(students));
    localStorage.setItem('v2_techs', JSON.stringify(teachers));
    localStorage.setItem('v2_courses', JSON.stringify(courses));
    localStorage.setItem('v2_notices', JSON.stringify(notices));
    localStorage.setItem('v2_marks', JSON.stringify(marksRegistry));
    localStorage.setItem('v2_fee_ledgers', JSON.stringify(feeLedgers));
    localStorage.setItem('v2_receipts', JSON.stringify(receiptsHistory));
    localStorage.setItem('v2_warnings', JSON.stringify(warningsRegistry));
    localStorage.setItem('v2_vault', JSON.stringify(messageVault));
}

function toggleDynamicFields() {
    const role = document.getElementById('role-select').value;
    const fUser = document.getElementById('field-username');
    const fCourse = document.getElementById('field-course');
    const fId = document.getElementById('field-id-number');
    const fPass = document.getElementById('field-password');
    const hints = document.getElementById('demo-hints');

    fUser.style.display = 'block'; fCourse.style.display = 'none'; fId.style.display = 'none'; fPass.style.display = 'none';

    // Dynamic Course Populator for Login Portal
    const loginCourseSelect = document.getElementById('login-course');
    if (loginCourseSelect) {
        loginCourseSelect.innerHTML = Object.keys(courses).map(c => `<option value="${c}">${c}</option>`).join('');
    }

    if (role === 'admin') {
        fPass.style.display = 'block'; document.getElementById('login-username').placeholder = "Enter Admin Username";
        hints.innerHTML = "Admin Gateway: Username: <b>admin</b> | Password: <b>1234</b>";
    } else if (role === 'accounts') {
        document.getElementById('login-username').placeholder = "Enter Accounts Executive Name";
        hints.innerHTML = "Accounts Log: Type: <b>finance</b> (No Password Required)";
    } else if (role === 'teacher') {
        fId.style.display = 'block'; document.getElementById('login-username').placeholder = "Faculty Member Name";
        document.getElementById('login-id-number').placeholder = "Employee ID (e.g., EMP-501)";
        hints.innerHTML = "Faculty Map: Name: <b>Prof. Amit Sharma</b> | ID: <b>EMP-501</b>";
    } else if (role === 'student' || role === 'parent') {
        fCourse.style.display = 'block'; fId.style.display = 'block';
        document.getElementById('login-username').placeholder = "Student Name Candidate";
        document.getElementById('login-id-number').placeholder = "Roll Number (e.g., ROLL-101)";
        hints.innerHTML = `Access Protocol: Name: <b>Rajesh Kumar</b> | Roll: <b>ROLL-101</b>`;
    }
}
window.addEventListener('DOMContentLoaded', toggleDynamicFields);

function executeAuthenticationRequest() {
    const role = document.getElementById('role-select').value;
    const userVal = document.getElementById('login-username').value.trim();
    const courseVal = document.getElementById('login-course').value;
    const idVal = document.getElementById('login-id-number').value.trim();
    const passVal = document.getElementById('login-password').value;

    let passed = false; let contextLabel = userVal; let boundUID = idVal;

    if (role === 'admin') {
        if (userVal === 'admin' && passVal === '1234') { passed = true; contextLabel = "System Head Administrator"; }
    } else if (role === 'accounts') {
        if (userVal.length > 0) { passed = true; contextLabel = `Accountant Office (${userVal})`; }
    } else if (role === 'teacher') {
        const match = teachers.find(t => t.name.toLowerCase() === userVal.toLowerCase() && t.empId === idVal);
        if (match) { passed = true; contextLabel = match.name; }
    } else if (role === 'student' || role === 'parent') {
        const match = students.find(s => s.name.toLowerCase() === userVal.toLowerCase() && s.course === courseVal && s.roll === idVal);
        if (match) { passed = true; contextLabel = `${match.name} (${role.toUpperCase()})`; boundUID = match.roll; }
    }

    if (!passed) return alert('Credentials lookup mismatch inside database arrays.');

    currentUser = { role, name: contextLabel, trackingUID: boundUID };
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    document.getElementById('user-display').innerHTML = `Session Token: <b>${contextLabel}</b>`;

    generateDynamicNavigationMenus(role);
    refreshAppInterfaceViewports();
}

function logout() {
    currentUser = null; document.getElementById('login-screen').style.display = 'flex'; document.getElementById('app').style.display = 'none';
    document.getElementById('login-username').value = ''; toggleDynamicFields();
}

function generateDynamicNavigationMenus(role) {
    const menu = document.getElementById('sidebar-menu');
    const navigationMaps = {
        admin: [
            { id: 'admin-dashboard', label: 'Dashboard Control' },
            { id: 'admin-admission', label: 'Admission Operations' },
            { id: 'admin-teachers', label: 'Manage Professors' },
            { id: 'shared-notice-panel', label: 'Publish Notices Circular' }
        ],
        accounts: [
            { id: 'accounts-ledger-view', label: 'Financial Management' },
            { id: 'shared-notice-panel', label: 'Publish Finance Circular' }
        ],
        teacher: [
            { id: 'teacher-marks-entry', label: 'Academic Grades Matrix' },
            { id: 'shared-communication-desk', label: 'Parent Counseling Bridge' },
            { id: 'shared-notice-panel', label: 'Broadcast Study Circular' }
        ],
        student: [
            { id: 'student-marksheet-view', label: 'My Terminal Marksheet' },
            { id: 'student-fee', label: 'Fee Payments Terminal' }
        ],
        parent: [
            { id: 'student-marksheet-view', label: 'Academic Progress Sheet' },
            { id: 'student-fee', label: 'Settlement History Sheets' },
            { id: 'shared-communication-desk', label: 'Contact Department Faculty' }
        ]
    };

    menu.innerHTML = navigationMaps[role].map(m => `<li onclick="switchModuleView('${m.id}')">${m.label}</li>`).join('');
    switchModuleView(navigationMaps[role][0].id);
}

function switchModuleView(targetModId) {
    document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
    const el = document.getElementById(targetModId); if (el) el.classList.add('active');
    refreshAppInterfaceViewports(targetModId);
}

function refreshAppInterfaceViewports(currentModActive) {
    renderGlobalNoticesTimeline();

    // Notification Strip Handler
    const warningStrip = document.getElementById('accounts-warning-strip');
    if (currentUser && (currentUser.role === 'student' || currentUser.role === 'parent')) {
        const targetRoll = currentUser.trackingUID;
        if (warningsRegistry[targetRoll]) {
            warningStrip.style.display = 'block';
            warningStrip.innerHTML = `⚠️ <b>ACCOUNTS AUDIT WARNING NOTICE:</b> ${warningsRegistry[targetRoll]}`;
        } else { warningStrip.style.display = 'none'; }
    } else { warningStrip.style.display = 'none'; }

    if (currentModActive === 'admin-dashboard') {
        document.getElementById('total-students').textContent = students.length;
        document.getElementById('total-teachers').textContent = teachers.length;
        renderAdminCourseConfigurationMatrix();
    }
    if (currentModActive === 'admin-admission') { populateAdminStreamDropdowns(); renderStudentsCoreRegistry(); }
    if (currentModActive === 'admin-teachers') { populateAdminStreamDropdowns(); renderTeachersCoreRegistry(); }
    if (currentModActive === 'accounts-ledger-view') renderAccountsLedgersMatrix();
    if (currentModActive === 'teacher-marks-entry') renderFacultyMarksMappingSheets();
    if (currentModActive === 'shared-communication-desk') setupBiDirectionalCommunicationDesk();
    if (currentModActive === 'student-marksheet-view') generateStudentMarksheetStatement();
    if (currentModActive === 'student-fee') renderStudentFeesPaymentPanel();
}

function renderGlobalNoticesTimeline() {
    const container = document.querySelector('.global-notices-list');
    container.innerHTML = notices.map(n => `
        <div class="notice-item">
            <strong>Header: ${n.title}</strong> <small style="color:#64748b; margin-left:10px;">Publisher Node: ${n.author} | Timestamp: ${n.date}</small>
            <p style="margin-top:6px; color:#334155; font-size:13.5px;">${n.content}</p>
        </div>
    `).join('') || '<p style="color:#64748b; font-size:12px;">Timeline empty.</p>';
}

function publishNotice() {
    const title = document.getElementById('notice-title').value.trim();
    const content = document.getElementById('notice-content').value.trim();
    if (!title || !content) return alert('Parameters missing.');
    notices.unshift({ id: Date.now(), author: currentUser.name, title, content, date: new Date().toLocaleDateString('en-IN') });
    syncStorageArrays(); renderGlobalNoticesTimeline();
    document.getElementById('notice-title').value = ''; document.getElementById('notice-content').value = '';
    alert('Notice synchronized.');
}

// NEW FUNCTION: ADD COURSE STREAM
function addNewCourseStructure() {
    const code = document.getElementById('new-course-code').value.trim();
    const fee = parseInt(document.getElementById('new-course-fee').value) || 0;
    const salary = parseInt(document.getElementById('new-course-salary').value) || 0;

    if (!code || fee <= 0 || salary <= 0) return alert('Please input valid structural course properties.');
    if (courses[code]) return alert('Course Stream definition already locked in system.');

    courses[code] = { fee, salary };
    syncStorageArrays();
    alert(`Success: Course Matrix [${code}] added globally.`);

    document.getElementById('new-course-code').value = '';
    document.getElementById('new-course-fee').value = '';
    document.getElementById('new-course-salary').value = '';

    renderAdminCourseConfigurationMatrix();
}

function renderAdminCourseConfigurationMatrix() {
    const tbody = document.querySelector('#admin-course-config-table tbody');
    tbody.innerHTML = Object.keys(courses).map(cKey => `
        <tr>
            <td><b style="color:#1e3a8a;">${cKey} Stream Line</b></td>
            <td><input type="number" id="fee-cfg-${cKey}" class="form-control" style="width:130px; padding:6px; border:1px solid #cbd5e1; border-radius:4px; font-weight:bold;" value="${courses[cKey].fee}" /></td>
            <td><input type="number" id="sal-cfg-${cKey}" class="form-control" style="width:130px; padding:6px; border:1px solid #cbd5e1; border-radius:4px; font-weight:bold;" value="${courses[cKey].salary}" /></td>
            <td>
                <button class="btn btn-success" style="padding:4px 10px; font-size:12px;" onclick="saveCourseParameters('${cKey}')">Update</button>
                <button class="btn-danger" style="padding:4px 10px; font-size:12px;" onclick="deleteCourseStructure('${cKey}')">Delete Course</button>
            </td>
        </tr>
    `).join('');
}

function saveCourseParameters(courseCode) {
    courses[courseCode].fee = parseInt(document.getElementById(`fee-cfg-${courseCode}`).value) || 0;
    courses[courseCode].salary = parseInt(document.getElementById(`sal-cfg-${courseCode}`).value) || 0;
    syncStorageArrays(); alert(`Parameters for ${courseCode} synchronized.`);
    renderAdminCourseConfigurationMatrix();
}

function deleteCourseStructure(courseCode) {
    if (confirm(`Purge course stream ${courseCode}? Warning: This can orphan mapped records.`)) {
        delete courses[courseCode];
        syncStorageArrays();
        renderAdminCourseConfigurationMatrix();
        alert('Course wiped from system ledger matrices.');
    }
}

function populateAdminStreamDropdowns() {
    const studentDropdown = document.getElementById('student-course');
    if (studentDropdown) { studentDropdown.innerHTML = Object.keys(courses).map(c => `<option value="${c}">${c}</option>`).join(''); }
    const teacherDropdown = document.getElementById('teacher-subject');
    if (teacherDropdown) { teacherDropdown.innerHTML = Object.keys(courses).map(c => `<option value="${c}">${c} Department</option>`).join(''); }
}

function renderStudentsCoreRegistry() {
    const tbody = document.querySelector('#students-table tbody');
    tbody.innerHTML = students.map(s => `
        <tr>
            <td>
                <div style="width:40px; height:45px; border:1px dashed #cbd5e1; background:#f8fafc; border-radius:4px; overflow:hidden; display:flex; align-items:center; justify-content:center;">
                    ${s.photo ? `<img src="${s.photo}" style="width:100%; height:100%; object-fit:cover;" />` : `<span style="font-size:7px; color:#94a3b8;">No Avatar</span>`}
                </div>
                <label style="display:inline-block; margin-top:2px; font-size:10px; color:#2563eb; cursor:pointer; font-weight:bold;">
                    Upload <input type="file" accept="image/*" style="display:none;" onchange="executeAdminPhotoSync(event, '${s.roll}')">
                </label>
            </td>
            <td><code>${s.roll}</code></td><td><b>${s.name}</b></td>
            <td><span class="badge badge-pending" style="color:#1e3a8a;">${s.course}</span></td><td>${s.parent}</td>
            <td><button class="btn-danger" style="padding:4px 8px; font-size:11px;" onclick="purgeStudent('${s.roll}')">Expel</button></td>
        </tr>
    `).join('');
}

function renderTeachersCoreRegistry() {
    const tbody = document.querySelector('#teachers-table tbody');
    tbody.innerHTML = teachers.map(t => `
        <tr>
            <td><code>${t.empId}</code></td><td><b>${t.name}</b></td>
            <td><span class="badge badge-pending" style="background:#e0f2fe; color:#0369a1;">${t.subject} Division</span></td>
            <td><button class="btn-danger" style="padding:4px 8px; font-size:11px;" onclick="purgeTeacher('${t.empId}')">Remove</button></td>
        </tr>
    `).join('');
}

function executeAdminPhotoSync(event, targetRollNo) {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        const targetIndex = students.findIndex(s => s.roll === targetRollNo);
        if (targetIndex !== -1) {
            students[targetIndex].photo = e.target.result; syncStorageArrays();
            alert('Avatar Uploaded.'); renderStudentsCoreRegistry();
        }
    };
    reader.readAsDataURL(file);
}

function registerStudent() {
    const name = document.getElementById('student-name').value.trim();
    const roll = document.getElementById('student-roll').value.trim();
    const course = document.getElementById('student-course').value;
    const parent = document.getElementById('student-parent').value.trim();

    if (!name || !roll || !parent) return alert('Constraint breach.');
    if (students.some(s => s.roll === roll)) return alert('Collision detected.');

    students.push({ id: Date.now(), roll, name, course, parent, photo: '' });
    feeLedgers[roll] = { due: courses[course]?.fee || 30000, paid: 0 };
    marksRegistry[roll] = { 'Subject-I': { mid: 0, final: 0 }, 'Subject-II': { mid: 0, final: 0 }, 'Practical-Lab': { mid: 0, final: 0 } };

    syncStorageArrays(); renderStudentsCoreRegistry(); alert('Candidate Matrix Saved.');
    document.getElementById('student-name').value = ''; document.getElementById('student-roll').value = ''; document.getElementById('student-parent').value = '';
}

function purgeStudent(roll) {
    if (confirm('Purge structural student block?')) {
        students = students.filter(s => s.roll !== roll); delete feeLedgers[roll]; delete marksRegistry[roll];
        syncStorageArrays(); renderStudentsCoreRegistry();
    }
}

function registerTeacher() {
    const name = document.getElementById('teacher-name').value.trim();
    const empId = document.getElementById('teacher-emp-id').value.trim();
    const subject = document.getElementById('teacher-subject').value;

    if (!name || !empId) return alert('Parameters missing.');
    if (teachers.some(t => t.empId === empId)) return alert('ID already configured.');

    teachers.push({ id: Date.now(), empId, name, subject });
    syncStorageArrays(); alert('Faculty Profile Registered.');
    document.getElementById('teacher-name').value = ''; document.getElementById('teacher-emp-id').value = '';
    renderTeachersCoreRegistry();
}

function purgeTeacher(empId) {
    if (confirm('Remove professor?')) {
        teachers = teachers.filter(t => t.empId !== empId);
        syncStorageArrays(); renderTeachersCoreRegistry();
    }
}

function renderAccountsLedgersMatrix() {
    const feeTbody = document.querySelector('#acc-fee-management-table tbody');
    feeTbody.innerHTML = students.map(s => {
        const ledger = feeLedgers[s.roll] || { due: 35000, paid: 0 };
        const netBalance = ledger.due - ledger.paid;
        return `
            <tr>
                <td><code>${s.roll}</code></td><td><b>${s.name}</b></td><td>${s.course}</td>
                <td>Cost: ₹${ledger.due}</td><td>${netBalance <= 0 ? 'Settled' : 'Pending: ₹' + netBalance}</td>
                <td>${netBalance > 0 ? `<button class="btn-danger" style="padding:4px 8px; font-size:11px;" onclick="dispatchAccountsWarningNotice('${s.roll}', ${netBalance})">Warning Notice</button>` : 'Audited Verified'}</td>
            </tr>
        `;
    }).join('');

    const salTbody = document.querySelector('#acc-salary-management-table tbody');
    salTbody.innerHTML = teachers.map(t => {
        const expectedSal = courses[t.subject]?.salary || 40000;
        return `
            <tr>
                <td><code>${t.empId}</code></td><td><b>${t.name}</b></td><td>${t.subject}</td>
                <td><b style="color:#10b981;">₹${expectedSal}</b></td>
                <td><button class="btn btn-success" style="padding:4px 8px; font-size:11px;" onclick="alert('Payroll processed.')">Disburse</button></td>
            </tr>
        `;
    }).join('');
}

function dispatchAccountsWarningNotice(studentRollNo, overdueSum) {
    warningsRegistry[studentRollNo] = `Overdue account metrics reveal outstanding balance of ₹${overdueSum}. Please clear it soon.`;
    syncStorageArrays(); alert('Warning cached.');
}

function renderFacultyMarksMappingSheets() {
    const tbody = document.querySelector('#faculty-marks-table tbody');
    const targetSubjectKey = document.getElementById('marks-subject-select').value;
    const assocStream = teachers.find(t => t.name === currentUser.name)?.subject || "";
    const targets = students.filter(s => s.course === assocStream);

    if (targets.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No students mapped to your department stream (${assocStream})</td></tr>`; return;
    }

    tbody.innerHTML = targets.map(s => {
        const gradesObj = marksRegistry[s.roll]?.[targetSubjectKey] || { mid: 0, final: 0 };
        return `
            <tr>
                <td><code>${s.roll}</code></td><td><b>${s.name}</b></td>
                <td><input type="number" style="width:75px;" id="mid-${s.roll}" min="0" max="30" value="${gradesObj.mid}"></td>
                <td><input type="number" style="width:75px;" id="fin-${s.roll}" min="0" max="70" value="${gradesObj.final}"></td>
            </tr>
        `;
    }).join('');
}
document.getElementById('marks-subject-select')?.addEventListener('change', renderFacultyMarksMappingSheets);

function saveStudentsMarksMatrix() {
    const targetSubjectKey = document.getElementById('marks-subject-select').value;
    const assocStream = teachers.find(t => t.name === currentUser.name)?.subject || "";
    const targets = students.filter(s => s.course === assocStream);

    let constraintBroke = false;
    targets.forEach(s => {
        const mVal = parseInt(document.getElementById(`mid-${s.roll}`).value) || 0;
        const fVal = parseInt(document.getElementById(`fin-${s.roll}`).value) || 0;
        if (mVal > 30 || fVal > 70 || mVal < 0 || fVal < 0) { constraintBroke = true; return; }
        if (!marksRegistry[s.roll]) marksRegistry[s.roll] = {};
        marksRegistry[s.roll][targetSubjectKey] = { mid: mVal, final: fVal };
    });

    if (constraintBroke) return alert('Validation failed. Midterm max: 30, Final max: 70.');
    syncStorageArrays(); alert('Grades Matrix Saved.'); renderFacultyMarksMappingSheets();
}

function setupBiDirectionalCommunicationDesk() {
    const wrapper = document.getElementById('chat-target-selector-wrapper');
    if (currentUser.role === 'teacher') {
        const assocStream = teachers.find(t => t.name === currentUser.name)?.subject || "";
        const matches = students.filter(s => s.course === assocStream);
        wrapper.innerHTML = `
            <label>Select Target Parent Account Connection Loop</label>
            <select id="chat-routing-target-node" onchange="renderChatLogsTimelineStream()">
                ${matches.map(s => `<option value="${s.name} (PARENT)">Parent of ${s.name} [${s.roll}]</option>`).join('')}
            </select>
        `;
    } else if (currentUser.role === 'parent') {
        const coreCandidateName = currentUser.name.replace(' (PARENT)', '');
        const courseMatch = students.find(s => s.name === coreCandidateName)?.course || "";
        const assocFaculty = teachers.filter(t => t.subject === courseMatch);
        wrapper.innerHTML = `
            <label>Select Department Division Professor</label>
            <select id="chat-routing-target-node" onchange="renderChatLogsTimelineStream()">
                ${assocFaculty.map(t => `<option value="${t.name}">Prof. ${t.name}</option>`).join('')}
            </select>
        `;
    }
    renderChatLogsTimelineStream();
}

function renderChatLogsTimelineStream() {
    const selectionNode = document.getElementById('chat-routing-target-node'); if (!selectionNode) return;
    const targetActor = selectionNode.value;
    const chatPanel = document.getElementById('chat-stream-render-panel');
    const streamSegments = messageVault.filter(m =>
        (m.sender === currentUser.name && m.receiver === targetActor) ||
        (m.sender === targetActor && m.receiver === currentUser.name)
    );

    chatPanel.innerHTML = streamSegments.map(m => `
        <div class="chat-bubble ${m.sender === currentUser.name ? 'chat-sent' : 'chat-received'}">
            <strong>${m.sender}:</strong> <p>${m.message}</p>
        </div>
    `).join('') || '<div style="text-align:center; padding-top:40px; color:#64748b; font-size:12px;">No active conversations logs.</div>';
    chatPanel.scrollTop = chatPanel.scrollHeight;
}

function transmitChatMessage() {
    const inputNode = document.getElementById('chat-message-input-node');
    const textContentStr = inputNode.value.trim(); if (!textContentStr) return;
    const targetActor = document.getElementById('chat-routing-target-node').value;

    messageVault.push({ sender: currentUser.name, receiver: targetActor, message: textContentStr, timestamp: Date.now() });
    syncStorageArrays(); inputNode.value = ''; renderChatLogsTimelineStream();
}

function generateStudentMarksheetStatement() {
    let activeRollNo = currentUser.trackingUID || students[0]?.roll;
    const contextProfile = students.find(s => s.roll === activeRollNo); if (!contextProfile) return;

    document.getElementById('marksheet-header-meta').innerHTML = `
        <strong>Candidate Name:</strong> ${contextProfile.name} &nbsp;&nbsp;|&nbsp;&nbsp; 
        <strong>Enrollment ID:</strong> <code>${contextProfile.roll}</code> &nbsp;&nbsp;|&nbsp;&nbsp; 
        <strong>Course Stream:</strong> ${contextProfile.course}
    `;

    const tbody = document.querySelector('#student-marksheet-table tbody');
    const lineItems = ['Subject-I', 'Subject-II', 'Practical-Lab'];
    let aggregateObtainedSum = 0;

    tbody.innerHTML = lineItems.map(itemKey => {
        const logs = marksRegistry[activeRollNo]?.[itemKey] || { mid: 0, final: 0 };
        const netScore = logs.mid + logs.final; aggregateObtainedSum += netScore;
        return `
            <tr>
                <td><b>${itemKey.replace('-', ' ')}</b></td>
                <td>${logs.mid} / 30</td><td>${logs.final} / 70</td>
                <td><b>${netScore} / 100</b></td>
                <td>${netScore >= 40 ? 'PASSED' : 'RE-APPEAR'}</td>
            </tr>
        `;
    }).join('');

    const ratioPct = ((aggregateObtainedSum / 300) * 100).toFixed(2);
    document.getElementById('marksheet-summary-footer').innerHTML = `Aggregate Score: ${aggregateObtainedSum}/300 (${ratioPct}%)`;
}

function renderStudentFeesPaymentPanel() {
    let activeRollNo = currentUser.trackingUID || students[0]?.roll;
    const profile = students.find(s => s.roll === activeRollNo); if (!profile) return;
    const ledger = feeLedgers[activeRollNo] || { due: 30000, paid: 0 };
    const outstandingSum = ledger.due - ledger.paid;

    document.getElementById('fee-status-narrative-frame').innerHTML = `
        <p><strong>Configured Base Structural Course Cost:</strong> ₹${ledger.due}</p>
        <p><strong>Total Realized Quantum Paid:</strong> ₹${ledger.paid}</p>
        <p><strong>Net Account Settlement Obligation Balance:</strong> ₹${outstandingSum}</p>
    `;

    const interactionZone = document.getElementById('active-payment-interactive-zone');
    if (outstandingSum <= 0) {
        interactionZone.style.display = 'none';
        if (warningsRegistry[activeRollNo]) { delete warningsRegistry[activeRollNo]; syncStorageArrays(); }
    } else {
        interactionZone.style.display = 'block';
        document.getElementById('payment-quantum-input').value = outstandingSum;
        regenerateUPIPaymentQR();
    }
    renderInvoicedTransactionsReceiptsHistory(activeRollNo);
}

function regenerateUPIPaymentQR() {
    const quantumVal = parseInt(document.getElementById('payment-quantum-input').value) || 0;
    const box = document.getElementById('dynamic-qr-box');
    if (quantumVal <= 0) { box.innerHTML = 'Invalid Amount'; return; }

    box.innerHTML = `
        <div style="background:#000; width:110px; height:110px; padding:6px; display:grid; grid-template-columns:repeat(4,1fr); gap:4px; margin-bottom:5px;">
            <div style="background:#fff;"></div><div style="background:#fff;"></div><div style="background:#000;"></div><div style="background:#fff;"></div>
            <div style="background:#000;"></div><div style="background:#fff;"></div><div style="background:#fff;"></div><div style="background:#000;"></div>
            <div style="background:#fff;"></div><div style="background:#000;"></div><div style="background:#fff;"></div><div style="background:#fff;"></div>
            <div style="background:#fff;"></div><div style="background:#fff;"></div><div style="background:#000;"></div><div style="background:#000;"></div>
        </div>
        <strong>₹${quantumVal} UPI Dynamic QR</strong>
    `;
}

function simulateTransactionConfirmation() {
    let activeRollNo = currentUser.trackingUID || students[0]?.roll;
    const quantumVal = parseInt(document.getElementById('payment-quantum-input').value) || 0;
    const ledger = feeLedgers[activeRollNo];

    if (quantumVal <= 0 || quantumVal > (ledger.due - ledger.paid)) return alert('Invalid transaction quantity bounded values.');

    ledger.paid += quantumVal;
    const receiptId = 'REC-UPI-' + Math.floor(100000 + Math.random() * 900000);

    if (!receiptsHistory[activeRollNo]) receiptsHistory[activeRollNo] = [];
    receiptsHistory[activeRollNo].push({ receiptId, date: new Date().toLocaleString('en-IN'), amount: quantumVal });
    if ((ledger.due - ledger.paid) <= 0) { delete warningsRegistry[activeRollNo]; }

    syncStorageArrays(); alert('Payment Succeeded.'); renderStudentFeesPaymentPanel();
}

function renderInvoicedTransactionsReceiptsHistory(activeRollNo) {
    const tbody = document.querySelector('#receipts-registry-table tbody');
    const dataSegments = receiptsHistory[activeRollNo] || [];

    if (dataSegments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="color:#64748b; font-size:12px;">No historical payment segments found.</td></tr>`; return;
    }

    tbody.innerHTML = dataSegments.map(r => `
        <tr>
            <td><code>${r.receiptId}</code></td><td>${r.date}</td>
            <td><b>₹${r.amount}</b></td><td>Settle Success</td>
            <td><button class="btn btn-warning" style="padding:4px 8px; font-size:11px;" onclick="triggerLocalPrintReceiptWorkflow('${activeRollNo}', '${r.receiptId}')">Print Receipt Document</button></td>
        </tr>
    `).join('');
}

function triggerLocalPrintReceiptWorkflow(targetRoll, invoiceIdCode) {
    const studentMatch = students.find(s => s.roll === targetRoll);
    const receiptMatch = receiptsHistory[targetRoll]?.find(r => r.receiptId === invoiceIdCode);
    if (!studentMatch || !receiptMatch) return;

    const printCanvas = document.getElementById('printable-invoice-canvas');
    printCanvas.innerHTML = `
        <div style="text-align:center; border-bottom:2px solid #000; padding-bottom:15px; margin-bottom:20px;">
            <h2>DAYAWANTI PUNJ TRAINING INSTITUTE</h2>
            <h4>OFFICIAL FEES RECEIPT</h4>
        </div>
        <p><strong>Receipt Token ID:</strong> ${receiptMatch.receiptId}</p>
        <p><strong>Student Name Candidate:</strong> ${studentMatch.name}</p>
        <p><strong>Enrollment Roll No Mapping:</strong> ${studentMatch.roll}</p>
        <p><strong>Academic Branch Stream:</strong> ${studentMatch.course}</p>
        <p>Total Realized Net Quantum Deposited: <strong>₹${receiptMatch.amount}/-</strong></p>
    `;
    window.print();
}