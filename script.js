// initialize data
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let customCategories = JSON.parse(localStorage.getItem('customCategories')) || [];
let categoryChart = null;
let selectedColor = '#ff6384';

// กำหนดสีให้แต่ละ category
const categoryColors = {
    'Food': '#ff6384',
    'Transport': '#36a2eb',
    'Shopping': '#ffce56',
    'Bills': '#4bc0c0',
    'Health': '#9966ff',
    'Entertainment': '#ff9f40',
    'Education': '#ff6384',
    'Other': '#c9cbcf'
};

// set today's date as default
document.getElementById('date').valueAsDate = new Date();

// initialize categories
function initializeCategories() {
    updateCategorySelects();
    renderCustomCategories();
    initializeColorPicker();
}

// initialize color picker
function initializeColorPicker() {
    // Color option click events
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedColor = this.getAttribute('data-color');
        });
    });

    // Custom color change event
    document.getElementById('customColor').addEventListener('change', function() {
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
        selectedColor = this.value;
    });
}

// open add category modal
function openAddCategoryModal() {
    document.getElementById('addCategoryModal').style.display = 'flex';
    document.getElementById('newCategoryName').value = '';
    document.getElementById('newCategoryName').focus();
    
    // Reset color selection
    document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
    document.querySelector('.color-option').classList.add('selected');
    selectedColor = '#ff6384';
    document.getElementById('customColor').value = '#4a6cf7';
}

// close add category modal
function closeAddCategoryModal() {
    document.getElementById('addCategoryModal').style.display = 'none';
}

// update category dropdowns
function updateCategorySelects() {
    const categorySelect = document.getElementById('category');
    const filterCategorySelect = document.getElementById('filterCategory');
    
    // Save current values
    const currentCategory = categorySelect.value;
    const currentFilterCategory = filterCategorySelect.value;
    
    // Clear existing options (keep first option)
    while (categorySelect.options.length > 1) categorySelect.remove(1);
    while (filterCategorySelect.options.length > 1) filterCategorySelect.remove(1);
    
    // Add default categories
    const defaultCategories = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Education', 'Other'];
    defaultCategories.forEach(cat => {
        categorySelect.add(new Option(cat, cat));
        filterCategorySelect.add(new Option(cat, cat));
    });
    
    // Add custom categories
    customCategories.forEach(cat => {
        categorySelect.add(new Option(cat.name, cat.name));
        filterCategorySelect.add(new Option(cat.name, cat.name));
        categoryColors[cat.name] = cat.color;
    });
    
    // Restore selected values
    categorySelect.value = currentCategory;
    filterCategorySelect.value = currentFilterCategory;
}

// render custom categories list
function renderCustomCategories() {
    const container = document.getElementById('customCategoriesList');
    
    if (customCategories.length === 0) {
        container.innerHTML = '<p style="color: var(--secondary); text-align: center;">No custom categories added yet</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="custom-categories-grid">
            ${customCategories.map(cat => `
                <div class="custom-category-item">
                    <div class="category-info">
                        <span class="category-tag" style="background-color: ${cat.color}">${cat.name}</span>
                        <div class="category-color-preview" style="background-color: ${cat.color}"></div>
                    </div>
                    <button class="btn btn-delete btn-small" onclick="removeCustomCategory('${cat.name}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}

// add custom category
function addCustomCategory() {
    const categoryName = document.getElementById('newCategoryName').value.trim();
    
    if (!categoryName) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Category',
            text: 'Please enter a category name'
        });
        return;
    }
    
    // Check if category already exists
    const allCategories = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Education', 'Other', ...customCategories.map(c => c.name)];
    if (allCategories.includes(categoryName)) {
        Swal.fire({
            icon: 'error',
            title: 'Category Exists',
            text: 'This category already exists'
        });
        return;
    }
    
    // Add to custom categories with color
    const newCategory = {
        name: categoryName,
        color: selectedColor
    };
    
    customCategories.push(newCategory);
    localStorage.setItem('customCategories', JSON.stringify(customCategories));
    
    // Update category colors
    categoryColors[categoryName] = selectedColor;
    
    // Update UI
    updateCategorySelects();
    renderCustomCategories();
    
    // Close modal and select the new category
    closeAddCategoryModal();
    document.getElementById('category').value = categoryName;
    
    Swal.fire({
        icon: 'success',
        title: 'Category Added!',
        showConfirmButton: false,
        timer: 1500
    });
}

// remove custom category
function removeCustomCategory(categoryName) {
    Swal.fire({
        title: 'Remove Category?',
        text: `This will remove "${categoryName}" from categories. Existing expenses in this category will not be affected.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, remove it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            customCategories = customCategories.filter(cat => cat.name !== categoryName);
            localStorage.setItem('customCategories', JSON.stringify(customCategories));
            
            updateCategorySelects();
            renderCustomCategories();
            
            Swal.fire({
                icon: 'success',
                title: 'Category Removed!',
                showConfirmButton: false,
                timer: 1500
            });
        }
    });
}

