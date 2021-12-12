const express = require('express');
const router = express.Router();
const auth = require('../auth');
const sql = require('mssql');

router.get('/', function(req, res, next) {

	
	// TODO: Include files auth.jsp and jdbc.jsp	
	
    res.setHeader('Content-Type', 'text/html');
    res.write("<title>Matt Dunn Grocery</title>")
    res.write(`<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lato:wght@900&family=Spinnaker&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.js"></script>
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
    input[type=text] {
        width: 100%;
        padding: 12px 20px;
        margin: 8px 0;
        display: inline-block;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
        cursor: default;
    }
    input {
        width: 40%;
        padding: 10px 20px;
        margin-right: 2rem;
        display: inline-block;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
        cursor: pointer;
      }
    </style>`)

    let userId = req.query.userId
    let pass = req.query.password
    let prod = req.query.productName

    if((!userId & !pass) & !prod) {
        res.write("<h1>Administration Login:</h1>");
        res.write('<form method="get" action="admin">');
        res.write('<input type="text" name="userId" size="50" required>');
        res.write('<input type="text" name="password" size="50">');
        res.write('<input type="submit" value="Submit"><input type="reset" value="Reset">');
        res.write('</form>');
    }else {

        
        (async function() {
            try {
                let pool = await sql.connect(dbConfig);
                let results = await pool.request()
                    .query(`SELECT customerId FROM customer WHERE userid = '${userId}' AND password = '${pass}'`);
                
                console.debug(results.recordset.length)

                if(results.recordset.length === 0 && !prod){
                    res.write("<h1>Invalid User!!! GET OUT!</h1>")
                }else{
                    res.write("<h1>Customer List: </h1>")
                    res.write(`<TABLE>
                        <TR>
                            <TH>Name</TH>
                            <TH>Email</TH>
                            <TH>Address</TH>
                            <TH>User Id</TH>
                            <TH>Password</TH>
                        </TR>
                    `);
                    let customers = await pool.request()
                    .query(`SELECT * FROM customer`);
                    for(let i = 0; i < customers.recordset.length; i++) {
                        let customer = customers.recordset[i];
                        res.write(`<TR align="right" bgcolor="#ffffff">
                                        <TD>${customer["lastName"]}, ${customer["firstName"]}</TD>
                                        <TD>${customer["email"]}</TD>
                                        <TD>${customer["address"]}, ${customer["city"]}, ${customer["state"]}, ${customer["postalCode"]}, ${customer["country"]}</TD>
                                        <TD>${customer["userid"]}</TD>
                                        <TD>${customer["password"]}</TD>
                                    </TR>`);
                    }
                    res.write("</TABLE>")
                    res.write("<h1>Sales Report: </h1>")
                    let totalSales = 0;
                    let sales = await pool.request()
                    .query(`SELECT * FROM ordersummary`);

                    res.write(`<TABLE>
                        <TR>
                            <TH>Order Id</TH>
                            <TH>Customer Id</TH>
                            <TH>Shipment Address</TH>
                            <TH>Total Amount</TH>
                        </TR>
                    `);
                    let graphData = "["

                    for(let i = 0; i < sales.recordset.length-1; i++) {
                        let sale = sales.recordset[i];
                        let customer = customers.recordset[i];
                        totalSales += sale["totalAmount"]
                        graphData += `{x:${sale["orderId"]},y:${sale["totalAmount"]}},`
                        res.write(`<TR align="right" bgcolor="#ffffff">
                                        <TD>${sale["orderId"]}</TD>
                                        <TD>${sale["customerId"]}</TD>
                                        <TD>${customer["address"]}, ${customer["city"]}, ${customer["state"]}, ${customer["postalCode"]}, ${customer["country"]}</TD>
                                        <TD>${sale["totalAmount"]}</TD>
                                    </TR>`);
                    }
                    graphData = graphData.slice(0, graphData.length-1)
                    graphData += "]"
                    console.debug(`xyValues = ${graphData}`)
                    res.write("</TABLE>")
                    res.write('<canvas id="myChart" style="width:100%;max-width:700px"></canvas>')
                    res.write(`<h1>Total Sales: $${totalSales.toFixed(2)}</h1>`)
                    res.write(`<script>var xyValues = ${graphData};
                      
                      new Chart("myChart", {
                        type: "scatter",
                        data: {
                          datasets: [{
                            pointRadius: 4,
                            pointBackgroundColor: "rgb(0,0,255)",
                            data: xyValues
                          }]
                        },
                        options: {
                          legend: {display: false},
                          scales: {
                            xAxes: [{ticks: {min: 0, max:${sales.recordset.length}}}],
                            yAxes: [{ticks: {min: 0, max:500}}],
                          },
                          title: {
                              display: true,
                              text: 'OrderId VS Total Amount'
                          }
                        }
                      });</script>`)
                    res.write("<h1>Add A New Product</h1>")
                    res.write('<form method="get" action="admin">');
                    res.write('<input type="text" name="productName" placeholder="Name" size="50" required>');
                    res.write('<input type="text" name="productPrice" placeholder="Price" size="50">');
                    res.write('<input type="text" name="productDesc" placeholder="Description" size="1000">');
                    res.write('<input type="text" name="categoryId" placeholder="Category" size="50">');
                    res.write(`<input type="submit" value="Submit">`);
                    res.write('</form>');

                    res.write("<h1>Update / Delete a Product</h1>")
                    res.write('<form method="get" action="updateProduct">');
                    res.write('<input type="text" name="productId" placeholder="Product Id" size="50" required>');
                    res.write('<input type="checkbox" name="updateProd" size="50"> <label>Check to Delete, dont check to Update</label>')
                    res.write(`<input type="submit" value="Submit">`);
                    res.write('</form>');

                    if(prod) {
                        sqlQuery = `INSERT INTO product
                            VALUES( '${req.query.productName}', ${req.query.productPrice}, NULL, NULL, '${req.query.productDesc}', ${req.query.categoryId})`;

                        await pool.request()
                            .query(sqlQuery);
                    }
                }


            
                
    
            // TODO: Write SQL query that prints out total order amount by day
            } catch(err) {
                console.dir(err);
                res.write(err + "");
                res.end();
            }
        })();
    }  
   
});

module.exports = router;