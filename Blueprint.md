Technical & UX Blueprint

Codename: Atlas (MVP)

1. Architecture & Stack

Component

Technology

Justification

Mobile App

React Native (or Flutter)

Critical for startup. A single codebase for iOS & Android is the only way to move fast enough. Gives us "good enough" access to native APIs.

Backend

Firebase

Speed & Scale. We get Auth, Firestore (DB), and Cloud Functions in one. Perfect for an MVP.

Database

Firestore

Real-time & Document-based. Ideal for syncing a live, evolving journal ("Trip" and "Step" documents) to the app in real-time.

Mapping API

Mapbox

Superior Visualization. More customizable and beautiful for rendering travel paths and heatmaps than Google Maps.

POD API

Lulu / Peecho

Business Model. A Print-on-Demand API is essential. We send a PDF; they print and ship the book. We hold no inventory.

Payments

Stripe

Gold Standard. Simple, mobile-native SDKs for checkout.

2. Core Systems Breakdown

System 1: The TrackerService (The Heart)

Type: Native Background Service (invoked by React Native).

Function: This is the most critical piece of IP. It must run 24/7 during an "active trip."

Logic:

State-Based Accuracy: It doesn't just poll GPS. It uses the accelerometer.

State: Stationary (e.g., at a hotel): Switches to Significant-Change or Geofence mode. Zero GPS polling.

State: Walking/Driving: Switches to kCLLocationAccuracyBest (iOS) / PRIORITY_HIGH_ACCURACY (Android). Polls GPS frequently.

State: Flying: Detects high speed + altitude. Logs a "flight" path.

Output: Writes raw_location documents to a local, on-device database (e.g., SQLite/Realm). Batches and syncs these to Firestore when the network is available.

System 2: The CurationService (The Brain)

Type: On-Device Task (invoked by React Native).

Trigger: Runs when the app is foregrounded, or ideally, as a background task during device charging/idle.

Logic:

Queries the native photo library (PhotoKit / MediaStorage) for all photos since the last run.

For each photo, runs it through an on-device CoreML / TensorFlow Lite model.

Model 1 (Junk Filter): Assigns a score (e.g., is_junk: 0.9) to screenshots, receipts, blurry photos.

Model 2 (Quality Filter): Assigns a score (e.g., quality: 0.88) based on composition, lighting, etc.

Output: Creates photo_cluster documents in Firestore, tagging them with location and time. Does not upload photos.

System 3: The JournalingService (The Storyteller)

Type: Server-Side Firebase Cloud Function.

Trigger: Runs on a schedule (e.g., every 15 minutes) or when raw_location data is uploaded.

Logic:

Pulls all raw_location and photo_cluster data for an active_trip.

Collates: "These 50 location points + these 20 photos = one 'Step'."

Infers: Uses a 3rd-party API (like Google Places) to turn coordinates (48.8584° N, 2.2945° E) into a name ("Eiffel Tower").

Generates: Writes a new Step document to the Trip's sub-collection in Firestore.

Output: The user opens their app and, thanks to Firestore's real-time sync, "magically" sees a new, fully-formed Step appear in their timeline.

3. Core Data Models (Firestore)

// Collection: users
/users/{userId}
{
  "email": "user@email.com",
  "name": "Jane Doe",
  "created_at": "timestamp"
}

// Collection: trips
/trips/{tripId}
{
  "owner_uid": "{userId}",
  "name": "Trip to Italy",
  "start_date": "timestamp",
  "end_date": "timestamp",
  "status": "active" | "complete",
  "cover_photo_url": "..."
}

// Sub-collection: steps
/trips/{tripId}/steps/{stepId}
{
  "type": "flight" | "visit" | "transit" | "stay",
  "name": "Eiffel Tower",
  "address": "Champ de Mars, 5 Av. Anatole France...",
  "start_time": "timestamp",
  "end_time": "timestamp",
  "notes": "User's journal entry (string, can be empty)",
  "location": "GeoPoint",
  "photos": [
    {
      "native_id": "apple_photo_id_123", // On-device identifier
      "quality_score": 0.95,
      "is_featured": true
    },
    ...
  ]
}

// Collection: raw_locations (Used by backend, not client)
/raw_locations/{pointId}
{
  "owner_uid": "{userId}",
  "trip_id": "{tripId}",
  "location": "GeoPoint",
  "timestamp": "timestamp",
  "activity": "walking" | "driving" | "stationary",
  "processed": false // Flag for the Cloud Function
}


4. Core User Flows (UX)

Flow 1: The "Great Filter" Onboarding

Goal: To earn the user's trust and get the 2 critical permissions.

Screen 1: Value Prop. "The journal that writes itself." (1 button: Start)

Screen 2: Sell Location. "To build your magic map, Atlas needs your location."

Body: "We use this to detect flights, find hidden gems, and draw your path. We will never, ever sell your data."

Button: Enable Location -> [OS PROMPT: "Allow Always"]

Screen 3: Sell Photos. "Let Atlas find your best moments, automatically."

Body: "We scan your photos on your phone to filter out screenshots and add your best shots to your journal. We never upload or see your private photos."

Button: Enable Photos -> [OS PROMPT: "Allow Full Access"]

Screen 4: Home Map. (User lands here). "You're all set. Enjoy your trip!"

Flow 2: The "Book Order" Monetization

Goal: To convert a completed trip into a paid order.

Screen: TripTimeline

User finishes their trip. status is set to "complete."

A prominent Print Your Book button appears.

Screen: BookPreview (Webview)

Loads a beautiful, page-turning preview of the final book.

User can select: Hardcover / Softcover, Size.

Button: Confirm & Checkout

Screen: Checkout (Native UI)

Native form fields for Shipping Address.

Stripe PaymentSheet element for card details.

Button: Place Order

Screen: Confirmation

"Thank you! Your 'Trip to Italy' book is being printed and will ship in 5-7 days."

Flow 3: The "Magic" (The Passive Experience)

Goal: To "wow" the user with zero effort.

User: Goes to the Eiffel Tower. Takes 50 photos. Goes to dinner.

Background (TrackerService): Logs location points at Eiffel Tower and dinner. Syncs to Firestore.

Foreground (CurationService): User opens app at their hotel. App scans photos, finds the 50 Eiffel Tower shots, finds 10 dinner shots, filters the junk, and uploads the metadata (not the photos).

Backend (JournalingService): Churns on this new data.

User: Looks at their TripTimeline. Two new "Steps" have appeared: "Visit: Eiffel Tower" (with their 5 best photos) and "Dine at: [Restaurant Name]."

User's Reaction: "Wow."
