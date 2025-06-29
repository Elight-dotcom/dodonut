const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

// Show selected section
function showSection(section, event) {
    document.querySelectorAll('[id$="-section"]').forEach(el => el.classList.add('hidden'));

    const sectionElement = document.getElementById(section + '-section');
    if (sectionElement) {
        sectionElement.classList.remove('hidden');
    }

    const titles = {
        'dashboard': 'Dashboard',
        'products': 'Manajemen Produk',
        'sales': 'Daftar Penjualan',
        'analytics': 'Analitik Penjualan',
        'categories': 'Manajemen Kategori'
    };
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
        pageTitle.textContent = titles[section] || '';
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('bg-dark');
        link.classList.add('bg-primary');
    });

    event.currentTarget.classList.add('bg-dark');
    event.currentTarget.classList.remove('bg-primary');
}

// Products Management
function openAddProductModal() {
    document.getElementById('Modal Title').textContent = 'Tambah Produk';
    document.getElementById('productForm').action = '/admin/add';
    document.getElementById('productForm').reset();
    document.getElementById('productModal').classList.remove('hidden');
}

document.querySelectorAll('.btnEdit').forEach(button => {
    button.addEventListener('click', () => {
        document.getElementById('Modal Title').textContent = 'Edit Produk';

        button.dataset.price = parseInt(button.dataset.price.replace(/[^0-9]/g, ''));

        document.getElementById('productId').value = button.dataset.id;
        document.getElementById('productName').value = button.dataset.name;
        document.getElementById('productPrice').value = button.dataset.price;
        document.getElementById('productStock').value = button.dataset.stock;
        document.getElementById('productDescription').value = button.dataset.description;

        document.getElementById('productForm').action = '/admin/edit';
        document.getElementById('productModal').classList.remove('hidden');
    });
});

function closeProductModal() {
    document.getElementById('productModal').classList.add('hidden');
}

function deleteProduct(id) {
    if (confirm("Yakin ingin menghapus produk ini?")) {
        fetch(`/admin/delete/${id}`, { method: 'DELETE' })
            .then(() => window.location.reload())
            .catch(err => console.error(err));
    }
}
    
// Category Management
const nameInput = document.getElementById('categoryName');
const colourInput = document.getElementById('categoryColour');
const preview = document.getElementById('categoryPreview');

function openAddCategoryModal() {
    document.getElementById('modalCategoryTitle').textContent = 'Tambah Produk';
    document.getElementById('categoryForm').action = '/admin/category/add';
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryModal').classList.remove('hidden');
}

document.querySelectorAll('.btnEditCtg').forEach(button => {
    button.addEventListener('click', () => {
        document.getElementById('modalCategoryTitle').textContent = 'Edit Kategori';

        document.getElementById('categoryId').value = button.dataset.id;
        nameInput.value = button.dataset.name;
        colourInput.value = button.dataset.colour;
        preview.textContent = button.dataset.name;
        preview.style.backgroundColor = '#' + button.dataset.colour;

        document.getElementById('categoryForm').action = '/admin/category/edit/' + button.dataset.id;
        document.getElementById('categoryModal').classList.remove('hidden');
    });
});

function closeCategoryModal() {
    document.getElementById('categoryModal').classList.add('hidden');
}

function updatePreview() {
    const name = nameInput.value.trim() || 'Kategori';
    const colour = colourInput.value.trim().replace('#', '') || '4682A9';

    preview.textContent = name;
    preview.style.backgroundColor = '#' + colour;
}

nameInput.addEventListener('input', updatePreview);
colourInput.addEventListener('input', updatePreview);

function deleteCategory(id) {
    if (confirm("Yakin ingin menghapus kategori ini?")) {
        fetch(`/admin/category/delete/${id}`, { method: 'DELETE' })
            .then(() => window.location.reload())
            .catch(err => console.error(err));
    }
}

// Category Product
document.querySelectorAll('.btnEditCtgPrd').forEach(button => {
    button.addEventListener('click', () => {
        document.getElementById('productCategoryTitle').textContent = 'Edit Kategori';

        document.getElementById('productCategoryId').value = button.dataset.id;
        document.getElementById('proCatName').textContent = button.dataset.name;
        document.getElementById('proCatImage').src = button.dataset.image;

        document.querySelectorAll('input[name="category_ids[]"]').forEach(checkbox => {checkbox.checked = false});
        const categories = JSON.parse(button.dataset.categories);
        categories.forEach(category => {
            const checkbox = document.getElementById('category-' + category.id_category);
            if (checkbox) {
                checkbox.checked = true;
            }
        });

        document.getElementById('productCategoryForm').action = '/admin/product-category/edit';
        document.getElementById('productCategoryModal').classList.remove('hidden');
    });
});

function closeCategoryProductModal() {
    document.getElementById('productCategoryModal').classList.add('hidden');
}

// Sales Management

document.querySelectorAll('.btnDetail').forEach(button => {
    button.addEventListener('click', () => {
        const sale = salesWithDetail.find(s => String(s.id_sales) === String(button.dataset.id));
        if (!sale) return;

        document.getElementById('salesDate').textContent = new Date(sale.orderdate).toLocaleString('id-ID');
        document.getElementById('salesName').textContent = sale.cust_name;
        document.getElementById('salesPayment').textContent = sale.payment;

        const tbody = document.getElementById('detailSales');
        tbody.innerHTML = '';

        let total = 0;
        sale.detailSales.forEach((detail, index) => {
            const subTotal = detail.price * detail.quantity;
            total += subTotal;

            const row = `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${index + 1}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="h-10 w-10 flex-shrink-0">
                                <div>
                                    <img class="h-10 w-10 rounded-full" src="${detail.image}" alt=""></img>
                                </div>
                            </div>
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900">${detail.product_name}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">${formatRupiah(detail.price)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ${detail.quantity}x
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">${formatRupiah(subTotal)}</td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', row);
        });

        document.getElementById('salesTotal').textContent = formatRupiah(total);

        document.getElementById('salesModal').classList.remove('hidden');
    });
});

function closeSalesModal() {
    document.getElementById('salesModal').classList.add('hidden');
}