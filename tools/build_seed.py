#!/usr/bin/env python3
"""
ProEase Labs - canonical sample content for the Google Sheet CMS.

This one file is the source of truth for the sample rows. Running it regenerates:
  sheets/Company_Profile.csv
  sheets/Products.csv
  sheets/Enquiries_&_Requests.csv      (headers only)
  apps-script/Seed.gs                   (used by setupSheets() to seed an empty sheet)
  assets/data/fallback.json             (offline / pre-connection content for the site)

List conventions used inside a single cell:
  " | "   separates items
  " :: "  separates parts of one item (e.g. Title :: Description)

Usage:  python3 tools/build_seed.py
"""
import csv, json, os, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# --------------------------------------------------------------------------
# TAB 1 - Company_Profile  (Key | Value | Notes)
# --------------------------------------------------------------------------
COMPANY = [
    ("brand_name", "ProEase Labs", "Shown in sidebar, footer and page titles"),
    ("brand_tagline", "Operational software for SMEs", "Small line under the brand name"),
    ("logo_url", "", "Optional image URL. Leave blank to use the built-in ProEase mark"),
    ("hero_eyebrow", "Built from real SAP floor experience", "Small label above the headline"),
    ("hero_headline", "Enterprise-grade operational discipline. Priced for SMEs.", ""),
    ("hero_subheadline", "ProEase Labs turns the procedures big companies run inside SAP — goods receiving, stock issuance, cycle counts, maker-checker approvals and audit trails — into lean software your team can run from day one. No six-month consultants. No per-seat licensing traps.", ""),
    ("hero_primary_cta", "Explore ProEase+", "Button that opens the flagship product"),
    ("hero_primary_link", "#/product/proease-plus", ""),
    ("hero_secondary_cta", "Request a Custom Build", ""),
    ("hero_secondary_link", "#/custom-build", ""),
    ("hero_trust_line", "For SMEs that have outgrown spreadsheets but don't need SAP or Oracle", ""),
    ("stats", "3-in-1 :: ERP + HRM + internal email in one database | 0 :: Per-seat email or user fees on ProEase+ | 2-layer :: Network lock + device lock security | 100% :: Of stock movements and approvals logged", "Value :: Label, separated by |"),
    ("dna_heading", "Real operational DNA, not theory", ""),
    ("dna_intro", "Every workflow in the Business Suite started as a daily procedure run inside an enterprise SAP and warehouse environment — then stripped of the bloat SMEs don't need.", ""),
    ("dna_points", "Goods Receiving :: PO-matched receipts with quantity and condition checks before stock is booked in | Stock Issuance :: Issue against a request, cost centre or staff member — never off the books | Cycle Counting :: Scheduled counts by bin or category with variance approval before adjustment | Staff Onboarding & Asset Issuance :: Uniforms, devices and tools issued and signed for, then recovered at exit | Attendance & Payroll :: Clock-ins tied to the company network, feeding leave and payroll runs | Maker-Checker Approvals :: The person who keys a transaction is never the one who approves it | Audit Trail :: Every movement stamped with user, time and device ID", "Title :: Description"),
    ("suite_heading", "Core Business Suite", ""),
    ("suite_intro", "License once, get your own dedicated database, and customise the workflows to how your business actually runs.", ""),
    ("comparison_heading", "Why SMEs choose ProEase over SAP/Oracle and spreadsheets", ""),
    ("comparison_columns", "Spreadsheets | SAP / Oracle | ProEase", "Three column headings, separated by |"),
    ("comparison_rows", "Upfront cost :: Free, but costly mistakes :: Six to seven figures with implementation :: One SME license plus database setup | Time to go live :: Immediate, but no controls :: 6–18 months with consultants :: Weeks, configured to your procedures | Per-user fees :: None :: Per-seat licensing that grows with headcount :: No per-seat fees on internal email | Stock accuracy :: Manual, easy to overwrite :: High, if fully implemented :: PO-matched receiving and approved cycle counts | Approvals & audit trail :: Email threads and screenshots :: Strong but complex :: Maker-checker approvals with an immutable log | Access security :: Anyone with the file :: Enterprise IAM projects :: Company network lock plus approved-device lock | Fit for a 10–200 person team :: Breaks as you grow :: Overbuilt :: Designed for it", "Criteria :: Spreadsheets :: SAP/Oracle :: ProEase, rows separated by |"),
    ("apps_heading", "Specialised Apps & Prototypes", ""),
    ("apps_intro", "Focused tools for education, creators and careers — plus prototypes you can see in a guided walkthrough.", ""),
    ("custom_heading", "Custom software, built on request", ""),
    ("custom_summary", "Need something the suite doesn't cover? We build bespoke internal tools, workflow automations and custom apps for SMEs — designed by someone who has run the operational process, not just coded it.", ""),
    ("custom_services", "Internal Operations Tools :: Request, approval and tracking portals that replace email chains and paper forms | Workflow Automation :: Spreadsheet, form and ERP automations that remove repetitive keying and reconciliation | Custom Web & Mobile Apps :: Staff self-service, customer portals and installable PWAs for phones and tablets | Dashboards & Reporting :: Live stock, sales, attendance and KPI views pulled from the systems you already use | Integrations & Data Migration :: Move off spreadsheets cleanly and connect accounting, e-commerce or messaging tools", "Title :: Description"),
    ("custom_process", "Discovery Call :: We walk through your current process, pain points and budget | Scope & Quote :: A written scope with fixed milestones and a clear price | Build & Review :: Working builds you can test at each milestone, adjusted to feedback | Launch & Support :: Go-live, staff handover and an agreed support period", "Step :: Description"),
    ("custom_budget_options", "Below RM 5,000 | RM 5,000 – 15,000 | RM 15,000 – 40,000 | Above RM 40,000 | Not sure yet", "Options for the budget dropdown"),
    ("custom_timeline_options", "As soon as possible | Within 1 month | 1–3 months | 3+ months | Just exploring", "Options for the timeline dropdown"),
    ("contact_email", "hello@proeaselabs.com", "REPLACE with your real email"),
    ("whatsapp_number", "60123456789", "REPLACE. Digits only with country code, no + or spaces (e.g. 60123456789)"),
    ("whatsapp_default_message", "Hi ProEase Labs, I'd like to know more about your software for my business.", ""),
    ("linkedin_url", "https://www.linkedin.com/company/proease-labs", "REPLACE with your page, or leave blank to hide"),
    ("instagram_url", "https://www.instagram.com/proeaselabs", "REPLACE or leave blank"),
    ("tiktok_url", "https://www.tiktok.com/@proeaselabs", "REPLACE or leave blank"),
    ("youtube_url", "https://www.youtube.com/@proeaselabs", "REPLACE or leave blank"),
    ("location", "Johor Bahru, Malaysia · Serving Malaysia & Singapore", ""),
    ("business_hours", "Mon–Sat, 9am–9pm (GMT+8)", ""),
    ("footer_text", "Practical, procedure-driven software for small and medium businesses.", ""),
    ("footer_legal", "© {year} ProEase Labs. All rights reserved.", "{year} is replaced automatically"),
    ("form_success_message", "Thank you — your request is in. We'll reply within one business day, usually on WhatsApp.", ""),
    ("seo_title", "ProEase Labs — SME ERP, HRM & Custom Software", "Browser tab title on the home page"),
    ("seo_description", "Enterprise-grade operational discipline built for SME budgets. ProEase ERP, HRM and the ProEase+ all-in-one suite, plus custom software on request.", ""),
]

