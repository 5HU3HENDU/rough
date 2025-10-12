document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const mainContainer = document.querySelector('.main-container');
    const infoCard = document.getElementById('info-card');
    const infoCardContent = document.getElementById('info-card-content');
    const closeCardBtn = document.getElementById('close-card-btn');

    // --- State ---
    let fullData = null;

    // --- Main Initializer ---
    async function init() {
        try {
            const response = await fetch('../database.yml');
            const yamlText = await response.text();
            fullData = jsyaml.load(yamlText);
            renderCategoryColumn(fullData.categories);
        } catch (error) {
            console.error("Error loading or parsing database.yml:", error);
            mainContainer.innerHTML = '<p style="padding: 20px; color: red;">Failed to load content.</p>';
        }
    }

    // --- Column Rendering Functions ---
    function renderCategoryColumn(categories) {
        const column = createColumn('Categories');
        categories.forEach(category => {
            const item = createItem(category);
            item.style.borderLeftColor = category.color;
            item.addEventListener('click', () => {
                // Remove all columns after this one
                removeColumns(1);
                // De-select other items in this column
                column.querySelectorAll('.item').forEach(el => el.classList.remove('active'));
                // Select the current item
                item.classList.add('active');
                renderSubCategoryColumn(category.subCategories, category.title);
            });
            column.appendChild(item);
        });
        mainContainer.appendChild(column);
    }

    function renderSubCategoryColumn(subCategories, parentTitle) {
        const column = createColumn(parentTitle);
        subCategories.forEach(subCategory => {
            const item = createItem(subCategory);
            item.addEventListener('click', () => {
                column.querySelectorAll('.item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                showInfoCard(subCategory);
            });
            column.appendChild(item);
        });
        mainContainer.appendChild(column);
    }

    // --- UI Helpers ---
    function createColumn(title) {
        const column = document.createElement('div');
        column.className = 'column';
        const columnTitle = document.createElement('h3');
        columnTitle.className = 'column-title';
        columnTitle.textContent = title;
        column.appendChild(columnTitle);
        return column;
    }

    function createItem(data) {
        const item = document.createElement('div');
        item.className = 'item';
        item.innerHTML = `<h4><span class="icon">${data.icon || ''}</span>${data.title}</h4>`;
        return item;
    }

    function removeColumns(fromIndex) {
        const allColumns = mainContainer.querySelectorAll('.column');
        for (let i = fromIndex; i < allColumns.length; i++) {
            allColumns[i].remove();
        }
    }
    
    function showInfoCard(subCategory) {
        let websitesHtml = subCategory.websites.map(site => `<li><strong><a href="${site.url}" target="_blank">${site.name}</a></strong>: ${site.description}</li>`).join('');
        let todoHtml = subCategory.todo.map(item => `<li>${item}</li>`).join('');
        let avoidHtml = subCategory.avoid.map(item => `<li>${item}</li>`).join('');
        
        infoCardContent.innerHTML = `
            <h2>${subCategory.icon || ''} ${subCategory.title}</h2>
            <p>${subCategory.summary}</p>
            <h3>🔗 Websites & Tools</h3><ul>${websitesHtml}</ul>
            <h3>✅ Things to Do</h3><ul>${todoHtml}</ul>
            <h3>❌ Things to Avoid</h3><ul>${avoidHtml}</ul>`;
        
        infoCard.classList.remove('hidden');
    }

    // --- Event Listeners ---
    closeCardBtn.addEventListener('click', () => infoCard.classList.add('hidden'));

    // --- Kick things off ---
    init();
});
