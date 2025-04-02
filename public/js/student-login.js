const form = document.getElementById('loginForm');

form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent page reload

    const username = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value;
  

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            alert('Login successful');
            window.location.href = '../pages/student-dashboard.html';
            // Redirect to a new page or take further actions
        } else if (response.status === 404) {
            alert('User not found');
        } else if (response.status === 401) {
            alert('Invalid password');
        } else {
            alert('Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error connecting to server');
    }
});
