let incomes = JSON.parse(localStorage.getItem('incomes')) || [];
const incomeForm = document.getElementById('incomeForm');
const incomeList = document.getElementById('incomeList');
const ctx = document.getElementById('incomeChart').getContext('2d');
let incomeChart;

function updateIncomeList() {
    incomeList.innerHTML = '';
    incomes.forEach((income, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${income.source}</td>
            <td>₹${income.amount.toFixed(2)}</td>
            <td>${new Date(income.date).toLocaleDateString('en-GB')}</td>
            <td>${income.category}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editIncome(${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteIncome(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        incomeList.appendChild(row);
    });
}

function deleteIncome(index) {
    incomes.splice(index, 1);
    saveIncomes();
    updateIncomeList();
    updateChart();
}

function editIncome(index) {
    const income = incomes[index];
    document.getElementById('source').value = income.source;
    document.getElementById('amount').value = income.amount;
    document.getElementById('date').value = income.date;
    document.getElementById('category').value = income.category;

    incomes.splice(index, 1);
    saveIncomes();
    updateIncomeList();
    updateChart();
}

function updateChart() {
    const data = incomes.reduce((acc, income) => {
        acc[income.category] = (acc[income.category] || 0) + income.amount;
        return acc;
    }, {});

    const chartData = {
        labels: Object.keys(data),
        datasets: [{
            label: 'Income Amount',
            data: Object.values(data),
            backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                '#FF9F40', '#C9CBCF', '#7BC225', '#FFA07A', '#20B2AA'
            ],
        }]
    };

    if (incomeChart) {
        incomeChart.destroy();
    }

    incomeChart = new Chart(ctx, {
        type: 'pie',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right' },
                title: { display: true, text: 'Income Distribution' },
            },
        },
    });
}

function saveIncomes() {
    localStorage.setItem('incomes', JSON.stringify(incomes));
    updateTotalIncome();
}

function updateTotalIncome() {
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    localStorage.setItem('totalIncome', totalIncome);
    const budgetLimit = totalIncome * 0.5;
    localStorage.setItem('budgetLimit', budgetLimit);
}

incomeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const source = document.getElementById('source').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;
    const category = document.getElementById('category').value;

    incomes.unshift({ source, amount, date, category });
    saveIncomes();
    updateIncomeList();
    updateChart();
    incomeForm.reset();
});

updateIncomeList();
updateChart();
updateTotalIncome();