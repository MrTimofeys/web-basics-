const API_KEY = '715e9eb2-78a4-4f06-a7e5-1c9f751f9fe1';
const API_URL = 'https://edu.std-900.ist.mospolytech.ru/labs/api';

let orders = [];
let dishes = [];

async function loadDishes() {
    try {
        const response = await fetch(`${API_URL}/dishes`);
        if (!response.ok) throw new Error('Ошибка загрузки блюд');
        dishes = await response.json();
    } catch (error) {
        console.error('Ошибка при загрузке блюд:', error);
    }
}

async function loadOrders() {
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    const ordersContainer = document.getElementById('orders-container');
    
    try {
        loading.style.display = 'block';
        errorMessage.classList.add('hidden');
        
        const response = await fetch(`${API_URL}/orders?api_key=${API_KEY}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка загрузки заказов');
        }
        
        orders = await response.json();
        
        orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        loading.style.display = 'none';
        displayOrders();
        
    } catch (error) {
        console.error('Ошибка при загрузке заказов:', error);
        loading.style.display = 'none';
        errorMessage.textContent = error.message;
        errorMessage.classList.remove('hidden');
        ordersContainer.style.display = 'none';
    }
}

function displayOrders() {
    const tbody = document.getElementById('orders-tbody');
    tbody.innerHTML = '';
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-message">У вас пока нет заказов</td></tr>';
        return;
    }
    
    orders.forEach((order, index) => {
        const row = createOrderRow(order, index + 1);
        tbody.appendChild(row);
    });
}

function createOrderRow(order, number) {
    const tr = document.createElement('tr');
    
    const createdAt = formatDateTime(order.created_at);
    
    const dishNames = getOrderDishNames(order);
    
    const cost = calculateOrderCost(order);
    
    const deliveryTime = formatDeliveryTime(order);
    
    tr.innerHTML = `
        <td>${number}</td>
        <td>${createdAt}</td>
        <td class="dishes-cell">${dishNames}</td>
        <td>${cost}₽</td>
        <td>${deliveryTime}</td>
        <td class="actions-cell">
            <button class="icon-btn" onclick="viewOrder(${order.id})" title="Подробнее">
                <i class="bi bi-eye"></i>
            </button>
            <button class="icon-btn" onclick="editOrder(${order.id})" title="Редактировать">
                <i class="bi bi-pencil"></i>
            </button>
            <button class="icon-btn" onclick="deleteOrder(${order.id})" title="Удалить">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;
    
    return tr;
}

function getOrderDishNames(order) {
    const dishIds = [
        order.soup_id,
        order.main_course_id,
        order.salad_id,
        order.drink_id,
        order.dessert_id
    ].filter(id => id !== null);
    
    const names = dishIds.map(id => {
        const dish = dishes.find(d => d.id === id);
        return dish ? dish.name : 'Неизвестное блюдо';
    });
    
    return names.join(', ');
}

function calculateOrderCost(order) {
    const dishIds = [
        order.soup_id,
        order.main_course_id,
        order.salad_id,
        order.drink_id,
        order.dessert_id
    ].filter(id => id !== null);
    
    return dishIds.reduce((sum, id) => {
        const dish = dishes.find(d => d.id === id);
        return sum + (dish ? dish.price : 0);
    }, 0);
}

function formatDateTime(dateTimeStr) {
    const date = new Date(dateTimeStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

function formatDeliveryTime(order) {
    if (order.delivery_type === 'by_time' && order.delivery_time) {
        return order.delivery_time;
    }
    return 'Как можно скорее (с 07:00 до 23:00)';
}

function viewOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    document.getElementById('view-created-at').textContent = formatDateTime(order.created_at);
    document.getElementById('view-full-name').textContent = order.full_name;
    document.getElementById('view-address').textContent = order.delivery_address;
    document.getElementById('view-delivery-time').textContent = formatDeliveryTime(order);
    document.getElementById('view-phone').textContent = order.phone;
    document.getElementById('view-email').textContent = order.email;
    document.getElementById('view-comment').textContent = order.comment || '';
    document.getElementById('view-cost').textContent = `${calculateOrderCost(order)}₽`;
    
    const dishesHtml = getOrderDishesHtml(order);
    document.getElementById('view-dishes').innerHTML = dishesHtml;
    
    openModal('view-modal');
}

function getOrderDishesHtml(order) {
    const categoryNames = {
        soup_id: 'Основное блюдо',
        main_course_id: 'Жареная картошка с грибами',
        salad_id: 'Салат',
        drink_id: 'Напиток',
        dessert_id: 'Десерт'
    };
    
    const dishMapping = {
        soup_id: order.soup_id,
        main_course_id: order.main_course_id,
        salad_id: order.salad_id,
        drink_id: order.drink_id,
        dessert_id: order.dessert_id
    };
    
    let html = '<ul class="dishes-list">';
    
    for (const [key, dishId] of Object.entries(dishMapping)) {
        if (dishId) {
            const dish = dishes.find(d => d.id === dishId);
            if (dish) {
                html += `<li>${dish.name} (${dish.price}₽)</li>`;
            }
        }
    }
    
    html += '</ul>';
    return html;
}

function editOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    document.getElementById('edit-order-id').value = order.id;
    document.getElementById('edit-full-name').value = order.full_name;
    document.getElementById('edit-email').value = order.email;
    document.getElementById('edit-phone').value = order.phone;
    document.getElementById('edit-address').value = order.delivery_address;
    document.getElementById('edit-comment').value = order.comment || '';
    
    if (order.delivery_type === 'by_time') {
        document.getElementById('edit-delivery-by-time').checked = true;
        document.getElementById('edit-time-group').style.display = 'block';
        document.getElementById('edit-delivery-time').value = order.delivery_time || '';
    } else {
        document.getElementById('edit-delivery-now').checked = true;
        document.getElementById('edit-time-group').style.display = 'none';
    }
    
    openModal('edit-modal');
}

async function saveOrder() {
    const orderId = document.getElementById('edit-order-id').value;
    const form = document.getElementById('edit-form');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const formData = new FormData();
    formData.append('full_name', document.getElementById('edit-full-name').value);
    formData.append('email', document.getElementById('edit-email').value);
    formData.append('phone', document.getElementById('edit-phone').value);
    formData.append('delivery_address', document.getElementById('edit-address').value);
    
    const deliveryType = document.querySelector('input[name="delivery_type"]:checked').value;
    formData.append('delivery_type', deliveryType);
    
    if (deliveryType === 'by_time') {
        const deliveryTime = document.getElementById('edit-delivery-time').value;
        if (deliveryTime) {
            formData.append('delivery_time', deliveryTime);
        }
    }
    
    const comment = document.getElementById('edit-comment').value;
    if (comment) {
        formData.append('comment', comment);
    }
    
    try {
        const response = await fetch(`${API_URL}/orders/${orderId}?api_key=${API_KEY}`, {
            method: 'PUT',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка при сохранении заказа');
        }
        
        closeModal('edit-modal');
        showNotification('Заказ успешно изменён', 'success');
        await loadOrders();
        
    } catch (error) {
        console.error('Ошибка при сохранении заказа:', error);
        showNotification('Ошибка: ' + error.message, 'error');
    }
}

function deleteOrder(orderId) {
    document.getElementById('delete-order-id').value = orderId;
    openModal('delete-modal');
}

async function confirmDelete() {
    const orderId = document.getElementById('delete-order-id').value;
    
    try {
        const response = await fetch(`${API_URL}/orders/${orderId}?api_key=${API_KEY}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка при удалении заказа');
        }
        
        closeModal('delete-modal');
        showNotification('Заказ успешно удалён', 'success');
        await loadOrders();
        
    } catch (error) {
        console.error('Ошибка при удалении заказа:', error);
        showNotification('Ошибка: ' + error.message, 'error');
    }
}

function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
    document.body.style.overflow = '';
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    const deliveryRadios = document.querySelectorAll('input[name="delivery_type"]');
    deliveryRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const timeGroup = document.getElementById('edit-time-group');
            if (e.target.value === 'by_time') {
                timeGroup.style.display = 'block';
            } else {
                timeGroup.style.display = 'none';
            }
        });
    });
    
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.add('hidden');
            document.body.style.overflow = '';
        }
    });
    
    init();
});

async function init() {
    await loadDishes();
    await loadOrders();
}
