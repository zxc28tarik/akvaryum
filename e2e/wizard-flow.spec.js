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

async function clickVisible(locator, timeout = 15_000) {
  await expect(locator).toBeVisible({ timeout });
  await locator.scrollIntoViewIfNeeded();
  await locator.click({ timeout });
}

async function startWizard(page, pathLabel = 'Tankla başla') {
  await page.goto('./');
  await clickVisible(page.locator('.hero-copy .btn-primary'));
  await expect(page.getByRole('heading', { name: 'Akvaryumunu nereden kurmaya başlayalım?' })).toBeVisible();
  await clickVisible(page.getByRole('button', { name: new RegExp(pathLabel) }));
}

function primaryNavigation(page) {
  return page.locator('.foot-nav .btn-primary');
}

async function clickPrimaryAndWait(page, target, timeout = 30_000) {
  await clickVisible(primaryNavigation(page));
  await expect(target).toBeVisible({ timeout });
}

async function chooseTankPreset(page, position = 'first') {
  const presets = page.locator('.stage .option-card');
  const target = position === 'last' ? presets.last() : presets.first();
  await clickVisible(target);
  await expect(primaryNavigation(page)).toBeEnabled();
}

async function chooseWater(page, label) {
  await clickVisible(page.locator('.water-card').filter({ hasText: label }));
  await expect(primaryNavigation(page)).toBeEnabled();
}

async function expectAboveFooter(page, target) {
  await expect(target).toBeVisible({ timeout: 30_000 });
  await target.evaluate(element => element.scrollIntoView({ block: 'center', inline: 'nearest' }));
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));

  const targetBox = await target.boundingBox();
  const footerBox = await page.locator('.foot-nav').boundingBox();
  expect(targetBox).not.toBeNull();
  expect(footerBox).not.toBeNull();
  expect(targetBox.y + targetBox.height).toBeLessThanOrEqual(footerBox.y - 2);
}

async function expectCatalogReady(page) {
  await expect(page.locator('.catalog-step')).toBeVisible({ timeout: 45_000 });
  await expect(page.locator('.catalog-card').first()).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('.catalog-add').first()).toBeVisible({ timeout: 30_000 });
}

async function addDistinctInhabitants(page, count) {
  for (let index = 0; index < count; index += 1) {
    const add = page.locator('.catalog-add').first();
    await clickVisible(add, 30_000);
    await expect(page.locator('.catalog-selected-item')).toHaveCount(index + 1, { timeout: 15_000 });
  }
}

async function increaseFirstSpecies(page, extraIndividuals) {
  for (let index = 0; index < extraIndividuals; index += 1) {
    const plus = page.locator('.catalog-stepper').first().getByRole('button').last();
    await clickVisible(plus, 15_000);
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
  await expect(page.locator('.catalog-step')).toHaveCount(0);
  await expectNoRuntimeErrors(errors);
});

test('su tipi değişince eski canlı, bitki ve substrat seçimleri temizlenir', async ({ page }) => {
  test.setTimeout(120_000);
  const errors = captureRuntimeErrors(page);
  await startWizard(page, 'Tankla başla');
  await chooseTankPreset(page);
  await clickPrimaryAndWait(page, page.getByRole('heading', { name: 'Hangi tip suyla çalışacaksın?' }));
  await chooseWater(page, 'Tatlı su');
  await clickPrimaryAndWait(page, page.locator('.catalog-step'), 45_000);
  await expectCatalogReady(page);

  await addDistinctInhabitants(page, 1);
  await clickPrimaryAndWait(page, page.locator('.tile-grid'));
  await clickVisible(page.locator('.tile-grid .tile').first());
  await clickPrimaryAndWait(page, page.locator('.stage .option-card').first());
  await clickVisible(page.locator('.stage .option-card').first());

  await clickVisible(page.locator('.recipe-strip button').filter({ hasText: 'Tatlı su' }));
  await expect(page.getByRole('heading', { name: 'Hangi tip suyla çalışacaksın?' })).toBeVisible();
  await chooseWater(page, 'Tuzlu su');

  await expect(page.locator('.recipe-strip button').filter({ hasText: 'BALIKLAR' })).toHaveCount(0);
  await expect(page.locator('.recipe-strip button').filter({ hasText: 'Bitkiler' })).toHaveCount(0);
  await expect(page.locator('.recipe-strip button').filter({ hasText: 'SUBSTRAT' })).toHaveCount(0);
  await expectNoRuntimeErrors(errors);
});

