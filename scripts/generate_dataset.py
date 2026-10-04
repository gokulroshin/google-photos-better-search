"""
Google Photos — Better Search MVP
Dataset & Thumbnail Generator (Phase 1)
Generates 130 mock PhotoAssets conforming to architecture.md §6
and builds crisp WebP image thumbnails in frontend/public/photos/
"""

import os
import json
from PIL import Image, ImageDraw, ImageFont

# Define Output Paths
WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DATA_DIR = os.path.join(WORKSPACE_ROOT, "frontend", "src", "data")
FRONTEND_PUBLIC_DATA_DIR = os.path.join(WORKSPACE_ROOT, "frontend", "public", "data")
FRONTEND_PHOTOS_DIR = os.path.join(WORKSPACE_ROOT, "frontend", "public", "photos")
BACKEND_DATA_DIR = os.path.join(WORKSPACE_ROOT, "backend", "data")

for directory in [FRONTEND_DATA_DIR, FRONTEND_PUBLIC_DATA_DIR, FRONTEND_PHOTOS_DIR, BACKEND_DATA_DIR]:
    os.makedirs(directory, exist_ok=True)

# -------------------------------------------------------------------------
# Asset Generation Data
# -------------------------------------------------------------------------

assets = []

def add_asset(
    asset_id,
    title,
    content_type,
    doc_sub_type,
    condition,
    date_str,
    approx_date,
    year,
    city,
    place_name,
    loc_category,
    people,
    paper_type,
    dominant_colors,
    ocr_text,
    description,
    semantic_tags
):
    asset = {
        "id": asset_id,
        "url": f"/photos/{asset_id}.webp",
        "thumbnailUrl": f"/photos/{asset_id}.webp",
        "title": title,
        "contentType": content_type,
        "date": date_str,
        "approxDateLabel": approx_date,
        "year": year,
        "location": {
            "city": city,
            "placeName": place_name,
            "category": loc_category
        },
        "people": people,
        "visualAttributes": {
            "dominantColors": dominant_colors
        },
        "ocrText": ocr_text,
        "description": description,
        "semanticTags": semantic_tags
    }
    if doc_sub_type:
        asset["documentSubType"] = doc_sub_type
    if condition:
        asset["condition"] = condition
    if paper_type:
        asset["visualAttributes"]["paperType"] = paper_type
    
    assets.append(asset)

# =========================================================================
# 1. CORE DEMO CLUSTER: PRESCRIPTIONS (asset_001 to asset_025, 25 assets)
# All 25 are contentType: "Document", documentSubType: "Prescription"
# All have semanticTag "prescription"
# =========================================================================

# --- VOMITING (9 Prescriptions) ---
# 2024 Clinic (2 assets: TARGET DEMO PAIR)
add_asset(
    "asset_001",
    "Apollo Clinic Prescription - Dr. Rao",
    "Document", "Prescription", "Vomiting",
    "2024-08-18T14:30:00Z", "August 2024", 2024,
    "Bengaluru", "Apollo Clinic, Koramangala", "Clinic",
    ["Pradeep", "Dr. Rao"], "White paper", ["#FFFFFF", "#1A73E8"],
    "Apollo Clinic Koramangala ... Dr. K. Rao MD ... Patient: Pradeep ... Rx: Tab Vomistop 10mg TDS, ORS sachet ... Follow-up 3 days",
    "Handwritten prescription on crisp white paper from Apollo Clinic for acute gastroenteritis and persistent vomiting, signed by Dr. Rao in blue ink.",
    ["prescription", "vomiting", "clinic", "august 2024", "dr rao", "apollo", "vomistop", "medicine", "white paper", "bengaluru"]
)

add_asset(
    "asset_002",
    "CarePlus Family Clinic - Dr. Ananya",
    "Document", "Prescription", "Vomiting",
    "2024-09-12T10:15:00Z", "September 2024", 2024,
    "Bengaluru", "CarePlus Family Clinic, Indiranagar", "Clinic",
    ["Pradeep", "Dr. Ananya"], "Prescription pad", ["#F8F9FA", "#34A853"],
    "CarePlus Clinic Indiranagar ... Dr. Ananya M ... Rx Ondansetron 4mg orally disintegrating ... Dietary: Coconut water, curd rice",
    "Doctor's printed prescription pad sheet with handwritten notes for severe nausea and vomiting from CarePlus Clinic.",
    ["prescription", "vomiting", "clinic", "september 2024", "dr ananya", "careplus", "ondansetron", "prescription pad", "medicine", "bengaluru"]
)

# 2024 Hospital (1 asset)
add_asset(
    "asset_003",
    "Manipal Hospital ER Discharge Prescription",
    "Document", "Prescription", "Vomiting",
    "2024-06-04T22:45:00Z", "June 2024", 2024,
    "Bengaluru", "Manipal Hospital, Old Airport Road", "Hospital",
    ["Pradeep", "Dr. Sharma"], "Printed form", ["#F1F3F4", "#D93025"],
    "Manipal Hospitals Emergency Care ... Discharge Rx ... Emeset 4mg IV stat followed by oral syrup ... Diagnosis: Acute viral gastropathy",
    "Printed hospital emergency room discharge prescription summary for severe dehydration and food poisoning with vomiting.",
    ["prescription", "vomiting", "hospital", "june 2024", "manipal hospital", "emergency", "printed form", "bengaluru"]
)

# 2024 Home (1 asset)
add_asset(
    "asset_004",
    "Practo Teleconsult Digital Prescription",
    "Document", "Prescription", "Vomiting",
    "2024-11-20T18:00:00Z", "November 2024", 2024,
    "Bengaluru", "Home Telehealth", "Home",
    ["Pradeep", "Dr. Varma"], "White paper", ["#FFFFFF", "#7057FF"],
    "Practo Digital Rx ... Consulted from home ... Dr. Rohit Varma ... Domperidone 10mg before meals ... Avoid oily food",
    "Digital telehealth teleconsultation prescription saved while resting at home for stomach upset and motion sickness vomiting.",
    ["prescription", "vomiting", "home", "november 2024", "practo", "teleconsult", "white paper", "bengaluru"]
)

# 2025 Prescriptions (3 assets)
add_asset(
    "asset_005",
    "Fortis Hospital OPD Prescription",
    "Document", "Prescription", "Vomiting",
    "2025-01-14T11:20:00Z", "January 2025", 2025,
    "Bengaluru", "Fortis Hospital, Bannerghatta", "Hospital",
    ["Pradeep", "Dr. Suresh"], "Printed form", ["#FFFFFF", "#0F9D58"],
    "Fortis Healthcare OPD ... Dr. Suresh Gastroenterologist ... Rx Pantocid-D, Ondan 4mg ... Food poisoning evaluation",
    "Recent Fortis hospital printed OPD prescription slip for stomach flu and vomiting in early 2025.",
    ["prescription", "vomiting", "hospital", "january 2025", "fortis", "printed form", "bengaluru"]
)

add_asset(
    "asset_006",
    "Cloudnine Clinic Pediatric & Family Rx",
    "Document", "Prescription", "Vomiting",
    "2025-02-18T16:40:00Z", "February 2025", 2025,
    "Bengaluru", "Cloudnine Clinic, Jayanagar", "Clinic",
    ["Sneha", "Dr. Meera"], "Pink slip", ["#FCE8E6", "#C5221F"],
    "Cloudnine Care ... Dr. Meera Rao ... Rx Domstal baby drops / syrup ... Indication: Post-feed vomiting and acid reflux",
    "Pink tinted medical clinic slip for pediatric nausea and vomiting prescription.",
    ["prescription", "vomiting", "clinic", "february 2025", "cloudnine", "pink slip", "bengaluru"]
)

add_asset(
    "asset_007",
    "MedCenter Urgent Clinic Prescription",
    "Document", "Prescription", "Vomiting",
    "2025-03-01T09:10:00Z", "March 2025", 2025,
    "Bengaluru", "MedCenter Urgent Clinic, Whitefield", "Clinic",
    ["Pradeep", "Dr. Alok"], "White paper", ["#FFFFFF", "#1A73E8"],
    "MedCenter Whitefield ... Urgent Consultation ... Rx Perinorm 10mg, Electral hydration ... Nausea and vomiting",
    "Doctor's advice sheet and medication prescription for travel sickness vomiting.",
    ["prescription", "vomiting", "clinic", "march 2025", "whitefield", "white paper", "bengaluru"]
)

# 2023 Prescriptions (2 assets)
add_asset(
    "asset_008",
    "Narayana Health Gastroenterology Rx",
    "Document", "Prescription", "Vomiting",
    "2023-07-22T15:30:00Z", "July 2023", 2023,
    "Bengaluru", "Narayana Health City", "Hospital",
    ["Pradeep", "Dr. Hegde"], "Printed form", ["#F8F9FA", "#185ABC"],
    "Narayana Health ... Dept of Gastroenterology ... Rx Rabeprazole + Itopride ... Acid reflux with recurring vomiting episodes",
    "Detailed printed hospital prescription for acid regurgitation and persistent vomiting.",
    ["prescription", "vomiting", "hospital", "july 2023", "narayana health", "printed form", "bengaluru"]
)

add_asset(
    "asset_009",
    "Dr. Baliga Neighbourhood Clinic Rx",
    "Document", "Prescription", "Vomiting",
    "2022-10-11T19:00:00Z", "October 2022", 2022,
    "Bengaluru", "Dr. Baliga Clinic, Malleshwaram", "Clinic",
    ["Pradeep", "Dr. Baliga"], "Prescription pad", ["#FFF8E1", "#F29900"],
    "Dr. Baliga Clinic Malleshwaram ... Rx Avomine 25mg bedtime, Digene gel ... Mild gastroenteritis",
    "Handwritten prescription pad slip from Malleshwaram neighborhood clinic for vomiting and dizziness.",
    ["prescription", "vomiting", "clinic", "october 2022", "earlier", "prescription pad", "dr baliga", "bengaluru"]
)

# --- FEVER (6 Prescriptions) ---
add_asset(
    "asset_010",
    "Max Super Speciality Hospital Fever Rx",
    "Document", "Prescription", "Fever",
    "2024-05-10T11:00:00Z", "May 2024", 2024,
    "Delhi", "Max Hospital, Saket", "Hospital",
    ["Pradeep", "Dr. Gupta"], "Printed form", ["#FFFFFF", "#1A73E8"],
    "Max Healthcare Saket ... High grade fever 102F ... Rx Dolo 650mg SOS, Azithromycin 500mg OD x 3 days ... Complete blood count test",
    "Printed hospital prescription for viral fever and high body temperature.",
    ["prescription", "fever", "hospital", "may 2024", "max hospital", "dolo 650", "printed form", "delhi"]
)

add_asset(
    "asset_011",
    "Apollo Clinic Dengue Follow-up Rx",
    "Document", "Prescription", "Fever",
    "2024-09-05T17:30:00Z", "September 2024", 2024,
    "Bengaluru", "Apollo Clinic, Koramangala", "Clinic",
    ["Pradeep", "Dr. Rao"], "White paper", ["#FFFFFF", "#D93025"],
    "Apollo Clinic ... Platelet monitoring ... Rx Paracetamol 650, Caripill tab ... Daily CBC ... High fever recovery",
    "Prescription sheet for fever recovery and platelet check by Dr. Rao at Apollo Clinic.",
    ["prescription", "fever", "clinic", "september 2024", "apollo", "dr rao", "white paper", "bengaluru"]
)

