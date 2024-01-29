const ejs = require('ejs');
const pdf = require('html-pdf');
const fs = require('fs');
const exceljs = require('exceljs');
const datefns=require('date-fns')
const salesPdf=require('./salesreport')

module.exports = {
    downloadReport: async (req, res, orders, startDate, endDate, totalSales, format) => {
      console.log(startDate,endDate);
      console.log(orders);
      const formattedStartDate = datefns.format(new Date(startDate), 'yyyy-MM-dd');
      const formattedEndDate = datefns.format(new Date(endDate), 'yyyy-MM-dd');
      try {
        if (format === 'pdf') {
         
          const pdfGenarate=await  salesPdf(orders,startDate,endDate)
          // console.log("pdf generated success fully");
          res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=sales Report.pdf"
      );
        // console.log('pdf....');
      res.status(200).end(pdfGenarate);

        } else if (format === 'excel') {
          const workbook = new exceljs.Workbook();
          const worksheet = workbook.addWorksheet('Sales Report');
  
          worksheet.columns = [
            { header: 'Order ID', key: 'orderId', width: 25 },
            { header: 'Product Name', key: 'productName', width: 25 },
            { header: 'User ID', key: 'userId', width: 25},
            { header: 'Date', key: 'date', width: 25 },
            { header: 'Total Amount', key: 'totalamount', width: 25 },
            { header: 'Payment Method', key: 'paymentmethod', width: 25 },
          ];
  
          let totalSalesAmount = 0;
  
          orders.forEach(order => {
          // console.log(orders);
            order.items.forEach(item => {
              // console.log(item,'------------------');
              worksheet.addRow({
                orderId: order._id,
                productName: item.productId.name,
                userId: order.userId,
                date: order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '',
                totalamount: order.totalPrice !== undefined ? order.totalPrice.toFixed(2) : '',
                paymentmethod: order.paymentMethod,
              });

             
              totalSalesAmount += order.totalPrice !== undefined ? order.totalPrice : 0;
        
            });
          });
  
          
          worksheet.addRow({ totalamount: 'Total Sales Amount', paymentmethod: totalSalesAmount.toFixed(2) });
  
          const excelFilePath = `public/salesReport/excel/sales-report-${formattedStartDate}-${formattedEndDate}.xlsx`;
          await workbook.xlsx.writeFile(excelFilePath);
  
          res.status(200).download(excelFilePath);
        } else {
          res.status(400).send('Invalid download format');
        }
      } catch (error) {
        console.error('Error generating report:', error);
        res.render('admin/404')
      }
    },
};