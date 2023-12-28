// const { log } = require('console')
const { log } = require('console')
const category = require('../model/categorySchema')
require('dotenv').config()


//get method for category management

const manageCategory = async (req, res) => {
    try{
        var i = 0
        const categoryData = await category.find().sort({name:1})
        res.render("./admin/manageCategory", { categoryData, i })

    }catch(err){
        console.error(err)
    }
}

//get method for add category

const toaddCategory = (req, res) => {
    try{
        const message = req.flash('success')
        const errorMessage = req.flash('error');
        res.render('./admin/addCategory',{message,errorMessage})

    }catch(err){
        console.error(err)
    }
}



//post method for add category

const addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const image = req.file ? req.file.filename : null;

        const lowerCaseName = name.toLowerCase();
        const nameRegex = new RegExp('^' + lowerCaseName + '$', 'i'); 

        const existCategory = await category.findOne({ name: nameRegex });

        if (existCategory) {
            req.flash("success", "Category with the same name already exists")
            res.redirect('/admin/add/category');
        } else {
            if(image !==null){
            const newCategory = await category.create({
                name: lowerCaseName,
                image: image
            });
            res.redirect('/admin/manageCategory');
        }else{
            req.flash("error", "Image is required for the category");
            res.redirect('/admin/add/category');
        }}
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


//get method for admin edit category

const editCategory = async (req, res) => {
    try{
        const id = req.params.id;
        const categoryData = await category.findOne({ _id: id })
        res.render('./admin/editCategory', { categoryData })

    }catch(err){
        console.error(err)
    }
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
    try{
        const id = req.params.id
        const block = await category.updateOne({ _id: id }, { $set: { status: false } })
        return res.redirect('/admin/manageCategory')

    }catch(err){
        console.error(err)
    }
}

//post method for categoryblock
const UnblockCategory = async (req, res) => {
    try{

        const id = req.params.id
        const block = await category.updateOne({ _id: id }, { $set: { status: true } })
        return res.redirect('/admin/manageCategory')

    }catch(err){
        console.error(err)
    }
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
