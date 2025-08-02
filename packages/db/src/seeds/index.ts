import { db } from '../index';
import { users, organizations, companies, contacts, jobs, tasks } from '../schema';
import { hashPassword } from '../utils/auth';

export async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data (in development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('🧹 Clearing existing data...');
      await db.delete(tasks);
      await db.delete(jobs);
      await db.delete(contacts);
      await db.delete(companies);
      await db.delete(users);
      await db.delete(organizations);
    }

    // Create demo organization (for admin user)
    console.log('🏢 Creating demo organization...');
    const [demoOrg] = await db.insert(organizations).values({
      name: 'Demo Construction Company',
      slug: 'demo-construction',
      plan: 'pro',
      status: 'active',
    }).returning();

    // Create admin user (required for authentication)
    console.log('👤 Creating admin user...');
    const [adminUser] = await db.insert(users).values({
      organizationId: demoOrg.id,
      email: 'admin@pulsecrm.local',
      passwordHash: await hashPassword('admin123'),
      firstName: 'Admin',
      lastName: 'User',
      role: 'owner',
      emailVerifiedAt: new Date(),
    }).returning();

    // Create second admin user with email login
    console.log('👤 Creating second admin user...');
    const [secondAdminUser] = await db.insert(users).values({
      organizationId: demoOrg.id,
      email: 'admin2@pulsecrm.local',
      passwordHash: await hashPassword('admin456'),
      firstName: 'Sarah',
      lastName: 'Administrator',
      role: 'admin',
      emailVerifiedAt: new Date(),
    }).returning();

    // Create sample companies
    console.log('🏢 Creating sample companies...');
    const [company1] = await db.insert(companies).values({
      organizationId: demoOrg.id,
      name: 'Downtown Development LLC',
      industry: 'Real Estate Development',
      website: 'https://downtowndev.com',
      address: '1234 Main Street, Suite 500',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30309',
      phone: '(404) 555-0123',
      email: 'info@downtowndev.com',
    }).returning();

    const [company2] = await db.insert(companies).values({
      organizationId: demoOrg.id,
      name: 'Suburban Homes Inc.',
      industry: 'Residential Construction',
      address: '567 Oak Avenue',
      city: 'Marietta',
      state: 'GA',
      zipCode: '30064',
      phone: '(770) 555-0456',
      email: 'contact@suburbanhomes.com',
    }).returning();

    const [company3] = await db.insert(companies).values({
      organizationId: demoOrg.id,
      name: 'Green Build Solutions',
      industry: 'Sustainable Construction',
      website: 'https://greenbuildsolutions.com',
      address: '890 Eco Lane',
      city: 'Decatur',
      state: 'GA',
      zipCode: '30030',
      phone: '(678) 555-0789',
      email: 'hello@greenbuildsolutions.com',
    }).returning();

    // Create sample contacts
    console.log('👥 Creating sample contacts...');
    const [contact1] = await db.insert(contacts).values({
      organizationId: demoOrg.id,
      companyId: company1.id,
      firstName: 'Sarah',
      lastName: 'Johnson',
      title: 'Project Manager',
      email: 'sarah.johnson@downtowndev.com',
      phone: '(404) 555-0124',
      mobile: '(404) 555-9876',
      isPrimary: true,
    }).returning();

    const [contact2] = await db.insert(contacts).values({
      organizationId: demoOrg.id,
      companyId: company2.id,
      firstName: 'Robert',
      lastName: 'Smith',
      title: 'Operations Director',
      email: 'robert.smith@suburbanhomes.com',
      phone: '(770) 555-0457',
      isPrimary: true,
    }).returning();

    console.log('✅ Demo organization, users, companies, and contacts created successfully');
    console.log('🎉 Database seeding completed!');

    return {
      organizations: { demoOrg },
      users: { adminUser, secondAdminUser },
      companies: { company1, company2, company3 },
      contacts: { contact1, contact2 },
      jobs: {},
    };

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Utility function to reset database
export async function resetDatabase() {
  console.log('🗑️ Resetting database...');
  
  try {
    await db.delete(tasks);
    await db.delete(jobs);
    await db.delete(contacts);
    await db.delete(companies);
    await db.delete(users);
    await db.delete(organizations);
    
    console.log('✅ Database reset completed');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  }
}