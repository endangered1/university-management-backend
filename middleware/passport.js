const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const config = require("config");
const { User } = require("../models/user");

module.exports = function () {
    const options = {
        jwtFromRequest: ExtractJwt.fromHeader("x-auth-token"),
        secretOrKey: config.get("jwtPrivateKey"),
    };

    passport.use(
        new JwtStrategy(options, async (payload, done) => {
            try {
                const user = await User.findById(payload._id).select("-password");
                if (!user) return done(null, false);

                return done(null, user);
              } catch (err) { 
                return done(err, false);
            }
        })
    );
};