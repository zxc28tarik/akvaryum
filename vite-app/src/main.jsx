import './migration-shell.css';
import 'virtual:akvaryum/styles.css';

const root = document.getElementById('root');

function showError(error) {
  console.error(error);
  root.replaceChildren();

  const panel = document.createElement('main');
  panel.className = 'migration-error';

  const title = document.createElement('h1');
  title.textContent = 'AKVARYUM yüklenemedi';

  const text = document.createElement('p');
  text.textContent =
    'Sayfayı yenileyin. Sorun devam ederse tarayıcı konsolundaki hata kaydını kontrol edin.';

  const detail = document.createElement('pre');
  detail.textContent = error?.message ?? String(error);

  panel.append(title, text, detail);
  root.append(panel);
}

import('virtual:akvaryum/app.jsx').catch(showError);
