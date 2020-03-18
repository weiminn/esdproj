const express = require('express');
var app = express();
const bodyparser = require('body-parser')
const Sequelize = require('sequelize')
const request = require('request')
const admin = require('firebase-admin')
const multer = require('multer')
const fs = require('fs')
const path = require('path')

app.use(bodyparser.urlencoded({extended: false}))
app.use(bodyparser.json())

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './tmp')
    },
    filename: (req, file, cb) => {
        console.log(file)
        cb(null, file.originalname)
    }
})
var uploadDisk = multer({storage: storage})

var serviceAccount = require('./serviceAccountKey.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "gs://esdproj-1d7cf.appspot.com/"
});

var bucket = admin.storage().bucket();

const sequelize = new Sequelize('Invoice', 'admin', 'asdf1234', {
    // host: process.env.dbHOST,//'localhost',
    host: "testing.cyp1plpg63lm.ap-southeast-1.rds.amazonaws.com",
    dialect: 'mysql'
})

const Invoice = sequelize.define(
    'Invoice', 
    {
        // attributes
        INVOICEID: {
            type: Sequelize.INTEGER,
            allowNull: true,
            primaryKey: true,
            autoIncrement: true,
        },
        INVOICEDATETIME: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
            allowNull: false,
        },
        DESCRIPTION: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        TITLE: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        PHOTOLINK: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        GRPOUTINGID: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        AMOUNT: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
    }, {
        tableName: 'Invoice',
        timestamps: false
    }
);

const UserInvoice = sequelize.define(
    'UserInvoice', 
    {
        // attributes
        USERID: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true,
        },
        INVOICEID: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true
        },
        OWNER: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        }
    }, {
        tableName: 'UserInvoice',
        timestamps: false
    }
);

app.post("/invoice", uploadDisk.single("FILE"), (req, res) => {
    // console.log(req.body)
    Invoice.create(req.body).then(result => {
        
        // console.log(req.body)
        // console.log(result)
        if(result.INVOICEID) {

            console.log(req.body.USERS)
            var users = req.body.USERS

            // return true
            users.forEach(user => {
                UserInvoice.create({
                    USERID: user.USERID,
                    INVOICEID: result.INVOICEID,
                    OWNER: user.OWNER == 'true'
                })
            });

            var toRes
            const newName = result.INVOICEID + path.extname(req.file.filename)

            fs.rename('./tmp/' + req.file.filename,
                './tmp/'+newName,
                () => {
                    bucket.upload('./tmp/' + newName).then(
                        (ffres) => {
                            console.log("successful")
                            Invoice.update(
                                {PHOTOLINK: newName},
                                {where: {INVOICEID: result.INVOICEID}}
                            )
                            result.PHOTOLINK = newName
                            toRes = result
                        }, 
                        (rej) => {
                            console.log("rejected")
                            toRes = rej
                        }
                    ).catch((err) => {
                        confirm.log("error")
                        toRes = err
                    }).finally(() => {
                        fs.unlink('./tmp/' + newName, () => {
                            console.log('file unlinked')
                            res.json(toRes)
                        })
                        
                    })
                }
            )
        }       
    })   
})

app.get("/invoice/:id", (req, res) => {
    
    const iid = req.params.id

    Invoice.findByPk(iid).then((invoice) => {
        if(invoice)
            return res.send(invoice)
        else
            return res.send("Invoice not found!")
    })
})

app.get("/invoice/:id/owner", (req, res) => {
    
    const iid = req.params.id

    Invoice.findByPk(iid).then((invoice) => {
        if(invoice){
            UserInvoice.findAll(
                {
                    where: {
                        INVOICEID: iid,
                        OWNER: true
                    }
                }
            ).then((userInvoice) => {
                console.log(userInvoice[0].USERID)
                request('http://localhost:3001/user/' + userInvoice[0].USERID, { json: true }, (e,r,b) => {
                    if (e)
                        return res.send(e)
                    return res.send(b)
                })
            })
        } 
        else
            {return res.send("Invoice not found!")}
    })
})

app.get("/invoice/grpouting/:id", (req, res) => {
    
    const gid = req.params.id

    Invoice.findAll({
        where: {
            GRPOUTINGID: gid
        }
    }).then((invoices) => {
        return res.send(invoices)        
    })
})

app.get("/invoice/grpouting/:gid/user/:uid", (req, res) => {
    
    const gid = req.params.gid
    const uid = req.params.uid

    var invoices = []

    UserInvoice.findAll({
        where: {
            USERID: uid
        }
    }).then((userInvoices) => {
        console.log("found: " + userInvoices.length)
        userInvoices.forEach(userInvoice => {
            Invoice.findByPk(userInvoice.INVOICEID).then((invoice) => {
                invoices.push(invoice)
                console.log(invoices)
                if(invoices.length == userInvoices.length) {
                    const toReturn = invoices.filter(inv => inv.GRPOUTINGID == gid)
                    console.log(invoices.length + ": " + toReturn.length)
                    return res.send(toReturn)
                }
            })
        })        
    })
})

// app.post("/invoice/:iid/user", (req, res) => {
//     UserInvoices.create(req.body).then(result => {
//         console.log(result)
//         if(result.INVOICEID) {

            
//         }                
//     })      
// })

app.listen(3004, () =>  console.log('Express server is running at port no: 3004'));
