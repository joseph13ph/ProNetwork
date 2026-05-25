import { loginUser } from '../src/services/authService.js';

async function run() {
  try {
    const res = await loginUser({ email: 'ana@proconnect.dev', password: 'Password#2026' });
    console.log('loginUser ok', !!res.token, res.user.email);
  } catch (err) {
    console.error('loginUser error', err.message);
  }
}

run();
