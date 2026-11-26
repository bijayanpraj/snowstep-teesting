// run once: npm run seed (adds or refreshes the starter shoes)
import mongoose from "mongoose";
import Shoe from "./schema/shoeSchema.js";

let u = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

let shoeDetails = [
  ["Air Glacier 01", "Nike", "Running", 180, 12, "photo-1542291026-7eec264c27ff"],
  ["Frost Court Classic", "Nike", "Casual", 130, 20, "photo-1600185365926-3a2ce3cdb9eb"],
  ["Powder Runner", "Adidas", "Running", 160, 9, "photo-1491553895911-0055eca6402d"],
  ["Drift Low", "Puma", "Casual", 110, 15, "photo-1549298916-b41d501d3772"],
  ["Aurora High", "Converse", "Casual", 95, 25, "photo-1525966222134-fcfa99b8ae77"],
  ["Summit Pro", "New Balance", "Sports", 200, 6, "photo-1595950653106-6c9ebd614d3a"],
  ["Glide Elite", "Nike", "Running", 220, 4, "photo-1460353581641-37baddab0fa2"],
  ["Alpine Street", "Adidas", "Casual", 140, 18, "photo-1606107557195-0e29a4b5b4aa"],
  ["Court Vision", "Reebok", "Basketball", 125, 14, "photo-1552346154-21d32810aba3"],
  ["Velocity Knit", "Puma", "Training", 115, 22, "photo-1608231387042-66d1773070a5"],
  ["Classic Leather", "Reebok", "Casual", 100, 19, "photo-1551488831-00ddcb6c6bd3"],
  ["Fresh Foam Pace", "New Balance", "Running", 150, 11, "photo-1542291026-7eec264c27ff"],
  ["Chuck Taylor Lift", "Converse", "Casual", 85, 28, "photo-1525966222134-fcfa99b8ae77"],
  ["Adizero Sprint", "Adidas", "Training", 175, 8, "photo-1495555961986-6d4c1ecb7be3"],
  ["Suede Runner", "Puma", "Casual", 105, 16, "photo-1542291026-7eec264c27ff"],
  ["Club C 85", "Reebok", "Sports", 90, 21, "photo-1552346154-21d32810aba3"],
  ["574 Heritage", "New Balance", "Casual", 120, 17, "photo-1600185365926-3a2ce3cdb9eb"],
  ["Air Court Rise", "Nike", "Basketball", 190, 7, "photo-1460353581641-37baddab0fa2"],
  ["Forum Low", "Adidas", "Sports", 135, 13, "photo-1606107557195-0e29a4b5b4aa"],
  ["Pacer Trail", "Puma", "Running", 145, 10, "photo-1491553895911-0055eca6402d"],
  ["Classic High Street", "Converse", "Formal", 105, 12, "photo-1525966222134-fcfa99b8ae77"],
  ["Nano Flex", "Reebok", "Training", 118, 9, "photo-1608231387042-66d1773070a5"],
  ["Fresh Foam Roam", "New Balance", "Sports", 165, 8, "photo-1595950653106-6c9ebd614d3a"],
  ["Air Studio", "Nike", "Training", 135, 15, "photo-1542291026-7eec264c27ff"],
];

let featuredItems = [0, 1, 3, 5, 8, 12, 18, 21];
let newArrivalItems = [2, 5, 7, 11, 13, 14, 17, 20, 22];
let bestSellerItems = [1, 4, 6, 10, 13, 15, 16, 19, 23];
let trendingItems = [0, 2, 6, 9, 11, 15, 18, 22];

let shoes = shoeDetails.map((details, index) => {
  let discountPercent = [3, 6, 7, 9, 12, 15, 17, 19, 21, 23].includes(index)
    ? [15, 10, 20, 12, 10, 18, 15, 8, 14, 10][[3, 6, 7, 9, 12, 15, 17, 19, 21, 23].indexOf(index)]
    : 0;
  let rating = Number((4.1 + ((index * 3) % 9) / 10).toFixed(1));

  return {
    name: details[0],
    brand: details[1],
    category: details[2],
    price: details[3],
    quantity: details[4],
    image: u(details[5]),
    description: `${details[1]} ${details[0]} combines considered design with comfortable everyday performance.`,
    isFeatured: featuredItems.includes(index),
    isNewArrival: newArrivalItems.includes(index),
    isBestSeller: bestSellerItems.includes(index),
    isTrending: trendingItems.includes(index),
    discountPercent,
    rating,
    reviewCount: 24 + index * 7,
    reviews: [
      {
        username: ["Maya", "Jordan", "Alex"][index % 3],
        rating,
        comment: [
          "Comfortable from the first wear.",
          "A great everyday shoe with a lovely fit.",
          "Looks even better in person.",
        ][index % 3],
      },
    ],
  };
});

let run = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/snowstep");
    let result = await Shoe.bulkWrite(
      shoes.map((shoe) => ({
        replaceOne: {
          filter: { name: shoe.name, brand: shoe.brand },
          replacement: shoe,
          upsert: true,
        },
      }))
    );
    console.log(`seeded ${result.upsertedCount + result.modifiedCount} shoes`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
