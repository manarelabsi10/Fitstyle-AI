import { initializeApp } from "firebase/app";
import { getFirestore, collection, writeBatch, doc } from "firebase/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load configuration
const firebaseConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../config/firebase-applet-config.json"), "utf-8")
);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const PRODUCTS_TO_RESTORE = [
  {
    name: "Cream Silk Bow-Neck Blouse",
    category: "Casual",
    occasion: "Casual",
    color: "Cream",
    price: 110,
    sizes: ["S", "M", "L", "XL"],
    imageUrl: "/src/assets/images/cream_bow_blouse.png",
    shapes: ["Hourglass", "Pear", "Apple", "Rectangle", "Inverted Triangle"],
    inStock: true,
    gender: "women"
  },
  {
    name: "Olive Green Wide-Leg Trousers",
    category: "Casual",
    occasion: "Casual",
    color: "Olive Green",
    price: 95,
    sizes: ["S", "M", "L"],
    imageUrl: "/src/assets/images/olive_wide_pants.png",
    shapes: ["Hourglass", "Pear", "Apple", "Rectangle"],
    inStock: true,
    gender: "women"
  },
  {
    name: "Polka Dot Bustier Dress",
    category: "Casual",
    occasion: "Casual",
    color: "Black & White",
    price: 125,
    sizes: ["XS", "S", "M", "L"],
    imageUrl: "/src/assets/images/polka_dot_dress.png",
    shapes: ["Hourglass", "Pear", "Rectangle", "Inverted Triangle"],
    inStock: true,
    gender: "women"
  }
];

async function restore() {
  console.log("Starting restoration process...");
  try {
    const prodColRef = collection(db, "products");
    
    // Firestore batch writes are capped at 500 operations, so 58 is perfectly safe in a single batch
    const batch = writeBatch(db);
    
    for (const prod of PRODUCTS_TO_RESTORE) {
      // Create a document reference with auto-generated ID (addDoc style but batched)
      const newDocRef = doc(prodColRef);
      batch.set(newDocRef, {
        name: prod.name,
        category: prod.category,
        occasion: prod.occasion,
        color: prod.color,
        price: prod.price,
        sizes: prod.sizes,
        imageUrl: prod.imageUrl,
        shapes: prod.shapes,
        inStock: prod.inStock,
        gender: prod.gender,
        // Provide standard keys just in case a schema rules validation triggers downstream
        occasions: [prod.occasion],
        colour: prod.color,
        size: prod.sizes.join(", ")
      });
    }

    await batch.commit();

    console.log("Products restored:", PRODUCTS_TO_RESTORE.length);
    process.exit(0);
  } catch (err) {
    console.error("Restoration failed with clinical error:", err);
    process.exit(1);
  }
}

restore();
