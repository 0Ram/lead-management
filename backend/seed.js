import mongoose from 'mongoose';
import Lead from './models/Lead.js';
import User from './models/User.js';
import bcrypt from 'bcrypt';
import initializeDatabase from './config/database.js';

const generateLeads = () => {
  const sources = ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'];
  const statuses = ['new', 'contacted', 'qualified', 'lost', 'won'];
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
  const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'OH', 'GA', 'NC'];
  const companies = ['TechCorp', 'Innovate Inc', 'Startup XYZ', 'Global Solutions', 'Digital Dreams', 'Future Tech', 'Smart Systems', 'Data Dynamics', 'Cloud Nine', 'ByteSize'];

  const leads = [];
  
  for (let i = 1; i <= 150; i++) {
    leads.push({
      first_name: `FirstName${i}`,
      last_name: `LastName${i}`,
      email: `lead${i}@example.com`,
      phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      company: companies[Math.floor(Math.random() * companies.length)],
      city: cities[Math.floor(Math.random() * cities.length)],
      state: states[Math.floor(Math.random() * states.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      score: Math.floor(Math.random() * 101),
      lead_value: parseFloat((Math.random() * 10000).toFixed(2)),
      last_activity_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      is_qualified: Math.random() > 0.5
    });
  }
  
  return leads;
};

const seedDatabase = async () => {
  try {
    await initializeDatabase();
    
    // Clear existing leads
    await Lead.deleteMany({});
    console.log('🗑️ Existing leads cleared');
    
    // Generate and insert new leads
    const leads = generateLeads();
    await Lead.insertMany(leads);
    console.log('✅ 150 leads inserted successfully');
    
    // Create test user if doesn't exist
    const testEmail = 'testuser@erino.com';
    const testPassword = 'Test@1234';
    
    let user = await User.findOne({ email: testEmail });
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(testPassword, salt);
      
      user = new User({
        name: 'Test User',
        email: testEmail,
        password: hashedPassword
      });
      
      await user.save();
      console.log('✅ Test user created successfully');
    }
    
    console.log('📋 Test user credentials:');
    console.log('Email:', testEmail);
    console.log('Password:', testPassword);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();