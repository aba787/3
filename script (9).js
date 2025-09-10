
// Application State
const state = {
    courses: [],
    requirement: 120,
    costPerCredit: 200,
    currentLanguage: 'ar'
};

// Language data
const languages = {
    ar: {
        dir: 'rtl',
        lang: 'ar'
    },
    en: {
        dir: 'ltr',
        lang: 'en'
    }
};

// DOM Elements
const elements = {
    langToggle: document.getElementById('langToggle'),
    navToggle: document.getElementById('navToggle'),
    navMenu: document.getElementById('navMenu'),
    courseName: document.getElementById('courseName'),
    courseCredits: document.getElementById('courseCredits'),
    courseGrade: document.getElementById('courseGrade'),
    addCourse: document.getElementById('addCourse'),
    coursesList: document.getElementById('coursesList'),
    courseCount: document.getElementById('courseCount'),
    calculateBtn: document.getElementById('calculateBtn'),
    saveSession: document.getElementById('saveSession'),
    loadSession: document.getElementById('loadSession'),
    resetAll: document.getElementById('resetAll'),
    totalPrevious: document.getElementById('totalPrevious'),
    acceptedHours: document.getElementById('acceptedHours'),
    remainingHours: document.getElementById('remainingHours'),
    estimatedCost: document.getElementById('estimatedCost'),
    studyPlan: document.getElementById('studyPlan'),
    exportReport: document.getElementById('exportReport'),
    copyReport: document.getElementById('copyReport')
};

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 0.75rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 1070;
        transform: translateY(-100px);
        opacity: 0;
        transition: all 0.3s ease-in-out;
        max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateY(0)';
        notification.style.opacity = '1';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateY(-100px)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR',
        minimumFractionDigits: 0
    }).format(amount);
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Language Switching
function switchLanguage() {
    state.currentLanguage = state.currentLanguage === 'ar' ? 'en' : 'ar';
    const newLang = languages[state.currentLanguage];
    
    // Update document attributes
    document.documentElement.setAttribute('dir', newLang.dir);
    document.documentElement.setAttribute('lang', newLang.lang);
    
    // Update toggle button text
    elements.langToggle.querySelector('.lang-text').textContent = 
        state.currentLanguage === 'ar' ? 'EN' : 'العربية';
    
    // Update all translatable elements
    const translatableElements = document.querySelectorAll('[data-ar][data-en]');
    translatableElements.forEach(element => {
        const key = state.currentLanguage === 'ar' ? 'data-ar' : 'data-en';
        element.textContent = element.getAttribute(key);
    });
    
    // Update placeholders
    const placeholderElements = document.querySelectorAll('[data-placeholder-ar][data-placeholder-en]');
    placeholderElements.forEach(element => {
        const key = state.currentLanguage === 'ar' ? 'data-placeholder-ar' : 'data-placeholder-en';
        element.placeholder = element.getAttribute(key);
    });
    
    // Update results if calculated
    updateResultsDisplay();
    
    // Save language preference
    localStorage.setItem('bridging_language', state.currentLanguage);
    
    showNotification(
        state.currentLanguage === 'ar' ? 'تم تغيير اللغة إلى العربية' : 'Language changed to English'
    );
}

// Course Management
function addCourse() {
    const name = elements.courseName.value.trim();
    const credits = parseInt(elements.courseCredits.value) || 0;
    const gradeInput = elements.courseGrade.value.trim();
    
    if (!name || !credits || !gradeInput) {
        showNotification(
            state.currentLanguage === 'ar' 
                ? 'يرجى ملء جميع الحقول المطلوبة' 
                : 'Please fill all required fields',
            'error'
        );
        return;
    }
    
    if (credits < 1 || credits > 6) {
        showNotification(
            state.currentLanguage === 'ar' 
                ? 'عدد الساعات يجب أن يكون بين 1 و 6' 
                : 'Credit hours must be between 1 and 6',
            'error'
        );
        return;
    }
    
    // Grade validation and acceptance logic
    const { accepted, displayGrade } = validateGrade(gradeInput);
    
    const course = {
        id: Date.now(),
        name,
        credits,
        gradeInput,
        displayGrade,
        accepted
    };
    
    state.courses.push(course);
    
    // Clear form
    elements.courseName.value = '';
    elements.courseCredits.value = '';
    elements.courseGrade.value = '';
    
    renderCourses();
    updateCourseCount();
    
    showNotification(
        state.currentLanguage === 'ar' 
            ? 'تمت إضافة المادة بنجاح' 
            : 'Course added successfully'
    );
}

