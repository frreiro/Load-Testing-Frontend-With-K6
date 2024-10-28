import { browser } from 'k6/browser';
import { check } from 'https://jslib.k6.io/k6-utils/1.5.0/index.js';

export const options = {
  scenarios: {
    ui: {
      executor: 'shared-iterations',
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },
  thresholds: {
    checks: ['rate==1.0'],
  },
};

export default async function () {
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('https://mobile.dev.watch.tv.br/login');

    await page.locator('input[name="email"]').type('');
    await page.locator('input[name="password"]').type('');

    // Aguarda o redirecionamento após o login
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.locator('button[type="submit"]').click(),
    ]);

    // Verifica se a URL atual é /selecionar-perfil
    const currentUrl = page.url();
    const isProfileSelectionPage = currentUrl.endsWith('/selecionar-perfil');

    // Adiciona uma verificação
    check(isProfileSelectionPage, {
      'navegou para /selecionar-perfil': (v) => v === true,
    });

    // Verifica se existe um texto específico na tag <h3>
    const h3Locator = page.locator('h3');
    const h3Text = await h3Locator.textContent();
    const expectedText = 'Quem está assistindo?'; // Substitua pelo texto que você está procurando

    check(h3Text, {
      'h3 contém o texto esperado': (text) => text.includes(expectedText),
    });

  } catch (error) {
    console.error('Erro durante o teste:', error);
  } finally {
    await page.close();
  }
}
