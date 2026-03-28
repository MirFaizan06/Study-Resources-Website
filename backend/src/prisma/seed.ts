import { PrismaClient, ResourceType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Seeding database...');

  // Clean existing data (ordered by FK dependencies)
  await prisma.resource.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.program.deleteMany();
  await prisma.institution.deleteMany();
  await prisma.request.deleteMany();
  await prisma.user.deleteMany();

  // ─── Admin User ───────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin@123', 12);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@noteswebsite.com',
      name: 'Site Administrator',
      role: 'ADMIN',
      passwordHash,
    },
  });
  console.log(`Created admin user: ${adminUser.email}`);

  // ─── Institutions ─────────────────────────────────────────────
  const kuInstitution = await prisma.institution.create({
    data: {
      name: 'Kashmir University',
      slug: 'kashmir-university',
      type: 'UNIVERSITY',
      logoUrl: null,
    },
  });

  const cusInstitution = await prisma.institution.create({
    data: {
      name: 'Cluster University Srinagar',
      slug: 'cluster-university-srinagar',
      type: 'UNIVERSITY',
      logoUrl: null,
    },
  });

  const gdcInstitution = await prisma.institution.create({
    data: {
      name: 'Government Degree College Sopore',
      slug: 'gdc-sopore',
      type: 'COLLEGE',
      logoUrl: null,
    },
  });

  console.log('Created 3 institutions.');

  // ─── Programs for Kashmir University ──────────────────────────
  const bcaProgram = await prisma.program.create({
    data: { name: 'BCA', institutionId: kuInstitution.id },
  });

  const btechProgram = await prisma.program.create({
    data: { name: 'B.Tech Computer Science', institutionId: kuInstitution.id },
  });

  const bscPhysicsProgram = await prisma.program.create({
    data: { name: 'B.Sc Physics', institutionId: kuInstitution.id },
  });

  // Programs for Cluster University Srinagar
  const baEconomicsProgram = await prisma.program.create({
    data: { name: 'B.A Economics', institutionId: cusInstitution.id },
  });

  const bcomProgram = await prisma.program.create({
    data: { name: 'B.Com', institutionId: cusInstitution.id },
  });

  // Programs for GDC Sopore
  const bscMathsProgram = await prisma.program.create({
    data: { name: 'B.Sc Mathematics', institutionId: gdcInstitution.id },
  });

  console.log('Created programs.');

  // ─── BCA Subjects (6 subjects across semesters 1-3) ──────────
  const bcaSubjectsData = [
    { name: 'Fundamentals of Computer Science', semester: 1, category: 'MAJOR' as const },
    { name: 'Mathematics I (Algebra & Calculus)', semester: 1, category: 'AEC' as const },
    { name: 'C Programming Language', semester: 2, category: 'MAJOR' as const },
    { name: 'Data Structures', semester: 2, category: 'MAJOR' as const },
    { name: 'Database Management Systems', semester: 3, category: 'MAJOR' as const },
    { name: 'Operating Systems', semester: 3, category: 'MINOR' as const },
  ];

  const bcaSubjects = await Promise.all(
    bcaSubjectsData.map((s) =>
      prisma.subject.create({ data: { ...s, programId: bcaProgram.id } })
    )
  );

  // ─── B.Tech CS Subjects ────────────────────────────────────────
  const btechSubjectsData = [
    { name: 'Engineering Mathematics I', semester: 1, category: 'MAJOR' as const },
    { name: 'Engineering Physics', semester: 1, category: 'MINOR' as const },
    { name: 'Programming in C & C++', semester: 2, category: 'MAJOR' as const },
    { name: 'Digital Logic Design', semester: 2, category: 'MAJOR' as const },
    { name: 'Computer Organization & Architecture', semester: 3, category: 'MAJOR' as const },
    { name: 'Discrete Mathematics', semester: 3, category: 'AEC' as const },
  ];

  const btechSubjects = await Promise.all(
    btechSubjectsData.map((s) =>
      prisma.subject.create({ data: { ...s, programId: btechProgram.id } })
    )
  );

  // ─── B.Sc Physics Subjects ────────────────────────────────────
  const bscPhysicsSubjectsData = [
    { name: 'Mechanics & Wave Motion', semester: 1, category: 'MAJOR' as const },
    { name: 'Electricity & Magnetism', semester: 1, category: 'MAJOR' as const },
    { name: 'Optics & Lasers', semester: 2, category: 'MAJOR' as const },
    { name: 'Thermodynamics & Statistical Physics', semester: 2, category: 'MAJOR' as const },
    { name: 'Quantum Mechanics', semester: 3, category: 'MAJOR' as const },
    { name: 'Nuclear Physics', semester: 3, category: 'MINOR' as const },
  ];

  const bscPhysicsSubjects = await Promise.all(
    bscPhysicsSubjectsData.map((s) =>
      prisma.subject.create({ data: { ...s, programId: bscPhysicsProgram.id } })
    )
  );

  // ─── B.A Economics Subjects ───────────────────────────────────
  const baEconSubjectsData = [
    { name: 'Principles of Microeconomics', semester: 1, category: 'MAJOR' as const },
    { name: 'Mathematical Methods for Economics', semester: 1, category: 'AEC' as const },
    { name: 'Macroeconomic Theory', semester: 2, category: 'MAJOR' as const },
    { name: 'Indian Economic Development', semester: 2, category: 'MAJOR' as const },
    { name: 'Public Finance & Taxation', semester: 3, category: 'MAJOR' as const },
    { name: 'International Trade Theory', semester: 3, category: 'MINOR' as const },
  ];

  const baEconSubjects = await Promise.all(
    baEconSubjectsData.map((s) =>
      prisma.subject.create({ data: { ...s, programId: baEconomicsProgram.id } })
    )
  );

  // ─── B.Com Subjects ───────────────────────────────────────────
  const bcomSubjectsData = [
    { name: 'Financial Accounting I', semester: 1, category: 'MAJOR' as const },
    { name: 'Business Organisation & Management', semester: 1, category: 'MAJOR' as const },
    { name: 'Cost Accounting', semester: 2, category: 'MAJOR' as const },
    { name: 'Business Law & Corporate Law', semester: 2, category: 'SEC' as const },
    { name: 'Income Tax Law & Practice', semester: 3, category: 'MAJOR' as const },
    { name: 'Financial Management', semester: 3, category: 'MAJOR' as const },
  ];

  const bcomSubjects = await Promise.all(
    bcomSubjectsData.map((s) =>
      prisma.subject.create({ data: { ...s, programId: bcomProgram.id } })
    )
  );

  // ─── B.Sc Maths Subjects ──────────────────────────────────────
  const bscMathsSubjectsData = [
    { name: 'Calculus & Real Analysis', semester: 1, category: 'MAJOR' as const },
    { name: 'Algebra & Number Theory', semester: 1, category: 'MAJOR' as const },
    { name: 'Differential Equations', semester: 2, category: 'MAJOR' as const },
    { name: 'Vector Calculus', semester: 2, category: 'MAJOR' as const },
    { name: 'Complex Analysis', semester: 3, category: 'MAJOR' as const },
    { name: 'Linear Algebra', semester: 3, category: 'MINOR' as const },
  ];

  const bscMathsSubjects = await Promise.all(
    bscMathsSubjectsData.map((s) =>
      prisma.subject.create({ data: { ...s, programId: bscMathsProgram.id } })
    )
  );

  console.log('Created subjects.');

  // ─── Resource generation helper ────────────────────────────────
  const s3Base = 'https://noteswebsite-assets.s3.ap-south-1.amazonaws.com';

  function makeResources(
    subjectId: string,
    subjectSlug: string,
    uploaderId: string
  ) {
    const types: ResourceType[] = ['NOTE', 'PYQ', 'SYLLABUS', 'GUESS_PAPER'];
    const years = [2021, 2022, 2023, 2024, 2025];
    const resources = [];

    // 2 NOTEs
    resources.push({
      title: `Complete Notes — ${subjectSlug} (Unit 1–5)`,
      type: 'NOTE' as ResourceType,
      fileUrl: `${s3Base}/notes/${subjectSlug}-complete-notes.pdf`,
      subjectId,
      uploaderId,
      downloadsCount: Math.floor(Math.random() * 800) + 100,
      isApproved: true,
      isAiGenerated: false,
      year: 2025,
    });
    resources.push({
      title: `Short Notes — ${subjectSlug} (Exam Ready)`,
      type: 'NOTE' as ResourceType,
      fileUrl: `${s3Base}/notes/${subjectSlug}-short-notes.pdf`,
      subjectId,
      uploaderId,
      downloadsCount: Math.floor(Math.random() * 600) + 50,
      isApproved: true,
      isAiGenerated: false,
      year: 2025,
    });

    // 2 PYQs
    for (let i = 0; i < 2; i++) {
      const year = years[i + 1];
      resources.push({
        title: `Previous Year Questions — ${subjectSlug} (${year})`,
        type: 'PYQ' as ResourceType,
        fileUrl: `${s3Base}/pyq/${subjectSlug}-pyq-${year}.pdf`,
        subjectId,
        uploaderId,
        downloadsCount: Math.floor(Math.random() * 1200) + 200,
        isApproved: true,
        isAiGenerated: false,
        year,
      });
    }

    // 1 SYLLABUS
    resources.push({
      title: `Official Syllabus — ${subjectSlug} (2024–2025)`,
      type: 'SYLLABUS' as ResourceType,
      fileUrl: `${s3Base}/syllabus/${subjectSlug}-syllabus-2025.pdf`,
      subjectId,
      uploaderId,
      downloadsCount: Math.floor(Math.random() * 400) + 300,
      isApproved: true,
      isAiGenerated: false,
      year: 2025,
    });

    // 2 GUESS_PAPER (AI-generated)
    for (let i = 0; i < 2; i++) {
      const year = years[i + 3];
      resources.push({
        title: `AI Guess Paper — ${subjectSlug} (${year} Exam Prediction)`,
        type: 'GUESS_PAPER' as ResourceType,
        fileUrl: `${s3Base}/guess/${subjectSlug}-guess-${year}.pdf`,
        subjectId,
        uploaderId,
        downloadsCount: Math.floor(Math.random() * 500) + 100,
        isApproved: true,
        isAiGenerated: true,
        year,
      });
    }

    // Extra PYQ (year 2023)
    resources.push({
      title: `Previous Year Questions — ${subjectSlug} (2023)`,
      type: 'PYQ' as ResourceType,
      fileUrl: `${s3Base}/pyq/${subjectSlug}-pyq-2023.pdf`,
      subjectId,
      uploaderId,
      downloadsCount: Math.floor(Math.random() * 900) + 150,
      isApproved: true,
      isAiGenerated: false,
      year: 2023,
    });

    return resources;
  }

  // Flatten all subjects across all programs
  const allSubjectGroups = [
    { subjects: bcaSubjects, prefix: 'bca' },
    { subjects: btechSubjects, prefix: 'btech-cs' },
    { subjects: bscPhysicsSubjects, prefix: 'bsc-physics' },
    { subjects: baEconSubjects, prefix: 'ba-econ' },
    { subjects: bcomSubjects, prefix: 'bcom' },
    { subjects: bscMathsSubjects, prefix: 'bsc-maths' },
  ];

  let totalResources = 0;
  for (const group of allSubjectGroups) {
    for (let idx = 0; idx < group.subjects.length; idx++) {
      const subject = group.subjects[idx];
      const slug = `${group.prefix}-s${subject.semester}-${idx + 1}`;
      const resources = makeResources(subject.id, slug, adminUser.id);
      await prisma.resource.createMany({ data: resources });
      totalResources += resources.length;
    }
  }

  console.log(`Created ${totalResources} resources.`);

  // ─── Sample Requests ──────────────────────────────────────────
  await prisma.request.createMany({
    data: [
      {
        studentName: 'Aadil Mushtaq',
        requestedMaterial:
          'I need solved question papers for BCA 4th semester Data Communications subject from Kashmir University. Any year from 2020 onwards will be helpful.',
        contactEmail: 'aadil.mushtaq@student.uok.edu.in',
        status: 'PENDING',
      },
      {
        studentName: 'Zainab Qadri',
        requestedMaterial:
          'Looking for detailed notes on Quantum Mechanics for B.Sc Physics 5th semester. Preferably chapter-wise notes covering wave functions, Schrodinger equation, and perturbation theory.',
        contactEmail: 'zainab.qadri@gmail.com',
        status: 'PENDING',
      },
      {
        studentName: 'Tariq Bashir',
        requestedMaterial:
          'Need previous year question papers for B.Com Financial Management subject, years 2022 and 2023, from Cluster University Srinagar.',
        status: 'FULFILLED',
      },
      {
        studentName: 'Ruqayya Lone',
        requestedMaterial:
          'Please upload the official syllabus for B.Tech CSE 3rd year subjects including Computer Networks and Compiler Design from Kashmir University.',
        contactEmail: 'ruqayya.lone@outlook.com',
        status: 'PENDING',
      },
      {
        studentName: 'Imtiyaz Ahmad',
        requestedMaterial:
          'Looking for handwritten notes or typed notes for B.Sc Mathematics Linear Algebra and Complex Analysis. Exam-focused short notes would be ideal.',
        status: 'PENDING',
      },
    ],
  });

  console.log('Created sample requests.');
  console.log('Database seeding complete.');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
