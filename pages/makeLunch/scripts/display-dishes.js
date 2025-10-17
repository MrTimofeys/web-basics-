const activeFilters = { soup:null, main:null, salad:null, drink:null, dessert:null };

function displayDishes() {
  const byCat = {
    soup:  dishes.filter(d=>d.category==='soup'),
    main:  dishes.filter(d=>d.category==='main'),
    salad: dishes.filter(d=>d.category==='salad'),
    drink: dishes.filter(d=>d.category==='drink'),
    dessert: dishes.filter(d=>d.category==='dessert'),
  };
  Object.keys(CATEGORY_CONFIG).forEach(cat=>{
    renderCategorySection(cat, CATEGORY_CONFIG[cat], byCat[cat]);
  });
}

function renderCategorySection(category, config, list) {
  const formSection = document.querySelector('.form-section');
  let section = document.querySelector(`section.dishes-section[data-cat="${category}"]`);

  if (!section) {
    section = document.createElement('section');
    section.className = 'dishes-section';
    section.setAttribute('data-cat', category);

    const h2 = document.createElement('h2');
    h2.textContent = config.title;
    section.appendChild(h2);

    const filtersBar = document.createElement('div');
    filtersBar.className = 'filters';
    config.filters.forEach(f=>{
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.setAttribute('data-kind', f.dataKind);
      btn.textContent = f.label;
      btn.addEventListener('click', ()=>{
        const current = activeFilters[category];
        const next = (current === f.dataKind) ? null : f.dataKind;
        activeFilters[category] = next;
        filtersBar.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
        if (next) filtersBar.querySelector(`[data-kind="${next}"]`).classList.add('active');
        drawGrid(section, list, category);
      });
      filtersBar.appendChild(btn);
    });
    section.appendChild(filtersBar);

    const grid = document.createElement('div');
    grid.className = 'dishes-grid';
    section.appendChild(grid);

    formSection.parentNode.insertBefore(section, formSection);
  }

  section.querySelector('h2').textContent = config.title;
  const cur = activeFilters[category];
  section.querySelectorAll('.filter-btn').forEach(b=>{
    b.classList.toggle('active', b.getAttribute('data-kind')===cur);
  });

  drawGrid(section, list, category);
}

function drawGrid(section, list, category) {
  const grid = section.querySelector('.dishes-grid');
  grid.innerHTML = '';
  const kind = activeFilters[category];
  const toShow = kind ? list.filter(d=>d.kind===kind) : list;
  toShow.forEach(d=>grid.appendChild(createDishElement(d)));
}

function createDishElement(dish) {
  const box = document.createElement('div');
  box.className = 'dish-item';
  box.setAttribute('data-dish', dish.keyword);
  box.innerHTML = `
    <img src="${dish.image}" alt="${dish.name}">
    <p class="price">${dish.price}₽</p>
    <p class="name">${dish.name}</p>
    <p class="${dish.category==='drink' ? 'volume' : 'weight'}">${dish.count}</p>
    <button>Добавить</button>
  `;
  return box;
}

document.addEventListener('DOMContentLoaded', displayDishes);