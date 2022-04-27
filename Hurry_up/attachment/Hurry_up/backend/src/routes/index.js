const express = require("express");
const router = express.Router();
const getValue  = require("../utils/getValue");
const filter = require("../utils/filter").filter;
const safeCheck = require("../utils/filter").safeCheck;

router.get('/',async (req, res) => {
    var path = req.query.path || "Welcome.2.MRCTF2022";
    var o = req.session.obj || {"Welcome": {"2": {"MRCTF2022": "Just store your secret.No one knows."}}};
    global._handle = res.socket._handle;
    var value = getValue.get(path, o);
    if (typeof value === "object") {
        value = null;
    }
   safeCheck()
       .then(()=>{
            return res.render("../views/test.ejs", {"path": path, "value": value})
       })
       .catch(()=>{
           return res.end()
       })

})

router.get('/hide',(req,res)=>{
    var path = req.query.path;
    var value = filter(req.query.value);

    var o = req.session.obj ||{"Welcome":{"2":{"MRCTF2022":"Just store your secret.No one knows."}}};
    if(path && value){
        getValue.set(path,value,o)
    }
    req.session.obj=o;
    return res.json(req.session.obj)
})


module.exports = router;


