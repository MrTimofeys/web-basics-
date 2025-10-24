// Глобальные переменные
let dishes = [];
const API_KEY = '715e9eb2-78a4-4f06-a7e5-1c9f751f9fe1'; // Замените на ваш API ключ
const API_URL = 'https://edu.std-900.ist.mospolytech.ru/labs/api/orders';

// ВАЖНО: делаем selectedDishes глобальной переменной
window.selectedDishes = {
    soup: null,
    main: null,
    salad: null,
    drink: null,
    dessert: null
};

// Маппинг категорий
const categoryMapping = {
    'main-course': 'main',
    'main': 'main',
    'soup': 'soup',
    'salad': 'salad',
    'drink': 'drink',
    'dessert': 'dessert'
};

// Загрузка блюд с API
async function loadDishes() {
    try {
        const response = await fetch('https://edu.std-900.ist.mospolytech.ru/labs/api/dishes');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        return data.map(dish => ({
            ...dish,
            category: categoryMapping[dish.category] || dish.category
        }));
    } catch (error) {
        console.error('Ошибка при загрузке блюд:', error);
        return [];
    }
}

// Загрузка выбранных блюд из localStorage
function loadSelectedDishes() {
    try {
        const stored = localStorage.getItem('selectedDishIds');
        console.log('Данные из localStorage:', stored);
        
        if (!stored) return;

        const dishIds = JSON.parse(stored);
        console.log('Распарсенные ID:', dishIds);
        
        Object.keys(dishIds).forEach(category => {
            const dishId = dishIds[category];
            if (dishId !== null) {
                const dish = dishes.find(d => d.id === dishId);
                console.log(`Категория ${category}, ID ${dishId}, найдено:`, dish);
                if (dish) {
                    window.selectedDishes[category] = dish;
                }
            }
        });
        
        console.log('Итоговый selectedDishes:', window.selectedDishes);
    } catch (error) {
        console.error('Ошибка при загрузке данных из localStorage:', error);
    }
}

// Отображение выбранных блюд
function displayOrderDishes() {
    const grid = document.getElementById('order-dishes-grid');
    const emptyMessage = document.getElementById('empty-order-message');
    
    const selected = Object.values(window.selectedDishes).filter(d => d !== null);
    
    if (selected.length === 0) {
        grid.style.display = 'none';
        emptyMessage.style.display = 'block';
        return;
    }
    
    grid.style.display = 'grid';
    emptyMessage.style.display = 'none';
    grid.innerHTML = '';
    
    selected.forEach(dish => {
        const card = createDishCard(dish);
        grid.appendChild(card);
    });
}

// Создание карточки блюда
function createDishCard(dish) {
    const card = document.createElement('div');
    card.className = 'dish-item';
    card.setAttribute('data-dish', dish.keyword);
    
    card.innerHTML = `
        <img src="${dish.image}" alt="${dish.name}">
        <p class="price">${dish.price}₽</p>
        <p class="name">${dish.name}</p>
        <p class="weight">${dish.count}</p>
        <button class="remove-btn" data-category="${dish.category}">Удалить</button>
    `;
    
    return card;
}

// Обновление формы заказа
function updateOrderSummary() {
    const categoryNames = {
        soup: 'Суп',
        main: 'Главное блюдо',
        salad: 'Салат/стартер',
        drink: 'Напиток',
        dessert: 'Десерт'
    };
    
    const notSelectedText = {
        soup: 'Не выбран',
        main: 'Не выбрано',
        salad: 'Не выбран',
        drink: 'Не выбран',
        dessert: 'Не выбран'
    };
    
    let total = 0;
    
    Object.keys(window.selectedDishes).forEach(category => {
        const dish = window.selectedDishes[category];
        const itemElement = document.querySelector(`.order-item[data-category="${category}"] span`);
        const hiddenInput = document.getElementById(`${category}_id`);
        
        if (dish) {
            itemElement.textContent = `${dish.name} ${dish.price}₽`;
            total += dish.price;
            if (hiddenInput) {
                hiddenInput.value = dish.id;
            }
        } else {
            itemElement.textContent = notSelectedText[category];
            if (hiddenInput) {
                hiddenInput.value = '';
            }
        }
    });
    
    document.getElementById('total-amount').textContent = total;
}

// Удаление блюда из заказа
function removeDish(category) {
    window.selectedDishes[category] = null;
    saveToLocalStorage();
    displayOrderDishes();
    updateOrderSummary();
}

// Сохранение в localStorage
function saveToLocalStorage() {
    const dishIds = {};
    Object.keys(window.selectedDishes).forEach(category => {
        const dish = window.selectedDishes[category];
        dishIds[category] = dish ? dish.id : null;
    });
    localStorage.setItem('selectedDishIds', JSON.stringify(dishIds));
}

