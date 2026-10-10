# Supabase setup

1. In the Supabase dashboard, create a project for this site. The Free plan is suitable for initial setup, but free projects may pause after 7 days of low activity. Choose the region close to users in Indonesia (Southeast Asia / Singapore); moving regions later requires a new project and migration. Set a strong database password and keep it private; the website does not need it.
2. In **Project Connect**, copy the Project URL and the **publishable key**. Do not use a secret/service-role key in the website.
3. Copy `.env.example` to `.env.local` and fill `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Restart `npm run dev` after saving.
4. In **SQL Editor**, run `supabase/schema.sql` to create profiles, contact-field autofill, and the protected user/owner role.
5. Create the owner account through `/masuk`, then run the final `update` query in `supabase/schema.sql` with the owner email. Owner accounts cannot grant themselves owner access.
6. Run `supabase/catalog.sql` in **SQL Editor** to create the editable service catalog, testimonials, media bucket, and owner-only policies. This migration is already applied to the connected Homecare project.
7. In **Authentication → URL Configuration**, add `http://localhost:3000/auth/callback` to the allowed redirect URLs for local development.

Reservations remain available without an account. A signed-in user can load their name and WhatsApp number from their private profile. The owner role is checked against the database and cannot be selected during public registration. Owners can manage service categories, prices, descriptions, images, videos, and published testimonials from `/owner`.