add_asset(
    "asset_012",
    "Dr. Mohan Diabetes & General Clinic",
    "Document", "Prescription", "Fever",
    "2024-03-19T10:00:00Z", "March 2024", 2024,
    "Chennai", "Dr. Mohan Clinic, Gopalapuram", "Clinic",
    ["Pradeep", "Dr. Mohan"], "Prescription pad", ["#F1F3F4", "#1E8E3E"],
    "Dr. Mohan Clinic ... Febrile illness ... Rx Calpol 500, Vitamin C, Zincovit ... Plenty of fluids",
    "Doctor prescription pad for seasonal viral fever in Chennai.",
    ["prescription", "fever", "clinic", "march 2024", "chennai", "prescription pad", "calpol"]
)

add_asset(
    "asset_013",
    "Home Quarantine Teleconsult Rx",
    "Document", "Prescription", "Fever",
    "2023-11-02T14:15:00Z", "November 2023", 2023,
    "Bengaluru", "Home Isolation", "Home",
    ["Pradeep", "Dr. Kavita"], "White paper", ["#FFFFFF", "#5F6368"],
    "Telehealth consultation ... Suspected flu fever ... Rx Paracetamol 1g, Steam inhalation",
    "Prescription slip from online doctor consult for high fever and chills treated at home.",
    ["prescription", "fever", "home", "november 2023", "teleconsult", "white paper", "bengaluru"]
)

add_asset(
    "asset_014",
    "Manipal Hospital Typhoid Protocol Rx",
    "Document", "Prescription", "Fever",
    "2025-02-10T12:00:00Z", "February 2025", 2025,
    "Bengaluru", "Manipal Hospital, HAL", "Hospital",
    ["Pradeep", "Dr. Sen"], "Printed form", ["#FFFFFF", "#185ABC"],
    "Manipal Hospitals OPD ... Enteric fever ... Rx Cefixime 200mg BD x 7 days, Paracetamol SOS",
    "Hospital prescription with antibiotic protocol for persistent typhoid fever.",
    ["prescription", "fever", "hospital", "february 2025", "manipal hospital", "printed form", "bengaluru"]
)

add_asset(
    "asset_015",
    "Neighbourhood Nursing Home Fever Slip",
    "Document", "Prescription", "Fever",
    "2023-04-18T20:00:00Z", "April 2023", 2023,
    "Bengaluru", "Sri Krishna Nursing Home", "Clinic",
    ["Sneha", "Dr. Krishna"], "Pink slip", ["#FCE8E6", "#A50E0E"],
    "Sri Krishna Clinic ... Rx Crocin Advance, Mefenamic acid ... Night fever and shivering",
    "Handwritten pink clinic slip for acute fever and body ache.",
    ["prescription", "fever", "clinic", "april 2023", "pink slip", "bengaluru"]
)

# --- COLD & ALLERGY (4 Prescriptions) ---
add_asset(
    "asset_016",
    "ENT Care Centre Allergy & Sinus Rx",
    "Document", "Prescription", "Cold",
    "2024-10-15T16:00:00Z", "October 2024", 2024,
    "Bengaluru", "Bangalore ENT Care, Indiranagar", "Clinic",
    ["Pradeep", "Dr. Joshi"], "White paper", ["#FFFFFF", "#1A73E8"],
    "Bangalore ENT Care ... Allergic Rhinitis & Sinusitis ... Rx Montair-LC bedtime, Otrivin nasal spray 3 days, Steam",
    "White paper prescription sheet for severe runny nose, cold, and blocked sinuses.",
    ["prescription", "cold", "clinic", "october 2024", "ent", "montair", "white paper", "bengaluru"]
)

add_asset(
    "asset_017",
    "Fortis Hospital Bronchitis Prescription",
    "Document", "Prescription", "Cold",
    "2024-12-08T11:45:00Z", "December 2024", 2024,
    "Bengaluru", "Fortis Hospital, Cunningham Road", "Hospital",
    ["Pradeep", "Dr. Nataraj"], "Printed form", ["#F8F9FA", "#34A853"],
    "Fortis Pulmonology ... Chest congestion & wet cough ... Rx Ascoril-LS syrup, Levocetirizine 5mg, Budecort inhaler",
    "Printed hospital prescription for winter chest cold, persistent coughing, and throat congestion.",
    ["prescription", "cold", "hospital", "december 2024", "fortis", "cough syrup", "printed form", "bengaluru"]
)

add_asset(
    "asset_018",
    "Arogya Wellness Clinic Cold & Flu Slip",
    "Document", "Prescription", "Cold",
    "2023-08-30T18:20:00Z", "August 2023", 2023,
    "Bengaluru", "Arogya Clinic, HSR Layout", "Clinic",
    ["Pradeep", "Dr. Shweta"], "Prescription pad", ["#FFF8E1", "#E37400"],
    "Arogya Clinic HSR ... Common Cold & Sore Throat ... Rx Sinarest tab TDS x 3 days, Betadine gargle ... Warm water only",
    "Clinic prescription pad note for sudden monsoon cold, sneezing, and sore throat.",
    ["prescription", "cold", "clinic", "august 2023", "prescription pad", "sinarest", "bengaluru"]
)

add_asset(
    "asset_019",
    "Dr. Lal PathLabs & Clinic Cold Consult",
    "Document", "Prescription", "Cold",
    "2025-01-28T10:30:00Z", "January 2025", 2025,
    "Delhi", "Dr. Lal Clinic, Connaught Place", "Clinic",
    ["Pradeep", "Dr. Mathur"], "White paper", ["#FFFFFF", "#185ABC"],
    "Dr. Lal Clinic ... Winter pollution smog allergy ... Rx Allegra 120mg OD, Flomist nasal spray ... Avoid outdoor morning runs",
    "Doctor prescription sheet for Delhi winter smog allergy and nasal congestion.",
    ["prescription", "cold", "clinic", "january 2025", "delhi", "allegra", "white paper"]
)

# --- PAIN & ORTHOPEDIC (3 Prescriptions) ---
add_asset(
    "asset_020",
    "Hosmat Orthopedic Hospital Back Pain Rx",
    "Document", "Prescription", "Pain",
    "2024-07-16T15:00:00Z", "July 2024", 2024,
    "Bengaluru", "Hosmat Hospital, Magrath Road", "Hospital",
    ["Pradeep", "Dr. Thomas"], "Printed form", ["#FFFFFF", "#B31412"],
    "Hosmat Orthopaedic & Joint Centre ... Acute lumbar muscle spasm ... Rx Zerodol-SP BD x 5 days, Thiocolchicoside, Lumbar belt ... Physiotherapy",
    "Hospital prescription document for lower back pain, muscle stiffness, and anti-inflammatory painkillers.",
    ["prescription", "pain", "hospital", "july 2024", "hosmat", "zerodol", "printed form", "bengaluru"]
)

add_asset(
    "asset_021",
    "Spine & Joint Sports Medicine Clinic Rx",
    "Document", "Prescription", "Pain",
    "2024-11-05T09:40:00Z", "November 2024", 2024,
    "Bengaluru", "ProActive Spine Clinic, Koramangala", "Clinic",
    ["Pradeep", "Dr. Aryan"], "White paper", ["#FFFFFF", "#1A73E8"],
    "ProActive Sports Medicine ... Ankle ligament sprain ... Rx Etoricoxib 90mg OD, Volini gel, Ice compression 20 mins",
    "Sports clinic prescription note for sprained ankle swelling and joint pain.",
    ["prescription", "pain", "clinic", "november 2024", "koramangala", "white paper", "bengaluru"]
)

add_asset(
    "asset_022",
    "Clove Dental Toothache & Extraction Rx",
    "Document", "Prescription", "Pain",
    "2023-12-14T17:15:00Z", "December 2023", 2023,
    "Bengaluru", "Clove Dental, Bellandur", "Clinic",
    ["Pradeep", "Dr. Nidhi"], "Prescription pad", ["#E8F0FE", "#1967D2"],
    "Clove Dental Clinic ... Wisdom tooth extraction post-op ... Rx Ketorol-DT SOS for severe pain, Augmentin 625, Chlorhexidine mouthwash",
    "Dental clinic prescription pad slip with instructions for wisdom tooth extraction pain relief.",
    ["prescription", "pain", "clinic", "december 2023", "dental", "prescription pad", "bengaluru"]
)

# --- SKIN & DERMATOLOGY (3 Prescriptions) ---
add_asset(
    "asset_023",
    "Kaya Skin Clinic Eczema Prescription",
    "Document", "Prescription", "Skin",
    "2024-04-25T14:00:00Z", "April 2024", 2024,
    "Bengaluru", "Kaya Skin Clinic, Indiranagar", "Clinic",
    ["Pradeep", "Dr. Pooja"], "Pink slip", ["#FCE8E6", "#D93025"],
    "Kaya Clinic Indiranagar ... Contact dermatitis / eczema rash ... Rx Desonide 0.05% cream, Cetaphil moisturising lotion, Bilastine 20mg",
    "Dermatology clinic prescription on pink paper for skin allergy rash and soothing ointment.",
    ["prescription", "skin", "clinic", "april 2024", "kaya clinic", "pink slip", "bengaluru"]
)

add_asset(
    "asset_024",
    "Skin & Hair Specialty Centre Prescription",
    "Document", "Prescription", "Skin",
    "2024-08-30T11:15:00Z", "August 2024", 2024,
    "Bengaluru", "Dermacare Centre, Whitefield", "Clinic",
    ["Pradeep", "Dr. Revathi"], "White paper", ["#FFFFFF", "#7057FF"],
    "Dermacare Specialty ... Fungal skin infection ... Rx Sertaconazole cream twice daily, Itraconazole 100mg capsules x 14 days",
    "Prescription sheet from Whitefield skin clinic for topical ointment and antifungal pills.",
    ["prescription", "skin", "clinic", "august 2024", "white paper", "whitefield", "bengaluru"]
)

add_asset(
    "asset_025",
    "Manipal Hospital Dermatology OPD Slip",
    "Document", "Prescription", "Skin",
    "2025-02-04T16:30:00Z", "February 2025", 2025,
    "Bengaluru", "Manipal Hospital, Jayanagar", "Hospital",
    ["Pradeep", "Dr. Sunil"], "Printed form", ["#F8F9FA", "#1E8E3E"],
    "Manipal Hospitals Dermatology ... Urticaria hives outbreak ... Rx Fexofenadine 180mg BD, Calamine lotion application",
    "Hospital OPD form with doctor's stamp for allergic hives and skin rash treatment.",
    ["prescription", "skin", "hospital", "february 2025", "manipal hospital", "printed form", "bengaluru"]
)

# =========================================================================
# 2. MEDICAL & DOCUMENT DISTRACTORS (asset_026 to asset_053, 28 assets)
# SubTypes: "Bill", "Receipt", "Handwritten Note"
# ALL 28 have semanticTag "prescription" (pharmacy receipts, medical bills, notes)
# Guaranteeing initial query for "prescription" matches 25 + 28 = 53 assets!
# =========================================================================

