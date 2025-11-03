Product Requirements Document (PRD)

Codename: Atlas

Version: 1.0 (MVP)

1. Overview

Product Name: Atlas (Working Title)
Product Goal: To be the effortless, 100% private, automated travel journal that magically transforms a user's trips into beautiful, tangible memories.
Core Concept: "Set it and forget it." The user lives their trip. The app writes the journal. The user buys the book.

2. The Problem

Travelers want a perfect, emotional record of their journeys, but the process of creating one is high-friction, and existing tools are flawed.

Problem 1: Manual Journaling Fails. Manual journaling (writing diaries, curating photo albums) is tedious and time-consuming. Most users start with good intentions but abandon the effort, leaving them with fragmented memories.

Problem 2: Digital-Only Is Chaotic. The default "camera roll" (Apple/Google Photos) is a chaotic, unsorted "data dump." It's functional for search but lacks the narrative, emotional, and curated quality of a "journal." The "Memories" they create are generic and not user-controlled.

Problem 3: Existing Tools Compromise.

Public/Social (e.g., Polarsteps): These apps are "social-first," which many users do not want. They require users to manage followers and public/private settings, and their business model is often built on user data.

Private/Tracking (e.g., "Been"): These are simple "scratch map" tools that lack the depth of a photo journal.

The "Trust Deficit": Users are (rightfully) terrified of apps tracking their "Always On" location and scanning their entire photo library.

3. The Solution

Atlas is a "privacy-first" mobile application that runs in the background, using on-device intelligence to automatically build a beautiful, chronological travel journal.

Our business model is not data. It is monetizing emotion. The app is a free tool; the revenue comes from selling high-margin, print-on-demand (POD) hardcover "Travel Books" of the user's completed journals.

4. Target Audience

Primary: "The Sentimentalist" (Age 30-60+)

Who they are: Travels 1-3 times per year (often internationally). They grew up with physical photo albums and value tangible keepsakes.

Attitude: They are not "creators." They find social media performative. They are increasingly privacy-conscious and wary of "being the product."

Need: "I want a beautiful book of my trip to Italy to put on my coffee table, but I don't have the time or skill to design one."

Secondary: "The Busy Professional" (Age 25-45)

Who they are: Travels for both work and pleasure. Their camera roll is a mess of screenshots, vacation photos, and work documents.

Attitude: Values efficiency and "magic." Loves apps that "just work."

Need: "I want to remember my big 2-week vacation, but I don't want to do any work. Just automate it and show me the result."

5. Strategic Goals & Success Metrics

North Star Metric:

Trip-to-Book Conversion Rate: (Total Books Ordered) / (Total Trips Completed). This measures our ability to convert free users into paying customers, which is our entire business.

Key Performance Indicators (KPIs) for MVP (P0):

Activation/Trust:

Onboarding Completion Rate: % of new users who grant both Always On Location and Full Photo Library permissions. This is our "Great Filter." If this is low, the product is dead.

Engagement/Magic:

Manual Intervention Rate: (Manual Steps Added) / (Total Steps). A lower percentage is better, as it proves our automation is accurate and "magical."

Retention:

Traveler Retention: D30 retention of users who have an "Active Trip." (Standard retention is a vanity metric, as users have no reason to open the app when not traveling).

6. P0 (MVP) Features

P0 - Core R&D (The "Magic" Engine)

This is the highest-priority engineering task and the core IP of the company.

1. Passive Tracking Engine:

Must run in the background with minimal battery drain.

Must be "smart" by using the accelerometer and geofencing to reduce GPS polling when the user is stationary (e.g., at a hotel) or moving fast (e.g., on a flight).

Must automatically detect transport types (flight, car, train, walk) and "dwell time" at key locations (e.g., "Visited: Louvre Museum").

2. On-Device Curation Engine:

Must scan the user's camera roll on-device (for privacy).

Must use on-device ML models to filter "junk" (screenshots, receipts, blurry photos).

Must "cluster" photos by location and time to align them with "Steps" from the Tracking Engine.

Must select the "best" photos from a cluster to feature in the journal.

P0 - User-Facing Features (The "Journal")

1. "Trust-First" Onboarding Flow:

A multi-screen flow that sells the user on why we need Always On Location and Photo Library access.

Must explicitly state: "Your data is 100% private, never sold, never seen by us."

Must have clear "fallback" screens for users who deny permission, explaining how to enable it in Settings.

2. Home "World Map" Screen:

The default home screen.

A "scratch map" visualization of all countries/states visited.

A simple list of "My Trips" (e.g., "Japan 2024," "Italy 2023").

3. "Live Trip" Timeline UI:

The main journal view.

Top: A Mapbox view showing the entire trip's path (flights, roads).

Bottom: A chronological, vertical-scrolling timeline of "Steps."

"Steps" are the auto-generated blocks (e.g., "Flight: SFO > LHR," "Visited: Tower of London," "Dined at: Dishoom").

Each Step features the AI-selected photos and an area for the user to add notes.

4. Manual Editing:

Users must be able to:

Manually add a "Step" the app missed.

Delete/Edit an auto-generated Step.

Add/Remove photos from a Step.

Edit the text notes for a Step.

5. Book Preview & Ordering Flow:

A prominent "Print My Book" button on the Trip Timeline.

Renders a beautiful, interactive "virtual book" preview of the journal.

A simple, mobile-native checkout flow (powered by Stripe) to capture payment and shipping info.

7. Future Features (Roadmap)

P1 - The "Shareable Link": A web-based, read-only version of a completed journal that a user can send to family and friends. This is our primary viral marketing loop. The page will have a "Made with Atlas" link.

P1 - AI "Storyteller": Use an LLM to automatically write 1-2 sentences of narrative prose for each "Step" (e.g., "After landing at LHR, you took a car to your hotel in Covent Garden.").

P2 - Collaborative Journals: Allow two users on the same trip (e.g., a couple) to merge their journals into a single, unified book.

P2 - "Import Past Trips": A feature to scan a user's entire photo library and retroactively build journals for trips taken before they installed the app.

8. Non-Goals (What We Are Not Building)

NO Social Feed. No followers, no following, no public profiles, no "likes," no comments.

NO Pre-Trip Planning. We are a journal (past), not a planner (future). This is a critical distinction that keeps the product focused.

NO Web or Desktop App (for MVP). The core "magic" (tracking, photo access) is intrinsically mobile. We must be mobile-first.

NO Data Monetization. We will never sell user data or use it for advertising. Our privacy policy will be our biggest marketing asset.

9. Key Risks & Assumptions

Risk 1 (Technical/High): The Tracking Engine is a failure. If it drains battery, users will delete the app. If it is inaccurate, the "automated" promise is broken.

Risk 2 (Product/High): The Onboarding fails. If users do not grant Always On Location and Photo permissions, the app is useless. We must perfect the "trust" messaging.

Risk 3 (Competitive/High): The "Good Enough" Problem. Apple and Google Photos are pre-installed and are constantly improving their "Memories" features. We must be demonstrably and magically better.

Assumption 1 (Business): We assume that a sufficient percentage of travelers who value their memories will pay a premium ($60-$100) for a physical book.
