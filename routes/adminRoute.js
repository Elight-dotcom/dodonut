const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const {
    adminFirstPage,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    updateCategoryProduct,
    logout
} = require('../controllers/adminController');


router.get("/", adminFirstPage);
router.post("/add", upload.single('image'), addProduct);
router.post("/edit", upload.single('image'), updateProduct);
router.delete("/delete/:id", deleteProduct);
router.post("/category/add", addCategory);
router.post("/category/edit/:id", updateCategory);
router.delete("/category/delete/:id", deleteCategory);
router.post("/product-category/edit", updateCategoryProduct);
router.delete("/product-category/delete/:id", deleteCategory);
router.get("/logout", logout);

module.exports = router;