// initialize data
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let categoryChart = null;

// set today's date as default
document.getElementById('date').valueAsDate = new Date();

// form submission
document.getElementById('expenseForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('amount').value);

    //จำนวนเงินต้องไม่เป็น0หรือค่าลบ
    if (amount <= 0) {
        alert('❌ จำนวนเงินต้องมากกว่า 0 บาท');
        document.getElementById('amount').focus();
        return; 
    }

    const expense = {
        id: Date.now(),
        description: document.getElementById('description').value,
        amount: parseFloat(document.getElementById('amount').value),
        category: document.getElementById('category').value,
        date: document.getElementById('date').value
    };

    expenses.push(expense);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    
    this.reset();
    document.getElementById('date').valueAsDate = new Date();
    
    Swal.fire({
        icon: 'success',
        title: 'เพิ่มรายการสำเร็จ!',
        showConfirmButton: false,
        timer: 1500
      });
});

// filter listeners
document.getElementById('filterCategory').addEventListener('change', updateDashboard);
document.getElementById('filterPeriod').addEventListener('change', function() {
    const isCustom = this.value === 'custom';
    document.getElementById('filterFrom').disabled = !isCustom;
    document.getElementById('filterTo').disabled = !isCustom;
    updateDashboard();
});
document.getElementById('filterFrom').addEventListener('change', updateDashboard);
document.getElementById('filterTo').addEventListener('change', updateDashboard);

// delete expense
function deleteExpense(id) {
    if (confirm('ต้องการลบรายการนี้ใช่หรือไม่?')) {
        expenses = expenses.filter(e => e.id !== id);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        updateDashboard();
    }
}

// get filtered expenses
function getFilteredExpenses() {
    let filtered = [...expenses];

    // filter by category
    const category = document.getElementById('filterCategory').value;
    if (category) {
        filtered = filtered.filter(e => e.category === category);
    }

    // filter by period
    const period = document.getElementById('filterPeriod').value;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (period === 'today') {
        filtered = filtered.filter(e => {
            const expenseDate = new Date(e.date);
            expenseDate.setHours(0, 0, 0, 0);
            return expenseDate.getTime() === today.getTime();
        });
    } else if (period === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(e => new Date(e.date) >= weekAgo);
    } else if (period === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filtered = filtered.filter(e => new Date(e.date) >= monthAgo);
    } else if (period === 'year') {
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        filtered = filtered.filter(e => new Date(e.date) >= yearAgo);
    } else if (period === 'custom') {
        const from = document.getElementById('filterFrom').value;
        const to = document.getElementById('filterTo').value;
        if (from) filtered = filtered.filter(e => e.date >= from);
        if (to) filtered = filtered.filter(e => e.date <= to);
    }

    return filtered;
}

// update dashboard
function updateDashboard() {
    const filtered = getFilteredExpenses();
    
    // update stats
    const total = filtered.reduce((sum, e) => sum + e.amount, 0);
    document.getElementById('totalExpense').textContent = `฿${total.toLocaleString('th-TH', {minimumFractionDigits: 2})}`;
    document.getElementById('totalCount').textContent = filtered.length;

    // calculate average per day
    if (filtered.length > 0) {
        const dates = filtered.map(e => new Date(e.date).getTime());
        const minDate = Math.min(...dates);
        const maxDate = Math.max(...dates);
        const days = Math.max(1, Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1);
        const avg = total / days;
        document.getElementById('avgPerDay').textContent = `฿${avg.toLocaleString('th-TH', {minimumFractionDigits: 2})}`;
    } else {
        document.getElementById('avgPerDay').textContent = '฿0';
    }

    // update expense list
    const listEl = document.getElementById('expenseList');
    if (filtered.length === 0) {
        listEl.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">ไม่มีรายการค่าใช้จ่าย</p>';
    } else {
        listEl.innerHTML = filtered
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(e => `
                <div class="expense-item">
                    <div class="expense-info">
                        <span class="expense-category">${e.category}</span>
                        <strong>${e.description}</strong>
                        <div class="expense-date">${new Date(e.date).toLocaleDateString('th-TH', {year: 'numeric', month: 'long', day: 'numeric'})}</div>
                    </div>
                    <div class="expense-amount">฿${e.amount.toLocaleString('th-TH', {minimumFractionDigits: 2})}</div>
                    <button class="btn btn-delete" onclick="deleteExpense(${e.id})">ลบ</button>
                </div>
            `).join('');
    }

    // update chart
    updateChart(filtered);
}

// update chart
function updateChart(filtered) {
    const categoryTotals = {};
    filtered.forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    const colors = [
        '#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', 
        '#9966ff', '#ff9f40', '#ff6384', '#c9cbcf'
    ];

    if (categoryChart) {
        categoryChart.destroy();
    }

    const ctx = document.getElementById('categoryChart').getContext('2d');
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ฿' + context.parsed.toLocaleString('th-TH', {minimumFractionDigits: 2});
                        }
                    }
                }
            }
        }
    });
}

// initial load
updateDashboard();