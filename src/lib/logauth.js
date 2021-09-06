module.exports = {

    isLoggedin(req,res,next){
        if (req.isAuthenticated()) {
            return next();
        }
        return res.redirect('/signin');
    },
// Simbolo ! significa NOT
    isNotLoggedin(req,res,next){
        if (!req.isAuthenticated()) {
            return next();
        }
        return res.redirect('/profile');
    }
}