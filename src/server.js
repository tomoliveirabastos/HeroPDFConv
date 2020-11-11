import express, { response } from 'express'
import {execSync} from 'child_process'
import fs from 'fs'
import crypto from 'crypto'
import Database from './../database/Database'
import uuid from 'uuid'
import { finishToken } from 'sucrase/dist/parser/tokenizer'

const app = express()
const PORT = 3000

app.use(express.urlencoded());
app.use(express.json())


app.post('/create/user', async(req, res)=>{

    const {name, lastName, email} = req.body

    const hash = crypto.createHash('sha256').update(uuid.v4()).digest('hex')

    const [newUser] = await Database('user').insert({
        name: name,
        lastName: lastName,
        email: email,
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

    return res.status('200').send()
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

    if(!user) return res.status(500).send('User not found')

    const {filename, from, to, content64} = req.body

    const buff = Buffer.from(content64, 'base64')

    const filePath = `${__dirname}/tempFiles/${filename}.${from}`

    fs.writeFileSync(filePath, buff)

    execSync(`soffice --convert-to ${to} ${filePath} --outdir ${__dirname}/tempFiles --headless`)

    const contentFileConverted = fs.readFileSync(`${__dirname}/tempFiles/${filename}.${to}`)

    removeFiles([filePath, `${__dirname}/tempFiles/${filename}.${to}`])

    await Database('history').insert({
        description: `file ${filename} converted at ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}, ${from} to ${to}`,
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