test('boş sonuç üreten URL filtresi sıfırlanınca katalog yeniden açılır', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = captureRuntimeErrors(page);
  await page.goto('./?q=zzzz-katalogda-olmayan-kayit&cat=gecersiz&care=gecersiz&sort=gecersiz');
  await clickVisible(page.locator('.hero-copy .btn-primary'));
  await clickVisible(page.getByRole('button', { name: /Balıkla başla/ }));
  await chooseWater(page, 'Tatlı su');
  await clickPrimaryAndWait(page, page.locator('.catalog-step'), 45_000);

  await expect(page.locator('.catalog-empty')).toBeVisible();
  await clickVisible(page.locator('.catalog-reset'));
  await expect.poll(() => page.locator('.catalog-search').inputValue(), { timeout: 15_000 }).toBe('');
  await expect(page).not.toHaveURL(/[?&](q|cat|care|temperament|social|zone|tankMax|plantSafe|reefSafe|sort)=/);
  await expect(page.locator('.catalog-card').first()).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('.catalog-summary')).toContainText(/sonuç/);
  await expectNoRuntimeErrors(errors);
});

test('mobil alt gezinme son katalog kontrolünü kapatmaz', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Bu denetim yalnız mobil projede çalışır.');
  test.setTimeout(90_000);
  const errors = captureRuntimeErrors(page);
  await startWizard(page, 'Balıkla başla');
  await chooseWater(page, 'Tatlı su');
  await clickPrimaryAndWait(page, page.locator('.catalog-step'), 45_000);
  await expectCatalogReady(page);
  await addDistinctInhabitants(page, 1);

  const moreButton = page.locator('.catalog-more');
  const target = await moreButton.isVisible() ? moreButton : page.locator('.catalog-card').last();
  await expectAboveFooter(page, target);

  await clickPrimaryAndWait(page, page.getByRole('heading', { name: 'Akvaryumunun ölçüleri ne?' }));
  await expectNoRuntimeErrors(errors);
});

test('15 tür ve 30 bireyde sonuç ekranı çökmeden açılır', async ({ page, isMobile }) => {
  test.skip(Boolean(isMobile), 'Yük testi masaüstü Chromium projesinde çalışır.');
  test.setTimeout(180_000);
  const errors = captureRuntimeErrors(page);
  await startWizard(page, 'Tankla başla');
  await chooseTankPreset(page, 'last');
  await clickPrimaryAndWait(page, page.getByRole('heading', { name: 'Hangi tip suyla çalışacaksın?' }));
  await chooseWater(page, 'Tatlı su');
  await clickPrimaryAndWait(page, page.locator('.catalog-step'), 45_000);
  await expectCatalogReady(page);

  await addDistinctInhabitants(page, 15);
  await increaseFirstSpecies(page, 15);
  await expect(page.locator('.catalog-summary')).toContainText('30 seçili', { timeout: 15_000 });

  await clickPrimaryAndWait(page, page.locator('.tile-grid'));
  await clickPrimaryAndWait(page, page.locator('.stage .option-card').first());
  await clickVisible(page.locator('.stage .option-card').first());

  const startedAt = Date.now();
  await clickVisible(primaryNavigation(page));
  await expect(page.getByRole('heading', { name: 'Akvaryum reçeten hazır' })).toBeVisible({ timeout: 20_000 });
  expect(Date.now() - startedAt).toBeLessThan(15_000);
  await expect(page.locator('.score-hero')).toBeVisible();
  await expectNoRuntimeErrors(errors);
});