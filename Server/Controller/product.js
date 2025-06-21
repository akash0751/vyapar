const Product = require('../Model/product')
const path = require('path');
const fs = require('fs');


//Add new product

const AddProduct = async (req, res) => {
    try {
        // Check if the user is an admin
        if (req.user.role !== 'admin') {
            return res.status(401).json({ message: 'You are not authorized to perform this action' });
        }

        // Extracting data from the request body
        const { title, description, category, price, stock,offerDescription } = req.body;
        const image = req.file;  // Assuming image is uploaded via a file input

        // Check if the image is provided
        if (!image) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        // Create a new product with the user who added it
        const product = await Product.create({
            title: title,
            description: description,
            category: category,
            price: price,
            stock: stock,
            offerDescription: offerDescription,
            image: image.filename,
            user: req.user.id  // Reference the authenticated user who added the product
        });

        // Return success response
        res.status(201).json({ message: 'Product added successfully', product });
    } catch (error) {
        // Return error response in case of any issues
        console.error(error);
        res.status(500).json({ message: 'Error occurred while adding the product' });
    }
};


//get product 
const GetProduct = async (req, res) => {
    try {
        const product = await Product.find()
        

        res.status(200).json({product})
        console.log(product.image)

    }catch(error){
        res.status(500).json({message: 'Error Occured'})
    }
}

//get product by id
const GetProductById = async (req, res) => {
    try {
        const id = req.params.id
        const product = await Product.findById(id)
        if(!product){
            return res.status(404).json({message:'Product not found'})
            }
            res.status(200).json({product})
    }catch{
        res.status(500).json({message: 'Error Occured'})
    }
}

// update product
const UpdateProduct = async (req, res) => {
     try {
        const id = req.params.id;

        // Role check
        if (req.user.role !== 'admin') {
            return res.status(401).json({ message: 'You are not authorized to perform this action' });
        }

        const { title, description, category, price, stock ,offerDescription} = req.body;
        const image = req.file;

        // Find existing product
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update fields
        if (title) product.title = title;
        if (description) product.description = description;
        if (category) product.category = category;
        if (price) product.price = price;
        if (stock) product.stock = stock;
        if(offerDescription) product.offerDescription = offerDescription;
        if (image) product.image = `/uploads/${image.filename}`;

        // Save updated product
        const updatedProduct = await product.save();

        res.status(200).json({
            message: 'Product updated successfully',
            product: updatedProduct,
        });

    } catch (error) {
        console.error("UpdateProduct error:", error);
        res.status(500).json({ message: 'Error occurred during product update' });
    }
};


//delete product
const DeleteProduct = async (req, res) => {
    try {
        const id = req.params.id;

        // Role check
        if (req.user.role !== 'admin') {
            return res.status(401).json({ message: 'You are not authorized to perform this action' });
        }

        // Find the product
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Delete the image file from the uploads folder
        if (product.image) {
            const imagePath = path.join(__dirname, '..', product.image); // Adjust path if needed
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

module.exports ={AddProduct,GetProduct,GetProductById,UpdateProduct,DeleteProduct};