# --- Vomiting Distractors (9 assets: ensures 9 + 9 = 18 when condition="Vomiting") ---
# 2024 (2 assets: hospital & home -> Ensures when condition="Vomiting" & year=2024, count is 4 Rx + 2 Distractors = 6!)
add_asset(
    "asset_026",
    "MedPlus Pharmacy Invoice - Vomistop & ORS",
    "Document", "Bill", "Vomiting",
    "2024-08-18T15:10:00Z", "August 2024", 2024,
    "Bengaluru", "MedPlus Pharmacy, Koramangala", "Hospital",
    ["Pradeep"], "Printed form", ["#F1F3F4", "#1A73E8"],
    "MedPlus Pharmacy Tax Invoice ... Ref Prescription: Dr. Rao ... Items: Tab Vomistop 10mg strip of 10, Electral Powder 21.8g x 4 ... Total: Rs 148.00",
    "Printed pharmacy medicine purchase bill for vomiting tablets and hydration sachets dispensed against doctor prescription.",
    ["prescription", "vomiting", "bill", "hospital", "august 2024", "medplus", "pharmacy", "medicine", "printed form", "bengaluru"]
)

add_asset(
    "asset_027",
    "Apollo Homecare Doctor Visit Receipt",
    "Document", "Receipt", "Vomiting",
    "2024-09-14T20:30:00Z", "September 2024", 2024,
    "Bengaluru", "Apollo Homecare Visit", "Home",
    ["Pradeep", "Dr. Mehta"], "White paper", ["#FFFFFF", "#34A853"],
    "Apollo Home Care Consultation Receipt ... Doctor visit at home ... Patient attended for dehydration & vomiting ... Prescription copy attached ... Amount paid: Rs 1,200",
    "Cash receipt with prescription copy attached for emergency home visit by doctor during acute vomiting illness.",
    ["prescription", "vomiting", "receipt", "home", "september 2024", "apollo", "doctor", "white paper", "bengaluru"]
)

# 2025 Vomiting Distractors (4 assets)
add_asset(
    "asset_028",
    "Fortis Hospital Inpatient Billing Summary",
    "Document", "Bill", "Vomiting",
    "2025-01-16T18:00:00Z", "January 2025", 2025,
    "Bengaluru", "Fortis Hospital Billing Counter", "Hospital",
    ["Pradeep"], "Printed form", ["#FFFFFF", "#D93025"],
    "Fortis Healthcare Billing ... Daycare admission for gastroenteritis & vomiting ... IV fluids, ondansetron infusion, prescription charges",
    "Hospital daycare invoice detailing IV drip charges and anti-vomiting medication prescription line items.",
    ["prescription", "vomiting", "bill", "hospital", "january 2025", "fortis", "printed form", "bengaluru"]
)

add_asset(
    "asset_029",
    "Apollo Pharmacy Bill - Nausea Syrup",
    "Document", "Bill", "Vomiting",
    "2025-02-19T17:15:00Z", "February 2025", 2025,
    "Bengaluru", "Apollo Pharmacy, Jayanagar", "Clinic",
    ["Sneha"], "Printed form", ["#F8F9FA", "#1E8E3E"],
    "Apollo Pharmacy ... Dispensed against Cloudnine prescription ... Pediatric nausea syrup, gripe water ... Total: Rs 280",
    "Cash register receipt from Apollo Pharmacy for pediatric anti-vomiting syrup.",
    ["prescription", "vomiting", "bill", "clinic", "february 2025", "apollo pharmacy", "printed form", "bengaluru"]
)

add_asset(
    "asset_030",
    "Handwritten Note - Vomiting Med Timings",
    "Document", "Handwritten Note", "Vomiting",
    "2025-03-02T08:00:00Z", "March 2025", 2025,
    "Bengaluru", "Kitchen Counter Sticky Note", "Home",
    ["Pradeep"], "White paper", ["#FFF9C4", "#F57F17"],
    "Medicine Schedule from Doctor Prescription: 8:00 AM - Vomistop before food ... 1:00 PM - Electral water ... 8:00 PM - Light khichdi",
    "Handwritten sticky note summarizing medication schedule taken from doctor's vomiting prescription.",
    ["prescription", "vomiting", "handwritten note", "home", "march 2025", "white paper", "bengaluru"]
)

add_asset(
    "asset_031",
    "Wellness Forever Chemist Cash Slip",
    "Document", "Receipt", "Vomiting",
    "2025-01-20T21:00:00Z", "January 2025", 2025,
    "Bengaluru", "Wellness Forever, Indiranagar", "Clinic",
    ["Pradeep"], "Printed form", ["#FFFFFF", "#1A73E8"],
    "Wellness Forever 24x7 ... Rx verify code: 9942 ... Anti-emetic Domperidone, Gelusil ... Pharmacist sign",
    "Thermal paper register receipt from 24/7 chemist for prescription anti-emetic tablets.",
    ["prescription", "vomiting", "receipt", "clinic", "january 2025", "printed form", "bengaluru"]
)

# 2023 Vomiting Distractors (3 assets)
add_asset(
    "asset_032",
    "Narayana Hrudayalaya Pharmacy Receipt",
    "Document", "Receipt", "Vomiting",
    "2023-07-23T10:00:00Z", "July 2023", 2023,
    "Bengaluru", "Narayana Health Pharmacy Counter", "Hospital",
    ["Pradeep"], "Printed form", ["#F1F3F4", "#5F6368"],
    "Narayana Health Dispensary ... Gastro prescription bill ... Itopride, Rabeprazole capsules ... Paid via UPI",
    "Pharmacy counter transaction receipt for digestive and vomiting medication.",
    ["prescription", "vomiting", "receipt", "hospital", "july 2023", "narayana health", "printed form", "bengaluru"]
)

add_asset(
    "asset_033",
    "Clinic Consultation Fee Receipt",
    "Document", "Receipt", "Vomiting",
    "2023-10-11T19:30:00Z", "October 2023", 2023,
    "Bengaluru", "Dr. Baliga Clinic Reception", "Clinic",
    ["Pradeep"], "White paper", ["#FFFFFF", "#202124"],
    "Dr. Baliga Clinic ... Patient Consultation Fee Rs 500 ... Cause of visit: Acute food poisoning & vomiting ... Prescription handed to patient",
    "Payment receipt slip acknowledging doctor consultation and issuance of medicine prescription.",
    ["prescription", "vomiting", "receipt", "clinic", "october 2023", "white paper", "bengaluru"]
)

add_asset(
    "asset_034",
    "Emergency Medical Kit Medication Note",
    "Document", "Handwritten Note", "Vomiting",
    "2022-12-01T12:00:00Z", "December 2022", 2022,
    "Bengaluru", "Home First Aid Box", "Home",
    ["Pradeep"], "White paper", ["#E8F0FE", "#1967D2"],
    "First Aid Box Checklist: Expiry Check on Dr. Rao's old prescription tablets ... Vomistop strip exp 2025 ... ORS sachets present",
    "Handwritten paper note inside medicine box listing prescription pills for vomiting and motion sickness.",
    ["prescription", "vomiting", "handwritten note", "home", "december 2022", "earlier", "white paper", "bengaluru"]
)

# --- Fever Distractors (7 assets) ---
add_asset(
    "asset_035",
    "Max Hospital Saket Diagnostic Lab Bill",
    "Document", "Bill", "Fever",
    "2024-05-10T12:30:00Z", "May 2024", 2024,
    "Delhi", "Max Hospital Pathology Lab", "Hospital",
    ["Pradeep"], "Printed form", ["#FFFFFF", "#1A73E8"],
    "Max Pathology ... Prescription test order: Widal test, Dengue NS1 antigen, Complete hemogram ... Fever profile panel",
    "Diagnostic lab invoice for blood work ordered on fever prescription.",
    ["prescription", "fever", "bill", "hospital", "may 2024", "delhi", "max hospital", "printed form"]
)

add_asset(
    "asset_036",
    "Apollo Pharmacy Bill - Dolo 650 & Zinc",
    "Document", "Receipt", "Fever",
    "2024-09-06T09:00:00Z", "September 2024", 2024,
    "Bengaluru", "Apollo Pharmacy, Koramangala", "Clinic",
    ["Pradeep"], "Printed form", ["#F8F9FA", "#34A853"],
    "Apollo Pharmacy ... Prescription Ref #9201 ... Dolo 650 strip x 2, Vitamin C chewables ... Cash receipt",
    "Printed pharmacy receipt for fever tablets purchased near clinic.",
    ["prescription", "fever", "receipt", "clinic", "september 2024", "apollo", "printed form", "bengaluru"]
)

add_asset(
    "asset_037",
    "Manipal Hospital OPD Registration Slip",
    "Document", "Receipt", "Fever",
    "2025-02-10T11:00:00Z", "February 2025", 2025,
    "Bengaluru", "Manipal Hospital Registration Desk", "Hospital",
    ["Pradeep"], "Printed form", ["#FFFFFF", "#185ABC"],
    "Manipal Hospitals ... General Medicine OPD Token ... Chief complaint: High fever 3 days ... Prescription copy attached",
    "Hospital OPD entry registration token slip with doctor prescription attached.",
    ["prescription", "fever", "receipt", "hospital", "february 2025", "manipal hospital", "printed form", "bengaluru"]
)

add_asset(
    "asset_038",
    "Handwritten Temperature & Dolo Log",
    "Document", "Handwritten Note", "Fever",
    "2024-03-20T07:30:00Z", "March 2024", 2024,
    "Chennai", "Bedside Table", "Home",
    ["Pradeep"], "White paper", ["#FFFFFF", "#D93025"],
    "Fever Chart per Dr. Mohan Rx: 6 AM: 101.4F - Dolo 650 taken ... 12 PM: 99.8F ... 6 PM: 102.0F - Cold compress applied",
    "Handwritten paper fever chart tracking hourly temperatures as advised on doctor's prescription.",
    ["prescription", "fever", "handwritten note", "home", "march 2024", "white paper", "chennai"]
)

add_asset(
    "asset_039",
    "Thyrocare Fever Profile Lab Receipt",
    "Document", "Receipt", "Fever",
    "2023-11-03T08:00:00Z", "November 2023", 2023,
    "Bengaluru", "Thyrocare Home Collection", "Home",
    ["Pradeep"], "Printed form", ["#F1F3F4", "#0F9D58"],
    "Thyrocare Home Blood Collection ... Prescription attached: Dr. Kavita ... Tests: Malaria parasite, CBC ... Total Rs 850",
    "Printed home diagnostic receipt for fever investigations.",
    ["prescription", "fever", "receipt", "home", "november 2023", "printed form", "bengaluru"]
)

add_asset(
    "asset_040",
    "Guardian Pharmacy Bill - Paracetamol & ORS",
    "Document", "Bill", "Fever",
    "2024-05-11T14:00:00Z", "May 2024", 2024,
    "Delhi", "Guardian Pharmacy, Saket", "Hospital",
    ["Pradeep"], "Printed form", ["#FFFFFF", "#202124"],
    "Guardian Pharmacy Saket ... Prescription order medicines ... Azithromycin 500mg, Calpol ... Total Rs 312",
    "Pharmacy tax invoice for antibiotic and fever medication.",
    ["prescription", "fever", "bill", "hospital", "may 2024", "delhi", "printed form"]
)

