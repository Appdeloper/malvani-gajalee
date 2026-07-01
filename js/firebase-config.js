// Firebase Config & Real-time Database Service
// ------------------------------------------------------------

// Load config from window.env or fallback to template
const firebaseConfig = {
  apiKey: window.env?.apiKey || "YOUR_API_KEY",
  authDomain: window.env?.authDomain || "YOUR_AUTH_DOMAIN",
  projectId: window.env?.projectId || "YOUR_PROJECT_ID",
  storageBucket: window.env?.storageBucket || "YOUR_STORAGE_BUCKET",
  messagingSenderId: window.env?.messagingSenderId || "YOUR_MESSAGING_SENDER_ID",
  appId: window.env?.appId || "YOUR_APP_ID"
};

// Check if actual config is provided. If not, fallback to LocalStorage Mock
const isMockMode = 
  firebaseConfig.apiKey === "YOUR_API_KEY" || 
  firebaseConfig.apiKey === "" ||
  typeof firebase === 'undefined';

let db;
let auth;

if (!isMockMode) {
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    // Enable authentication
    auth = firebase.auth();
    console.log("Firebase & Firestore initialized successfully.");
  } catch (error) {
    console.warn("Failed to initialize Firebase, falling back to Mock database:", error);
  }
}

// ==========================================
// SEED DATA FOR FIRST-TIME SETUP
// ==========================================
const seedCategories = [
  { id: "soups", name: "Soups & Shorba", sortOrder: 1 },
  { id: "starters-veg", name: "Starters – Veg", sortOrder: 2 },
  { id: "starters-nonveg", name: "Starters – Non-Veg", sortOrder: 3 },
  { id: "tandoor", name: "Tandoor", sortOrder: 4 },
  { id: "malvani", name: "Malvani Specials", sortOrder: 5 },
  { id: "main-veg", name: "Main Course – Veg", sortOrder: 6 },
  { id: "main-nonveg", name: "Main Course – Non-Veg", sortOrder: 7 },
  { id: "chinese", name: "Chinese", sortOrder: 8 },
  { id: "rice-biryani", name: "Rice & Biryani", sortOrder: 9 },
  { id: "breads", name: "Breads", sortOrder: 10 },
  { id: "beverages", name: "Beverages & Mocktails", sortOrder: 11 },
  { id: "desserts", name: "Desserts", sortOrder: 12 }
];

const seedMenuItems = [
  {
    id: "dish-1",
    name: "Crispy Paneer Papdi",
    category: "starters-veg",
    description: "Paneer batons coated in crushed papad & poha, deep-fried golden and crisp, served with mint chutney.",
    imageUrl: "images/paneer-papdi.jpg",
    isVeg: true,
    spiceLevel: "mild",
    tags: ["Chef's Special"],
    isAvailable: true,
    sortOrder: 1
  },
  {
    id: "dish-2",
    name: "Paneer Kurcharan",
    category: "starters-veg",
    description: "Shredded paneer tossed in a spicy onion-tomato masala, semi-dry, finished with herbs over onion rings.",
    imageUrl: "images/kurcharan.jpg",
    isVeg: true,
    spiceLevel: "medium",
    tags: [],
    isAvailable: true,
    sortOrder: 2
  },
  {
    id: "dish-3",
    name: "Murgh Gilafee",
    category: "starters-nonveg",
    description: "Char-grilled minced chicken seekh studded with colourful bell peppers and onion.",
    imageUrl: "images/gilafee.jpg",
    isVeg: false,
    spiceLevel: "medium",
    tags: ["Bestseller"],
    isAvailable: true,
    sortOrder: 3
  },
  {
    id: "dish-4",
    name: "Murgh Badami Shorba",
    category: "soups",
    description: "Velvety almond-based chicken soup, lightly spiced and creamy.",
    imageUrl: "images/shorba.jpg",
    isVeg: false,
    spiceLevel: "mild",
    tags: [],
    isAvailable: true,
    sortOrder: 4
  },
  {
    id: "dish-5",
    name: "Fruit Punch",
    category: "beverages",
    description: "Chilled blended mixed-fruit mocktail, served tall.",
    imageUrl: "images/fruit-punch.jpg",
    isVeg: true,
    spiceLevel: "mild",
    tags: ["Chef's Special"],
    isAvailable: true,
    sortOrder: 5
  }
];