# --------------------------------------------------------------------------
# TAB 2 - Products
# --------------------------------------------------------------------------
BASE_HEADERS = [
    "Visible", "Sort_Order", "Slug", "Product_Name", "Category", "Sidebar_Pill",
    "Tagline", "Short_Description", "Status", "Monetization_Model",
    "Icon", "Hero_Image_URL", "Accent_Color", "Value_Highlight",
    "Overview", "Why_Switch", "Customization", "Database_Security",
    "Bundle_Components", "How_It_Works", "Key_Benefits",
    "Default_Inquiry_Type", "Primary_CTA_Label", "Pricing_Note",
]
TIER_FIELDS = ["Name", "Price", "Billing", "Features", "CTA", "Checkout_URL", "Badge", "Inquiry_Type"]
MAX_TIERS = 3
PRODUCT_HEADERS = BASE_HEADERS + [f"Tier{i}_{f}" for i in range(1, MAX_TIERS + 1) for f in TIER_FIELDS]

SUITE_SECURITY = (
    "Dedicated Database Setup :: Your company gets its own database instance, set up and migrated by us — your data is never mixed with another client's | "
    "Company Network Lock :: Staff can only sign in from approved office, warehouse or store Wi-Fi public IPs, which stops off-site clock-ins and outside data access. Admins refresh the approved IP in one click when broadband changes, and Business Owners / Super Admins can bypass remotely | "
    "Approved Device Lock :: Access is bound to authorised company laptops, tablets or terminals using a cryptographic device token plus hardware fingerprint. Unrecognised personal devices stay blocked — even on company Wi-Fi — until an Admin approves them | "
    "Role-Based Access Control :: Operator, Supervisor and Owner permissions are separated, so the person who keys a transaction is not the one who approves it | "
    "Immutable Audit Trail :: Every stock movement, issuance and approval is logged with timestamp, user and device ID, and cannot be edited after the fact"
)