add_asset(
    "asset_041",
    "Sri Krishna Clinic Lab Test Slip",
    "Document", "Bill", "Fever",
    "2023-04-19T09:00:00Z", "April 2023", 2023,
    "Bengaluru", "Sri Krishna Nursing Home Lab", "Clinic",
    ["Sneha"], "White paper", ["#FCE8E6", "#C5221F"],
    "Sri Krishna Clinic Lab ... Doctor prescription order for platelet count and viral screen ... Paid in cash Rs 350",
    "Small pink receipt for fever test ordered at local nursing home.",
    ["prescription", "fever", "bill", "clinic", "april 2023", "white paper", "bengaluru"]
)

# --- Cold & Allergy Distractors (5 assets) ---
add_asset(
    "asset_042",
    "Apollo Pharmacy Bill - Inhaler & Cetirizine",
    "Document", "Bill", "Cold",
    "2024-10-15T17:00:00Z", "October 2024", 2024,
    "Bengaluru", "Apollo Pharmacy, Indiranagar", "Clinic",
    ["Pradeep"], "Printed form", ["#F8F9FA", "#1A73E8"],
    "Apollo Pharmacy Indiranagar ... Prescription #8182 ... Montair-LC, Nasal saline wash ... Total: Rs 420.00",
    "Pharmacy bill for allergy and sinus prescription medicines.",
    ["prescription", "cold", "bill", "clinic", "october 2024", "apollo", "printed form", "bengaluru"]
)

add_asset(
    "asset_043",
    "Fortis Hospital Pharmacy Discharge Bill",
    "Document", "Bill", "Cold",
    "2024-12-08T13:00:00Z", "December 2024", 2024,
    "Bengaluru", "Fortis Pharmacy Counter", "Hospital",
    ["Pradeep"], "Printed form", ["#FFFFFF", "#34A853"],
    "Fortis Healthcare Dispensary ... Pulmonology Rx ... Ascoril cough syrup, Budesonide respules ... Total Rs 685",
    "Discharge pharmacy bill for bronchitis prescription.",
    ["prescription", "cold", "bill", "hospital", "december 2024", "fortis", "printed form", "bengaluru"]
)

add_asset(
    "asset_044",
    "MedPlus Chemist Bill - Sinarest & Lozenges",
    "Document", "Receipt", "Cold",
    "2023-08-30T19:00:00Z", "August 2023", 2023,
    "Bengaluru", "MedPlus HSR Layout", "Clinic",
    ["Pradeep"], "Printed form", ["#F1F3F4", "#E37400"],
    "MedPlus Pharmacy ... Rx items: Sinarest strip, Strepsils warm sensation ... Total Rs 115",
    "Retail pharmacy cash receipt for common cold medicines.",
    ["prescription", "cold", "receipt", "clinic", "august 2023", "printed form", "bengaluru"]
)

add_asset(
    "asset_045",
    "Handwritten Note - Home Remedies for Cold",
    "Document", "Handwritten Note", "Cold",
    "2024-11-12T10:00:00Z", "November 2024", 2024,
    "Bengaluru", "Study Desk", "Home",
    ["Pradeep"], "White paper", ["#FFFFFF", "#5F6368"],
    "Notes from Doctor consult & prescription: Turmeric milk at night, steam with eucalyptus twice a day, take Montair before sleep",
    "Handwritten note on white notepad listing home care steps from doctor's cold prescription.",
    ["prescription", "cold", "handwritten note", "home", "november 2024", "white paper", "bengaluru"]
)

add_asset(
    "asset_046",
    "Apollo Pharmacy Connaught Place Receipt",
    "Document", "Receipt", "Cold",
    "2025-01-28T11:45:00Z", "January 2025", 2025,
    "Delhi", "Apollo Pharmacy CP", "Clinic",
    ["Pradeep"], "Printed form", ["#FFFFFF", "#185ABC"],
    "Apollo Pharmacy Delhi ... Allegra 120mg x 10 tabs, Flomist spray ... Prescribed by Dr. Mathur",
    "Medical store bill for Delhi pollution allergy prescription items.",
    ["prescription", "cold", "receipt", "clinic", "january 2025", "delhi", "printed form"]
)

# --- Pain Distractors (4 assets) ---
add_asset(
    "asset_047",
    "Hosmat Hospital Pharmacy Pain Meds Bill",
    "Document", "Bill", "Pain",
    "2024-07-16T16:00:00Z", "July 2024", 2024,
    "Bengaluru", "Hosmat Hospital Pharmacy", "Hospital",
    ["Pradeep"], "Printed form", ["#FFFFFF", "#B31412"],
    "Hosmat Pharmacy ... Doctor prescription medicines: Zerodol-SP, Muscle relaxant, Orthopedic belt ... Total Rs 1,420",
    "Receipt from orthopedic hospital dispensary for back pain prescription items.",
    ["prescription", "pain", "bill", "hospital", "july 2024", "hosmat", "printed form", "bengaluru"]
)

add_asset(
    "asset_048",
    "Physiotherapy Centre Session Package Bill",
    "Document", "Bill", "Pain",
    "2024-07-20T11:00:00Z", "July 2024", 2024,
    "Bengaluru", "ProPhysio Rehab, Koramangala", "Clinic",
    ["Pradeep"], "Printed form", ["#F8F9FA", "#1A73E8"],
    "ProPhysio Clinic ... Ref: Hosmat Dr. Thomas prescription ... 5 sessions IFT + Ultrasound therapy for lower back",
    "Physiotherapy clinic billing invoice based on doctor's back pain prescription recommendation.",
    ["prescription", "pain", "bill", "clinic", "july 2024", "physiotherapy", "printed form", "bengaluru"]
)

add_asset(
    "asset_049",
    "Clove Dental Pharmacy Antibiotic Receipt",
    "Document", "Receipt", "Pain",
    "2023-12-14T18:00:00Z", "December 2023", 2023,
    "Bengaluru", "Clove Dental Dispensary", "Clinic",
    ["Pradeep"], "White paper", ["#E8F0FE", "#1967D2"],
    "Clove Dental ... Rx painkillers Ketorol-DT & Augmentin ... Dispensed directly at clinic ... Rs 340",
    "Dental clinic pharmacy payment counter voucher for wisdom tooth painkillers.",
    ["prescription", "pain", "receipt", "clinic", "december 2023", "dental", "white paper", "bengaluru"]
)

add_asset(
    "asset_050",
    "MedPlus Ankle Brace & Pain Gel Receipt",
    "Document", "Receipt", "Pain",
    "2024-11-05T10:30:00Z", "November 2024", 2024,
    "Bengaluru", "MedPlus Pharmacy, Koramangala", "Clinic",
    ["Pradeep"], "Printed form", ["#FFFFFF", "#D93025"],
    "MedPlus ... Prescribed ankle support wrap, Volini spray ... Total Rs 580",
    "Printed cash slip from medical store for ankle support brace and pain spray.",
    ["prescription", "pain", "receipt", "clinic", "november 2024", "printed form", "bengaluru"]
)

# --- General Health / Distractor Documents (3 assets) ---
add_asset(
    "asset_051",
    "Annual Preventive Health Checkup Report",
    "Document", "Bill", "General",
    "2024-02-15T10:00:00Z", "February 2024", 2024,
    "Bengaluru", "Apollo Health City", "Hospital",
    ["Pradeep"], "Printed form", ["#FFFFFF", "#1E8E3E"],
    "Apollo Executive Health Checkup ... Full lipid panel, HbA1c, ECG normal ... Multivitamin prescription attached ... Invoice: Rs 4,500",
    "Preventive master health checkup summary invoice with physician supplement prescription.",
    ["prescription", "general", "bill", "hospital", "february 2024", "apollo", "printed form", "bengaluru"]
)

add_asset(
    "asset_052",
    "Dr. Batra Homeopathy Consultation Voucher",
    "Document", "Receipt", "General",
    "2023-09-08T15:30:00Z", "September 2023", 2023,
    "Bengaluru", "Dr. Batra Clinic, Indiranagar", "Clinic",
    ["Pradeep"], "White paper", ["#F1F3F4", "#7057FF"],
    "Dr. Batra Positive Health ... Consultation & 1-month prescription medicine pack ... Total Rs 1,800",
    "Receipt for wellness consultation and herbal medicine prescription kit.",
    ["prescription", "general", "receipt", "clinic", "september 2023", "white paper", "bengaluru"]
)

add_asset(
    "asset_053",
    "Handwritten Family Doctor Contact & Rx List",
    "Document", "Handwritten Note", "General",
    "2024-01-05T12:00:00Z", "January 2024", 2024,
    "Bengaluru", "Home Study", "Home",
    ["Pradeep"], "White paper", ["#FFFFFF", "#202124"],
    "Emergency medical contacts list: Dr. Rao (Apollo Clinic) - Keep old vomiting prescription handy ... Dr. Thomas (Hosmat) ... Nearest pharmacy: MedPlus Koramangala",
    "Handwritten desk memo listing trusted family doctors and emergency prescription reminders.",
    ["prescription", "general", "handwritten note", "home", "january 2024", "white paper", "bengaluru"]
)

# =========================================================================
# 3. TRAVEL & VACATIONS (asset_054 to asset_073, 20 assets)
# contentType: "Travel"
# =========================================================================

