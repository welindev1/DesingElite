import os

files = [
    r'c:\Users\WelinCode\Welin - OneDrive\Documentos\DesingElite\frontend\src\pages\CartPage.tsx',
    r'c:\Users\WelinCode\Welin - OneDrive\Documentos\DesingElite\frontend\src\pages\HomePage.tsx',
    r'c:\Users\WelinCode\Welin - OneDrive\Documentos\DesingElite\frontend\src\pages\ProductDetailPage.tsx',
    r'c:\Users\WelinCode\Welin - OneDrive\Documentos\DesingElite\frontend\src\pages\ShopPage.tsx',
]

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    new_lines = []
    
    skip_mode = False
    
    for i, line in enumerate(lines):
        if 'to="/servicios"' in line and '<Link' in line and ('nav_services' in line or 'setMobileNavOpen' in line):
            continue
            
        if 'to="/servicios"' in line and 'hero_btn_services' in line:
            skip_mode = True
            continue
            
        if skip_mode:
            if '</Link>' in line:
                skip_mode = False
            continue
            
        if 'href="https://discord.gg/Ea5eSa37PT"' in line:
            line = line.replace('href="https://discord.gg/Ea5eSa37PT"', 'href={import.meta.env.VITE_DISCORD_LINK || "https://discord.gg/Ea5eSa37PT"}')
            
        if 'href="https://youtube.com"' in line:
            line = line.replace('href="https://youtube.com"', 'href={import.meta.env.VITE_YOUTUBE_LINK || "https://youtube.com"}')
            
        new_lines.append(line)
        
    with open(file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines))
