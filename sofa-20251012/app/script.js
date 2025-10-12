document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    const infoCard = document.getElementById('info-card');
    const infoCardContent = document.getElementById('info-card-content');
    const closeCardBtn = document.getElementById('close-card-btn');
    const backBtn = document.getElementById('back-btn');

    let fullData = null;

    // Main function to start the application
    async function init() {
        try {
            const response = await fetch('../database.yml');
            const yamlText = await response.text();
            fullData = jsyaml.load(yamlText);
            renderPlanets();
        } catch (error) {
            console.error("Error loading or parsing database.yml:", error);
            app.innerHTML = '<p style="color: red;">Failed to load content.</p>';
        }
    }

    // Renders the main category "planets"
    function renderPlanets() {
        app.innerHTML = ''; // Clear previous state
        fullData.categories.forEach(category => {
            const planet = document.createElement('div');
            planet.className = 'planet';
            planet.textContent = category.title;
            planet.style.backgroundColor = category.color;
            planet.dataset.categoryId = category.id;
            planet.addEventListener('click', () => handlePlanetClick(category));
            app.appendChild(planet);
        });
    }

    // Handles clicking on a "planet" (category)
    function handlePlanetClick(category) {
        app.classList.add('zoomed-in');
        backBtn.classList.remove('hidden');

        document.querySelectorAll('.planet').forEach(p => {
            if (p.dataset.categoryId === category.id) {
                p.classList.add('active');
            }
        });
        
        renderMoons(category.subCategories);
    }

    // Renders the sub-category "moons" for the active planet
    function renderMoons(subCategories) {
        const angleStep = 360 / subCategories.length;
        const radius = Math.min(window.innerWidth, window.innerHeight) / 3.5;

        subCategories.forEach((subCategory, index) => {
            const angle = (angleStep * index) * (Math.PI / 180); // Convert to radians
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            const moon = document.createElement('div');
            moon.className = 'moon';
            moon.textContent = subCategory.title;
            moon.style.transform = `translate(${x}px, ${y}px)`;
            moon.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent planet click from firing again
                handleMoonClick(subCategory);
            });
            app.appendChild(moon);
        });
    }

    // Handles clicking on a "moon" (sub-category)
    function handleMoonClick(subCategory) {
        let websitesHtml = subCategory.websites.map(site => `<li><strong><a href="${site.url}" target="_blank">${site.name}</a></strong>: ${site.description}</li>`).join('');
        let todoHtml = subCategory.todo.map(item => `<li>${item}</li>`).join('');
        let avoidHtml = subCategory.avoid.map(item => `<li>${item}</li>`).join('');

        infoCardContent.innerHTML = `
            <h2>${subCategory.icon} ${subCategory.title}</h2>
            <p>${subCategory.summary}</p>
            <h3>🔗 Websites & Tools</h3>
            <ul>${websitesHtml}</ul>
            <h3>✅ Things to Do</h3>
            <ul class="todo-list">${todoHtml}</ul>
            <h3>❌ Things to Avoid</h3>
            <ul class="avoid-list">${avoidHtml}</ul>
        `;
        infoCard.classList.remove('hidden');
    }

    // Function to reset the view back to the planets
    function resetView() {
        app.classList.remove('zoomed-in');
        backBtn.classList.add('hidden');
        infoCard.classList.add('hidden');

        document.querySelectorAll('.planet.active').forEach(p => p.classList.remove('active'));
        
        // Remove moons after transition ends for a smoother effect
        setTimeout(() => {
            document.querySelectorAll('.moon').forEach(m => m.remove());
        }, 500); // Should match transition time
    }

    // Event listeners for closing/resetting
    closeCardBtn.addEventListener('click', () => infoCard.classList.add('hidden'));
    backBtn.addEventListener('click', resetView);

    // Initialize the app
    init();
});
