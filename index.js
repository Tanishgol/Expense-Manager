let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let budgets = JSON.parse(localStorage.getItem('budgets')) || {};
const expenseForm = document.getElementById('expenseForm');
const expenseList = document.getElementById('expenseList');
const ctx = document.getElementById('expenseChart').getContext('2d');
const filterCategory = document.getElementById('filtercategory');
const minAmountInput = document.getElementById('minAmount');
const maxAmountInput = document.getElementById('maxAmount');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
let expenseChart;

function updateExpenseList(filteredExpenses = expenses) {
    expenseList.innerHTML = '';
    filteredExpenses.forEach((expense, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expense.description}</td>
            <td>₹${expense.amount.toFixed(2)}</td>
            <td>${expense.category}</td>
            <td>${new Date(expense.date).toLocaleDateString('en-GB')}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editExpense(${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteExpense(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        expenseList.appendChild(row);
    });
}

function deleteExpense(index) {
    expenses.splice(index, 1);
    saveExpenses();
    updateExpenseList();
    updateChart();
}

function editExpense(index) {
    const expense = expenses[index];
    document.getElementById('description').value = expense.description;
    document.getElementById('amount').value = expense.amount;
    document.getElementById('category').value = expense.category;

    expenses.splice(index, 1);
    saveExpenses();
    updateExpenseList();
    updateChart();
}

function updateChart() {
    const data = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {});

    const chartData = {
        labels: Object.keys(data),
        datasets: [{
            label: 'Expense Amount',
            data: Object.values(data),
            backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                '#FF9F40', '#C9CBCF', '#7BC225', '#FFA07A', '#20B2AA'
            ],
        }]
    };

    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Expense Distribution' },
            },
        },
    });
}

function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

function filterExpenses() {
    const category = filterCategory.value;
    const minAmount = parseFloat(minAmountInput.value) || 0;
    const maxAmount = parseFloat(maxAmountInput.value) || Infinity;
    const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
    const endDate = endDateInput.value ? new Date(endDateInput.value) : null;

    const filteredExpenses = expenses.filter((expense) => {
        const amountValid = expense.amount >= minAmount && expense.amount <= maxAmount;
        const categoryValid = !category || expense.category === category;
        const date = new Date(expense.date);
        const dateValid = (!startDate || date >= startDate) && (!endDate || date <= endDate);
        return amountValid && categoryValid && dateValid;
    });

    updateExpenseList(filteredExpenses);
}

function getTotalExpensesForCategory(category) {
    return expenses
        .filter(expense => expense.category === category)
        .reduce((total, expense) => total + expense.amount, 0);
}

expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;

    const budget = budgets[category] || 0;
    const currentExpenses = getTotalExpensesForCategory(category);

    if (currentExpenses + amount > budget) {
        alert(`Adding this expense would exceed the budget for ${category}. Current expenses: ₹${currentExpenses.toFixed(2)}, Budget: ₹${budget.toFixed(2)}`);
        return;
    }

    const totalBudget = Object.values(budgets).reduce((sum, b) => sum + b, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const budgetLimit = parseFloat(localStorage.getItem('budgetLimit')) || 0;

    if (totalExpenses + amount > budgetLimit) {
        alert(`Adding this expense would exceed the total budget limit of ₹${budgetLimit.toFixed(2)}. Please adjust your expenses or increase your income.`);
        return;
    }

    expenses.unshift({ description, amount, category, date: new Date().toISOString() });
    saveExpenses();
    updateExpenseList();
    updateChart();
    expenseForm.reset();
});

filterCategory.addEventListener('input', filterExpenses);
minAmountInput.addEventListener('input', filterExpenses);
maxAmountInput.addEventListener('input', filterExpenses);
startDateInput.addEventListener('input', filterExpenses);
endDateInput.addEventListener('input', filterExpenses);

updateExpenseList();
updateChart();

window.addEventListener('storage', function (e) {
    if (e.key === 'budgets') {
        budgets = JSON.parse(e.newValue);
    }
});

window.addEventListener('resize', function () {
    if (expenseChart) {
        expenseChart.resize();
    }
});