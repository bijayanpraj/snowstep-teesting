import { model, Schema } from "mongoose"

let shoeSchema = Schema({
    name: {
        type: String,
        required: [true, "name is required."],
    },
    brand: {
        type: String,
        required: [true, "brand is required."],
    },
    category: {
        type: String,
        required: [true, "category is required."],
    },
    price: {
        type: Number,
        required: [true, "price is required."],
    },
    quantity: {
        type: Number,
        required: [true, "quantity is required."],
    },
    image: {
        type: String,
        required: [true, "image is required."],
    },
    description: {
        type: String,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    isNewArrival: {
        type: Boolean,
        default: false,
    },
    isBestSeller: {
        type: Boolean,
        default: false,
    },
    isTrending: {
        type: Boolean,
        default: false,
    },
    discountPercent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    reviewCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    reviews: [
        {
            username: String,
            rating: {
                type: Number,
                min: 0,
                max: 5,
            },
            comment: String,
        },
    ],
})

let Shoe = model("Shoe", shoeSchema)
export default Shoe

/* 
shoe
    name        String
    brand       String
    category    String
    price       Number
    quantity    Number
    image       String (url)
    description String
*/
