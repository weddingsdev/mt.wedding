import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('declares Ukrainian language and viewport meta', () => {
  assert.match(html, /<html[^>]*lang="uk"/);
  assert.match(html, /<meta[^>]*name="viewport"[^>]*width=device-width/);
});

test('hero section has names, subtitle, and countdown slots', () => {
  assert.match(html, /Микола і Тетяна/);
  assert.match(html, /До нашого весілля залишилось/);
  assert.match(html, /id="countdown-days"/);
  assert.match(html, /id="countdown-hours"/);
  assert.match(html, /id="countdown-minutes"/);
  assert.match(html, /id="countdown-seconds"/);
});

test('invitation section has heading, body text, and calendar container', () => {
  assert.match(html, /Дорогі гості!/);
  assert.match(html, /Запрошуємо вас розділити з нами радість особливої для нас події та стати частиною нашої історії/);
  assert.match(html, /id="calendar-grid"/);
});

test('timing section lists all three events with times', () => {
  assert.match(html, /Вінчання/);
  assert.match(html, /12:00/);
  assert.match(html, /Трансфер до ресторану/);
  assert.match(html, /13:20/);
  assert.match(html, /Бенкет/);
  assert.match(html, /14:00/);
});

test('locations section has both venues with map links', () => {
  assert.match(html, /Церква Пресвятої Богородиці/);
  assert.match(html, /Крупсько/);
  assert.match(html, /https:\/\/maps\.app\.goo\.gl\/FAu9WcfDyCSB9r2o9/);
  assert.match(html, /Мала Італія/);
  assert.match(html, /Пісочна/);
  assert.match(html, /https:\/\/maps\.app\.goo\.gl\/7JUE349jnhZ2r1sf9/);
  assert.match(html, /rel="noopener"/);
});

test('dress-code section has heading, intro, and PS note', () => {
  assert.match(html, /Дрес-код/);
  assert.match(html, /Ми будемо дуже вдячні, якщо ви оберете вбрання у кольорах нашого весілля/);
  assert.match(html, /Замість квітів будемо раді пляшечці алкоголю з підписом, на яку подію нам її відкоркувати/);
});

test('rsvp section has heading, deadline text, and form controls', () => {
  assert.match(html, /Анкета гостя/);
  assert.match(html, /10\.08\.2026/);
  assert.match(html, /id="rsvp-form"/);
  assert.match(html, /id="rsvp-name"/);
  assert.match(html, /id="rsvp-attending-yes"/);
  assert.match(html, /id="rsvp-attending-no"/);
  assert.match(html, /id="rsvp-honeypot"/);
});

test('nav is just the centered title, no menu links or burger toggle', () => {
  assert.match(html, /id="nav"[^>]*>\s*<a[^>]*data-scroll-target="hero"/);
  assert.doesNotMatch(html, /id="nav-toggle"/);
  assert.doesNotMatch(html, /id="nav-menu"/);
});

test('links css and main.js as a module', () => {
  assert.match(html, /<link[^>]*href="css\/style\.css"/);
  assert.match(html, /<script[^>]*type="module"[^>]*src="js\/main\.js"/);
});
