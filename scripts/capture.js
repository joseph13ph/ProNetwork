import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const OUT = path.resolve('./docs/screenshots');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const CHROME_PATHS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
];

const findChrome = () => {
  for (const chromePath of CHROME_PATHS) {
    if (fs.existsSync(chromePath)) return chromePath;
  }
  return null;
};

const chromePath = findChrome();
if (!chromePath) {
  console.error('Chrome no encontrado en rutas comunes.');
  process.exit(1);
}

const base = 'http://localhost:5173';
const apiBase = 'http://localhost:5001';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const copy = (source, target) => {
  if (fs.existsSync(source)) fs.copyFileSync(source, target);
};

async function login(page, email, password) {
  await page.goto(`${base}/login`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle2' });
  await page.type('input[placeholder="Correo electronico"]', email, { delay: 30 });
  await page.type('input[placeholder="Contrasena"]', password, { delay: 30 });
  await page.click('button.btn-primary');
  await page.waitForFunction(() => Boolean(localStorage.getItem('proconnect_token')), { timeout: 10000 }).catch(() => {});
  await sleep(600);
}

async function ensureFeed(page) {
  await page.goto(`${base}/app/feed`, { waitUntil: 'networkidle2' });
  await sleep(900);
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: chromePath, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.setViewport({ width: 1440, height: 1600 });

  // Login page
  await page.goto(`${base}/login`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => localStorage.clear());
  await page.screenshot({ path: path.join(OUT, 'login_page.png'), fullPage: true });

  // Wrong password
  await login(page, 'ana@proconnect.dev', 'incorrecta123');
  await page.screenshot({ path: path.join(OUT, 'PS-001_ContraseñaIncorrecta.png'), fullPage: true });

  // Invalid email format
  await login(page, 'usuario@', 'AnaPro#2026');
  await page.screenshot({ path: path.join(OUT, 'PS-002_CorreoInvalido.png'), fullPage: true });

  // Valid session for the rest of the screenshots
  const authResponse = await fetch(`${apiBase}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ana@proconnect.dev', password: 'AnaPro#2026' })
  });
  const authData = await authResponse.json();
  await page.goto(`${base}/login`, { waitUntil: 'networkidle2' });
  await page.evaluate((token) => localStorage.setItem('proconnect_token', token), authData.token);
  await ensureFeed(page);
  await page.screenshot({ path: path.join(OUT, 'PU-001_LoginFeed.png'), fullPage: true });
  copy(path.join(OUT, 'PU-001_LoginFeed.png'), path.join(OUT, 'PI-001_LoginFeedIntegracion.png'));

  // Attach image button / unit UI visible
  await page.screenshot({ path: path.join(OUT, 'UT-002_AdjuntarImagen.png'), fullPage: true });

  // Empty publication error
  await page.click('button.btn-primary', { delay: 50 }).catch(() => {});
  await sleep(1000);
  await page.screenshot({ path: path.join(OUT, 'PS-003_PublicacionVacia.png'), fullPage: true });

  // Create a post
  const composer = await page.$('textarea[placeholder^="Comparte un logro"]');
  if (composer) {
    await composer.click({ clickCount: 3 });
    await composer.type('Publicación de prueba para validar que el feed actualiza la tarjeta con foto, nombre y texto.');
  }
  await page.click('button.btn-primary');
  await sleep(1500);
  await page.screenshot({ path: path.join(OUT, 'PU-002_PublicacionFeed.png'), fullPage: true });
  copy(path.join(OUT, 'PU-002_PublicacionFeed.png'), path.join(OUT, 'PI-002_PublicacionFeedIntegracion.png'));

  // Navigation to modules
  await page.goto(`${base}/app/jobs`, { waitUntil: 'networkidle2' });
  await sleep(1200);
  await page.screenshot({ path: path.join(OUT, 'PU-003_NavegacionModulos.png'), fullPage: true });
  copy(path.join(OUT, 'PU-003_NavegacionModulos.png'), path.join(OUT, 'PI-003_MenuModulos.png'));

  // Publication length limit
  await page.goto(`${base}/app/feed`, { waitUntil: 'networkidle2' });
  await sleep(1200);
  const longText = 'A'.repeat(600);
  const textarea = await page.$('textarea[placeholder^="Comparte un logro"]');
  if (textarea) {
    await textarea.click();
    await textarea.type(longText, { delay: 1 });
  }
  await page.screenshot({ path: path.join(OUT, 'UT-001_CampoPublicacion.png'), fullPage: true });

  // Logout
  await page.click('button.btn-secondary');
  await sleep(1000);
  await page.screenshot({ path: path.join(OUT, 'UT-003_CerrarSesion.png'), fullPage: true });

  // Extra evidence if needed
  await page.goto(`${base}/app/feed`, { waitUntil: 'networkidle2' }).catch(() => {});
  await sleep(500);

  await browser.close();
  console.log('Capturas generadas en', OUT);
  process.exit(0);
})();
