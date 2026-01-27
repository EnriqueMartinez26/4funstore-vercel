

async function run() {
    const baseUrl = 'http://localhost:9003/api';
    const email = `debug_${Date.now()}@test.com`;
    const password = 'Password123!';

    console.log('--- Registering ---');
    try {
        const res = await fetch(`${baseUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Debug', email, password })
        });

        console.log('Status:', res.status);
        console.log('Headers:', JSON.stringify([...res.headers.entries()]));
        const body = await res.json();
        console.log('Body:', JSON.stringify(body, null, 2));

        if (res.ok) {
            console.log('\n--- Login (with just created user) ---');
            const resLogin = await fetch(`${baseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            console.log('Status:', resLogin.status);
            const loginBody = await resLogin.json();
            console.log('Login Body:', JSON.stringify(loginBody, null, 2));

            const token = loginBody.token || loginBody.data?.token;
            if (token) {
                console.log('\n--- Get Profile (with token) ---');
                const resProfile = await fetch(`${baseUrl}/auth/profile`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log('Profile Status:', resProfile.status);
                const profileBody = await resProfile.json();
                console.log('Profile Body:', JSON.stringify(profileBody, null, 2));
            } else {
                console.log('No token found in login response');
            }

        }
    } catch (e) {
        console.error('Error:', e);
    }
}

run();
