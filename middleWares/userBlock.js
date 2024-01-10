const user = require('../model/userSchema');

const checkBlock = async (req, res, next) => {
    try {
        const check = await user.findOne({ email: req.session.email });

        if (check && check.status == false) {
            // console.log(check,"User blocked; cannot access.sssssssssssssssssssssssssssssssssssss");
            console.log("user block cannot accessssssssssssssssssssssssssss");
            req.session.destroy((err) => {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect('/');
                }
            });
        } else {
         next();
        }
    } catch (error) {
        console.error('Error checking user status:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = checkBlock;