travel_items = [
    ("asset_054", "Sunset over Palolem Beach - South Goa", "2024-11-15T18:15:00Z", "November 2024", 2024, "Goa", "Palolem Beach", "Beach", ["Pradeep", "Sneha"], ["#F57C00", "#FFD54F"], "Golden orange sunset reflecting on wet sand and sea waves at Palolem beach in Goa.", ["travel", "goa", "beach", "sunset", "vacation", "sea", "november 2024"]),
    ("asset_055", "Relaxing on Beach Shack Hammock - Anjuna", "2024-11-16T15:30:00Z", "November 2024", 2024, "Goa", "Curlies Beach Shack, Anjuna", "Beach", ["Pradeep"], ["#0288D1", "#FFF9C4"], "Chilling in a striped cotton hammock under palm trees with ocean breeze at Anjuna beach shack.", ["travel", "goa", "beach", "hammock", "relaxation", "sea", "november 2024"]),
    ("asset_056", "Morning Coffee at French Bakery - Fontainhas", "2024-11-17T09:45:00Z", "November 2024", 2024, "Goa", "Fontainhas Latin Quarter", "Restaurant", ["Pradeep", "Sneha"], ["#E64A19", "#FFE0B2"], "Artisanal espresso and warm croissant outside bright yellow Portuguese villa in Fontainhas.", ["travel", "goa", "cafe", "coffee", "restaurant", "fontainhas", "november 2024"]),
    ("asset_057", "Renting Scooters along North Goa Coastline", "2024-11-14T11:00:00Z", "November 2024", 2024, "Goa", "Vagator Coastal Road", "Outdoor", ["Pradeep", "Karthik"], ["#388E3C", "#81C784"], "Two rented yellow Activa scooters parked beside scenic green cliff overlooking the Arabian Sea.", ["travel", "goa", "scooter", "road trip", "ocean", "outdoor", "november 2024"]),
    ("asset_058", "Sunrise at Taj Mahal Front Gardens", "2023-10-02T06:20:00Z", "October 2023", 2023, "Agra", "Taj Mahal Complex", "Outdoor", ["Pradeep"], ["#FAFAFA", "#B0BEC5"], "Soft pink dawn light reflecting off the white marble dome and minarets of the Taj Mahal.", ["travel", "agra", "taj mahal", "monument", "sunrise", "marble", "october 2023"]),
    ("asset_059", "Snow Trek at Rohtang Pass - Manali", "2024-01-18T12:40:00Z", "January 2024", 2024, "Manali", "Rohtang Pass", "Outdoor", ["Pradeep", "Rohan"], ["#FFFFFF", "#0288D1"], "Crisp white snow covered mountain ridge and pine valleys with friends in heavy winter parkas.", ["travel", "manali", "snow", "mountains", "trek", "winter", "january 2024"]),
    ("asset_060", "Old Manali Cozy Wooden Cabin View", "2024-01-19T17:00:00Z", "January 2024", 2024, "Manali", "Old Manali Village", "Outdoor", ["Pradeep"], ["#5D4037", "#8D6E63"], "Cedar wooden balcony overlooking frosted apple orchards and snowy mountain peaks at dusk.", ["travel", "manali", "cabin", "mountains", "snow", "winter", "january 2024"]),
    ("asset_061", "Pangong Tso Blue Waters - Ladakh", "2023-06-15T14:00:00Z", "June 2023", 2023, "Leh Ladakh", "Pangong Tso Lake", "Outdoor", ["Pradeep", "Amit"], ["#01579B", "#81D4FA"], "Breathtaking turquoise high-altitude lake surrounded by barren brown Himalayan mountain ranges.", ["travel", "ladakh", "pangong lake", "mountains", "lake", "blue water", "june 2023"]),
    ("asset_062", "Monastery Prayer Flags at Thiksey - Ladakh", "2023-06-17T10:15:00Z", "June 2023", 2023, "Leh Ladakh", "Thiksey Monastery", "Outdoor", ["Pradeep"], ["#D32F2F", "#FBC02D"], "Colorful Tibetan prayer flags fluttering in mountain breeze against whitewashed monastery walls.", ["travel", "ladakh", "monastery", "prayer flags", "buddhism", "culture", "june 2023"]),
    ("asset_063", "Eiffel Tower Twinkle Lights - Paris", "2023-09-20T21:30:00Z", "September 2023", 2023, "Paris", "Champ de Mars", "Outdoor", ["Pradeep", "Sneha"], ["#212121", "#FFD54F"], "Sparkling golden illuminations on the Eiffel Tower against a deep navy Parisian night sky.", ["travel", "paris", "eiffel tower", "night", "monument", "france", "september 2023"]),
    ("asset_064", "Café de Flore Sidewalk Table - Paris", "2023-09-21T15:00:00Z", "September 2023", 2023, "Paris", "Boulevard Saint-Germain", "Restaurant", ["Pradeep", "Sneha"], ["#3E2723", "#D7CCC8"], "Classic round wicker table outside Parisian bistro with café au lait and macarons.", ["travel", "paris", "cafe", "coffee", "bistro", "france", "september 2023"]),
    ("asset_065", "Colosseum Exterior Archways - Rome", "2023-09-25T11:30:00Z", "September 2023", 2023, "Rome", "Piazza del Colosseo", "Outdoor", ["Pradeep"], ["#8D6E63", "#FFE082"], "Ancient Roman stone arches and monumental facade of the Flavian Amphitheatre under clear blue sky.", ["travel", "rome", "colosseum", "history", "monument", "italy", "september 2023"]),
    ("asset_066", "Trevi Fountain Coin Toss - Rome", "2023-09-26T16:45:00Z", "September 2023", 2023, "Rome", "Trevi Fountain", "Outdoor", ["Pradeep", "Sneha"], ["#00838F", "#E0F7FA"], "Crystal turquoise water splashing against Baroque marble statues at the crowded Trevi Fountain.", ["travel", "rome", "trevi fountain", "water", "italy", "vacation", "september 2023"]),
    ("asset_067", "Swiss Alps Train Journey to Jungfrau", "2023-09-28T13:20:00Z", "September 2023", 2023, "Interlaken", "Jungfraubahn Train", "Outdoor", ["Pradeep"], ["#1B5E20", "#FFFFFF"], "Panoramic red cogwheel train winding through lush green Swiss valleys and snowy jagged peaks.", ["travel", "switzerland", "alps", "train", "mountains", "scenic", "september 2023"]),
    ("asset_068", "Amer Fort Amber Courtyard - Jaipur", "2024-02-10T14:15:00Z", "February 2024", 2024, "Jaipur", "Amer Palace", "Outdoor", ["Pradeep", "Karthik"], ["#E65100", "#FFE0B2"], "Intricate sandstone jaali lattice carvings and royal courtyards overlooking Maota Lake.", ["travel", "jaipur", "amer fort", "palace", "rajasthan", "history", "february 2024"]),
    ("asset_069", "Hawa Mahal Pink Sandstone Windows", "2024-02-11T10:00:00Z", "February 2024", 2024, "Jaipur", "Hawa Mahal", "Outdoor", ["Pradeep"], ["#AD1457", "#F8BBD0"], "Iconic honeycomb beehive facade of Hawa Mahal with miniature arched casements in morning light.", ["travel", "jaipur", "hawa mahal", "rajasthan", "architecture", "pink city", "february 2024"]),
    ("asset_070", "Kerala Backwaters Houseboat Cruise", "2024-08-25T16:00:00Z", "August 2024", 2024, "Alleppey", "Vembanad Lake", "Outdoor", ["Pradeep", "Sneha"], ["#1B5E20", "#33691E"], "Traditional thatched wooden kettuvallam boat gliding through serene palm-fringed canal backwaters.", ["travel", "kerala", "houseboat", "alleppey", "backwaters", "nature", "august 2024"]),
    ("asset_071", "Tea Plantation Misty Slopes - Munnar", "2024-08-27T08:30:00Z", "August 2024", 2024, "Munnar", "Kolukkumalai Estate", "Outdoor", ["Pradeep"], ["#2E7D32", "#A5D6A7"], "Rolling emerald green velvet hills of tea shrubs shrouded in swirling morning mist.", ["travel", "kerala", "munnar", "tea garden", "hills", "mist", "august 2024"]),
    ("asset_072", "Kempegowda Airport Terminal 2 Garden Hall", "2024-11-14T06:00:00Z", "November 2024", 2024, "Bengaluru", "BLR Airport T2", "Hospital", ["Pradeep"], ["#5D4037", "#81C784"], "Bamboo architecture and lush suspended hanging gardens inside the world's most beautiful airport.", ["travel", "bengaluru", "airport", "blr t2", "architecture", "departure", "november 2024"]),
    ("asset_073", "Luggage Packed Ready for Vacation", "2024-11-13T22:00:00Z", "November 2024", 2024, "Bengaluru", "Home Bedroom", "Home", ["Pradeep"], ["#37474F", "#90A4AE"], "Navy blue hard-shell trolley suitcase open on floor packed with linen beach shirts and sunglasses.", ["travel", "bengaluru", "luggage", "packing", "vacation prep", "home", "november 2024"])
]

for item in travel_items:
    aid, title, dt, approx, yr, city, place, cat, ppl, cols, desc, tags = item
    add_asset(aid, title, "Travel", None, None, dt, approx, yr, city, place, cat, ppl, None, cols, f"Travel photo taken at {place}, {city}.", desc, tags)

# =========================================================================
# 4. PEOPLE & SOCIAL EVENTS (asset_074 to asset_093, 20 assets)
# contentType: "People"
# =========================================================================

