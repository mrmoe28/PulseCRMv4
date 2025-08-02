const { db, users, companies, contacts, jobs, tasks } = require('../dist/index.js');

async function seedData() {
  console.log('🌱 Starting to seed database...');

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await db.delete(tasks);
    await db.delete(jobs);
    await db.delete(contacts);
    await db.delete(companies);
    await db.delete(users);

    // Create users
    console.log('👤 Creating users...');
    const [adminUser] = await db.insert(users).values({
      email: 'admin@pulsecrm.local',
      passwordHash: 'hashed_password_admin123', // In real app, this would be properly hashed
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    }).returning();

    const [managerUser] = await db.insert(users).values({
      email: 'manager@pulsecrm.local',
      passwordHash: 'hashed_password_manager123',
      firstName: 'Project',
      lastName: 'Manager',
      role: 'manager',
    }).returning();

    // Create companies
    console.log('🏢 Creating companies...');
    const [company1] = await db.insert(companies).values({
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
      name: 'Suburban Homes Inc.',
      industry: 'Residential Construction',
      address: '567 Oak Avenue',
      city: 'Marietta',
      state: 'GA',
      zipCode: '30064',
      phone: '(770) 555-0456',
      email: 'contact@suburbanhomes.com',
    }).returning();

    // Create contacts
    console.log('👥 Creating contacts...');
    const [contact1] = await db.insert(contacts).values({
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
      companyId: company2.id,
      firstName: 'Robert',
      lastName: 'Smith',
      title: 'Operations Director',
      email: 'robert.smith@suburbanhomes.com',
      phone: '(770) 555-0457',
      isPrimary: true,
    }).returning();

    // Create jobs
    console.log('💼 Creating jobs...');
    const [job1] = await db.insert(jobs).values({
      jobNumber: 'JOB-2024-001',
      title: 'Kitchen Renovation - Downtown Condo',
      description: 'Complete kitchen renovation including cabinets, countertops, appliances, and flooring.',
      companyId: company1.id,
      primaryContactId: contact1.id,
      assignedUserId: managerUser.id,
      status: 'in_progress',
      priority: 'high',
      estimatedStartDate: new Date('2024-01-15'),
      estimatedEndDate: new Date('2024-02-28'),
      estimatedBudget: '45000.00',
      location: '1234 Main St, Unit 505, Atlanta, GA 30309',
      requirements: 'High-end finishes, granite countertops, stainless steel appliances',
    }).returning();

    const [job2] = await db.insert(jobs).values({
      jobNumber: 'JOB-2024-002',
      title: 'Bathroom Remodel - Suburban Home',
      description: 'Master bathroom renovation with walk-in shower and double vanity.',
      companyId: company2.id,
      primaryContactId: contact2.id,
      assignedUserId: managerUser.id,
      status: 'scheduled',
      priority: 'medium',
      estimatedStartDate: new Date('2024-02-01'),
      estimatedEndDate: new Date('2024-02-15'),
      estimatedBudget: '22000.00',
      location: '567 Oak Ave, Marietta, GA 30064',
    }).returning();

    // Create tasks
    console.log('✅ Creating tasks...');
    await db.insert(tasks).values([
      {
        jobId: job1.id,
        title: 'Demolition',
        description: 'Remove existing cabinets, countertops, and appliances',
        assignedUserId: managerUser.id,
        status: 'completed',
        priority: 'high',
        estimatedHours: '16.00',
        actualHours: '14.50',
        orderIndex: 1,
        completedAt: new Date('2024-01-16T17:00:00Z'),
      },
      {
        jobId: job1.id,
        title: 'Cabinet Installation',
        description: 'Install new kitchen cabinets and hardware',
        assignedUserId: managerUser.id,
        status: 'in_progress',
        priority: 'medium',
        estimatedHours: '20.00',
        orderIndex: 2,
        dueDate: new Date('2024-01-25'),
      },
      {
        jobId: job2.id,
        title: 'Design Planning',
        description: 'Finalize design and material selections',
        assignedUserId: managerUser.id,
        status: 'completed',
        priority: 'high',
        estimatedHours: '4.00',
        actualHours: '3.50',
        orderIndex: 1,
        completedAt: new Date('2024-01-20T14:00:00Z'),
      },
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('📊 Summary:');
    console.log('  - 2 users created');
    console.log('  - 2 companies created');
    console.log('  - 2 contacts created');
    console.log('  - 2 jobs created');
    console.log('  - 3 tasks created');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seed function
seedData()
  .then(() => {
    console.log('🎉 Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });
