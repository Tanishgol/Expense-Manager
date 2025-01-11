// Initialize existing expenses
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let budgets = JSON.parse(localStorage.getItem('budgets')) || {};
const expenseForm = document.getElementById('expenseForm');
const expenseList = document.getElementById('expenseList');
const ctx = document.getElementById('expenseChart').getContext('2d');
const searchInput = document.querySelector('.topbar input[type="search"]');
const filterCategory = document.getElementById('filtercategory');
const minAmount = document.getElementById('minAmount');
const maxAmount = document.getElementById('maxAmount');
const filterAmountBtn = document.getElementById('filterAmountBtn');
const startDate = document.getElementById('startDate');
const endDate = document.getElementById('endDate');
const filterDateBtn = document.getElementById('filterDateBtn');

let expenseChart;

// Update the expense list
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

// Search functionality
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const filteredExpenses = expenses.filter(expense =>
        expense.description.toLowerCase().includes(query)
    );
    updateExpenseList(filteredExpenses);
});

// Category filter
filterCategory.addEventListener('change', () => {
    const selectedCategory = filterCategory.value;
    const filteredExpenses = selectedCategory
        ? expenses.filter(expense => expense.category === selectedCategory)
        : expenses;
    updateExpenseList(filteredExpenses);
});

// Amount filter
filterAmountBtn.addEventListener('click', () => {
    const min = parseFloat(minAmount.value) || 0;
    const max = parseFloat(maxAmount.value) || Infinity;
    const filteredExpenses = expenses.filter(
        expense => expense.amount >= min && expense.amount <= max
    );
    updateExpenseList(filteredExpenses);
});

// Date range filter
filterDateBtn.addEventListener('click', () => {
    const start = new Date(startDate.value);
    const end = new Date(endDate.value);

    if (!start || !end) {
        alert("Please select valid start and end dates.");
        return;
    }

    const filteredExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= start && expenseDate <= end;
    });
    updateExpenseList(filteredExpenses);
});

// Save and update chart
function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Update chart
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

// Initialize
updateExpenseList();
updateChart();