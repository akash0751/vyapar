const express = require('express')
const router = express.Router()
const ProductMeta = require('../Model/productMeta')
const {addProductMeta, getProductMeta, updateProductMeta, deleteProductMeta} = require('../Controller/productMetaController')
const {authenticateJWT} = require('../Middleware/Authorization')

router.post("/addMeta", authenticateJWT, addProductMeta);
router.get("/productMeta/:productId", getProductMeta);
router.put("/productMeta/:id", authenticateJWT, updateProductMeta);
router.delete("productMeta/:id", authenticateJWT, deleteProductMeta);
router.get('/productMeta/all', authenticateJWT, async (req, res) => {
  try {
    const metas = await ProductMeta.find().populate('product', 'title').populate('addedBy', 'name');
    res.json({ success: true, meta: metas });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
module.exports = router;