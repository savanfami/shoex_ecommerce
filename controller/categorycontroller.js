// const { log } = require('console')
const { log } = require('console')
const category = require('../model/categorySchema')
require('dotenv').config()


//get method for category management

const manageCategory = async (req, res) => {
    var i = 0
    const categoryData = await category.find()
    res.render("./admin/manageCategory", { categoryData, i })
}

//get method for add category

const toaddCategory = (req, res) => {
    res.render('./admin/addCategory')
}


//post method for add category

const addCategory = async (req, res) => {
    try {
        const { name } = req.body
        const image = req.file.filename
        // log("aaaaaaaaaa",req.file)
        const existCategory = await category.findOne({ name })
        if (existCategory) {
            res.render('./admin/addCategory')
        } else {
            const newCategory = await category.create({
                name: name,
                image: image
            })
            // console.log("categptu",newCategory);
            res.redirect('/admin/manageCategory')
        }
    } catch (error) {
        console.log(error);
    }
}

//get method for admin edit category

const editCategory = async (req, res) => {
    const id = req.params.id;
    const categoryData = await category.findOne({ _id: id })
    // console.log("dljsfsffffffffffffffffffffffffffffffffffffff");
    res.render('./admin/editCategory', { categoryData })
}


//post method for admin edit category

const afterEditCategory = async (req, res) => {
    try {
        const id = req.params.id
        const name = req.body.name
        const newImage=req.file?req.file.filename:undefined

        const updatedCategory = await category.findByIdAndUpdate(id,
            {
                $set: {
                    name: name,
                    image:newImage
                }
            })
        console.log("editing done");
        res.redirect('/admin/manageCategory')


    } catch (err) {
        console.log(err);
    }

}

// const editCategory=async (req,res)=>{

// }

module.exports = {
    manageCategory,
    toaddCategory,
    addCategory,
    editCategory,
    afterEditCategory
}
