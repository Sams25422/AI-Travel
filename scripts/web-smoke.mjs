import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', msg => {
  if (msg.type() === 'error') errors.push(msg.text());
});

await page.goto('http://localhost:8081', {waitUntil: 'networkidle0', timeout: 60000});
await page.waitForSelector('div', {timeout: 30000});
await new Promise(r => setTimeout(r, 2000));

const text = await page.evaluate(() => document.body.innerText);
console.log('--- PAGE TEXT ---');
console.log(text.slice(0, 800));

// Click Get started via text
const clicked = await page.evaluate(() => {
  const all = [...document.querySelectorAll('div,button,a,span')];
  const el = all.find(e => (e.textContent || '').trim() === 'Get started');
  if (!el) return false;
  el.click();
  return true;
});
console.log('clicked Get started:', clicked);
await new Promise(r => setTimeout(r, 1500));
const text2 = await page.evaluate(() => document.body.innerText);
console.log('--- AFTER CLICK ---');
console.log(text2.slice(0, 800));
console.log('--- ERRORS ---');
console.log(errors.slice(0, 20));
await page.screenshot({path: '/tmp/atlas-after-click.png', fullPage: true});
await browser.close();
