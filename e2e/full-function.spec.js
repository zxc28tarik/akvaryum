import { expect, test } from '@playwright/test';

const PATH_LABELS = {
  tank: 'Tankla başla',
  fish: 'Balıkla başla',
  water: 'Su tipiyle başla',
};

const FLOWS = {
  tank: {
    fresh: ['tank', 'water', 'fish', 'plants', 'substrate', 'result'],
    salt: ['tank', 'water', 'fish', 'substrate', 'result'],
  },
  fish: {
    fresh: ['water', 'fish', 'tank', 'plants', 'substrate', 'result'],
    salt: ['water', 'fish', 'tank', 'substrate', 'result'],
  },
  water: {
    fresh: ['water', 'tank', 'fish', 'plants', 'substrate', 'result'],
    salt: ['water', 'tank', 'fish', 'substrate', 'result'],
  },
};

function captureRuntimeErrors(page) {
  const errors = [];
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (/favicon|Failed to load resource.*404/i.test(text)) return;
    errors.push(`console: ${text}`);
  });
  return errors;
}

function pause(milliseconds = 250) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function realClick(locator, timeout = 20_000) {
  await expect(locator).toBeVisible({ timeout });
  await expect(locator).toBeEnabled({ timeout });
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error('Tıklanacak öğenin ekran konumu alınamadı.');
  await locator.page().mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

async function domClick(locator, timeout = 20_000) {
  await expect(locator).toBeVisible({ timeout });
  await expect(locator).toBeEnabled({ timeout });
  await locator.evaluate(element => element.click());
}

async function setRangeValue(locator, value) {
  await expect(locator).toBeVisible();
  await locator.evaluate((element, nextValue) => {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    descriptor.set.call(element, String(nextValue));
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

async function openWizard(page, path) {
  await page.goto('./');
  await realClick(page.locator('.hero-copy .btn-primary'));
  await expect(page.getByRole('heading', { name: 'Akvaryumunu nereden kurmaya başlayalım?' })).toBeVisible();
  await realClick(page.getByRole('button', { name: new RegExp(PATH_LABELS[path]) }));
}

function primary(page) {
  return page.locator('.foot-nav .btn-primary');
}

function back(page) {
  return page.locator('.foot-nav .btn-ghost');
}

async function next(page) {
  await domClick(primary(page));
  await pause();
}

async function expectStep(page, step) {
  if (step === 'tank') {
    await expect(page.getByRole('heading', { name: 'Akvaryumunun ölçüleri ne?' })).toBeVisible({ timeout: 30_000 });
    return;
  }
  if (step === 'water') {
    await expect(page.getByRole('heading', { name: 'Hangi tip suyla çalışacaksın?' })).toBeVisible({ timeout: 30_000 });
    return;
  }
  if (step === 'fish') {
    await expect(page.locator('.catalog-step')).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('.catalog-card[data-inhabitant-id]').first()).toBeVisible({ timeout: 30_000 });
    return;
  }
  if (step === 'plants') {
    await expect(page.getByRole('heading', { name: 'Bitkiler' })).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('.tile-grid .tile').first()).toBeVisible({ timeout: 30_000 });
    return;
  }
  if (step === 'substrate') {
    await expect(page.getByRole('heading', { name: 'Substrat seçimi' })).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('.stage .option-card').first()).toBeVisible({ timeout: 30_000 });
    return;
  }
  if (step === 'result') {
    await expect(page.getByRole('heading', { name: 'Akvaryum reçeten hazır' })).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('.score-hero')).toBeVisible({ timeout: 30_000 });
  }
}

async function chooseTank(page, position = 'first') {
  const presets = page.locator('.stage .option-card');
  const target = position === 'last' ? presets.last() : presets.first();
  await realClick(target);
  await expect(primary(page)).toBeEnabled();
}

async function chooseWater(page, water) {
  const label = water === 'salt' ? 'Tuzlu su' : 'Tatlı su';
  await realClick(page.locator('.water-card').filter({ hasText: label }));
  await expect(primary(page)).toBeEnabled();
}

async function addFirstInhabitant(page) {
  await realClick(page.locator('.catalog-add').first(), 30_000);
  await expect(page.locator('.catalog-selected-item')).toHaveCount(1, { timeout: 20_000 });
  await expect(primary(page)).toBeEnabled();
}

async function choosePlant(page) {
  await realClick(page.locator('.tile-grid .tile').first());
}