people_items = [
    ("asset_074", "Rahul's 30th Birthday Cake Cutting", "2024-04-12T20:30:00Z", "April 2024", 2024, "Bengaluru", "Toit Brewpub, Indiranagar", "Restaurant", ["Pradeep", "Rahul", "Karthik"], ["#FF6F00", "#FFE082"], "Rahul blowing candles on a dark chocolate hazelnut cake surrounded by cheering close friends.", ["people", "birthday", "cake", "party", "toit", "friends", "celebration", "april 2024"]),
    ("asset_075", "Diwali Family Living Room Gathering", "2024-10-31T19:00:00Z", "October 2024", 2024, "Bengaluru", "Home Living Room", "Home", ["Pradeep", "Sneha", "Mother", "Father"], ["#E65100", "#FFF3E0"], "Family gathered in festive silk kurtas surrounded by glowing clay diyas and sweet boxes.", ["people", "diwali", "family", "festival", "home", "celebration", "tradition", "october 2024"]),
    ("asset_076", "Priya & Aditya Wedding Sangeet Dance", "2024-12-22T21:00:00Z", "December 2024", 2024, "Jaipur", "Fairmont Palace Lawn", "Outdoor", ["Pradeep", "Priya", "Aditya", "Sneha"], ["#880E4F", "#F48FB1"], "Bride and groom performing choreographed Bollywood dance under grand floral fairy light stage.", ["people", "wedding", "sangeet", "dance", "jaipur", "celebration", "friends", "december 2024"]),
    ("asset_077", "College Reunion Brunch at Koramangala", "2024-03-10T12:30:00Z", "March 2024", 2024, "Bengaluru", "The Hole in the Wall Cafe", "Restaurant", ["Pradeep", "Rahul", "Ankit", "Deepa"], ["#00695C", "#80CBC4"], "Group selfie laughing across wooden cafe table piled with waffles, eggs florentine, and iced tea.", ["people", "friends", "brunch", "reunion", "cafe", "koramangala", "march 2024"]),
    ("asset_078", "Engineering Campus Graduation Day", "2023-07-08T11:00:00Z", "July 2023", 2023, "Bengaluru", "University Auditorium", "Outdoor", ["Pradeep", "Karthik", "Rohan"], ["#1A237E", "#C5CAE9"], "Tossing black graduation mortarboard caps into the sky in front of the main college stone arches.", ["people", "graduation", "college", "friends", "celebration", "degree", "july 2023"]),
    ("asset_079", "Office Team Hackathon Demo Day", "2024-05-17T17:00:00Z", "May 2024", 2024, "Bengaluru", "Google Office, Bagmane Tech Park", "Hospital", ["Pradeep", "Neha", "Vikram"], ["#0D47A1", "#90CAF9"], "Software engineering team high-fiving after winning first prize trophy at company hackathon.", ["people", "office", "work", "hackathon", "team", "celebration", "tech", "may 2024"]),
    ("asset_080", "Terrace BBQ Night with Friends", "2024-02-24T20:00:00Z", "February 2024", 2024, "Bengaluru", "Indiranagar Rooftop", "Home", ["Pradeep", "Rahul", "Sneha", "Arjun"], ["#BF360C", "#FFAB91"], "Grilling paneer and chicken skewers over hot coals on breezy Bangalore terrace under string lights.", ["people", "bbq", "terrace", "friends", "food", "party", "bengaluru", "february 2024"]),
    ("asset_081", "New Year's Eve Countdown Celebration", "2023-12-31T23:59:00Z", "December 2023", 2023, "Bengaluru", "Skydeck Lounge, UB City", "Restaurant", ["Pradeep", "Sneha", "Karthik"], ["#4A148C", "#E1BEE7"], "Champagne toast and golden confetti shower celebrating midnight new year arrival.", ["people", "new year", "party", "celebration", "ub city", "friends", "december 2023"]),
    ("asset_082", "Weekend Trekking Group at Nandi Hills", "2024-06-09T06:30:00Z", "June 2024", 2024, "Bengaluru", "Nandi Hills Sunrise Point", "Outdoor", ["Pradeep", "Rohan", "Ankit"], ["#E65100", "#FFE082"], "Tired but smiling friends posing on cliff edge with sea of morning clouds below.", ["people", "nandi hills", "trek", "sunrise", "friends", "nature", "outdoor", "june 2024"]),
    ("asset_083", "Cousin Baby Shower Ceremony", "2024-09-08T11:30:00Z", "September 2024", 2024, "Bengaluru", "Grand Magrath Banquet Hall", "Hospital", ["Sneha", "Meera", "Aunt"], ["#F06292", "#FCE4EC"], "Posing with radiant expectant mother seated in floral decorated rocking swing chair.", ["people", "baby shower", "family", "tradition", "celebration", "bengaluru", "september 2024"]),
    ("asset_084", "Mother's 60th Birthday Celebration", "2024-08-04T13:00:00Z", "August 2024", 2024, "Bengaluru", "Karavalli Restaurant, Gateway Hotel", "Restaurant", ["Pradeep", "Mother", "Father", "Sneha"], ["#1B5E20", "#C8E6C9"], "Family portrait smiling with bouquet of yellow lilies and silver number balloons.", ["people", "mother", "birthday", "family", "lunch", "celebration", "august 2024"]),
    ("asset_085", "Badminton Match Victory Selfie", "2024-07-28T19:30:00Z", "July 2024", 2024, "Bengaluru", "PlaySeppo Sports Arena", "Clinic", ["Pradeep", "Rahul"], ["#004D40", "#80CBC4"], "Sweaty post-match selfie on indoor synthetic wooden court holding Yonex racquets.", ["people", "sports", "badminton", "fitness", "friends", "bengaluru", "july 2024"]),
    ("asset_086", "Game Night Board Game Table", "2024-01-27T21:30:00Z", "January 2024", 2024, "Bengaluru", "Home Living Room", "Home", ["Pradeep", "Sneha", "Karthik", "Pooja"], ["#3E2723", "#D7CCC8"], "Hands reaching for Catan settlements and resource cards with popcorn bowl in center.", ["people", "game night", "board game", "catan", "friends", "home", "january 2024"]),
    ("asset_087", "Diwali Diya Lighting on Balcony", "2024-10-31T20:15:00Z", "October 2024", 2024, "Bengaluru", "Home Balcony", "Home", ["Pradeep", "Sneha"], ["#E65100", "#FFD54F"], "Carefully placing lit brass oil lamps along apartment balcony railing overlooking city lights.", ["people", "diwali", "diyas", "lights", "festival", "home", "october 2024"]),
    ("asset_088", "Sunday Cycling Club at Cubbon Park", "2024-03-24T07:00:00Z", "March 2024", 2024, "Bengaluru", "Cubbon Park Bamboo Grove", "Outdoor", ["Pradeep", "Anand", "Vikram"], ["#2E7D32", "#A5D6A7"], "Group of road cyclists in helmets and jerseys resting near historic red library building.", ["people", "cycling", "cubbon park", "fitness", "morning", "outdoor", "march 2024"]),
    ("asset_089", "Office Farewell Lunch for Team Lead", "2023-11-24T13:30:00Z", "November 2023", 2023, "Bengaluru", "Punjab Grill, Orion Mall", "Restaurant", ["Pradeep", "Vikram", "Team"], ["#B71C1C", "#FFCDD2"], "Team holding farewell memory card and personalized caricature gift mug for departing manager.", ["people", "office", "farewell", "team", "lunch", "bengaluru", "november 2023"]),
    ("asset_090", "Music Concert Crowd Singing Along", "2024-03-02T21:45:00Z", "March 2024", 2024, "Bengaluru", "Manpho Convention Grounds", "Outdoor", ["Pradeep", "Sneha", "Rahul"], ["#311B92", "#B388FF"], "Sea of cheering concert attendees waving phone flashlights under giant purple LED stage.", ["people", "concert", "music", "crowd", "night", "festival", "march 2024"]),
    ("asset_091", "Friend's Housewarming Pooja Ceremony", "2024-06-16T10:30:00Z", "June 2024", 2024, "Bengaluru", "Prestige Falcon City Flat", "Home", ["Pradeep", "Karthik", "Divya"], ["#FF6F00", "#FFE082"], "Attending traditional gruhapravesam rituals with mango leaf toran entrance decoration.", ["people", "housewarming", "pooja", "tradition", "friends", "home", "june 2024"]),
    ("asset_092", "Sunset Rooftop Acoustic Jam Session", "2024-09-28T18:00:00Z", "September 2024", 2024, "Bengaluru", "Indiranagar Terrace", "Home", ["Pradeep", "Arjun"], ["#BF360C", "#FFCCBC"], "Friend playing acoustic guitar on terrace beanbags during purple evening twilight.", ["people", "music", "guitar", "rooftop", "sunset", "friends", "september 2024"]),
    ("asset_093", "Pottery Workshop First Clay Bowl", "2024-05-04T15:30:00Z", "May 2024", 2024, "Bengaluru", "Clay Station, HSR Layout", "Clinic", ["Pradeep", "Sneha"], ["#795548", "#D7CCC8"], "Laughing with hands caked in wet grey terracotta clay shaping first bowl on pottery wheel.", ["people", "pottery", "art", "workshop", "clay", "hobby", "may 2024"])
]

for item in people_items:
    aid, title, dt, approx, yr, city, place, cat, ppl, cols, desc, tags = item
    add_asset(aid, title, "People", None, None, dt, approx, yr, city, place, cat, ppl, None, cols, f"Photo of social event at {place}.", desc, tags)

# =========================================================================
# 5. FOOD & DINING (asset_094 to asset_108, 15 assets)
# contentType: "Food"
# =========================================================================

food_items = [
    ("asset_094", "Crispy Masala Dosa Breakfast - Vidyarthi Bhavan", "2024-03-17T08:30:00Z", "March 2024", 2024, "Bengaluru", "Vidyarthi Bhavan, Gandhi Bazaar", "Restaurant", ["Pradeep"], ["#E65100", "#FFE082"], "Iconic thick golden-brown ghee roast masala dosa served with fresh coconut chutney bowl.", ["food", "dosa", "breakfast", "vidyarthi bhavan", "south indian", "coffee", "march 2024"]),
    ("asset_095", "Artisanal Flat White Coffee & Latte Art", "2024-05-12T10:00:00Z", "May 2024", 2024, "Bengaluru", "Blue Tokai Coffee, Koramangala", "Restaurant", ["Pradeep"], ["#4E342E", "#D7CCC8"], "Creamy textured microfoam tulip latte art in turquoise ceramic cup on wooden tray.", ["food", "coffee", "latte", "cafe", "blue tokai", "koramangala", "may 2024"]),
    ("asset_096", "Sourdough Toast with Poached Egg & Avocado", "2024-06-23T10:30:00Z", "June 2024", 2024, "Bengaluru", "Third Wave Coffee, Indiranagar", "Restaurant", ["Pradeep", "Sneha"], ["#33691E", "#DCEDC8"], "Thick slice of toasted artisan sourdough topped with mashed avocado, chili flakes, and poached egg.", ["food", "avocado toast", "breakfast", "brunch", "cafe", "healthy", "june 2024"]),
    ("asset_097", "Handmade Truffle Tagliatelle Pasta", "2024-08-14T20:45:00Z", "August 2024", 2024, "Bengaluru", "Chianti Ristorante, Koramangala", "Restaurant", ["Pradeep", "Sneha"], ["#F57F17", "#FFF9C4"], "Fresh ribbon egg pasta tossed in creamy black truffle emulsion with shaved aged parmesan cheese.", ["food", "pasta", "italian", "dinner", "truffle", "restaurant", "august 2024"]),
    ("asset_098", "Old Delhi Butter Chicken & Garlic Naan", "2023-10-04T13:30:00Z", "October 2023", 2023, "Delhi", "Moti Mahal, Daryaganj", "Restaurant", ["Pradeep", "Father"], ["#B71C1C", "#FFCDD2"], "Rich velvety tomato gravy chicken curry garnished with fresh cream and piping hot blistered tandoori naan.", ["food", "butter chicken", "delhi", "naan", "curry", "lunch", "october 2023"]),
    ("asset_099", "Woodfired Margherita Pizza with Fresh Basil", "2024-04-20T19:30:00Z", "April 2024", 2024, "Bengaluru", "Brik Oven, Church Street", "Restaurant", ["Pradeep", "Rahul"], ["#D84315", "#FFCCBC"], "Authentic Neapolitan blistered leopard crust pizza with San Marzano tomatoes and melted buffalo mozzarella.", ["food", "pizza", "margherita", "italian", "dinner", "church street", "april 2024"]),
    ("asset_100", "Steaming Tonkotsu Ramen with Chashu Pork", "2024-09-15T13:45:00Z", "September 2024", 2024, "Bengaluru", "Harima Japanese Restaurant, Residency Road", "Restaurant", ["Pradeep"], ["#BF360C", "#FFE0B2"], "Rich 12-hour pork bone broth noodles with seasoned soft-boiled ramen egg, bamboo shoots, and nori sheet.", ["food", "ramen", "japanese", "noodles", "soup", "lunch", "september 2024"]),
    ("asset_101", "Mango Bingsu Shaved Milk Ice Dessert", "2024-05-25T16:30:00Z", "May 2024", 2024, "Bengaluru", "Snowy Village, Brigade Road", "Restaurant", ["Pradeep", "Sneha"], ["#F57F17", "#FFF59D"], "Tower of fluffy Korean shaved milk ice drenched in sweet Alphonso mango cubes and condensed milk.", ["food", "dessert", "mango", "ice cream", "korean", "sweet", "may 2024"]),
    ("asset_102", "Fresh Filter Coffee in Brass Davarah Tumbler", "2024-01-10T07:15:00Z", "January 2024", 2024, "Bengaluru", "Brahmin's Coffee Bar, Shankarpuram", "Restaurant", ["Pradeep"], ["#4E342E", "#FFE082"], "Frothy South Indian chicory filter coffee served in gleaming traditional South Indian brass cup.", ["food", "coffee", "filter coffee", "brahmins", "breakfast", "traditional", "january 2024"]),
    ("asset_103", "Street Food Pani Puri at VV Puram Food Street", "2024-07-06T18:30:00Z", "July 2024", 2024, "Bengaluru", "VV Puram Food Street", "Outdoor", ["Pradeep", "Karthik"], ["#1B5E20", "#DCEDC8"], "Crispy semolina puris filled with spicy mint water, mashed potatoes, and sweet tamarind date chutney.", ["food", "chaat", "pani puri", "street food", "snack", "vv puram", "july 2024"]),
    ("asset_104", "Sunday Seafood Thali Feast", "2024-11-18T13:30:00Z", "November 2024", 2024, "Goa", "Fisherman's Wharf, Cavelossim", "Restaurant", ["Pradeep", "Sneha"], ["#BF360C", "#FFAB91"], "Stainless steel round platter loaded with rava fried surmai kingfish, prawn curry, clams, and sol kadhi.", ["food", "goa", "seafood", "fish thali", "curry", "lunch", "november 2024"]),
    ("asset_105", "Fresh Blueberry Cheesecake Slice", "2024-02-14T17:00:00Z", "February 2024", 2024, "Bengaluru", "Glen's Bakehouse, Lavelle Road", "Restaurant", ["Pradeep", "Sneha"], ["#4A148C", "#E1BEE7"], "Decadent baked New York cheesecake topped with glossed sweet blueberry compote.", ["food", "cheesecake", "dessert", "cake", "bakery", "sweet", "february 2024"]),
    ("asset_106", "Dim Sum Steamer Basket - Prawn Har Gow", "2024-10-18T20:00:00Z", "October 2024", 2024, "Bengaluru", "Yauatcha, 1 MG Mall", "Restaurant", ["Pradeep", "Karthik"], ["#E0E0E0", "#FAFAFA"], "Translucent pleated bamboo steamer dumplings with fresh wild prawns and chili oil dip.", ["food", "dim sum", "chinese", "dumplings", "dinner", "yauatcha", "october 2024"]),
    ("asset_107", "Home Cooked Dal Tadka & Jeera Rice", "2024-08-10T13:15:00Z", "August 2024", 2024, "Bengaluru", "Home Dining Table", "Home", ["Pradeep"], ["#F57F17", "#FFF9C4"], "Yellow arhar dal tempered with ghee, garlic, and cumin seeds served with fragrant basmati jeera rice.", ["food", "home food", "dal tadka", "comfort food", "lunch", "home", "august 2024"]),
    ("asset_108", "Mexican Burrito Bowl with Guacamole", "2024-06-02T13:00:00Z", "June 2024", 2024, "Bengaluru", "Chinita Real Mexican Food, Indiranagar", "Restaurant", ["Pradeep"], ["#1B5E20", "#DCEDC8"], "Vibrant cilantro rice bowl topped with black beans, roasted corn salsa, pico de gallo, and fresh guacamole.", ["food", "mexican", "burrito bowl", "healthy", "lunch", "indiranagar", "june 2024"])
]

