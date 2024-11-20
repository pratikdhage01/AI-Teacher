// Basic authentication handling
document.addEventListener('DOMContentLoaded', () => {
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');

    // Simulated user database (in real app, this would be on server)
    const validUsers = [
        { email: 'test@example.com', password: 'password123' },
        { email: 'admin@example.com', password: 'admin123' }
    ];

    // Function to show error message
    function showError(formElement, message) {
        let errorDiv = formElement.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            formElement.insertBefore(errorDiv, formElement.firstChild);
        }
        errorDiv.textContent = message;
        errorDiv.style.color = 'red';
        errorDiv.style.marginBottom = '10px';
    }

    // Function to validate email format
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Check protected pages
    if (!signinForm && !signupForm) {
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        if (!isAuthenticated) {
            window.location.href = './signin.html';
        }
    }

    if (signinForm) {
        signinForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Validate email format
            if (!isValidEmail(email)) {
                showError(signinForm, 'Please enter a valid email address');
                return;
            }

            // Validate password length
            if (password.length < 6) {
                showError(signinForm, 'Password must be at least 6 characters long');
                return;
            }

            // Check if user exists and password matches
            const user = validUsers.find(u => u.email === email && u.password === password);
            
            if (user) {
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userEmail', email);
                window.location.href = './index.html';
            } else {
                showError(signinForm, 'Invalid email or password');
                // Clear password field
                document.getElementById('password').value = '';
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Validate name
            if (name.length < 2) {
                showError(signupForm, 'Name must be at least 2 characters long');
                return;
            }

            // Validate email format
            if (!isValidEmail(email)) {
                showError(signupForm, 'Please enter a valid email address');
                return;
            }

            // Validate password length and complexity
            if (password.length < 6) {
                showError(signupForm, 'Password must be at least 6 characters long');
                return;
            }

            // Check if email already exists
            if (validUsers.some(u => u.email === email)) {
                showError(signupForm, 'This email is already registered');
                return;
            }

            // If all validations pass, store user info
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userName', name);
            
            // Add to valid users (in real app, this would be server-side)
            validUsers.push({ email, password });
            
            window.location.href = './index.html';
        });
    }
}); 