async function chooseSubstrate(page) {
  await realClick(page.locator('.stage .option-card').first());
}

async function operateStep(page, step, water) {
  await expectStep(page, step);
  if (step === 'tank') await chooseTank(page);
  if (step === 'water') await chooseWater(page, water);
  if (step === 'fish') await addFirstInhabitant(page);
  if (step === 'plants') await choosePlant(page);
  if (step === 'substrate') await chooseSubstrate(page);
}

async function completeFlow(page, path, water) {
  await openWizard(page, path);
  const flow = FLOWS[path][water];
  for (const step of flow) {
    await operateStep(page, step, water);
    if (step !== 'result') await next(page);
  }
  return flow;
}

function assertNoRuntimeErrors(errors) {
  expect(errors, errors.join('\n')).toEqual([]);
}

for (const path of ['tank', 'fish', 'water']) {
  for (const water of ['fresh', 'salt']) {
    test(`${path} başlangıcı ${water} akışı sonuç ekranına kadar tamamlanır`, async ({ page }) => {
      test.setTimeout(120_000);
      const errors = captureRuntimeErrors(page);
      const flow = await completeFlow(page, path, water);

      if (water === 'salt') {
        expect(flow).not.toContain('plants');
        await expect(page.locator('.foot-nav button').filter({ hasText: 'BİTKİ & MERCAN' })).toHaveCount(0);
      }

      await expect(page.locator('.score-breakdown-panel')).toBeVisible({ timeout: 30_000 });
      assertNoRuntimeErrors(errors);
    });
  }
}

test('geri, ileri ve reçete şeridi geçişleri seçimleri korur', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = captureRuntimeErrors(page);
  await openWizard(page, 'tank');
  await expectStep(page, 'tank');
  await chooseTank(page);
  await next(page);
  await expectStep(page, 'water');
  await chooseWater(page, 'fresh');
  await next(page);
  await expectStep(page, 'fish');
  await addFirstInhabitant(page);

  await domClick(back(page));
  await expectStep(page, 'water');
  await expect(page.locator('.water-card').filter({ hasText: 'Tatlı su' })).toHaveClass(/selected|active|is-selected/);

  await next(page);
  await expectStep(page, 'fish');
  await expect(page.locator('.catalog-selected-item')).toHaveCount(1);

  await next(page);
  await expectStep(page, 'plants');
  await domClick(page.getByRole('button', { name: /SU TİPİ.*Tatlı su/ }));
  await expectStep(page, 'water');
  assertNoRuntimeErrors(errors);
});

test('özel tank ölçüsü kaydırıcıları hacmi günceller ve geçişi açar', async ({ page }) => {
  const errors = captureRuntimeErrors(page);
  await openWizard(page, 'tank');
  await expectStep(page, 'tank');
  await realClick(page.getByRole('button', { name: 'Özel ölçü' }));

  const sliders = page.getByRole('slider');
  await expect(sliders).toHaveCount(3);
  await setRangeValue(sliders.nth(0), 100);
  await setRangeValue(sliders.nth(1), 40);
  await setRangeValue(sliders.nth(2), 50);
  await expect(page.getByText('Yaklaşık 200 litre')).toBeVisible();
  await expect(primary(page)).toBeEnabled();

  await next(page);
  await expectStep(page, 'water');
  assertNoRuntimeErrors(errors);
});

test('Türkçe ve İngilizce arayüz arasında geçiş yapılır', async ({ page }) => {
  const errors = captureRuntimeErrors(page);
  await page.goto('./');
  await realClick(page.getByRole('button', { name: 'EN', exact: true }));
  await expect(page.getByRole('heading', { name: 'Design the aquarium of your dreams, step by step.' })).toBeVisible();
  await realClick(page.getByRole('button', { name: 'TR', exact: true }));
  await expect(page.getByRole('heading', { name: 'Hayalindeki akvaryumu adım adım tasarla.' })).toBeVisible();
  assertNoRuntimeErrors(errors);
});

