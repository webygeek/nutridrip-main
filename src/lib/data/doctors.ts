export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  qualifications: string;
  experience: string;
  availableDays: string[];
  slots: string[];
  consultFee: number;
  rating: number;
  reviewCount: number;
  languages: string[];
};

export const DOCTORS: Doctor[] = [
  {
    id: "dr-mehra",
    name: "Dr. Kavya Mehra",
    specialty: "Internal Medicine & IV Therapy",
    qualifications: "MBBS, MD (Internal Medicine), FICP",
    experience: "14 years",
    availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    slots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"],
    consultFee: 800,
    rating: 4.9,
    reviewCount: 312,
    languages: ["English", "Hindi"],
  },
  {
    id: "dr-reddy",
    name: "Dr. Tarun Reddy",
    specialty: "Preventive Medicine & Nutrition",
    qualifications: "MBBS, DNB (Preventive Medicine), CDE",
    experience: "10 years",
    availableDays: ["Mon", "Wed", "Fri", "Sat"],
    slots: ["10:00 AM", "11:00 AM", "12:00 PM", "05:00 PM", "06:00 PM"],
    consultFee: 700,
    rating: 4.8,
    reviewCount: 198,
    languages: ["English", "Hindi", "Telugu"],
  },
  {
    id: "dr-singh",
    name: "Dr. Priya Singh",
    specialty: "Dermatology & Aesthetic Medicine",
    qualifications: "MBBS, MD (Dermatology), Fellowship (Aesthetic Medicine)",
    experience: "9 years",
    availableDays: ["Tue", "Thu", "Sat"],
    slots: ["10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"],
    consultFee: 1000,
    rating: 4.9,
    reviewCount: 276,
    languages: ["English", "Hindi", "Punjabi"],
  },
  {
    id: "dr-nair",
    name: "Dr. Aditya Nair",
    specialty: "Sports Medicine & Rehabilitation",
    qualifications: "MBBS, MS (Ortho), Dip. Sports Medicine",
    experience: "11 years",
    availableDays: ["Mon", "Tue", "Thu", "Fri"],
    slots: ["08:00 AM", "09:00 AM", "10:00 AM", "05:00 PM", "06:00 PM", "07:00 PM"],
    consultFee: 900,
    rating: 4.7,
    reviewCount: 185,
    languages: ["English", "Hindi", "Malayalam"],
  },
  {
    id: "dr-gupta",
    name: "Dr. Sneha Gupta",
    specialty: "Endocrinology & Metabolic Health",
    qualifications: "MBBS, DM (Endocrinology)",
    experience: "8 years",
    availableDays: ["Mon", "Wed", "Thu", "Sat"],
    slots: ["09:00 AM", "10:00 AM", "11:00 AM", "03:00 PM", "04:00 PM"],
    consultFee: 1200,
    rating: 4.8,
    reviewCount: 154,
    languages: ["English", "Hindi"],
  },
  {
    id: "dr-joseph",
    name: "Dr. Samuel Joseph",
    specialty: "General Medicine & Wellness",
    qualifications: "MBBS, MD (General Medicine)",
    experience: "16 years",
    availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    slots: ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"],
    consultFee: 600,
    rating: 4.6,
    reviewCount: 420,
    languages: ["English", "Hindi", "Tamil"],
  },
];
