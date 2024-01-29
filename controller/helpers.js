const { ObjectId } = require('mongodb')
const cart = require('../model/cartSchema')
const user = require('../model/userSchema')
const { count } = require('console')
const order = require('../model/orderSchema');


const getCartCount = async (req, res, userId) => {
    try {

        let count = 0
        const userData = await user.findOne({ email: userId })
        if(!userData){
            return count
        }
        const cartData = await cart.findOne({ userId: new ObjectId(userData._id) })
        if (cartData) {
            count = cartData.products.length
            return count
        }

    } catch (err) {
console.log(err);    }
}

const totalAmount = async (user) => {
  const totalAmount = await cart.aggregate([
      {
          $match: { userId: user }
      },
      {
          $unwind: '$products'
      },
      {
          $project: {
              item: '$products.productId',
              quantity: '$products.quantity'
          }
      },
      {
          $lookup: {
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
              product: { $arrayElemAt: ['$cartItems', 0] }
          }
      },
      {
          $group: {
              _id: null,
              total: {
                  $sum: {
                      $multiply: [
                          '$quantity',
                          {
                              $cond: {
                                  if: { $gt: ['$product.discountAmount', 0] },
                                  then: '$product.discountAmount',
                                  else: '$product.price'
                              }
                          }
                      ]
                  }
              }
          }
      }
  ]);

  return totalAmount;
};