test('katalog arama, kategori, gelişmiş filtre, URL ve sıfırlama işlemleri çalışır', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = captureRuntimeErrors(page);
  await openWizard(page, 'fish');
  await expectStep(page, 'water');
  await chooseWater(page, 'fresh');
  await next(page);
  await expectStep(page, 'fish');

  const search = page.locator('.catalog-search');
  await search.fill('Neon');
  await pause(400);
  await expect(page.locator('.catalog-card').first()).toBeVisible({ timeout: 30_000 });
  expect(new URL(page.url()).searchParams.get('q')).toBe('Neon');

  await search.fill('');
  await realClick(page.locator('.catalog-tab').filter({ hasText: 'Omurgasızlar' }));
  await pause(300);
  expect(new URL(page.url()).searchParams.get('cat')).toBe('invertebrates');
  await expect(page.locator('.catalog-card').first()).toBeVisible({ timeout: 30_000 });

  await realClick(page.locator('.catalog-tab').filter({ hasText: /^Tümü/ }));
  await realClick(page.locator('.catalog-filter-toggle'));
  await page.locator('.catalog-select').nth(0).selectOption('beginner');
  await page.locator('.catalog-check input').first().check();
  await pause(400);
  const filteredUrl = new URL(page.url());
  expect(filteredUrl.searchParams.get('care')).toBe('beginner');
  expect(filteredUrl.searchParams.get('plantSafe')).toBe('1');

  await realClick(page.locator('.catalog-reset'));
  await pause(500);
  expect(new URL(page.url()).search).toBe('');
  await expect(page.locator('.catalog-card').first()).toBeVisible({ timeout: 30_000 });
  assertNoRuntimeErrors(errors);
});

test('canlı detay paneli, ekleme, artırma, azaltma, kapatma ve kaldırma çalışır', async ({ page, isMobile }) => {
  test.setTimeout(90_000);
  const errors = captureRuntimeErrors(page);
  await openWizard(page, 'fish');
  await expectStep(page, 'water');
  await chooseWater(page, 'fresh');
  await next(page);
  await expectStep(page, 'fish');

  await realClick(page.locator('.catalog-detail').first(), 30_000);
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Genel bilgiler' })).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Su ve tank' })).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Davranış ve bakım' })).toBeVisible();

  await realClick(page.locator('.inhabitant-detail-add'));
  await expect(page.locator('.inhabitant-detail-stepper output')).toHaveText('1');
  const detailButtons = page.locator('.inhabitant-detail-stepper button');
  await realClick(detailButtons.last());
  await expect(page.locator('.inhabitant-detail-stepper output')).toHaveText('2');
  await realClick(detailButtons.first());
  await expect(page.locator('.inhabitant-detail-stepper output')).toHaveText('1');

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('.catalog-selected-item')).toHaveCount(1);
  await realClick(page.locator('.catalog-selected-item button'));
  await expect(page.locator('.catalog-selected-item')).toHaveCount(0);
  await expect(primary(page)).toBeDisabled();

  if (isMobile) await expect(page.locator('.foot-nav')).toBeVisible();
  assertNoRuntimeErrors(errors);
});

test('sonuç sekmeleri, yazdırma ve yeniden başlatma işlemleri çalışır', async ({ page, isMobile }) => {
  test.setTimeout(120_000);
  const errors = captureRuntimeErrors(page);
  await completeFlow(page, 'tank', 'fresh');

  const tabs = [
    ['Görünüm', 'Akvaryumun nasıl görünecek'],
    ['Parametreler', 'Tür bazında parametreler'],
    ['Ekipman', 'Ekipman önerileri'],
    ['Bakım', 'Bakım takvimi'],
    ['Kurulum', 'Akvaryum kurulum (cycling) rehberi'],
    ['Özet', 'Sağlık Skoru'],
  ];

  for (const [buttonName, expectedText] of tabs) {
    await realClick(page.getByRole('button', { name: buttonName, exact: true }), 30_000);
    await expect(page.getByText(expectedText, { exact: false }).first()).toBeVisible({ timeout: 30_000 });
  }

  await page.evaluate(() => {
    window.__akvaryumPrintCalls = 0;
    window.print = () => { window.__akvaryumPrintCalls += 1; };
  });
  await realClick(page.getByRole('button', { name: 'Reçeteyi Yazdır' }));
  expect(await page.evaluate(() => window.__akvaryumPrintCalls)).toBe(1);

  await domClick(page.locator('.foot-nav .btn-secondary'));
  await expect(page.getByRole('heading', { name: 'Hayalindeki akvaryumu adım adım tasarla.' })).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('.foot-nav')).toHaveCount(0);

  if (isMobile) {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  }
  assertNoRuntimeErrors(errors);
});