function validateGrade(gradeInput) {
    const numericGrade = parseFloat(gradeInput);
    let accepted = false;
    let displayGrade = gradeInput;
    
    if (!isNaN(numericGrade)) {
        // Numeric grade
        accepted = numericGrade >= 60;
        displayGrade = `${numericGrade}%`;
    } else {
        // Letter grade
        const letterGrade = gradeInput.toUpperCase();
        const acceptedGrades = ['A+', 'A', 'B+', 'B', 'C+', 'C'];
        accepted = acceptedGrades.includes(letterGrade);
        displayGrade = letterGrade;
    }
    
    return { accepted, displayGrade };
}

function removeCourse(courseId) {
    const courseIndex = state.courses.findIndex(course => course.id === courseId);
    if (courseIndex !== -1) {
        state.courses.splice(courseIndex, 1);
        renderCourses();
        updateCourseCount();
        
        showNotification(
            state.currentLanguage === 'ar' 
                ? 'تم حذف المادة' 
                : 'Course removed'
        );
    }
}

function renderCourses() {
    if (state.courses.length === 0) {
        elements.coursesList.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                </svg>
                <p ${state.currentLanguage === 'ar' ? 'data-ar' : 'data-en'}="${state.currentLanguage === 'ar' ? 'لم يتم إضافة أي مواد بعد' : 'No courses added yet'}">
                    ${state.currentLanguage === 'ar' ? 'لم يتم إضافة أي مواد بعد' : 'No courses added yet'}
                </p>
            </div>
        `;
        return;
    }
    
    elements.coursesList.innerHTML = state.courses.map(course => `
        <div class="course-item">
            <div class="course-info">
                <div class="course-name">${escapeHtml(course.name)}</div>
                <div class="course-details">
                    ${course.credits} ${state.currentLanguage === 'ar' ? 'ساعة' : 'credits'} • ${escapeHtml(course.displayGrade)}
                </div>
            </div>
            <div class="course-status ${course.accepted ? 'accepted' : 'rejected'}">
                ${course.accepted 
                    ? (state.currentLanguage === 'ar' ? 'مقبولة' : 'Accepted')
                    : (state.currentLanguage === 'ar' ? 'مرفوضة' : 'Rejected')
                }
            </div>
            <button class="delete-btn" onclick="removeCourse(${course.id})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
        </div>
    `).join('');
}

function updateCourseCount() {
    elements.courseCount.textContent = state.courses.length;
}

// Calculations
function calculateResults() {
    if (state.courses.length === 0) {
        showNotification(
            state.currentLanguage === 'ar' 
                ? 'يرجى إضافة مواد أولاً' 
                : 'Please add courses first',
            'error'
        );
        return;
    }
    
    const totalPrevious = state.courses.reduce((sum, course) => sum + course.credits, 0);
    const acceptedCredits = state.courses
        .filter(course => course.accepted)
        .reduce((sum, course) => sum + course.credits, 0);
    const remainingCredits = Math.max(0, state.requirement - acceptedCredits);
    const estimatedCost = remainingCredits * state.costPerCredit;
    
    // Update display
    elements.totalPrevious.textContent = totalPrevious;
    elements.acceptedHours.textContent = acceptedCredits;
    elements.remainingHours.textContent = remainingCredits;
    elements.estimatedCost.textContent = formatCurrency(estimatedCost);
    
    generateStudyPlan(remainingCredits);
    
    showNotification(
        state.currentLanguage === 'ar' 
            ? 'تم حساب النتائج بنجاح' 
            : 'Results calculated successfully'
    );
}

function generateStudyPlan(remainingCredits) {
    if (remainingCredits <= 0) {
        elements.studyPlan.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #10b981;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 1rem;">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22,4 12,14.01 9,11.01"/>
                </svg>
                <h4>${state.currentLanguage === 'ar' ? 'تهانينا!' : 'Congratulations!'}</h4>
                <p>${state.currentLanguage === 'ar' ? 'لقد أكملت جميع المتطلبات الأكاديمية' : 'You have completed all academic requirements'}</p>
            </div>
        `;
        return;
    }
    
    const maxCreditsPerSemester = 15;
    const semesters = Math.ceil(remainingCredits / maxCreditsPerSemester);
    let planHtml = `
        <div class="plan-summary">
            <h4>${state.currentLanguage === 'ar' ? 'ملخص الخطة:' : 'Plan Summary:'}</h4>
            <p>${state.currentLanguage === 'ar' ? 'العدد المتوقع للفصول:' : 'Expected semesters:'} <strong>${semesters}</strong></p>
            <p>${state.currentLanguage === 'ar' ? 'إجمالي الساعات المتبقية:' : 'Total remaining credits:'} <strong>${remainingCredits}</strong></p>
        </div>
        <div class="plan-details">
            <h4>${state.currentLanguage === 'ar' ? 'التفاصيل:' : 'Details:'}</h4>
    `;
    
    let remaining = remainingCredits;
    for (let i = 1; i <= semesters; i++) {
        const creditsThisSemester = Math.min(maxCreditsPerSemester, remaining);
        const semesterCost = creditsThisSemester * state.costPerCredit;
        
        planHtml += `
            <div class="semester-plan">
                <strong>${state.currentLanguage === 'ar' ? 'الفصل' : 'Semester'} ${i}:</strong>
                ${creditsThisSemester} ${state.currentLanguage === 'ar' ? 'ساعة' : 'credits'} 
                (${formatCurrency(semesterCost)})
            </div>
        `;
        
        remaining -= creditsThisSemester;
    }
    
    planHtml += '</div>';
    elements.studyPlan.innerHTML = planHtml;
}

