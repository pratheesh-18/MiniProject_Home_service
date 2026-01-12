import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import { User } from '../models/User';
import { Provider } from '../models/Provider';
import bcrypt from 'bcryptjs';

dotenv.config();

// Clustered locations (simulating different service areas)
const locationClusters = [
  { center: [77.5946, 12.9716], name: 'Bangalore Central' }, // Bangalore
  { center: [77.6412, 12.9352], name: 'Bangalore North' },
  { center: [77.6123, 12.9141], name: 'Bangalore South' },
  { center: [77.5500, 12.9500], name: 'Bangalore East' },
  { center: [77.6000, 13.0000], name: 'Bangalore West' },
];

const services = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Cleaning',
  'Painting',
  'Appliance Repair',
  'AC Service',
  'Pest Control',
  'Gardening',
  'Moving & Packing',
];

const names = [
  'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy', 'Vikram Singh',
  'Anjali Mehta', 'Rahul Gupta', 'Kavita Nair', 'Suresh Iyer', 'Meera Joshi',
  'Arjun Desai', 'Divya Rao', 'Karan Malhotra', 'Shreya Agarwal', 'Nikhil Shah',
  'Pooja Verma', 'Rohan Kapoor', 'Anita Choudhury', 'Varun Trivedi', 'Neha Saxena',
  'Aditya Menon', 'Swati Nambiar', 'Gaurav Pillai', 'Riya Menon', 'Harsh Varma',
  'Tanvi Krishnan', 'Kunal Nair', 'Isha Iyer', 'Ravi Pillai', 'Sonia Menon',
  'Manish Nambiar', 'Deepa Pillai', 'Abhishek Menon', 'Jyoti Nair', 'Siddharth Iyer',
  'Ritika Pillai', 'Vivek Menon', 'Anushka Nair', 'Rohit Iyer', 'Kritika Pillai',
  'Sahil Menon', 'Aishwarya Nair', 'Yash Iyer', 'Nisha Pillai', 'Akash Menon',
  'Riya Nair', 'Karan Iyer', 'Sneha Pillai', 'Rahul Menon', 'Priya Nair',
];

const generateRandomLocation = (cluster: typeof locationClusters[0]) => {
  // Generate random location within 5km radius of cluster center
  const radius = 5 / 111; // Convert km to degrees (approximate)
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * radius;
  
  const longitude = cluster.center[0] + distance * Math.cos(angle);
  const latitude = cluster.center[1] + distance * Math.sin(angle);
  
  return [longitude, latitude];
};

const generateRandomRating = () => {
  // Generate rating between 3.5 and 5.0
  return parseFloat((3.5 + Math.random() * 1.5).toFixed(2));
};

const generateRandomHourlyRate = () => {
  // Generate hourly rate between 200 and 2000
  return Math.floor(200 + Math.random() * 1800);
};

const seedProviders = async () => {
  console.log('Seeding providers...');

  // Clear existing providers
  await Provider.deleteMany({});
  await User.deleteMany({ role: 'provider' });

  const hashedPassword = await bcrypt.hash('password123', 10);

  const providers = [];

  for (let i = 0; i < 50; i++) {
    const cluster = locationClusters[i % locationClusters.length];
    const [longitude, latitude] = generateRandomLocation(cluster);
    
    const name = names[i % names.length];
    const email = `provider${i + 1}@example.com`;
    const phone = `+91${9000000000 + i}`;

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'provider',
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      address: `${cluster.name}, Bangalore`,
      isVerified: Math.random() > 0.3, // 70% verified
    });

    // Select random services (1-3 services per provider)
    const numServices = Math.floor(Math.random() * 3) + 1;
    const providerServices = [];
    const usedServices = new Set();
    
    for (let j = 0; j < numServices; j++) {
      let service;
      do {
        service = services[Math.floor(Math.random() * services.length)];
      } while (usedServices.has(service));
      usedServices.add(service);
      providerServices.push(service);
    }

    // Create provider profile
    const rating = generateRandomRating();
    const totalRatings = Math.floor(Math.random() * 100) + 5;
    const hourlyRate = generateRandomHourlyRate();
    const experience = Math.floor(Math.random() * 20) + 1;

    const badges = [];
    if (user.isVerified) badges.push('verified');
    if (rating >= 4.5) badges.push('top-rated');
    if (totalRatings >= 50) badges.push('popular');
    if (rating >= 4.0 && totalRatings >= 20) badges.push('expert');

    const provider = await Provider.create({
      user: user._id,
      services: providerServices,
      experience,
      hourlyRate,
      isVerified: user.isVerified,
      isAvailable: Math.random() > 0.2, // 80% available
      currentLocation: {
        type: 'Point',
        coordinates: [longitude, latitude],
        updatedAt: new Date(),
      },
      rating,
      totalRatings,
      badges,
      bio: `Experienced ${providerServices[0]} professional with ${experience} years of service.`,
    });

    providers.push(provider);
  }

  console.log(`✅ Seeded ${providers.length} providers`);
  return providers;
};

const seedAdmin = async () => {
  console.log('Seeding admin user...');

  const adminEmail = 'admin@example.com';
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await User.create({
      name: 'Admin User',
      email: adminEmail,
      password: hashedPassword,
      phone: '+919999999999',
      role: 'admin',
      isVerified: true,
    });

    console.log('✅ Admin user created (email: admin@example.com, password: admin123)');
  } else {
    console.log('ℹ️  Admin user already exists');
  }
};

const seedCustomer = async () => {
  console.log('Seeding test customer...');

  const customerEmail = 'customer@example.com';
  const existingCustomer = await User.findOne({ email: customerEmail });

  if (!existingCustomer) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await User.create({
      name: 'Test Customer',
      email: customerEmail,
      password: hashedPassword,
      phone: '+918888888888',
      role: 'customer',
      location: {
        type: 'Point',
        coordinates: [77.5946, 12.9716], // Bangalore Central
      },
      address: 'Bangalore Central',
      isVerified: true,
    });

    console.log('✅ Test customer created (email: customer@example.com, password: password123)');
  } else {
    console.log('ℹ️  Test customer already exists');
  }
};

const runSeed = async () => {
  try {
    await connectDB();
    
    await seedAdmin();
    await seedCustomer();
    await seedProviders();

    console.log('\n✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  runSeed();
}

export { seedProviders, seedAdmin, seedCustomer };

