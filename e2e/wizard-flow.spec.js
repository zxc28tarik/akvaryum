import { expect, test } from '@playwright/test';

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

async function startWizard(page, pathLabel = 'Tankla başla') {
  await page.goto('./');
  await page.getByRole('button', { name: /Kuruluma Başla/ }).click();
  await expect(page.getByRole('heading', { name: 'Akvaryumunu nereden kurmaya başlayalım?' })).toBeVisible();
  await page.getByRole('button', { name: new RegExp(pathLabel) }).click();
}

function primaryNavigation(page) {
  return page.locator('.foot-nav .btn-primary');
}

async function chooseTankPreset(page, position = 'first') {
  const presets = page.locator('.stage .option-card');
  const target = position === 'last' ? presets.last() : presets.first();
  await target.click();
  await expect(primaryNavigation(page)).toBeEnabled();
}

async function chooseWater(page, label) {
  await page.locator('.water-card').filter({ hasText: label }).click();
  await expect(primaryNavigation(page)).toBeEnabled();
}

async function addFirstAvailableInhabitants(page, count) {
  for (let index = 0; index < count; index += 1) {
    const add = page.locator('.catalog-add').first();
    await expect(add, `Canlı ${index + 1} eklenemedi`).toBeVisible();
    await add.click();
  }
}

async function expectNoRuntimeErrors(errors) {
  expect(errors, errors.join('\n')).toEqual([]);
}

test('hızlı çift tıklama iki adım birden atlamaz', async ({ page }) => {
  const errors = captureRuntimeErrors(page);
  await startWizard(page, 'Tankla başla');
  await chooseTankPreset(page);

  await primaryNavigation(page).evaluate(button => {
    button.click();
    button.click();
  });

  await expect(page.getByRole('heading', { name: 'Hangi tip suyla çalışacaksın?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tankında hangi balıklar olsun?' })).toHaveCount(0);
  await expectNoRuntimeErrors(errors);
});

test('su tipi değişince eski canlı, bitki ve substrat seçimleri temizlenir', async ({ page }) => {
  const errors = captureRuntimeErrors(page);
  await startWizard(page, 'Tankla başla');
  await chooseTankPreset(page);
  await primaryNavigation(page).click();
  await chooseWater(page, 'Tatlı su');
  await primaryNavigation(page).click();

  await addFirstAvailableInhabitants(page, 1);
  await primaryNavigation(page).click();
  await page.locator('.tile-grid .tile').first().click();
  await primaryNavigation(page).click();
  await page.locator('.stage .option-card').first().click();

  await page.locator('.recipe-strip button').filter({ hasText: 'Tatlı su' }).click();
  await chooseWater(page, 'Tuzlu su');

  await expect(page.locator('.recipe-strip button').filter({ hasText: 'BALIKLAR' })).toHaveCount(0);
  await expect(page.locator('.recipe-strip button').filter({ hasText: 'Bitkiler' })).toHaveCount(0);
  await expect(page.locator('.recipe-strip button').filter({ hasText: 'SUBSTRAT' })).toHaveCount(0);
  await expectNoRuntimeErrors(errors);
});

test('boş sonuç üreten URL filtresi sıfırlanınca katalog yeniden açılır', async ({ page }) => {
  const errors = captureRuntimeErrors(page);
  await page.goto('./?q=zzzz-katalogda-olmayan-kayit&cat=gecersiz&care=gecersiz&sort=gecersiz');
  await page.getByRole('button', { name: /Kuruluma Başla/ }).click();
  await page.getByRole('button', { name: /Balıkla başla/ }).click();
  await chooseWater(page, 'Tatlı su');
  await primaryNavigation(page).click();

  await expect(page.locator('.catalog-empty')).toBeVisible();
  await page.locator('.catalog-reset').click();
  await expect(page.locator('.catalog-card').first()).toBeVisible();
  await expect(page.locator('.catalog-summary')).toContainText(/sonuç/);
  await expectNoRuntimeErrors(errors);
});

test('mobil alt gezinme son katalog kontrolünü kapatmaz', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Bu denetim yalnız mobil projede çalışır.');
  const errors = captureRuntimeErrors(page);
  await startWizard(page, 'Balıkla başla');
  await chooseWater(page, 'Tatlı su');
  await primaryNavigation(page).click();
  await addFirstAvailableInhabitants(page, 1);

  const moreButton = page.locator('.catalog-more');
  const target = await moreButton.isVisible() ? moreButton : page.locator('.catalog-card').last();
  await target.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(150);

  const targetBox = await target.boundingBox();
  const footerBox = await page.locator('.foot-nav').boundingBox();
  expect(targetBox).not.toBeNull();
  expect(footerBox).not.toBeNull();
  expect(targetBox.y + targetBox.height).toBeLessThanOrEqual(footerBox.y - 2);

  await primaryNavigation(page).click();
  await expect(page.getByRole('heading', { name: 'Akvaryumunun ölçüleri ne?' })).toBeVisible();
  await expectNoRuntimeErrors(errors);
});

test('çok sayıda seçimde sonuç ekranı çökmeden açılır', async ({ page, isMobile }) => {
  test.skip(Boolean(isMobile), 'Yük testi masaüstü Chromium projesinde çalışır.');
  const errors = captureRuntimeErrors(page);
  await startWizard(page, 'Tankla başla');
  await chooseTankPreset(page, 'last');
  await primaryNavigation(page).click();
  await chooseWater(page, 'Tatlı su');
  await primaryNavigation(page).click();

  await addFirstAvailableInhabitants(page, 30);
  await primaryNavigation(page).click();
  await primaryNavigation(page).click();
  await page.locator('.stage .option-card').first().click();

  const startedAt = Date.now();
  await primaryNavigation(page).click();
  await expect(page.getByRole('heading', { name: 'Akvaryum reçeten hazır' })).toBeVisible({ timeout: 10_000 });
  expect(Date.now() - startedAt).toBeLessThan(8_000);
  await expect(page.locator('.score-hero')).toBeVisible();
  await expectNoRuntimeErrors(errors);
});
