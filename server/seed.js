import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Restaurant from './models/Restaurant.js';
import Table from './models/Table.js';
import MenuItem from './models/MenuItem.js';
import Review from './models/Review.js';
import Reservation from './models/Reservation.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Clear all collections
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await Table.deleteMany({});
    await MenuItem.deleteMany({});
    await Review.deleteMany({});
    await Reservation.deleteMany({});
    console.log('✅ Collections cleared');

    // Create Users — save individually so pre('save') hash hook runs
    console.log('👥 Creating users...');
    const userData = [
      { name: 'Super Admin',    email: 'superadmin@dineway.com', passwordHash: 'Admin1234!', role: 'super_admin' },
      { name: 'Admin',          email: 'admin@dineway.com',      passwordHash: 'Admin1234!', role: 'admin' },
      { name: 'Cynthia',        email: 'cynthia@gmail.com',      passwordHash: 'Test1234!',  role: 'customer' },
      { name: 'M Hotel Manager',email: 'manager@mhotel.com',     passwordHash: 'Admin1234!', role: 'restaurant_admin' },
    ];
    const users = [];
    for (const u of userData) {
      const doc = new User(u);
      await doc.save();
      users.push(doc);
    }
    console.log(`✅ Created ${users.length} users`);

    // Create Restaurants
    console.log('🏪 Creating restaurants...');
    const restaurants = await Restaurant.create([
      {
        name: 'M Hotel',
        description: 'An elegant hotel dining experience with panoramic city views',
        category: 'Fine Dining',
        address: { street: '15 City Heights', city: 'Kigali', country: 'Rwanda' },
        phone: '+250 788 123 456',
        email: 'info@mhotel.com',
        status: 'registered',
        rating: 4.8,
        reviewCount: 1,
        ownerId: users[3]._id, // M Hotel Manager
      },
      {
        name: 'Chez Lando',
        description: 'Authentic French bistro with hand-crafted dishes',
        category: 'French',
        address: { street: '7 Rue de Paris', city: 'Kigali', country: 'Rwanda' },
        phone: '+250 788 234 567',
        email: 'info@chezlando.com',
        status: 'registered',
        rating: 4.6,
        reviewCount: 1,
        ownerId: users[0]._id,
      },
      {
        name: 'Onomo Hotel',
        description: 'A fusion of global flavors in a modern setting',
        category: 'Casual',
        address: { street: '22 International Blvd', city: 'Kigali', country: 'Rwanda' },
        phone: '+250 788 345 678',
        email: 'info@onomohotel.com',
        status: 'registered',
        rating: 4.5,
        reviewCount: 1,
        ownerId: users[0]._id,
      },
      {
        name: 'Soy Restaurant',
        description: 'Contemporary Asian cuisine with bold, fresh flavors',
        category: 'Asian',
        address: { street: '88 East Street', city: 'Kigali', country: 'Rwanda' },
        phone: '+250 788 456 789',
        email: 'info@soyrestaurant.com',
        status: 'pending',
        rating: 4.3,
        reviewCount: 0,
        ownerId: users[0]._id,
      },
      {
        name: 'Choose Kigali',
        description: 'Authentic local flavors celebrating African heritage',
        category: 'African',
        address: { street: '5 Kigali Road', city: 'Kigali', country: 'Rwanda' },
        phone: '+250 788 567 890',
        email: 'info@choosekigali.com',
        status: 'registered',
        rating: 4.7,
        reviewCount: 0,
        ownerId: users[0]._id,
      },
      {
        name: 'Burger Planet',
        description: 'Gourmet burgers and comfort food done right',
        category: 'Fast Food',
        address: { street: '33 Main Street', city: 'Kigali', country: 'Rwanda' },
        phone: '+250 788 678 901',
        email: 'info@burgerplanet.com',
        status: 'pending',
        rating: 4.1,
        reviewCount: 0,
        ownerId: users[0]._id,
      },
    ]);
    console.log(`✅ Created ${restaurants.length} restaurants`);

    // Link M Hotel Manager to M Hotel
    await User.findByIdAndUpdate(users[3]._id, { restaurantId: restaurants[0]._id });
    console.log('✅ Linked M Hotel Manager to M Hotel');

    // Create Tables (2 per restaurant)
    console.log('🪑 Creating tables...');
    const tables = [];
    for (const restaurant of restaurants) {
      tables.push(
        {
          restaurantId: restaurant._id,
          tableNumber: 1,
          capacity: 2,
          isAvailable: true,
        },
        {
          restaurantId: restaurant._id,
          tableNumber: 2,
          capacity: 4,
          isAvailable: true,
        }
      );
    }
    await Table.insertMany(tables);
    console.log(`✅ Created ${tables.length} tables`);

    // Create Menu Items (3 per restaurant)
    console.log('🍽️  Creating menu items...');
    const menuItems = [
      // M Hotel
      {
        restaurantId: restaurants[0]._id,
        name: 'Lobster Thermidor',
        description: 'Fresh lobster baked with creamy cheese sauce',
        price: 45.99,
        category: 'Mains',
        isPopular: true,
      },
      {
        restaurantId: restaurants[0]._id,
        name: 'Caesar Salad',
        description: 'Crisp romaine lettuce with parmesan and croutons',
        price: 12.99,
        category: 'Starters',
      },
      {
        restaurantId: restaurants[0]._id,
        name: 'Chocolate Soufflé',
        description: 'Light and airy chocolate dessert',
        price: 9.99,
        category: 'Desserts',
      },
      // Chez Lando
      {
        restaurantId: restaurants[1]._id,
        name: 'Coq au Vin',
        description: 'Traditional French chicken braised in red wine',
        price: 28.99,
        category: 'Mains',
        isPopular: true,
      },
      {
        restaurantId: restaurants[1]._id,
        name: 'French Onion Soup',
        description: 'Caramelized onions in beef broth with melted gruyère',
        price: 10.99,
        category: 'Starters',
      },
      {
        restaurantId: restaurants[1]._id,
        name: 'Crème Brûlée',
        description: 'Classic vanilla custard with caramelized sugar',
        price: 8.99,
        category: 'Desserts',
      },
      // Onomo Hotel
      {
        restaurantId: restaurants[2]._id,
        name: 'Grilled Salmon',
        description: 'Atlantic salmon with lemon herb butter',
        price: 32.99,
        category: 'Mains',
        isPopular: true,
      },
      {
        restaurantId: restaurants[2]._id,
        name: 'Spring Rolls',
        description: 'Crispy vegetable rolls with sweet chili sauce',
        price: 8.99,
        category: 'Starters',
      },
      {
        restaurantId: restaurants[2]._id,
        name: 'Tiramisu',
        description: 'Italian coffee-flavored dessert',
        price: 9.99,
        category: 'Desserts',
      },
      // Soy Restaurant
      {
        restaurantId: restaurants[3]._id,
        name: 'Pad Thai',
        description: 'Stir-fried rice noodles with shrimp and peanuts',
        price: 18.99,
        category: 'Mains',
        isPopular: true,
      },
      {
        restaurantId: restaurants[3]._id,
        name: 'Edamame',
        description: 'Steamed soybeans with sea salt',
        price: 5.99,
        category: 'Starters',
      },
      {
        restaurantId: restaurants[3]._id,
        name: 'Mochi Ice Cream',
        description: 'Japanese rice cake with ice cream filling',
        price: 7.99,
        category: 'Desserts',
      },
      // Choose Kigali
      {
        restaurantId: restaurants[4]._id,
        name: 'Nyama Choma',
        description: 'Grilled goat meat with traditional spices',
        price: 24.99,
        category: 'Mains',
        isPopular: true,
      },
      {
        restaurantId: restaurants[4]._id,
        name: 'Sambaza',
        description: 'Fried small fish with chili and lime',
        price: 9.99,
        category: 'Starters',
      },
      {
        restaurantId: restaurants[4]._id,
        name: 'Matoke',
        description: 'Steamed green bananas in peanut sauce',
        price: 12.99,
        category: 'Mains',
      },
      // Burger Planet
      {
        restaurantId: restaurants[5]._id,
        name: 'Planet Burger',
        description: 'Double beef patty with special sauce, cheese, and pickles',
        price: 15.99,
        category: 'Mains',
        isPopular: true,
      },
      {
        restaurantId: restaurants[5]._id,
        name: 'Loaded Fries',
        description: 'Crispy fries with cheese, bacon, and sour cream',
        price: 8.99,
        category: 'Starters',
      },
      {
        restaurantId: restaurants[5]._id,
        name: 'Classic Milkshake',
        description: 'Vanilla, chocolate, or strawberry',
        price: 5.99,
        category: 'Drinks',
      },
    ];
    await MenuItem.insertMany(menuItems);
    console.log(`✅ Created ${menuItems.length} menu items`);

    // Create Reviews
    console.log('⭐ Creating reviews...');
    const reviews = await Review.create([
      {
        userId: users[2]._id, // Cynthia
        restaurantId: restaurants[1]._id,
        rating: 5,
        comment: 'Absolutely unforgettable. Every dish was art, every moment felt luxurious.',
        status: 'approved',
      },
      {
        userId: users[2]._id, // Cynthia
        restaurantId: restaurants[0]._id,
        rating: 5,
        comment: 'The ambiance and service exceeded every expectation I had.',
        status: 'approved',
      },
      {
        userId: users[2]._id, // Cynthia
        restaurantId: restaurants[2]._id,
        rating: 4,
        comment: "A culinary journey unlike anything I've experienced before.",
        status: 'approved',
      },
    ]);
    console.log(`✅ Created ${reviews.length} reviews`);

    // Create Reservations
    console.log('📅 Creating reservations...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    const allTables = await Table.find();
    const reservations = await Reservation.create([
      {
        userId: users[2]._id, // Cynthia
        restaurantId: restaurants[1]._id, // Chez Lando
        tableId: allTables.find(t => t.restaurantId.toString() === restaurants[1]._id.toString())._id,
        date: tomorrow,
        timeSlot: '19:00',
        guestCount: 2,
        status: 'confirmed',
      },
      {
        userId: users[2]._id, // Cynthia
        restaurantId: restaurants[0]._id, // M Hotel
        tableId: allTables.find(t => t.restaurantId.toString() === restaurants[0]._id.toString() && t.capacity >= 4)._id,
        date: threeDaysLater,
        timeSlot: '20:00',
        guestCount: 4,
        status: 'pending',
      },
    ]);
    console.log(`✅ Created ${reservations.length} reservations`);

    console.log('\n✅ Seed complete!');
    console.log('─────────────────────────────────────────');
    console.log('  Super Admin:       superadmin@dineway.com / Admin1234!  → http://localhost:5175');
    console.log('  Restaurant Admin:  manager@mhotel.com    / Admin1234!  → http://localhost:5174');
    console.log('  Customer:          cynthia@gmail.com     / Test1234!   → http://localhost:5173');
    console.log('─────────────────────────────────────────');
    console.log(`  ${restaurants.length} restaurants | ${allTables.length} tables | ${reviews.length} reviews | ${reservations.length} reservations`);

    // Disconnect
    await mongoose.disconnect();
    console.log('\n👋 MongoDB disconnected');
  } catch (error) {
    console.error('❌ Seed Error:', error);
    process.exit(1);
  }
};

seedData();