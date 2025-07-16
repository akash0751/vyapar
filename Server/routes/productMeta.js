const express = require('express')
const router = express.Router()
const {addProductMeta, getProductMeta, updateProductMeta, deleteProductMeta} = require('../Controller/productMetaController')
const {authenticateJWT} = require('../Middleware/Authorization')

router.post("/addMeta", authenticateJWT, addProductMeta);
router.get("/meta/:productId", getProductMeta);
router.put("/updateMeta/:id", authenticateJWT, updateProductMeta);
router.delete("deleteMeta/:id", authenticateJWT, deleteProductMeta);

module.exports = router;