def tier(name="", price="", billing="", features="", cta="", url="", badge="", inq=""):
    return [name, price, billing, features, cta, url, badge, inq]

PRODUCTS = [
    dict(
        Visible="TRUE", Sort_Order=10, Slug="proease-plus", Product_Name="ProEase+",
        Category="Business Suite", Sidebar_Pill="Best Value",
        Tagline="ERP + HRM + Internal Email in one database",
        Short_Description="The flagship all-in-one suite: operations, inventory, workforce, payroll and built-in internal email — three critical systems for one SME bundle price.",
        Status="Flagship Bundle", Monetization_Model="All-in-One Bundle + DB",
        Icon="layers", Hero_Image_URL="", Accent_Color="#4f46e5",
        Value_Highlight="3-in-1 SME Suite: ERP + HRM + Built-in Internal Email — Real Operational Discipline Without SAP/Oracle Costs",
        Overview="ProEase+ combines ProEase ERP, ProEase HRM and a built-in internal email and memo system on one unified database. Goods receipts, purchase requests and leave applications don't get lost in WhatsApp groups or personal inboxes — they route straight to the right manager's @internal inbox for one-click sign-off, and every decision lands in the audit trail.",
        Why_Switch="Most SMEs run stock in one spreadsheet, attendance in another, and approvals over chat. Records drift apart, nobody can say who approved what, and month-end becomes a reconciliation exercise. ProEase+ brings the same receive–issue–count–approve discipline used in enterprise SAP environments, without the licensing bill or the consultants.",
        Customization="Approval chains, document numbering, departments, warehouses and bins, leave types, payroll items and memo templates are configured to your procedures during setup. Additional custom modules or reports can be scoped on request.",
        Database_Security=SUITE_SECURITY,
        Bundle_Components="ProEase ERP :: Operations, purchasing, goods receiving, stock issuance, cycle counts and sales | ProEase HRM :: Staff records, attendance, leave, payroll and uniform / asset issuance | Internal Email & Memos :: Database-backed @internal inboxes and department memos with zero per-seat email fees | Dual Security Locks :: Company network lock plus approved-device lock, with RBAC and an immutable audit trail",
        How_It_Works="Discovery & Configuration :: We map your receiving, issuance, approval and HR procedures and configure the suite to match | Dedicated Database Setup :: Your own database is provisioned and your item master, staff list and opening stock are migrated in | Network & Device Enrolment :: Office, warehouse and store IPs are approved and company devices are registered | Go Live :: Staff work from approved devices, and approvals flow to managers' internal inboxes for one-click sign-off",
        Key_Benefits="One Database, No Double Entry :: Stock, staff and approvals share one source of truth | Approvals in One Click :: GRNs, purchase requests and leave land in the manager's internal inbox | Zero Per-Seat Email Fees :: Internal @internal mailboxes for every staff member at no extra cost | Stock You Can Trust :: PO-matched receiving and approved cycle-count variances | Off-Site Clock-Ins Blocked :: Attendance only from approved networks and devices | Audit-Ready Every Day :: Every movement and approval traceable to a user, time and device",
        Default_Inquiry_Type="ProEase+ Bundle & DB Setup", Primary_CTA_Label="Get ProEase+",
        Pricing_Note="Sample prices — one-time license plus dedicated database setup. An optional annual support and hosting plan is quoted separately.",
        tiers=[
            tier("Starter Bundle", "RM 9,800", "One-time license + DB setup", "Up to 25 staff | 1 site (office, store or warehouse) | ERP + HRM + internal email | Network lock + device lock | Data migration from spreadsheets | 30 days post-launch support", "Request Starter Setup", "", "", "ProEase+ Bundle & DB Setup"),
            tier("Growth Bundle", "RM 16,800", "One-time license + DB setup", "Up to 75 staff | Up to 3 sites | Everything in Starter | Custom approval chains and memo templates | Payroll configuration and staff training | 90 days post-launch support", "Request Growth Setup", "", "Most Popular", "ProEase+ Bundle & DB Setup"),
            tier("Scale", "Custom quote", "License + DB setup + custom modules", "75+ staff or 4+ sites | Everything in Growth | Custom modules and reports | Integration with accounting or e-commerce | Priority support plan", "Talk to Us", "", "", "ProEase+ Bundle & DB Setup"),
        ],
    ),
    dict(
        Visible="TRUE", Sort_Order=20, Slug="proease-erp", Product_Name="ProEase ERP",
        Category="Business Suite", Sidebar_Pill="",
        Tagline="Operations, inventory and sales — run like a real warehouse",
        Short_Description="Lean, procedure-driven ERP for goods receiving, stock issuance, cycle counts, purchasing and sales.",
        Status="Production Ready", Monetization_Model="License + Custom DB",
        Icon="package", Hero_Image_URL="", Accent_Color="#0d9488",
        Value_Highlight="SAP-style receive, issue and count procedures — sized for SME teams and budgets",
        Overview="ProEase ERP covers the daily inventory loop that breaks first when a business outgrows spreadsheets: receiving goods against a purchase order, issuing stock against a request, counting regularly and approving variances before stock is adjusted. Sales, purchasing and stock levels stay in step because they come from the same transactions.",
        Why_Switch="In a spreadsheet anyone can overwrite a stock balance and nobody knows why it changed. In ProEase ERP stock only moves through a receipt, an issue, a transfer or an approved count adjustment — the same principle enterprise systems rely on.",
        Customization="Item master structure, units of measure, warehouses and bins, document numbering, approval thresholds and printable forms (GRN, issue slip, delivery order) are configured to your business.",
        Database_Security=SUITE_SECURITY,
        Bundle_Components="",
        How_It_Works="Process Mapping :: We review how you receive, store, issue and sell stock today | Database & Master Data :: Your dedicated database is set up and your items, suppliers and opening balances are loaded | Network & Device Setup :: Approved store and warehouse IPs and company devices are enrolled | Daily Operations :: Your team receives, issues and counts with every movement logged",
        Key_Benefits="PO-Matched Goods Receiving :: Receive only what was ordered, with short and damaged quantities recorded | Controlled Stock Issuance :: Every issue tied to a request, cost centre or person | Scheduled Cycle Counts :: Count by bin or category, with variances approved before adjustment | Purchasing & Sales in Sync :: Stock levels follow real transactions | Maker-Checker Approvals :: Separate keying and approval roles | Full Movement History :: Trace any balance back to the documents behind it",
        Default_Inquiry_Type="License Purchase & DB Setup", Primary_CTA_Label="Get ProEase ERP",
        Pricing_Note="Sample prices — one-time license plus dedicated database setup.",
        tiers=[
            tier("Single Site", "RM 5,900", "One-time license + DB setup", "1 warehouse or store | Receiving, issuance, cycle count | Purchasing and sales | Network lock + device lock | 30 days post-launch support", "Request License & Setup", "", "", "License Purchase & DB Setup"),
            tier("Multi-Site", "RM 9,500", "One-time license + DB setup", "Up to 3 sites with stock transfers | Everything in Single Site | Custom approval thresholds | Branded printable forms | 60 days post-launch support", "Request License & Setup", "", "Most Popular", "License Purchase & DB Setup"),
            tier("Upgrade to ProEase+", "Bundle pricing", "Add HRM + internal email", "Everything in Multi-Site | Plus ProEase HRM | Plus internal email & memos | One unified database", "See ProEase+", "#/product/proease-plus", "Best Value", "ProEase+ Bundle & DB Setup"),
        ],
    ),
    dict(
        Visible="TRUE", Sort_Order=30, Slug="proease-hrm", Product_Name="ProEase HRM",
        Category="Business Suite", Sidebar_Pill="",
        Tagline="Workforce, attendance, payroll and asset issuance",
        Short_Description="Complete HR for SMEs: staff records, network-locked attendance, leave, payroll and uniform / asset issuance.",
        Status="Production Ready", Monetization_Model="License + Custom DB",
        Icon="users", Hero_Image_URL="", Accent_Color="#0284c7",
        Value_Highlight="Attendance you can trust — clock-ins only from your company network and approved devices",
        Overview="ProEase HRM keeps people operations in one place: onboarding, staff records, attendance, leave, payroll and the uniforms, devices and tools issued to each employee. Clock-ins are tied to your premises' network, so attendance reflects who was actually on site.",
        Why_Switch="Buddy punching, leave tracked in chat, payroll rebuilt every month in a spreadsheet, and uniforms that never come back when staff resign — these are the gaps ProEase HRM closes with the same issue-and-recover discipline used for inventory.",
        Customization="Leave types and entitlements, shift patterns, overtime rules, payroll items, onboarding checklists and issuable asset categories are configured to your policies.",
        Database_Security=SUITE_SECURITY,
        Bundle_Components="",
        How_It_Works="Policy Setup :: We configure your leave, shift, overtime and payroll rules | Staff Import :: Your dedicated database is created and staff records are migrated | Network & Device Enrolment :: Clock-in points are locked to approved IPs and devices | Daily Use :: Staff clock in, apply for leave and sign for issued assets while managers approve",
        Key_Benefits="Network-Locked Attendance :: No off-site or proxy clock-ins | Leave With Approvals :: Applications routed to the right supervisor | Payroll From Real Data :: Attendance and leave feed the payroll run | Uniform & Asset Issuance :: Track what each employee holds and recover it at exit | Structured Onboarding :: Checklists so nothing is missed in week one | Role-Based Access :: Staff, supervisors and owners each see what they should",
        Default_Inquiry_Type="License Purchase & DB Setup", Primary_CTA_Label="Get ProEase HRM",
        Pricing_Note="Sample prices — one-time license plus dedicated database setup.",
        tiers=[
            tier("Team", "RM 4,500", "One-time license + DB setup", "Up to 30 staff | Attendance, leave, payroll | Uniform and asset issuance | Network lock + device lock | 30 days post-launch support", "Request License & Setup", "", "", "License Purchase & DB Setup"),
            tier("Company", "RM 7,900", "One-time license + DB setup", "Up to 100 staff | Everything in Team | Shift and overtime rules | Multi-site attendance | 60 days post-launch support", "Request License & Setup", "", "Most Popular", "License Purchase & DB Setup"),
            tier("Upgrade to ProEase+", "Bundle pricing", "Add ERP + internal email", "Everything in Company | Plus ProEase ERP | Plus internal email & memos | One unified database", "See ProEase+", "#/product/proease-plus", "Best Value", "ProEase+ Bundle & DB Setup"),
        ],
    ),
    dict(
        Visible="TRUE", Sort_Order=40, Slug="bijaktutor", Product_Name="BijakTutor",
        Category="Apps & Prototypes", Sidebar_Pill="",
        Tagline="Guided learning for primary-school students",
        Short_Description="A self-serve learning companion for young learners and their parents, available on a simple monthly or annual subscription.",
        Status="Production Ready", Monetization_Model="Monthly Subscription",
        Icon="graduation", Hero_Image_URL="", Accent_Color="#16a34a",
        Value_Highlight="Start learning today — subscribe monthly or save with an annual plan",
        Overview="BijakTutor gives primary-school children structured practice and guided explanations, with progress parents can follow. It works in the browser on phones, tablets and laptops — nothing to install.",
        Why_Switch="Worksheets and random videos don't show what a child has actually mastered. BijakTutor keeps practice structured and progress visible.",
        Customization="Schools and tuition centres can request a group plan or a branded rollout through the inquiry form.",
        Database_Security="", Bundle_Components="",
        How_It_Works="Choose a Plan :: Pick monthly or annual and complete checkout | Set Up the Learner :: Create the child's profile and level | Learn Daily :: Short guided sessions that fit around school | Track Progress :: Parents see what has been practised and mastered",
        Key_Benefits="Self-Serve Signup :: Subscribe and start in minutes | Works on Any Device :: Phone, tablet or laptop browser | Structured Practice :: Topics in a sensible order | Parent Visibility :: Clear progress at a glance",
        Default_Inquiry_Type="Subscription Inquiry", Primary_CTA_Label="Subscribe Now",
        Pricing_Note="Paste your payment links (Stripe, Billplz, ToyyibPay, etc.) into Tier Checkout_URL to enable direct checkout.",
        tiers=[
            tier("Monthly", "RM 29", "per month", "Full access for 1 learner | Cancel anytime | Progress tracking for parents", "Subscribe Monthly", "", "", "Subscription Inquiry"),
            tier("Annual", "RM 290", "per year", "Full access for 1 learner | 2 months free vs monthly | Progress tracking for parents", "Subscribe Annually", "", "Save 17%", "Subscription Inquiry"),
            tier("Schools & Centres", "Custom quote", "Group licensing", "Multiple learners and classes | Optional branded rollout | Demo for your team", "Request a Demo", "", "", "Demo Request"),
        ],
    ),
    dict(
        Visible="TRUE", Sort_Order=50, Slug="proease-studio", Product_Name="ProEase Studio",
        Category="Apps & Prototypes", Sidebar_Pill="",
        Tagline="Content production toolkit for creators and small brands",
        Short_Description="Plan, produce and organise social content in one workspace — on a monthly subscription or a one-time license.",
        Status="Production Ready", Monetization_Model="Subscription / One-Time",
        Icon="sparkles", Hero_Image_URL="", Accent_Color="#db2777",
        Value_Highlight="Pay monthly, or buy once and own your license",
        Overview="ProEase Studio helps creators and small brands keep content moving: ideas, scripts, a production checklist and a publishing calendar in one place, instead of scattered notes and chats.",
        Why_Switch="Content falls behind when ideas live in one app, scripts in another and the posting plan in your head. Studio keeps the whole pipeline visible.",
        Customization="Agencies and brands can request custom templates, team workspaces or a white-label build.",
        Database_Security="", Bundle_Components="",
        How_It_Works="Choose Monthly or One-Time :: Pick the model that suits your budget | Set Up Your Workspace :: Add your channels, formats and templates | Produce Consistently :: Move each piece from idea to published",
        Key_Benefits="Idea-to-Publish Pipeline :: Every piece tracked through each stage | Reusable Templates :: Scripts and checklists you don't rebuild | Content Calendar :: See the week and month at a glance | Flexible Licensing :: Subscribe or buy once",
        Default_Inquiry_Type="Subscription Inquiry", Primary_CTA_Label="Choose a Plan",
        Pricing_Note="",
        tiers=[
            tier("Monthly Subscription", "RM 39", "per month", "All features | Updates included | Cancel anytime", "Subscribe Monthly", "", "", "Subscription Inquiry"),
            tier("One-Time Purchase", "RM 499", "one-time license", "Lifetime license for current version | 12 months of updates | No recurring fees", "Buy One-Time License", "", "Own It", "One-Time License Purchase"),
        ],
    ),
    dict(
        Visible="TRUE", Sort_Order=60, Slug="proease-career-advisor", Product_Name="ProEase Career Advisor",
        Category="Apps & Prototypes", Sidebar_Pill="",
        Tagline="Plan your next career move with structure",
        Short_Description="Career planning, resume building and job-application tracking in one guided tool — subscribe monthly or buy once.",
        Status="Production Ready", Monetization_Model="Subscription / One-Time",
        Icon="compass", Hero_Image_URL="", Accent_Color="#ea580c",
        Value_Highlight="From career direction to tracked applications — pay monthly or once",
        Overview="ProEase Career Advisor helps working professionals and fresh graduates map where they want to go, shape their resume for it, and keep every application and follow-up organised.",
        Why_Switch="Job hunting by spreadsheet and memory means missed follow-ups and generic resumes. Career Advisor gives the process a structure.",
        Customization="Training providers and HR teams can request a branded or cohort version.",
        Database_Security="", Bundle_Components="",
        How_It_Works="Choose a Plan :: Monthly subscription or one-time purchase | Map Your Direction :: Set target roles, skills and timelines | Apply and Track :: Tailor your resume and follow every application to an outcome",
        Key_Benefits="Career Roadmap :: Clear targets and skill gaps | Resume Builder :: Tailored versions per role | Application Tracker :: Every application, interview and follow-up | Flexible Pricing :: Subscribe or buy once",
        Default_Inquiry_Type="Subscription Inquiry", Primary_CTA_Label="Choose a Plan",
        Pricing_Note="",
        tiers=[
            tier("Monthly Subscription", "RM 19", "per month", "All features | Unlimited applications tracked | Cancel anytime", "Subscribe Monthly", "", "", "Subscription Inquiry"),
            tier("One-Time Purchase", "RM 199", "one-time license", "Lifetime license for current version | 12 months of updates | No recurring fees", "Buy One-Time License", "", "Own It", "One-Time License Purchase"),
        ],
    ),
    dict(
        Visible="TRUE", Sort_Order=70, Slug="flbymuhdisa", Product_Name="FLbyMuhdIsa",
        Category="Apps & Prototypes", Sidebar_Pill="Prototype",
        Tagline="Functional prototype — see it in a guided walkthrough",
        Short_Description="A working prototype available for guided walkthroughs, early access, or a tailored production build for your business.",
        Status="Prototype", Monetization_Model="Prototype / Custom Rollout",
        Icon="flask", Hero_Image_URL="", Accent_Color="#7c3aed",
        Value_Highlight="Working prototype — request a walkthrough, early access or your own production build",
        Overview="FLbyMuhdIsa is a functional prototype built to prove a real business workflow end-to-end. It isn't on general release yet; instead we demo it live and can turn it into a production build tailored to your business.",
        Why_Switch="Seeing a working prototype is the fastest way to decide whether a tailored build fits your business — before committing to a full project.",
        Customization="Production builds can be branded and adapted to your products, workflows and customers.",
        Database_Security="", Bundle_Components="",
        How_It_Works="Request a Walkthrough :: Tell us about your business and pick a time | See It Live :: We demo the prototype and discuss your fit | Choose Your Path :: Join early access or scope a tailored production build",
        Key_Benefits="See Before You Commit :: A live, working demo | Early Access :: Be first in line when it launches | Tailored Builds :: Adapted to your brand and workflow",
        Default_Inquiry_Type="Prototype Walkthrough", Primary_CTA_Label="Request a Walkthrough",
        Pricing_Note="",
        tiers=[
            tier("Guided Walkthrough", "Free", "30-minute live demo", "Live demo of the prototype | Q&A on your use case | No obligation", "Book a Walkthrough", "", "", "Prototype Walkthrough"),
            tier("Early Access", "Join waitlist", "Limited spots", "Early access when released | Founding-user feedback sessions | Launch pricing", "Request Early Access", "", "Limited", "Prototype Walkthrough"),
            tier("Tailored Production Build", "Custom quote", "Scoped project", "Your branding and workflows | Production hosting and setup | Staff handover and support", "Request a Production Build", "", "", "Custom Software Build"),
        ],
    ),
]

