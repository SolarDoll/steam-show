"""
Готовит рабочие ассеты из silhuete_dragon_1.png (чёрный силуэт на белом):
  dragon-mask.png    — альфа-маска (дракон непрозрачный, фон прозрачный) для CSS mask «огонь внутри»
  dragon-light.png   — белый дракон на прозрачном (для <img> на тёмном фоне, перекрашивается через CSS filter)
  dragon-outline.png — белый контур-обводка на прозрачном (контур без заливки)
Все три обрезаны по общему bounding box, чтобы совпадали.
"""
from PIL import Image, ImageFilter

SRC = "assets/silhuete_dragon_1.png"
src = Image.open(SRC).convert("RGBA")

# дракон задан альфа-каналом (чёрный силуэт с alpha, фон прозрачный) — берём альфу напрямую
alpha = src.split()[3]

# bbox по содержимому + небольшой отступ
bbox = alpha.getbbox()
pad = 12
if bbox:
    l, t, r, b = bbox
    l, t = max(0, l - pad), max(0, t - pad)
    r, b = min(alpha.width, r + pad), min(alpha.height, b + pad)
    alpha = alpha.crop((l, t, r, b))

W, H = alpha.size

def solid(color):
    img = Image.new("RGBA", (W, H), color + (0,))
    img.putalpha(alpha)
    return img

# 1) маска: цвет белый, важна альфа
solid((255, 255, 255)).save("assets/dragon-mask.png")

# 2) светлый дракон (белый) на прозрачном
solid((255, 255, 255)).save("assets/dragon-light.png")

# 3) контур: бинаризуем, берём разницу дилатации и эрозии -> обводка
binary = alpha.point(lambda p: 255 if p > 128 else 0)
k = 5  # толщина обводки ~ (k-1)
dil = binary.filter(ImageFilter.MaxFilter(k))
ero = binary.filter(ImageFilter.MinFilter(k))
outline_a = Image.eval(dil, lambda d: 0)  # placeholder
# outline alpha = dil - ero
from PIL import ImageChops
outline_a = ImageChops.subtract(dil, ero)
outline = Image.new("RGBA", (W, H), (255, 255, 255, 0))
outline.putalpha(outline_a)
outline.save("assets/dragon-outline.png")

print("done:", W, "x", H)
