// Harga menu dalam Riel Kamboja
const hargaMenu = {
    "Nasi Cumi": 10000,
    "Nasi Cumi + Telor Ceplok": 14000
};

let orders = [];

// Simpan orders ke localStorage
function saveOrders() {
    localStorage.setItem('orders', JSON.stringify(orders));
}

// Load orders dari localStorage
function loadOrders() {
    const data = localStorage.getItem('orders');
    if (data) {
        orders = JSON.parse(data);
        renderOrders();
    }
}

// Render tabel order dan update total pembayaran
function renderOrders() {
    const tbody = document.querySelector('#orderList tbody');
    tbody.innerHTML = '';
    let totalAll = 0;
    let paidTotal = 0;
    let unpaidTotal = 0;

    orders.forEach((order, idx) => {
        const totalPrice = order.quantity * order.price;
        totalAll += totalPrice;
        if(order.paymentStatus === "Sudah Bayar") paidTotal += totalPrice;
        else unpaidTotal += totalPrice;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.customerName}</td>
            <td>${order.menu}</td>
            <td>${order.quantity}</td>
            <td>KHR ${order.price.toLocaleString()}</td>
            <td>KHR ${totalPrice.toLocaleString()}</td>
            <td>${order.paymentStatus}</td>
            <td><button onclick="deleteOrder(${idx})">Hapus</button></td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById('totalAmount').textContent = totalAll.toLocaleString();
    document.getElementById('paidAmount').textContent = paidTotal.toLocaleString();
    document.getElementById('unpaidAmount').textContent = unpaidTotal.toLocaleString();

    saveOrders();
}

// Tambah order dari form
document.getElementById('orderForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const customerName = document.getElementById('customerName').value.trim();
    const menu = "Nasi Cumi"; // fixed menu for simplicity, bisa sesuaikan jika ada input menu
    const quantity = parseInt(document.getElementById('quantity').value);
    const paymentStatusSelect = document.getElementById('paymentStatus').value;

    if (!customerName || quantity < 1) {
        alert("Mohon isi nama dan jumlah dengan benar.");
        return;
    }

    const price = hargaMenu[menu];
    const paymentStatus = (paymentStatusSelect === '✅') ? "Sudah Bayar" : "Belum Bayar";

    orders.push({
        customerName,
        menu,
        quantity,
        price,
        paymentStatus
    });
    renderOrders();
    this.reset();
});

// Hapus order
function deleteOrder(index) {
    orders.splice(index, 1);
    renderOrders();
}
window.deleteOrder = deleteOrder; // expose untuk onclick tombol

// Proses order: tampilkan struk dan reset data
document.getElementById('processBtn').addEventListener('click', function () {
    if (orders.length === 0) {
        alert("Tidak ada orderan untuk diproses.");
        return;
    }

    let receiptHTML = `
        <h2>Warung Dulz Nyam</h2>
        <p>Alamat: Sihanoukvile</p>
        <hr>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ccc;">
            <thead>
                <tr>
                    <th>Nama Pemesan</th>
                    <th>Menu</th>
                    <th>Jumlah</th>
                    <th>Total Harga</th>
                    <th>Status Pembayaran</th>
                </tr>
            </thead>
            <tbody>
    `;

    let totalBayar = 0;
    orders.forEach(order => {
        const totalHarga = order.quantity * order.price;
        totalBayar += totalHarga;
        receiptHTML += `
            <tr>
                <td style="padding:5px; border:1px solid #ccc;">${order.customerName}</td>
                <td style="padding:5px; border:1px solid #ccc;">${order.menu}</td>
                <td style="padding:5px; border:1px solid #ccc;">${order.quantity}</td>
                <td style="padding:5px; border:1px solid #ccc;">KHR ${totalHarga.toLocaleString()}</td>
                <td style="padding:5px; border:1px solid #ccc;">${order.paymentStatus}</td>
            </tr>
        `;
    });

    receiptHTML += `
            </tbody>
        </table>
        <hr>
        <h3>Total Pembayaran: KHR ${totalBayar.toLocaleString()}</h3>

        <h3>Silakan Bayar via QRIS:</h3>
        <div style="text-align:center; margin-top:10px;">
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAACXBIWXMAAA7EAAAOxAGVKw4bAAACgUlEQVR4nO3cQW7DIBAF0Wz//y9sAVUr0QGpPd2Z3+diUSQE0du21QIAAAAAAAAAAAAAwOck1m8z6Nzfb8/Mp2WzD1jz3e43efacX4+uJzznnGWXNOedddY5zznnnmOa9xtavudZcrXKQbF0m93O3Gn48Zxnwpr56sFafBeUlz+5NnnXeeedd15555x333nnnXfeeefdddededcx3cVyrXKccpf0qTqJzLGfY5rPylWWcaS/XY6nFLXVWueQbPZyv6ez3OTnOfc5zzn7Oc8Z+TXXn3nkX3LMd75r4nHu3NfMct85yz2uuR2eZ5X+uf/z//HbPu1i/zfeZZ13gAAAAAAAAAAAOAj4HGo9TwOj3rjAAAAAElFTkSuQmCC"
                 alt="QRIS Pembayaran" width="150" />
        </div>
    `;

    document.getElementById('receiptContent').innerHTML = receiptHTML;
    document.getElementById('receiptModal').style.display = "block";

    // Reset data
    orders = [];
    saveOrders();
    renderOrders();
});

// Tutup modal struk
document.getElementById('closeReceipt').addEventListener('click', function () {
    document.getElementById('receiptModal').style.display = "none";
});
window.onclick = function (event) {
    const modal = document.getElementById('receiptModal');
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

// Bulk input pesanan
document.getElementById('bulkAddBtn').addEventListener('click', function () {
    const bulkText = document.getElementById('bulkInput').value.trim();
    if (!bulkText) return alert("Masukkan data pesanan bulk terlebih dahulu.");

    const lines = bulkText.split('\n');

    lines.forEach(line => {
        if (!line.trim()) return; // skip baris kosong

        // Format: Nama Jumlah [✅ atau ❌ optional] (contoh "Andy Lau 2 ✅" atau "Dando 1 ❌")
        const regex = /^(.+?)\s+(\d+)(?:\s*([✅❌]))?.*$/;

        lines.forEach(line => {
            if (!line.trim()) return; // skip kosong
        
            const match = line.match(regex);
            if (match) {
                const customerName = match[1].trim();
                const quantity = parseInt(match[2]);
                const statusSymbol = match[3];
                let paymentStatus = "Belum Bayar"; // default
        
                if (statusSymbol === '✅') paymentStatus = "Sudah Bayar";
                else if (statusSymbol === '❌') paymentStatus = "Belum Bayar";
        
                // Menu dan harga tetap
                const menu = "Nasi Cumi";
                const price = hargaMenu[menu];
        
                orders.push({
                    customerName,
                    menu,
                    quantity,
                    price,
                    paymentStatus
                });
            } else {
                alert("Format salah pada baris: " + line);
            }
        });
        

    });

    renderOrders();
    document.getElementById('bulkInput').value = '';
    saveOrders();
});

// Load data saat halaman dibuka
window.onload = loadOrders;
