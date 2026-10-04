from PIL import Image, ImageDraw, ImageFont
import os

size = 1024
image = Image.new('RGB', (size, size), color='#09090B')
draw = ImageDraw.Draw(image)

try:
    font = ImageFont.truetype("Roboto-Bold.ttf", int(size * 0.7))
except IOError:
    font = ImageFont.load_default()

# Get text bounding box for centering
text = "R"
bbox = draw.textbbox((0, 0), text, font=font)
text_width = bbox[2] - bbox[0]
text_height = bbox[3] - bbox[1]

# Adjust centering
x = (size - text_width) / 2
y = (size - text_height) / 2 - (size * 0.15) # slight manual optical adjustment

draw.text((x, y), text, fill="white", font=font)

# Save for Mobile
os.makedirs("apps/mobile/assets", exist_ok=True)
image.save("apps/mobile/assets/icon.png")
image.save("apps/mobile/assets/adaptive-icon.png")
image.save("apps/mobile/assets/favicon.png")
image.save("apps/mobile/assets/splash.png") # Splash screen background

# Web App Icons
os.makedirs("apps/web/src/app", exist_ok=True)
os.makedirs("apps/web/public", exist_ok=True)

# Also generate a smaller favicon for web
favicon = image.resize((64, 64), Image.LANCZOS)
favicon.save("apps/web/public/favicon.ico", format="ICO")

print("Generated all R logos successfully!")
