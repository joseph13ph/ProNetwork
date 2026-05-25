import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const API = `http://localhost:${process.env.PORT || 5001}/api`;

async function run() {
  try {
    // login
    const loginRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ana@proconnect.dev', password: 'Password#2026' })
    });
    const loginJson = await loginRes.json();
    if (!loginRes.ok) {
      console.error('Login failed', loginJson);
      return;
    }
    const token = loginJson.data?.token || loginJson.token;
    console.log('Got token', !!token);

    // get feed (need auth)
    const feedRes = await fetch(`${API}/posts/feed`, { headers: { Authorization: `Bearer ${token}` } });
    const feed = await feedRes.json();
    console.log('feed length', Array.isArray(feed) ? feed.length : Object.keys(feed).length);
    const post = Array.isArray(feed) && feed.length > 0 ? feed[0] : null;
    if (!post) {
      console.log('No posts to like');
      return;
    }

    // toggle like
    const likeRes = await fetch(`${API}/posts/${post.id}/like`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    const likeJson = await likeRes.json();
    console.log('like response', likeJson);
  } catch (err) {
    console.error(err);
  }
}

run();