for item in food_items:
    aid, title, dt, approx, yr, city, place, cat, ppl, cols, desc, tags = item
    add_asset(aid, title, "Food", None, None, dt, approx, yr, city, place, cat, ppl, None, cols, f"Food photo taken at {place}.", desc, tags)

# =========================================================================
# 6. SCREENSHOTS & DIGITAL ARTIFACTS (asset_109 to asset_120, 12 assets)
# contentType: "Screenshot"
# =========================================================================

screenshot_items = [
    ("asset_109", "Nike Pegasus 40 Running Shoes Checkout", "2024-07-12T14:20:00Z", "July 2024", 2024, "Bengaluru", "Nike App", "Home", ["Pradeep"], ["#212121", "#FAFAFA"], "Screenshot of Nike shopping cart showing white & blue Pegasus 40 running shoes size UK 9 with discount code.", ["screenshot", "shoes", "nike", "shopping", "sneakers", "order", "july 2024"]),
    ("asset_110", "IndiGo Flight Ticket BLR to GOI Boarding Pass", "2024-11-13T16:45:00Z", "November 2024", 2024, "Bengaluru", "IndiGo Mobile App", "Home", ["Pradeep"], ["#0D47A1", "#BBDEFB"], "Digital boarding pass barcode screenshot for flight 6E-512 Bangalore to Goa departing 07:15 AM seat 12F.", ["screenshot", "flight", "ticket", "indigo", "boarding pass", "travel", "november 2024"]),
    ("asset_111", "Passport Renewal Online Application Receipt", "2024-02-08T11:10:00Z", "February 2024", 2024, "Bengaluru", "Passport Seva Portal", "Home", ["Pradeep"], ["#37474F", "#ECEFF1"], "Official Government of India Passport Seva appointment confirmation slip screenshot with ARN number.", ["screenshot", "passport", "document", "government", "appointment", "february 2024"]),
    ("asset_112", "WhatsApp Chat Directions to Wedding Venue", "2024-12-20T18:30:00Z", "December 2024", 2024, "Bengaluru", "WhatsApp Messenger", "Home", ["Pradeep", "Aditya"], ["#00796B", "#E0F2F1"], "Screenshot of chat message with GPS coordinates and gate security code for Fairmont Jaipur wedding entrance.", ["screenshot", "chat", "whatsapp", "directions", "wedding", "december 2024"]),
    ("asset_113", "Amazon Order Details - Noise Cancelling Headphones", "2024-05-02T19:15:00Z", "May 2024", 2024, "Bengaluru", "Amazon App", "Home", ["Pradeep"], ["#FF9900", "#232F3E"], "Amazon order confirmation screen showing Sony WH-1000XM5 headphones in Silver arriving Friday.", ["screenshot", "amazon", "shopping", "headphones", "order", "may 2024"]),
    ("asset_114", "BookMyShow Concert QR Code Tickets", "2024-03-01T20:00:00Z", "March 2024", 2024, "Bengaluru", "BookMyShow App", "Home", ["Pradeep"], ["#C62828", "#FFCDD2"], "Mobile ticketing screen showing 2 VIP lounge admission QR codes for live music fest.", ["screenshot", "tickets", "concert", "qr code", "bookmyshow", "music", "march 2024"]),
    ("asset_115", "Flat Rental Agreement Stamp Paper Excerpt", "2024-06-01T15:00:00Z", "June 2024", 2024, "Bengaluru", "Email PDF Viewer", "Home", ["Pradeep"], ["#4E342E", "#D7CCC8"], "Screenshot of first page of Bangalore e-stamp paper rental agreement specifying security deposit and rent terms.", ["screenshot", "document", "rental agreement", "flat", "legal", "june 2024"]),
    ("asset_116", "Swiggy Food Delivery Order History", "2024-08-18T21:30:00Z", "August 2024", 2024, "Bengaluru", "Swiggy App", "Home", ["Pradeep"], ["#E65100", "#FFE0B2"], "App screenshot showing delivery of mild chicken soup and curd rice during recovery from stomach bug.", ["screenshot", "swiggy", "food delivery", "order", "soup", "august 2024"]),
    ("asset_117", "Google Maps Saved Custom Travel Itinerary", "2024-11-10T22:15:00Z", "November 2024", 2024, "Bengaluru", "Google Maps", "Home", ["Pradeep"], ["#4285F4", "#E8F0FE"], "Saved map pins and saved lists showing top cafes and sunset viewpoints in North and South Goa.", ["screenshot", "maps", "goa", "itinerary", "travel plan", "november 2024"]),
    ("asset_118", "Apple Watch Workout Summary - 10K Run", "2024-09-22T08:15:00Z", "September 2024", 2024, "Bengaluru", "Apple Fitness App", "Home", ["Pradeep"], ["#C2185B", "#F8BBD0"], "Cardio activity summary screenshot showing 10.2 km morning run completed in 54 minutes at 5'18\" pace.", ["screenshot", "fitness", "running", "workout", "apple watch", "health", "september 2024"]),
    ("asset_119", "Zara Winter Jacket Wishlist Screen", "2024-10-05T13:40:00Z", "October 2024", 2024, "Bengaluru", "Zara App", "Home", ["Pradeep"], ["#212121", "#BDBDBD"], "Saved product screenshot of wool blend camel double-breasted overcoat for upcoming winter trip.", ["screenshot", "zara", "clothing", "fashion", "jacket", "shopping", "october 2024"]),
    ("asset_120", "Electricity Bill Payment Receipt - BESCOM", "2024-07-05T11:00:00Z", "July 2024", 2024, "Bengaluru", "PhonePe App", "Home", ["Pradeep"], ["#5E35B1", "#EDE7F6"], "Digital transaction success screenshot for Bangalore electricity board monthly bill payment.", ["screenshot", "bill", "receipt", "bescom", "utility", "phonepe", "july 2024"])
]

for item in screenshot_items:
    aid, title, dt, approx, yr, city, place, cat, ppl, cols, desc, tags = item
    add_asset(aid, title, "Screenshot", None, None, dt, approx, yr, city, place, cat, ppl, None, cols, f"Screenshot of digital screen at {place}.", desc, tags)

# =========================================================================
# 7. PETS & EVERYDAY LIFE (asset_121 to asset_130, 10 assets)
# contentType: "Pet"
# =========================================================================

pet_items = [
    ("asset_121", "Golden Retriever Bruno Catching Frisbee at Beach", "2024-11-16T17:00:00Z", "November 2024", 2024, "Goa", "Morjim Dog Beach", "Beach", ["Pradeep", "Bruno"], ["#F57F17", "#FFF9C4"], "Happy golden retriever leaping mid-air over foaming ocean waves to catch red flying disc.", ["pet", "dog", "bruno", "beach", "goa", "golden retriever", "playful", "november 2024"]),
    ("asset_122", "Bruno Sleeping Curled Up on Wool Rug", "2024-08-15T15:00:00Z", "August 2024", 2024, "Bengaluru", "Home Living Room", "Home", ["Bruno"], ["#6D4C41", "#D7CCC8"], "Golden dog fast asleep belly up on soft beige living room carpet on a monsoon afternoon.", ["pet", "dog", "bruno", "sleeping", "home", "cute", "august 2024"]),
    ("asset_123", "Ginger Cat Milo Basking in Sunlit Window", "2024-04-18T10:30:00Z", "April 2024", 2024, "Bengaluru", "Home Bedroom Window", "Home", ["Milo"], ["#E65100", "#FFE082"], "Striped ginger tabby cat dozing on cushioned windowsill with dust motes dancing in warm sunbeam.", ["pet", "cat", "milo", "sunlight", "window", "home", "cozy", "april 2024"]),
    ("asset_124", "Bruno with Wet Nose Waiting for Morning Walk", "2024-06-12T06:45:00Z", "June 2024", 2024, "Bengaluru", "Apartment Foyer", "Home", ["Pradeep", "Bruno"], ["#4E342E", "#BCAAA4"], "Close-up portrait of golden retriever sitting patiently by front door with red leash in mouth.", ["pet", "dog", "bruno", "walk", "morning", "home", "june 2024"]),
    ("asset_125", "Milo the Cat Investigating New Delivery Cardboard Box", "2024-09-02T19:00:00Z", "September 2024", 2024, "Bengaluru", "Home Hall", "Home", ["Milo"], ["#8D6E63", "#D7CCC8"], "Playful cat peeking curious green eyes over brown Amazon shipping box flaps.", ["pet", "cat", "milo", "box", "playful", "home", "september 2024"]),
    ("asset_126", "Bruno Splashing in Garden Water Sprinkler", "2024-05-18T16:00:00Z", "May 2024", 2024, "Bengaluru", "Backyard Lawn", "Outdoor", ["Bruno"], ["#1B5E20", "#81D4FA"], "Golden dog joyfully chasing rotating lawn sprinkler droplets on summer afternoon.", ["pet", "dog", "bruno", "sprinkler", "water", "garden", "summer", "may 2024"]),
    ("asset_127", "Cozy Rainy Afternoon Window with Steaming Tea", "2024-07-24T16:30:00Z", "July 2024", 2024, "Bengaluru", "Living Room Window", "Home", ["Pradeep"], ["#37474F", "#90A4AE"], "Raindrops streaking glass pane looking out over green Bengaluru trees with a warm mug of chai.", ["everyday", "rain", "window", "tea", "cozy", "monsoon", "home", "july 2024"]),
    ("asset_128", "Minimalist Dual-Monitor Work from Home Desk Setup", "2024-03-05T09:00:00Z", "March 2024", 2024, "Bengaluru", "Study Room", "Home", ["Pradeep"], ["#212121", "#616161"], "Clean oak wood desk setup with mechanical keyboard, curved ultrawide monitor, and warm desk lamp.", ["everyday", "desk", "workspace", "setup", "home office", "minimal", "march 2024"]),
    ("asset_129", "Lalbagh Botanical Garden Lotus Pond in Bloom", "2024-08-01T07:30:00Z", "August 2024", 2024, "Bengaluru", "Lalbagh Botanical Garden", "Outdoor", ["Pradeep"], ["#1B5E20", "#F48FB1"], "Vibrant pink lotus flowers and broad floating green lily pads in tranquil heritage garden pond.", ["everyday", "nature", "lotus", "lalbagh", "flowers", "bengaluru", "outdoor", "august 2024"]),
    ("asset_130", "Vintage Blue Bicycle Parked Against Weathered Brick Wall", "2024-02-18T17:15:00Z", "February 2024", 2024, "Bengaluru", "Richmond Town Lane", "Outdoor", ["Pradeep"], ["#0277BD", "#A1887F"], "Classic retro roadster bicycle with wicker basket parked under pink bougainvillea tree.", ["everyday", "bicycle", "vintage", "street", "bengaluru", "outdoor", "february 2024"])
]

