const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.write(`<title>YOUR NAME Grocery Order Processing</title>`);
    res.write(`<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lato:wght@900&family=Spinnaker&display=swap" rel="stylesheet">
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
        background-color: #fff;
    }
    
    tr:nth-child(odd){
        background-color: #eee;
    }
    
    th{
        background-color: black;
        color: white;
    }
    </style>`)

    let productList = false;
    if (req.session.productList && req.session.productList.length > 0) {
        productList = req.session.productList;
    }

    // Get user inputted values from the form
    let custId = req.query.customerId; 
    var street = String(req.query.street);
    let city = String(req.query.city);
    let state = String(req.query.state);
    let postal = String(req.query.postal);
    let country = String(req.query.country);
    let payType = String(req.query.payType);
    let cardNum = String(req.query.payNumber);
    let expiry = Date(req.query.payExpiry);
    
    if (custId == null || custId == "") {
        res.write("<h1>Customer id not valid</h1>");
    } else if (productList == null) {
        res.write("<h1>There are no products in your cart</h1>");
    } else {
        // Ensure custId is a number
        let x = -1;
        try {
            x = parseInt(custId);
        } catch (err) {
            console.dir(err);
            res.write("<h1>Customer id is not valid</h1>");
            res.end();
        }
    }

    // User enters street address
    street.trim();
    if (street == null || street == "") {
        res.write("<h1>Please enter your street address</h1>");
        res.end();
    }

    // User enters city
    city.trim();
    if (city == null || city == "") {
        res.write("<h1>Please enter your city</h1>");
        res.end();
    }

    // User enters state
    state.trim();
    if (state == null || state == "") {
        res.write("<h1>Please enter your state</h1>");
        res.end();
    }

    // User enters postal code
    postal.trim();
    if (postal == null || postal == "") {
        res.write("<h1>Please enter your postal code</h1>");
        res.end();
    }

    // User enters country
    country.trim();
    if (country == null || country == "") {
        res.write("<h1>Please enter your country</h1>");
        res.end();
    }

    // User enters payment type
    payType.trim();
    const cardCompanies = ['american express', 'bank of america', 'barclays', 'capital one', 'chase', 'citibank', 'mastercard', 'us bank', 'visa', 'wells fargo'];
    if (!cardCompanies.includes(payType.toLowerCase())) {
        res.write("<h1>Card company not accepted</h1>");
        res.end();
    }
    if (payType == null || payType == "") {
        res.write("<h1>Please enter your payment type</h1>");
        res.end();
    }

    // User enters card number
    cardNum.replace(" ", "");
    if (cardNum == null || cardNum == "") {
        res.write("<h1>Please enter your card number</h1>");
        res.end();
    }

    // User enters expiry date and remove slashes
    if (expiry == null || expiry == "") {
        res.write("<h1>Please enter your card expiry date</h1>");
        res.end();
    }

    /** Make connection and validate **/
    (async function() {
        try {
            let pool = await sql.connect(dbConfig);
            let results = await pool.request()
                .input('custId', sql.VarChar, custId)
                .input('street', sql.VarChar, street)
                .input('city', sql.VarChar, city)
                .input('state', sql.VarChar, state)
                .input('postal', sql.VarChar, postal)
                .input('country', sql.VarChar, country)
                .query("SELECT customerId, firstName+' '+lastName AS name, address, city, state, postalCode, country FROM Customer WHERE (customerId = @custId AND address = @street AND city = @city AND state = @state AND postalCode = @postal AND country = @country)");
            
            if(results.recordset.length!==0){

                let payment = await pool.request()
                    .input('payType', sql.VarChar, payType)
                    .input('cardNum', sql.VarChar, cardNum)
                    .input('expiry', sql.Date, expiry)
                    .input('custId', sql.Int, custId)
                    .query(`INSERT INTO paymentmethod (paymentType, paymentNumber, paymentExpiryDate, customerId) 
                            VALUES ( @payType, @cardNum, @expiry, @custId )`);

                /** Save order information to database**/
                let result = results.recordset[0];
                sqlQuery = `INSERT INTO orderSummary OUTPUT INSERTED.orderId 
                            VALUES( '${new Date().toISOString()}', 0, '${result["address"]}', '${result["city"]}', '${result["state"]}', '${result["postalCode"]}', '${result["country"]}', ${custId} )`;

                let results2 = await pool.request()
                    .query(sqlQuery);

                let orderId = results2.recordset[0]["orderId"]

                /** Print out order summary **/
                res.write("<h2>Your Order Summary</h2>")
                res.write(`<TABLE border="0" cellspacing="2" cellpadding="6" bgcolor="#000000">
                        <TR bgcolor="#ffffff">
                            <TH>Product Id</TH>
                            <TH>Product Name</TH>
                            <TH>Quantity</TH>
                            <TH>Price</TH>
                            <TH>Subtotal</TH>
                        </TR>
                    `);
                
                let total = 0.0;
                 /** Insert each item into OrderedProduct table using OrderId from previous INSERT **/
                for (let i = 0; i < productList.length; i++) {
                    let product = productList[i];
                    if (!product) {
                        continue;
                    }
                    // Use product.id, product.name, product.quantity, and product.price here
                    let results = await pool.request()
                        .query(`INSERT INTO orderproduct VALUES ( ${orderId}, ${product.id}, ${product.quantity}, ${product.price} )`);
                    
                    let subtotal = parseFloat(parseInt(product.quantity) * parseFloat(product.price))
                    total += subtotal;
                    res.write(`<TR align="right" bgcolor="#ffffff">
                            <TD>${product.id}</TD>
                            <TD>${product.name}</TD>
                            <TD>${product.quantity}</TD>
                            <TD>$${parseFloat(product.price).toFixed(2)}</TD>
                            <TD>$${subtotal.toFixed(2)}</TD>
                        </TR>`);
                }
                res.write(`<TR align="right" bgcolor="#ffffff">
                            <TD colspan=5><b>Order Total:</b> $${total.toFixed(2)}</TD>
                        </table>
                        <h2>Order is complete and will be shipped soon...</h2>
                        <h2>Your order reference number is: ${orderId}</h2>
                        <h2>Shipping to customer: ${result["customerId"]} ${result["name"]}</h2>`
                    );
                res.write(` <TABLE border="0" cellspacing="2" cellpadding="6" bgcolor="#000000" margin-top="1em">
                    <tr bgcolor="#ffffff">
                        <th text-align="left">Your Shipping and Payment Info</th>
                    </tr>
                    <tr bgcolor="#ffffff">
                        <td><b>Card:</b> ${payType} number ${cardNum}</td>
                    </tr>
                    <tr bgcolor="#ffffff">
                        <td><b>Street:</b> ${street}</td>
                    </tr>
                    <tr bgcolor="#ffffff">
                        <td><b>City:</b> ${city}</td>
                    </tr>
                    <tr bgcolor="#ffffff">
                        <td><b>State:</b> ${state}</td>
                    </tr>
                    <tr bgcolor="#ffffff">
                        <td><b>Postal Code:</b> ${postal}</td>
                    </tr>
                    <tr bgcolor="#ffffff">
                        <td><b>Country:</b> ${country}</td>
                    </tr></table>`);
        res.write(`<h3><a href='/'>Back to Main Menu</a></h3>`);

                /** Update total amount for order record **/
                await pool.request()
                    .query(`UPDATE ordersummary SET totalAmount=${total} WHERE orderId=${orderId}`);

                /** Clear session/cart **/
                req.session.productList.length = 0

            res.end();
            }else {
                res.write("<h1>Customer id and/or address does not match our records. Go back and try again.</h1>")
                res.end()
            }

        } catch(err) {
            console.dir(err);
            res.write(err);
        }
    })();
    
});

module.exports = router;
