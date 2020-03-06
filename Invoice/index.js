const express = require('express');
var app = express();
const bodyparser = require('body-parser')
const Sequelize = require('sequelize')
const request = require('request')
const admin = require('firebase-admin')
const multer = require('multer')
const fs = require('fs')

app.use(bodyparser.urlencoded({extended: false}))
app.use(bodyparser.json())

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './Invoice/tmp')
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
        invoiceId: {
            type: Sequelize.STRING,
            // allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            },
        dateTime: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
            allowNull: false,
        },
        description: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        amount: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
    }, {
        tableName: 'invoice',
        timestamps: false
    }
);

const UserInvoices = sequelize.define(
    'user_invoice', 
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
        tableName: 'user_group',
        timestamps: false
    }
);

app.post("/invoice", uploadDisk.single("file"), (req, res) => {
    // Invoice.create(req.body).then(result => {
    //     res.json(result)
    // })
    // const img = req.body.file
    ;
    bucket.upload('./Invoice/tmp/' + req.file.filename).then(
        (ffres) => {
            console.log("successful")
            res.send(ffres)
        }, 
        (rej) => {
            console.log("rejected")
            res.send(rej)
        }
    ).catch((err) => {
        confirm.log("error")
        res.send("Error: " + err)
    }).finally(() => {
        fs.unlink('./Invoice/tmp/'+req.file.filename, () => {
            console.log('file unlinked')
        })
    })
    
})

app.get("/invoice/:id", (req, res) => {
    
    const iid = req.params.id

    Invoice.findOne(iid).then((invoice) => {
        if(invoice)
            return res.send(invoice)
        else
            return res.send("Invoice not found!")
    })
})

app.get("/invoice/group/:id", (req, res) => {
    
    const gid = req.params.id

    Invoice.findAll({
        groupId: gid
    }).then((invoices) => {
        return res.send(invoices)        
    })
})

app.listen(3000, () =>  console.log('Express server is running at port no: 3000'));
