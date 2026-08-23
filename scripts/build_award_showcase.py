from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
AWARDS_DIR = ROOT / "assets" / "awards" / "png"
BACKGROUND = ROOT / "assets" / "awards" / "award-showcase-gallery-background.png"
OUTPUT = ROOT / "assets" / "awards" / "award-showcase-preview-v3.png"

CANVAS = (1920, 600)
PORTRAIT_BOX = (172, 226)
LANDSCAPE_BOX = (156, 112)


def font(size: int, bold: bool = False):
    candidates = [
        "/System/Library/Fonts/PingFang.ttc",
        "/System/Library/Fonts/STHeiti Medium.ttc",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            try:
                return ImageFont.truetype(candidate, size=size, index=1 if bold else 0)
            except OSError:
                continue
    return ImageFont.load_default()


def rounded_gradient(size, left, right):
    width, height = size
    img = Image.new("RGB", size)
    px = img.load()
    for x in range(width):
        t = x / max(1, width - 1)
        c = tuple(round(left[i] * (1 - t) + right[i] * t) for i in range(3))
        for y in range(height):
            px[x, y] = c
    return img


def prepare_background():
    base = rounded_gradient(CANVAS, (15, 40, 96), (29, 68, 145)).convert("RGBA")
    gallery = Image.open(BACKGROUND).convert("RGB")

    # The model returns a 3:2 image. Crop the useful exhibition area, then fit it
    # into the right-hand portion of the ultra-wide carousel without affecting
    # the calm title area on the left.
    crop = gallery.crop((480, 30, gallery.width, 900))
    crop = crop.resize((1390, 600), Image.Resampling.LANCZOS).convert("RGBA")

    # Blend the generated gallery into the lab's deep-blue site palette.
    blue_tint = Image.new("RGBA", crop.size, (20, 57, 126, 70))
    crop = Image.alpha_composite(crop, blue_tint)
    fade = Image.new("L", crop.size)
    fd = ImageDraw.Draw(fade)
    fd.rectangle((160, 0, crop.width, crop.height), fill=255)
    for x in range(160):
        fd.line((x, 0, x, crop.height), fill=round(255 * x / 160))
    base.paste(crop, (530, 0), fade)

    # Add a restrained lower vignette so bright certificates remain grounded.
    vignette = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    vd = ImageDraw.Draw(vignette)
    for y in range(400, 600):
        alpha = round(55 * (y - 400) / 200)
        vd.line((0, y, 1920, y), fill=(5, 18, 49, alpha))
    return Image.alpha_composite(base, vignette)


def framed_certificate(path: Path, box, portrait: bool):
    frame_w, frame_h = box
    shadow_pad = 16
    layer = Image.new("RGBA", (frame_w + shadow_pad * 2, frame_h + shadow_pad * 2), (0, 0, 0, 0))

    shadow = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle(
        (shadow_pad + 3, shadow_pad + 7, shadow_pad + frame_w + 3, shadow_pad + frame_h + 7),
        radius=12,
        fill=(0, 8, 28, 150),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(10))
    layer.alpha_composite(shadow)

    frame = Image.new("RGBA", (frame_w, frame_h), (245, 248, 255, 255))
    draw = ImageDraw.Draw(frame)
    draw.rounded_rectangle((0, 0, frame_w - 1, frame_h - 1), radius=10, fill=(247, 249, 253, 255), outline=(212, 224, 246, 255), width=2)
    inner = (8, 8, frame_w - 8, frame_h - 8)

    src = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
    fitted = ImageOps.contain(src, (inner[2] - inner[0], inner[3] - inner[1]), Image.Resampling.LANCZOS)
    x = (frame_w - fitted.width) // 2
    y = (frame_h - fitted.height) // 2
    frame.paste(fitted, (x, y))

    # Thin museum-frame edge and a tiny warm metal detail, not a bulky card.
    draw.rounded_rectangle((1, 1, frame_w - 2, frame_h - 2), radius=10, outline=(230, 190, 103, 180), width=1)
    pin_y = 4 if portrait else 3
    draw.ellipse((frame_w // 2 - 3, pin_y, frame_w // 2 + 3, pin_y + 6), fill=(225, 181, 82, 230))
    layer.alpha_composite(frame, (shadow_pad, shadow_pad))
    return layer


def add_left_copy(canvas):
    draw = ImageDraw.Draw(canvas)
    white = (246, 249, 255, 255)
    soft = (185, 206, 246, 255)
    gold = (247, 199, 86, 255)

    draw.text((72, 86), "HONORS & DISTINCTIONS", font=font(17, True), fill=gold)
    draw.text((68, 126), "荣誉见证", font=font(56, True), fill=white)
    draw.rounded_rectangle((70, 207, 150, 211), radius=2, fill=gold)
    draw.text((70, 236), "每一份荣誉，都是长期投入与团队协作的见证。", font=font(19), fill=soft)

    stats = [((70, 322), "8+", "国际奖荣誉"), ((282, 322), "30+", "省级荣誉")]
    cards = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    cards_draw = ImageDraw.Draw(cards)
    for (x, y), number, label in stats:
        cards_draw.rounded_rectangle(
            (x, y, x + 184, y + 126),
            radius=20,
            fill=(7, 28, 74, 112),
            outline=(156, 186, 241, 105),
            width=1,
        )
    canvas.alpha_composite(cards)
    draw = ImageDraw.Draw(canvas)
    for (x, y), number, label in stats:
        draw.text((x + 22, y + 13), number, font=font(45, True), fill=gold)
        draw.text((x + 23, y + 78), label, font=font(18, True), fill=white)


def main():
    canvas = prepare_background()
    add_left_copy(canvas)

    paths = sorted(AWARDS_DIR.glob("*.png"), key=lambda p: p.name)
    if len(paths) != 11:
        raise SystemExit(f"Expected 11 award images, found {len(paths)}")

    portrait = []
    landscape = []
    for path in paths:
        with Image.open(path) as im:
            target = portrait if im.height > im.width else landscape
        target.append(path)

    # Portrait certificates: one calm upper rack.
    portrait_gap = 22
    portrait_total = len(portrait) * PORTRAIT_BOX[0] + (len(portrait) - 1) * portrait_gap
    portrait_x = 1248 - portrait_total // 2
    for i, path in enumerate(portrait):
        cert = framed_certificate(path, PORTRAIT_BOX, True)
        x = portrait_x + i * (PORTRAIT_BOX[0] + portrait_gap) - 16
        canvas.alpha_composite(cert, (x, 58))

    # Landscape certificates: a lower, continuous exhibition shelf.
    landscape_gap = 12
    landscape_total = len(landscape) * LANDSCAPE_BOX[0] + (len(landscape) - 1) * landscape_gap
    landscape_x = 1245 - landscape_total // 2
    for i, path in enumerate(landscape):
        cert = framed_certificate(path, LANDSCAPE_BOX, False)
        x = landscape_x + i * (LANDSCAPE_BOX[0] + landscape_gap) - 16
        canvas.alpha_composite(cert, (x, 377))

    canvas.convert("RGB").save(OUTPUT, quality=95)
    print(OUTPUT)
    print(f"portrait={len(portrait)}, landscape={len(landscape)}")


if __name__ == "__main__":
    main()
