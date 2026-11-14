"""Gera os assets do pacote MSIX e o icone 300x300 da ficha da loja.

Fonte de verdade: public/icon-512.png, o icone do Hangar AI Cockpit gerado por
tools/gen_icon.py (prompt de terminal >_ com faiscas de IA). O mosaico largo e o
ecra de arranque sao compostos a partir do mesmo icone, sobre a cor de fundo do
manifesto (#111C30), para que a loja, o menu Iniciar, a barra de tarefas e o
arranque mostrem sempre a marca do produto.

Nao usar aqui o icone institucional da ALDACO: esses ficheiros vivem em
build/aldaco/ e servem para material da empresa, nao para a identidade da app.

Uso: python tools/gen-appx-assets.py
"""
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "build" / "appx" / "Assets"
STORE = ROOT / "docs" / "store"
SOURCE = ROOT / "public" / "icon-512.png"
RESAMPLE = Image.Resampling.LANCZOS

BACKGROUND = (17, 28, 48, 255)  # #111C30, igual ao BackgroundColor do manifesto
TEXT = (255, 255, 255, 255)
MUTED = (184, 198, 218, 255)
FONT_BOLD = Path("C:/Windows/Fonts/segoeuib.ttf")
FONT_REGULAR = Path("C:/Windows/Fonts/segoeui.ttf")

# escalas suportadas pelo Windows para os assets referenciados no manifesto
SCALES = (("100", 1.0), ("125", 1.25), ("150", 1.5), ("200", 2.0), ("400", 4.0))


def resize(image: Image.Image, width: int, height: int) -> Image.Image:
    return image.resize((width, height), RESAMPLE)


def save(image: Image.Image, name: str) -> None:
    image.save(ASSETS / name, optimize=True)
    print(f"  {name:<52} {image.width}x{image.height}")


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size)


def centred(draw: ImageDraw.ImageDraw, text: str, fnt, width: int, y: int, fill) -> None:
    box = draw.textbbox((0, 0), text, font=fnt)
    draw.text(((width - (box[2] - box[0])) / 2 - box[0], y), text, font=fnt, fill=fill)


def wide_tile(icon: Image.Image, factor: float) -> Image.Image:
    """Mosaico 310x150: icone a esquerda, nome do produto a direita."""
    w, h = math.ceil(310 * factor), math.ceil(150 * factor)
    im = Image.new("RGBA", (w, h), BACKGROUND)
    draw = ImageDraw.Draw(im)

    side = math.ceil(92 * factor)
    pad = math.ceil(26 * factor)
    im.alpha_composite(resize(icon, side, side), (pad, (h - side) // 2))

    title = font(FONT_BOLD, math.ceil(26 * factor))
    subtitle = font(FONT_REGULAR, math.ceil(19 * factor))
    x = pad + side + math.ceil(16 * factor)
    block = math.ceil(26 * factor) + math.ceil(6 * factor) + math.ceil(19 * factor)
    y = (h - block) // 2 - math.ceil(5 * factor)
    draw.text((x, y), "Hangar", font=title, fill=TEXT)
    draw.text((x, y + math.ceil(32 * factor)), "AI Cockpit", font=subtitle, fill=MUTED)
    return im


def splash_screen(icon: Image.Image, factor: float) -> Image.Image:
    """Ecra de arranque 620x300: icone e nome centrados sobre o fundo do manifesto."""
    w, h = math.ceil(620 * factor), math.ceil(300 * factor)
    im = Image.new("RGBA", (w, h), BACKGROUND)
    draw = ImageDraw.Draw(im)

    side = math.ceil(140 * factor)
    im.alpha_composite(resize(icon, side, side), ((w - side) // 2, math.ceil(38 * factor)))

    title = font(FONT_BOLD, math.ceil(32 * factor))
    centred(draw, "Hangar AI Cockpit", title, w, math.ceil(202 * factor), TEXT)
    subtitle = font(FONT_REGULAR, math.ceil(17 * factor))
    centred(
        draw,
        "Posto de comando para agentes de IA",
        subtitle,
        w,
        math.ceil(250 * factor),
        MUTED,
    )
    return im


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    STORE.mkdir(parents=True, exist_ok=True)

    square = Image.open(SOURCE).convert("RGBA")

    print("Logos quadrados e variantes de escala:")
    square_bases = {
        "Square150x150Logo": (150, 150),
        "Square44x44Logo": (44, 44),
        "StoreLogo": (50, 50),
    }
    for base, (width, height) in square_bases.items():
        save(resize(square, width, height), f"{base}.png")
        for label, factor in SCALES:
            save(
                resize(square, math.ceil(width * factor), math.ceil(height * factor)),
                f"{base}.scale-{label}.png",
            )

    print("Alvos do icone da lista de aplicacoes (unplated):")
    for target in (16, 24, 32, 48, 256):
        image = resize(square, target, target)
        save(image, f"Square44x44Logo.targetsize-{target}.png")
        save(image, f"Square44x44Logo.targetsize-{target}_altform-unplated.png")
        save(image, f"Square44x44Logo.targetsize-{target}_altform-lightunplated.png")

    print("Mosaico largo e ecra de arranque:")
    for label, factor in SCALES:
        save(wide_tile(square, factor), f"Wide310x150Logo.scale-{label}.png")
        save(splash_screen(square, factor), f"SplashScreen.scale-{label}.png")
    save(wide_tile(square, 1.0), "Wide310x150Logo.png")
    save(splash_screen(square, 1.0), "SplashScreen.png")

    print("Ficha da loja:")
    store_logo = STORE / "store-logo-300.png"
    resize(square, 300, 300).save(store_logo, optimize=True)
    print(f"  {store_logo.relative_to(ROOT)}   300x300")


if __name__ == "__main__":
    main()
