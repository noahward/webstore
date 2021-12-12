const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    let id = req.query.id
        // If the product list isn't set in the session,
    // create a new list.
    let productList = false;
    if (!req.session.productList || !id) {
        res.redirect("/showcart");
    }
    else{
        productList = req.session.productList;
        productList[id]=null;
        
        isEmpty = true;
        for (let i = 0; i < productList.length; i++) {
            if(productList[i]){
                isEmpty = false;
                break;
            }
        }
        if(isEmpty){productList=null;}
    }
    req.session.productList = productList;
    res.redirect("/showcart");
});

module.exports = router;