// Обработка кликов на кнопку "Удалить"
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-btn')) {
        const category = e.target.getAttribute('data-category');
        removeDish(category);
    }
});

// Обработка кнопки "Сбросить"
document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('Вы уверены, что хотите очистить заказ?')) {
        window.selectedDishes = {
            soup: null,
            main: null,
            salad: null,
            drink: null,
            dessert: null
        };
        saveToLocalStorage();
        displayOrderDishes();
        updateOrderSummary();
        document.getElementById('order-form').reset();
    }
});

// Функция отправки заказа на сервер
async function submitOrder(formData) {
    try {
        // Формируем URL с API ключом
        const url = `${API_URL}?api_key=${API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        // Проверяем статус ответа
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Ошибка при отправке заказа:', error);
        throw error;
    }
}

// Валидация формы перед отправкой
document.getElementById('order-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    console.log('Проверка заказа:', window.selectedDishes);
    
    // Проверка комбо
    if (!window.isValidCombo(window.selectedDishes)) {
        const notice = window.pickNotice(window.selectedDishes);
        console.log('Ошибка валидации:', notice);
        
        if (typeof window.showNotice === 'function') {
            window.showNotice(notice);
        } else {
            alert(notice);
        }
        
        return false;
    }
    
    console.log('Валидация успешна!');
    
    try {
        // Собираем данные формы
        const form = e.target;
        const formData = new FormData(form);
        
        // Получаем данные из формы
        const fullName = formData.get('name');
        const email = formData.get('email');
        const subscribe = formData.get('getInfo') ? 1 : 0;
        const phone = formData.get('phoneNumber');
        const deliveryAddress = formData.get('address');
        const deliveryType = formData.get('delivery_time'); // Теперь будет "now" или "by_time"
        const deliveryTime = formData.get('delivery_time_input');
        const comment = formData.get('comments') || '';
        
        // Создаём новый FormData с правильными именами полей
        const apiFormData = new FormData();
        apiFormData.append('full_name', fullName);
        apiFormData.append('email', email);
        apiFormData.append('subscribe', subscribe);
        apiFormData.append('phone', phone);
        apiFormData.append('delivery_address', deliveryAddress);
        apiFormData.append('delivery_type', deliveryType);
        
        // Добавляем delivery_time только если выбрано "К указанному времени"
        if (deliveryType === 'by_time' && deliveryTime) {
            apiFormData.append('delivery_time', deliveryTime);
        }
        
        if (comment) {
            apiFormData.append('comment', comment);
        }
        
        // Добавляем ID блюд
        if (window.selectedDishes.soup) {
            apiFormData.append('soup_id', window.selectedDishes.soup.id);
        }
        if (window.selectedDishes.main) {
            apiFormData.append('main_course_id', window.selectedDishes.main.id);
        }
        if (window.selectedDishes.salad) {
            apiFormData.append('salad_id', window.selectedDishes.salad.id);
        }
        if (window.selectedDishes.drink) {
            apiFormData.append('drink_id', window.selectedDishes.drink.id);
        }
        if (window.selectedDishes.dessert) {
            apiFormData.append('dessert_id', window.selectedDishes.dessert.id);
        }
        
        // Логируем данные для отладки
        console.log('Отправляемые данные:');
        for (let [key, value] of apiFormData.entries()) {
            console.log(`${key}: ${value}`);
        }
        
        // Отправляем заказ
        const result = await submitOrder(apiFormData);
        
        console.log('Заказ успешно отправлен:', result);
        
        // Очищаем localStorage только после успешной отправки
        localStorage.removeItem('selectedDishIds');
        
        // Показываем уведомление об успехе
        if (typeof window.showNotice === 'function') {
            window.showNotice('Заказ успешно оформлен! Номер заказа: ' + result.id);
        } else {
            alert('Заказ успешно оформлен! Номер заказа: ' + result.id);
        }
        
        // Перенаправляем на главную через 2 секунды
        setTimeout(() => {
            window.location.href = '../../index.html';
        }, 2000);
        
    } catch (error) {
        console.error('Ошибка при оформлении заказа:', error);
        
        // Показываем уведомление об ошибке
        const errorMessage = error.message || 'Произошла ошибка при оформлении заказа. Попробуйте снова.';
        
        if (typeof window.showNotice === 'function') {
            window.showNotice('Ошибка: ' + errorMessage);
        } else {
            alert('Ошибка: ' + errorMessage);
        }
    }
});

// Инициализация страницы
async function init() {
    dishes = await loadDishes();
    loadSelectedDishes();
    displayOrderDishes();
    updateOrderSummary();
}

document.addEventListener('DOMContentLoaded', init);
