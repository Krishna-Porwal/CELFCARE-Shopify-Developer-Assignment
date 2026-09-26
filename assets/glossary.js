document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('[data-glossary-search]');
  const filterButtons = document.querySelectorAll('[data-filter]');
  const cards = document.querySelectorAll('.glossary-card');

  if (!searchInput || !cards.length) return;

  let currentFilter = 'all';

  const applyFilters = () => {
    const query = searchInput.value.trim().toLowerCase();

    cards.forEach((card) => {
      const name = (card.dataset.name || '').toLowerCase();
      const functionName = (card.dataset.function || '').toLowerCase();
      const textMatch = name.includes(query) || functionName.includes(query);
      const functionMatch = currentFilter === 'all' || card.dataset.function === currentFilter;

      const visible = textMatch && functionMatch;
      card.hidden = !visible;
    });
  };

  searchInput.addEventListener('input', applyFilters);

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
      currentFilter = button.dataset.filter || 'all';
      applyFilters();
    });
  });
});
