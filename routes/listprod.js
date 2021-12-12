const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.write("<title>Matt Dunn Grocery</title>")
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

    // Get the product name to search for
    let name = req.query.productName;
    let category = req.query.productCategory;
    res.write(`<input type="button" onclick="location.href='/showcart';" value="InCart" style="float: right;">`);
    res.write('<h1>Search by Product Name or Category</h1>');
    res.write('<form method="get" action="listprod">');
    res.write('Search: <input type="text" name="productName" size="25">');
    res.write('<input type="submit" value="Submit">');
    res.write(`<input type="button" onclick="location.href='/listprod';" value="Reset" >`);
    res.write('</form>');
    
    /** $name now contains the search string the user entered
     Use it to build a query and print out the results. **/

    sqlQuery = `SELECT productId, productName, categoryName, productPrice
                FROM product
                INNER JOIN category
                ON category.categoryId = product.categoryId`;

    let prodName = false
    if(name) {
        prodName = "%" + name + "%";
        sqlQuery += " WHERE productName LIKE @pName OR categoryName LIKE @pName ORDER BY product.categoryId"
    }

    /** Create and validate connection **/
    (async function() {
        try {
            let pool = await sql.connect(dbConfig);

            let results = await pool.request()
                .input('pName', sql.VarChar, prodName)
                .query(sqlQuery);
            
            res.write(`<h2>All Products${name?` containing "${name}"`:""}:</h2>`)
            res.write(`<TABLE width="100%" border="0" cellspacing="2" cellpadding="6" bgcolor="#000000">
                        <TR bgcolor="#ffffff">
                            <TH></TH>
                            <TH>Product Name</TH>
                            <TH>Category</TH>
                            <TH>Price</TH>
                        </TR>
                    `);

            for(let i = 0; i < results.recordset.length; i++) {
                let result = results.recordset[i];
                res.write(`<TR align="right" bgcolor="#ffffff">
                                <TD><a href="/addcart?id=${result["productId"]}&name=${result["productName"]}&price=${result["productPrice"]}">Add To Cart</a></TD>
                                <TD><a href="/product?id=${result["productId"]}">${result["productName"]}</TD>
                                <TD>${result["categoryName"]}</TD>
                                <TD>$${result["productPrice"].toFixed(2)}</TD>
                            </TR>`);
            }

            res.end()
        } catch(err){
            console.dir(err);
            res.write(err);
            res.end();
        }
    })();

    /** Print out the ResultSet **/

    /** 
    For each product create a link of the form
    addcart?id=<productId>&name=<productName>&price=<productPrice>
    **/

    /**
        Useful code for formatting currency:
        let num = 2.89999;
        num = num.toFixed(2);
    **/

});

module.exports = router;