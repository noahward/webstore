const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.write("<title>Grocery CheckOut Line</title>");
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

    res.write("<h1>Enter the following info to complete the transaction:</h1>");
    res.write('<form method="get" action="order">');
    ////// SHIPPING INFO //////
    res.write('<label>Customer Shipping Info: </label><br>');
    // Customer ID
    res.write('<label>Customer ID: </label>');
    res.write('<input type="text" name="customerId" placeholder="5" size="50"><br>');
    // Street address
    res.write('<label>Street Address: </label>');
    res.write('<input type="text" name="street" placeholder="407 Pandosy St" size="50"><br>');
    // City
    res.write('<label>City: </label>');
    res.write('<input type="text" name="city" placeholder="Kelowna" size="50"><br>');
    // State
    res.write('<label>State: </label>');
    res.write('<input type="text" name="state" placeholder="BC" size="50"><br>');
    // Postal code
    res.write('<label>Postal Code: </label>');
    res.write('<input type="text" name="postal" placeholder="V9P 1Y1" size="50"><br>');
    // Country
    res.write('<label>Country: </label>');
    res.write('<input type="text" name="country" placeholder="Canada" size="50"><br>');

    ////// PAYMENT INFO //////
    res.write('<label>Customer Payment Info: </label><br>');
    // Payment type
    res.write('<label>Payment Type: </label>');
    res.write('<input type="text" name="payType" placeholder="Mastercard" size="50"><br>');
    // Payment number
    res.write('<label>Card Number: </label>');
    res.write('<input type="text" name="payNumber" placeholder="3476 4421 2345 9022" size="50"><br>');
    // Payment expiry date
    res.write('<label>Card Expiry Date: </label>');
    res.write('<input type="text" name="payExpiry" placeholder="yyyy-mm-dd" size="50"><br>');

    // Submit button
    res.write('<input type="submit" value="Submit"><input type="reset" value="Reset">');
    res.write('</form>');

    res.end();
});

module.exports = router;
