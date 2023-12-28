const { ObjectId } = require('mongodb');
const cart = require('../model/cartSchema')
const product = require('../model/productSchema')
const users = require('../model/userSchema')
const helpers = require('../controller/helpers')

//post for addtocart
const addtoCart = async (req, res) => {
    try {
        const user = await users.findOne({ email: req.session.email });
        console.log(user,"user");
        console.log(user._id);
        const userId = user._id;
        const { itemId, selectedSize } = req.body;

        let cartData = await cart.findOne({ userId });
        if (cartData !== null) {
            const productData = await product.findById(itemId);
            if (productData) {
                const variant = productData.variant.find(variant => variant.size == selectedSize);
                if (variant) {
                    const variantQuantity = variant.quantity;
                    const productIndex = cartData.products.findIndex(item => item.productId == itemId && item.size == selectedSize);
                    if (productIndex !== -1) {
                        if (cartData.products[productIndex].quantity + 1 <= variantQuantity) {
                            cartData.products[productIndex].quantity += 1;
                            await cartData.save();
                            console.log("updated cart");
                            res.status(200).json({ success: true, message: "Item added to cart" });
                        } else {
                            res.status(400).json({ success: false, message: " Product is Currently Out of Stock!!!" });
                        }
                    } else {
                        if (1 <= variantQuantity) {
                            cartData.products.push({
                                productId: itemId,
                                quantity: 1,
                                size: selectedSize,
                            });
                            await cartData.save();
                            console.log("updated cart");
                            res.status(200).json({ success: true, message: "Item added to cart" });
                        } else {
                            res.status(400).json({ success: false, message: "product is currently out of stock" });
                        }
                    }
                }
            }
        } else {
            cartData = await cart.create({
                userId: userId,
                products: [{ productId: itemId, quantity: 1, size: selectedSize }],
            }).catch((err) => {
                console.log(err, "failed to add to the cart");
                res.status(500).json({ error: "failed to add cart" });
            });

            console.log("item added to cart");
            res.status(200).json({ success: true, message: "Item added to cart" });
        }
    } catch (err) {
        console.error("failed", err);
        res.status(500).json({ error: "Internal server error" });
    }
};




//get for addtocart

const getaddtoCart = async (req, res) => {
    try {
        const user = await users.findOne({ email: req.session.email });
        const userId = user._id;
        const cartcount = await helpers.getCartCount(req, res, req.session.email)
        const cartProductData=await helpers.cartProductData(userId)
        // console.log(cartProductData,"cartproductData");
       
        if(cartProductData.length>0){
            const total=await helpers.totalAmount(userId)
            const EachAmount=await helpers.priceofEachitem(userId)
            const tax=Math.round(((total[0].total*18)/100))
            totalPrice=tax+total[0].total
            var i=0
            res.render('./user/addtoCart', { cartProductData, cartcount ,total,tax,totalPrice,EachAmount,i})
        }else{
            res.render('./user/addtoCart', { cartProductData, cartcount })

        }

    } catch (err) {
        console.log(err);
    }
}


//delet from cart

const deletefromCart = async (req, res) => {
    try {
        const itemId = req.params.id
        const email = req.session.email
        const { size } = req.body
        const userData = await users.findOne({ email })
        const userId = userData.id
        const cartData = await cart.findOne({ userId })
        cartData.products = cartData.products.filter((product) => {
            return !(product.productId.equals(itemId) && product.size === parseInt(size));
        })
        await cartData.save()
        res.status(200).json({ success: true, message: "item removed from the cart" })
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Error removing item from cart' });
        console.error(err, "error removing item from cart");
    }
}


const changeQuantity = async (req, res) => {   
    try {
        const user = await users.findOne({ email: req.session.email });
        // console.log(user,"userrrrrrrrrrrrr");
        const userId = user._id;
        let cartDatas = await cart.findOne({ userId });


        if (!cartDatas) {
            return res.status(404).json({ success: false, error: "Cart not found" });
        }
        const productInCart = cartDatas.products.find(item => item.productId.equals(req.body.product) && item.size == parseInt(req.body.size));
        if (!productInCart) {
            return res.status(404).json({ success: false, error: "Product not found in the cart" });
        }
        const productDetails = await product.findById(req.body.product);

        if (!productDetails) {
            return res.status(404).json({ success: false, error: "Product not found in the database" });
        }

        const variant = productDetails.variant.find(variant => variant.size === parseInt(req.body.size));
        if (!variant) {
            return res.status(404).json({ success: false, error: "Variant not found in the product" });
        }
        if (productInCart.quantity + req.body.count > variant.quantity) {
            console.log("Limit exceeded");
            return res.status(400).json({ success: false, error: "Out of Stock!!!(Quantity exceeds available stock)" });
        } else{
            console.log(cartDatas,'...');
            productInCart.quantity += req.body.count;
            await cartDatas.save();

        }
        return res.status(200).json({ success: true, message: "quantity incremented" })
    } catch (err) {
        console.error(err)
    }
}

const checkout = async (req, res) => {
    const user = await users.findOne({ email: req.session.email });
    const userId = user._id;
    var i=0
    const cartcount = await helpers.getCartCount(req, res, req.session.email)
    const cartProductData=await helpers.cartProductData(userId)

    const total=await helpers.totalAmount(userId)
    const taxRate = 18;

        if (total && Array.isArray(total) && total.length > 0 && total[0].total !== undefined) {
            const tax = Math.round((total[0].total * taxRate) / 100);
            totalPrice = tax + total[0].total;
        } else {
            console.error('Error calculating tax: Invalid or missing total data.');
            totalPrice = 0;
        }

    req.session.totalAmount=totalPrice
    const message = req.flash('success')
    res.render('./user/checkout',{cartcount,totalPrice,user,i,message,cartProductData})

}       


module.exports = {
    addtoCart,
    getaddtoCart,
    deletefromCart,
    checkout,
    changeQuantity,

}