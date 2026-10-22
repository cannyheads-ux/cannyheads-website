// Jewellery consultation enquiry: builds a WhatsApp message from the form (no data is stored on the site).
document.addEventListener('submit', event => {
  const form = event.target.closest('[data-jc-form]');
  if (!form) return;
  event.preventDefault();
  const f = new FormData(form);
  const text = [
    'Jewellery business consultation enquiry',
    'Name: ' + f.get('name'),
    'Mobile: ' + f.get('mobile'),
    'Showroom / city: ' + f.get('business'),
    'Stage: ' + f.get('stage'),
    f.get('message') ? 'Need: ' + f.get('message') : ''
  ].filter(Boolean).join('\n');
  window.location.href = 'https://wa.me/917200824009?text=' + encodeURIComponent(text);
});
