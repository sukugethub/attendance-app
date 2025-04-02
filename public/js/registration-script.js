




document.getElementById('registration-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const statusMessage = document.getElementById('status-message');

    try {
        const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });

        const result = await response.json();

        if (response.ok) {
            statusMessage.style.color = 'green';
            statusMessage.textContent = 'Registration successful!';
            // Optionally redirect to login or dashboard page
            setTimeout(() => {
                window.location.href = '../pages/student-login.html'; // Replace with your login page URL
            }, 2000);
        } else {
            statusMessage.style.color = 'red';
            statusMessage.textContent = result.error || 'Registration failed';
        }
    } catch (error) {
        statusMessage.style.color = 'red';
        statusMessage.textContent = 'Error: Unable to register';
        console.error('Error:', error);
    }
});

