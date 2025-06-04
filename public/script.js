function toggle(id) {
    document.querySelectorAll('.form-section').forEach(e => e.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}

async function register() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const secret = document.getElementById('reg-secret').value;

    const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, secret })
    });
    alert((await res.json()).message);
}

async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const res = await fetch('/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    alert((await res.json()).message);
}

async function restore() {
    const username = document.getElementById('restore-username').value;
    const password = document.getElementById('restore-password').value;
    const secret = document.getElementById('restore-secret').value;

    const res = await fetch('/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, secret })
    });
    alert((await res.json()).message);
}

async function decrypt() {
    const encrypted = document.getElementById('decrypt-input').value;
    const res = await fetch('/decrypt', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encrypted })
    });
    const data = await res.json();
    document.getElementById('decrypt-result').innerText = data.decrypted || data.message;
}

async function updateCurrency() {
    const username = document.getElementById('money-admin').value;
    const password = document.getElementById('money-pass').value;
    const targetUser = document.getElementById('money-user').value;
    const amount = document.getElementById('money-amount').value;

    // Сначала логин
    const loginRes = await fetch('/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (!loginRes.ok) {
        alert('Login failed');
        return;
    }

    // Затем отправка запроса
    const res = await fetch('/admin/update-currency', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUser, amount })
    });

    const data = await res.json();
    alert(data.message);
}

async function getUsers() {
    const username = document.getElementById('admin-login').value;
    const password = document.getElementById('admin-pass').value;

    // Сначала логин
    const loginRes = await fetch('/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (!loginRes.ok) {
        alert('Login failed');
        return;
    }

    // Затем получение пользователей
    const res = await fetch('/admin/users', {
        method: 'POST',
        credentials: 'include'
    });

    const data = await res.json();
    document.getElementById('users-list').innerText =
        data.users ? JSON.stringify(data.users, null, 2) : data.message;
}
async function manualBackup() {
    const username = document.getElementById('backup-admin').value;
    const password = document.getElementById('backup-pass').value;

    // Сначала логин
    const loginRes = await fetch('/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (!loginRes.ok) {
        alert('Login failed');
        return;
    }

    // Затем вызов бэкапа
    const res = await fetch('/admin/export', {
        method: 'GET',
        credentials: 'include'
    });

    const data = await res.json();
    alert(data.message || data.error);
}