const cartProductData = async (user) => {
    const cartData = await cart.aggregate([
        {
            $match: { userId: new ObjectId(user) }
        },
        {
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
            $lookup: {
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
        },
        {
            $match: {
                'product.status': true
            }
        }
    ]);
    return cartData;
};



const priceofEachitem = async (user) => {
  const EachAmount = await cart.aggregate([
      {
          $match: { userId: user }
      },
      {
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
          $lookup: {
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
      },
      {
          $project: {
              total: {
                  $sum: {
                      $multiply: [
                          '$quantity',
                          {
                              $cond: {
                                  if: { $gt: ['$product.discountAmount', 0] },
                                  then: '$product.discountAmount',
                                  else: '$product.price'
                              }
                          }
                      ]
                  }
              }
          }
      }
  ]);

  return EachAmount;
};




const orderDataforInvoice = async (orderId) => {
    const orderData = await order.aggregate([
        {
            $match: { _id: new ObjectId(orderId) }
        },
        {
            $unwind: '$items'
        },
        {
            $match: { 'items.status': 'Ordered' }
        },
        {
            $lookup: {
                from: 'products',
                localField: 'items.productId',
                foreignField: '_id',
                as: 'productData'
            }
        },
        {
            $group: {
                _id: '$_id',
                status: { $first: '$status' },
                userId: { $first: '$userId' },
                items: {
                    $push: {
                        _id: '$items._id',
                        price: '$items.price',
                        productId: '$items.productId',
                        size: '$items.size',
                        quantity: '$items.quantity',
                        productName: { $arrayElemAt: ['$productData.name', 0] }
                    }
                },
                paymentMethod: { $first: '$paymentMethod' },
                totalPrice: { $first: '$totalPrice' },
                orderDate: { $first: '$orderDate' },
                arrivingDate: { $first: '$arrivingDate' },
            }
        }
    ])
    return orderData;
}



const productData = async () => {
    const productData = await order.aggregate([
        {
          $match: {
            'items.status': 'return requested',
          },
        },
        {
          $unwind: '$items',
        },
        {
          $match: {
            'items.status': 'return requested',
          },
        },
        {
          $lookup: {
            from: 'products',
            localField: 'items.productId',
            foreignField: '_id',
            as: 'productDetails',
          },
        },
        {
          $unwind: '$productDetails',
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        {
          $unwind: '$userDetails',
        },
        {
          $project: {
            orderId: '$_id',
            orderStatus: '$status',
            username: '$userDetails.username',
            userId:'$userId',
            productDetails: {
              _id: '$items._id',
              name: '$productDetails.name',
              image:'$productDetails.images',
              price: '$items.price',
              size: '$items.size',
              quantity: '$items.quantity',
              status: '$items.status',
              Returnreason: '$items.Returnreason',
            },
            address: '$address',
            paymentMethod: '$paymentMethod',
            paymentStatus: '$paymentStatus',
            totalPrice: '$totalPrice',
            orderDate: '$orderDate',
            arrivingDate: '$arrivingDate',
            reason: '$reason',
            
          },
        },
      ]);
    
        return productData      
      
  };


  const returnData = async () => {
    const returnData = await order.aggregate([
        {
          $match: {
            'items.status': 'return Accepted',
          },
        },
        {
          $unwind: '$items',
        },
        {
          $match: {
            'items.status': 'return Accepted',
          },
        },
        {
          $lookup: {
            from: 'products',
            localField: 'items.productId',
            foreignField: '_id',
            as: 'productDetails',
          },
        },
        {
          $unwind: '$productDetails',
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        {
          $unwind: '$userDetails',
        },
        {
          $project: {
            orderId: '$_id',
            orderStatus: '$status',
            username: '$userDetails.username',
            userId:'$userId',
            productDetails: {
              _id: '$items._id',
              name: '$productDetails.name',
              image:'$productDetails.images',
              price: '$items.price',
              size: '$items.size',
              quantity: '$items.quantity',
              status: '$items.status',
              Returnreason: '$items.Returnreason',
            },
            address: '$address',
            paymentMethod: '$paymentMethod',
            paymentStatus: '$paymentStatus',
            totalPrice: '$totalPrice',
            orderDate: '$orderDate',
            arrivingDate: '$arrivingDate',
            reason: '$reason',
            
          },
        },
      ]);
 
        return returnData      
      
  };


  const rejectedData = async () => {
    const rejectedData = await order.aggregate([
        {
          $match: {
            'items.status': 'return rejected',
          },
        },
        {
          $unwind: '$items',
        },
        {
          $match: {
            'items.status': 'return rejected',
          },
        },
        {
          $lookup: {
            from: 'products',
            localField: 'items.productId',
            foreignField: '_id',
            as: 'productDetails',
          },
        },
        {
          $unwind: '$productDetails',
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        {
          $unwind: '$userDetails',
        },
        {
          $project: {
            orderId: '$_id',
            orderStatus: '$status',
            username: '$userDetails.username',
            userId:'$userId',
            productDetails: {
              _id: '$items._id',
              name: '$productDetails.name',
              image:'$productDetails.images',
              price: '$items.price',
              size: '$items.size',
              quantity: '$items.quantity',
              status: '$items.status',
              Returnreason: '$items.Returnreason',
            },
            address: '$address',
            paymentMethod: '$paymentMethod',
            paymentStatus: '$paymentStatus',
            totalPrice: '$totalPrice',
            orderDate: '$orderDate',
            arrivingDate: '$arrivingDate',
            reason: '$reason',
            
          },
        },
      ]);
        console.log(rejectedData,"rejected datas");
        return rejectedData      
      
  };


  const bestseller=async(req,res)=>{
    try{

      const bestseller = await order.aggregate([
        {
            $unwind: '$items'
        },
        {
            $group: {
                _id: '$items.productId',
                totalCount: { $sum: '$items.quantity' },
                size: { $first: '$items.size' }, 
                quantity: { $first: '$items.quantity' } 
            }
        },
        {
            $sort: {
                totalCount: -1
            }
        },
        {
            $limit: 4
        },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'productDetails'
            }
        },
        {
            $unwind: '$productDetails'
        },
        {
            $project: {
                _id: 1,
                totalCount: 1,
                size: 1, 
                quantity: 1, 
                productDetails: 1
            }
        }
    ]);
    return bestseller

    }catch(err){
      console.error(err)
    }
  }

module.exports = {
    orderDataforInvoice
};




module.exports = {
    getCartCount,
    totalAmount,
    priceofEachitem,
    cartProductData,
    orderDataforInvoice,
    productData,
    returnData,
    rejectedData,
    bestseller

} 