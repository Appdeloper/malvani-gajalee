// Firebase Config & Real-time Database Service
// ------------------------------------------------------------
// Swap this placeholder config with your actual Firebase config keys.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Check if actual config is provided. If not, fallback to LocalStorage Mock
const isMockMode = firebaseConfig.apiKey === "YOUR_API_KEY" || typeof firebase === 'undefined';

let db;
if (!isMockMode) {
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log("Firebase initialized successfully.");
  } catch (error) {
    console.warn("Failed to initialize Firebase, falling back to Mock database:", error);
  }
}

// ==========================================
// Database Service Interface (Syncs real-time)
// ==========================================
window.dbService = {
  addBooking: async function(booking) {
    const bookingId = "MG-" + Math.floor(1000 + Math.random() * 9000);
    const bookingData = {
      id: bookingId,
      name: booking.name,
      phone: booking.phone,
      guests: booking.guests,
      date: booking.date,
      time: booking.time,
      notes: booking.notes || "None",
      status: "Pending", // Pending, Approved, Disapproved
      createdAt: new Date().toISOString()
    };

    if (!isMockMode && db) {
      await db.collection("reservations").doc(bookingId).set(bookingData);
    } else {
      // Mock Storage implementation
      const bookings = JSON.parse(localStorage.getItem("mg_bookings") || "[]");
      bookings.push(bookingData);
      localStorage.setItem("mg_bookings", JSON.stringify(bookings));
      // Dispatch storage event to update other tabs immediately
      window.dispatchEvent(new Event("storage"));
    }
    return bookingId;
  },

  onBookingUpdate: function(bookingId, callback) {
    if (!isMockMode && db) {
      return db.collection("reservations").doc(bookingId).onSnapshot(doc => {
        if (doc.exists) callback(doc.data());
      });
    } else {
      // Mock local storage polling / storage listener
      const handler = () => {
        const bookings = JSON.parse(localStorage.getItem("mg_bookings") || "[]");
        const found = bookings.find(b => b.id === bookingId);
        if (found) callback(found);
      };
      window.addEventListener("storage", handler);
      // Run once immediately
      handler();
      // Return unsubscriber function
      return () => window.removeEventListener("storage", handler);
    }
  },

  onAllBookings: function(callback) {
    if (!isMockMode && db) {
      return db.collection("reservations").orderBy("createdAt", "desc").onSnapshot(snapshot => {
        const bookings = [];
        snapshot.forEach(doc => bookings.push(doc.data()));
        callback(bookings);
      });
    } else {
      const handler = () => {
        const bookings = JSON.parse(localStorage.getItem("mg_bookings") || "[]");
        // Sort newest first
        bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        callback(bookings);
      };
      window.addEventListener("storage", handler);
      handler();
      return () => window.removeEventListener("storage", handler);
    }
  },

  updateBookingStatus: async function(bookingId, status) {
    if (!isMockMode && db) {
      await db.collection("reservations").doc(bookingId).update({ status: status });
    } else {
      const bookings = JSON.parse(localStorage.getItem("mg_bookings") || "[]");
      const index = bookings.findIndex(b => b.id === bookingId);
      if (index !== -1) {
        bookings[index].status = status;
        localStorage.setItem("mg_bookings", JSON.stringify(bookings));
        // Dispatch local event for same-tab triggers
        window.dispatchEvent(new Event("storage"));
      }
    }
  }
};
