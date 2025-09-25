
const form = document.getElementById("login-form");
const errorMsg = document.getElementById("error-message");
const loginBtn = document.getElementById("login-btn");
const btnText = loginBtn.querySelector('.btn-text');

// Wait for Firebase to load
function waitForFirebase() {
    return new Promise((resolve) => {
        if (window.firebaseAuth) {
            resolve();
        } else {
            setTimeout(() => waitForFirebase().then(resolve), 100);
        }
    });
}

// Show error message
function showError(message) {
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
    setTimeout(() => {
        errorMsg.style.display = 'none';
    }, 5000);
}

// Show loading state
function setLoading(loading) {
    if (loading) {
        loginBtn.disabled = true;
        btnText.innerHTML = '<span class="loading"></span> جاري تسجيل الدخول...';
    } else {
        loginBtn.disabled = false;
        btnText.textContent = 'تسجيل الدخول';
    }
}

// Show success notification
function showSuccess(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        font-weight: 500;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Form submission handler
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    await waitForFirebase();
    
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    
    // Validation
    if (!email || !password) {
        showError("يرجى ملء جميع الحقول");
        return;
    }
    
    if (!email.includes('@')) {
        showError("يرجى إدخال بريد إلكتروني صحيح");
        return;
    }
    
    setLoading(true);
    
    try {
        const userCredential = await window.firebaseAuth.signInWithEmailAndPassword(email, password);
        showSuccess("تم تسجيل الدخول بنجاح! ✅");
        
        // Update last login in Firestore
        if (window.firebaseDb && userCredential.user) {
            try {
                await window.firebaseDb.collection("users").doc(userCredential.user.uid).update({
                    lastLogin: new Date()
                });
            } catch (dbError) {
                console.log("Could not update last login:", dbError);
            }
        }
        
        // Redirect after short delay
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1500);
        
    } catch (error) {
        setLoading(false);
        console.error("Login error:", error);
        
        // Handle specific Firebase auth errors
        switch (error.code) {
            case "auth/user-not-found":
                showError("الحساب غير موجود. يرجى التحقق من البريد الإلكتروني.");
                break;
            case "auth/wrong-password":
                showError("كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.");
                break;
            case "auth/invalid-email":
                showError("البريد الإلكتروني غير صحيح.");
                break;
            case "auth/too-many-requests":
                showError("تم تجاوز عدد المحاولات المسموح. يرجى المحاولة لاحقاً.");
                break;
            case "auth/network-request-failed":
                showError("خطأ في الاتصال بالإنترنت. يرجى التحقق من الاتصال.");
                break;
            case "auth/invalid-credential":
                showError("بيانات الدخول غير صحيحة. يرجى التحقق من البريد وكلمة المرور.");
                break;
            default:
                showError("حدث خطأ غير متوقع: " + (error.message || "يرجى المحاولة لاحقاً"));
        }
    }
});

// Auto-focus first input
document.getElementById("email").focus();

// Enter key handling for form inputs
document.getElementById("email").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        document.getElementById("password").focus();
    }
});

document.getElementById("password").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        form.dispatchEvent(new Event('submit'));
    }
});

// Clear any previous error messages when user starts typing
document.getElementById("email").addEventListener("input", () => {
    if (errorMsg.style.display === 'block') {
        errorMsg.style.display = 'none';
    }
});

document.getElementById("password").addEventListener("input", () => {
    if (errorMsg.style.display === 'block') {
        errorMsg.style.display = 'none';
    }
});
