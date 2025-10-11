class OrderManager {
    constructor() {
        this.selectedDishes = {
            soup: null,
            main: null,
            drink: null
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateOrderDisplay();
    }
    
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.dish-item')) {
                const dishItem = e.target.closest('.dish-item');
                const dishKeyword = dishItem.getAttribute('data-dish');
                this.selectDish(dishKeyword);
            }
        });
    }
    
    selectDish(dishKeyword) {
        const dish = dishes.find(d => d.keyword === dishKeyword);
        if (!dish) return;
        
        this.selectedDishes[dish.category] = dish;
        
        this.updateOrderDisplay();
    }
    
    updateOrderDisplay() {
        this.updateOrderSummary();
        this.updateTotalPrice();
        this.updateFormSelects();
    }
    
    updateOrderSummary() {
        const orderContainer = document.querySelector('.client_order');
        let orderHTML = '<h3>Ваш заказ</h3>';
        
        const hasSelectedDishes = Object.values(this.selectedDishes).some(dish => dish !== null);
        
        if (!hasSelectedDishes) {
            orderHTML += '<p>Ничего не выбрано</p>';
        } else {
            orderHTML += '<div class="order-category">';
            orderHTML += '<strong>Суп</strong><br>';
            if (this.selectedDishes.soup) {
                orderHTML += `${this.selectedDishes.soup.name} ${this.selectedDishes.soup.price}Р`;
            } else {
                orderHTML += 'Блюдо не выбрано';
            }
            orderHTML += '</div>';
            
            orderHTML += '<div class="order-category">';
            orderHTML += '<strong>Главное блюдо</strong><br>';
            if (this.selectedDishes.main) {
                orderHTML += `${this.selectedDishes.main.name} ${this.selectedDishes.main.price}Р`;
            } else {
                orderHTML += 'Блюдо не выбрано';
            }
            orderHTML += '</div>';
            
            orderHTML += '<div class="order-category">';
            orderHTML += '<strong>Напиток</strong><br>';
            if (this.selectedDishes.drink) {
                orderHTML += `${this.selectedDishes.drink.name} ${this.selectedDishes.drink.price}Р`;
            } else {
                orderHTML += 'Напиток не выбран';
            }
            orderHTML += '</div>';
        }
        
        orderContainer.innerHTML = orderHTML;
    }
    
    updateTotalPrice() {
        let total = 0;
        Object.values(this.selectedDishes).forEach(dish => {
            if (dish) {
                total += dish.price;
            }
        });
        
        const hasSelectedDishes = Object.values(this.selectedDishes).some(dish => dish !== null);
        
        let totalElement = document.querySelector('.order-total');
        const orderContainer = document.querySelector('.client_order');
        
        if (hasSelectedDishes) {
            if (!totalElement) {
                totalElement = document.createElement('div');
                totalElement.className = 'order-total';
                orderContainer.appendChild(totalElement);
            }
            totalElement.innerHTML = `<strong>Стоимость заказа</strong><br>${total}Р`;
            totalElement.style.display = 'block';
        } else if (totalElement) {
            totalElement.style.display = 'none';
        }
    }
    
    updateFormSelects() {
        
        const soupSelect = document.getElementById('soup_select');
        const mainSelect = document.getElementById('main_dish_select');
        const drinkSelect = document.getElementById('drink_select');
        
        if (soupSelect && this.selectedDishes.soup) {
            soupSelect.value = this.selectedDishes.soup.keyword;
        }
        
        if (mainSelect && this.selectedDishes.main) {
            mainSelect.value = this.selectedDishes.main.keyword;
        }
        
        if (drinkSelect && this.selectedDishes.drink) {
            drinkSelect.value = this.selectedDishes.drink.keyword;
        }
    }
    
    getSelectedDishes() {
        return this.selectedDishes;
    }
    
    getTotalPrice() {
        let total = 0;
        Object.values(this.selectedDishes).forEach(dish => {
            if (dish) {
                total += dish.price;
            }
        });
        return total;
    }
}

let orderManager;

document.addEventListener('DOMContentLoaded', () => {
    orderManager = new OrderManager();
});