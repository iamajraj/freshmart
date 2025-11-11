import { APP_CONFIG } from "@/lib/config";
import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs";

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.argv[2];
  const adminPassword = process.argv[3];

  if (!adminEmail || !adminPassword) {
    console.error("Usage: npm run seed <admin-email> <admin-password>");
    process.exit(1);
  }

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "Fruits & Vegetables" },
      update: {},
      create: {
        name: "Fruits & Vegetables",
        description: "Fresh fruits and vegetables",
        image: "🥬",
      },
    }),
    prisma.category.upsert({
      where: { name: "Dairy & Eggs" },
      update: {},
      create: {
        name: "Dairy & Eggs",
        description: "Milk, cheese, eggs and dairy products",
        image: "🥛",
      },
    }),
    prisma.category.upsert({
      where: { name: "Meat & Seafood" },
      update: {},
      create: {
        name: "Meat & Seafood",
        description: "Fresh meat, poultry and seafood",
        image: "🥩",
      },
    }),
    prisma.category.upsert({
      where: { name: "Bakery" },
      update: {},
      create: {
        name: "Bakery",
        description: "Fresh bread, pastries and baked goods",
        image: "🍞",
      },
    }),
    prisma.category.upsert({
      where: { name: "Pantry Staples" },
      update: {},
      create: {
        name: "Pantry Staples",
        description: "Rice, pasta, canned goods and essentials",
        image: "🥫",
      },
    }),
    prisma.category.upsert({
      where: { name: "Beverages" },
      update: {},
      create: {
        name: "Beverages",
        description: "Drinks, juices and refreshments",
        image: "🥤",
      },
    }),
    prisma.category.upsert({
      where: { name: "Snacks" },
      update: {},
      create: {
        name: "Snacks",
        description: "Chips, candies and snack foods",
        image: "🍿",
      },
    }),
    prisma.category.upsert({
      where: { name: "Household" },
      update: {},
      create: {
        name: "Household",
        description: "Cleaning supplies and household items",
        image: "🧹",
      },
    }),
  ])

  // Create sample products
  const products = [
    // Fruits & Vegetables
    {
      name: "Organic Bananas",
      description: "Fresh organic bananas, perfect for snacking",
      price: 2.99,
      stock: 50,
      unit: "bunch",
      categoryId: categories[0].id,
    },
    {
      name: "Red Apples",
      description: "Crisp and juicy red apples",
      price: 3.49,
      stock: 30,
      unit: "lb",
      categoryId: categories[0].id,
    },
    {
      name: "Fresh Spinach",
      description: "Nutrient-rich fresh spinach leaves",
      price: 2.49,
      stock: 25,
      unit: "bag",
      categoryId: categories[0].id,
    },

    // Dairy & Eggs
    {
      name: "Whole Milk",
      description: "Fresh whole milk from local dairy",
      price: 3.99,
      stock: 40,
      unit: "gallon",
      categoryId: categories[1].id,
    },
    {
      name: "Free Range Eggs",
      description: "Farm fresh free-range eggs",
      price: 4.99,
      stock: 60,
      unit: "dozen",
      categoryId: categories[1].id,
    },
    {
      name: "Cheddar Cheese",
      description: "Sharp cheddar cheese block",
      price: 5.99,
      stock: 20,
      unit: "lb",
      categoryId: categories[1].id,
    },

    // Meat & Seafood
    {
      name: "Chicken Breast",
      description: "Boneless skinless chicken breast",
      price: 8.99,
      stock: 35,
      unit: "lb",
      categoryId: categories[2].id,
    },
    {
      name: "Atlantic Salmon",
      description: "Fresh Atlantic salmon fillet",
      price: 12.99,
      stock: 15,
      unit: "lb",
      categoryId: categories[2].id,
    },

    // Bakery
    {
      name: "Sourdough Bread",
      description: "Artisan sourdough bread loaf",
      price: 4.49,
      stock: 25,
      unit: "loaf",
      categoryId: categories[3].id,
    },
    {
      name: "Blueberry Muffins",
      description: "Fresh baked blueberry muffins",
      price: 6.99,
      stock: 20,
      unit: "pack",
      categoryId: categories[3].id,
    },

    // Pantry Staples
    {
      name: "Organic Brown Rice",
      description: "Premium organic brown rice",
      price: 4.99,
      stock: 45,
      unit: "lb",
      categoryId: categories[4].id,
    },
    {
      name: "Extra Virgin Olive Oil",
      description: "Cold pressed extra virgin olive oil",
      price: 9.99,
      stock: 30,
      unit: "bottle",
      categoryId: categories[4].id,
    },

    // Beverages
    {
      name: "Orange Juice",
      description: "Fresh squeezed orange juice",
      price: 4.49,
      stock: 25,
      unit: "bottle",
      categoryId: categories[5].id,
    },
    {
      name: "Sparkling Water",
      description: "Naturally sparkling mineral water",
      price: 1.99,
      stock: 100,
      unit: "bottle",
      categoryId: categories[5].id,
    },

    // Snacks
    {
      name: "Mixed Nuts",
      description: "Premium mixed nuts assortment",
      price: 7.99,
      stock: 20,
      unit: "bag",
      categoryId: categories[6].id,
    },
    {
      name: "Dark Chocolate",
      description: "70% dark chocolate bar",
      price: 3.49,
      stock: 40,
      unit: "bar",
      categoryId: categories[6].id,
    },

    // Household
    {
      name: "Laundry Detergent",
      description: "Concentrated laundry detergent",
      price: 8.99,
      stock: 25,
      unit: "bottle",
      categoryId: categories[7].id,
    },
    {
      name: "Dish Soap",
      description: "Lemon scented dish washing soap",
      price: 2.99,
      stock: 35,
      unit: "bottle",
      categoryId: categories[7].id,
    },
  ]

  for (const product of products) {
    await prisma.product.create({
      data: product,
    })
  }

  // Create loyalty rewards
  const rewards = await Promise.all([
    prisma.reward.upsert({
      where: { id: "discount-5" },
      update: {},
      create: {
        id: "discount-5",
        name: "$5 Off Next Order",
        description: "Get $5 off your next purchase of $25 or more",
        pointsCost: 500,
        value: 5,
        type: "DISCOUNT",
      },
    }),
    prisma.reward.upsert({
      where: { id: "discount-10" },
      update: {},
      create: {
        id: "discount-10",
        name: "$10 Off Next Order",
        description: "Get $10 off your next purchase of $50 or more",
        pointsCost: 1000,
        value: 10,
        type: "DISCOUNT",
      },
    }),
    prisma.reward.upsert({
      where: { id: "free-delivery" },
      update: {},
      create: {
        id: "free-delivery",
        name: "Free Delivery",
        description: "Free delivery on your next order",
        pointsCost: 300,
        value: 4.99,
        type: "FREE_DELIVERY",
      },
    }),
    prisma.reward.upsert({
      where: { id: "free-product-small" },
      update: {},
      create: {
        id: "free-product-small",
        name: "Free Small Item",
        description: "Choose any item under $5 for free",
        pointsCost: 400,
        value: 5,
        type: "FREE_PRODUCT",
      },
    }),
    prisma.reward.upsert({
      where: { id: "cashback-5" },
      update: {},
      create: {
        id: "cashback-5",
        name: "$5 Cashback",
        description: "Get $5 credited to your account",
        pointsCost: 600,
        value: 5,
        type: "CASHBACK",
      },
    }),
  ])

  console.log("Created loyalty rewards:", rewards.length)

  // Create admin user
  const hashedPassword = await hash(adminPassword, APP_CONFIG.PASSWORD_HASH_ROUNDS);
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin User",
      role: "ADMIN",
      password: hashedPassword,
    },
  })

  console.log("Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
