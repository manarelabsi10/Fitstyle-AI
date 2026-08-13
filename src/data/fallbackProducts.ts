import { Product } from "../types";
import creamBlouseImg from "../assets/images/cream_bow_blouse.png";
import olivePantsImg from "../assets/images/olive_wide_pants.png";
import polkaDotDressImg from "../assets/images/polka_dot_dress.png";
import weddingDressImg from "../assets/images/wedding.jpeg";
import weddingDressImg1 from "../assets/images/wedding_dress_1.png";
import weddingDressImg2 from "../assets/images/wedding_dress_2.png";
import weddingDressImg3 from "../assets/images/wedding_dress_3.png";
import weddingDressImg4 from "../assets/images/wedding.jpeg";
import weddingDressRuffleImg from "../assets/images/wedding_dress_ruffle.jpeg";
import weddingDressLaceImg from "../assets/images/wedding_dress_lace.jpeg";

export const STATIC_FALLBACK_PRODUCTS: Product[] = [
  {
    id: "prod-cas-blouse",
    name: "Cream Silk Bow-Neck Blouse",
    image: creamBlouseImg,
    price: 110,
    size: "S, M, L, XL",
    category: "top",
    colour: "Cream",
    occasion: "Casual",
    occasions: ["casual"],
    shapes: ["Hourglass", "Pear", "Apple", "Rectangle", "Inverted Triangle"],
    inStock: true
  },
  {
    id: "prod-cas-trousers",
    name: "Olive Green Wide-Leg Trousers",
    image: olivePantsImg,
    price: 95,
    size: "S, M, L",
    category: "bottom",
    colour: "Olive Green",
    occasion: "Casual",
    occasions: ["casual"],
    shapes: ["Hourglass", "Pear", "Apple", "Rectangle"],
    inStock: true
  },
  {
    id: "prod-cas-polka-dress",
    name: "Polka Dot Bustier Dress",
    image: polkaDotDressImg,
    price: 125,
    size: "XS, S, M, L",
    category: "top",
    colour: "Black & White",
    occasion: "Casual",
    occasions: ["casual"],
    shapes: ["Hourglass", "Pear", "Rectangle", "Inverted Triangle"],
    inStock: true
  },
  {
    id: "prod-wed-dress",
    name: "Elegant White Silk Wedding Gown",
    image: weddingDressImg,
    price: 850,
    size: "XS, S, M, L, XL",
    category: "top",
    colour: "White",
    occasion: "Wedding",
    occasions: ["wedding"],
    shapes: ["Hourglass", "Pear", "Apple", "Rectangle", "Inverted Triangle"],
    inStock: true
  },
  {
    id: "prod-wed-dress-2",
    name: "White Floral Strapless Wedding Dress",
    image: weddingDressImg1,
    price: 780,
    size: "XS, S, M, L, XL",
    category: "top",
    colour: "White",
    occasion: "Wedding",
    occasions: ["wedding"],
    shapes: ["Hourglass", "Pear", "Rectangle"],
    inStock: true
  },
  {
    id: "prod-wed-dress-3",
    name: "White Textured A-Line Wedding Gown",
    image: weddingDressImg2,
    price: 820,
    size: "XS, S, M, L, XL",
    category: "top",
    colour: "White",
    occasion: "Wedding",
    occasions: ["wedding"],
    shapes: ["Hourglass", "Pear", "Apple", "Rectangle"],
    inStock: true
  },
  {
    id: "prod-wed-dress-4",
    name: "White Spaghetti Strap Bridal Dress",
    image: weddingDressImg3,
    price: 790,
    size: "XS, S, M, L, XL",
    category: "top",
    colour: "White",
    occasion: "Wedding",
    occasions: ["wedding"],
    shapes: ["Hourglass", "Pear", "Apple", "Rectangle"],
    inStock: true
  },
  {
    id: "prod-wed-dress-5",
    name: "Ivory Lace Mermaid Bridal Gown",
    image: weddingDressImg4,
    price: 920,
    size: "XS, S, M, L, XL",
    category: "top",
    colour: "Ivory",
    occasion: "Wedding",
    occasions: ["wedding"],
    shapes: ["Hourglass", "Pear", "Rectangle"],
    inStock: true
  },
  {
    id: "prod-wed-dress-6",
    name: "White Ruffle Off-Shoulder Bridal Ball Gown",
    image: weddingDressRuffleImg,
    price: 860,
    size: "XS, S, M, L, XL",
    category: "top",
    colour: "White",
    occasion: "Wedding",
    occasions: ["wedding"],
    shapes: ["Hourglass", "Pear", "Apple", "Rectangle", "Inverted Triangle"],
    inStock: true
  },
  {
    id: "prod-wed-dress-7",
    name: "Ivory Lace Sleeve Tea-Length Wedding Dress",
    image: weddingDressLaceImg,
    price: 895,
    size: "XS, S, M, L, XL",
    category: "top",
    colour: "Ivory",
    occasion: "Wedding",
    occasions: ["wedding"],
    shapes: ["Hourglass", "Pear", "Apple", "Rectangle", "Inverted Triangle"],
    inStock: true
  }
];