import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
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
const auth = getAuth(app);

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
  console.log("Starting product updates with authenticated owner user session...");
  
  try {
    const email = "owner-seed-" + Math.floor(Math.random() * 1000000) + "@fitstyle.ai";
    const password = "seedpassword123";

    console.log("Creating/Registering temporary owner account: " + email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log("Saving users role as 'owner' for ID: " + user.uid);
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      fullName: "Database Seed Owner",
      role: "owner"
    });

    console.log("Re-authenticating and signing in as owner...");
    await signInWithEmailAndPassword(auth, email, password);

    const prodColRef = collection(db, "products");
    
    // 1. Fetch and DELETE current products in Firestore
    const snap = await getDocs(prodColRef);
    console.log(`Found ${snap.size} existing items in Firestore. Deleting...`);
    
    for (const d of snap.docs) {
      await deleteDoc(doc(db, "products", d.id));
    }
    console.log("Deletion complete.");

    // 2. Upload all 24 new products
    console.log(`Uploading ${ALL_PRODUCTS.length} new products...`);
    for (const prod of ALL_PRODUCTS) {
      const docRef = doc(db, "products", prod.id);
      
      const payload = {
        name: prod.name,
        category: prod.category,
        imageUrl: prod.image,
        price: prod.price,
        occasions: prod.occasions,
        shapes: prod.shapes,
        colour: prod.colour,
        size: prod.size,
        inStock: prod.inStock,
        gender: prod.gender
      };

      await setDoc(docRef, payload);
    }
    
    console.log("Seeding transaction finished successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Critical seeding error failure:", err);
    process.exit(1);
  }
}

seed();
