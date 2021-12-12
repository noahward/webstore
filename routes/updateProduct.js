const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', function(req, res, next) {
  res.setHeader('Content-Type', 'text/html');
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

  let pid = req.query.productId;
  let update = req.query.updateProd;
  let pName = req.query.productName;
  let pPrice = req.query.productPrice;
  let pDesc = req.query.productDesc;
  let cid = req.query.categoryId;

  (async function() {

    try {

      let pool = await sql.connect(dbConfig);

      if(cid) {
        await pool.request()
            .query(`UPDATE product SET productName='${pName}', productPrice='${pPrice}', productDesc='${pDesc}', categoryId=${cid} WHERE productId=${pid}`);
        res.write("<h1>Product Has Been Updated</h1>");
      } else {
        if(update) {
          try{
            await pool.request()
              .query(`DELETE FROM product WHERE productId=${pid}`);
            res.write(`<h1>Product ${pid} Has Been Deleted</h1>`);
          }catch(err) {
            res.write("<h1>Unable to delete product as we still have stock and orders containing it please remove at a later time</h1>");
          }
        } else {
          let result = await pool.request()
          .input('prodId', sql.Int, pid)
          .query(`SELECT * FROM product WHERE productId = @prodId`);
  
          let product = result.recordset[0]
          console.debug(product)
          console.debug(update)
  
          res.write(`<h1>Update ${product["productName"]}</h1>`)
          
          res.write('<form method="get" action="updateProduct">');
          res.write(`<input type="text" name="productId" value="${product["productId"]}" size="50" readonly>`);
          res.write(`<input type="text" name="productName" placeholder="Name: ${product["productName"]}" size="50" required>`);
          res.write(`<input type="text" name="productPrice" placeholder="Price: ${product["productPrice"]}" size="1000" required>`);
          res.write(`<input type="text" name="productDesc" placeholder="Description: ${product["productDesc"]}" size="1000" required>`);
          res.write(`<input type="text" name="categoryId" placeholder="Category Id: ${product["categoryId"]}" size="1000" required>`);
          res.write(`<input type="submit" value="Update">`);
          res.write('</form>');
  
        }
      }
      // else {
      //   let revInsert = await pool.request()
      //     .input('revRating', sql.Int, revRating)
      //     .input('revDate', sql.DateTime, reviewDate)
      //     .input('custId', sql.Int, custId)
      //     .input('prodId', sql.Int, pid)
      //     .input('revComment', sql.VarChar, revComment)
      //     .query(`INSERT INTO review (reviewRating, reviewDate, customerId, productId, reviewComment) 
      //     VALUES (@revRating, @revDate, @custId, @prodId, @revComment)`);
  
      // }

    } 
    catch(err) {
      console.dir(err);
      res.write("<h1>Unsuccessful review submission</h1>");
      res.write(err + "")
      res.end();
    }

  })();
});

module.exports = router;