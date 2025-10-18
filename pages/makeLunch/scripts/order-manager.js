class OrderManager {
  constructor() {
    this.selectedDishes = { soup:null, main:null, salad:null, drink:null, dessert:null };
    this.init();
  }
  init(){ this.setupEventListeners(); this.updateOrderDisplay(); }

  setupEventListeners(){
    document.addEventListener('click', (e)=>{
      const item = e.target.closest('.dish-item');
      if (!item) return;
      const key = item.getAttribute('data-dish');
      const dish = dishes.find(d=>d.keyword===key);
      if (!dish) return;
      this.selectedDishes[dish.category] = dish;
      this.updateOrderDisplay();
    });
  }

  updateOrderDisplay(){
    this.updateOrderSummary();
    this.updateTotalPrice();
    this.updateFormSelects();
  }

  updateOrderSummary(){
    const box = document.querySelector('.client_order');
    let html = '<h3>Ваш заказ</h3>';

    const any = Object.values(this.selectedDishes).some(Boolean);
    if (!any){ box.innerHTML = html + '<p>Ничего не выбрано</p>'; return; }

    const line = (title, d) => {
      return `<div class="order-category"><strong>${title}</strong><br>${
        d ? `${d.name} ${d.price}Р` : 'Блюдо не выбрано'
      }</div>`;
    };

    html += line('Суп', this.selectedDishes.soup);
    html += line('Главное блюдо', this.selectedDishes.main);
    html += line('Салат/стартер', this.selectedDishes.salad);
    html += line('Напиток', this.selectedDishes.drink);
    html += line('Десерт', this.selectedDishes.dessert);

    box.innerHTML = html;
  }

  updateTotalPrice(){
    const sum = Object.values(this.selectedDishes)
      .reduce((acc, d)=>acc + (d ? d.price : 0), 0);

    const container = document.querySelector('.client_order');
    let totalEl = container.querySelector('.order-total');

    if (sum>0){
      if (!totalEl){
        totalEl = document.createElement('div');
        totalEl.className = 'order-total';
        container.appendChild(totalEl);
      }
      totalEl.innerHTML = `<strong>Стоимость заказа</strong><br>${sum}Р`;
      totalEl.style.display = 'block';
    } else if (totalEl){
      totalEl.style.display = 'none';
    }
  }

  updateFormSelects(){
    const map = {
      soup: document.getElementById('soup_select'),
      main: document.getElementById('main_dish_select'),
      salad: document.getElementById('salad_select'),
      drink: document.getElementById('drink_select'),
      dessert: document.getElementById('dessert_select'),
    };
    Object.entries(map).forEach(([cat, sel])=>{
      if (sel && this.selectedDishes[cat]) sel.value = this.selectedDishes[cat].keyword;
    });
  }

  getSelectedDishes(){ return this.selectedDishes; }
  getTotalPrice(){ return Object.values(this.selectedDishes).reduce((a,d)=>a+(d?d.price:0),0); }
}

document.addEventListener('DOMContentLoaded', () => {
  window.orderManager = new OrderManager();
});
