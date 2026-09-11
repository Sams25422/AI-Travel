import puppeteer from 'puppeteer';
import fs from 'fs';

function clickByText(page, text) {
  return page.evaluate((t) => {
    const all = [...document.querySelectorAll('div,button,a,span,p')];
    const el = all.find(e => (e.textContent || '').trim() === t);
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
page.setViewport({width: 390, height: 844});
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

await page.goto('http://localhost:8081', {waitUntil: 'networkidle0', timeout: 60000});
await new Promise(r => setTimeout(r, 1500));
await page.screenshot({path: '/tmp/atlas-01-welcome.png'});

await clickByText(page, 'Get started');
await new Promise(r => setTimeout(r, 800));
await page.screenshot({path: '/tmp/atlas-02-location.png'});

await clickByText(page, 'Enable location');
await new Promise(r => setTimeout(r, 1200));
// maybe permission prompt doesn't block on web
if (!(await page.evaluate(() => document.body.innerText.includes('photo') || document.body.innerText.includes('Photos') || document.body.innerText.includes('moments')))) {
  await clickByText(page, 'Not now');
  await new Promise(r => setTimeout(r, 800));
}
await page.screenshot({path: '/tmp/atlas-03-photos.png'});

// photo screen
if (await clickByText(page, 'Enable photos')) {
  await new Promise(r => setTimeout(r, 1200));
} else if (await clickByText(page, 'Not now')) {
  await new Promise(r => setTimeout(r, 800));
}
await page.screenshot({path: '/tmp/atlas-04-done.png'});

await clickByText(page, 'Open Atlas');
await new Promise(r => setTimeout(r, 1500));
await page.screenshot({path: '/tmp/atlas-05-home.png'});
let homeText = await page.evaluate(() => document.body.innerText);
console.log('HOME:\n', homeText.slice(0, 600));

const demoClicked = await clickByText(page, 'Run Paris demo trip');
console.log('demo clicked', demoClicked);
await new Promise(r => setTimeout(r, 5000));
await page.screenshot({path: '/tmp/atlas-06-after-demo.png'});
let after = await page.evaluate(() => document.body.innerText);
console.log('AFTER DEMO:\n', after.slice(0, 1000));

// If on timeline, try preview book
await clickByText(page, 'Preview book');
await new Promise(r => setTimeout(r, 1500));
await page.screenshot({path: '/tmp/atlas-07-book.png'});
let book = await page.evaluate(() => document.body.innerText);
console.log('BOOK:\n', book.slice(0, 600));

if (await clickByText(page, 'Continue to checkout')) {
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({path: '/tmp/atlas-08-checkout.png'});
  await clickByText(page, 'Place demo order');
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({path: '/tmp/atlas-09-order.png'});
  console.log('ORDER:\n', (await page.evaluate(() => document.body.innerText)).slice(0, 500));
}

console.log('ERRORS', errors);
fs.writeFileSync('/tmp/atlas-e2e-errors.json', JSON.stringify(errors, null, 2));
await browser.close();
console.log('E2E_DONE');
