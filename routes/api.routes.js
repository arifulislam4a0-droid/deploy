const express = require("express")
const { signup } = require("../controllers/account/signup");
const { login } = require("../controllers/account/login");
const { sendOTP, verifyOtp } = require("../controllers/account/otp");
const { template_web_create, viewWebsite } = require("../controllers/create_website/template");
const { get_website_list } = require("../controllers/all_website_list");
const { view_edit_Website } = require("../controllers/edit_website");
const { enable_disable } = require("../controllers/enable_disable");
const { deleteWebsite } = require("../controllers/delete_website");
const { changeLink } = require("../controllers/change_link");
const router = express.Router()


router.post('/signup',signup);
router.post('/login', login);
router.post('/send_otp', sendOTP);
router.post('/verify_otp', verifyOtp);
router.post('/web_create_by_template', template_web_create);
router.post('/get_website_list', get_website_list);
router.post('/view_edit_Website', view_edit_Website);
router.post('/enable_disable', enable_disable);
router.post('/deleteWebsite', deleteWebsite);
router.post('/changeLink', changeLink);






module.exports = router 


