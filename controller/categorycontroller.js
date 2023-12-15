// const { log } = require('console')
const { log } = require('console')
const category = require('../model/categorySchema')
require('dotenv').config()


//get method for category management

const manageCategory = async (req, res) => {
    var i = 0
    const categoryData = await category.find().sort({name:1})
    res.render("./admin/manageCategory", { categoryData, i })
}

//get method for add category

const toaddCategory = (req, res) => {
    const message = req.flash('success')
    res.render('./admin/addCategory',{message})
}



//post method for add category

const addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const image = req.file.filename;

        const lowerCaseName = name.toLowerCase();
        const nameRegex = new RegExp('^' + lowerCaseName + '$', 'i'); 

        const existCategory = await category.findOne({ name: nameRegex });

        if (existCategory) {
            req.flash("success", "Category with the same name already exists")
            res.redirect('/admin/add/category');
        } else {
            const newCategory = await category.create({
                name: lowerCaseName,
                image: image
            });
            res.redirect('/admin/manageCategory');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};


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

//post method for categoryblock
const blockCategory = async (req, res) => {
    const id = req.params.id
    const block = await category.updateOne({ _id: id }, { $set: { status: false } })
    return res.redirect('/admin/manageCategory')
}

//post method for categoryblock
const UnblockCategory = async (req, res) => {
    const id = req.params.id
    const block = await category.updateOne({ _id: id }, { $set: { status: true } })
    return res.redirect('/admin/manageCategory')
}


module.exports = {
    manageCategory,
    toaddCategory,
    addCategory,
    editCategory,
    afterEditCategory,
    blockCategory,
    UnblockCategory
}
