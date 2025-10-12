document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const icicleContainer = document.getElementById('icicle-container');
    const infoCardOverlay = document.getElementById('info-card-overlay');
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
            renderIcicleChart();
        } catch (error) {
            console.error("Error loading or parsing database.yml:", error);
            icicleContainer.innerHTML = '<p>Error loading content.</p>';
        }
    }

    // --- Render Functions ---
    function renderIcicleChart() {
        icicleContainer.innerHTML = ''; // Clear previous content

        fullData.categories.forEach(category => {
            // 1. Create the main block for the category
            const categoryBlock = document.createElement('div');
            categoryBlock.className = 'category-block';

            // 2. Create the clickable header
            const header = document.createElement('div');
            header.className = 'category-header';
            header.textContent = category.title;
            header.style.borderLeft = `5px solid ${category.color}`;
            header.addEventListener('click', () => {
                categoryBlock.classList.toggle('expanded');
            });

            // 3. Create the container for sub-categories (initially hidden by CSS)
            const subContainer = document.createElement('div');
            subContainer.className = 'sub-category-container';

            // 4. Create and append each sub-category item
            category.subCategories.forEach(sub => {
                const item = document.createElement('div');
                item.className = 'sub-category-item';
                item.innerHTML = `<span class="icon">${sub.icon || ''}</span> ${sub.title}`;
                item.addEventListener('click', () => renderInfoCard(sub));
                subContainer.appendChild(item);
            });

            // 5. Assemble the parts
            categoryBlock.appendChild(header);
            categoryBlock.appendChild(subContainer);
            icicleContainer.appendChild(categoryBlock);
        });
    }

    function renderInfoCard(subCategory) {
        // This function is reused from the Progress Dashboard, without the checkboxes
        let websitesHtml = subCategory.websites.map(site => `<li><strong><a href="${site.url}" target="_blank">${site.name}</a></strong>: ${site.description}</li>`).join('');
        let todoHtml = sub.todo.map(item => `<li>${item}</li>`).join('');
        let avoidHtml = sub.avoid.map(item => `<li>${item}</li>`).join('');

        infoCardContent.innerHTML = `
            <h2>${subCategory.icon || ''} ${subCategory.title}</h2>
            <p>${subCategory.summary}</p>
            <h3>🔗 Websites & Tools</h3><ul>${websitesHtml}</ul>
            <h3>✅ Things to Do</h3><ul>${todoHtml}</ul>
            <h3>❌ Things to Avoid</h3><ul>${avoidHtml}</ul>
        `;
        
        infoCardOverlay.classList.remove('hidden');
    }

    // --- Event Listeners ---
    closeCardBtn.addEventListener('click', () => infoCardOverlay.classList.add('hidden'));
    infoCardOverlay.addEventListener('click', (e) => {
        // Close card if clicking on the background overlay
        if (e.target === infoCardOverlay) {
            infoCardOverlay.classList.add('hidden');
        }
    });

    // --- Kick things off ---
    init();
});
