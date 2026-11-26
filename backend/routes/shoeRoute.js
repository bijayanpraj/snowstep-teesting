import { Router } from "express";
import Shoe from "../schema/shoeSchema.js";
import {
    adminMiddleware,
    authMiddleware,
    shoeManagementMiddleware,
} from "../auth.js";

let shoeRoute = Router()

let getShoesByFlag = (flag) => async (req, res) => {
    try {
        let result = await Shoe.find({ [flag]: true })
        res.status(200).json({
            success: true,
            message: "Shoes read successfully.",
            result: result,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

shoeRoute.get("/featured", getShoesByFlag("isFeatured"))
shoeRoute.get("/new-arrivals", getShoesByFlag("isNewArrival"))
shoeRoute.get("/best-sellers", getShoesByFlag("isBestSeller"))
shoeRoute.get("/trending", getShoesByFlag("isTrending"))
shoeRoute.get("/offers", async (req, res) => {
    try {
        let result = await Shoe.find({ discountPercent: { $gt: 0 } })
        res.status(200).json({
            success: true,
            message: "Offers read successfully.",
            result: result,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
})
shoeRoute.get("/categories", async (req, res) => {
    try {
        let result = await Shoe.distinct("category")
        res.status(200).json({
            success: true,
            message: "Categories read successfully.",
            result: result,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
})
shoeRoute.get("/brands", async (req, res) => {
    try {
        let result = await Shoe.distinct("brand")
        res.status(200).json({
            success: true,
            message: "Brands read successfully.",
            result: result,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
})

shoeRoute
    .route("/")
    .post(shoeManagementMiddleware, async (req, res, next) => {
        try {
            let result = await Shoe.create(req.body) //Shoe.create is the main thing sending/creating the data
            res.status(200).json({
                success: true,
                message: "Shoe created successfully.",
                result: result,
            })
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message,
            })
        }
    })
    .get(async (req, res, next) => {
        try {
            let result = await Shoe.find()
            res.status(200).json({
                success: true,
                message: "Shoes read successfully.",
                result: result,
            })
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message,
            })
        }
    })
//
shoeRoute
    .route("/:id") //localhost:8000/shoe/id
    .get(async (req, res, next) => {
        try {
            let result = await Shoe.findById(req.params.id)
            res.status(200).json({
                success: true,
                message: "Shoe read successfully.",
                result: result,
            })
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message,
            })
        }
    })
    .patch(shoeManagementMiddleware, async (req, res, next) => {
        try {
            let result = await Shoe.findByIdAndUpdate(req.params.id, req.body, { new: true }) // new:true so postman shows the updated data
            res.status(200).json({
                success: true,
                message: "Shoe updated successfully.",
                result: result,
            })
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message,
            })
        }
    })
    .delete(authMiddleware, adminMiddleware, async (req, res, next) => {
        try {
            let result = await Shoe.findByIdAndDelete(req.params.id)
            res.status(200).json({
                success: true,
                message: "Shoe deleted successfully.",
                result: result,
            })
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message,
            })
        }
    })

export default shoeRoute

// localhost:8000/shoe
// post => create a shoe
// get  => all shoes

// localhost:8000/shoe/:id
// get => one shoe
// patch => update shoe
// delete => delete shoe