function updateResultsDisplay() {
    // Re-render results with current language if already calculated
    if (elements.acceptedHours.textContent !== '0') {
        const remainingCredits = parseInt(elements.remainingHours.textContent);
        generateStudyPlan(remainingCredits);
    }
}

// Session Management
function saveSession() {
    const sessionData = {
        courses: state.courses,
        requirement: state.requirement,
        costPerCredit: state.costPerCredit,
        language: state.currentLanguage,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('bridging_session', JSON.stringify(sessionData));
    
    showNotification(
        state.currentLanguage === 'ar' 
            ? 'تم حفظ الجلسة بنجاح' 
            : 'Session saved successfully'
    );
}

function loadSession() {
    const sessionData = localStorage.getItem('bridging_session');
    
    if (!sessionData) {
        showNotification(
            state.currentLanguage === 'ar' 
                ? 'لا توجد جلسة محفوظة' 
                : 'No saved session found',
            'error'
        );
        return;
    }
    
    try {
        const data = JSON.parse(sessionData);
        state.courses = data.courses || [];
        state.requirement = data.requirement || 120;
        state.costPerCredit = data.costPerCredit || 200;
        
        renderCourses();
        updateCourseCount();
        
        showNotification(
            state.currentLanguage === 'ar' 
                ? 'تم تحميل الجلسة بنجاح' 
                : 'Session loaded successfully'
        );
    } catch (error) {
        showNotification(
            state.currentLanguage === 'ar' 
                ? 'خطأ في تحميل الجلسة' 
                : 'Error loading session',
            'error'
        );
    }
}

function resetAll() {
    const confirmMessage = state.currentLanguage === 'ar' 
        ? 'هل أنت متأكد من حذف جميع البيانات؟' 
        : 'Are you sure you want to delete all data?';
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    state.courses = [];
    renderCourses();
    updateCourseCount();
    
    // Reset results
    elements.totalPrevious.textContent = '0';
    elements.acceptedHours.textContent = '0';
    elements.remainingHours.textContent = state.requirement;
    elements.estimatedCost.textContent = formatCurrency(0);
    elements.studyPlan.innerHTML = `
        <p>${state.currentLanguage === 'ar' 
            ? 'قم بإضافة المواد أولاً ثم اضغط \'احسب النتائج\'' 
            : 'Add courses first then click \'Calculate Results\''}</p>
    `;
    
    showNotification(
        state.currentLanguage === 'ar' 
            ? 'تم حذف جميع البيانات' 
            : 'All data deleted'
    );
}

// Export Functions
function exportReport() {
    const reportData = {
        timestamp: new Date().toISOString(),
        language: state.currentLanguage,
        courses: state.courses,
        summary: {
            totalPrevious: parseInt(elements.totalPrevious.textContent),
            acceptedHours: parseInt(elements.acceptedHours.textContent),
            remainingHours: parseInt(elements.remainingHours.textContent),
            estimatedCost: elements.estimatedCost.textContent,
            requirement: state.requirement,
            costPerCredit: state.costPerCredit
        }
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academic-bridge-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification(
        state.currentLanguage === 'ar' 
            ? 'تم تصدير التقرير' 
            : 'Report exported'
    );
}

function copyReport() {
    const report = state.currentLanguage === 'ar' ? `
تقرير معادلة الساعات الأكاديمية
=====================================

📊 ملخص النتائج:
• إجمالي الساعات السابقة: ${elements.totalPrevious.textContent}
• الساعات المقبولة: ${elements.acceptedHours.textContent}
• الساعات المتبقية: ${elements.remainingHours.textContent}
• التكلفة المتوقعة: ${elements.estimatedCost.textContent}

📚 المواد المضافة:
${state.courses.map(course => 
    `• ${course.name} - ${course.credits} ساعة - ${course.displayGrade} - ${course.accepted ? 'مقبولة' : 'مرفوضة'}`
).join('\n')}

📋 الخطة الدراسية:
${elements.studyPlan.textContent}

تم إنشاء التقرير في: ${new Date().toLocaleString('ar-SA')}
    ` : `
Academic Credit Equivalency Report
=====================================

📊 Results Summary:
• Total Previous Hours: ${elements.totalPrevious.textContent}
• Accepted Hours: ${elements.acceptedHours.textContent}
• Remaining Hours: ${elements.remainingHours.textContent}
• Expected Cost: ${elements.estimatedCost.textContent}

📚 Added Courses:
${state.courses.map(course => 
    `• ${course.name} - ${course.credits} credits - ${course.displayGrade} - ${course.accepted ? 'Accepted' : 'Rejected'}`
).join('\n')}

📋 Study Plan:
${elements.studyPlan.textContent}

Report generated on: ${new Date().toLocaleString('en-US')}
    `;
    
    navigator.clipboard.writeText(report).then(() => {
        showNotification(
            state.currentLanguage === 'ar' 
                ? 'تم نسخ التقرير إلى الحافظة' 
                : 'Report copied to clipboard'
        );
    }).catch(() => {
        showNotification(
            state.currentLanguage === 'ar' 
                ? 'فشل في نسخ التقرير' 
                : 'Failed to copy report',
            'error'
        );
    });
}

// Navigation
function toggleMobileMenu() {
    elements.navMenu.classList.toggle('active');
}

// Event Listeners
function initializeEventListeners() {
    // Language toggle
    elements.langToggle?.addEventListener('click', switchLanguage);
    
    // Navigation
    elements.navToggle?.addEventListener('click', toggleMobileMenu);
    
    // Course management
    elements.addCourse?.addEventListener('click', addCourse);
    
    // Enter key support for form inputs
    [elements.courseName, elements.courseCredits, elements.courseGrade].forEach(element => {
        element?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addCourse();
            }
        });
    });
    
    // Calculator actions
    elements.calculateBtn?.addEventListener('click', calculateResults);
    elements.saveSession?.addEventListener('click', saveSession);
    elements.loadSession?.addEventListener('click', loadSession);
    elements.resetAll?.addEventListener('click', resetAll);
    
    // Export actions
    elements.exportReport?.addEventListener('click', exportReport);
    elements.copyReport?.addEventListener('click', copyReport);
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Close mobile menu when clicking on links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            elements.navMenu?.classList.remove('active');
        });
    });
}

