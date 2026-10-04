"""
Generate authentic mobile app UI screenshots for asset_109 to asset_120.
Saves to frontend/public/photos/ and backend/data/photos/
"""

import os
from PIL import Image, ImageDraw, ImageFont

WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(WORKSPACE_ROOT, "frontend", "public", "photos")
BACKEND_DIR = os.path.join(WORKSPACE_ROOT, "backend", "data", "photos")

def save_both(img, asset_id):
    f_path = os.path.join(FRONTEND_DIR, f"{asset_id}.webp")
    b_path = os.path.join(BACKEND_DIR, f"{asset_id}.webp")
    img.save(f_path, "WEBP", quality=90)
    img.save(b_path, "WEBP", quality=90)
    print(f"Generated screenshot for {asset_id}")

W, H = 450, 450

# -----------------------------------------------------------------------------
# 109: Nike Pegasus 40 Shoes Checkout
# -----------------------------------------------------------------------------
img = Image.new("RGB", (W, H), (248, 248, 250))
d = ImageDraw.Draw(img)
# Phone status bar
d.rectangle([(0, 0), (W, 24)], fill=(240, 240, 242))
d.text((20, 5), "9:41", fill=(20, 20, 20))
d.text((W - 60, 5), "5G  100%", fill=(20, 20, 20))
# Nike Header
d.rectangle([(0, 24), (W, 70)], fill=(255, 255, 255))
d.text((25, 38), "NIKE", fill=(17, 17, 17))
d.text((W - 80, 38), "CART (1)", fill=(17, 17, 17))
d.line([(0, 70), (W, 70)], fill=(230, 230, 230))
# Product card
d.rectangle([(20, 85), (W - 20, 260)], fill=(255, 255, 255), outline=(225, 225, 230))
# Sneaker graphic placeholder in card
d.ellipse([(40, 115), (170, 230)], fill=(230, 235, 245))
d.text((60, 160), "👟 NIKE", fill=(17, 17, 17))
# Product Details
d.text((190, 105), "Nike Pegasus 40", fill=(17, 17, 17))
d.text((190, 125), "Men's Road Running Shoes", fill=(110, 110, 110))
d.text((190, 145), "Color: White / Blue / Crimson", fill=(110, 110, 110))
d.text((190, 165), "Size: UK 9", fill=(17, 17, 17))
d.text((190, 195), "MRP: ₹11,495.00", fill=(17, 17, 17))
# Checkout button
d.rounded_rectangle([(20, 370), (W - 20, 420)], radius=25, fill=(17, 17, 17))
d.text((160, 386), "Checkout  ➔", fill=(255, 255, 255))
save_both(img, "asset_109")


# -----------------------------------------------------------------------------
# 110: IndiGo Flight Ticket BLR to GOI Boarding Pass
# -----------------------------------------------------------------------------
img = Image.new("RGB", (W, H), (235, 240, 250))
d = ImageDraw.Draw(img)
# IndiGo Boarding Pass card
d.rounded_rectangle([(25, 25), (W - 25, H - 25)], radius=16, fill=(255, 255, 255), outline=(200, 215, 240))
# Blue header
d.rounded_rectangle([(25, 25), (W - 25, 95)], radius=16, fill=(0, 41, 148))
d.text((45, 45), "IndiGo ✈", fill=(255, 255, 255))
d.text((W - 160, 45), "BOARDING PASS", fill=(255, 215, 0))
d.text((45, 68), "FLIGHT: 6E-512  •  14 NOV 2024", fill=(200, 220, 255))
# Route
d.text((45, 120), "BLR", fill=(0, 41, 148))
d.text((95, 122), "➔ ➔ ➔", fill=(180, 180, 180))
d.text((180, 120), "GOI", fill=(0, 41, 148))
d.text((45, 142), "Bengaluru T2", fill=(100, 100, 100))
d.text((180, 142), "Goa Dabolim", fill=(100, 100, 100))
# Passenger & Seat grid
d.line([(45, 175), (W - 45, 175)], fill=(230, 230, 230), width=1)
d.text((45, 190), "PASSENGER: PRADEEP / MR", fill=(30, 30, 30))
d.text((45, 220), "SEAT: 7F (Window)", fill=(0, 41, 148))
d.text((220, 220), "GATE: 14B", fill=(0, 41, 148))
d.text((45, 245), "ZONE: 2", fill=(80, 80, 80))
d.text((220, 245), "BOARDING: 06:15 AM", fill=(80, 80, 80))
# Barcode
d.line([(45, 280), (W - 45, 280)], fill=(200, 200, 200), width=1)
for bx in range(60, W - 60, 6):
    d.line([(bx, 300), (bx, 360)], fill=(0, 0, 0), width=2 if bx % 4 != 0 else 4)
