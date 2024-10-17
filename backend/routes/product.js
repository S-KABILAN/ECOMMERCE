const express = require('express');
const { getProducts, newProduct, getSingleProduct, updateProduct, deleteProduct } = require('../controllers/ProductController');
const router = express.Router();
const {isAuthendicatedUser, authorizeRoles} = require('../midddlewares/authenticate')

router.route('/products').get(isAuthendicatedUser,getProducts);
router.route('/product/new').post(isAuthendicatedUser,authorizeRoles('admin'),newProduct);
router.route('/product/:id')
.get(getSingleProduct)
.put(updateProduct)
.delete(deleteProduct)


module.exports = router;