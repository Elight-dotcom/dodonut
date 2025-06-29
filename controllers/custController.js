const db = require("../config/db");
const JWT = require("jsonwebtoken");

const custFirstPage = async (req, res) => {
    try {
        const products = (await db.query('SELECT * FROM products ORDER BY id_product')).rows;
        const productCategories = (await db.query(`
                SELECT pc.id_product, c.id_category, c.category_name, c.colour
                FROM product_categories pc
                JOIN categories c ON pc.id_category = c.id_category
            `)).rows;
    
        const formatRupiah = (number) => {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(number);
        };
    
        const productsWithCategories = products.map(product => {
                const categoriesForProduct = productCategories.filter(
                    pc => String(pc.id_product) === String(product.id_product)
                );
    
                if (product.image) {
                    const base64Image = product.image.toString('base64');
                    const mimeType = 'image/jpeg';
                    product.image = `data:${mimeType};base64,${base64Image}`;
                }
    
                return {
                    ...product,
                    price: formatRupiah(product.price),
                    categories: categoriesForProduct
                };
            });
    
        res.render('pages/index', { products: productsWithCategories});
    } catch (error) {
        console.error(error);
    }
};

const checkoutPage = async (req, res) => {
    const items = JSON.parse(req.body.items); 

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.redirect('/');
    }

    const ids = items.map(item => parseInt(item.id));

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    try {
        const result = await db.query(
            'SELECT * FROM products WHERE id_product = ANY($1)',
            [ids]
        );

        const products = result.rows;

        const cart = products.map(product => {
            const item = items.find(i => parseInt(i.id) === product.id_product);

            if (product.image) {
                const base64Image = product.image.toString('base64');
                const mimeType = 'image/jpeg';
                product.image = `data:${mimeType};base64,${base64Image}`;
            }

            return {
                ...product,
                formattedPrice: formatRupiah(product.price),
                qty: item.qty,
                subtotal: product.price * item.qty,
                formattedSubtotal: formatRupiah(product.price * item.qty)
            };
        });

        const total = cart.reduce((acc, item) => acc + item.subtotal, 0);

        res.render('pages/checkout', { cart, total, items });

    } catch (error) {
        console.error(error);
        res.status(500).send('Checkout error');
    }
};

const order = async (req, res) => {
    const { customerName, payment, items } = req.body;
    const ids = items.map(item => parseInt(item.id));
    try {
        const result = await db.query(
            'SELECT * FROM products WHERE id_product = ANY($1)',
            [ids]
        );

        const products = result.rows;

        const cart = products.map(product => {
            const item = items.find(i => parseInt(i.id) === product.id_product);

            if (product.image) {
                const base64Image = product.image.toString('base64');
                const mimeType = 'image/jpeg';
                product.image = `data:${mimeType};base64,${base64Image}`;
            }
            return {
                ...product,
                qty: item.qty,
                subtotal: product.price * item.qty
            };
        });

        const total = cart.reduce((acc, item) => acc + item.subtotal, 0);

        const salesResult = await db.query(
            'INSERT INTO sales (cust_name, total, orderdate, payment) VALUES ($1, $2, $3, $4) RETURNING id_sales',
            [customerName, total, new Date() ,payment]
        );
        const salesId = salesResult.rows[0].id_sales;

        for (const item of items) {
            await db.query(
                'INSERT INTO detail_sales (id_sales, id_product, quantity, price) VALUES ($1, $2, $3, $4)',
                [salesId, item.id, item.qty, item.subtotal]
            );

            await db.query(
                'UPDATE products SET stock = stock - $1 WHERE id_product = $2',
                [item.qty, item.id]
            );
        }

        res.json({ success: true });

    } catch (error) {
        console.error(error);
        res.status(500).send('Checkout error');
    }
};

const loginPage = (req, res) => {
    try {
        res.render('pages/loginPage', { err: {} });
    } catch (error) {
        console.error(error);
    }
}

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username) {
            return res.render('pages/loginPage', {
                password,
                err: {
                    username: "Mohon lengkapi username",
                }
            });
        }

        if (!password) {
            return res.render('pages/loginPage', {
                username,
                err: {
                    password: "Mohon lengkapi password",
                }
            });
        }

        if(username !== process.env.USERNAME_ADMIN && password !== process.env.PASSWORD_ADMIN){
            return res.render('pages/loginPage', {
                username,
                password,
                err: {
                    username: "Username tidak valid",
                }
            })
        }

        const token = JWT.sign(
            { username : process.env.USERNAME_ADMIN, usertype: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.redirect('/admin');
    } catch (err) {
        console.log(err);
    }
};

module.exports = { custFirstPage, checkoutPage, order, loginPage, login };