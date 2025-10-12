document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const container = document.getElementById('mindmap-container');
    const titleDisplay = document.getElementById('title-display');
    const backBtn = document.getElementById('back-btn');
    const infoCard = document.getElementById('info-card');
    const infoCardContent = document.getElementById('info-card-content');
    const closeCardBtn = document.getElementById('close-card-btn');

    // --- State ---
    let fullData = null;
    let activeCategory = null;

    // --- Main Initializer ---
    async function init() {
        try {
            const response = await fetch('../database.yml');
            const yamlText = await response.text();
            fullData = jsyaml.load(yamlText);
            displayCategories();
        } catch (error) {
            console.error("Error loading database.yml:", error);
            container.innerHTML = '<p>Error loading content.</p>';
        }
    }

    // --- Core Display Functions ---

    function displayCategories() {
        container.innerHTML = ''; // Clear the container
        activeCategory = null;
        titleDisplay.textContent = 'School of Adults';
        backBtn.classList.add('hidden');

        const categories = fullData.categories;
        const radius = Math.min(container.clientWidth, container.clientHeight) * 0.35;
        const angleStep = (2 * Math.PI) / categories.length;
        
        categories.forEach((category, i) => {
            const angle = angleStep * i;
            const x = container.clientWidth / 2 + radius * Math.cos(angle);
            const y = container.clientHeight / 2 + radius * Math.sin(angle);
            
            const node = createNode(category, 'category');
            setPosition(node, x, y);
            node.addEventListener('click', () => displaySubCategories(category));
            container.appendChild(node);
        });
    }

    function displaySubCategories(category) {
        activeCategory = category;
        titleDisplay.textContent = category.title;
        backBtn.classList.remove('hidden');

        const allNodes = container.querySelectorAll('.node');
        const radius = Math.min(container.clientWidth, container.clientHeight) * 0.3;
        const angleStep = (2 * Math.PI) / category.subCategories.length;

        // Move all existing category nodes
        allNodes.forEach(node => {
            if (node.dataset.id === category.id) {
                // This is the selected one, move it to the center
                node.className = 'node category center';
                setPosition(node, container.clientWidth / 2, container.clientHeight / 2);
            } else {
                // Hide the others
                node.classList.add('hidden');
            }
        });

        // Create and position the new sub-category nodes
        setTimeout(() => { // Delay to allow main animation to start
            category.subCategories.forEach((sub, i) => {
                const angle = angleStep * i;
                const x = container.clientWidth / 2 + radius * Math.cos(angle);
                const y = container.clientHeight / 2 + radius * Math.sin(angle);

                const node = createNode(sub, 'subcategory');
                // Start them at the center and let CSS transition move them out
                setPosition(node, container.clientWidth / 2, container.clientHeight / 2);
                node.classList.add('hidden'); // Start hidden
                node.addEventListener('click', () => showInfoCard(sub));
                container.appendChild(node);

                // Animate to final position after a tiny delay
                setTimeout(() => {
                    node.classList.remove('hidden');
                    setPosition(node, x, y);
                }, 50);
            });
        }, 150);
    }

    // --- UI Helpers ---

    function createNode(data, type) {
        const node = document.createElement('div');
        node.className = `node ${type}`;
        node.dataset.id = data.id;
        node.textContent = data.title;
        if (data.color) {
            node.style.borderColor = data.color;
            node.style.boxShadow = `0 0 15px -5px ${data.color}`;
        }
        return node;
    }
    
    function setPosition(element, x, y) {
        // Position from center, not top-left corner
        element.style.left = `${x - element.offsetWidth / 2}px`;
        element.style.top = `${y - element.offsetHeight / 2}px`;
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
    backBtn.addEventListener('click', displayCategories);
    closeCardBtn.addEventListener('click', () => infoCard.classList.add('hidden'));
    window.addEventListener('resize', () => {
        // Redraw the current view on resize to adjust positions
        if (activeCategory) {
            // A simplified redraw for sub-category view
            displaySubCategories(activeCategory);
        } else {
            displayCategories();
        }
    });

    // --- Kick things off ---
    init();
});
