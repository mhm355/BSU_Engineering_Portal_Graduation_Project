import os
import django
from django.conf import settings
from PIL import Image, ImageDraw, ImageFont

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsu_backend.settings')
django.setup()

def ensure_media_dir():
    media_root = settings.MEDIA_ROOT
    defaults_dir = os.path.join(media_root, 'defaults')
    os.makedirs(defaults_dir, exist_ok=True)
    return defaults_dir

def generate_avatar(path, text="USER", color="#3F51B5"):
    if os.path.exists(path):
        print(f"• Exists: {os.path.basename(path)}")
        return

    size = (300, 300)
    img = Image.new('RGB', size, color=color)
    d = ImageDraw.Draw(img)
    
    # Try to verify font or default
    try:
        # Simple cross/text if font fails
        d.text((75, 120), text, fill="white", align="center", font_size=50)
    except:
        # Fallback for very old Pillow or missing fonts
        d.rectangle([100, 100, 200, 200], fill="white")

    img.save(path)
    print(f"✓ Created: {os.path.basename(path)}")

def seed():
    print("=" * 60)
    print("Seeding Default Media Assets")
    print("=" * 60)
    
    defaults_dir = ensure_media_dir()
    
    # Generate default avatar
    avatar_path = os.path.join(defaults_dir, 'default_avatar.png')
    generate_avatar(avatar_path, "USER", "#3F51B5")
    
    # Generate default news image
    news_path = os.path.join(defaults_dir, 'default_news.png')
    generate_avatar(news_path, "NEWS", "#4CAF50")

    print("\nDefault media seeding complete!")

if __name__ == '__main__':
    seed()
