const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const User = require('../models/User.model');

async function seedNgos() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required in environment variables');
  }
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(mongoUri);

  // 1. Update Satkarm Foundation (User's NGO account near CHARUSAT Campus, Changa, Anand)
  const satkarm = await User.findOne({ email: '23it040@charusat.edu.in' });
  if (satkarm) {
    satkarm.name = 'Satkarm Foundation';
    satkarm.organizationName = 'Satkarm Foundation';
    satkarm.address = 'CHARUSAT Campus Road';
    satkarm.city = 'Changa, Anand';
    satkarm.state = 'Gujarat';
    satkarm.pincode = '388421';
    satkarm.phone = '+91 95744 31370';
    satkarm.latitude = 22.600544;
    satkarm.longitude = 72.819784;
    satkarm.location = {
      type: 'Point',
      coordinates: [72.819784, 22.600544]
    };
    satkarm.capacity = 350;
    satkarm.foodTypesAccepted = ['cooked', 'packaged', 'raw', 'beverages'];
    satkarm.isVerified = true;
    satkarm.verificationStatus = 'APPROVED';
    satkarm.status = 'ACTIVE';
    await satkarm.save();
    console.log('✓ Updated Satkarm Foundation (CHARUSAT / Changa)');
  }

  // 2. Comprehensive regional network of verified NGOs
  const ngosList = [
    {
      name: 'Annapurna Food Relief Trust',
      organizationName: 'Annapurna Food Relief Trust',
      email: 'ngo@foodbridge.org',
      role: 'ngo',
      address: 'Station Road',
      city: 'Anand',
      state: 'Gujarat',
      pincode: '388001',
      phone: '+91 98250 12345',
      latitude: 22.5645,
      longitude: 72.9289,
      location: { type: 'Point', coordinates: [72.9289, 22.5645] },
      capacity: 250,
      foodTypesAccepted: ['cooked', 'packaged'],
      isVerified: true,
      verificationStatus: 'APPROVED',
      status: 'ACTIVE'
    },
    {
      name: 'Vallabh Vidyanagar Aahar Kendra',
      organizationName: 'Vallabh Vidyanagar Aahar Kendra',
      email: 'vvnagar.aahar@foodbridge.org',
      role: 'ngo',
      address: 'Near Mota Bazaar, VV Nagar',
      city: 'Anand',
      state: 'Gujarat',
      pincode: '388120',
      phone: '+91 98251 22334',
      latitude: 22.5532,
      longitude: 72.9250,
      location: { type: 'Point', coordinates: [72.9250, 22.5532] },
      capacity: 300,
      foodTypesAccepted: ['cooked', 'packaged'],
      isVerified: true,
      verificationStatus: 'APPROVED',
      status: 'ACTIVE'
    },
    {
      name: 'Vadtal Swaminarayan Anna Seva',
      organizationName: 'Vadtal Swaminarayan Anna Seva',
      email: 'vadtal.anna@foodbridge.org',
      role: 'ngo',
      address: 'Mandir Road, Vadtal',
      city: 'Kheda',
      state: 'Gujarat',
      pincode: '387375',
      phone: '+91 98252 33445',
      latitude: 22.5898,
      longitude: 72.8805,
      location: { type: 'Point', coordinates: [72.8805, 22.5898] },
      capacity: 500,
      foodTypesAccepted: ['cooked', 'packaged', 'fruits'],
      isVerified: true,
      verificationStatus: 'APPROVED',
      status: 'ACTIVE'
    },
    {
      name: 'Nadiad Seva Samiti',
      organizationName: 'Nadiad Seva Samiti',
      email: 'nadiad.seva@foodbridge.org',
      role: 'ngo',
      address: 'College Road',
      city: 'Nadiad',
      state: 'Gujarat',
      pincode: '387001',
      phone: '+91 98240 54321',
      latitude: 22.6916,
      longitude: 72.8634,
      location: { type: 'Point', coordinates: [72.8634, 22.6916] },
      capacity: 350,
      foodTypesAccepted: ['cooked', 'packaged', 'fruits'],
      isVerified: true,
      verificationStatus: 'APPROVED',
      status: 'ACTIVE'
    },
    {
      name: 'Santram Food Relief Mission',
      organizationName: 'Santram Food Relief Mission',
      email: 'santram.relief@foodbridge.org',
      role: 'ngo',
      address: 'Santram Mandir Road',
      city: 'Nadiad',
      state: 'Gujarat',
      pincode: '387001',
      phone: '+91 98242 65432',
      latitude: 22.6840,
      longitude: 72.8550,
      location: { type: 'Point', coordinates: [72.8550, 22.6840] },
      capacity: 450,
      foodTypesAccepted: ['cooked', 'packaged'],
      isVerified: true,
      verificationStatus: 'APPROVED',
      status: 'ACTIVE'
    },
    {
      name: 'Chaklasi Community Care Foundation',
      organizationName: 'Chaklasi Community Care Foundation',
      email: 'chaklasi.care@foodbridge.org',
      role: 'ngo',
      address: 'Main Bazaar, Chaklasi',
      city: 'Kheda',
      state: 'Gujarat',
      pincode: '387130',
      phone: '+91 98243 76543',
      latitude: 22.6500,
      longitude: 72.9300,
      location: { type: 'Point', coordinates: [72.9300, 22.6500] },
      capacity: 200,
      foodTypesAccepted: ['cooked', 'packaged'],
      isVerified: true,
      verificationStatus: 'APPROVED',
      status: 'ACTIVE'
    },
    {
      name: 'Petlad Seva Foundation',
      organizationName: 'Petlad Seva Foundation',
      email: 'petlad.seva@foodbridge.org',
      role: 'ngo',
      address: 'Station Road, Petlad',
      city: 'Anand',
      state: 'Gujarat',
      pincode: '388450',
      phone: '+91 98244 87654',
      latitude: 22.4740,
      longitude: 72.8020,
      location: { type: 'Point', coordinates: [72.8020, 22.4740] },
      capacity: 250,
      foodTypesAccepted: ['cooked', 'packaged', 'raw'],
      isVerified: true,
      verificationStatus: 'APPROVED',
      status: 'ACTIVE'
    },
    {
      name: 'Sojitra Rural Food Bank',
      organizationName: 'Sojitra Rural Food Bank',
      email: 'sojitra.food@foodbridge.org',
      role: 'ngo',
      address: 'Taluka Panchayat Road',
      city: 'Sojitra, Anand',
      state: 'Gujarat',
      pincode: '387240',
      phone: '+91 98245 98765',
      latitude: 22.5370,
      longitude: 72.7110,
      location: { type: 'Point', coordinates: [72.7110, 22.5370] },
      capacity: 200,
      foodTypesAccepted: ['cooked', 'packaged'],
      isVerified: true,
      verificationStatus: 'APPROVED',
      status: 'ACTIVE'
    },
    {
      name: 'Tarapur Jan Kalyan Trust',
      organizationName: 'Tarapur Jan Kalyan Trust',
      email: 'tarapur.kalyan@foodbridge.org',
      role: 'ngo',
      address: 'Highway Cross Road, Tarapur',
      city: 'Anand',
      state: 'Gujarat',
      pincode: '388180',
      phone: '+91 98246 09876',
      latitude: 22.4930,
      longitude: 72.6550,
      location: { type: 'Point', coordinates: [72.6550, 22.4930] },
      capacity: 220,
      foodTypesAccepted: ['cooked', 'packaged'],
      isVerified: true,
      verificationStatus: 'APPROVED',
      status: 'ACTIVE'
    },
    {
      name: 'Matar Relief Center',
      organizationName: 'Matar Relief Center',
      email: 'matar.relief@foodbridge.org',
      role: 'ngo',
      address: 'Court Road, Matar',
      city: 'Kheda',
      state: 'Gujarat',
      pincode: '387530',
      phone: '+91 98247 10987',
      latitude: 22.7120,
      longitude: 72.6560,
      location: { type: 'Point', coordinates: [72.6560, 22.7120] },
      capacity: 180,
      foodTypesAccepted: ['cooked', 'packaged'],
      isVerified: true,
      verificationStatus: 'APPROVED',
      status: 'ACTIVE'
    },
    {
      name: 'Kheda District Welfare Mission',
      organizationName: 'Kheda District Welfare Mission',
      email: 'kheda.welfare@foodbridge.org',
      role: 'ngo',
      address: 'Old Town Hall, Kheda',
      city: 'Kheda',
      state: 'Gujarat',
      pincode: '387411',
      phone: '+91 98248 21098',
      latitude: 22.7530,
      longitude: 72.6840,
      location: { type: 'Point', coordinates: [72.6840, 22.7530] },
      capacity: 320,
      foodTypesAccepted: ['cooked', 'packaged', 'raw'],
      isVerified: true,
      verificationStatus: 'APPROVED',
      status: 'ACTIVE'
    },
    {
      name: 'Mahemdavad Jan Seva Trust',
      organizationName: 'Mahemdavad Jan Seva Trust',
      email: 'mahemdavad.seva@foodbridge.org',
      role: 'ngo',
      address: 'Near Vatrak River Bridge',
      city: 'Mahemdavad',
      state: 'Gujarat',
      pincode: '387130',
      phone: '+91 98249 32109',
      latitude: 22.8280,
      longitude: 72.7660,
      location: { type: 'Point', coordinates: [72.7660, 22.8280] },
      capacity: 280,
      foodTypesAccepted: ['cooked', 'packaged'],
      isVerified: true,
      verificationStatus: 'APPROVED',
      status: 'ACTIVE'
    },
    {
      name: 'Mahudha Social Care Foundation',
      organizationName: 'Mahudha Social Care Foundation',
      email: 'mahudha.care@foodbridge.org',
      role: 'ngo',
      address: 'Tower Bazaar, Mahudha',
      city: 'Kheda',
      state: 'Gujarat',
      pincode: '387335',
      phone: '+91 98250 43210',
      latitude: 22.8200,
      longitude: 72.9300,
      location: { type: 'Point', coordinates: [72.9300, 22.8200] },
      capacity: 210,
      foodTypesAccepted: ['cooked', 'packaged'],
      isVerified: true,
      verificationStatus: 'APPROVED',
      status: 'ACTIVE'
    },
    {
      name: 'Bhalej Care Foundation',
      organizationName: 'Bhalej Care Foundation',
      email: 'bhalej.care@foodbridge.org',
      role: 'ngo',
      address: 'Station Road, Bhalej',
      city: 'Anand',
      state: 'Gujarat',
      pincode: '388205',
      phone: '+91 98251 54321',
      latitude: 22.6100,
      longitude: 72.9900,
      location: { type: 'Point', coordinates: [72.9900, 22.6100] },
      capacity: 240,
      foodTypesAccepted: ['cooked', 'packaged'],
      isVerified: true,
      verificationStatus: 'APPROVED',
      status: 'ACTIVE'
    },
    {
      name: 'Umreth Aahar Seva Trust',
      organizationName: 'Umreth Aahar Seva Trust',
      email: 'umreth.aahar@foodbridge.org',
      role: 'ngo',
      address: 'Jalaram Mandir Marg, Umreth',
      city: 'Anand',
      state: 'Gujarat',
      pincode: '388220',
      phone: '+91 98252 65432',
      latitude: 22.7000,
      longitude: 73.1200,
      location: { type: 'Point', coordinates: [73.1200, 22.7000] },
      capacity: 300,
      foodTypesAccepted: ['cooked', 'packaged', 'fruits'],
      isVerified: true,
      verificationStatus: 'APPROVED',
      status: 'ACTIVE'
    },
    {
      name: 'Dakor Annakshetra Seva Trust',
      organizationName: 'Dakor Annakshetra Seva Trust',
      email: 'dakor.annakshetra@foodbridge.org',
      role: 'ngo',
      address: 'Ranchhodrai Mandir Road, Dakor',
      city: 'Kheda',
      state: 'Gujarat',
      pincode: '388225',
      phone: '+91 98253 76543',
      latitude: 22.7550,
      longitude: 73.1490,
      location: { type: 'Point', coordinates: [73.1490, 22.7550] },
      capacity: 600,
      foodTypesAccepted: ['cooked', 'packaged', 'beverages'],
      isVerified: true,
      verificationStatus: 'APPROVED',
      status: 'ACTIVE'
    },
    {
      name: 'Dholka Food Support Trust',
      organizationName: 'Dholka Food Support Trust',
      email: 'dholka.food@foodbridge.org',
      role: 'ngo',
      address: 'Malav Talav Road, Dholka',
      city: 'Ahmedabad Rural',
      state: 'Gujarat',
      pincode: '382225',
      phone: '+91 98254 87654',
      latitude: 22.7200,
      longitude: 72.4600,
      location: { type: 'Point', coordinates: [72.4600, 22.7200] },
      capacity: 260,
      foodTypesAccepted: ['cooked', 'packaged'],
      isVerified: true,
      verificationStatus: 'APPROVED',
      status: 'ACTIVE'
    },
    {
      name: 'Bareja Relief Kitchen',
      organizationName: 'Bareja Relief Kitchen',
      email: 'bareja.relief@foodbridge.org',
      role: 'ngo',
      address: 'Bareja Highway Circle',
      city: 'Ahmedabad Rural',
      state: 'Gujarat',
      pincode: '382425',
      phone: '+91 98255 98765',
      latitude: 22.8700,
      longitude: 72.5800,
      location: { type: 'Point', coordinates: [72.5800, 22.8700] },
      capacity: 250,
      foodTypesAccepted: ['cooked', 'packaged'],
      isVerified: true,
      verificationStatus: 'APPROVED',
      status: 'ACTIVE'
    },
    {
      name: 'Vadodara Food Bank Trust',
      organizationName: 'Vadodara Food Bank Trust',
      email: 'vadodara.foodbank@foodbridge.org',
      role: 'ngo',
      address: 'Alkapuri Main Road',
      city: 'Vadodara',
      state: 'Gujarat',
      pincode: '390007',
      phone: '+91 98791 23456',
      latitude: 22.3072,
      longitude: 73.1812,
      location: { type: 'Point', coordinates: [73.1812, 22.3072] },
      capacity: 450,
      foodTypesAccepted: ['cooked', 'packaged', 'beverages'],
      isVerified: true,
      verificationStatus: 'APPROVED',
      status: 'ACTIVE'
    },
    {
      name: 'Sayaji Social Welfare Foundation',
      organizationName: 'Sayaji Social Welfare Foundation',
      email: 'sayaji.welfare@foodbridge.org',
      role: 'ngo',
      address: 'Sayajigunj Circle',
      city: 'Vadodara',
      state: 'Gujarat',
      pincode: '390005',
      phone: '+91 98792 34567',
      latitude: 22.2850,
      longitude: 73.1950,
      location: { type: 'Point', coordinates: [73.1950, 22.2850] },
      capacity: 350,
      foodTypesAccepted: ['cooked', 'packaged'],
      isVerified: true,
      verificationStatus: 'APPROVED',
      status: 'ACTIVE'
    },
    {
      name: 'Ahmedabad Aahar Seva Foundation',
      organizationName: 'Ahmedabad Aahar Seva Foundation',
      email: 'ahmedabad.aahar@foodbridge.org',
      role: 'ngo',
      address: 'Navrangpura',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380009',
      phone: '+91 98980 65432',
      latitude: 23.0338,
      longitude: 72.5850,
      location: { type: 'Point', coordinates: [72.5850, 23.0338] },
      capacity: 600,
      foodTypesAccepted: ['cooked', 'packaged', 'raw', 'fruits'],
      isVerified: true,
      verificationStatus: 'APPROVED',
      status: 'ACTIVE'
    },
    {
      name: 'Maninagar Food Aid Trust',
      organizationName: 'Maninagar Food Aid Trust',
      email: 'maninagar.aid@foodbridge.org',
      role: 'ngo',
      address: 'Near Kankaria Gate, Maninagar',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380008',
      phone: '+91 98981 76543',
      latitude: 23.0020,
      longitude: 72.6010,
      location: { type: 'Point', coordinates: [72.6010, 23.0020] },
      capacity: 400,
      foodTypesAccepted: ['cooked', 'packaged'],
      isVerified: true,
      verificationStatus: 'APPROVED',
      status: 'ACTIVE'
    },
    {
      name: 'Helping Hands Foundation Surat',
      organizationName: 'Helping Hands Foundation Surat',
      email: 'surat.helpinghands@foodbridge.org',
      role: 'ngo',
      address: 'Adajan Main Road',
      city: 'Surat',
      state: 'Gujarat',
      pincode: '395009',
      phone: '+91 98241 87654',
      latitude: 21.1972,
      longitude: 72.7933,
      location: { type: 'Point', coordinates: [72.7933, 21.1972] },
      capacity: 500,
      foodTypesAccepted: ['cooked', 'packaged', 'raw'],
      isVerified: true,
      verificationStatus: 'APPROVED',
      status: 'ACTIVE'
    },
    {
      name: 'Community Care Foundation Varachha',
      organizationName: 'Community Care Foundation Varachha',
      email: 'varachha.care@foodbridge.org',
      role: 'ngo',
      address: 'Mini Bazaar, Varachha',
      city: 'Surat',
      state: 'Gujarat',
      pincode: '395006',
      phone: '+91 98242 98765',
      latitude: 21.2144,
      longitude: 72.8464,
      location: { type: 'Point', coordinates: [72.8464, 21.2144] },
      capacity: 350,
      foodTypesAccepted: ['cooked', 'packaged'],
      isVerified: true,
      verificationStatus: 'APPROVED',
      status: 'ACTIVE'
    }
  ];

  for (const ngoData of ngosList) {
    const existing = await User.findOne({ email: ngoData.email });
    if (!existing) {
      await User.create({
        ...ngoData,
        password: 'FoodBridge@2026!'
      });
      console.log(`✓ Created NGO: ${ngoData.organizationName} (${ngoData.city})`);
    } else {
      Object.assign(existing, ngoData);
      await existing.save();
      console.log(`✓ Updated NGO: ${ngoData.organizationName} (${ngoData.city})`);
    }
  }

  const totalNgos = await User.countDocuments({ role: 'ngo', isVerified: true });
  console.log(`Total verified NGOs in database: ${totalNgos}`);
  console.log('Seed completed successfully!');
  await mongoose.disconnect();
  process.exit(0);
}

seedNgos().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
