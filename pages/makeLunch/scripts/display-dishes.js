function displayDishes() {
    
    const sortedDishes = [...dishes].sort((a, b) => a.name.localeCompare(b.name));
    
    
    const dishesByCategory = {
        soup: sortedDishes.filter(dish => dish.category === 'soup'),
        main: sortedDishes.filter(dish => dish.category === 'main'),
        drink: sortedDishes.filter(dish => dish.category === 'drink')
    };
    
    displayCategory('soup', 'Выберите суп', dishesByCategory.soup);
    displayCategory('main', 'Выберите главное блюдо', dishesByCategory.main);
    displayCategory('drink', 'Выберите напиток', dishesByCategory.drink);
}

function displayCategory(category, title, dishesList) {

    const sections = document.querySelectorAll('.dishes-section');
    let section;
    
    // Ищем существующую секцию или создаем новую
    for (let i = 0; i < sections.length; i++) {
        if (sections[i].querySelector('h2').textContent === title) {
            section = sections[i];
            break;
        }
    }
    
    if (!section) {
       
        section = document.createElement('section');
        section.className = 'dishes-section';
        
        const heading = document.createElement('h2');
        heading.textContent = title;
        section.appendChild(heading);
        
        const grid = document.createElement('div');
        grid.className = 'dishes-grid';
        section.appendChild(grid);
        
        const formSection = document.querySelector('.form-section');
        formSection.parentNode.insertBefore(section, formSection);
    }
    
    const grid = section.querySelector('.dishes-grid');
    grid.innerHTML = '';
    
    dishesList.forEach(dish => {
        const dishElement = createDishElement(dish);
        grid.appendChild(dishElement);
    });
}

function createDishElement(dish) {
    const dishItem = document.createElement('div');
    dishItem.className = 'dish-item';
    dishItem.setAttribute('data-dish', dish.keyword);
    
    dishItem.innerHTML = `
        <img src="${dish.image}" alt="${dish.name}" />
        <p class="price">${dish.price}₽</p>
        <p class="name">${dish.name}</p>
        <p class="${dish.category === 'drink' ? 'volume' : 'weight'}">${dish.count}</p>
        <button>Добавить</button>
    `;
    
    return dishItem;
}

document.addEventListener('DOMContentLoaded', displayDishes);