
const form = document.getElementById("register-form");
const errorMsg = document.getElementById("error-message");
const successMsg = document.getElementById("success-message");
const registerBtn = document.getElementById("register-btn");
const btnText = registerBtn.querySelector('.btn-text');
const passwordInput = document.getElementById("password");
const passwordStrength = document.getElementById("password-strength");

// Wait for Firebase to load
function waitForFirebase() {
    return new Promise((resolve) => {
        if (window.firebaseAuth && window.firebaseDb) {
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
    successMsg.style.display = 'none';
    setTimeout(() => {
        errorMsg.style.display = 'none';
    }, 5000);
}

// Show success message
function showSuccess(message) {
    successMsg.textContent = message;
    successMsg.style.display = 'block';
    errorMsg.style.display = 'none';
}

// Show loading state
function setLoading(loading) {
    if (loading) {
        registerBtn.disabled = true;
        btnText.innerHTML = '<span class="loading"></span> جاري إنشاء الحساب...';
    } else {
        registerBtn.disabled = false;
        btnText.textContent = 'إنشاء الحساب';
    }
}

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    let feedback = [];

    if (password.length >= 8) strength++;
    else feedback.push("8 أحرف على الأقل");

    if (/[a-z]/.test(password)) strength++;
    else feedback.push("حرف صغير");

    if (/[A-Z]/.test(password)) strength++;
    else feedback.push("حرف كبير");

    if (/[0-9]/.test(password)) strength++;
    else feedback.push("رقم");

    if (/[^A-Za-z0-9]/.test(password)) strength++;
    else feedback.push("رمز خاص");

    let strengthText = "";
    let className = "";

    if (strength < 2) {
        strengthText = "ضعيفة جداً - تحتاج: " + feedback.join(", ");
        className = "weak";
    } else if (strength < 4) {
        strengthText = "متوسطة - تحتاج: " + feedback.join(", ");
        className = "medium";
    } else {
        strengthText = "قوية ✓";
        className = "strong";
    }

    passwordStrength.textContent = strengthText;
    passwordStrength.className = `password-strength ${className}`;

    return strength >= 3;
}

// Real-time password validation
passwordInput.addEventListener('input', (e) => {
    const password = e.target.value;
    if (password.length > 0) {
        checkPasswordStrength(password);
    } else {
        passwordStrength.textContent = "";
        passwordStrength.className = "password-strength";
    }
});

// Form submission handler
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    await waitForFirebase();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();

    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showError("يرجى ملء جميع الحقول المطلوبة");
        return;
    }

    if (name.length < 2) {
        showError("يجب أن يكون الاسم أكثر من حرفين");
        return;
    }

    if (!email.includes('@') || !email.includes('.')) {
        showError("يرجى إدخال بريد إلكتروني صحيح");
        return;
    }

    if (password.length < 6) {
        showError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
        return;
    }

    if (password !== confirmPassword) {
        showError("كلمة المرور غير متطابقة!");
        return;
    }

    if (!checkPasswordStrength(password)) {
        showError("كلمة المرور ضعيفة جداً. يرجى استخدام كلمة مرور أقوى");
        return;
    }

    setLoading(true);

    try {
        // Create user account
        const userCredential = await window.firebaseAuth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Update user profile with name
        await user.updateProfile({ 
            displayName: name 
        });

        // Save user data to Firestore
        await window.firebaseDb.collection("users").doc(user.uid).set({
            name: name,
            email: email,
            createdAt: new Date(),
            lastLogin: new Date(),
            isActive: true
        });

        showSuccess("تم إنشاء الحساب بنجاح! ✅ سيتم توجيهك للصفحة الرئيسية...");
        
        // Clear form
        form.reset();
        passwordStrength.textContent = "";
        
        // Redirect after delay
        setTimeout(() => {
            window.location.href = "index.html";
        }, 2000);

    } catch (error) {
        setLoading(false);
        console.error("Registration error:", error);

        // Handle specific Firebase auth errors
        switch (error.code) {
            case "auth/email-already-in-use":
                showError("هذا البريد الإلكتروني مسجل بالفعل. يرجى استخدام بريد آخر أو تسجيل الدخول.");
                break;
            case "auth/weak-password":
                showError("كلمة المرور ضعيفة جداً. يجب أن تكون 6 أحرف على الأقل.");
                break;
            case "auth/invalid-email":
                showError("البريد الإلكتروني غير صحيح. يرجى التحقق من الصيغة.");
                break;
            case "auth/operation-not-allowed":
                showError("تسجيل الحسابات الجديدة غير مفعل حالياً. يرجى المحاولة لاحقاً.");
                break;
            case "auth/network-request-failed":
                showError("خطأ في الاتصال بالإنترنت. يرجى التحقق من الاتصال.");
                break;
            default:
                showError("حدث خطأ غير متوقع: " + (error.message || "يرجى المحاولة لاحقاً"));
        }
    }
});

// Auto-focus first input
document.getElementById("name").focus();

// Enter key navigation
document.getElementById("name").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        document.getElementById("email").focus();
    }
});

document.getElementById("email").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        document.getElementById("password").focus();
    }
});

document.getElementById("password").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        document.getElementById("confirm-password").focus();
    }
});

document.getElementById("confirm-password").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        form.dispatchEvent(new Event('submit'));
    }
});

// Clear error messages when user starts typing
['name', 'email', 'password', 'confirm-password'].forEach(id => {
    document.getElementById(id).addEventListener("input", () => {
        if (errorMsg.style.display === 'block') {
            errorMsg.style.display = 'none';
        }
    });
});
