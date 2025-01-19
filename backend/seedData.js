const mongoose = require('mongoose');
const Employee = require('./Models/EmployeeModel'); // Adjust path as needed

// MongoDB connection
mongoose.connect('mongodb+srv://shubhambendre04:tGeCJTpuCNIjJVq3@cluster0.mvsff.mongodb.net/emp_db?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Helper function to generate random number within range
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

// Helper function to generate dates from Jan 1 to Jan 17, 2025
const generateProductionDates = (scale) => {
  const productions = [];
  const startDate = new Date('2025-01-01');
  const endDate = new Date('2025-01-17');
  
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    productions.push({
      date: new Date(date),
      // For milk (liters): 5-25L per day
      // For eggs (amount): 0-2 eggs per day
      amount: scale === 'liter' ? randomNumber(5, 25) : randomNumber(0, 2)
    });
  }
  return productions;
};

// Data arrays
const cattleBreeds = [
  'Gir',
  'Sahiwal',
  'Red Sindhi',
  'Tharparkar',
  'Rathi',
  'Kankrej',
  'Ongole',
  'Hariana'
];

const chickenBreeds = [
  'Aseel',
  'Kadaknath',
  'Chittagong',
  'Ghagus',
  'Punjab Brown',
  'Tellicherry'
];

const cattleNames = [
  'Lakshmi', 'Ganga', 'Nandi', 'Krishna', 'Radha', 
  'Gauri', 'Shyama', 'Kamdhenu', 'Surabi', 'Dhara',
  'Hira', 'Rupa', 'Sona', 'Rani', 'Raja',
  'Kali', 'Durga', 'Parvati', 'Saraswati', 'Bhumi'
];

const chickenNames = [
  'Rani', 'Raja', 'Moti', 'Chandan', 'Kesar',
  'Mirchi', 'Kaali', 'Safed', 'Laal', 'Chutki',
  'Tara', 'Chitra', 'Bindiya', 'Chameli', 'Phool'
];

const cattleDefects = [
  'Healthy',
  'Mild Fever',
  'Slight Limping',
  'Minor Wounds',
  'Respiratory Issues',
  'Digestive Problems',
  'Joint Pain',
  'Healthy',
  'Healthy',
  'Healthy'
];

const chickenDefects = [
  'Healthy',
  'Minor Injuries',
  'Respiratory Issues',
  'Healthy',
  'Healthy',
  'Healthy'
];

// Generate cattle and chicken data
const generateAnimals = async () => {
  const animals = [];

  // Generate cattle (40 animals)
  for (let i = 0; i < 7; i++) {
    animals.push({
      name: cattleNames[randomNumber(0, cattleNames.length - 1)],
      Breed: cattleBreeds[randomNumber(0, cattleBreeds.length - 1)],
      Defect: cattleDefects[randomNumber(0, cattleDefects.length - 1)],
      Weight: String(randomNumber(300, 800)), // Cattle weight in kg
      Age: randomNumber(2, 10), // Age in years
      scale: "liter",
      production: generateProductionDates("liter"),
      createdAt: new Date(),
      updatedAt: new Date(),
      profileImage: `https://example.com/cattle-${randomNumber(1, 10)}.jpg` // Placeholder image URL
    });
  }

  // Generate chickens (20 animals)
  for (let i = 0; i < 5; i++) {
    animals.push({
      name: chickenNames[randomNumber(0, chickenNames.length - 1)],
      Breed: chickenBreeds[randomNumber(0, chickenBreeds.length - 1)],
      Defect: chickenDefects[randomNumber(0, chickenDefects.length - 1)],
      Weight: String(randomNumber(1, 4)), // Chicken weight in kg
      Age: randomNumber(1, 3), // Age in years
      scale: "amount",
      production: generateProductionDates("amount"),
      createdAt: new Date(),
      updatedAt: new Date(),
      profileImage: `https://example.com/chicken-${randomNumber(1, 5)}.jpg` // Placeholder image URL
    });
  }

  try {
    // Clear existing data
    await Employee.deleteMany({});
    
    // Insert new data
    const result = await Employee.insertMany(animals);
    console.log(`Successfully inserted ${result.length} animals`);
    
    // Display a sample record
    console.log('\nSample record:');
    console.log(JSON.stringify(result[0], null, 2));
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding data:', error);
    mongoose.connection.close();
  }
};

// Run the seeding
generateAnimals();