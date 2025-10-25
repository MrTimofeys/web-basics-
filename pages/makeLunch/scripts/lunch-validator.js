(function () {
  "use strict";

  function getSelection() {
    if (window.selectedDishes) {
      return window.selectedDishes;
    }
    if (
      window.orderManager &&
      typeof window.orderManager.getSelectedDishes === "function"
    ) {
      return window.orderManager.getSelectedDishes();
    }
    return { soup: null, main: null, salad: null, drink: null, dessert: null };
  }

  const hasSoup = (sel) => !!sel.soup;
  const hasMain = (sel) => !!sel.main;
  const hasSalad = (sel) => !!sel.salad;
  const hasDrink = (sel) => !!sel.drink;
  const hasDessert = (sel) => !!sel.dessert;

  function isValidCombo(sel) {
    const S = hasSoup(sel),
      M = hasMain(sel),
      A = hasSalad(sel),
      D = hasDrink(sel);
    return (
      (S && M && A && D) ||
      (S && M && D) ||
      (S && A && D) ||
      (M && A && D) ||
      (M && D)
    );
  }

  function hasPreComboWithoutDrink(sel) {
    const S = hasSoup(sel),
      M = hasMain(sel),
      A = hasSalad(sel),
      D = hasDrink(sel);
    if (D) return false;
    return (S && M && A) || (S && M) || (S && A) || (M && A) || M;
  }

  function pickNotice(sel) {
    const S = hasSoup(sel),
      M = hasMain(sel),
      A = hasSalad(sel),
      D = hasDrink(sel);
    const anySelected = S || M || A || D || hasDessert(sel);

    if (!anySelected) {
      return "Ничего не выбрано. Выберите блюда для заказа";
    }
    if (hasPreComboWithoutDrink(sel)) {
      return "Выберите напиток";
    }
    if (S && !M && !A) {
      return "Выберите главное блюдо или салат/стартер";
    }
    if (A && !S && !M) {
      return "Выберите суп или главное блюдо";
    }
    if (!S && !M && !A && D) {
      return "Выберите главное блюдо";
    }
    return "Состав заказа не соответствует доступным комбо";
  }

  function showNotice(message) {
    // Удаляем предыдущее уведомление, если оно есть
    const existingBackdrop = document.querySelector(".notify-backdrop");
    if (existingBackdrop) {
      existingBackdrop.remove();
    }

    const backdrop = document.createElement("div");
    backdrop.className = "notify-backdrop";
    backdrop.innerHTML = `
        <div class="notify-box">
            <p>${message}</p>
            <button class="notify-close">Окей 👌</button>
        </div>
    `;
    document.body.appendChild(backdrop);

    backdrop.querySelector(".notify-close").addEventListener("click", () => {
      backdrop.remove();
    });

    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        backdrop.remove();
      }
    });

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        backdrop.remove();
        document.removeEventListener("keydown", handleEscape);
      }
    };
    document.addEventListener("keydown", handleEscape);
  }

  function attachFormValidation() {
    const form = document.querySelector("form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      const sel = getSelection();
      if (!isValidCombo(sel)) {
        e.preventDefault();
        const notice = pickNotice(sel);
        showNotice(notice);
      }
    });
  }

  window.isValidCombo = isValidCombo;
  window.pickNotice = pickNotice;
  window.showNotice = showNotice;

  document.addEventListener("DOMContentLoaded", attachFormValidation);
})();
