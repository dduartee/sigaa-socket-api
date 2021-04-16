import jwt from "jsonwebtoken"
export default class JWTController {
    private secret: jwt.Secret;
    constructor(secret) {
        this.secret = secret
    }
    generate(payload) {
        return jwt.sign(payload, this.secret)
    }
    decode(token) {
        return jwt.decode(token)
    }
    verify(token) {
        return jwt.verify(token, this.secret)
    }
};
