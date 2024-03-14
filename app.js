var express = require('express');
var app = express();
var warner = require("./route/index");

app.use("/",warner);


const PORT =  3000;
app.listen(PORT, () => {
    console.log(`Listning on port ${PORT}`);
})