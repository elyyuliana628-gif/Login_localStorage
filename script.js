
// DATA PRODUK FURNITURE
const products = [
    { id: 1, name: "Kursi Kayu", price: 150000, icon: "🪑" },
    { id: 2, name: "Kursi Kantor", price: 350000, icon: "💺" },
    { id: 3, name: "Meja Belajar", price: 250000, icon: "🪵" },
    { id: 4, name: "Meja Makan", price: 500000, icon: "🪑" },
    { id: 5, name: "Meja Minimalis", price: 300000, icon: "🪵" },
    { id: 6, name: "Kursi Santai", price: 275000, icon: "🛋️" }
];

// MENGAMBIL DATA LOCALSTORAGE
let users = JSON.parse(localStorage.getItem("furnitureUsers")) || [];
let carts = JSON.parse(localStorage.getItem("furnitureCarts")) || {};
let orders = JSON.parse(localStorage.getItem("furnitureOrders")) || {};

// FORMAT RUPIAH
function rupiah(number) {
    return number.toLocaleString("id-ID");
}

// PINDAH KE HALAMAN DAFTAR
document.getElementById("goRegister").onclick = function() {
    loginPage.classList.add("hidden");
    registerPage.classList.remove("hidden");
};

// KEMBALI KE LOGIN
document.getElementById("backLogin").onclick = function() {
    registerPage.classList.add("hidden");
    loginPage.classList.remove("hidden");
};

// FITUR DAFTAR AKUN
document.getElementById("registerForm")
.addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("regName").value.trim();
    const username = document.getElementById("regUsername").value.trim();
    const password = document.getElementById("regPassword").value;

    const existing = users.find(user =>
        user.username.toLowerCase() === username.toLowerCase()
    );

    if (existing) {
        alert("Username sudah digunakan!");
        return;
    }

    users.push({
        name: name,
        username: username,
        password: password
    });

    localStorage.setItem(
        "furnitureUsers",
        JSON.stringify(users)
    );

    alert("Pendaftaran berhasil! Silakan login.");

    this.reset();

    registerPage.classList.add("hidden");
    loginPage.classList.remove("hidden");
});

// FITUR LOGIN
document.getElementById("loginForm")
.addEventListener("submit", function(e) {
    e.preventDefault();

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;

    const user = users.find(u =>
        u.username.toLowerCase() === username.toLowerCase() &&
        u.password === password
    );

    if (user) {
        sessionStorage.setItem("furnitureLogin", user.username);
        sessionStorage.setItem("furnitureName", user.name);

        showDashboard();
    } else {
        alert("Username atau password salah!");
    }
});

// MENAMPILKAN DASHBOARD
function showDashboard() {
    loginPage.classList.add("hidden");
    registerPage.classList.add("hidden");
    dashboard.classList.remove("hidden");

    document.getElementById("userDisplay").textContent =
        sessionStorage.getItem("furnitureName");

    showProducts();
    showCart();
    showHistory();
}

// LOGOUT
document.getElementById("logoutBtn").onclick = function() {
    sessionStorage.removeItem("furnitureLogin");
    sessionStorage.removeItem("furnitureName");

    dashboard.classList.add("hidden");
    loginPage.classList.remove("hidden");

    document.getElementById("loginForm").reset();
};

// MENGAMBIL KERANJANG PENGGUNA
function getCart() {
    const username = sessionStorage.getItem("furnitureLogin");
    return carts[username] || [];
}

// MENYIMPAN KERANJANG
function saveCart() {
    const username = sessionStorage.getItem("furnitureLogin");

    localStorage.setItem(
        "furnitureCarts",
        JSON.stringify(carts)
    );
}

// MENAMPILKAN PRODUK
function showProducts() {
    const productList = document.getElementById("productList");
    productList.textContent = "";

    products.forEach(function(product) {
        const card = document.createElement("div");
        card.className = "product-card";

        const icon = document.createElement("div");
        icon.className = "product-icon";
        icon.textContent = product.icon;

        const name = document.createElement("h3");
        name.textContent = product.name;

        const price = document.createElement("p");
        price.textContent = "Rp " + rupiah(product.price);

        const button = document.createElement("button");
        button.textContent = "Pesan Sekarang";

        button.onclick = function() {
            addToCart(product);
        };

        card.append(icon, name, price, button);
        productList.appendChild(card);
    });
}

