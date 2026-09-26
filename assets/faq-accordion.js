document.addEventListener('DOMContentLoaded', () => {
  const faqItems = document.querySelectorAll('.faq-accordion__details');

  faqItems.forEach((item) => {
    const summary = item.querySelector('summary');
    if (!summary) return;

    summary.setAttribute('role', 'button');
    summary.setAttribute('aria-expanded', item.hasAttribute('open') ? 'true' : 'false');

    summary.addEventListener('click', (event) => {
      const nextOpenState = !item.hasAttribute('open');
      item.open = nextOpenState;
      summary.setAttribute('aria-expanded', nextOpenState ? 'true' : 'false');
    });

    item.addEventListener('toggle', () => {
      summary.setAttribute('aria-expanded', item.hasAttribute('open') ? 'true' : 'false');
    });

    summary.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const nextItem = item.nextElementSibling?.querySelector('summary');
        nextItem?.focus();
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        const previousItem = item.previousElementSibling?.querySelector('summary');
        previousItem?.focus();
      }
    });
  });
});
