let budgets = JSON.parse(localStorage.getItem('budgets')) || {};
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

const categoryBudgets = document.getElementById('categoryBudgets');

const categories = [
    { name: 'utilities', icon: 'bolt', title: 'Utilities' },
    { name: 'transportation', icon: 'bus', title: 'Transportation' },
    { name: 'entertainment', icon: 'film', title: 'Entertainment' },
    { name: 'healthcare', icon: 'heartbeat', title: 'Healthcare' },
    { name: 'shopping', icon: 'shopping-cart', title: 'Shopping' },
    { name: 'rent', icon: 'home', title: 'Rent' },
    { name: 'food', icon: 'utensils', title: 'Food' },
    { name: 'education', icon: 'graduation-cap', title: 'Education' },
    { name: 'gifts', icon: 'gift', title: 'Gift' },
    { name: 'savings', icon: 'piggy-bank', title: 'Savings' },
    { name: 'other', icon: 'ellipsis-h', title: 'Other' }
];

function updateBudgetDisplay() {
    categoryBudgets.innerHTML = '';
    let totalBudget = 0;
    let totalSpent = 0;

    categories.forEach(category => {
        const budget = budgets[category.name] || 0;
        const spent = expenses.filter(e => e.category === category.name).reduce((sum, e) => sum + e.amount, 0);
        const remaining = budget - spent;
        const percentage = budget > 0 ? (spent / budget) * 100 : 0;

        totalBudget += budget;
        totalSpent += spent;

        const card = document.createElement('div');
        card.className = 'col-md-4 mb-4';
        card.innerHTML = `
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">
                                <i class="category-icon fas fa-${category.icon}"></i>
                                ${category.title}
                            </h5>
                            <h6 class="card-subtitle mb-2 text-body-secondary">Current Budget: ₹${budget.toFixed(2)}</h6>
                            <p class="card-text">Spent: ₹${spent.toFixed(2)} | Remaining: ₹${remaining.toFixed(2)}</p>
                            <div class="progress mb-3">
                                <div class="progress-bar ${getProgressBarColor(percentage)}" role="progressbar" 
                                    style="width: ${percentage}%;" aria-valuenow="${percentage}" 
                                    aria-valuemin="0" aria-valuemax="100">${percentage.toFixed(1)}%</div>
                            </div>
                            <form class="budget-form" data-category="${category.name}">
                                <div class="input-group mb-3">
                                    <span class="input-group-text">₹</span>
                                    <input type="number" class="form-control" name="budget" placeholder="Set budget" min="0" step="0.01" required>
                                    <button class="btn btn-primary" type="submit">Set</button>
                                </div>
                            </form>
                        </div>
                    </div>
                `;
        categoryBudgets.appendChild(card);
    });

    // Update total budget overview
    document.getElementById('totalBudget').textContent = `₹${totalBudget.toFixed(2)}`;
    document.getElementById('totalSpent').textContent = `₹${totalSpent.toFixed(2)}`;
    document.getElementById('remaining').textContent = `₹${(totalBudget - totalSpent).toFixed(2)}`;

    const totalPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const totalProgressBar = document.querySelector('.progress-bar');
    totalProgressBar.style.width = `${totalPercentage}%`;
    totalProgressBar.textContent = `${totalPercentage.toFixed(1)}%`;
    totalProgressBar.className = `progress-bar ${getProgressBarColor(totalPercentage)}`;
}

function getProgressBarColor(percentage) {
    if (percentage < 50) return 'bg-success';
    if (percentage < 75) return 'bg-warning';
    return 'bg-danger';
}

categoryBudgets.addEventListener('submit', function (e) {
    if (e.target.classList.contains('budget-form')) {
        e.preventDefault();
        const category = e.target.dataset.category;
        const budget = parseFloat(e.target.budget.value);

        if (!isNaN(budget)) {
            budgets[category] = budget;
            localStorage.setItem('budgets', JSON.stringify(budgets));
            updateBudgetDisplay();
            e.target.reset();
        }
    }
});

updateBudgetDisplay();