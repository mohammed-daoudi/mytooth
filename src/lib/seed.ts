import connectDB from './mongodb';
import User from '@/models/User';
import Dentist from '@/models/Dentist';
import Service from '@/models/Service';
import { hashPassword } from './auth';

const defaultServices = [
  {
    name: 'Regular Dental Cleaning',
    description: 'Professional teeth cleaning and polishing to remove plaque and tartar buildup.',
    category: 'general',
    duration: 60,
    price: 120,
    painLevel: 1,
    requirements: ['No eating 2 hours before appointment'],
    afterCareInstructions: 'Avoid eating for 30 minutes. Brush gently for 24 hours.',
  },
  {
    name: 'Dental Checkup & Exam',
    description: 'Comprehensive oral examination including X-rays and dental health assessment.',
    category: 'general',
    duration: 45,
    price: 95,
    painLevel: 1,
    requirements: [],
    afterCareInstructions: 'Follow any specific recommendations provided by your dentist.',
  },
  {
    name: 'Teeth Whitening',
    description: 'Professional teeth whitening treatment for a brighter, more confident smile.',
    category: 'cosmetic',
    duration: 90,
    price: 450,
    painLevel: 2,
    requirements: ['Healthy gums and teeth', 'No recent dental work'],
    afterCareInstructions: 'Avoid staining foods and drinks for 48 hours. Use provided sensitivity gel if needed.',
  },
  {
    name: 'Dental Implants',
    description: 'Permanent tooth replacement solution using titanium implants and ceramic crowns.',
    category: 'surgery',
    duration: 120,
    price: 2500,
    painLevel: 4,
    requirements: ['Good oral health', 'Sufficient bone density', 'Non-smoker preferred'],
    afterCareInstructions: 'Soft foods only for 1 week. Take prescribed medications. Follow-up appointments required.',
  },
  {
    name: 'Porcelain Veneers',
    description: 'Custom-made thin shells to improve the appearance of teeth color, shape, and size.',
    category: 'cosmetic',
    duration: 150,
    price: 1200,
    painLevel: 2,
    requirements: ['Healthy teeth and gums', 'Realistic expectations'],
    afterCareInstructions: 'Avoid hard foods for 24 hours. Regular oral hygiene is essential.',
  },
  {
    name: 'Root Canal Treatment',
    description: 'Treatment to remove infected tooth pulp and save the natural tooth.',
    category: 'general',
    duration: 90,
    price: 650,
    painLevel: 3,
    requirements: ['Local anesthesia tolerance'],
    afterCareInstructions: 'Take prescribed antibiotics. Avoid chewing on treated tooth until permanent restoration.',
  },
  {
    name: 'Orthodontic Consultation',
    description: 'Comprehensive evaluation for braces or clear aligners to straighten teeth.',
    category: 'orthodontics',
    duration: 60,
    price: 150,
    painLevel: 1,
    requirements: ['Recent X-rays helpful'],
    afterCareInstructions: 'Consider treatment options discussed. Schedule follow-up if proceeding.',
  },
  {
    name: 'Emergency Dental Care',
    description: '24/7 emergency treatment for severe tooth pain, trauma, or dental emergencies.',
    category: 'emergency',
    duration: 30,
    price: 200,
    painLevel: 3,
    requirements: ['Call ahead if possible'],
    afterCareInstructions: 'Follow specific emergency treatment instructions. Schedule follow-up care.',
  },
  {
    name: 'Pediatric Dental Cleaning',
    description: 'Gentle dental cleaning and oral health education specifically designed for children.',
    category: 'pediatric',
    duration: 45,
    price: 85,
    painLevel: 1,
    requirements: ['Parent/guardian present'],
    afterCareInstructions: 'Practice good oral hygiene habits. Schedule regular check-ups every 6 months.',
  },
  {
    name: 'Dental Crown',
    description: 'Custom-made cap to restore damaged teeth and protect from further decay.',
    category: 'general',
    duration: 90,
    price: 950,
    painLevel: 2,
    requirements: ['Sufficient tooth structure remaining'],
    afterCareInstructions: 'Avoid hard foods for 24 hours. Crown may feel different initially - this is normal.',
  },
];

