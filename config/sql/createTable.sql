CREATE TABLE categories (
	id_category SERIAL PRIMARY KEY NOT NULL,
	category_name VARCHAR(30) NOT NULL,
	colour VARCHAR(10)
);

CREATE TABLE products(
	id_product SERIAL PRIMARY KEY NOT NULL,
	product_name VARCHAR(30) NOT NULL,
	image BYTEA,
	price BIGINT,
	stock INT,
	description TEXT
);

CREATE TABLE product_categories(
	id_product BIGINT PRIMARY KEY NOT NULL,
	id_category BIGINT,
	CONSTRAINT FK_ID_PRODUCT FOREIGN KEY (id_product)
		REFERENCES products(id_product),
	CONSTRAINT FK_ID_CATEGORY FOREIGN KEY (id_category)
		REFERENCES categories(id_category)
);

CREATE TABLE sales(
	id_sales SERIAL PRIMARY KEY NOT NULL,
	cust_name VARCHAR(30),
	total BIGINT,
	orderDate timestamptz,
	payment VARCHAR(30)
);

CREATE TABLE detail_sales(
	id_sales BIGINT PRIMARY KEY NOT NULL,
	id_product BIGINT,
	quantity INT,
	price BIGINT
);