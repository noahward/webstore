const express = require('express');
const router = express.Router();
const auth = require('../auth');
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

    let userId = req.query.userId
    let pass = req.query.password
    let createUser = req.query.createUser
    let changeData = req.query.changeData
    let logOut = req.query.logOut

    // McDonalds
    let firstName = req.query.firstName
    let lastName = req.query.lastName
    let email = req.query.email
    let phone = req.query.phone
    let address = req.query.address
    let city = req.query.city
    let state = req.query.state
    let postalCode = req.query.postalCode
    let country = req.query.country

    if (logOut) {
        res.write("<h1>Logout Successful! Please refresh to sign in again</h1>");
        res.end()
    } else if (changeData) {
        createUser = true
    } else if(!userId & !pass & !createUser) {
        res.write("<h1>Login to Account:</h1>");
        res.write('<form method="get" action="createUser">');
        res.write('<input type="text" name="userId" placeholder="userId" size="50">');
        res.write('<input type="text" name="password" placeholder="password" size="50">');
        res.write('<input type="checkbox" name="createUser" size="50"> <label>Check to Create a new User and then submit</label>');
        res.write('<input type="submit" value="Login"><input type="submit" value="Create User">');
        res.write('</form>');
        res.end()
    } else if (createUser) {
        if (changeData) {
            res.write("<h1>Please Write Down your New Data (LEAVE USERID THE SAME!): </h1>");
        } else {
            res.write("<h1>Create Account:</h1>");
        }
        res.write('<form method="get" action="createUser">');
        res.write('<input type="text" name="userId" size="50" placeholder="userId" required>');
        res.write('<input type="text" name="password" size="50" placeholder="password" required>');
        res.write('<input type="text" name="firstName" size="50" placeholder="firstName" required>');
        res.write('<input type="text" name="lastName" size="50" placeholder="lastName" required>');
        res.write('<input type="text" name="email" size="50" placeholder="email" required>');
        res.write('<input type="text" name="phone" size="50" placeholder="phone" required>');
        res.write('<input type="text" name="address" size="50" placeholder="address" required>');
        res.write('<input type="text" name="city" size="50" placeholder="city" required>');
        res.write('<input type="text" name="state" size="50" placeholder="state" required>');
        res.write('<input type="text" name="postalCode" size="50" placeholder="postalCode" required>');
        res.write('<input type="text" name="country" size="50" placeholder="country" required>');
        res.write('<input type="submit" value="Submit"><input type="reset" value="Reset">');
        res.write('</form>');
        res.end()
    } else {
        (async function() {
            try {
                // Check for a Valid User ---------------------------------------
                let pool = await sql.connect(dbConfig);

                if (phone) {
                    let first_query = `SELECT userId FROM customer WHERE userId = '${userId}'`
                    let results = await pool.request().query(first_query)

                    if (results.recordset.length != 0) {
                        if (!changeData) {
                        res.write("Invalid UserId, already in system")
                        }
                    } else if (changeData) {
                        let sql_update = `UPDATE customer SET firstName='${firstName}', lastName='${lastName}', email='${email}', phonenum='${phone}', address='${address}', city='${city}', state='${state}', postalCode='${postalCode}', country='${country}', password =${pass} WHERE userId=${userId}`
                        await pool.request().query(sql_update)
                    } else {
                        let SQL_query = `INSERT INTO customer VALUES ('${firstName}', '${lastName}', '${email}', '${phone}', '${address}', '${city}', '${state}', '${postalCode}', '${country}', '${userId}', '${pass}')`
                        await pool.request().query(SQL_query)
                    }
                }

                let results = await pool.request()
                    .query(`SELECT customerId FROM customer WHERE userid = '${userId}' AND password = '${pass}'`);

                console.debug(`SELECT customerId FROM customer WHERE userid = '${userId}' AND password = '${pass}'`)
                console.debug(results)

                if(results.recordset.length === 0){
                    res.write("<h1>Invalid User!!! Get Out!</h1>")
                } else {
                    // All other code goes in here ------------------------------------------------------
                    res.write("<h1>Edit User Information: </h1>")
                    res.write(`<form method="get" action="createUser">`)
                    res.write('<input type="checkbox" name="changeData" size="50"> <label>Check this and submit if you wish to update your data</label>');
                    res.write('<input type="submit" value="Submit">');
                    res.write("</form>")

                    res.write(`<form method="get" action="createUser">`)
                    res.write('<input type="checkbox" name="logOut" size="50"> <label>Check to logOut</label>');
                    res.write('<input type="submit" value="logout">');
                    res.write("</form>")

                    res.write("<h1>Your orders: </h1>")
                    results = await pool
                        .request()
                        .query(
                            `SELECT orderId, orderDate, ordersummary.customerId, firstName, lastName, totalAmount 
                    FROM ordersummary 
                    INNER JOIN customer ON orderSummary.customerId = customer.customerId
                    WHERE userId = '${userId}'`
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
                }

                // TODO: Write SQL query that prints out total order amount by day
            } catch(err) {
                console.dir(err);
                res.write(err + "");
                res.end();
            }
            res.end()
        })();
    }
});

module.exports = router;