export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  images: string[];
  variants?: string[];
  sizes: string[];
  description: string;
  material: string;
  care: string;
  origin: string;
  manufacturer: string;
}

export const products: Product[] = [
  { 
    id: 1, 
    name: "Anime Oversized Tee", 
    price: 999,
    category: "T-Shirts",
    images: ["/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg"],
    variants: ["Black", "White", "Grey"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    description: "Premium quality oversized anime graphic tee with comfortable fit",
    material: "100% Cotton, Machine Wash",
    care: "Machine wash cold, tumble dry low",
    origin: "India (and proud)",
    manufacturer: "The Souled Store Pvt. Ltd."
  },
  { 
    id: 2, 
    name: "Football Fan Tee", 
    price: 899,
    category: "T-Shirts",
    images: ["/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg"],
    variants: ["Red", "Blue", "Green"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    description: "Show your love for football with this stylish fan tee",
    material: "100% Cotton, Machine Wash",
    care: "Machine wash cold, tumble dry low",
    origin: "India (and proud)",
    manufacturer: "The Souled Store Pvt. Ltd."
  },
  { 
    id: 3, 
    name: "Pink Floyd Tee", 
    price: 1099,
    category: "T-Shirts",
    images: ["/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg"],
    variants: ["Black", "Navy", "Charcoal"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    description: "Classic Pink Floyd band tee for music lovers",
    material: "100% Cotton, Machine Wash",
    care: "Machine wash cold, tumble dry low",
    origin: "India (and proud)",
    manufacturer: "The Souled Store Pvt. Ltd."
  },
  { 
    id: 4, 
    name: "Streetwear Black Tee", 
    price: 949,
    category: "T-Shirts",
    images: ["/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    description: "Minimalist streetwear tee perfect for everyday wear",
    material: "100% Cotton, Machine Wash",
    care: "Machine wash cold, tumble dry low",
    origin: "India (and proud)",
    manufacturer: "The Souled Store Pvt. Ltd."
  },
  { 
    id: 5, 
    name: "Minimal White Tee", 
    price: 799,
    category: "T-Shirts",
    images: ["/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    description: "Clean and minimal white tee for a classic look",
    material: "100% Cotton, Machine Wash",
    care: "Machine wash cold, tumble dry low",
    origin: "India (and proud)",
    manufacturer: "The Souled Store Pvt. Ltd."
  },
];