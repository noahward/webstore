const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.write('<title>Matt Dunn Grocery Order List</title>');
    res.write(`<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lato:wght@900&family=Spinnaker&display=swap" rel="stylesheet"></link>
    <style>
    * {
        font-family: 'Spinnaker';
    }
        h1, h2, h3 {
            font-family: 'Lato';
        }
        a {
            color: #5D5D5D;
            font-weight: 600;
            text-decoration: none;
            width: 100%;
            position: relative;
        }
        a::after{
            content: '';
            position: absolute;
            width: 0;
            height: 2px;
            display: block;
            margin-top: 2px;
            right: 0;
            background:  #5D5D5D;
            transition: 0.4s ease;
        }
        a:hover::after {
            width: 100%;
            left: 0;
            background-color:  #5D5D5D;
        }
        table{
            width: 100%;
            margin: 0 auto;
            text-align: left;
        }
        table th {
            text-align: right;
        }
        table tbody{
            width: 100%;
        }
        th, td{
            padding: 15px;
        }
    table, th, td{
        border: 1px solid black;
        border-collapse: collapse;
    }
    
    tr:nth-child(even){
        background-color: #eee;
    }
    
    tr:nth-child(odd){
        background-color: #fff;
    }
    
    th{
        background-color: black;
        color: white;
    }
    table#small {
            width: 50%;
            float: right;
            text-align: left;
    }
    </style>`
    );


    (async function() {
        try {
            //Connect to the database
            //Grab all data
            let pool = await sql.connect(dbConfig);
            let results = await pool
                .request()
                .query(
                    `SELECT orderId, orderDate, ordersummary.customerId, firstName, lastName, totalAmount 
                    FROM ordersummary 
                    INNER JOIN customer ON orderSummary.customerId = customer.customerId`
                );
            
            res.write("<h2>Order Lists</h2>")
            res.write(`<TABLE border="0" cellspacing="2" cellpadding="6" bgcolor="#000000">
                        <TR bgcolor="#ffffff">
                            <TH>Order Id</TH>
                            <TH>Order Date</TH>
                            <TH>Customer Id</TH>
                            <TH>Customer Name</TH>
                            <TH>Total Amount</TH>
                        </TR>
                    `);

            for(let i = 0; i < results.recordset.length; i++) {
                let result = results.recordset[i];
                let orderId = result["orderId"];
                res.write(`<TR align="right" bgcolor="#ffffff">
                                <TD>${result["orderId"]}</TD>
                                <TD>${result["orderDate"].toISOString().replace(/T/, ' ').replace(/\..+/, '')}</TD>
                                <TD>${result["customerId"]}</TD>
                                <TD>${result["firstName"] + " " + result["lastName"]}</TD>
                                <TD>$${result["totalAmount"].toFixed(2)}</TD>
                            </TR>`);

                let results2 = await pool.request()
                    .input('orderId', sql.Int(), orderId)
                    .query("SELECT productId, quantity, price FROM orderproduct WHERE orderId = @orderId");
                
                if(results2.recordset.length!==0){
                    res.write(`<TR align="right" bgcolor="#ffffff">
                                <TD colspan="5">
                                    <TABLE id="small" border="0" cellspacing="2" cellpadding="4">
                                        <TH>Product Id</TH>
                                        <TH>Quantity</TH>
                                        <TH>Price</TH>
                                `);
                }
                for(let j = 0; j < results2.recordset.length; j++) {
                    let result2 = results2.recordset[j];
                    res.write(`<TR>
                                    <TD>${result2["productId"]}</TD>
                                    <TD>${result2["quantity"]}</TD>
                                    <TD>$${result2["price"].toFixed(2)}</TD>
                                </TR>
                    `)
                }
                if(results2.recordset.length!==0){
                    res.write("</TABLE></TD></TR>");
                }
                //Print results

                // let orderId = result[0];

                // let result2 = await pool.request()
                //     .input('orderId', sql.Int(), orderId)
                //     .query("SELECT ")
            }
            res.write("</table>");

            res.end();




        } catch(err) {
            console.dir(err);
            res.send(err)
        }
    })();

    /** Create connection, and validate that it connected successfully **/


    /**
    Useful code for formatting currency:
        let num = 2.87879778;
        num = num.toFixed(2);
    **/

    /** Write query to retrieve all order headers **/

    /** For each order in the results
            Print out the order header information
            Write a query to retrieve the products in the order

            For each product in the order
                Write out product information 
    **/

});

module.exports = router;