d.text((140, 375), "* 6E512BLRGOIPRADEEP *", fill=(120, 120, 120))
save_both(img, "asset_110")


# -----------------------------------------------------------------------------
# 111: Passport Renewal Online Application Receipt
# -----------------------------------------------------------------------------
img = Image.new("RGB", (W, H), (242, 245, 250))
d = ImageDraw.Draw(img)
d.rectangle([(30, 25), (W - 30, H - 25)], fill=(255, 255, 255), outline=(210, 215, 225))
# Header
d.rectangle([(30, 25), (W - 30, 85)], fill=(24, 76, 120))
d.text((45, 40), "PASSPORT SEVA", fill=(255, 255, 255))
d.text((45, 58), "Ministry of External Affairs, Govt of India", fill=(200, 225, 255))
# Receipt Details
d.text((45, 105), "APPOINTMENT CONFIRMATION RECEIPT", fill=(24, 76, 120))
d.line([(45, 125), (W - 45, 125)], fill=(220, 220, 220))
d.text((45, 140), "ARN: 24-0019482104", fill=(30, 30, 30))
d.text((45, 165), "Applicant Name: Pradeep", fill=(60, 60, 60))
d.text((45, 190), "Service Type: Re-issue of Passport", fill=(60, 60, 60))
d.text((45, 215), "PSK Location: PSK Lalbagh, Bengaluru", fill=(60, 60, 60))
d.text((45, 240), "Date & Time: 22-Aug-2024, 10:15 AM (Batch 4)", fill=(60, 60, 60))
# Payment badge
d.rounded_rectangle([(45, 275), (W - 45, 335)], radius=8, fill=(235, 250, 238), outline=(150, 220, 165))
d.text((60, 290), "STATUS: CONFIRMED ✓", fill=(20, 120, 45))
d.text((60, 310), "Payment Received: ₹1,500.00 (Ref: SBIE49281)", fill=(50, 80, 50))
save_both(img, "asset_111")


# -----------------------------------------------------------------------------
# 112: WhatsApp Chat Directions to Wedding Venue
# -----------------------------------------------------------------------------
img = Image.new("RGB", (W, H), (236, 229, 221))
d = ImageDraw.Draw(img)
# WhatsApp Top Bar
d.rectangle([(0, 0), (W, 65)], fill=(7, 94, 84))
d.text((20, 20), "←", fill=(255, 255, 255))
d.text((50, 15), "Priya & Aditya Wedding 🎉", fill=(255, 255, 255))
d.text((50, 38), "Priya, Aditya, Rahul, You", fill=(200, 230, 225))
# Incoming Chat Bubble
d.rounded_rectangle([(25, 90), (W - 40, 210)], radius=12, fill=(255, 255, 255))
d.text((40, 105), "Priya (Bride):", fill=(7, 94, 84))
d.text((40, 128), "Hey everyone! Venue directions for tonight:", fill=(20, 20, 20))
d.text((40, 148), "📍 Grand Orchid Convention, Bellary Road", fill=(20, 20, 20))
d.text((40, 168), "Security gate code: #4829 (Valet parking)", fill=(20, 20, 20))
d.text((W - 100, 190), "4:15 PM", fill=(150, 150, 150))
# Outgoing Chat Bubble
d.rounded_rectangle([(100, 230), (W - 25, 310)], radius=12, fill=(220, 248, 198))
d.text((115, 245), "Got it Priya! On our way now.", fill=(20, 20, 20))
d.text((115, 268), "See you at the Sangeet! 💃", fill=(20, 20, 20))
d.text((W - 80, 290), "4:18 PM ✓✓", fill=(70, 140, 200))
save_both(img, "asset_112")


