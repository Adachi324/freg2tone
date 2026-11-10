import { articles } from './wiki.js';
export const articleById = id => articles.find(a => a.id === id) || articles[0];
export function articleMarkup(article, level = 'h1') {
  return `<p class="eyebrow">${article.category}</p><${level}>${article.title}</${level}><p class="article-summary">${article.summary}</p>${article.body}`;
}
export function presetUrl(article) {
  return '/explore/';
}
export function initWiki() {
  const list = document.querySelector('#article-list'), search = document.querySelector('#search');
  function renderList() {
    const term = search.value.trim().toLowerCase();
    const matches = articles.filter(a => `${a.title} ${a.summary} ${a.category}`.toLowerCase().includes(term));
    list.replaceChildren();
    for (const article of matches) {
      const link = document.createElement('a'); link.href = `#${article.id}`; link.textContent = article.title;
      if (article.id === articleById(location.hash.slice(1)).id) link.setAttribute('aria-current','page');
      list.append(link);
    }
    if (!matches.length) { const empty = document.createElement('p'); empty.textContent = '没有找到相关知识，试试“音阶”或“指板”。'; list.append(empty); }
  }
  function renderArticle() {
    const article = articleById(location.hash.slice(1));
    document.title = `${article.title} · 知识 Wiki`;
    document.querySelector('#article-category').textContent = article.category;
    document.querySelector('#full-article').innerHTML = articleMarkup(article);
    document.querySelector('#wiki-actions').innerHTML = `<a class="primary" href="${presetUrl(article)}">返回自由探索 ↗</a><p>把刚读到的关系，变成可以听见的声音。</p>`;
    renderList();
  }
  search.addEventListener('input',renderList);
  window.addEventListener('hashchange',() => {
    renderArticle();
    const heading = document.querySelector('#full-article h1'); heading.tabIndex = -1; heading.focus();
  });
  renderArticle();
}
export function initPanel(applyPreset) {
  const panel = document.querySelector('#knowledge'), picker = document.querySelector('#article-select');
  let opener;
  const wide = matchMedia('(min-width:1200px)');
  for (const article of articles) picker.add(new Option(article.title,article.id));
  function render(id) {
    const article = articleById(id); picker.value = article.id;
    document.querySelector('#panel-article').innerHTML = articleMarkup(article,'h2');
    const actions = document.querySelector('#panel-actions'); actions.replaceChildren();
    if (false) {
      const button = document.createElement('button'); button.className = 'primary'; button.textContent = '在指板查看';
      button.onclick = () => { applyPreset(article.preset); close(); }; actions.append(button);
    }
    const link = document.createElement('a'); link.href = `/wiki/#${article.id}`; link.textContent = '打开完整文章 ↗'; actions.append(link);
    panel.scrollTop = 0;
  }
  function open(id, trigger) {
    opener = trigger; render(id);
    if (!panel.open) { if (wide.matches) { panel.show(); document.body.classList.add('panel-open'); } else panel.showModal(); }
    document.querySelector('#close-wiki').focus();
  }
  function close() { panel.close(); }
  panel.addEventListener('close',() => { document.body.classList.remove('panel-open'); opener?.focus(); });
  panel.addEventListener('keydown',event => { if (event.key === 'Escape') { event.preventDefault(); close(); } });
  wide.addEventListener('change',() => { if (panel.open) close(); });
  document.querySelector('#close-wiki').onclick = close;
  picker.onchange = () => render(picker.value);
  return {open};
}
