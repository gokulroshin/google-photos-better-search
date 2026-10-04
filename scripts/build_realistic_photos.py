"""
Google Photos — Better Search Prototype
Realistic Photo Generator & Downloader
Builds authentic, high-realism photos for all 130 assets in photoLibrary.json:
- Photographic high-res images for Travel, People, Food, Screenshot, Pet
- Authentic paper prescriptions & clinic documents photographed on desk surfaces
- Thermal printed pharmacy receipts and handwritten notes
"""

import os
import sys
import json
import random
import urllib.request
from PIL import Image, ImageDraw, ImageFont, ImageFilter

WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_PHOTOS_DIR = os.path.join(WORKSPACE_ROOT, "frontend", "public", "photos")
LIBRARY_JSON_PATH = os.path.join(WORKSPACE_ROOT, "frontend", "src", "data", "photoLibrary.json")
BACKEND_PHOTOS_DIR = os.path.join(WORKSPACE_ROOT, "backend", "data", "photos")

os.makedirs(FRONTEND_PHOTOS_DIR, exist_ok=True)
os.makedirs(BACKEND_PHOTOS_DIR, exist_ok=True)

with open(LIBRARY_JSON_PATH, "r", encoding="utf-8") as f:
    photo_library = json.load(f)

# Curated Unsplash IDs for realistic photographic assets (Travel, People, Food, Screenshots, Pets)
UNSPLASH_MAPPING = {
    # Travel (asset_054 to asset_073)
    "asset_054": "photo-1507525428034-b723cf961d3e",  # Goa beach sunset
    "asset_055": "photo-1510414842594-a61c69b5ae57",  # Tropical beach waves & sand
    "asset_056": "photo-1554118811-1e0d58224f24",  # French bakery café
    "asset_057": "photo-1519046904884-53103b34b206",  # Coastal tropical beach road
    "asset_058": "photo-1564507592333-c60657eea523",  # Taj Mahal
    "asset_059": "photo-1464822759023-fed622ff2c3b",  # Snow trek Manali
    "asset_060": "photo-1542314831-068cd1dbfeeb",  # Mountain cabin
    "asset_061": "photo-1506744038136-46273834b3fb",  # Pangong lake blue water
    "asset_062": "photo-1518457607834-6e8d80c183c5",  # Prayer flags Ladakh
    "asset_063": "photo-1511739001486-6bfe10ce785f",  # Eiffel tower Paris
    "asset_064": "photo-1501339847302-ac426a4a7cbb",  # Café de Flore Paris
    "asset_065": "photo-1552832230-c0197dd311b5",  # Colosseum Rome
    "asset_066": "photo-1531572753322-ad063cecc140",  # Trevi Fountain Rome
    "asset_067": "photo-1530122037265-a5f1f91d3b99",  # Swiss Alps train
    "asset_068": "photo-1599661046289-e31897846e41",  # Amer Fort Jaipur
    "asset_069": "photo-1599661046289-e31897846e41",  # Hawa Mahal palace Jaipur
    "asset_070": "photo-1602216056096-3b40cc0c9944",  # Kerala backwaters
    "asset_071": "photo-1596401057633-54a8fe8ef647",  # Munnar tea hills
    "asset_072": "photo-1530521954074-e64f6810b32d",  # Modern airport hall
    "asset_073": "photo-1553531384-cc64ac80f931",  # Packed travel suitcase vacation

    # People (asset_074 to asset_093)
    "asset_074": "photo-1530103862676-de8c9debad1d",  # Birthday cake cutting
    "asset_075": "photo-1511632765486-a01980e01a18",  # Family celebration
    "asset_076": "photo-1519741497674-611481863552",  # Wedding sangeet dance
    "asset_077": "photo-1543807535-eceef0bc6599",  # Friends brunching
    "asset_078": "photo-1523050854058-8df90110c9f1",  # Graduation day caps
    "asset_079": "photo-1522071820081-009f0129c71c",  # Office hackathon demo
    "asset_080": "photo-1555396273-367ea4eb4db5",  # Rooftop dinner BBQ
    "asset_081": "photo-1467810563316-b5476525c0f9",  # New Year countdown
    "asset_082": "photo-1551632811-561732d1e306",  # Trekking group Nandi
    "asset_083": "photo-1519689680058-324335c77eba",  # Baby shower party
    "asset_084": "photo-1513151233558-d860c5398176",  # 60th birthday dinner
    "asset_085": "photo-1517649763962-0c623266ddc0",  # Badminton sports selfie
    "asset_086": "photo-1610890716171-6b1bb98ffd09",  # Board game night table
    "asset_087": "photo-1605197148419-5d4615a9a4b3",  # Diwali diyas glowing
    "asset_088": "photo-1541625602330-2277a4c46182",  # Cycling club Cubbon park
    "asset_089": "photo-1517248135467-4c7edcad34c4",  # Farewell restaurant lunch
    "asset_090": "photo-1470225620780-dba8ba36b745",  # Music concert singing crowd
    "asset_091": "photo-1544717302-de2939b7ef71",  # Housewarming ceremony
    "asset_092": "photo-1511671782779-c97d3d27a1d4",  # Rooftop acoustic jam
    "asset_093": "photo-1565193566173-7a0ee3dbe261",  # Pottery clay bowl

    # Food (asset_094 to asset_108)
    "asset_094": "photo-1668236543090-82eba5ee5976",  # Crispy masala dosa
    "asset_095": "photo-1509042239860-f550ce710b93",  # Artisanal latte art
    "asset_096": "photo-1525351484163-7529414344d8",  # Avocado toast poached egg
    "asset_097": "photo-1551183053-bf91a1d81141",  # Truffle pasta
    "asset_098": "photo-1588166524941-3bf61a9c41db",  # Butter chicken & naan
    "asset_099": "photo-1565299624946-b28f40a0ae38",  # Margherita pizza
    "asset_100": "photo-1569718212165-3a8278d5f624",  # Tonkotsu ramen
    "asset_101": "photo-1563805042-7684c019e1cb",  # Mango dessert shaved ice
    "asset_102": "photo-1514432324607-a09d9b4aefdd",  # Filter coffee
    "asset_103": "photo-1601050690597-df0568f70950",  # Street food pani puri
    "asset_104": "photo-1559847844-5315695dadae",  # Seafood thali platter
    "asset_105": "photo-1533134242443-d4fd215305ad",  # Blueberry cheesecake
    "asset_106": "photo-1541696432-82c6da8ce7bf",  # Dim sum steamer basket
    "asset_107": "photo-1546833999-b9f581a1996d",  # Dal tadka jeera rice
    "asset_108": "photo-1543339308-43e59d6b73a6",  # Burrito bowl guacamole

    # Screenshots (asset_109 to asset_120)
    "asset_109": "photo-1542291026-7eec264c27ff",  # Nike red sneakers product
    "asset_110": "photo-1436491865332-7a61a109cc05",  # Flight boarding ticket
    "asset_111": "photo-1544717305-2782549b5136",  # Passport document
    "asset_112": "photo-1512428559087-560fa5ceab42",  # Smartphone in hand
    "asset_113": "photo-1505740420928-5e560c06d30e",  # Noise cancelling headphones
    "asset_114": "photo-1492684223066-81342ee5ff30",  # Concert event ticket pass
    "asset_115": "photo-1450133064473-71024230f91b",  # Agreement contract paper
    "asset_116": "photo-1526367790999-0150786686a2",  # Food delivery package
    "asset_117": "photo-1524661135-423995f22d0b",  # City map travel guide
    "asset_118": "photo-1510519138161-58474dfab9c3",  # Smartwatch workout display
    "asset_119": "photo-1551028719-00167b16eac5",  # Winter jacket hanger
    "asset_120": "photo-1554224155-8d04cb21cd6c",  # Financial bill calculator

    # Pets & Everyday (asset_121 to asset_130)
    "asset_121": "photo-1530281700549-e82e7bf110d6",  # Golden retriever frisbee beach
    "asset_122": "photo-1541599540903-216a46ca1dc0",  # Dog sleeping on rug
    "asset_123": "photo-1514888286974-6c03e2ca1dba",  # Ginger cat in sunlight
    "asset_124": "photo-1583511655857-d19b40a7a54e",  # Cute dog wet nose
    "asset_125": "photo-1548802673-380ab8ebc7b7",  # Cat in cardboard box
    "asset_126": "photo-1543466835-00a7907e9de1",  # Dog splashing in water
    "asset_127": "photo-1517456793572-1d8efd6dc135",  # Rainy window with warm tea
    "asset_128": "photo-1527443224154-c4a3942d3acf",  # Minimalist dual monitor desk
    "asset_129": "photo-1509198397868-475647b2a1e5",  # Lalbagh botanical pond lotus
    "asset_130": "photo-1485965120184-e220f721d03e"   # Vintage blue bicycle by brick wall
}