# -----------------------------------------------------------------------------
# 113: Amazon Order Details - Headphones
# -----------------------------------------------------------------------------
img = Image.new("RGB", (W, H), (245, 246, 248))
d = ImageDraw.Draw(img)
# Amazon Header
d.rectangle([(0, 0), (W, 60)], fill=(35, 47, 62))
d.text((25, 20), "amazon.in", fill=(255, 255, 255))
d.text((W - 80, 20), "🛒 Cart", fill=(255, 153, 0))
# Order Placed Banner
d.rectangle([(0, 60), (W, 110)], fill=(255, 255, 255))
d.text((25, 75), "Order Placed, thank you! ✓", fill=(0, 118, 0))
d.text((25, 92), "Order # 402-4928104-9104821", fill=(100, 100, 100))
# Item card
d.rectangle([(20, 125), (W - 20, 310)], fill=(255, 255, 255), outline=(220, 220, 220))
d.text((40, 140), "Sony WH-1000XM5 Wireless Headphones", fill=(17, 17, 17))
d.text((40, 160), "Industry Leading Noise Canceling - Black", fill=(80, 80, 80))
d.text((40, 190), "Price: ₹29,990.00 | Qty: 1", fill=(17, 17, 17))
d.text((40, 220), "Arriving Tuesday by 8 PM", fill=(0, 118, 0))
# Yellow Action Button
d.rounded_rectangle([(40, 255), (W - 40, 295)], radius=18, fill=(255, 216, 20), outline=(240, 190, 0))
d.text((150, 268), "Track Package  ➔", fill=(17, 17, 17))
save_both(img, "asset_113")


# -----------------------------------------------------------------------------
# 114: BookMyShow Concert QR Code Tickets
# -----------------------------------------------------------------------------
img = Image.new("RGB", (W, H), (20, 24, 33))
d = ImageDraw.Draw(img)
# BMS Red top
d.rectangle([(0, 0), (W, 55)], fill=(235, 30, 60))
d.text((25, 18), "book my show", fill=(255, 255, 255))
d.text((W - 90, 18), "My Tickets", fill=(255, 255, 255))
# Ticket card
d.rounded_rectangle([(30, 75), (W - 30, H - 30)], radius=14, fill=(255, 255, 255))
d.text((50, 95), "Coldplay: Music of the Spheres", fill=(20, 20, 20))
d.text((50, 118), "DY Patil Stadium, Mumbai", fill=(100, 100, 100))
d.text((50, 140), "Date: Sat, 18 Jan 2025  •  6:00 PM", fill=(235, 30, 60))
d.text((50, 165), "2 Tickets | VIP Lounge Standing", fill=(30, 30, 30))
d.line([(50, 195), (W - 50, 195)], fill=(220, 220, 220))
# QR Code simulation
d.rectangle([(135, 215), (295, 375)], fill=(245, 245, 245), outline=(0, 0, 0), width=2)
for qx in range(150, 280, 18):
    for qy in range(230, 360, 18):
        if (qx + qy) % 2 == 0:
            d.rectangle([(qx, qy), (qx + 12, qy + 12)], fill=(0, 0, 0))
d.text((120, 390), "Scan this at Turnstile Entry", fill=(80, 80, 80))
save_both(img, "asset_114")


# -----------------------------------------------------------------------------
# 115: Flat Rental Agreement Stamp Paper Excerpt
# -----------------------------------------------------------------------------
img = Image.new("RGB", (W, H), (245, 242, 230))
d = ImageDraw.Draw(img)
# e-Stamp header
d.rectangle([(30, 20), (W - 30, 95)], fill=(230, 240, 230), outline=(50, 120, 60), width=2)
d.text((55, 30), "GOVERNMENT OF KARNATAKA", fill=(40, 100, 50))
d.text((55, 50), "NON-JUDICIAL e-STAMP CERTIFICATE", fill=(180, 40, 40))
d.text((55, 70), "Certificate No: IN-KA492810482024W  •  ₹100", fill=(50, 50, 50))
# Agreement Text
d.rectangle([(30, 105), (W - 30, H - 25)], fill=(255, 255, 255), outline=(210, 210, 210))
d.text((120, 120), "RESIDENTIAL LEASE AGREEMENT", fill=(20, 20, 20))
d.line([(50, 140), (W - 50, 140)], fill=(200, 200, 200))
lines = [
    "This Agreement made at Bengaluru on 01-Aug-2024 between:",
    "LESSOR: Smt. Lakshmi R, residing at HSR Layout",
    "LESSEE: Sri. Pradeep, Bangalore",
    "PREMISES: Flat 302, 2BHK, 14th Main, HSR Layout Sector 4",
    "MONTHLY RENT: ₹32,000/-  •  SECURITY DEPOSIT: ₹1,50,000/-",
    "TENURE: 11 Months commencing from 1st August 2024"
]
for i, l in enumerate(lines):
    d.text((45, 155 + (i * 26)), l, fill=(60, 60, 60))