const defaultUsers = [
  {
    name: 'Dr. Sarah Johnson',
    email: 'admin@mytooth.com',
    password: 'admin123456',
    role: 'ADMIN',
    phone: '+1-555-123-0001',
  },
  {
    name: 'Dr. Michael Chen',
    email: 'dentist@mytooth.com',
    password: 'dentist123456',
    role: 'DENTIST',
    phone: '+1-555-123-0002',
  },
  {
    name: 'John Patient',
    email: 'patient@example.com',
    password: 'patient123456',
    role: 'USER',
    phone: '+1-555-123-0003',
    dateOfBirth: new Date('1990-01-15'),
    address: '123 Main Street, Health City, HC 12345',
  },
];

const defaultDentists = [
  {
    email: 'dentist@mytooth.com',
    specialization: 'General Dentistry',
    bio: 'Dr. Michael Chen has over 10 years of experience in general and cosmetic dentistry.',
    licenseNumber: 'DL-001-2024',
    yearsOfExperience: 10,
    education: ['DDS from University of Dental Medicine', 'Residency at City General Hospital'],
    certifications: ['American Dental Association', 'Cosmetic Dentistry Certification'],
    consultationFee: 120,
    availabilityConfig: {
      monday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
      tuesday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
      wednesday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
      thursday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
      friday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
      saturday: { isAvailable: false, startTime: '09:00', endTime: '17:00' },
      sunday: { isAvailable: false, startTime: '09:00', endTime: '17:00' }
    }
  }
];

export async function seedDatabase(reset = false) {
  try {
    await connectDB();
    console.log('Connected to database...');

    // Clear existing data if reset is true
    if (reset) {
      console.log('Resetting users and dentists...');
      await User.deleteMany({});
      await Dentist.deleteMany({});
      console.log('Cleared existing users and dentists');
    }

    // Seed services
    console.log('Seeding services...');
    for (const serviceData of defaultServices) {
      const existingService = await Service.findOne({ name: serviceData.name });
      if (!existingService) {
        const service = new Service(serviceData);
        await service.save();
        console.log(`Created service: ${serviceData.name}`);
      } else {
        console.log(`Service already exists: ${serviceData.name}`);
      }
    }

    // Seed users
    console.log('Seeding users...');
    for (const userData of defaultUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const hashedPassword = await hashPassword(userData.password);
        const user = new User({
          ...userData,
          password: hashedPassword,
        });
        await user.save();
        console.log(`Created user: ${userData.email} (${userData.role})`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }

    // Seed dentist profiles
    console.log('Seeding dentist profiles...');
    for (const dentistData of defaultDentists) {
      const user = await User.findOne({ email: dentistData.email });
      if (user) {
        const existingDentist = await Dentist.findOne({ userId: user._id });
        if (!existingDentist) {
          const dentist = new Dentist({
            userId: user._id,
            specialization: dentistData.specialization,
            bio: dentistData.bio,
            licenseNumber: dentistData.licenseNumber,
            yearsOfExperience: dentistData.yearsOfExperience,
            education: dentistData.education,
            certifications: dentistData.certifications,
            consultationFee: dentistData.consultationFee,
            availabilityConfig: dentistData.availabilityConfig,
            rating: 4.8,
            totalReviews: 25,
            isActive: true
          });
          await dentist.save();
          console.log(`Created dentist profile for: ${dentistData.email}`);
        } else {
          console.log(`Dentist profile already exists for: ${dentistData.email}`);
        }
      } else {
        console.log(`User not found for dentist: ${dentistData.email}`);
      }
    }

    console.log('Database seeding completed successfully!');
    return { success: true, message: 'Database seeded successfully' };

  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
