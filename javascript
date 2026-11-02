(function () {

    const money = n => 'R' + Number(n).toLocaleString('en-ZA');

    const getCart = () =>
        JSON.parse(localStorage.getItem('cbs-cart') || '[]');

    const saveCart = cart => {
        localStorage.setItem('cbs-cart', JSON.stringify(cart));
        updateCount();
    };

    function updateCount() {
        const count = getCart().reduce((s, x) => s + x.qty, 0);

        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
        });
    }

    function addToCart(id) {

        const p = (window.PRODUCTS || []).find(x => x.id === id);

        if (!p) return;

        const cart = getCart();

        const found = cart.find(x => x.id === id);

        if (found) {
            found.qty++;
        } else {
            cart.push({
                id: id,
                qty: 1
            });
        }

        saveCart(cart);

        alert(p.name + ' added to your cart.');
    }

    function card(p) {

        return `
        <article class="product-card">

            <img src="${p.image}"
                 alt="${p.name}"
                 loading="lazy">

            <div class="product-info">

                <h3>${p.name}</h3>

                <p>${p.desc}</p>

                <div class="price">
                    ${money(p.price)}
                </div>

                <div class="product-actions">

                    <a class="view-btn"
                       href="product.html?id=${encodeURIComponent(p.id)}">
                       View details
                    </a>

                    <button class="add-btn"
                            data-add="${p.id}">
                        Add to cart
                    </button>

                </div>

            </div>

        </article>`;
    }

    document.addEventListener('click', e => {

        const b = e.target.closest('[data-add]');

        if (b) {
            addToCart(b.dataset.add);
        }

    });

    // Mobile navigation

    document.querySelector('.menu-toggle')
        ?.addEventListener('click', e => {

            const nav = document.querySelector('.main-nav');

            const open = nav.classList.toggle('open');

            e.currentTarget.setAttribute(
                'aria-expanded',
                String(open)
            );

        });

    // Automatic copyright year

    const year = document.getElementById('year');

    if (year) {
        year.textContent = new Date().getFullYear();
    }

    updateCount();

    // Featured products on home page

    const featured = document.getElementById('featured-products');

    if (featured) {

        featured.innerHTML =
            (window.PRODUCTS || [])
            .slice(0, 4)
            .map(card)
            .join('');

    }

    // Product search and category filtering

    const shop = document.getElementById('shop-products');

    if (shop) {

        const search = document.getElementById('product-search');

        const filter = document.getElementById('category-filter');

        const params = new URLSearchParams(location.search);

        if (params.has('category')) {
            filter.value = params.get('category');
        }

        const render = () => {

            const term = search.value.toLowerCase();

            const cat = filter.value;

            const list = (window.PRODUCTS || []).filter(p =>

                (cat === 'all' || p.category === cat) &&

                (`${p.name} ${p.desc} ${p.category}`)
                    .toLowerCase()
                    .includes(term)

            );

            shop.innerHTML = list.map(card).join('');

            document.getElementById('result-count').textContent =
                `${list.length} product(s) found`;

            document.getElementById('no-products').hidden =
                list.length > 0;

        };

        search.addEventListener('input', render);

        filter.addEventListener('change', render);

        render();
    }

    // Shopping cart

    const cartBox = document.getElementById('cart-items');

    if (cartBox) {

        const draw = () => {

            const cart = getCart();

            const products = window.PRODUCTS || [];

            if (!cart.length) {

                cartBox.innerHTML = '';

                document.getElementById('cart-empty').hidden = false;

                document.getElementById('cart-summary').hidden = true;

                return;
            }

            document.getElementById('cart-empty').hidden = true;

            document.getElementById('cart-summary').hidden = false;

            let total = 0;

            cartBox.innerHTML = cart.map(item => {

                const p = products.find(x => x.id === item.id);

                if (!p) return '';

                total += p.price * item.qty;

                return `
                <article class="cart-row">

                    <img src="${p.image}" alt="${p.name}">

                    <div>
                        <h3>${p.name}</h3>
                        <p>${money(p.price)} each</p>
                    </div>

                    <div class="qty-control">

                        <button data-qty="${p.id}"
                                data-change="-1">
                            −
                        </button>

                        <span>${item.qty}</span>

                        <button data-qty="${p.id}"
                                data-change="1">
                            +
                        </button>

                    </div>

                    <strong class="line-price">
                        ${money(p.price * item.qty)}
                    </strong>

                    <button class="remove-btn"
                            data-remove="${p.id}">
                        Remove
                    </button>

                </article>`;

            }).join('');

            document.getElementById('cart-total').textContent =
                money(total);

        };

        cartBox.addEventListener('click', e => {

            const q = e.target.closest('[data-qty]');

            const r = e.target.closest('[data-remove]');

            let cart = getCart();

            if (q) {

                const item = cart.find(x => x.id === q.dataset.qty);

                if (item) {
                    item.qty += Number(q.dataset.change);
                }

                cart = cart.filter(x => x.qty > 0);

                saveCart(cart);

                draw();
            }

            if (r) {

                saveCart(
                    cart.filter(x => x.id !== r.dataset.remove)
                );

                draw();
            }

        });

        // Checkout by email

        document.getElementById('checkout-btn')
            .addEventListener('click', () => {

                const cart = getCart();

                const lines = cart.map(x => {

                    const p = PRODUCTS.find(y => y.id === x.id);

                    return `${p.name} x ${x.qty} — ${money(p.price * x.qty)}`;

                });

                const total = cart.reduce((s, x) =>

                    s + PRODUCTS.find(p => p.id === x.id).price * x.qty,

                    0
                );

                const body = encodeURIComponent(
                    `Hello Crowned by Star,

I would like to place an order:

${lines.join('\n')}

Total: ${money(total)}

Please confirm availability, delivery and payment details.`
                );

                location.href =
                    `mailto:crownedbystar@info.co.za?subject=New%20website%20order&body=${body}`;

            });

        draw();
    }

    // Contact form

    const form = document.getElementById('contact-form');

    if (form) {

        form.addEventListener('submit', e => {

            e.preventDefault();

            if (!form.reportValidity()) return;

            const d = new FormData(form);

            const subject = encodeURIComponent(
                'Website enquiry from ' + d.get('name')
            );

            const body = encodeURIComponent(`
Name: ${d.get('name')}
Email: ${d.get('email')}
Phone: ${d.get('phone') || 'Not provided'}

Message:
${d.get('message')}
`);

            document.getElementById('form-feedback').textContent =
                'Your email app will open with your enquiry. Please send the prepared email to complete submission.';

            location.href =
                `mailto:crownedbystar@info.co.za?subject=${subject}&body=${body}`;

        });

    }

    // Individual product details

    const detail = document.getElementById('product-detail');

    if (detail) {

        const id = new URLSearchParams(location.search).get('id');

        const p = (window.PRODUCTS || []).find(x => x.id === id);

        if (!p) {

            detail.innerHTML = `
                <div>
                    <h1>Product not found</h1>
                    <p>Please return to the shop to browse our products.</p>
                    <a class="btn" href="shop.html">BACK TO SHOP</a>
                </div>`;

        } else {

            document.title = p.name + ' | Crowned by Star';

            detail.innerHTML = `

                <img src="${p.image}" alt="${p.name}">

                <div>

                    <p class="eyebrow">${p.category}</p>

                    <h1>${p.name}</h1>

                    <p>${p.desc}</p>

                    <p class="price">${money(p.price)}</p>

                    <p class="fine-print">
                        Delivery arrangements and availability
                        will be confirmed when you enquire.
                    </p>

                    <button class="btn" data-add="${p.id}">
                        ADD TO CART
                    </button>

                    <p>
                        <a class="text-link" href="shop.html">
                            ← Back to shop
                        </a>
                    </p>

                </div>`;

        }
    }

})();