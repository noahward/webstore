const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', function(req, res, next) {
  res.setHeader('Content-Type', 'text/html');

  let pid = req.query.pid;
  let revRating = req.query.revRating;
  let revComment = req.query.revComment;
  let custId = req.query.custId;
  const reviewDate = new Date();

  (async function() {

    try {

      let pool = await sql.connect(dbConfig);

      let result = await pool.request()
        .input('prodId', sql.Int, pid)
        .input('custId', sql.Int, custId)
        .query(`SELECT reviewRating FROM review WHERE customerId = @custId AND productId = @prodId`);
      
      // If user already has a review on this product, do not insert
      if (result.recordset.length > 0) {
        res.write("<h1>You have already posted a review!</h1>");
        res.end();
      }
      else {
        let revInsert = await pool.request()
          .input('revRating', sql.Int, revRating)
          .input('revDate', sql.DateTime, reviewDate)
          .input('custId', sql.Int, custId)
          .input('prodId', sql.Int, pid)
          .input('revComment', sql.VarChar, revComment)
          .query(`INSERT INTO review (reviewRating, reviewDate, customerId, productId, reviewComment) 
          VALUES (@revRating, @revDate, @custId, @prodId, @revComment)`);
  
        res.write("<h1>Your review has been successfully submitted!</h1>");
      }

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