document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const dashboardContainer = document.getElementById('dashboard-container');
    const infoCardOverlay = document.getElementById('info-card-overlay');
    const infoCardContent = document.getElementById('info-card-content');
    const closeCardBtn = document.getElementById('close-card-btn');

    // --- State ---
    let fullData = null;
    let progressData = {}; // { "sc-1-1": [true, false], ... }

    // --- Main Initializer ---
    async function init() {
        try {
            const response = await fetch('../database.yml');
            const yamlText = await response.text();
            fullData = jsyaml.load(yamlText);
            loadProgress();
            renderDashboard();
        } catch (error) {
            console.error("Error loading data:", error);
            dashboardContainer.innerHTML = '<p>Error loading content.</p>';
        }
    }

    // --- Data & Progress Functions ---
    function loadProgress() {
        const savedProgress = localStorage.getItem('schoolOfAdultsProgress');
        if (savedProgress) {
            progressData = JSON.parse(savedProgress);
        }
    }

    function saveProgress() {
        localStorage.setItem('schoolOfAdultsProgress', JSON.stringify(progressData));
    }

    function getScores() {
        const scores = {};
        fullData.categories.forEach(cat => {
            let totalTasks = 0;
            let completedTasks = 0;

            cat.subCategories.forEach(sub => {
                const subTotal = sub.todo.length;
                const progressArray = progressData[sub.id] || [];
                const subCompleted = progressArray.filter(Boolean).length;
                
                scores[sub.id] = { completed: subCompleted, total: subTotal };
                
                totalTasks += subTotal;
                completedTasks += subCompleted;
            });

            scores[cat.id] = { completed: completedTasks, total: totalTasks };
        });
        return scores;
    }

    // --- Render Functions ---
    function renderDashboard() {
        const scores = getScores();
        dashboardContainer.innerHTML = ''; // Clear existing dashboard

        fullData.categories.forEach(category => {
            const categoryScore = scores[category.id];
            const percentage = categoryScore.total > 0 ? Math.round((categoryScore.completed / categoryScore.total) * 100) : 0;

            const card = document.createElement('div');
            card.className = 'category-card';
            
            // --- Category Header ---
            const header = document.createElement('div');
            header.className = 'category-header';
            header.innerHTML = `
                <div class="category-title">${category.title}</div>
                <div class="category-progress">
                    <div class="progress-ring" style="background: conic-gradient(var(--progress-fill) ${percentage}%, var(--progress-empty) 0deg)">
                        ${percentage}%
                    </div>
                </div>
            `;
            header.addEventListener('click', () => card.classList.toggle('expanded'));
            
            // --- Sub-category List ---
            const subList = document.createElement('div');
            subList.className = 'sub-category-list';
            
            category.subCategories.forEach(sub => {
                const subScore = scores[sub.id];
                const starsHtml = '★'.repeat(subScore.completed) + '☆'.repeat(subScore.total - subScore.completed);

                const item = document.createElement('div');
                item.className = 'sub-category-item';
                item.innerHTML = `
                    <div class="title">${sub.title}</div>
                    <div class="sub-category-score">
                        <div class="stars"><span class="filled">${'★'.repeat(subScore.completed)}</span>${'☆'.repeat(subScore.total - subScore.completed)}</div>
                        <div class="score-text">(${subScore.completed}/${subScore.total})</div>
                    </div>
                `;
                item.addEventListener('click', () => renderInfoCard(sub));
                subList.appendChild(item);
            });

            card.appendChild(header);
            card.appendChild(subList);
            dashboardContainer.appendChild(card);
        });
    }

    function renderInfoCard(subCategory) {
        const currentProgress = progressData[subCategory.id] || [];
        const todoHtml = subCategory.todo.map((task, index) => `
            <li>
                <label>
                    <input type="checkbox" data-sub-id="${subCategory.id}" data-task-index="${index}" ${currentProgress[index] ? 'checked' : ''}>
                    <span>${task}</span>
                </label>
            </li>
        `).join('');

        infoCardContent.innerHTML = `
            <h2>${subCategory.icon || ''} ${subCategory.title}</h2>
            <p>${subCategory.summary}</p>
            <h3>✅ Things to Do</h3>
            <ul class="todo-list">${todoHtml}</ul>
        `;

        // Add event listeners to the new checkboxes
        infoCardContent.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const { subId, taskIndex } = e.target.dataset;
                if (!progressData[subId]) {
                    progressData[subId] = [];
                }
                progressData[subId][parseInt(taskIndex)] = e.target.checked;
                saveProgress();
                renderDashboard(); // Re-render the entire dashboard to update scores
            });
        });

        infoCardOverlay.classList.remove('hidden');
    }

    // --- Event Listeners ---
    closeCardBtn.addEventListener('click', () => infoCardOverlay.classList.add('hidden'));
    infoCardOverlay.addEventListener('click', (e) => {
        if (e.target === infoCardOverlay) {
            infoCardOverlay.classList.add('hidden');
        }
    });

    // --- Kick things off ---
    init();
});
