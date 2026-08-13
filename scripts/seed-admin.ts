import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load configuration to get the project name and named database ID
const firebaseConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../config/firebase-applet-config.json"), "utf-8")
);

console.log(`Initializing firebase-admin on project: ${firebaseConfig.projectId}`);
admin.initializeApp({
  projectId: firebaseConfig.projectId
});

// Connect to the specific named Firestore database
const db = getFirestore(firebaseConfig.firestoreDatabaseId);

const ALL_PRODUCTS = [
  {
    id: "prod-cas-blouse",
    name: "Cream Silk Bow-Neck Blouse",
    image: "/src/assets/images/cream_bow_blouse.png",
    price: 110,
    size: "S, M, L, XL",
    category: "top",
    colour: "Cream",
    occasion: "Casual",
    occasions: ["casual"],
    shapes: ["Hourglass", "Pear", "Apple", "Rectangle", "Inverted Triangle"],
    inStock: true,
    gender: "women"
  },
  {
    id: "prod-cas-trousers",
    name: "Olive Green Wide-Leg Trousers",
    image: "/src/assets/images/olive_wide_pants.png",
    price: 95,
    size: "S, M, L",
    category: "bottom",
    colour: "Olive Green",
    occasion: "Casual",
    occasions: ["casual"],
    shapes: ["Hourglass", "Pear", "Apple", "Rectangle"],
    inStock: true,
    gender: "women"
  },
  {
    id: "prod-cas-polka-dress",
    name: "Polka Dot Bustier Dress",
    image: "/src/assets/images/polka_dot_dress.png",
    price: 125,
    size: "XS, S, M, L",
    category: "top",
    colour: "Black & White",
    occasion: "Casual",
    occasions: ["casual"],
    shapes: ["Hourglass", "Pear", "Rectangle", "Inverted Triangle"],
    inStock: true,
    gender: "women"
  }
];

async function seed() {
  console.log("Seeding with privileged firebase-admin SDK on GCP...");
  
  try {
    const productsCollection = db.collection("products");
    
    // 1. Fetch existing items
    const snap = await productsCollection.get();
    console.log(`Found ${snap.size} legacy products in Firestore. Deleting all of them...`);
    
    // 2. Clear old catalog
    const batchDelete = db.batch();
    snap.docs.forEach((doc) => {
      batchDelete.delete(doc.ref);
    });
    await batchDelete.commit();
    console.log("Deleted all legacy products from Firestore.");
    
    // 3. Write all new products
    console.log(`Uploading ${ALL_PRODUCTS.length} new unique fashion products...`);
    
    const batchWrite = db.batch();
    ALL_PRODUCTS.forEach((prod) => {
      const docRef = productsCollection.doc(prod.id);
      batchWrite.set(docRef, {
        name: prod.name,
        category: prod.category,
        imageUrl: prod.image,
        price: Number(prod.price),
        occasions: prod.occasions,
        shapes: prod.shapes,
        colour: prod.colour,
        size: prod.size,
        inStock: prod.inStock,
        gender: prod.gender
      });
    });
    
    await batchWrite.commit();
    console.log("Completed seeding catalog collection successfully via admin SDK.");
    process.exit(0);
  } catch (err) {
    console.error("Critical seeding error failure:", err);
    process.exit(1);
  }
}

seed();