for item in pet_items:
    aid, title, dt, approx, yr, city, place, cat, ppl, cols, desc, tags = item
    add_asset(aid, title, "Pet", None, None, dt, approx, yr, city, place, cat, ppl, None, cols, f"Photo of {title} at {place}.", desc, tags)

print(f"Total assets defined: {len(assets)}")

# Save JSON datasets
json_payload = json.dumps(assets, indent=2)

for target_dir in [FRONTEND_DATA_DIR, FRONTEND_PUBLIC_DATA_DIR, BACKEND_DATA_DIR]:
    target_path = os.path.join(target_dir, "photoLibrary.json")
    with open(target_path, "w", encoding="utf-8") as f:
        f.write(json_payload)
    print(f"Saved: {target_path}")

# =========================================================================
# WebP Thumbnail Generator
# =========================================================================

def hex_to_rgb(hex_code):
    hex_code = hex_code.lstrip('#')
    return tuple(int(hex_code[i:i+2], 16) for i in (0, 2, 4))

def generate_thumbnail(asset):
    width, height = 400, 400
    img = Image.new("RGB", (width, height), color="#FFFFFF")
    draw = ImageDraw.Draw(img)

    # Base Colors
    colors = asset["visualAttributes"].get("dominantColors", ["#1A73E8", "#F1F3F4"])
    c1 = hex_to_rgb(colors[0]) if len(colors) > 0 else (26, 115, 232)
    c2 = hex_to_rgb(colors[1]) if len(colors) > 1 else (241, 243, 244)

    # Vertical subtle gradient
    for y in range(height):
        ratio = y / height
        r = int(c1[0] * (1 - ratio * 0.7) + c2[0] * (ratio * 0.7))
        g = int(c1[1] * (1 - ratio * 0.7) + c2[1] * (ratio * 0.7))
        b = int(c1[2] * (1 - ratio * 0.7) + c2[2] * (ratio * 0.7))
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # Inner Card / Frame
    margin = 20
    card_bg = (255, 255, 255, 230)
    card_outline = (220, 224, 230)
    draw.rounded_rectangle(
        [(margin, margin), (width - margin, height - margin)],
        radius=16,
        fill=(255, 255, 255),
        outline=card_outline,
        width=2
    )

    # Content Type Glyph & Header
    content_type = asset["contentType"]
    category_glyph = {
        "Document": "Rx DOCUMENT",
        "Travel": "TRAVEL",
        "People": "PEOPLE & EVENT",
        "Food": "FOOD & DINING",
        "Screenshot": "SCREENSHOT",
        "Pet": "PET & LIFE"
    }.get(content_type, "PHOTO")

    # Header Banner in card
    draw.rounded_rectangle(
        [(margin + 12, margin + 12), (width - margin - 12, margin + 44)],
        radius=8,
        fill=(245, 247, 250)
    )

    # Category Text
    draw.text((margin + 20, margin + 20), category_glyph, fill=(95, 99, 104))

    # Condition badge if prescription
    if asset.get("condition"):
        cond_text = f"• {asset['condition']}"
        draw.text((margin + 160, margin + 20), cond_text, fill=(26, 115, 232))

    # Visual Center Graphic based on type
    center_y = 170
    if content_type == "Document":
        # Simulate Prescription / Medical Sheet
        doc_x1, doc_y1 = margin + 30, margin + 60
        doc_x2, doc_y2 = width - margin - 30, height - margin - 60
        draw.rectangle([(doc_x1, doc_y1), (doc_x2, doc_y2)], fill=(250, 250, 252), outline=(218, 220, 224), width=1)
        
        # Rx symbol header
        draw.text((doc_x1 + 16, doc_y1 + 12), "Rx", fill=(26, 115, 232))
        draw.text((doc_x1 + 45, doc_y1 + 14), asset.get("documentSubType", "Medical"), fill=(60, 64, 67))
        
        # Prescription lines simulation
        line_colors = [(200, 205, 212), (180, 185, 195), (200, 205, 212)]
        for i, ly in enumerate(range(doc_y1 + 45, doc_y2 - 30, 16)):
            l_color = line_colors[i % len(line_colors)]
            lw = (doc_x2 - doc_x1 - 32) if (i % 3 != 2) else (doc_x2 - doc_x1 - 80)
            draw.line([(doc_x1 + 16, ly), (doc_x1 + 16 + lw, ly)], fill=l_color, width=2)
            
        # Stamp / Signature simulation at bottom
        draw.line([(doc_x2 - 70, doc_y2 - 14), (doc_x2 - 16, doc_y2 - 14)], fill=(26, 115, 232), width=2)

    elif content_type == "Travel":
        # Scenic sun & mountain simulation
        draw.ellipse([(width//2 - 35, center_y - 45), (width//2 + 35, center_y + 25)], fill=(255, 179, 0))
        # Mountain triangles
        draw.polygon([(margin + 20, center_y + 40), (width//2 - 20, center_y - 20), (width - margin - 50, center_y + 40)], fill=(76, 175, 80))
        draw.polygon([(width//2 - 40, center_y + 40), (width//2 + 40, center_y - 35), (width - margin - 15, center_y + 40)], fill=(46, 125, 50))

    elif content_type == "Food":
        # Plate & cutlery simulation
        draw.ellipse([(width//2 - 55, center_y - 40), (width//2 + 55, center_y + 40)], fill=(245, 245, 245), outline=(220, 220, 220), width=3)
        draw.ellipse([(width//2 - 38, center_y - 28), (width//2 + 38, center_y + 28)], fill=(255, 152, 0))
        # Fork / spoon lines
        draw.line([(width//2 - 75, center_y - 35), (width//2 - 75, center_y + 35)], fill=(158, 158, 158), width=3)
        draw.line([(width//2 + 75, center_y - 35), (width//2 + 75, center_y + 35)], fill=(158, 158, 158), width=3)

    elif content_type == "Screenshot":
        # Phone / App frame simulation
        ph_x1, ph_y1 = width//2 - 60, center_y - 55
        ph_x2, ph_y2 = width//2 + 60, center_y + 55
        draw.rounded_rectangle([(ph_x1, ph_y1), (ph_x2, ph_y2)], radius=12, fill=(240, 242, 245), outline=(33, 33, 33), width=3)
        draw.rectangle([(ph_x1 + 10, ph_y1 + 15), (ph_x2 - 10, ph_y2 - 15)], fill=(255, 255, 255))
        draw.line([(ph_x1 + 18, ph_y1 + 30), (ph_x2 - 18, ph_y1 + 30)], fill=(66, 133, 244), width=4)
        draw.line([(ph_x1 + 18, ph_y1 + 45), (ph_x2 - 30, ph_y1 + 45)], fill=(189, 189, 189), width=2)
        draw.line([(ph_x1 + 18, ph_y1 + 55), (ph_x2 - 22, ph_y1 + 55)], fill=(189, 189, 189), width=2)

    elif content_type == "People":
        # People silhouettes simulation
        draw.ellipse([(width//2 - 35, center_y - 40), (width//2 - 10, center_y - 15)], fill=(103, 58, 183))
        draw.ellipse([(width//2 + 10, center_y - 45), (width//2 + 40, center_y - 15)], fill=(156, 39, 176))
        draw.chord([(width//2 - 50, center_y - 10), (width//2 + 5, center_y + 40)], 180, 360, fill=(103, 58, 183))
        draw.chord([(width//2 - 5, center_y - 10), (width//2 + 55, center_y + 40)], 180, 360, fill=(156, 39, 176))

    else: # Pet
        # Paw simulation
        draw.ellipse([(width//2 - 16, center_y - 5), (width//2 + 16, center_y + 25)], fill=(141, 110, 99))
        draw.ellipse([(width//2 - 25, center_y - 25), (width//2 - 12, center_y - 10)], fill=(141, 110, 99))
        draw.ellipse([(width//2 - 8, center_y - 32), (width//2 + 8, center_y - 17)], fill=(141, 110, 99))
        draw.ellipse([(width//2 + 12, center_y - 25), (width//2 + 25, center_y - 10)], fill=(141, 110, 99))

    # Bottom Metadata Bar
    bottom_y = height - margin - 42
    draw.rounded_rectangle(
        [(margin + 10, bottom_y), (width - margin - 10, height - margin - 8)],
        radius=8,
        fill=(248, 249, 250),
        outline=(230, 233, 238)
    )

    # Title & Location text
    title_snippet = asset["title"]
    if len(title_snippet) > 28:
        title_snippet = title_snippet[:26] + "..."
    draw.text((margin + 18, bottom_y + 6), title_snippet, fill=(32, 33, 36))
    
    meta_line = f"{asset['approxDateLabel']} • {asset['location']['category']}"
    draw.text((margin + 18, bottom_y + 20), meta_line, fill=(128, 134, 139))

    # Save as WebP
    out_file = os.path.join(FRONTEND_PHOTOS_DIR, f"{asset['id']}.webp")
    img.save(out_file, format="WEBP", quality=85)

print("Generating thumbnails...")
for a in assets:
    generate_thumbnail(a)

print(f"Generated {len(assets)} WebP thumbnails in {FRONTEND_PHOTOS_DIR}")
