const easyinvoice=require('easyinvoice')
const path=require('path')
const fs=require('fs')

module.exports={

    generateInvoice:async(orderData)=>{
        try{

            var data={
                "customize":{

                },
                "images":{
                    "logo": "https://img.freepik.com/free-vector/modern-sport-sneakers-blue-color-with-white-shoelaces-realistic-single-image-white-background-isolated-illustration_1284-31208.jpg?size=626&ext=jpg&ga=GA1.1.580309104.1704433060&semt=ais",
                },
                "sender": {
                    "company": "Shoex Official",
                    "address": "Meppayur",
                    "zip": "673524",
                    "city": "Calicut",
                    "country": "Kerala",
                    "gmail":"shoexoff@gmail.com"
                },
                "client": {
                   
                },
                "information": {
                    "date": new Date(orderData[0].orderDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
                },
                "products": (orderData[0].items && orderData[0].items.length > 0) ? orderData[0].items.map((product) => ({
                    "quantity": product.quantity,
                    "description": product.productName, 
                    "tax-rate": 18,
                    "price": product.price
                })) : [],
                
    
                "bottom-notice": "Thank You For Your Purchase",
                "settings": {
                    "currency": "USD",
                    "tax-notation": "vat",
                    "currency": "INR",
                    "tax-notation": "GST",
                    "margin-top": 50,
                    "margin-right": 50,
                    "margin-left": 50,
                    "margin-bottom": 25
                },
    
          
        }

            const result = await easyinvoice.createInvoice(data);

            const filePath = path.join(__dirname, '../public', 'pdf', `${orderData[0]._id}.pdf`);
            await fs.promises.writeFile(filePath, result.pdf, 'base64');

            return filePath;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
            }
            
      

    
