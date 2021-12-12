const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');

	// TODO: Get order id
    orderId = req.query.orderid
          
    sqlQuery = `SELECT productId, productName, 
    FROM product
    INNER JOIN category
    ON category.categoryId = product.categoryId`;

	// // TODO: Check if valid order id
	// if(!isNaN(orderId) || orderId > 0) { // Valid id check
    //     sqlQuery += ` WHERE productId = ${id}`
    // }

    (async function() {
        try {
            let pool = await sql.connect(dbConfig);
	   	
	   	// TODO: Retrieve all items in order with given id
           let results2 = await pool
           .request()
           .query(
               `Select *
               From orderproduct
               Where orderId = ${orderId}`
           );

           console.debug(results2)

           let warehouse = await pool.request()
           .query(
                `SELECT *
                FROM warehouse
                INNER JOIN productInventory ON warehouse.warehouseId = productInventory.warehouseId
                Where warehouse.warehouseId = 1`
           );


           let transAproved = true
           for(let i = 0; i < results2.recordset.length; i++){
                result = results2.recordset[i];
                console.debug(result)
                let warehouses = await pool.request()
                .query(
                        `SELECT *
                        FROM warehouse
                        INNER JOIN productInventory ON warehouse.warehouseId = productInventory.warehouseId
                        Where warehouse.warehouseId = 1
                        AND productId = ${result["productId"]}`
                );
                let warehouse = warehouses.recordset[0]
                console.log(warehouse.recordset)
                if(result["quantity"] <= warehouse["quantity"]){
                    console.log("good")
                } else {
                    transAproved = false
                    res.write("<h1>Error Occured Not Enough Products</h1>")
                    res.end();
                }
           }

        // This makes sure there are enough resource in the warehouse, if there isnt the code returns and the transaction does not run
           if (!transAproved) {
               return
           }

	   	// TODO: Create a new shipment record.
           let addShipment = await pool
           .request()
           .query(
               `INSERT INTO shipment VALUES ('${new Date().toISOString()}', 'Order shipment: ${orderId}', 1)`
           );


	   	// TODO: For each item verify sufficient quantity available in warehouse 1.
        for(let i = 0; i < results2.recordset.length; i++){
            result = results2.recordset[i];
            let warehouses = await pool.request()
            .query(
                    `SELECT *
                    FROM warehouse
                    INNER JOIN productInventory ON warehouse.warehouseId = productInventory.warehouseId
                    Where warehouse.warehouseId = 1
                    AND productId = ${result["productId"]}`
            );
            let warehouse = warehouses.recordset[0]
            console.log(warehouse.recordset)
            
            // Update Inventory
            await pool.request().query(`UPDATE productInventory SET quantity = ${warehouse["quantity"] - result["quantity"]} WHERE productId = ${result["productId"]} AND warehouseId = 1`)
            
            res.write(`<h3>Order product: ${result["productId"]} Qty: ${result["quantity"]} Previous inventory: ${warehouse["quantity"]} New Inventory: ${warehouse["quantity"] - result["quantity"]}</h3>`)
         }
         res.write("<h2>Please text credit card info (<small>dont forget the three numbers on the back</small>) along with your SSN to (587) 215-3111 to complete the shipment process. <br></br> HAVE A GREAT DAY!!!</h2><br></br><h3><a href='/'>Back to Main Menu</a></h3>")

         
	   		res.end()
 
        } catch(err) {
            console.dir(err);
            res.write(err + "")
            res.end();
        }
    })();
});

module.exports = router;
