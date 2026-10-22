// FAQ page: search box and business filter over the questions the server put in the page.
(() => {
  const search = document.querySelector('[data-faq-search]');
  const empty = document.querySelector('[data-faq-empty]');
  const groups = [...document.querySelectorAll('[data-faq-group]')];
  if (!search || !groups.length) return;
  let business = '';
  const normalize = value => value.toLowerCase().replace(/\s+/g, ' ').trim();
  const apply = () => {
    const words = normalize(search.value).split(' ').filter(Boolean);
    let shown = 0;
    for (const group of groups) {
      let groupShown = 0;
      const inBusiness = !business || group.dataset.faqGroup === business;
      for (const item of group.querySelectorAll('[data-faq-item]')) {
        const text = normalize(item.textContent);
        const match = inBusiness && words.every(word => text.includes(word));
        item.hidden = !match;
        if (match) groupShown += 1;
        if (match && words.length) item.open = true;
      }
      group.hidden = !groupShown;
      shown += groupShown;
    }
    empty.hidden = shown > 0;
  };
  search.addEventListener('input', apply);
  document.querySelectorAll('[data-faq-filter]').forEach(button => button.addEventListener('click', () => {
    business = button.dataset.faqFilter;
    document.querySelectorAll('[data-faq-filter]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    apply();
  }));
  // A link to one question (cannyheads.com/faq#candidate-free) opens it.
  const openLinked = () => {
    const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target && target.matches('[data-faq-item]')) { target.open = true; target.scrollIntoView(); }
  };
  openLinked();
  addEventListener('hashchange', openLinked);
})();
