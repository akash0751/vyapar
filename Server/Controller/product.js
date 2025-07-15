const Product = require('../Model/product');
const path = require('path');
const fs = require('fs');

// Add new product
const AddProduct = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(401).json({ message: 'You are not authorized to perform this action' });
        }

        const { title, description, category, price, offerDescription, shopStocks } = req.body;
        const image = req.file;

        

        // Parse shopStocks if it's sent as a JSON string
        let parsedShopStocks;
        try {
            parsedShopStocks = typeof shopStocks === 'string' ? JSON.parse(shopStocks) : shopStocks;
        } catch (error) {
            return res.status(400).json({ message: 'Invalid shopStocks format' });
        }

        const product = await Product.create({
            title,
            description,
            category,
            price,
            offerDescription,
            shopStocks: parsedShopStocks,
            image: image.filename,
            user: req.user.id
        });

        res.status(201).json({ message: 'Product added successfully', product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error occurred while adding the product' });
    }
};

// Get all products
const GetProduct = async (req, res) => {
    try {
        const product = await Product.find();
        res.status(200).json({ product });
    } catch (error) {
        res.status(500).json({ message: 'Error Occurred' });
    }
};

// Get product by ID
const GetProductById = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ product });
    } catch (error) {
        res.status(500).json({ message: 'Error Occurred' });
    }
};

// Update product
const UpdateProduct = async (req, res) => {
    try {
        const id = req.params.id;
        if (req.user.role !== 'admin') {
            return res.status(401).json({ message: 'You are not authorized to perform this action' });
        }

        const { title, description, category, price, offerDescription, shopStocks } = req.body;
        const image = req.file;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update fields
        if (title) product.title = title;
        if (description) product.description = description;
        if (category) product.category = category;
        if (price) product.price = price;
        if (offerDescription) product.offerDescription = offerDescription;

        // Handle shopStocks
        if (shopStocks) {
            try {
                product.shopStocks = typeof shopStocks === 'string' ? JSON.parse(shopStocks) : shopStocks;
            } catch (error) {
                return res.status(400).json({ message: 'Invalid shopStocks format' });
            }
        }

        // Update image
        if (image) {
            product.image = image.filename;
        }

        const updatedProduct = await product.save();
        res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });

    } catch (error) {
        console.error("UpdateProduct error:", error);
        res.status(500).json({ message: 'Error occurred during product update' });
    }
};

// Delete product
const DeleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        if (req.user.role !== 'admin') {
            return res.status(401).json({ message: 'You are not authorized to perform this action' });
        }

        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Delete image file if exists
        if (product.image) {
            const imagePath = path.join(__dirname, '..', 'uploads', product.image);
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error('Error deleting image file:', err);
                } else {
                    console.log('Image deleted:', product.image);
                }
            });
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Error occurred during deletion' });
    }
};

module.exports = {
    AddProduct,
    GetProduct,
    GetProductById,
    UpdateProduct,
    DeleteProduct
};
