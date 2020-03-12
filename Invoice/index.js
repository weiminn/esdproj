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

const sequelize = new Sequelize('invoice', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
})

const Invoice = sequelize.define(
    'invoice', 
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
        GROUPID: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        AMOUNT: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
    }, {
        tableName: 'invoice',
        timestamps: false
    }
);

const UserInvoices = sequelize.define(
    'invoice', 
    {
        // attributes
        userId: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true,
        },
        invoiceId: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true
        },
        owner: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        }
    }, {
        tableName: 'userinvoice',
        timestamps: false
    }
);

app.post("/invoice", uploadDisk.single("FILE"), (req, res) => {
    Invoice.create(req.body).then(result => {
        console.log(result)
        if(result.INVOICEID) {

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

app.get("/invoice/group/:id", (req, res) => {
    
    const gid = req.params.id

    Invoice.findAll({
        where: {
            GROUPID: gid
        }
    }).then((invoices) => {
        return res.send(invoices)        
    })
})

app.listen(3004, () =>  console.log('Express server is running at port no: 3004'));
