const order=require('../model/orderSchema')
const moment=require("moment")
const pdf=require('../util/pdfgenerator')











const salesReport=async(req,res)=>{
    try {
      const orders = await order.find({
        status: {
          $nin: ["Cancelled","rejected","returned"]
        }
      }).populate({
        path: 'items.productId',
        model: 'product',
        select: 'category',
      });
      // console.log(orders,"ooooooooooooooooooooooooooooooooo");
  
      const orderCountsByDay = {};
      const totalAmountByDay = {};
      const orderCountsByMonthYear = {};
      const totalAmountByMonthYear = {};
      const orderCountsByYear = {};
      const totalAmountByYear = {};
      const orderCountsByCategory = {};
      let labelsByCount;
      let labelsByAmount;
      let labelsByCategory;

      orders.forEach((order) => {
        
        const orderDate = moment(order.orderDate, "M/D/YYYY, h:mm:ss A");
        const dayMonthYear = orderDate.format("YYYY-MM-DD");
        const monthYear = orderDate.format("YYYY-MM");
        const year = orderDate.format("YYYY");
        
        if (req.url === "/count-orders-by-day") {
         
          if (!orderCountsByDay[dayMonthYear]) {
            orderCountsByDay[dayMonthYear] = 1;
            totalAmountByDay[dayMonthYear] = order.totalPrice
           
           
          } else {
            orderCountsByDay[dayMonthYear]++;
            totalAmountByDay[dayMonthYear] += order.totalPrice
          }
  
          const ordersByDay = Object.keys(orderCountsByDay).map(
            (dayMonthYear) => ({
              _id: dayMonthYear,
              count: orderCountsByDay[dayMonthYear],
            })
          );
       
  
          const amountsByDay = Object.keys(totalAmountByDay).map(
            (dayMonthYear) => ({
              _id: dayMonthYear,
              total: totalAmountByDay[dayMonthYear],
            })
          );
  
          
  
          amountsByDay.sort((a,b)=> (a._id < b._id ? -1 : 1));
          ordersByDay.sort((a, b) => (a._id < b._id ? -1 : 1));
  
         
  
          labelsByCount = ordersByDay.map((entry) =>
            moment(entry._id, "YYYY-MM-DD").format("DD MMM YYYY")
          );
  
          labelsByAmount = amountsByDay.map((entry) =>
            moment(entry._id, "YYYY-MM-DD").format("DD MMM YYYY")
          );
  
          dataByCount = ordersByDay.map((entry) => entry.count);
          dataByAmount = amountsByDay.map((entry) => entry.total);
  
          order.items.forEach((product) => {
          const category = product.productId.category;

          if (!orderCountsByCategory[category]) {
            orderCountsByCategory[category] = 1;
          } else {
            orderCountsByCategory[category]++;
          }
        });
  
        } else if (req.url === "/count-orders-by-month") {
          if (!orderCountsByMonthYear[monthYear]) {
            orderCountsByMonthYear[monthYear] = 1;
            totalAmountByMonthYear[monthYear] = order.totalPrice;
          } else {
            orderCountsByMonthYear[monthYear]++;
            totalAmountByMonthYear[monthYear] += order.totalPrice;
          }
        
          const ordersByMonth = Object.keys(orderCountsByMonthYear).map(
            (monthYear) => ({
              _id: monthYear,
              count: orderCountsByMonthYear[monthYear],
            })
          );
          const amountsByMonth = Object.keys(totalAmountByMonthYear).map(
            (monthYear) => ({
              _id: monthYear,
              total: totalAmountByMonthYear[monthYear],
            })
          );
         
        
          ordersByMonth.sort((a, b) => (a._id < b._id ? -1 : 1));
          amountsByMonth.sort((a, b) => (a._id < b._id ? -1 : 1));
        
          labelsByCount = ordersByMonth.map((entry) =>
            moment(entry._id, "YYYY-MM").format("MMM YYYY")
          );
          labelsByAmount = amountsByMonth.map((entry) =>
            moment(entry._id, "YYYY-MM").format("MMM YYYY")
          );
          dataByCount = ordersByMonth.map((entry) => entry.count);
          dataByAmount = amountsByMonth.map((entry) => entry.total);
          order.items.forEach((product) => {
            const category = product.productId.category;
  
            if (!orderCountsByCategory[category]) {
              orderCountsByCategory[category] = 1;
            } else {
              orderCountsByCategory[category]++;
            }
          });
        } else if (req.url === "/count-orders-by-year") {
          // Count orders by year
          if (!orderCountsByYear[year]) {
            orderCountsByYear[year] = 1;
            totalAmountByYear[year] = order.totalPrice;
          } else {
            orderCountsByYear[year]++;
            totalAmountByYear[year] += order.totalPrice;
          }
        
          const ordersByYear = Object.keys(orderCountsByYear).map((year) => ({
            _id: year,
            count: orderCountsByYear[year],
          }));
          const amountsByYear = Object.keys(totalAmountByYear).map((year) => ({
            _id: year,
            total: totalAmountByYear[year],
          }));
        
          ordersByYear.sort((a, b) => (a._id < b._id ? -1 : 1));
          amountsByYear.sort((a, b) => (a._id < b._id ? -1 : 1));
        
          labelsByCount = ordersByYear.map((entry) => entry._id);
          labelsByAmount = amountsByYear.map((entry) => entry._id);
          dataByCount = ordersByYear.map((entry) => entry.count);
          dataByAmount = amountsByYear.map((entry) => entry.total);
          order.items.forEach((product) => {
            const category = product.productId.category;
  
            if (!orderCountsByCategory[category]) {
              orderCountsByCategory[category] = 1;
            } else {
              orderCountsByCategory[category]++;
            }
          });
        }
      });
      const ordersByCategory = Object.keys(orderCountsByCategory).map((category) => ({
        _id: category,
        count: orderCountsByCategory[category],
      }));
      ordersByCategory.sort((a, b) => (a.count < b.count ? 1 : -1));

      // Set labels and data for category chart
      labelsByCategory = ordersByCategory.map((entry) => entry._id);
      const dataByCategory = ordersByCategory.map((entry) => entry.count);
    
     
      res.json({ labelsByCount,labelsByAmount, dataByCount, dataByAmount, dataByCategory,labelsByCategory  });
      
  
    } catch (error) {
      res.render('admin/404') 
      console.error("error while chart loading :",error)
    }
  }
  




  const getOrderandSellers = async (req, res) => {
    try {
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
                $limit: 5
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

        // console.log(bestseller, "besteselllerrrrrrrrr");
        if (!bestseller) throw new Error("no data found");
        res.json({ bestseller });

    } catch (err) {
        console.error(err);
    }
}





const genereatesalesReport = async (req, res) => {
    try {

      const startDate = req.body.startDate;
      // console.log(startDate);
      const format = req.body.downloadFormat;
      const endDate = new Date(req.body.endDate);
      endDate.setHours(23, 59, 59, 999);
  
      const orders = await order.find({
        status: {
          $nin: ["Cancelled","rejected","returned"]
        },
        paymentStatus: { $in: ["Paid", "pending"] },
        orderDate: {
          $gte: startDate,
          $lte: endDate,
        },
      }).populate("items.productId");
      
  
      let totalSales = 0;
  
      orders.forEach((order) => {
        totalSales += order.totalPrice || 0;
      });
      
  
      pdf.downloadReport(
        req,
        res,
        orders,
        startDate,
        endDate,
        totalSales.toFixed(2),
        format
      );
    } catch (error) {
      res.render('admin/404')
      res.status(500).send("Internal Server Error");
    }
  };




module.exports={
    getOrderandSellers,
    genereatesalesReport,
    salesReport
}