const express = require('express');
var app = express();
const bodyparser = require('body-parser')
const Sequelize = require('sequelize')
const request = require('request')
const admin = require('firebase-admin')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const cors = require('cors')
 
app.use(cors())

app.use(bodyparser.urlencoded({extended: true}))
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
    host: "esd.cyp1plpg63lm.ap-southeast-1.rds.amazonaws.com",
    dialect: 'mysql'
})

// const host = 'host.docker.internal'
const userHost = '13.228.102.119'

const Invoice = sequelize.define(
    'Invoice', 
    {
        // attributes
        InvoiceID: {
            type: Sequelize.INTEGER,
            allowNull: true,
            primaryKey: true,
            autoIncrement: true,
        },
        InvoiceDateTime: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
            allowNull: false,
        },
        Description: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        Title: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        PhotoLink: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        GrpOutingID: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        Amount: {
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
        UserID: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true,
        },
        InvoiceID: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true
        },
        Owner: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        }
    }, {
        tableName: 'UserInvoice',
        timestamps: false
    }
);

app.post("/invoice", uploadDisk.single("File"), (req, res) => {
    
    Invoice.create(req.body).then(result => {
        
        //apprentl the file is not included in the request
        console.log(req.body)
        // console.log(result)
        if(result.InvoiceID) {

            var users = JSON.parse(req.body.Users)
            console.log(users)

            // return true
            users.forEach(user => {
                UserInvoice.create({
                    UserID: user.UserID,
                    InvoiceID: result.InvoiceID,
                    Owner: user.Owner
                })
            });

            var toRes
            const newName = result.InvoiceID + path.extname(req.file.filename)

            fs.rename('./tmp/' + req.file.filename,
                './tmp/'+newName,
                () => {
                    bucket.upload('./tmp/' + newName).then(
                        (ffres) => {
                            console.log("successful")
                            Invoice.update(
                                {PhotoLink: newName},
                                {where: {InvoiceID: result.InvoiceID}}
                            )
                            result.PhotoLink = newName
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
                        InvoiceID: iid,
                        Owner: true
                    }
                }
            ).then((userInvoice) => {
                console.log(userInvoice[0].UserID)
                request('http://'+userHost+':3001/user/' + userInvoice[0].UserID, { json: true }, (e,r,b) => {
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
            GrpOutingID: gid
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
            UserID: uid
        }
    }).then((userInvoices) => {
        console.log("found: " + userInvoices.length)
        userInvoices.forEach(userInvoice => {
            Invoice.findByPk(userInvoice.InvoiceID).then((invoice) => {
                invoices.push(invoice)
                console.log(invoices)
                if(invoices.length == userInvoices.length) {
                    const toReturn = invoices.filter(inv => inv.GrpOutingID == gid)
                    console.log(invoices.length + ": " + toReturn.length)
                    return res.send(toReturn)
                }
            })
        })        
    })
})

app.get("/invoice/:iid/users", (req, res) => {

    const iid = req.params.iid

    UserInvoice.findAll({
        where: {
            InvoiceID: iid
        }
    }).then((userInvoices) => {
        console.log(userInvoices.length)
        return res.send({
            NumberOfUsers: userInvoices.length
        })
    })   
})

app.listen(3004, () =>  console.log('Express server is running at port no: 3004'));
