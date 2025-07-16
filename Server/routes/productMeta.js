const express = require('express')
const router = express.Router()
const {addProductMeta, getProductMeta, updateProductMeta, deleteProductMeta} = require('../Controller/productMetaController')
const {authenticateJWT} = require('../Middleware/Authorization')

router.post("/", authenticateJWT, addProductMeta);
router.get("/:productId", getProductMeta);
router.put("/:id", authenticateJWT, updateProductMeta);
router.delete("/:id", authenticateJWT, deleteProductMeta);

module.exports = router;