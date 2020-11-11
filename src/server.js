import express from 'express'
import {execSync} from 'child_process'
import fs from 'fs'
import Database from './../database/Database'
import genericService from './Services/GenericService'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({path: path.join(__dirname, '.env')})

const app = express()
const PORT = 3000

app.use(express.urlencoded());
app.use(express.json())

app.post('/myhash', async(req, res)=>{
    const {email, password} = req.body

    const user = await genericService.verifyUser(email, password)

    return res.status(!user ? 500 : 200).json(user)
})

app.post('/create/user', async(req, res)=>{

    const {name, lastName, email, password} = req.body

    const hash = genericService.randomHash()

    const [newUser] = await Database('user').insert({
        name: name,
        lastName: lastName,
        email: email,
        password: genericService.encodePassword(password),
        inserted: new Date(),
        hash: hash
    })

    return res.json({
        hash: hash,
        user_id: newUser
    })
})

app.get('/user/:hash', async(req, res) =>{
    const user = await Database('user').where('hash', req.params.hash).select('name', 'lastName', 'email').first()
    return res.json(user)
})

app.put('/user/:hash', async(req, res) =>{
    await Database('user').where('hash', req.params.hash).
    update('name', req.body.name).
    update('lastName', req.body.lastName)

    return res.status(200).send()
})

app.delete('/user', async(req, res)=>{

    await Database('user').where('hash', req.body.myhash).delete()

    return res.status(200).send()
})

app.get('/history/:hash', async(req, res) =>{

    const history = await Database('user').join('history', 'history.user_id', '=', 'user.id').select('description', 'name', 'lastName').where('hash', req.params.hash)

    return res.json(history)

})

app.post('/sendDocument', async(req, res) =>{

    const user = await Database('user').where('hash', req.headers.myhash).first()

    const hash = genericService.randomHash()

    if(!user) return res.status(500).send('User not found')

    const {filename, from, to, content64} = req.body
    
    const hash_filename = `${hash}_${filename}`

    const buff = Buffer.from(content64, 'base64')

    const filePath = `${__dirname}/tempFiles/${hash_filename}.${from}`

    fs.writeFileSync(filePath, buff)

    execSync(`soffice --convert-to ${to} ${filePath} --outdir ${__dirname}/tempFiles --headless`)

    const contentFileConverted = fs.readFileSync(`${__dirname}/tempFiles/${hash_filename}.${to}`)

    removeFiles([filePath, `${__dirname}/tempFiles/${hash_filename}.${to}`])

    await Database('history').insert({
        description: `file ${filename} was converted at ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}, ${from} to ${to}`,
        user_id: user.id
    })

    return res.json({
        name: filename,
        mime: to,
        content64: contentFileConverted.toString('base64')
    })

})

const removeFiles = (arrFiles)=>{

    for(let file of arrFiles){

        try{
        
            fs.unlinkSync(file)
        
        }catch(err){

        }
    
    }

}

app.listen(PORT, _=> console.log(`rodando na porta ${PORT}`))
