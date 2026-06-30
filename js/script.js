/* ============================================================
   MALVANI GAJALEE — interactions
   ============================================================ */
(function () {
  "use strict";

  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  const fab = document.querySelector(".fab");

  /* ---- Sticky nav shadow + FAB visibility on scroll ---- */
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 20);
    if (fab) fab.classList.toggle("show", y > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  if (navToggle) {
    navToggle.addEventListener("click", () => nav.classList.toggle("open"));
    navLinks.addEventListener("click", (e) => {
      if (e.target.tagName === "A") nav.classList.remove("open");
    });
  }

  /* ---- Reveal on scroll ---- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // small stagger for siblings entering together
            entry.target.style.transitionDelay = Math.min(i * 60, 240) + "ms";
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ---- Reservation form & Live Tracking ---- */
  const form = document.getElementById("reserveForm");
  const note = document.getElementById("formNote");
  
  const widget = document.getElementById("bookingWidget");
  const widgetId = document.getElementById("widgetId");
  const widgetStatus = document.getElementById("widgetStatus");
  const widgetNote = document.getElementById("widgetNote");
  const widgetTick = document.getElementById("widgetTick");
  const closeWidget = document.getElementById("closeWidget");

  let activeUnsubscribe = null;

  const showWidget = (booking) => {
    if (!widget) return;
    widgetId.textContent = booking.id;
    widgetStatus.textContent = booking.status;
    
    widgetStatus.className = "status-badge";
    if (booking.status === "Pending") {
      widgetStatus.classList.add("status-badge--pending");
      widgetNote.innerHTML = "<strong>Gajali Request Received 🌊</strong><br>Chef Nilesh is checking the fresh catch — we'll confirm your table shortly!";
      if (widgetTick) widgetTick.hidden = true;
    } else if (booking.status === "Approved") {
      widgetStatus.classList.add("status-badge--approved");
      widgetNote.innerHTML = "<strong>Reservation Confirmed! ✓</strong><br>Your table is set. Chef Nilesh is preparing the hand-ground masalas. See you soon!";
      if (widgetTick) widgetTick.hidden = false;
    } else if (booking.status === "Disapproved") {
      widgetStatus.classList.add("status-badge--disapproved");
      widgetNote.innerHTML = "<strong>Reservation Declined ✗</strong><br>We are fully booked at this hour. Please call us directly or try another time.";
      if (widgetTick) widgetTick.hidden = true;
    }
    
    widget.hidden = false;
  };

  const startTracking = (bookingId) => {
    if (activeUnsubscribe) activeUnsubscribe();
    if (window.dbService) {
      activeUnsubscribe = window.dbService.onBookingUpdate(bookingId, (booking) => {
        if (booking) {
          showWidget(booking);
        }
      });
    }
  };

  if (closeWidget) {
    closeWidget.addEventListener("click", () => {
      if (widget) widget.hidden = true;
      if (activeUnsubscribe) {
        activeUnsubscribe();
        activeUnsubscribe = null;
      }
      localStorage.removeItem("mg_last_booking_id");
    });
  }

  // Check for existing booking tracking on load
  const savedBookingId = localStorage.getItem("mg_last_booking_id");
  if (savedBookingId) {
    startTracking(savedBookingId);
  }

  if (form) {
    // prevent past dates
    const dateInput = document.getElementById("date");
    if (dateInput) dateInput.min = new Date().toISOString().split("T")[0];

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const guestsSelect = document.getElementById("guests");
      const notesArea = document.getElementById("notes");
      const booking = {
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        guests: guestsSelect ? guestsSelect.value : "3",
        date: document.getElementById("date").value,
        time: document.getElementById("time").value,
        notes: notesArea ? notesArea.value : ""
      };

      try {
        if (window.dbService) {
          const bookingId = await window.dbService.addBooking(booking);
          localStorage.setItem("mg_last_booking_id", bookingId);
          startTracking(bookingId);
          
          note.hidden = false;
          note.scrollIntoView({ behavior: "smooth", block: "nearest" });
          form.reset();
          setTimeout(() => (note.hidden = true), 6000);

          // WhatsApp redirection logic
          const waMessage = `Hello Malvani Gajalee! I'd like to confirm my table reservation:\n\nBooking ID: ${bookingId}\nName: ${booking.name}\nTiming: ${booking.date} at ${booking.time}\nGuests: ${booking.guests} People\nContact Number: ${booking.phone}\nPreference: ${booking.notes || "Seafood Focus"}`;
          const encodedWa = encodeURIComponent(waMessage);
          const waUrl = `https://wa.me/919921154312?text=${encodedWa}`;
          
          // Automatically open WhatsApp in a new window after 1.5 seconds
          setTimeout(() => {
            window.open(waUrl, "_blank");
          }, 1500);
        }
      } catch (error) {
        console.error("Error creating reservation:", error);
        alert("Failed to submit reservation. Please try again.");
      }
    });
  }

  /* ---- Footer year ---- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
