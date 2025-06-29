const db = require('../config/db');

const adminFirstPage = async (req, res) => {
    try {
        const products = (await db.query('SELECT * FROM products ORDER BY id_product')).rows;
        const productCategories = (await db.query(`
            SELECT pc.id_product, c.id_category, c.category_name, c.colour
            FROM product_categories pc
            JOIN categories c ON pc.id_category = c.id_category
        `)).rows;

        const categories = (await db.query('SELECT * FROM categories')).rows;
    
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
    
        const sales = (await db.query(`
            SELECT * FROM sales
            ORDER BY id_sales DESC
        `)).rows;
        const detailSales = (await db.query(`
            SELECT * 
            FROM detail_sales 
            JOIN sales ON detail_sales.id_sales = sales.id_sales
            JOIN products ON detail_sales.id_product = products.id_product
            ORDER BY detail_sales.id_detail_sales DESC;
        `)).rows;

        const salesWithDetail = sales.map(sale => {
            const detailSalesForSale = detailSales.filter(
                ds => String(ds.id_sales) === String(sale.id_sales)
            );
            const detailSalesForSaleWithImages = detailSalesForSale.map(ds => {
                if (ds.image) {
                    const base64Image = ds.image.toString('base64');
                    const mimeType = 'image/jpeg';  // sesuaikan kalau bukan jpeg
                    return {
                        ...ds,
                        image: `data:${mimeType};base64,${base64Image}`
                    };
                }
                return ds;
            });
            return {
                ...sale,
                detailSales: detailSalesForSaleWithImages
            };
        });
        
        const totalWeek = (await db.query(`
            SELECT COALESCE(SUM(total), 0) AS total_week, COALESCE(COUNT(*), 0) AS total_order
            FROM sales
            WHERE orderdate BETWEEN NOW() - INTERVAL '7 days' AND NOW()
        `)).rows[0];
        const totalWeekRupiah = formatRupiah(totalWeek.total_week);

        const dailySales = (await db.query(`
            SELECT
                TRIM(TO_CHAR(orderdate, 'Day')) AS day,
                TO_CHAR(orderdate, 'YYYY-MM-DD') AS date, 
                COALESCE(SUM(total), 0) AS total
            FROM sales
            WHERE orderdate BETWEEN NOW() - INTERVAL '7 days' AND NOW()
            GROUP BY TO_CHAR(orderdate, 'YYYY-MM-DD'), TO_CHAR(orderdate, 'Day')
            ORDER BY date;
        `)).rows;


        const monthlySales = (await db.query(`
            SELECT 
                TO_CHAR(orderDate, 'MM') AS month,
                SUM(total) AS total
            FROM sales
            WHERE orderDate >= date_trunc('year', CURRENT_DATE)
            GROUP BY TO_CHAR(orderDate, 'MM')
            ORDER BY month;
        `)).rows;

        const avgDailySpend = (await db.query(`
            SELECT 
                TRIM(TO_CHAR(date, 'Day')) AS day,
                ROUND(AVG(daily_total)) AS avg_daily_sales
            FROM (
                SELECT 
                    DATE(orderdate) AS date,
                    AVG(total) AS daily_total
                FROM sales
                WHERE orderdate BETWEEN NOW() - INTERVAL '6 days' AND NOW()
                GROUP BY DATE(orderdate)
            ) AS daily
            GROUP BY TO_CHAR(date, 'Day')
            ORDER BY MIN(date)
        `)).rows;

        const favourites = (await db.query(`
            SELECT 
                p.id_product,
                p.product_name, 
                COUNT(*) AS count
            FROM sales s
            JOIN detail_sales sd ON s.id_sales = sd.id_sales
            JOIN products p ON sd.id_product = p.id_product
            GROUP BY p.id_product, p.product_name
            ORDER BY count DESC
            LIMIT 5;
        `)).rows;

        console.log(salesWithDetail)
    
        res.render('pages/admin', { 
            products: productsWithCategories, 
            categories: categories, 
            sales: sales,
            salesWithDetail: salesWithDetail,
            totalWeekRupiah: totalWeekRupiah, 
            totalOrder: totalWeek.total_order, 
            dailySales: dailySales, 
            monthlySales: monthlySales,
            avgDailySpend: avgDailySpend,
            favourites: favourites
        });
    } catch (error) {
        console.error(error);
    }
};

const addProduct = async (req, res) => {
    const { name, price, stock, description } = req.body;
    const image = req.file ? req.file.buffer : null;

    const newDescription = description.replace(/[\r\n]+/g, ' ').trim();
    
    try {
        await db.query(`INSERT INTO products (product_name, price, image, stock, description) VALUES ($1, $2, $3, $4, $5)`, [name, price, image, stock, newDescription]);
        res.redirect('/admin');
    } catch (error) {
        console.error(error);
    }
};

const updateProduct = async (req, res) => {
    const { id, name, price, stock, description } = req.body;
    const image = req.file ? req.file.buffer : null;

    try {
        if (image) {
            await db.query(`
                UPDATE products 
                SET product_name = $1, price = $2, stock = $3, description = $4, image = $5 
                WHERE id_product = $6
            `, [name, price, stock, description, image, id]);
        } else {
            await db.query(`
                UPDATE products 
                SET product_name = $1, price = $2, stock = $3, description = $4
                WHERE id_product = $5
            `, [name, price, stock, description, id]);
        }
        res.redirect('/admin');
    } catch (error) {
        console.error(error);
        res.send("Error updating product");
    }
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM products WHERE id_product = $1', [id]);
        res.redirect('/admin');
    } catch (error) {
        console.error(error);
        res.send("Error deleting product");
    }
};

const addCategory = async (req, res) => {
    const { name, colour: rawColour } = req.body;
    colour = rawColour.replace('#', '');

    try {
        await db.query('INSERT INTO categories (category_name, colour) VALUES ($1, $2)', [name, colour]);
        res.redirect('/admin');
    } catch (error) {
        console.error(error);
        res.send("Error adding category");
    }
};

const updateCategory = async (req, res) => {
    const { id, name, colour: rawColour } = req.body;
    colour = rawColour.replace('#', '');

    try {
        await db.query('UPDATE categories SET category_name = $1, colour = $2 WHERE id_category = $3', [name, colour, id]);
        res.redirect('/admin');
    } catch (error) {
        console.error(error);
        res.send("Error updating category");
    }
};

const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM categories WHERE id_category = $1', [id]);
        res.redirect('/admin');
    } catch (error) {
        console.error(error);
        res.send("Error deleting category");
    }
};

const updateCategoryProduct = async (req, res) => {
    const { id_product, category_ids } = req.body;
    try {
        await db.query('DELETE FROM product_categories WHERE id_product = $1', [id_product]);
        for (let i = 0; i < category_ids.length; i++) {
            await db.query('INSERT INTO product_categories (id_product, id_category) VALUES ($1, $2)', [id_product, parseInt(category_ids[i])]);
        }
        res.redirect('/admin');
    } catch (error) {
        console.error(error);
        res.send(error.message);
    }
};

const logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
    return res.redirect('/login');
};

module.exports = {
    adminFirstPage,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    updateCategoryProduct,
    logout
}