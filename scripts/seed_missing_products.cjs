// seed_missing_products.js
// Run this in your Firebase project to add the two missing wedding dress products.
// Usage: node seed_missing_products.js
// Requires: npm install firebase-admin

const admin = require("firebase-admin");
const path = require("path");

// ── CONFIGURE ──────────────────────────────────────────────────────────────────
// Download your service account key from Firebase Console →
// Project Settings → Service Accounts → Generate new private key
const serviceAccount = require(path.join(__dirname, "../config/serviceAccountKey.json")); // ← put your key file here

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ── MISSING PRODUCTS ───────────────────────────────────────────────────────────
const missingProducts = [
  {
    id: "prod-wed-dress-6",
    name: "White Ruffle Off-Shoulder Bridal Ball Gown",
    category: "top",
    colour: "White",
    occasion: "Wedding",
    occasions: ["wedding"],
    shapes: ["Hourglass", "Pear", "Apple", "Rectangle", "Inverted Triangle"],
    size: "XS, S, M, L, XL",
    price: 860,
    imageUrl: "/src/assets/images/wedding_dress_ruffle.jpeg",
    inStock: true,
  },
  {
    id: "prod-wed-dress-7",
    name: "Ivory Lace Sleeve Tea-Length Wedding Dress",
    category: "top",
    colour: "Ivory",
    occasion: "Wedding",
    occasions: ["wedding"],
    shapes: ["Hourglass", "Pear", "Apple", "Rectangle", "Inverted Triangle"],
    size: "XS, S, M, L, XL",
    price: 895,
    imageUrl: "/src/assets/images/wedding_dress_lace.jpeg",
    inStock: true,
  },
];

// ── SEED ───────────────────────────────────────────────────────────────────────
async function seedMissingProducts() {
  const batch = db.batch();

  for (const product of missingProducts) {
    const { id, ...data } = product;
    const ref = db.collection("products").doc(id);
    batch.set(ref, data, { merge: true }); // merge:true won't overwrite existing fields
    console.log(`Queued: ${id} — ${data.name}`);
  }

  await batch.commit();
  console.log("\n✅ Successfully added prod-wed-dress-6 and prod-wed-dress-7 to Firestore.");
}

seedMissingProducts().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});