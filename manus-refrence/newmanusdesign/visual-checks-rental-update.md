# Passwordless rental journey verification

The homepage Explore action now opens the rental journey directly. The rental flow includes the supplied electric fat-tire bike image, highlighted free maintenance, helmet, gloves, GPS tracking, and lock inclusions, followed by renter details, plan selection, transfer instructions, payment proof upload, WhatsApp handoff, and pickup queue status.

The plan UI shows the requested €170 monthly option and €45-per-week option for the first month, with the checkout total adding the €50 non-refundable fee. The post-month extension rule is shown as €55 per additional week.

The login page is now passwordless: the user enters an email, receives an 8-digit OTP in the prototype flow, verifies it, and reaches the next account state without a password field.

Desktop and mobile screenshot passes completed for `/`, `/login`, and `/bikes/city-bike`. TypeScript and production build checks passed. Backend authentication, email delivery, payment processing, admin approval notifications, WhatsApp messaging, bike assignment, and pickup scheduling remain intentionally unimplemented per scope.
