import puppeteer from 'puppeteer';
import fs from 'fs';

async function clickByText(page, text) {
  return page.evaluate(t => {
    const all = [...document.querySelectorAll('div,button,a,span,p,h1,h2,h3')];
    const el = all.find(e => (e.textContent || '').trim() === t);
    if (!el) return false;
    el.click();
    return true;
  }, text);
}

async function clickIncludes(page, text) {
  return page.evaluate(t => {
    const all = [...document.querySelectorAll('div,button,a,span,p')];
    const el = all.find(e => (e.textContent || '').includes(t));
    if (!el) return false;
    el.click();
    return true;
  }, text);
}

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({width: 390, height: 844});
const errors = [];
page.on('pageerror', e => errors.push(String(e)));

await page.goto('http://localhost:8081', {waitUntil: 'networkidle0', timeout: 90000});
await new Promise(r => setTimeout(r, 2000));

// Skip onboarding if present
if (await clickByText(page, 'Get started')) {
  await new Promise(r => setTimeout(r, 800));
  await clickByText(page, 'Enable location').catch(() => {});
  await new Promise(r => setTimeout(r, 800));
  if (!(await clickByText(page, 'Enable photos'))) await clickByText(page, 'Not now');
  await new Promise(r => setTimeout(r, 800));
  await clickByText(page, 'Open Atlas');
  await new Promise(r => setTimeout(r, 1500));
}

await page.screenshot({path: '/tmp/atlas-plan-01-home.png', fullPage: true});
let body = await page.evaluate(() => document.body.innerText);
console.log('HOME SNIPPET:\n', body.slice(0, 800));

const planClicked =
  (await clickByText(page, 'Plan a trip')) ||
  (await clickIncludes(page, 'Plan a trip')) ||
  (await clickIncludes(page, 'Plan this trip'));
console.log('plan clicked', planClicked);
await new Promise(r => setTimeout(r, 1200));
await page.screenshot({path: '/tmp/atlas-plan-02-wizard.png', fullPage: true});
body = await page.evaluate(() => document.body.innerText);
console.log('PLAN SNIPPET:\n', body.slice(0, 800));

const buildClicked =
  (await clickByText(page, 'Build itinerary')) ||
  (await clickIncludes(page, 'Build itinerary'));
console.log('build clicked', buildClicked);
await new Promise(r => setTimeout(r, 1500));
await page.screenshot({path: '/tmp/atlas-plan-03-itinerary.png', fullPage: true});
body = await page.evaluate(() => document.body.innerText);
console.log('ITINERARY SNIPPET:\n', body.slice(0, 1000));

const startClicked =
  (await clickIncludes(page, 'Start trip')) ||
  (await clickIncludes(page, 'begin journaling'));
console.log('start clicked', startClicked);
await new Promise(r => setTimeout(r, 1500));
await page.screenshot({path: '/tmp/atlas-plan-04-started.png', fullPage: true});
body = await page.evaluate(() => document.body.innerText);
console.log('AFTER START:\n', body.slice(0, 800));

fs.writeFileSync('/tmp/atlas-plan-e2e-errors.json', JSON.stringify(errors, null, 2));
console.log('ERRORS', errors);
await browser.close();
