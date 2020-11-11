import crypto from "crypto"
import uuid from 'uuid'
import Database from '../../database/Database'
import jwt from 'jsonwebtoken'


class GenericService{

    randomHash(){

        const secret = process.env.secret
        const token = jwt.sign(uuid.v4(), secret)
        return token
    }

    encodePassword(pass){
        const secret = process.env.secret
        const enq = jwt.sign(pass, secret)

        return enq
    }

    async verifyUser(email, pwd){

        const user = await Database('user').where('email', email).first()
        
        const pwdJWT = jwt.verify(user.password, process.env.secret)

        if(pwd === pwdJWT) return {
            email: user.email,
            name: user.name,
            lastName: user.lastName,
            hash: user.hash
        }
    }

}

module.exports = new GenericService()