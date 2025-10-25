class OrderManager {
    constructor() {
        this.selectedDishes = {
            soup: null,
            main: null,
            salad: null,
            drink: null,
            dessert: null
        };
        this.loadFromLocalStorage();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateOrderDisplay();
        this.restoreSelectedDishesUI();
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            const item = e.target.closest('.dish-item');
            if (!item) return;
            
            const key = item.getAttribute('data-dish');
            const dish = dishes.find(d => d.keyword === key);
            if (!dish) return;
            
            let category = dish.category;
            if (category === 'main-course') {
                category = 'main';
            }
            
            this.selectedDishes[category] = dish;
            this.saveToLocalStorage();
            this.updateOrderDisplay();
            this.updateSelectedDishesUI();
        });
    }

    saveToLocalStorage() {
        const dishIds = {};
        Object.keys(this.selectedDishes).forEach(category => {
            const dish = this.selectedDishes[category];
            dishIds[category] = dish ? dish.id : null;
        });
        localStorage.setItem('selectedDishIds', JSON.stringify(dishIds));
    }

    loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem('selectedDishIds');
            if (!stored) return;

            const dishIds = JSON.parse(stored);
            
            const restoreSelection = () => {
                Object.keys(dishIds).forEach(category => {
                    const dishId = dishIds[category];
                    if (dishId !== null) {
                        const dish = dishes.find(d => d.id === dishId);
                        if (dish) {
                            this.selectedDishes[category] = dish;
                        }
                    }
                });
                this.updateOrderDisplay();
                this.updateSelectedDishesUI();
            };

            if (dishes && dishes.length > 0) {
                restoreSelection();
            } else {
                window.addEventListener('dishesLoaded', restoreSelection, { once: true });
            }
        } catch (error) {
            console.error('Ошибка при загрузке данных из localStorage:', error);
        }
    }

    updateSelectedDishesUI() {
        document.querySelectorAll('.dish-item').forEach(item => {
            item.classList.remove('selected');
        });

        Object.values(this.selectedDishes).forEach(dish => {
            if (dish) {
                const dishElement = document.querySelector(`.dish-item[data-dish="${dish.keyword}"]`);
                if (dishElement) {
                    dishElement.classList.add('selected');
                }
            }
        });
    }

    restoreSelectedDishesUI() {
        setTimeout(() => {
            this.updateSelectedDishesUI();
        }, 100);
    }

    clearSelection() {
        this.selectedDishes = {
            soup: null,
            main: null,
            salad: null,
            drink: null,
            dessert: null
        };
        this.saveToLocalStorage();
        this.updateOrderDisplay();
        this.updateSelectedDishesUI();
    }

    getSelectedDishes() {
        return { ...this.selectedDishes };
    }

    updateOrderDisplay() {
        this.updateStickyPanel();
    }

    updateStickyPanel() {
        const panel = document.getElementById('order-summary-panel');
        const priceElement = document.getElementById('sticky-total-price');
        const proceedBtn = document.getElementById('proceed-to-order-btn');
        
        if (!panel || !priceElement || !proceedBtn) return;

        const total = Object.values(this.selectedDishes)
            .filter(d => d !== null)
            .reduce((sum, d) => sum + d.price, 0);

        const hasAnyDish = Object.values(this.selectedDishes).some(d => d !== null);

        if (hasAnyDish) {
            panel.style.display = 'block';
            priceElement.textContent = `${total}₽`;
        } else {
            panel.style.display = 'none';
        }

        const isValid = typeof window.isValidCombo === 'function' 
            ? window.isValidCombo(this.selectedDishes) 
            : false;

        if (isValid) {
            proceedBtn.classList.remove('disabled');
        } else {
            proceedBtn.classList.add('disabled');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.orderManager = new OrderManager();
});