// Initialization
function initializeApp() {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('bridging_language');
    if (savedLanguage && languages[savedLanguage]) {
        state.currentLanguage = savedLanguage;
        const newLang = languages[state.currentLanguage];
        document.documentElement.setAttribute('dir', newLang.dir);
        document.documentElement.setAttribute('lang', newLang.lang);
        
        // Update toggle button
        elements.langToggle.querySelector('.lang-text').textContent = 
            state.currentLanguage === 'ar' ? 'EN' : 'العربية';
        
        // Update translatable elements
        const translatableElements = document.querySelectorAll('[data-ar][data-en]');
        translatableElements.forEach(element => {
            const key = state.currentLanguage === 'ar' ? 'data-ar' : 'data-en';
            element.textContent = element.getAttribute(key);
        });
        
        // Update placeholders
        const placeholderElements = document.querySelectorAll('[data-placeholder-ar][data-placeholder-en]');
        placeholderElements.forEach(element => {
            const key = state.currentLanguage === 'ar' ? 'data-placeholder-ar' : 'data-placeholder-en';
            element.placeholder = element.getAttribute(key);
        });
    }
    
    // Initialize UI
    renderCourses();
    updateCourseCount();
    initializeEventListeners();
    
    // Load session if available
    const savedSession = localStorage.getItem('bridging_session');
    if (savedSession) {
        try {
            const data = JSON.parse(savedSession);
            if (data.courses && data.courses.length > 0) {
                // Auto-load session if it exists
                loadSession();
            }
        } catch (error) {
            console.log('Error auto-loading session:', error);
        }
    }
    
    console.log('Academic Bridge Platform initialized successfully');
}

// Global functions (for onclick handlers)
window.scrollToSection = scrollToSection;
window.removeCourse = removeCourse;

// Start the application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
