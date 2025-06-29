const JWT = require("jsonwebtoken");
require('dotenv').config();

const authorize = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token){
            res.redirect('/');
        } 

        JWT.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                res.redirect('/'); 
            }

            next();
        });
    } catch (error) {
        return res.render("pages/error.ejs", { error });
    }
};

module.exports = { authorize };