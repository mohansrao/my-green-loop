# Project Overview: My Green Loop

## Introduction
**My Green Loop** is a sustainable rental platform designed to reduce single-use plastic waste by providing high-quality, reusable party supplies (plates, glasses, cutlery) for events. The project facilitates a circular economy by allowing users to rent eco-friendly alternatives instead of buying disposable ones. Based in Sunnyvale, CA.

## Purpose and Goals
The primary goal of the project is to make sustainable choices easier for event organizers. Key objectives include:
- Providing a seamless booking experience for eco-friendly supplies.
- Tracking environmental impact through "waste prevented" metrics (analytics).
- Managing inventory dynamically across different dates.
- Facilitating clear communication between the service and customers via automated notifications.

## Key Features

### Customer-Facing
- **Product Catalog**: Browsable list of reusable event supplies with date-based availability checking via dropdown selectors.
- **Dynamic Inventory**: Real-time stock checking and reservation based on specific event dates (max 5-day rentals).
- **Rental System**: Automated booking process with price calculation and confirmation. Dates are remembered if the customer navigates back from checkout.
- **Automated Notifications**: SMS (Twilio) and Email (Nodemailer) notifications sent to both admin and customer on order placement.
- **Feedback & Impact Tracking**: Customer feedback system with ratings, photo uploads, and usage stats feeding into public analytics.
- **Content Hub**: Curated library of sustainable living resources (articles, videos) with search, filtering, and bookmarking.
- **Community Impact**: Home page section showcasing recent rentals (anonymised) to build social proof.

### Admin Dashboard (`/admin/*`)
- **Orders**: Full order list (no limit), inline status management (pending → confirmed → completed → cancelled), order detail modal, and CSV export.
- **Inventory**: Stock level monitoring with low-stock alerts.
- **Notifications**: Order alert management.
- **Feedback Management**: Approve/hide customer feedback for public display.
- **Resources/Categories**: Manage Content Hub items and taxonomy.
- **Settings**: UI-driven configuration for admin phone, admin email, SMS toggle, email toggle, max rental days, and max sets — no code or environment variable changes needed.

## Pricing
- **$15** flat fee for up to 50 sets (plate + glass + fork + spoon).
- **$30** flat fee for 51–100 sets.
- One price covers the full rental period including pick-up and drop-off days.
