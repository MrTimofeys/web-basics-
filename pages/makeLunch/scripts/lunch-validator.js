(function () {
  'use strict';

  function getSelection() {
    if (window.orderManager && typeof window.orderManager.getSelectedDishes === 'function') {
      return window.orderManager.getSelectedDishes();
    }
    return { soup: null, main: null, salad: null, drink: null, dessert: null };
  }

  const hasSoup    = sel => !!sel.soup;
  const hasMain    = sel => !!sel.main;
  const hasSalad   = sel => !!sel.salad;
  const hasDrink   = sel => !!sel.drink;
  const hasDessert = sel => !!sel.dessert;

  // Допустимы комбо:
  // 1) S + M + A + D
  // 2) S + M + D
  // 3) S + A + D
  // 4) M + A + D
  // 5) M + D
  function isValidCombo(sel) {
    const S = hasSoup(sel), M = hasMain(sel), A = hasSalad(sel), D = hasDrink(sel);
    return (S && M && A && D)
        || (S && M && D)
        || (S && A && D)
        || (M && A && D)
        || (M && D);
  }

  function hasPreComboWithoutDrink(sel) {
    const S = hasSoup(sel), M = hasMain(sel), A = hasSalad(sel), D = hasDrink(sel);
    if (D) return false;
    return (S && M && A) || (S && M) || (S && A) || (M && A) || M;
  }

  function pickNotice(sel) {
    const S = hasSoup(sel), M = hasMain(sel), A = hasSalad(sel), D = hasDrink(sel);
    const anySelected = S || M || A || D || hasDessert(sel);

    if (!anySelected) {
      return 'Ничего не выбрано. Выберите блюда для заказа';
    }
    if (hasPreComboWithoutDrink(sel)) {
      return 'Выберите напиток';
    }
    if (S && !M && !A) {
      return 'Выберите главное блюдо/салат/стартер';
    }
    if (A && !S && !M) {
      return 'Выберите суп или главное блюдо';
    }
    if (!S && !M && !A && (D || hasDessert(sel))) {
      return 'Выберите главное блюдо';
    }
    return 'Проверьте выбранные блюда';
  }

  function showNotice(message) {
    const backdrop = document.createElement('div');
    backdrop.className = 'notify-backdrop';
    backdrop.innerHTML = `
      <div class="notify" role="dialog" aria-live="assertive" aria-modal="true">
        <p>${message}</p>
        <button type="button" class="notify-ok">Окей 👌</button>
      </div>
    `;
    document.body.appendChild(backdrop);

    const close = () => backdrop.remove();

    backdrop.querySelector('.notify-ok')?.addEventListener('click', close, { once: true });
    backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });
    function onKey(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); } }
    document.addEventListener('keydown', onKey);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form[action="https://httpbin.org/post"]') || document.querySelector('form');
    if (!form) return;

    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
      }
    });

    form.addEventListener('submit', (e) => {
      const sel = getSelection();

      if (isValidCombo(sel)) {
        return;
      }

      e.preventDefault();
      showNotice(pickNotice(sel));
    });
  });
})();
