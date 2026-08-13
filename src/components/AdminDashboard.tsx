import React, { useState, useMemo } from "react";
import { 
  Plus, Trash2, Edit3, X, Image, Tag, DollarSign, 
  PlusCircle, Check, LogOut, Download, AlertTriangle, 
  Heart, Search, HelpCircle, BarChart3 
} from "lucide-react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { Product, CategoryType, OccasionType, UserProfile } from "../types";
import SalesAnalyticsDashboard from "./SalesAnalyticsDashboard";

interface AdminDashboardProps {
  products: Product[];
  onAddProduct: (prod: Omit<Product, "id"> & { id?: string }) => Promise<void> | void;
  onUpdateProduct: (prod: Product) => Promise<void> | void;
  onDeleteProduct: (id: string) => Promise<void> | void;
  currentUser: UserProfile;
  onLogout: () => void;
}

export default function AdminDashboard({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  currentUser,
  onLogout
}: AdminDashboardProps) {
  // Active page section toggle (Garment catalogue or Sales Analytics Dashboard)
  const [activeTab, setActiveTab] = useState<"catalogue" | "analytics">("catalogue");

  // Sidebar/Drawer form state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [currentProductId, setCurrentProductId] = useState("");

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterOccasion, setFilterOccasion] = useState<string>("all");
  const [filterSize, setFilterSize] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-added");

  // Bulk Actions State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Custom Delete Confirmation Modal State
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<Product | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<string | null>(null);

  // Photo Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [saving, setSaving] = useState(false);

  // Form Field State
  const [name, setName] = useState("");
  const [category, setCategory] = useState<CategoryType>("top");
  const [occasion, setOccasion] = useState<OccasionType>("Casual");
  const [size, setSize] = useState("M");
  const [price, setPrice] = useState<number>(120);
  const [image, setImage] = useState("");
  const [colour, setColour] = useState("");
  const [inStock, setInStock] = useState(true);

  const [formError, setFormError] = useState("");

  // Helper: Trigger custom toast notifications
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Search, Filter, Sort products list
  const processedProducts = useMemo(() => {
    let result = [...products];

    // Search by product name
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q));
    }

    // Filter by Category
    if (filterCategory !== "all") {
      result = result.filter(p => p.category === filterCategory);
    }

    // Filter by Occasion
    if (filterOccasion !== "all") {
      result = result.filter(p => p.occasion === filterOccasion);
    }

    // Filter by Size
    if (filterSize !== "all") {
      result = result.filter(p => p.size === filterSize);
    }

    // Sort by options
    result.sort((a, b) => {
      if (sortBy === "price-asc") {
        return a.price - b.price;
      }
      if (sortBy === "price-desc") {
        return b.price - a.price;
      }
      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "name-desc") {
        return b.name.localeCompare(a.name);
      }
      // "date-added" or fallback (newest docId first assuming alphanumeric timestamp formatting)
      return b.id.localeCompare(a.id);
    });

    return result;
  }, [products, searchQuery, filterCategory, filterOccasion, filterSize, sortBy]);

  const uploadImageFile = async (file: File): Promise<string> => {
    setUploadError("");
    setUploadStatus("Compressing and uploading photo...");
    setUploading(true);
    setUploadProgress(0);

    const previewUrl = URL.createObjectURL(file);
    const canvas = document.createElement('canvas');
    const img = new Image();

    let compressedUrl: string;
    try {
      compressedUrl = await new Promise<string>((resolve, reject) => {
        img.onerror = () => reject(new Error('Invalid image file'));
        img.onload = async () => {
          try {
            const maxWidth = 640;
            const maxHeight = 640;
            let width = img.width;
            let height = img.height;
            if (width > height) {
              if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              throw new Error('Canvas context failed');
            }
            ctx.drawImage(img, 0, 0, width, height);
            const fileMb = file.size / 1024 / 1024;
            const quality = fileMb > 4 ? 0.5 : fileMb > 2 ? 0.6 : 0.7;
            canvas.toBlob((blob) => {
              if (!blob) {
                reject(new Error('Image compression failed'));
                return;
              }
              const storageRef = ref(storage, `products/${currentProductId}/${file.name}`);
              const uploadTask = uploadBytesResumable(storageRef, blob);
              uploadTask.on(
                'state_changed',
                (snapshot) => {
                  const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                  setUploadProgress(progress);
                  if (progress === 100) {
                    setUploadStatus('Upload complete. Finalizing...');
                  }
                },
                (err) => {
                  reject(err);
                },
                async () => {
                  try {
                    const url = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(url);
                  } catch (err) {
                    reject(err);
                  }
                }
              );
            }, 'image/webp', quality);
          } catch (innerErr) {
            reject(innerErr);
          }
        };
        img.src = previewUrl;
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setUploadStatus('');
      URL.revokeObjectURL(previewUrl);
    }
    return compressedUrl;
  };

  const saveProduct = async () => {
    setFormError("");
    setSaving(true);
    try {
      let imageUrl = image;
      if (selectedFile) {
        imageUrl = await uploadImageFile(selectedFile);
        setImage(imageUrl);
        setSelectedFile(null);
      }

      if (editingItem) {
        await Promise.resolve(onUpdateProduct({
          id: editingItem.id,
          name,
          category,
          occasion,
          size,
          price,
          image: imageUrl,
          colour,
          inStock,
          occasions: editingItem.occasions || [occasion],
          shapes: editingItem.shapes || ["Hourglass", "Pear", "Apple", "Rectangle", "Inverted Triangle"]
        }));
        setEditingItem(null);
        showToast("✓ Product updated");
      } else {
        await Promise.resolve(onAddProduct({
          id: currentProductId,
          name,
          category,
          occasion,
          size,
          price,
          image,
          colour,
          inStock
        }));
        showToast("✓ Product added to catalog");
      }

      setName("");
      setCategory("top");
      setOccasion("Casual");
      setSize("M");
      setPrice(120);
      setImage("");
      setPreviewImage(null);
      setColour("");
      setInStock(true);
      setIsDrawerOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim() || !(image.trim() || previewImage) || !colour.trim() || !price) {
      setFormError("All catalog fields including product photo are required.");
      return;
    }

    if (price < 0) {
      setFormError("Price must be a valid positive value.");
      return;
    }

    if (uploading && !image.trim()) {
      setUploadStatus("Image upload is in progress. Please wait for the photo to finish uploading before saving.");
      return;
    }

    await saveProduct();
  };

  const startEdit = (item: Product) => {
    setEditingItem(item);
    setCurrentProductId(item.id);
    setName(item.name);
    setCategory(item.category);
    setOccasion(item.occasion);
    setSize(item.size);
    setPrice(item.price);
    setImage(item.image);
    setColour(item.colour);
    setInStock(item.inStock !== false);
    setFormError("");
    setUploadError("");
    setUploadStatus("");
    setSelectedFile(null);
    setPreviewImage(null);
    setIsDrawerOpen(true);
  };

  const triggerAdd = () => {
    setEditingItem(null);
    setCurrentProductId(`prod-${Date.now()}`); // Generate stable ID for Firestore document and Storage upload path
    setName("");
    setCategory("top");
    setOccasion("Casual");
    setSize("M");
    setPrice(120);
    setImage("");
    setColour("");
    setInStock(true);
    setFormError("");
    setUploadError("");
    setIsDrawerOpen(true);
  };

  // Export Catalogue to CSV File
  const handleExportCSV = () => {
    const headers = ["Name", "Category", "Occasion", "Size", "Price", "Stock Status"];
    const rows = products.map((p) => [
      p.name,
      p.category,
      p.occasion,
      p.size,
      p.price,
      p.inStock !== false ? "In Stock" : "Out of Stock"
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Boutique_Catalogue_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("✓ Boutique catalogue exported successfully to CSV");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none relative pb-12">
      {/* Dynamic Toast Notifications */}
      {toast && (
        <div id="alert-toast" className="fixed bottom-6 right-6 bg-slate-900 text-white rounded-xl py-3.5 px-5 shadow-2xl border border-slate-800 z-50 flex items-center gap-3 animate-fade-in text-xs font-semibold uppercase tracking-wider font-outfit">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Admin Header Bar */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 md:px-12 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#5a005a]/5 rounded-xl border border-[#5a005a]/10">
            <Tag className="w-6 h-6 text-[#5a005a]" />
          </div>
          <div>
            <h1 className="font-playfair text-2.5xl font-bold text-slate-900">Boutique Catalogue</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide">ROLE: STORE OWNER ({currentUser.fullName})</p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={handleExportCSV}
            title="Download collection list as CSV"
            className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 py-2.5 px-4 rounded-xl font-outfit text-xs font-semibold uppercase tracking-wider shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export CSV
          </button>

          <button
            onClick={triggerAdd}
            className="flex items-center gap-2 bg-[#5a005a] text-white py-2.5 px-5 rounded-xl font-outfit text-xs font-semibold uppercase tracking-wider shadow-md hover:bg-[#430043] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Garment
          </button>

          <button
            onClick={onLogout}
            title="Log out of owner interface"
            className="p-2.5 text-slate-400 hover:text-accent hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Tab Navigation subheader bar */}
      <div className="bg-white border-b border-slate-200 px-6 md:px-12 py-3 flex gap-4 shrink-0 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab("catalogue")}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "catalogue"
              ? "bg-[#5a005a]/5 text-[#5a005a] border border-[#5a005a]/10"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          <Tag className="w-4 h-4" />
          Garment Inventory
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "analytics"
              ? "bg-[#5a005a]/5 text-[#5a005a] border border-[#5a005a]/10"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Sales & Analytics Dashboard
        </button>
      </div>

      {/* Main Stats and Listing Area */}
      <main className="flex-grow p-6 md:p-12 max-w-7xl mx-auto w-full">
        {activeTab === "catalogue" ? (
          <>
            {/* Quick Insights Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Apparel</span>
              <span className="font-outfit text-3xl font-bold text-slate-800">{products.length}</span>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl">
              <Tag className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Wedding Gala</span>
              <span className="font-outfit text-3xl font-bold text-slate-800">
                {products.filter(p => p.occasion === "Wedding").length}
              </span>
            </div>
            <div className="p-3 bg-pink-50 text-pink-500 rounded-xl">
              <Heart className="w-5 h-5 fill-pink-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 font-sans">Avg Valuation</span>
              <span className="font-outfit text-3xl font-bold text-slate-800">
                ${products.length > 0 ? Math.round(products.reduce((acc, p) => acc + p.price, 0) / products.length) : 0}
              </span>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Categories</span>
              <span className="font-outfit text-3xl font-bold text-slate-800">4</span>
            </div>
            <div className="p-3 bg-violet-50 text-violet-500 rounded-xl">
              <PlusCircle className="w-5 h-5" />
            </div>
          </div>

          {/* New Low Stock Indicator card */}
          <div id="analytics-low-stock" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Low Stock / OOS</span>
              <span className="font-outfit text-3xl font-bold text-rose-600">
                {products.filter(p => p.inStock === false).length}
              </span>
            </div>
            <div className="p-3 bg-rose-50 text-rose-500 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-wrap items-center gap-3">
          <div className="flex-grow min-w-[200px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 pl-10 pr-4 py-2.5 rounded-xl border border-slate-250 focus:border-[#5a005a] outline-none text-xs text-slate-800 font-medium placeholder-slate-400 transition-colors"
            />
          </div>
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-[#5a005a] transition-all"
            >
              <option value="all">Categories: All</option>
              <option value="top">Tops & Outerwear</option>
              <option value="bottom">Bottoms & Skirts</option>
              <option value="footwear">Footwear</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>
          <div>
            <select
              value={filterOccasion}
              onChange={(e) => setFilterOccasion(e.target.value)}
              className="bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-[#5a005a] transition-all"
            >
              <option value="all">Occasions: All</option>
              <option value="Casual">Casual Fits</option>
              <option value="Formal">Formal Occasion</option>
              <option value="Wedding">Wedding & Banquet</option>
              <option value="Party">Party Glamour</option>
              <option value="Interview">Professional Interview</option>
            </select>
          </div>
          <div>
            <select
              value={filterSize}
              onChange={(e) => setFilterSize(e.target.value)}
              className="bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-[#5a005a] transition-all"
            >
              <option value="all">Sizes: All</option>
              <option value="S">Small (S)</option>
              <option value="M">Medium (M)</option>
              <option value="L">Large (L)</option>
              <option value="XL">Extra Large (XL)</option>
              <option value="OS">One Size (OS)</option>
            </select>
          </div>
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-[#5a005a] transition-all"
            >
              <option value="date-added">Sort: Date Added</option>
              <option value="price-asc">Sort: Price ↑</option>
              <option value="price-desc">Sort: Price ↓</option>
              <option value="name-asc">Sort: Name (A-Z)</option>
              <option value="name-desc">Sort: Name (Z-A)</option>
            </select>
          </div>
        </div>

        {/* Catalog Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <h2 className="font-playfair text-lg font-bold text-slate-900">Current Collection Listing</h2>
              {selectedIds.length > 0 && (
                <button
                  onClick={() => setShowBulkDeleteConfirm(true)}
                  className="flex items-center gap-1.5 bg-rose-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold font-outfit uppercase tracking-wider hover:bg-rose-700 hover:scale-101 active:scale-98 transition-all shadow-sm cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Selected ({selectedIds.length})
                </button>
              )}
            </div>
            <span className="text-xs text-slate-400 font-medium">Manage digital try-on items live on user dashboards</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-outfit uppercase tracking-widest text-[#73636f]">
                  {/* Select All Checkbox */}
                  <th className="py-4 px-6 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={processedProducts.length > 0 && selectedIds.length === processedProducts.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(processedProducts.map(p => p.id));
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                      className="rounded border-slate-300 text-[#5a005a] focus:ring-[#5a005a] w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="py-4 px-4">Product Item</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Occasion Target</th>
                  <th className="py-4 px-4">Tag Size</th>
                  <th className="py-4 px-4 text-center">Stock Status</th>
                  <th className="py-4 px-4 text-right">Price</th>
                  <th className="py-4 px-6 text-center">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {processedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-light">
                      No items matching your filter options. Click &apos;Add Garment&apos; to register new items.
                    </td>
                  </tr>
                ) : (
                  processedProducts.map((item) => (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-50/50 transition-all ${
                        item.inStock === false ? "opacity-50 grayscale-[10%] bg-slate-50/30" : ""
                      }`}
                    >
                      {/* Checkbox on each Row */}
                      <td className="py-4 px-6 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds((prev) => [...prev, item.id]);
                            } else {
                              setSelectedIds((prev) => prev.filter((id) => id !== item.id));
                            }
                          }}
                          className="rounded border-slate-300 text-[#5a005a] focus:ring-[#5a005a] w-4 h-4 cursor-pointer"
                        />
                      </td>

                      {/* Product display */}
                      <td className="py-4 px-4 flex items-center gap-4">
                        <div className="w-12 h-14 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover animate-fade-in" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <p className={`font-semibold text-slate-900 leading-snug ${item.inStock === false ? "line-through text-slate-400" : ""}`}>{item.name}</p>
                          <p className="text-xs text-slate-500">{item.colour || "Standard"}</p>
                        </div>
                      </td>

                      <td className="py-4 px-4 capitalize">
                        <span className="inline-block py-1 px-2.5 rounded-full text-[10px] font-bold bg-slate-150 text-slate-600 uppercase tracking-wider font-outfit">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-block py-1 px-2.5 rounded-full text-[10px] font-bold bg-[#fff2f7] text-[#5a005a] uppercase tracking-wider font-outfit">
                          {item.occasion}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-outfit text-slate-700 font-bold">{item.size}</td>

                      {/* Stock Status Toggle switch on each product */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const updatedInStock = item.inStock !== false ? false : true;
                              onUpdateProduct({
                                ...item,
                                inStock: updatedInStock
                              });
                              showToast(`Product set to ${updatedInStock ? "In Stock" : "Out of Stock"}`);
                            }}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              item.inStock !== false ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                item.inStock !== false ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <span className={`text-[9px] font-extrabold uppercase tracking-wide ${
                            item.inStock !== false ? "text-emerald-600" : "text-slate-400"
                          }`}>
                            {item.inStock !== false ? "In Stock" : "Out of Stock"}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right font-semibold font-outfit text-slate-900">${item.price}</td>

                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            title="Edit this luxury listing"
                            className="p-2 text-slate-400 hover:text-[#5a005a] hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              // Open beautiful custom confirmation dialog instead of window.confirm
                              setDeleteConfirmItem(item);
                            }}
                            title="Delete this listing"
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
          </>
        ) : (
          <SalesAnalyticsDashboard products={products} />
        )}
      </main>

      {/* Slide-out Drawer Panel for Add/Edit */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-lg bg-white h-screen flex flex-col shadow-2xl relative animate-slide-in">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-playfair text-xl font-bold text-slate-900">
                  {editingItem ? "Edit Garment Registry" : "Register Luxury Garment"}
                </h3>
                <p className="text-xs text-slate-400 mt-1">Provide exact catalog options for sizing and virtual try-ons</p>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 text-slate-400 hover:text-[#5a005a] hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="m-6 mb-0 p-3 rounded-lg bg-red-50 border border-red-150 text-rose-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            {/* Form Body with standard input layouts */}
            <form onSubmit={handleSubmit} className="flex-grow p-6 overflow-y-auto space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-[10px] font-outfit uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                  Garment Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Silk Drape Satin Camisole"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#f8fafc] px-4 py-3 rounded-xl border border-slate-200 focus:border-[#5a005a] outline-none text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category Type */}
                <div>
                  <label className="block text-[10px] font-outfit uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                    Category Segment
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategoryType)}
                    className="w-full bg-[#f8fafc] px-4 py-3 rounded-xl border border-slate-200 focus:border-[#5a005a] outline-none text-sm font-semibold text-slate-700"
                  >
                    <option value="top">Top / Outerwear</option>
                    <option value="bottom">Bottom / Skirt / Trouser</option>
                    <option value="footwear">Footwear</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>

                {/* Target Ocassions */}
                <div>
                  <label className="block text-[10px] font-outfit uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                    Occasion Target
                  </label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value as OccasionType)}
                    className="w-full bg-[#f8fafc] px-4 py-3 rounded-xl border border-slate-200 focus:border-[#5a005a] outline-none text-sm font-semibold text-slate-700"
                  >
                    <option value="Casual">Casual Fits</option>
                    <option value="Formal">Formal Occasion</option>
                    <option value="Wedding">Wedding / Banquet</option>
                    <option value="Party">Party Glamour</option>
                    <option value="Interview">Professional Interview</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Fit Size */}
                <div>
                  <label className="block text-[10px] font-outfit uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                    Standard Fit Size
                  </label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full bg-[#f8fafc] px-4 py-3 rounded-xl border border-slate-200 focus:border-[#5a005a] outline-none text-sm font-semibold text-slate-700"
                  >
                    <option value="S">S (Small)</option>
                    <option value="M">M (Medium)</option>
                    <option value="L">L (Large)</option>
                    <option value="XL">XL (Extra Large)</option>
                    <option value="OS">OS (One Size Fits All)</option>
                  </select>
                </div>

                {/* Colour swatch */}
                <div>
                  <label className="block text-[10px] font-outfit uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                    Premium Colour Swatch
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bordeaux Burgundy"
                    value={colour}
                    onChange={(e) => setColour(e.target.value)}
                    className="w-full bg-[#f8fafc] px-4 py-3 rounded-xl border border-slate-200 focus:border-[#5a005a] outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Price tag */}
                <div>
                  <label className="block text-[10px] font-outfit uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                    Retail Price ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">$</span>
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="120"
                      value={price || ""}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full bg-[#f8fafc] pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#5a005a] outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                {/* Initial stock state toggler of drawer */}
                <div>
                  <label className="block text-[10px] font-outfit uppercase tracking-wider text-slate-500 font-bold mb-3">
                    Initial Stock Status
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={inStock}
                      onChange={(e) => setInStock(e.target.checked)}
                      className="rounded border-slate-300 text-[#5a005a] focus:ring-[#5a005a] w-4.5 h-4.5 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 font-semibold">Available for recommendations</span>
                  </label>
                </div>
              </div>

              {/* Photo Upload replacement area */}
              <div className="border-t border-slate-100 pt-5">
                <label className="block text-[10px] font-outfit uppercase tracking-wider text-slate-500 font-bold mb-2">
                  Garment Photo Selection
                </label>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 bg-[#5a005a]/5 text-[#5a005a] hover:bg-[#5a005a]/10 px-4 py-2.5 rounded-xl border border-[#5a005a]/25 cursor-pointer text-xs font-bold uppercase tracking-wider transition-all select-none">
                      <span>📷 Upload Photo</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          if (!e.target.files || e.target.files.length === 0) return;
                          const file = e.target.files[0];
                          setUploadError("");
                          setUploadStatus("Photo selected. Click Save to upload and save.");
                          setPreviewImage(URL.createObjectURL(file));
                          setSelectedFile(file);
                        }}
                      />
                    </label>

                    {uploading && (
                      <div className="flex flex-col gap-2 text-xs text-[#5a005a] font-semibold">
                        <div className="flex items-center gap-2">
                          <div className="w-3.5 h-3.5 border-2 border-[#5a005a] border-t-transparent rounded-full animate-spin" />
                          <span>{uploadProgress > 0 ? `Uploading file... ${uploadProgress}%` : "Compressing and uploading..."}</span>
                        </div>
                        {uploadProgress > 0 && (
                          <div className="h-2 w-full rounded-full bg-[#5a005a]/10 overflow-hidden">
                            <div className="h-full bg-[#5a005a] transition-all" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {uploadError && (
                    <p className="text-xs text-rose-600 font-bold">{uploadError}</p>
                  )}
                  {uploadStatus && !uploadError && (
                    <p className="text-xs text-slate-500 font-semibold">{uploadStatus}</p>
                  )}

                  {/* Photo Preview layout */}
                  {(previewImage || image) ? (
                    <div className="relative w-32 h-40 rounded-xl overflow-hidden border border-slate-200 mt-2 shadow-sm group">
                      <img src={previewImage ?? image} alt="Garment Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (previewImage) {
                              URL.revokeObjectURL(previewImage);
                              setPreviewImage(null);
                            }
                            setImage("");
                          }}
                          className="bg-white text-slate-700 hover:text-rose-600 p-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                          title="Remove uploaded photo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-32 h-40 rounded-xl border-2 border-dashed border-slate-200 flex flex-col justify-center items-center text-[10px] text-slate-400 font-semibold bg-slate-50 select-none">
                      <Image className="w-6 h-6 text-slate-350 mb-1" />
                      <span>No Photo Uploaded</span>
                    </div>
                  )}
                </div>
              </div>

              {/* URL Quick Presets - helpful for sandbox fallback */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150">
                <p className="text-[9px] font-outfit uppercase tracking-widest text-[#a1909e] mb-2 font-extrabold flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Or Select standard sandbox model presets
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setImage("https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600")}
                    className="text-[9px] bg-white hover:bg-[#5a005a]/5 hover:text-[#5a005a] hover:border-[#5a005a]/30 p-1.5 px-2.5 rounded-lg border border-slate-200 font-mono transition-all cursor-pointer font-bold uppercase tracking-wider"
                  >
                    Gown Style
                  </button>
                  <button
                    type="button"
                    onClick={() => setImage("https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600")}
                    className="text-[9px] bg-white hover:bg-[#5a005a]/5 hover:text-[#5a005a] hover:border-[#5a005a]/30 p-1.5 px-2.5 rounded-lg border border-slate-200 font-mono transition-all cursor-pointer font-bold uppercase tracking-wider"
                  >
                    Pleat Skirt
                  </button>
                  <button
                    type="button"
                    onClick={() => setImage("https://images.unsplash.com/photo-1548624313-0396c75e4b1a?auto=format&fit=crop&q=80&w=600")}
                    className="text-[9px] bg-white hover:bg-[#5a005a]/5 hover:text-[#5a005a] hover:border-[#5a005a]/30 p-1.5 px-2.5 rounded-lg border border-slate-200 font-mono transition-all cursor-pointer font-bold uppercase tracking-wider"
                  >
                    Satin Blazer
                  </button>
                  <button
                    type="button"
                    onClick={() => setImage("https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=600")}
                    className="text-[9px] bg-white hover:bg-[#5a005a]/5 hover:text-[#5a005a] hover:border-[#5a005a]/30 p-1.5 px-2.5 rounded-lg border border-slate-200 font-mono transition-all cursor-pointer font-bold uppercase tracking-wider"
                  >
                    Loafers Shoes
                  </button>
                </div>
              </div>

              {/* Form Save/Cancel Buttons */}
              <div className="pt-6 border-t border-slate-100 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex-1 py-3 px-4 border border-slate-200 rounded-xl text-slate-600 font-outfit text-xs font-semibold uppercase tracking-wider hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || saving}
                  className="flex-grow flex-1 py-3 px-4 bg-[#5a005a] text-white rounded-xl font-outfit text-xs font-semibold uppercase tracking-widest hover:bg-[#430043] disabled:hover:bg-[#5a005a] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4" />
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />
                      Saving...
                    </>
                  ) : (
                    editingItem ? "Update Garment" : "Save to Catalog"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. CUSTOM SINGLE-ITEM DELETE CONFIRMATION MODAL */}
      {deleteConfirmItem && (
        <div id="delete-confirmation-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative border border-slate-150 animate-scale-in">
            <h3 className="font-playfair text-lg font-bold text-slate-900 mb-2">Remove Product</h3>
            <p className="text-xs text-slate-500 mb-6 font-outfit leading-relaxed">
              Are you sure you want to remove <span className="font-black text-slate-800">&quot;{deleteConfirmItem.name}&quot;</span> from the catalog?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="flex-1 py-2.5 px-4 border border-slate-200 rounded-xl text-slate-600 font-outfit text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={async () => {
                  const tempName = deleteConfirmItem.name;
                  const targetId = deleteConfirmItem.id;
                  setDeleteConfirmItem(null);
                  try {
                    await onDeleteProduct(targetId);
                    showToast("✓ Product removed from catalog");
                    // Clear selected items state if deleted
                    setSelectedIds((prev) => prev.filter((id) => id !== targetId));
                  } catch (err: any) {
                    console.error("Deletion Failed", err);
                  }
                }}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-outfit text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK ACTIONS DELETE CONFIRMATION MODAL */}
      {showBulkDeleteConfirm && (
        <div id="bulk-delete-confirmation-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative border border-slate-150 animate-scale-in">
            <h3 className="font-playfair text-lg font-bold text-slate-900 mb-2">Bulk Delete Products</h3>
            <p className="text-xs text-slate-500 mb-6 font-outfit leading-relaxed">
              Are you sure you want to remove <span className="font-black text-rose-600">{selectedIds.length} select garment(s)</span> from the catalog? This will delete these products permanently from active lists.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="flex-1 py-2.5 px-4 border border-slate-200 rounded-xl text-slate-600 font-outfit text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const count = selectedIds.length;
                  setShowBulkDeleteConfirm(false);
                  try {
                    await Promise.all(selectedIds.map(id => onDeleteProduct(id)));
                    setSelectedIds([]);
                    showToast(`✓ Removed ${count} products from catalog`);
                  } catch (err: any) {
                    console.error("Bulk Deletion Failed", err);
                  }
                }}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-outfit text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
