const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:5174/');
  await page.waitForSelector('.hero-btn-primary');
  
  console.log('Clicking Start Donating button...');
  await page.click('.hero-btn-primary');
  
  await new Promise(r => setTimeout(r, 1000));
  
  const modalVisible = await page.evaluate(() => {
    const overlay = document.querySelector('.auth-modal-overlay');
    if (!overlay) return 'Overlay not found in DOM';
    const computedStyle = window.getComputedStyle(overlay);
    return `Overlay found. opacity: ${computedStyle.opacity}, classList: ${overlay.classList.toString()}`;
  });
  
  console.log('Modal status:', modalVisible);
  
  await browser.close();
})();
