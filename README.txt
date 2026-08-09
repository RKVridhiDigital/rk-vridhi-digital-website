RK VRIDHI DIGITAL — UPGRADED WEBSITE (static, deploy-ready)
==========================================================

FILES
  index.html               Page 1 — Who I Am
  how-i-work.html          Page 2 — How I Work
  case-studies.html        Page 3 — Projects & Outcomes
  packages.html            Page 4 — Growth Packages (+ consultation form, #book)
  platform-solutions.html  Page 5 — Platform Solutions (YouTube / LinkedIn)
  css/style.css            Full design system (dark navy, blue gradient, glassmorphism)
  js/main.js               Nav, scroll reveal, FAQ, case expand, GA4/GTM events, form
  robots.txt, sitemap.xml, _redirects

BEFORE DEPLOYING
  1. Copy your existing images into /img:
       img/logo.jpg       (36x36 or larger, square)
       img/portrait.jpg   (professional portrait, ~480x600)
     The pages reference only these two images.
  2. Upload every file to the site root, keeping the css/, js/ and img/ folders.
  3. Old URLs (/services, /how-to-start) redirect via _redirects (Netlify/Cloudflare Pages).
     On Apache use .htaccess, on Nginx use rewrite rules with the same mapping.

ANALYTICS
  Google Tag Manager GTM-WZGCHVMJ is installed once per page (head script + body noscript).
  GA4 (G-9LQNZJBNHN) must be configured inside GTM — no separate gtag snippet is used,
  so there is no duplicate tracking.
  Events pushed to dataLayer: book_consultation, trial_package_click, package_selected,
  package_compare, whatsapp_click, call_click, email_click, contact_form_submit,
  case_study_open, faq_open, youtube_package_click, linkedin_package_click,
  external_link_click, scroll_25/50/75/90_percent.
  In GTM create a Custom Event trigger per event name and a GA4 Event tag.

CONSULTATION FORM (Python-ready)
  The form posts JSON when you set an endpoint:
      <form id="consultForm" data-endpoint="/api/consultation">
  Fields: name, business, phone, email, business_type, budget, package, challenge, message.
  A hidden honeypot field (company_website) blocks basic spam bots.
  With no endpoint set, the form falls back to a pre-filled WhatsApp message.
  Example Flask route:
      @app.post("/api/consultation")
      def consultation():
          data = request.get_json()
          ...           # store / email
          return {"ok": True}

SEO
  Unique title, meta description, canonical, Open Graph and Twitter cards per page.
  One H1 per page, semantic H2/H3, breadcrumbs.
  JSON-LD: Person, ProfessionalService, WebSite, BreadcrumbList, Service, FAQPage, CreativeWork.
  Update BASE URLs if the domain changes.