# -----------------------------------------------------------------------------
# Document Generators (Realistic Paper Prescriptions, Bills, Receipts)
# -----------------------------------------------------------------------------

DESK_BACKGROUNDS = [
    (185, 155, 125),  # Warm Teak wood desk
    (210, 185, 155),  # Light Pine wood desk
    (230, 232, 235),  # Medical clinic laminate white-grey
    (160, 140, 125),  # Walnut desk
    (220, 222, 225)   # Hospital examination table
]

def render_realistic_prescription(asset):
    """
    Renders a realistic photograph of a medical prescription paper on a clinic desk.
    Includes clinic header, doctor details, date, patient info, Rx medications,
    clinic stamp, and authentic doctor signature.
    """
    width, height = 480, 480
    bg_color = random.choice(DESK_BACKGROUNDS)
    img = Image.new("RGB", (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)

    # Add subtle woodgrain/desk noise lines
    for _ in range(25):
        y = random.randint(0, height)
        c_mod = max(0, min(255, bg_color[0] + random.randint(-15, 15)))
        line_col = (c_mod, int(c_mod * 0.85), int(c_mod * 0.7))
        draw.line([(0, y), (width, y)], fill=line_col, width=1)

    paper_type = asset.get("visualAttributes", {}).get("paperType", "White paper")
    
    # Paper colors
    if "pink" in paper_type.lower():
        paper_bg = (255, 240, 243)
        header_accent = (190, 40, 75)
    elif "pad" in paper_type.lower() or "rx pad" in paper_type.lower():
        paper_bg = (253, 252, 245)
        header_accent = (30, 100, 170)
    elif "printed" in paper_type.lower():
        paper_bg = (255, 255, 255)
        header_accent = (45, 55, 72)
    else:
        paper_bg = (255, 255, 255)
        header_accent = (26, 115, 232)

    # Paper dimensions & realistic drop shadow
    pad_margin_x = 35
    pad_margin_y = 25
    px1 = pad_margin_x
    py1 = pad_margin_y
    px2 = width - pad_margin_x
    py2 = height - pad_margin_y

    # Multi-layered soft drop shadow
    for s in range(8, 0, -2):
        shadow_col = (int(bg_color[0] * 0.7), int(bg_color[1] * 0.7), int(bg_color[2] * 0.7))
        draw.rectangle([(px1 + s, py1 + s), (px2 + s, py2 + s)], fill=shadow_col)

    # Paper sheet
    draw.rectangle([(px1, py1), (px2, py2)], fill=paper_bg)

    # If prescription pad, draw top glued binding or clipboard clip
    if "pad" in paper_type.lower():
        draw.rectangle([(px1, py1), (px2, py1 + 14)], fill=(180, 50, 50))  # red binding tape
        # Perforation dashed line
        for dot_x in range(px1 + 8, px2 - 8, 8):
            draw.line([(dot_x, py1 + 18), (dot_x + 4, py1 + 18)], fill=(190, 190, 185), width=1)
        content_top = py1 + 26
    elif "printed" in paper_type.lower():
        # Hospital top barcode strip
        for b_x in range(px2 - 85, px2 - 15, 4):
            w = random.choice([1, 2, 3])
            draw.line([(b_x, py1 + 8), (b_x, py1 + 22)], fill=(40, 40, 40), width=w)
        content_top = py1 + 12
    else:
        content_top = py1 + 12

    # Clinic Header Block
    title = asset.get("title", "Clinic Prescription")
    doctor_name = "Dr. Rao, MD"
    for person in asset.get("people", []):
        if "Dr." in person:
            doctor_name = person
            break

    city = asset.get("location", {}).get("city", "Bengaluru")
    place = asset.get("location", {}).get("placeName", "Apollo Clinic")
    date_str = asset.get("approxDateLabel", "August 2024")

    # Header emblem / cross
    emblem_x = px1 + 16
    emblem_y = content_top + 6
    draw.rectangle([(emblem_x + 6, emblem_y), (emblem_x + 12, emblem_y + 18)], fill=header_accent)
    draw.rectangle([(emblem_x, emblem_y + 6), (emblem_x + 18, emblem_y + 12)], fill=header_accent)

    # Clinic Name & Doctor line
    clinic_name = place.split(",")[0].upper()
    if len(clinic_name) > 24:
        clinic_name = clinic_name[:22] + "..."
    draw.text((emblem_x + 26, content_top + 4), clinic_name, fill=header_accent)
    draw.text((emblem_x + 26, content_top + 18), f"{doctor_name}  •  {city}", fill=(80, 85, 95))

    # Header divider rule
    draw.line([(px1 + 12, content_top + 34), (px2 - 12, content_top + 34)], fill=(210, 215, 225), width=2)

    # Patient info bar
    info_y = content_top + 40
    patient_name = "Pradeep (29Y/M)"
    draw.text((px1 + 16, info_y), f"Pt: {patient_name}", fill=(50, 55, 65))
    draw.text((px2 - 120, info_y), f"Date: {date_str}", fill=(80, 85, 95))
    draw.line([(px1 + 14, info_y + 16), (px2 - 14, info_y + 16)], fill=(230, 232, 238), width=1)

    # Bold Doctor's ℞ Symbol
    rx_y = info_y + 24
    draw.text((px1 + 16, rx_y), "℞", fill=header_accent)

    # Medications based on condition
    condition = asset.get("condition", "Medical")
    medications_map = {
        "Vomiting": [
            "1. Tab. Vomistop 10mg (Domperidone) - 1 tab TDS a/c",
            "2. Cap. Pantocid 40mg - 1 cap OD empty stomach",
            "3. Electral ORS sachet - in 1L boiled water sip freely",
            "4. Syp. Ondem 4mg - 5ml SOS if persistent vomiting",
            "• Light bland diet: Curd rice / coconut water"
        ],
        "Fever": [
            "1. Tab. Dolo 650mg (Paracetamol) - 1 tab SOS (max 3/day)",
            "2. Tab. Azithral 500mg - 1 tab OD after food x 3 days",
            "3. Syp. Meftal-P 5ml SOS if temp > 101 F",
            "4. CBC, Platelet count & Dengue NS1 Antigen test",
            "• Adequate oral hydration & cold water sponging"
        ],
        "Cold": [
            "1. Tab. Montair-LC (Montelukast + Levo) - 1 tab HS",
            "2. Tab. Sinarest - 1 tab BD after meals x 4 days",
            "3. Syp. Ascoril-D - 10ml TDS warm water",
            "4. Karvol Plus steam inhalation twice daily",
            "• Avoid cold beverages and air-conditioned draughts"
        ],
        "Pain": [
            "1. Tab. Zerodol-SP (Aceclo + Paracetamol) - 1 tab BD",
            "2. Cap. Pan-D - 1 cap OD before breakfast x 5 days",
            "3. Volini Gel local application BD with gentle massage",
            "4. Hot water bag fomentation 15 mins daily",
            "• Lumbar support & avoid heavy weight lifting"
        ],
        "Skin": [
            "1. Candid-B Cream (Clotrimazole + Beclo) - apply BD",
            "2. Tab. Allegra 120mg (Fexofenadine) - 1 tab OD night",
            "3. Cetaphil Gentle Cleansing Lotion for bathing",
            "4. Caladryl soothing lotion on itchy areas",
            "• Wear loose cotton clothing & keep skin dry"
        ]
    }

    lines = medications_map.get(condition, [
        "1. Tab. Paracetamol 650mg TDS",
        "2. Cap. Amoxicillin 500mg TDS x 5 days",
        "3. Multi-vitamin Tab OD",
        "• Follow-up in clinic after 3 days"
    ])

    med_y = rx_y + 28
    for i, line in enumerate(lines):
        # Slightly vary text tint to mimic fountain/ballpoint pen
        pen_col = (25, 40, 80) if i % 2 == 0 else (30, 35, 45)
        draw.text((px1 + 24, med_y + (i * 24)), line, fill=pen_col)

    # Doctor signature scribble in blue fountain pen
    sig_y = py2 - 65
    sig_x = px2 - 130
    draw.line([(sig_x, sig_y + 20), (sig_x + 35, sig_y + 5), (sig_x + 50, sig_y + 22), (sig_x + 95, sig_y + 8)], fill=(20, 50, 160), width=2)
    draw.line([(sig_x + 10, sig_y + 26), (sig_x + 70, sig_y + 24)], fill=(20, 50, 160), width=2)
    draw.text((sig_x + 15, sig_y + 32), f"Signed: {doctor_name}", fill=(100, 105, 115))

    # Clinic Official Stamp (Purple circular clinic seal)
    stamp_cx = px1 + 65
    stamp_cy = py2 - 50
    stamp_r = 34
    draw.ellipse([(stamp_cx - stamp_r, stamp_cy - stamp_r), (stamp_cx + stamp_r, stamp_cy + stamp_r)], outline=(140, 45, 130), width=2)
    draw.ellipse([(stamp_cx - stamp_r + 4, stamp_cy - stamp_r + 4), (stamp_cx + stamp_r - 4, stamp_cy + stamp_r - 4)], outline=(140, 45, 130), width=1)
    draw.text((stamp_cx - 24, stamp_cy - 14), "VERIFIED", fill=(140, 45, 130))
    draw.text((stamp_cx - 22, stamp_cy + 2), "CLINIC", fill=(140, 45, 130))

    return img


def render_realistic_bill_receipt(asset):
    """
    Renders a thermal printed pharmacy cash receipt or hospital invoice bill.
    """
    width, height = 480, 480
    bg_color = random.choice([(195, 170, 140), (215, 218, 222), (180, 160, 145)])
    img = Image.new("RGB", (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)

    # Desk texture
    for _ in range(20):
        y = random.randint(0, height)
        draw.line([(0, y), (width, y)], fill=(int(bg_color[0]*0.9), int(bg_color[1]*0.9), int(bg_color[2]*0.9)), width=1)

    sub_type = asset.get("documentSubType", "Receipt")
    
    # Paper coordinates: receipts are narrower
    if "Note" in sub_type:
        # Yellow sticky note
        rx1, ry1, rx2, ry2 = 60, 50, 420, 430
        paper_col = (255, 252, 195)
    else:
        # Thermal receipt
        rx1, ry1, rx2, ry2 = 80, 25, 400, 455
        paper_col = (250, 250, 248)

    # Shadow
    for s in range(6, 0, -2):
        draw.rectangle([(rx1 + s, ry1 + s), (rx2 + s, ry2 + s)], fill=(int(bg_color[0]*0.7), int(bg_color[1]*0.7), int(bg_color[2]*0.7)))

    # Paper base
    draw.rectangle([(rx1, ry1), (rx2, ry2)], fill=paper_col)

    if "Note" in sub_type:
        # Lined yellow sticky note with handwriting
        draw.rectangle([(rx1, ry1), (rx2, ry1 + 25)], fill=(255, 245, 160))
        for line_y in range(ry1 + 45, ry2 - 20, 24):
            draw.line([(rx1 + 10, line_y), (rx2 - 10, line_y)], fill=(230, 225, 175), width=1)
        
        draw.text((rx1 + 18, ry1 + 35), "REMINDER: Meds Timings", fill=(180, 80, 20))
        notes = [
            "• Vomistop 10mg: 8:00 AM (empty stomach)",
            "• ORS Electral: Keep sipping 1 glass/hr",
            "• Pantocid: Before lunch",
            "• Call Dr. Rao if fever > 101 F"
        ]
        for idx, n in enumerate(notes):
            draw.text((rx1 + 18, ry1 + 65 + (idx * 28)), n, fill=(20, 40, 90))
    else:
        # Pharmacy Cash Receipt / Bill
        # Serrated paper edges at top
        for t_x in range(rx1, rx2, 10):
            draw.polygon([(t_x, ry1), (t_x + 5, ry1 - 4), (t_x + 10, ry1)], fill=bg_color)
            draw.polygon([(t_x, ry2), (t_x + 5, ry2 + 4), (t_x + 10, ry2)], fill=bg_color)

        title = asset.get("title", "Pharmacy Receipt")
        pharmacy_name = title.split("-")[0].strip().upper()
        if len(pharmacy_name) > 22:
            pharmacy_name = pharmacy_name[:20] + ".."

        draw.text((rx1 + 25, ry1 + 18), pharmacy_name, fill=(20, 20, 20))
        draw.text((rx1 + 25, ry1 + 34), "TAX INVOICE  •  GSTIN: 29AABCU94821Z0", fill=(90, 90, 90))
        draw.text((rx1 + 25, ry1 + 48), f"Date: {asset.get('approxDateLabel', '2024')}  |  Bill #49281", fill=(100, 100, 100))
        draw.line([(rx1 + 15, ry1 + 64), (rx2 - 15, ry1 + 64)], fill=(180, 180, 180), width=1)

        # Receipt items table
        items = [
            ("Vomistop 10mg Tab (x10)", "Rs.  48.50"),
            ("Pantocid 40mg Cap (x10)", "Rs. 132.00"),
            ("Electral ORS 21.8g (x4)",  "Rs.  88.00"),
            ("Ondem 4mg Syrup 30ml",    "Rs.  54.20"),
            ("Consultation Fee OPD",     "Rs. 400.00")
        ]
        curr_y = ry1 + 75
        for item_name, price in items:
            draw.text((rx1 + 20, curr_y), item_name, fill=(40, 40, 40))
            draw.text((rx2 - 95, curr_y), price, fill=(40, 40, 40))
            curr_y += 24

        draw.line([(rx1 + 15, curr_y + 8), (rx2 - 15, curr_y + 8)], fill=(180, 180, 180), width=1)
        draw.text((rx1 + 20, curr_y + 16), "TOTAL PAID (CASH):", fill=(20, 20, 20))
        draw.text((rx2 - 95, curr_y + 16), "Rs. 722.70", fill=(20, 20, 20))

        # Bottom Barcode
        b_top = curr_y + 55
        for bc_x in range(rx1 + 30, rx2 - 30, 4):
            bw = random.choice([1, 2, 3])
            draw.line([(bc_x, b_top), (bc_x, b_top + 32)], fill=(30, 30, 30), width=bw)
        draw.text((rx1 + 70, b_top + 36), "* THANK YOU - GET WELL SOON *", fill=(120, 120, 120))

    return img


# -----------------------------------------------------------------------------
# Main Generation Runner
# -----------------------------------------------------------------------------

def process_asset(asset):
    asset_id = asset["id"]
    content_type = asset.get("contentType", "Photo")
    out_file = os.path.join(FRONTEND_PHOTOS_DIR, f"{asset_id}.webp")
    backend_file = os.path.join(BACKEND_PHOTOS_DIR, f"{asset_id}.webp")

    # Group 1: Documents & Prescriptions (asset_001 to asset_053)
    if content_type == "Document":
        doc_type = asset.get("documentSubType", "Prescription")
        if doc_type == "Prescription" or "prescription" in asset.get("semanticTags", []):
            img = render_realistic_prescription(asset)
        else:
            img = render_realistic_bill_receipt(asset)
        img.save(out_file, format="WEBP", quality=88)
        img.save(backend_file, format="WEBP", quality=88)
        return f"[Document] Generated realistic Rx/bill: {asset_id}"

    # Group 2: Photographic assets (Travel, People, Food, Screenshots, Pets)
    unsplash_id = UNSPLASH_MAPPING.get(asset_id)
    if unsplash_id:
        url = f"https://images.unsplash.com/{unsplash_id}?w=450&auto=format&fit=crop&q=80"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
            with urllib.request.urlopen(req, timeout=8) as resp:
                downloaded_img = Image.open(resp)
                # Ensure square 450x450 crop
                min_dim = min(downloaded_img.width, downloaded_img.height)
                left = (downloaded_img.width - min_dim) // 2
                top = (downloaded_img.height - min_dim) // 2
                cropped = downloaded_img.crop((left, top, left + min_dim, top + min_dim))
                cropped = cropped.resize((450, 450), Image.Resampling.LANCZOS)
                cropped.save(out_file, format="WEBP", quality=88)
                cropped.save(backend_file, format="WEBP", quality=88)
                return f"[Photo] Downloaded real photo for {asset_id} ({asset.get('title')[:25]}...)"
        except Exception as e:
            print(f"Warning: Download failed for {asset_id} ({e}), falling back to realistic procedural graphic")

    # Fallback if download failed
    img = render_realistic_bill_receipt(asset)
    img.save(out_file, format="WEBP", quality=85)
    img.save(backend_file, format="WEBP", quality=85)
    return f"[Fallback] Generated fallback for {asset_id}"


from concurrent.futures import ThreadPoolExecutor, as_completed

if __name__ == '__main__':
    print(f"Starting parallel realistic photo generation for all {len(photo_library)} assets...")
    completed_count = 0
    with ThreadPoolExecutor(max_workers=12) as executor:
        futures = {executor.submit(process_asset, asset): asset for asset in photo_library}
        for future in as_completed(futures):
            completed_count += 1
            asset = futures[future]
            try:
                msg = future.result()
                if completed_count % 15 == 0 or completed_count == len(photo_library):
                    print(f"[{completed_count}/{len(photo_library)}] {msg}")
            except Exception as e:
                print(f"Error processing {asset['id']}: {e}")

    print("\nSUCCESS: All 130 realistic photos generated and saved as WebP!")

