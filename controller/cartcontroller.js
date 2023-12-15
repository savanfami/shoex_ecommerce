const { ObjectId } = require('mongodb');
const cart = require('../model/cartSchema')
const product = require('../model/productSchema')
const users = require('../model/userSchema')


//post for addtocart
const addtoCart = async (req, res) => {
    try {
        const user = await users.findOne({ email: req.session.email });
        const userId = user.id;
        const { itemId, selectedSize } = req.body;
        // console.log(req.body, "aaaaaaaaaaaaaaaaaaaaaa");
        let cartData = await cart.findOne({ userId });
        // console.log(itemId, "item id dddddddddddddddd");
        // console.log(cartData?.products, "products inside cartdata");
        // console.log(cartData, "cart");

        if (cartData !== null) {
            const productIndex = cartData.products.findIndex(item => item.productId == itemId && item.size == selectedSize);
            if (productIndex !== -1) {
                cartData.products[productIndex].quantity += 1;
            } else {
                cartData.products.push({
                    productId: itemId,
                    quantity: 1,
                    size: selectedSize,
                });
            }

            await cartData.save();
            console.log("updated cart");
            res.status(200).json({ success: true, message: "Item added to cart" });
        } else {
            cartData = await cart.create({
                userId: userId,
                products: [{ productId: itemId, quantity: 1, size: selectedSize }],
            }).catch((err) => {
                console.log(err, "failed to add to the cart");
                res.status(500).json({error:"failed to add cart"})
            });

            console.log("item added to cart");
            res.status(200).json({ success: true, message: "Item added to cart" });
        }
    } catch (err) {
        console.error("failed", err);
    }
};



//get for addtocart

const getaddtoCart = async (req, res) => {
    try {
        const user = await users.findOne({ email: req.session.email });
        const userId = user.id;
        const cartProductData= await cart.aggregate([
            {
                $match: { userId: new ObjectId(userId) }
            }, {
                $unwind: '$products'
            },
            {
                $project: {
                    item: '$products.productId',
                    quantity: '$products.quantity',
                    size: '$products.size'
                }
            },
            {
                $lookup:
                {
                    from: 'products',
                    localField: 'item',
                    foreignField: '_id',
                    as: 'cartItems'
                }
            },
            {
                $project: {
                    item: 1,
                    quantity: 1,
                    size: 1,
                    product: { $arrayElemAt: ['$cartItems', 0] }
                }
            }
        ])
        // const relatedData = await product.find({ brand: cartProductData[0].product.brand, category:cartProductData[0].product.category }).limit(4)
        // const RelatedDatas = relatedData.filter(item => item._id.toString() !== cartProductData._id.toString());
        res.render('./user/addtoCart',{cartProductData})
        // console.log(RelatedDatas,"relkaaaaaaaaaaaaaaaaa");
        // console.log(cartProductData,"dddddddddddddddddddddddddddddddddddddddddddddd");
    } catch (err) {
        console.log(err);
    }
}


//delet from cart

const deletefromCart=async(req,res)=>{
    try{
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaaa");
        const itemId=req.params.id
        console.log(itemId,"item id");
    }
catch(err){
    console.log(err);
}
}


module.exports = {
    addtoCart,
    getaddtoCart,
    deletefromCart
  
}