d.text((W - 140, 360), "[Signed: Pradeep]", fill=(20, 50, 140))
save_both(img, "asset_115")


# -----------------------------------------------------------------------------
# 116: Swiggy Food Delivery Order History
# -----------------------------------------------------------------------------
img = Image.new("RGB", (W, H), (245, 245, 248))
d = ImageDraw.Draw(img)
d.rectangle([(0, 0), (W, 60)], fill=(252, 128, 25))
d.text((25, 20), "Swiggy", fill=(255, 255, 255))
d.text((W - 120, 20), "Orders", fill=(255, 255, 255))
d.rounded_rectangle([(25, 80), (W - 25, H - 35)], radius=12, fill=(255, 255, 255), outline=(230, 230, 230))
d.text((45, 100), "Meghana Foods - Koramangala", fill=(20, 20, 20))
d.text((45, 125), "Order Delivered ✓  •  18 Aug 2024, 1:30 PM", fill=(60, 150, 80))
d.line([(45, 150), (W - 45, 150)], fill=(230, 230, 230))
d.text((45, 170), "1x  Mild Chicken Clear Soup", fill=(50, 50, 50))
d.text((W - 110, 170), "₹180.00", fill=(50, 50, 50))
d.text((45, 200), "1x  Curd Rice with Pomegranate", fill=(50, 50, 50))
d.text((W - 110, 200), "₹140.00", fill=(50, 50, 50))
d.text((45, 230), "Taxes & Delivery Fee", fill=(100, 100, 100))
d.text((W - 110, 230), "₹100.00", fill=(100, 100, 100))
d.line([(45, 260), (W - 45, 260)], fill=(230, 230, 230))
d.text((45, 280), "TOTAL PAID (Google Pay UPI):", fill=(20, 20, 20))
d.text((W - 110, 280), "₹420.00", fill=(252, 128, 25))
save_both(img, "asset_116")


# -----------------------------------------------------------------------------
# 117: Google Maps Saved Custom Travel Itinerary
# -----------------------------------------------------------------------------
img = Image.new("RGB", (W, H), (235, 240, 245))
d = ImageDraw.Draw(img)
# Map background grid
for x in range(0, W, 40):
    d.line([(x, 0), (x, H)], fill=(220, 228, 235), width=1)
for y in range(0, H, 40):
    d.line([(0, y), (W, y)], fill=(220, 228, 235), width=1)
# Route line in blue
d.line([(80, 120), (180, 200), (280, 160), (380, 260)], fill=(66, 133, 244), width=5)
# Top Search pill
d.rounded_rectangle([(25, 25), (W - 25, 75)], radius=25, fill=(255, 255, 255), outline=(200, 200, 200))
d.text((50, 42), "📍 Goa Beach Itinerary (12 saved pins)", fill=(32, 33, 36))
# Saved card at bottom
d.rounded_rectangle([(25, 280), (W - 25, H - 25)], radius=12, fill=(255, 255, 255), outline=(200, 200, 200))
d.text((45, 298), "Palolem Beach ➔ Fontainhas Bakery", fill=(32, 33, 36))
d.text((45, 322), "52 min (34 km)  •  Fastest route", fill=(30, 142, 62))
d.text((45, 346), "Saved in: Goa Trip November 2024", fill=(100, 100, 100))
save_both(img, "asset_117")


