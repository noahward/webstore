const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.write(`<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
    integrity="sha512-1ycn6IcaQQ40/MKBW2W4Rhis/DbILU74C1vSrLJxCq57o941Ym01SwNsOMqvEBFlcgUa6xLiPY/NS5R+E6ztJQ=="
    crossorigin="anonymous" referrerpolicy="no-referrer" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/brands.min.css"
    integrity="sha512-sVSECYdnRMezwuq5uAjKQJEcu2wybeAPjU4VJQ9pCRcCY4pIpIw4YMHIOQ0CypfwHRvdSPbH++dA3O4Hihm/LQ=="
    crossorigin="anonymous" referrerpolicy="no-referrer" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/fontawesome.min.css"
    integrity="sha512-P9vJUXK+LyvAzj8otTOKzdfF1F3UYVl13+F8Fof8/2QNb8Twd6Vb+VD52I7+87tex9UXxnzPgWA3rH96RExA7A=="
    crossorigin="anonymous" referrerpolicy="no-referrer" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lato:wght@900&family=Spinnaker&display=swap" rel="stylesheet">
  <style>
  
  * {
    font-family: 'Spinnaker';
  }
  h1,
  h2,
  h3 {
    font-family: 'Lato';
  }
  a {
    color: #5D5D5D;
    font-weight: 600;
    text-decoration: none;
    width: 100%;
    position: relative;
  }
  a::after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    display: block;
    margin-top: 2px;
    right: 0;
    background: #5D5D5D;
    transition: 0.4s ease;
  }
  a:hover::after {
    width: 100%;
    left: 0;
    background-color: #5D5D5D;
  }
  table {
    table-layout: fixed;
    width: 60%;
    text-align: center;
    border-collapse: collapse;
  }
  th,
  td {
    border: 1px solid grey;
    padding: 10px;
    height: auto;
  }
  table tr:nth-child(even) {
    background-color: #f2f2f2;
  }
  form {
    width: 58%;
    border: 1px solid grey;
    margin-top: 2em;
    background-color: #f2f2f2;
    padding: 0.9em;
  }
  .reviewTitle {
    display: block;
    font-weight: 800;
  }
  textarea {
    display: block;
    margin: 1em 0em;
    width: 95%;
    height: 10em;
    resize: none;
    font-size: 14px;
    padding: 1em;
  }
  ::-webkit-input-placeholder {
    font-size: 14px;
  }
  </style>`);
    
    let id = req.query.id;

    sqlQuery = `SELECT productId, productName, categoryName, productPrice, productImageURL, productDesc
                FROM product
                INNER JOIN category
                ON category.categoryId = product.categoryId`;

    if(!isNaN(id) || id > 0) { // Valid id check
        sqlQuery += ` WHERE productId = ${id}`
    }
    
    (async function() {
        try {
            let pool = await sql.connect(dbConfig);

	// Get product name to search for
	// TODO: Retrieve and display info for the product
            let results = await pool.request().query(sqlQuery);

            let result = results.recordset[0]

            console.debug(result)

            console.debug(result)
            res.write(`<h2>${result["productName"]}</h2>`);
            res.write(`<img src="${result["productImageURL"]}" alt="${result["productName"]} Image" width="200" height="200">`)
            res.write(`<h4>Id:\t${result["productId"]}</h4>`)
            res.write(`<h4>Price: $${parseFloat(result["productPrice"]).toFixed(2)}</h4>`)
            res.write(`<p>Description: ${result["productDesc"]}</p>`)
            res.write(`<a href="/addcart?id=${result["productId"]}&name=${result["productName"]}&price=${result["productPrice"]}">Add To Cart</a><br></br>`)
            res.write(`<a href="/listprod">Continue Shopping</a>`)

            let reviews = await pool.request()
            .input('pid', sql.VarChar, id)
            .query("SELECT * FROM review WHERE productId = @pid");

            res.write(`<table>
                        <tr>
                            <th>Rating</th>
                            <th>Date</th>
                            <th>Customer</th>
                            <th style="width: 30em;">Comments</th>
                        </tr>`);
                    
            for (let i = 0; i < reviews.recordset.length; i++) {
            let review = reviews.recordset[i];

            var revDate = new Date(review.reviewDate);
            revDate = revDate.toDateString();
            var stars = review.reviewRating;

            res.write(`<tr><td>`);
            for (let g=0; g<stars; g++) {
                res.write('<i class="fas fa-star"></i>')
            }
            res.write(`</td>
                        <td>` + revDate + `</td>
                        <td>` + review.customerId + `</td>
                        <td style="text-align: left; padding-left: 20px;">` + review.reviewComment + `</td>
                        </tr>`);
            }
            res.write("</table>");
            // Form for ratings
            res.write(`<form method="get" action="review">
                        <label class="reviewTitle">Leave a Review</label><br>
                        <label>Rating: </label>
                        <input type="number" name="revRating" min="1" max="5"><br>
                        <label>Your Customer Id: </label>
                        <input type="number" name="custId" min="1"><br>
                        <textarea placeholder="Your review here" name="revComment"></textarea><br>
                        <input type="hidden" name="pid" value="${id}">
                        <input type="submit" value="Submit">
                    </form>`);

            res.end()
        } catch(err) {
            console.dir(err);
            res.write(err + "")
            res.end();
        }
    })();
});

module.exports = router;
