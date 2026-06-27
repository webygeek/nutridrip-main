import "dotenv/config";
import { hashSync } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

// Set DATABASE_URL for the Prisma config to pick up
process.env.DATABASE_URL = process.env.DATABASE_URL || "file:./prisma/dev.db";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ─── Demo Users ──────────────────────────────────────────────────────────
  const users = [
    { email: "admin@nutridrip.in", password: "admin1234", name: "Super Admin", role: "admin", permissions: "[]" },
    { email: "subadmin@nutridrip.in", password: "subadmin1234", name: "Sub-Admin (Content)", role: "subadmin", permissions: '["edit_content","manage_drips"]' },
    { email: "doctor@nutridrip.in", password: "doctor1234", name: "Dr. Kavya Mehra", role: "doctor", specialty: "Internal Medicine & IV Therapy", qualifications: "MBBS, MD (Internal Medicine), FICP", experience: "14 years", languages: '["English","Hindi"]', rating: 4.9 },
    { email: "nurse@nutridrip.in", password: "nurse1234", name: "Nurse R. Kumari", role: "nurse", rnNumber: "RN-KA-4821", shift: "morning", certifications: '["BLS","ACLS","IV Therapy Cert"]', rating: 4.9, phone: "+91 98111 20001" },
    { email: "clinic@nutridrip.in", password: "clinic1234", name: "Apollo Wellness Centre", role: "clinic" },
    { email: "demo@nutridrip.in", password: "demo1234", name: "Demo Patient", role: "patient", phone: "+91 98000 10001", dob: "1992-05-15", bloodGroup: "O+", address: "Mumbai, Maharashtra" },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        password: hashSync(u.password, 10),
        name: u.name,
        role: u.role,
        permissions: u.permissions ?? "[]",
        specialty: u.specialty ?? "",
        qualifications: u.qualifications ?? "",
        experience: u.experience ?? "",
        languages: u.languages ?? "[]",
        rating: u.rating ?? 0,
        rnNumber: u.rnNumber ?? "",
        shift: u.shift ?? "",
        certifications: u.certifications ?? "[]",
        phone: u.phone ?? "",
        dob: u.dob ?? "",
        bloodGroup: u.bloodGroup ?? "",
        address: u.address ?? "",
      },
    });
  }
  console.log(`  ✓ ${users.length} users seeded`);

  // ─── Drips ───────────────────────────────────────────────────────────────
  const drips = [
    { slug: "velocity", name: "Velocity", subtitle: "Energy & Cognitive Performance", category: "energy", price: 8500, duration: "45–60 min", volume: "250ml", icon: "⚡", tags: '["Energy","Focus","NAD+","Anti-fatigue"]', popular: false, description: "Our most popular formula. Combines NAD+ precursors, the full B-complex and chelated magnesium to flood your mitochondria with fuel.", accentGradient: "linear-gradient(90deg, #FFD93D, #FF6B35)", ingredients: '[{"name":"NAD+","dose":"500mg","barPct":90},{"name":"B-Complex","dose":"Full spectrum","barPct":80},{"name":"Magnesium Chloride","dose":"2g","barPct":70},{"name":"Vitamin B12","dose":"1mg","barPct":85}]' },
    { slug: "luminescence", name: "Luminescence", subtitle: "Skin Brightening & Detox", category: "beauty", price: 9200, duration: "60–75 min", volume: "500ml", icon: "✦", tags: '["Skin","Glow","Detox","Antioxidant"]', popular: true, description: "High-dose Glutathione paired with Vitamin C creates a powerful antioxidant cascade that brightens skin tone and detoxifies.", accentGradient: "linear-gradient(90deg, #FF9CEE, #FFDDE1)", ingredients: '[{"name":"Glutathione","dose":"2,400mg","barPct":100},{"name":"Vitamin C","dose":"10g","barPct":90},{"name":"Alpha Lipoic Acid","dose":"300mg","barPct":65},{"name":"Biotin","dose":"10mg","barPct":55}]' },
    { slug: "fortress", name: "Fortress", subtitle: "Immune Defence & Protection", category: "immunity", price: 7800, duration: "60–90 min", volume: "500ml", icon: "🛡️", tags: '["Immunity","Recovery","Zinc","Anti-viral"]', popular: false, description: "A pharmaceutical-grade immune protocol combining Zinc, Selenium, ultra-high-dose Vitamin C and D3.", accentGradient: "linear-gradient(90deg, #5BB8F5, #1A7EA8)", ingredients: '[{"name":"Vitamin C","dose":"25g","barPct":100},{"name":"Zinc Chloride","dose":"5mg","barPct":75},{"name":"Selenium","dose":"200mcg","barPct":60},{"name":"Vitamin D3","dose":"50,000 IU","barPct":70}]' },
    { slug: "hydraflux", name: "Hydraflux", subtitle: "Deep Hydration & Recovery", category: "recovery", price: 5500, duration: "30–45 min", volume: "1,000ml", icon: "🌊", tags: '["Hydration","Recovery","Electrolytes","Hangover"]', popular: false, description: "Go from dehydrated to deeply replenished in under an hour.", accentGradient: "linear-gradient(90deg, #43E5F7, #1A7EA8)", ingredients: '[{"name":"Normal Saline","dose":"1,000ml","barPct":100},{"name":"Electrolyte Blend","dose":"Full","barPct":80},{"name":"B-Complex","dose":"Standard","barPct":65},{"name":"Magnesium Sulfate","dose":"1g","barPct":55}]' },
    { slug: "apex", name: "Apex", subtitle: "Athletic Performance & Recovery", category: "performance", price: 10500, duration: "60–75 min", volume: "500ml", icon: "🏋️", tags: '["Performance","Muscle","Amino Acids","Endurance"]', popular: false, description: "Designed for athletes and high-performers. A complete amino acid profile plus L-Carnitine and B12.", accentGradient: "linear-gradient(90deg, #43CBFF, #9708CC)", ingredients: '[{"name":"Amino Acid Complex","dose":"10g","barPct":100},{"name":"L-Carnitine","dose":"3g","barPct":85},{"name":"Vitamin B12","dose":"2mg","barPct":70},{"name":"Taurine","dose":"2g","barPct":60}]' },
    { slug: "cognitas", name: "Cognitas", subtitle: "Mental Clarity & Mood", category: "cognition", price: 11000, duration: "60–90 min", volume: "500ml", icon: "🧠", tags: '["Cognition","Mood","Nootropic","Memory"]', popular: false, description: "Our premium nootropic IV. Alpha Lipoic Acid and Taurine protect neurons while NAD+ and Magnesium rebuild neurotransmitter pathways.", accentGradient: "linear-gradient(90deg, #C471F5, #FA71CD)", ingredients: '[{"name":"NAD+","dose":"750mg","barPct":100},{"name":"Alpha Lipoic Acid","dose":"600mg","barPct":80},{"name":"Taurine","dose":"2g","barPct":70},{"name":"Magnesium Threonate","dose":"3g","barPct":65}]' },
  ];

  for (const d of drips) {
    await prisma.drip.upsert({
      where: { slug: d.slug },
      update: {},
      create: d,
    });
  }
  console.log(`  ✓ ${drips.length} drips seeded`);

  // ─── Clinics ─────────────────────────────────────────────────────────────
  const clinics = [
    { name: "Apollo Wellness Centre", location: "Mumbai", contact: "Dr. Rakesh Iyer", status: "active", monthlyVolume: 45 },
    { name: "Fortis Cosmetic & Aesthetic", location: "Delhi", contact: "Dr. Meena Kapoor", status: "active", monthlyVolume: 32 },
    { name: "Manipal IVF & Wellness", location: "Bangalore", contact: "Dr. Amit Shetty", status: "active", monthlyVolume: 28 },
    { name: "CMC Hyderabad - Integrative", location: "Hyderabad", contact: "Dr. Kiran Rao", status: "active", monthlyVolume: 18 },
    { name: "Max Aesthetics — Gurgaon", location: "Gurgaon", contact: "Dr. Suresh Gupta", status: "pending", monthlyVolume: 0 },
  ];

  for (const c of clinics) {
    await prisma.clinic.create({ data: c });
  }
  console.log(`  ✓ ${clinics.length} clinics seeded`);

  console.log("\nSeed complete!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
