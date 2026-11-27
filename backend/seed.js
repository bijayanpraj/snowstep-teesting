import mongoose from "mongoose";
import Shoe from "./schema/shoeSchema.js";

let imageUrl = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

let shoes = [
  {
    name: "Everyday Pace Runner",
    brand: "Nike",
    category: "Running",
    price: 6800,
    quantity: 12,
    image: imageUrl("photo-1542291026-7eec264c27ff"),
    description:
      "A breathable mesh upper and cushioned sole make this an easy choice for morning runs, long walks, and busy days on your feet.",
    isFeatured: true,
    isTrending: true,
  },
  {
    name: "Street Court Low",
    brand: "Adidas",
    category: "Casual",
    price: 5900,
    quantity: 16,
    image: imageUrl("photo-1600185365926-3a2ce3cdb9eb"),
    description:
      "A clean low-top with a padded collar and soft footbed. Its simple court-inspired look pairs easily with everyday outfits.",
    isFeatured: true,
    isBestSeller: true,
  },
  {
    name: "Flex Knit Trainer",
    brand: "Puma",
    category: "Training",
    price: 5200,
    quantity: 10,
    image: imageUrl("photo-1608231387042-66d1773070a5"),
    description:
      "The flexible upper moves comfortably with your foot, while the steady outsole is ready for gym sessions and errands afterward.",
    isNewArrival: true,
  },
  {
    name: "Trail Ease Runner",
    brand: "New Balance",
    category: "Running",
    price: 7400,
    quantity: 8,
    image: imageUrl("photo-1595950653106-6c9ebd614d3a"),
    description:
      "A supportive everyday runner with a grippy sole and a comfortably padded fit for park paths and light trails.",
    isFeatured: true,
  },
  {
    name: "Canvas High Street",
    brand: "Converse",
    category: "Casual",
    price: 4300,
    quantity: 20,
    image: imageUrl("photo-1525966222134-fcfa99b8ae77"),
    description:
      "A relaxed canvas high-top with a supportive ankle and durable rubber sole, made for casual outfits and weekend plans.",
    isBestSeller: true,
  },
  {
    name: "Daily Walk Classic",
    brand: "Reebok",
    category: "Walking",
    price: 4800,
    quantity: 14,
    image: imageUrl("photo-1552346154-21d32810aba3"),
    description:
      "A versatile lace-up with a cushioned insole and sturdy outsole, comfortable for commuting, shopping, and everyday wear.",
    isTrending: true,
  },
  {
    name: "Court Rise Trainer",
    brand: "Nike",
    category: "Sports",
    price: 7100,
    quantity: 7,
    image: imageUrl("photo-1460353581641-37baddab0fa2"),
    description:
      "A secure, supportive fit and responsive cushioning make this a dependable option for court practice and active days.",
    isNewArrival: true,
    isFeatured: true,
  },
  {
    name: "Summit Path Walker",
    brand: "Adidas",
    category: "Walking",
    price: 6200,
    quantity: 11,
    image: imageUrl("photo-1606107557195-0e29a4b5b4aa"),
    description:
      "Designed for comfortable everyday exploring, with a breathable feel, flexible step, and durable tread for mixed city paths.",
    isTrending: true,
  },
];

let run = async () => {
  let mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("MONGODB_URI must be set before seeding the database.");
    process.exitCode = 1;
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    let result = await Shoe.bulkWrite(
      shoes.map((shoe) => ({
        replaceOne: {
          filter: { name: shoe.name, brand: shoe.brand },
          replacement: shoe,
          upsert: true,
        },
      }))
    );
    console.log(
      `Seeded 8 shoes (${result.upsertedCount} added, ${result.modifiedCount} updated).`
    );
  } catch (error) {
    console.error(`Unable to seed shoes: ${error.message}`);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

run();