const seedTables = [
  { id: "T1", tableNumber: "T1", capacity: 2, seatingType: "AC", isActive: true },
  { id: "T2", tableNumber: "T2", capacity: 2, seatingType: "Non-AC", isActive: true },
  { id: "T3", tableNumber: "T3", capacity: 4, seatingType: "AC", isActive: true },
  { id: "T4", tableNumber: "T4", capacity: 4, seatingType: "Indoor", isActive: true },
  { id: "T5", tableNumber: "T5", capacity: 6, seatingType: "Outdoor", isActive: true },
  { id: "T6", tableNumber: "T6", capacity: 6, seatingType: "AC", isActive: true },
  { id: "T7", tableNumber: "T7", capacity: 8, seatingType: "Indoor", isActive: true },
  { id: "T8", tableNumber: "T8", capacity: 8, seatingType: "Outdoor", isActive: true }
];

// Helper to seed Firestore if empty
async function seedFirestoreIfEmpty() {
  if (isMockMode || !db) return;
  try {
    const menuSnap = await db.collection("menuItems").limit(1).get();
    if (menuSnap.empty) {
      console.log("Seeding menuItems...");
      for (const item of seedMenuItems) {
        await db.collection("menuItems").doc(item.id).set(item);
      }
    }
    const catSnap = await db.collection("categories").limit(1).get();
    if (catSnap.empty) {
      console.log("Seeding categories...");
      for (const cat of seedCategories) {
        await db.collection("categories").doc(cat.id).set(cat);
      }
    }
    const tableSnap = await db.collection("tables").limit(1).get();
    if (tableSnap.empty) {
      console.log("Seeding tables...");
      for (const table of seedTables) {
        await db.collection("tables").doc(table.id).set(table);
      }
    }
  } catch (error) {
    console.error("Error seeding Firestore:", error);
  }
}

// Seed on startup
if (!isMockMode) {
  seedFirestoreIfEmpty();
} else {
  // Setup LocalStorage seed data
  let localItems = null;
  try {
    localItems = JSON.parse(localStorage.getItem("mg_menu_items"));
  } catch (e) {}

  const needsUpgrade = !localItems || localItems.some(item => {
    if (item.id === "dish-1" && item.imageUrl === "images/kurkuri.jpg") return true;
    if (item.id === "dish-2" && item.imageUrl === "images/kurkuri.jpg") return true;
    if (item.id === "dish-3" && item.imageUrl === "images/tandoori.jpg") return true;
    if (item.id === "dish-4" && item.imageUrl === "images/curry.jpg") return true;
    if (item.id === "dish-5" && item.imageUrl === "images/dishes.jpg") return true;
    return false;
  });

  if (needsUpgrade) {
    localStorage.setItem("mg_menu_items", JSON.stringify(seedMenuItems));
  }
  if (!localStorage.getItem("mg_categories")) {
    localStorage.setItem("mg_categories", JSON.stringify(seedCategories));
  }
  if (!localStorage.getItem("mg_tables")) {
    localStorage.setItem("mg_tables", JSON.stringify(seedTables));
  }
}

