const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");



router.get("/", userController.getRegister);
router.get("/login", userController.getLogin);
router.get("/verify/:token", userController.verify);
router.post("/" , userController.register); 
router.post("/login" , userController.login);
router.post("/logout", userController.logout);


module.exports = router;