// MENAMBAHKAN KE KERANJANG
function addToCart(product) {
    const username = sessionStorage.getItem("furnitureLogin");

    if (!carts[username]) {
        carts[username] = [];
    }

    const item = carts[username].find(
        p => p.id === product.id
    );

    if (item) {
        item.quantity++;
    } else {
        carts[username].push({
            ...product,
            quantity: 1
        });
    }

    saveCart();
    showCart();

    alert(product.name + " berhasil ditambahkan!");
}

// MENAMPILKAN KERANJANG
function showCart() {
    const cartList = document.getElementById("cartList");
    cartList.textContent = "";

    const cart = getCart();
    let total = 0;

    if (cart.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty";
        empty.textContent = "Belum ada pesanan.";
        cartList.appendChild(empty);
    }

    cart.forEach(function(item) {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        const row = document.createElement("div");
        row.className = "cart-item";

        const details = document.createElement("span");
        details.textContent =
            item.name + " x " + item.quantity +
            " = Rp " + rupiah(subtotal);

        const remove = document.createElement("button");
        remove.textContent = "Hapus";

        remove.onclick = function() {
            removeFromCart(item.id);
        };

        row.append(details, remove);
        cartList.appendChild(row);
    });

    document.getElementById("totalPrice").textContent =
        rupiah(total);
}

// MENGHAPUS PESANAN
function removeFromCart(id) {
    const username = sessionStorage.getItem("furnitureLogin");

    carts[username] = carts[username].filter(
        item => item.id !== id
    );

    saveCart();
    showCart();
}

// MEMBUAT PESANAN
document.getElementById("checkoutBtn").onclick = function() {
    const username = sessionStorage.getItem("furnitureLogin");
    const cart = getCart();

    if (cart.length === 0) {
        alert("Keranjang masih kosong!");
        return;
    }

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    if (!confirm("Konfirmasi pesanan sebesar Rp " + rupiah(total) + "?")) {
        return;
    }

    if (!orders[username]) {
        orders[username] = [];
    }

    orders[username].push({
        id: Date.now(),
        items: cart.map(item => ({...item})),
        total: total,
        date: new Date().toLocaleString("id-ID"),
        status: "Menunggu konfirmasi"
    });

    localStorage.setItem(
        "furnitureOrders",
        JSON.stringify(orders)
    );

    carts[username] = [];
    saveCart();

    showCart();
    showHistory();

    alert("Pesanan berhasil disimpan!");
};

// MENAMPILKAN RIWAYAT PESANAN
function showHistory() {
    const history = document.getElementById("orderHistory");
    history.textContent = "";

    const username = sessionStorage.getItem("furnitureLogin");
    const userOrders = orders[username] || [];

    if (userOrders.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty";
        empty.textContent = "Belum ada riwayat pesanan.";
        history.appendChild(empty);
        return;
    }

    userOrders.slice().reverse().forEach(function(order) {
        const card = document.createElement("div");
        card.className = "order-card";

        const title = document.createElement("strong");
        title.textContent = "Pesanan #" + order.id;

        const date = document.createElement("p");
        date.textContent = "Tanggal: " + order.date;

        const items = document.createElement("p");
        items.textContent = order.items.map(item =>
            item.name + " (" + item.quantity + ")"
        ).join(", ");

        const total = document.createElement("p");
        total.textContent = "Total: Rp " + rupiah(order.total);

        const status = document.createElement("p");
        status.textContent = "Status: " + order.status;

        card.append(title, date, items, total, status);
        history.appendChild(card);
    });
}

// MEMERIKSA STATUS LOGIN
const loginPage = document.getElementById("loginPage");
const registerPage = document.getElementById("registerPage");
const dashboard = document.getElementById("dashboard");

if (sessionStorage.getItem("furnitureLogin")) {
    showDashboard();
                                         }