ENQUIRY_HEADERS = [
    "Timestamp", "Reference", "Name", "Company", "Email", "Phone_WhatsApp",
    "Inquiry_Category", "Selected_Product", "Selected_Plan", "Budget", "Timeline",
    "Message_Requirements", "Source_Page", "Referrer", "UTM", "User_Agent", "Status", "Follow_Up_Notes",
]

INQUIRY_CATEGORIES = [
    "Custom Software Build", "ProEase+ Bundle & DB Setup", "License Purchase & DB Setup",
    "Subscription Inquiry", "One-Time License Purchase", "Prototype Walkthrough", "Demo Request",
]


def product_rows():
    rows = []
    for p in PRODUCTS:
        row = {h: p.get(h, "") for h in BASE_HEADERS}
        for i in range(MAX_TIERS):
            t = p["tiers"][i] if i < len(p["tiers"]) else tier()
            for f, v in zip(TIER_FIELDS, t):
                row[f"Tier{i+1}_{f}"] = v
        rows.append(row)
    return rows


def write_csv(path, headers, rows):
    with open(path, "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(headers)
        for r in rows:
            w.writerow([r.get(h, "") if isinstance(r, dict) else r[i] for i, h in enumerate(headers)])


def js_str(v):
    return json.dumps("" if v is None else v, ensure_ascii=False)


def main():
    os.makedirs(os.path.join(ROOT, "sheets"), exist_ok=True)
    os.makedirs(os.path.join(ROOT, "apps-script"), exist_ok=True)
    os.makedirs(os.path.join(ROOT, "assets", "data"), exist_ok=True)

    prows = product_rows()

    write_csv(os.path.join(ROOT, "sheets", "Company_Profile.csv"), ["Key", "Value", "Notes"], [list(c) for c in COMPANY])
    write_csv(os.path.join(ROOT, "sheets", "Products.csv"), PRODUCT_HEADERS, prows)
    write_csv(os.path.join(ROOT, "sheets", "Enquiries_&_Requests.csv"), ENQUIRY_HEADERS, [])

    # Seed.gs
    lines = [
        "/**",
        " * Seed.gs - AUTO-GENERATED by tools/build_seed.py. Do not edit by hand;",
        " * edit the sheet instead (this is only used to fill an empty sheet once).",
        " */",
        "var SEED = {",
        "  companyHeaders: [\"Key\", \"Value\", \"Notes\"],",
        "  company: [",
    ]
    lines += ["    [" + ", ".join(js_str(x) for x in c) + "]," for c in COMPANY]
    lines += ["  ],", "  productHeaders: [" + ", ".join(js_str(h) for h in PRODUCT_HEADERS) + "],", "  products: ["]
    for r in prows:
        lines.append("    [" + ", ".join(js_str(str(r[h])) for h in PRODUCT_HEADERS) + "],")
    lines += ["  ],", "  enquiryHeaders: [" + ", ".join(js_str(h) for h in ENQUIRY_HEADERS) + "],",
              "  inquiryCategories: [" + ", ".join(js_str(c) for c in INQUIRY_CATEGORIES) + "]", "};", ""]
    with open(os.path.join(ROOT, "apps-script", "Seed.gs"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines))

    # fallback.json - same shape the Apps Script doGet returns
    fallback = {
        "ok": True,
        "source": "fallback",
        "updatedAt": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "company": {k: v for k, v, _ in COMPANY},
        "products": [{h: str(r[h]) for h in PRODUCT_HEADERS} for r in prows],
        "inquiryCategories": INQUIRY_CATEGORIES,
    }
    with open(os.path.join(ROOT, "assets", "data", "fallback.json"), "w", encoding="utf-8") as fh:
        json.dump(fallback, fh, ensure_ascii=False, indent=1)
    print(f"Generated: {len(COMPANY)} company keys, {len(prows)} products, {len(PRODUCT_HEADERS)} product columns")


if __name__ == "__main__":
    main()