// form submission
document.getElementById('expenseForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('amount').value);

    // Amount must not be 0 or negative
    if (amount <= 0) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Data',
            text: 'Amount must be greater than 0 THB',
        });
        document.getElementById('amount').focus();
        return; 
    }

    const expense = {
        id: Date.now(),
        description: document.getElementById('description').value,
        amount: amount,
        category: document.getElementById('category').value,
        date: document.getElementById('date').value
    };

    expenses.push(expense);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    
    // เก็บค่า category และ date ก่อนรีเซ็ต
    const savedCategory = document.getElementById('category').value;
    const savedDate = document.getElementById('date').value;
    
    // Update Dashboard
    updateDashboard();
    
    // Reset เฉพาะ description และ amount
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    
    // คืนค่า category และ date กลับมา
    document.getElementById('category').value = savedCategory;
    document.getElementById('date').value = savedDate;
    
    // Show Alert
    Swal.fire({
        icon: 'success',
        title: 'Expense Added Successfully!',
        showConfirmButton: false,
        timer: 1500
    });
});

// filter listeners
document.getElementById('filterCategory').addEventListener('change', updateDashboard);
document.getElementById('filterPeriod').addEventListener('change', function() {
    const isCustom = this.value === 'custom';
    const customDateRange = document.getElementById('customDateRange');
    
    if (isCustom) {
        customDateRange.classList.remove('hidden');
    } else {
        customDateRange.classList.add('hidden');
    }
    
    updateDashboard();
});
document.getElementById('filterFrom').addEventListener('change', updateDashboard);
document.getElementById('filterTo').addEventListener('change', updateDashboard);

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('addCategoryModal');
    if (event.target === modal) {
        closeAddCategoryModal();
    }
});

// delete expense
function deleteExpense(id) {
    Swal.fire({
        title: 'Delete this expense?',
        text: "This action cannot be undone",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            expenses = expenses.filter(e => e.id !== id);
            localStorage.setItem('expenses', JSON.stringify(expenses));
            updateDashboard();
            
            Swal.fire({
                icon: 'success',
                title: 'Deleted Successfully!',
                showConfirmButton: false,
                timer: 1500
            });
        }
    });
}

// delete all expenses (filtered)
function deleteAllExpenses() {
    const filtered = getFilteredExpenses();
    
    if (filtered.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'No expenses to delete',
            text: 'There are no expenses matching the current filter'
        });
        return;
    }
    
    Swal.fire({
        title: 'Delete ALL filtered expenses?',
        text: `This will delete ${filtered.length} expense(s). This action cannot be undone!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete all!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            // ลบรายการที่กรองแล้ว
            const filteredIds = filtered.map(e => e.id);
            expenses = expenses.filter(e => !filteredIds.includes(e.id));
            localStorage.setItem('expenses', JSON.stringify(expenses));
            updateDashboard();
            
            Swal.fire({
                icon: 'success',
                title: 'All Deleted Successfully!',
                text: `${filtered.length} expense(s) have been deleted`,
                showConfirmButton: false,
                timer: 2000
            });
        }
    });
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
    document.getElementById('totalExpense').textContent = `฿${total.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    document.getElementById('totalCount').textContent = filtered.length;

    // calculate average per day
    if (filtered.length > 0) {
        const dates = filtered.map(e => new Date(e.date).getTime());
        const minDate = Math.min(...dates);
        const maxDate = Math.max(...dates);
        const days = Math.max(1, Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1);
        const avg = total / days;
        document.getElementById('avgPerDay').textContent = `฿${avg.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    } else {
        document.getElementById('avgPerDay').textContent = '฿0';
    }

    // update delete all button
    const deleteAllBtn = document.getElementById('deleteAllBtn');
    if (filtered.length > 0) {
        deleteAllBtn.style.display = 'block';
        deleteAllBtn.innerHTML = `<i class="fas fa-trash"></i> Delete All (${filtered.length})`;
        deleteAllBtn.onclick = deleteAllExpenses;
    } else {
        deleteAllBtn.style.display = 'none';
        deleteAllBtn.onclick = null;
    }

    // update expense list
    const listEl = document.getElementById('expenseList');
    if (filtered.length === 0) {
        listEl.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <p>No expenses found</p>
            </div>
        `;
    } else {
        listEl.innerHTML = filtered
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(e => `
                <div class="expense-item">
                    <div class="expense-info">
                        <span class="expense-category" style="background-color: ${categoryColors[e.category] || getRandomColor()}">${e.category}</span>
                        <strong>${e.description}</strong>
                        <div class="expense-date">${new Date(e.date).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</div>
                    </div>
                    <div class="expense-amount">฿${e.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                    <button class="btn btn-delete" onclick="deleteExpense(${e.id})">Delete</button>
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
    
    // ใช้สีตามที่กำหนดไว้
    const colors = labels.map(label => categoryColors[label] || getRandomColor());

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
                            return context.label + ': ฿' + context.parsed.toLocaleString('en-US', {minimumFractionDigits: 2});
                        }
                    }
                }
            }
        }
    });
}

// initial load
initializeCategories();
updateDashboard();