// ==========================================
// UNIFIED DATABASE SERVICE
// ==========================================
window.dbService = {
  isMock: isMockMode,

  // --- AUTH SERVICE ---
  signIn: async function(email, password) {
    if (!isMockMode && auth) {
      return await auth.signInWithEmailAndPassword(email, password);
    } else {
      // Mock Auth check
      if (email === "admin@gajalee.com" && password === "admin1098") {
        sessionStorage.setItem("mg_authenticated", "true");
        return { user: { email: "admin@gajalee.com" } };
      } else {
        throw new Error("Invalid credentials.");
      }
    }
  },

  signOut: async function() {
    if (!isMockMode && auth) {
      await auth.signOut();
    }
    sessionStorage.removeItem("mg_authenticated");
  },

  onAuthStateChanged: function(callback) {
    if (!isMockMode && auth) {
      return auth.onAuthStateChanged(callback);
    } else {
      const check = () => {
        const authed = sessionStorage.getItem("mg_authenticated") === "true";
        callback(authed ? { email: "admin@gajalee.com" } : null);
      };
      window.addEventListener("storage", check);
      check();
      return () => window.removeEventListener("storage", check);
    }
  },

  // --- MENU MANAGEMENT ---
  getMenu: async function() {
    if (!isMockMode && db) {
      const snap = await db.collection("menuItems").orderBy("sortOrder").get();
      const items = [];
      snap.forEach(doc => items.push(doc.data()));
      return items;
    } else {
      return JSON.parse(localStorage.getItem("mg_menu_items") || "[]");
    }
  },

  getCategories: async function() {
    if (!isMockMode && db) {
      const snap = await db.collection("categories").orderBy("sortOrder").get();
      const cats = [];
      snap.forEach(doc => cats.push(doc.data()));
      return cats;
    } else {
      return JSON.parse(localStorage.getItem("mg_categories") || "[]");
    }
  },

  updateMenuItem: async function(itemId, updatedData) {
    if (!isMockMode && db) {
      await db.collection("menuItems").doc(itemId).update(updatedData);
    } else {
      const items = JSON.parse(localStorage.getItem("mg_menu_items") || "[]");
      const idx = items.findIndex(item => item.id === itemId);
      if (idx !== -1) {
        items[idx] = { ...items[idx], ...updatedData };
        localStorage.setItem("mg_menu_items", JSON.stringify(items));
        window.dispatchEvent(new Event("storage"));
      }
    }
  },

  addMenuItem: async function(item) {
    const id = "dish-" + Date.now();
    const newItem = { id, ...item, isAvailable: true, sortOrder: Date.now() };
    if (!isMockMode && db) {
      await db.collection("menuItems").doc(id).set(newItem);
    } else {
      const items = JSON.parse(localStorage.getItem("mg_menu_items") || "[]");
      items.push(newItem);
      localStorage.setItem("mg_menu_items", JSON.stringify(items));
      window.dispatchEvent(new Event("storage"));
    }
    return id;
  },

  deleteMenuItem: async function(itemId) {
    if (!isMockMode && db) {
      await db.collection("menuItems").doc(itemId).delete();
    } else {
      const items = JSON.parse(localStorage.getItem("mg_menu_items") || "[]");
      const filtered = items.filter(item => item.id !== itemId);
      localStorage.setItem("mg_menu_items", JSON.stringify(filtered));
      window.dispatchEvent(new Event("storage"));
    }
  },

  // --- TABLES SERVICE ---
  getTables: async function() {
    if (!isMockMode && db) {
      const snap = await db.collection("tables").get();
      const tables = [];
      snap.forEach(doc => tables.push(doc.data()));
      return tables;
    } else {
      return JSON.parse(localStorage.getItem("mg_tables") || "[]");
    }
  },

  addTable: async function(table) {
    const id = table.tableNumber;
    const newTable = { id, ...table, isActive: true };
    if (!isMockMode && db) {
      await db.collection("tables").doc(id).set(newTable);
    } else {
      const tables = JSON.parse(localStorage.getItem("mg_tables") || "[]");
      tables.push(newTable);
      localStorage.setItem("mg_tables", JSON.stringify(tables));
      window.dispatchEvent(new Event("storage"));
    }
    return id;
  },

  updateTable: async function(tableId, data) {
    if (!isMockMode && db) {
      await db.collection("tables").doc(tableId).update(data);
    } else {
      const tables = JSON.parse(localStorage.getItem("mg_tables") || "[]");
      const idx = tables.findIndex(t => t.id === tableId);
      if (idx !== -1) {
        tables[idx] = { ...tables[idx], ...data };
        localStorage.setItem("mg_tables", JSON.stringify(tables));
        window.dispatchEvent(new Event("storage"));
      }
    }
  },

  deleteTable: async function(tableId) {
    if (!isMockMode && db) {
      await db.collection("tables").doc(tableId).delete();
    } else {
      const tables = JSON.parse(localStorage.getItem("mg_tables") || "[]");
      const filtered = tables.filter(t => t.id !== tableId);
      localStorage.setItem("mg_tables", JSON.stringify(filtered));
      window.dispatchEvent(new Event("storage"));
    }
  },

  // --- AVAILABILITY LOGIC ---
  checkSlotAvailability: async function(date, slot, partySize) {
    // 1. Fetch all tables
    const tables = await this.getTables();
    const activeTables = tables.filter(t => t.isActive);
    
    // Sum total capacity of active tables
    const totalCapacity = activeTables.reduce((acc, t) => acc + t.capacity, 0);

    // 2. Fetch all confirmed reservations for date and slot
    let confirmedReservations = [];
    if (!isMockMode && db) {
      const snap = await db.collection("reservations")
        .where("date", "==", date)
        .where("slot", "==", slot)
        .where("status", "==", "confirmed")
        .get();
      snap.forEach(doc => confirmedReservations.push(doc.data()));
    } else {
      const allReservations = JSON.parse(localStorage.getItem("mg_bookings") || "[]");
      confirmedReservations = allReservations.filter(r => 
        r.date === date && 
        r.slot === slot && 
        (r.status === "confirmed" || r.status === "Approved") // Map "Approved" for backwards compatibility
      );
    }

    // Sum currently reserved guest count
    const reservedCapacity = confirmedReservations.reduce((acc, r) => acc + parseInt(r.partySize || r.guests || 0, 10), 0);

    // Check if adding partySize exceeds total capacity
    const isAvailable = (reservedCapacity + parseInt(partySize, 10)) <= totalCapacity;

    return {
      available: isAvailable,
      remainingCapacity: totalCapacity - reservedCapacity,
      totalCapacity: totalCapacity
    };
  },

  // --- RESERVATIONS SERVICE ---
  addReservation: async function(reservation) {
    const reservationId = "MG-R-" + Date.now().toString().slice(-6) + "-" + Math.floor(100 + Math.random() * 900);
    const reservationData = {
      id: reservationId,
      reservationRef: reservationId,
      customerName: reservation.customerName || reservation.name,
      customerPhone: reservation.customerPhone || reservation.phone,
      date: reservation.date,
      slot: reservation.slot || reservation.time,
      partySize: parseInt(reservation.partySize || reservation.guests || 3, 10),
      seatingPreference: reservation.seatingPreference || "Indoor",
      specialRequest: reservation.specialRequest || reservation.notes || "",
      linkedOrderId: reservation.linkedOrderId || null,
      assignedTableId: null,
      status: "pending", // pending, confirmed, seated, completed, cancelled
      createdAt: new Date().toISOString()
    };

    if (!isMockMode && db) {
      await db.collection("reservations").doc(reservationId).set(reservationData);
    } else {
      // Mock Storage implementation
      const reservations = JSON.parse(localStorage.getItem("mg_bookings") || "[]");
      
      // Also map fields for backward compatibility with old script
      const legacyReservationData = {
        ...reservationData,
        name: reservationData.customerName,
        phone: reservationData.customerPhone,
        guests: reservationData.partySize.toString(),
        time: reservationData.slot,
        notes: reservationData.specialRequest || "None",
        status: "Pending" // Capitalized status for legacy admin.html
      };

      reservations.push(legacyReservationData);
      localStorage.setItem("mg_bookings", JSON.stringify(reservations));
      window.dispatchEvent(new Event("storage"));
    }
    return reservationId;
  },

  getReservation: async function(reservationId) {
    if (!isMockMode && db) {
      const doc = await db.collection("reservations").doc(reservationId).get();
      return doc.exists ? doc.data() : null;
    } else {
      const reservations = JSON.parse(localStorage.getItem("mg_bookings") || "[]");
      return reservations.find(r => r.id === reservationId || r.reservationRef === reservationId) || null;
    }
  },

  onReservationUpdate: function(reservationId, callback) {
    if (!isMockMode && db) {
      return db.collection("reservations").doc(reservationId).onSnapshot(doc => {
        if (doc.exists) callback(doc.data());
      });
    } else {
      const handler = () => {
        const reservations = JSON.parse(localStorage.getItem("mg_bookings") || "[]");
        const found = reservations.find(r => r.id === reservationId || r.reservationRef === reservationId);
        if (found) callback(found);
      };
      window.addEventListener("storage", handler);
      handler();
      return () => window.removeEventListener("storage", handler);
    }
  },

  onAllReservations: function(callback) {
    if (!isMockMode && db) {
      return db.collection("reservations").orderBy("createdAt", "desc").onSnapshot(snapshot => {
        const res = [];
        snapshot.forEach(doc => res.push(doc.data()));
        callback(res);
      });
    } else {
      const handler = () => {
        const reservations = JSON.parse(localStorage.getItem("mg_bookings") || "[]");
        reservations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        callback(reservations);
      };
      window.addEventListener("storage", handler);
      handler();
      return () => window.removeEventListener("storage", handler);
    }
  },

  updateReservationStatus: async function(reservationId, status) {
    const fieldsToUpdate = { status: status };
    if (!isMockMode && db) {
      await db.collection("reservations").doc(reservationId).update(fieldsToUpdate);
    } else {
      const reservations = JSON.parse(localStorage.getItem("mg_bookings") || "[]");
      const idx = reservations.findIndex(r => r.id === reservationId);
      if (idx !== -1) {
        // Map status for legacy support
        let legacyStatus = status;
        if (status === "confirmed") legacyStatus = "Approved";
        if (status === "cancelled") legacyStatus = "Disapproved";
        if (status === "pending") legacyStatus = "Pending";

        reservations[idx].status = legacyStatus;
        localStorage.setItem("mg_bookings", JSON.stringify(reservations));
        window.dispatchEvent(new Event("storage"));
      }
    }
  },

  assignTableToReservation: async function(reservationId, tableId) {
    if (!isMockMode && db) {
      await db.collection("reservations").doc(reservationId).update({ assignedTableId: tableId });
    } else {
      const reservations = JSON.parse(localStorage.getItem("mg_bookings") || "[]");
      const idx = reservations.findIndex(r => r.id === reservationId);
      if (idx !== -1) {
        reservations[idx].assignedTableId = tableId;
        localStorage.setItem("mg_bookings", JSON.stringify(reservations));
        window.dispatchEvent(new Event("storage"));
      }
    }
  },

  // --- ORDERS SERVICE ---
  addOrder: async function(order) {
    const orderId = "MG-O-" + Date.now().toString().slice(-6) + "-" + Math.floor(100 + Math.random() * 900);
    const orderData = {
      id: orderId,
      orderNumber: orderId,
      mode: order.mode, // dine-in, takeaway
      items: order.items, // Array of { itemId, name, qty }
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      scheduledDate: order.scheduledDate,
      scheduledSlot: order.scheduledSlot,
      seatingPreference: order.seatingPreference || null,
      specialRequest: order.specialRequest || "",
      reservationId: order.reservationId || null,
      status: "new", // new, preparing, ready, completed, cancelled
      paymentMode: "pay_at_restaurant",
      createdAt: new Date().toISOString()
    };

    if (!isMockMode && db) {
      await db.collection("orders").doc(orderId).set(orderData);
    } else {
      const orders = JSON.parse(localStorage.getItem("mg_orders") || "[]");
      orders.push(orderData);
      localStorage.setItem("mg_orders", JSON.stringify(orders));
      window.dispatchEvent(new Event("storage"));
    }
    return orderId;
  },

  getOrder: async function(orderId) {
    if (!isMockMode && db) {
      const doc = await db.collection("orders").doc(orderId).get();
      return doc.exists ? doc.data() : null;
    } else {
      const orders = JSON.parse(localStorage.getItem("mg_orders") || "[]");
      return orders.find(o => o.id === orderId || o.orderNumber === orderId) || null;
    }
  },

  onOrderUpdate: function(orderId, callback) {
    if (!isMockMode && db) {
      return db.collection("orders").doc(orderId).onSnapshot(doc => {
        if (doc.exists) callback(doc.data());
      });
    } else {
      const handler = () => {
        const orders = JSON.parse(localStorage.getItem("mg_orders") || "[]");
        const found = orders.find(o => o.id === orderId || o.orderNumber === orderId);
        if (found) callback(found);
      };
      window.addEventListener("storage", handler);
      handler();
      return () => window.removeEventListener("storage", handler);
    }
  },

  onLiveOrders: function(callback) {
    if (!isMockMode && db) {
      return db.collection("orders").orderBy("createdAt", "desc").onSnapshot(snapshot => {
        const orders = [];
        snapshot.forEach(doc => orders.push(doc.data()));
        callback(orders);
      });
    } else {
      const handler = () => {
        const orders = JSON.parse(localStorage.getItem("mg_orders") || "[]");
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        callback(orders);
      };
      window.addEventListener("storage", handler);
      handler();
      return () => window.removeEventListener("storage", handler);
    }
  },

  updateOrderStatus: async function(orderId, status) {
    if (!isMockMode && db) {
      await db.collection("orders").doc(orderId).update({ status: status });
    } else {
      const orders = JSON.parse(localStorage.getItem("mg_orders") || "[]");
      const idx = orders.findIndex(o => o.id === orderId);
      if (idx !== -1) {
        orders[idx].status = status;
        localStorage.setItem("mg_orders", JSON.stringify(orders));
        window.dispatchEvent(new Event("storage"));
      }
    }
  },

  linkOrderAndReservation: async function(orderId, reservationId) {
    if (!isMockMode && db) {
      const batch = db.batch();
      batch.update(db.collection("orders").doc(orderId), { reservationId: reservationId });
      batch.update(db.collection("reservations").doc(reservationId), { linkedOrderId: orderId });
      await batch.commit();
    } else {
      const orders = JSON.parse(localStorage.getItem("mg_orders") || "[]");
      const reservations = JSON.parse(localStorage.getItem("mg_bookings") || "[]");
      
      const oIdx = orders.findIndex(o => o.id === orderId);
      const rIdx = reservations.findIndex(r => r.id === reservationId);

      if (oIdx !== -1) orders[oIdx].reservationId = reservationId;
      if (rIdx !== -1) reservations[rIdx].linkedOrderId = orderId;

      localStorage.setItem("mg_orders", JSON.stringify(orders));
      localStorage.setItem("mg_bookings", JSON.stringify(reservations));
      window.dispatchEvent(new Event("storage"));
    }
  }
};