# -----------------------------------------------------------------------------
# 118: Apple Watch Workout Summary - 10K Run
# -----------------------------------------------------------------------------
img = Image.new("RGB", (W, H), (0, 0, 0))
d = ImageDraw.Draw(img)
# Apple Fitness UI
d.text((30, 30), "OUTDOOR RUN", fill=(160, 255, 0))
d.text((30, 60), "10.24", fill=(255, 255, 255))
d.text((190, 80), "KM", fill=(160, 255, 0))
# Stats 2x2 grid
d.line([(30, 140), (W - 30, 140)], fill=(40, 40, 40))
d.text((30, 160), "TIME", fill=(150, 150, 150))
d.text((30, 185), "54:12", fill=(255, 255, 255))
d.text((230, 160), "AVG PACE", fill=(150, 150, 150))
d.text((230, 185), "5'17\" /KM", fill=(255, 255, 255))
d.line([(30, 230), (W - 30, 230)], fill=(40, 40, 40))
d.text((30, 250), "ACTIVE CALS", fill=(150, 150, 150))
d.text((30, 275), "684 KCAL", fill=(255, 59, 48))
d.text((230, 250), "AVG HEART RATE", fill=(150, 150, 150))
d.text((230, 275), "156 BPM", fill=(255, 45, 85))
# Concentric activity rings
cx, cy = W // 2, 370
d.ellipse([(cx - 45, cy - 45), (cx + 45, cy + 45)], outline=(255, 59, 48), width=8)
d.ellipse([(cx - 32, cy - 32), (cx + 32, cy + 32)], outline=(160, 255, 0), width=8)
d.ellipse([(cx - 19, cy - 19), (cx + 19, cy + 19)], outline=(0, 210, 255), width=8)
save_both(img, "asset_118")


# -----------------------------------------------------------------------------
# 119: Zara Winter Jacket Wishlist Screen
# -----------------------------------------------------------------------------
img = Image.new("RGB", (W, H), (255, 255, 255))
d = ImageDraw.Draw(img)
# Zara minimal header
d.text((30, 25), "Z A R A", fill=(0, 0, 0))
d.text((W - 120, 25), "WISHLIST (3)", fill=(0, 0, 0))
d.line([(0, 60), (W, 60)], fill=(0, 0, 0), width=1)
# Coat sketch/box
d.rectangle([(40, 80), (180, 280)], fill=(225, 205, 175), outline=(180, 160, 130))
d.text((60, 160), "🧥 COAT", fill=(80, 60, 40))
# Product description
d.text((205, 95), "WOOL BLEND OVERCOAT", fill=(0, 0, 0))
d.text((205, 120), "Camel  •  Selected Size: L", fill=(120, 120, 120))
d.text((205, 145), "₹12,990.00", fill=(0, 0, 0))
d.text((205, 175), "In Stock in Bangalore Stores", fill=(30, 140, 60))
# Black add button
d.rectangle([(40, 320), (W - 40, 380)], fill=(0, 0, 0))
d.text((125, 342), "MOVE TO SHOPPING BAG", fill=(255, 255, 255))
save_both(img, "asset_119")


# -----------------------------------------------------------------------------
# 120: Electricity Bill Payment Receipt - BESCOM
# -----------------------------------------------------------------------------
img = Image.new("RGB", (W, H), (242, 245, 248))
d = ImageDraw.Draw(img)
# Header
d.rectangle([(0, 0), (W, 70)], fill=(13, 71, 161))
d.text((25, 20), "BESCOM - BANGALORE ELECTRICITY", fill=(255, 255, 255))
d.text((25, 42), "Online Consumer Portal Receipt", fill=(187, 222, 251))
# Card
d.rounded_rectangle([(25, 90), (W - 25, H - 30)], radius=12, fill=(255, 255, 255), outline=(220, 225, 235))
d.text((45, 110), "PAYMENT SUCCESSFUL ✓", fill=(46, 125, 50))
d.line([(45, 135), (W - 45, 135)], fill=(230, 230, 230))
d.text((45, 155), "Consumer Account ID: 4829104821", fill=(33, 33, 33))
d.text((45, 185), "Consumer Name: Pradeep", fill=(66, 66, 66))
d.text((45, 215), "Sub Division: HSR Layout, Bengaluru", fill=(66, 66, 66))
d.text((45, 245), "Bill Month: August 2024", fill=(66, 66, 66))
d.text((45, 275), "Amount Paid: ₹2,450.00", fill=(13, 71, 161))
d.text((45, 305), "Payment Mode: Google Pay UPI", fill=(66, 66, 66))
d.text((45, 335), "Transaction ID: UPI/BES/49281048", fill=(117, 117, 117))
save_both(img, "asset_120")

print("\nSUCCESS: All 12 mobile UI screenshots generated and saved!")
