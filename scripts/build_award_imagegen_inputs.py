from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "awards" / "png"
OUTPUT = ROOT / "assets" / "awards" / "imagegen-inputs"


def font(size):
    for path in (
        "/System/Library/Fonts/PingFang.ttc",
        "/System/Library/Fonts/Helvetica.ttc",
    ):
        if Path(path).exists():
            return ImageFont.truetype(path, size=size)
    return ImageFont.load_default()


def make_sheet(paths, output):
    canvas = Image.new("RGB", (2048, 2048), "white")
    draw = ImageDraw.Draw(canvas)
    boxes = [
        (60, 90, 994, 974),
        (1054, 90, 1988, 974),
        (60, 1074, 994, 1958),
        (1054, 1074, 1988, 1958),
    ]
    for index, (path, box) in enumerate(zip(paths, boxes), start=1):
        x1, y1, x2, y2 = box
        draw.rounded_rectangle(box, radius=24, fill=(247, 249, 253), outline=(190, 205, 232), width=4)
        image = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
        image = ImageOps.contain(image, (x2 - x1 - 50, y2 - y1 - 70), Image.Resampling.LANCZOS)
        x = x1 + (x2 - x1 - image.width) // 2
        y = y1 + (y2 - y1 - image.height) // 2 + 12
        canvas.paste(image, (x, y))
        draw.text((x1 + 22, y1 + 16), f"AWARD {index}", font=font(24), fill=(36, 68, 128))
    canvas.save(output, optimize=True)


def make_orientation_sheet(paths, output):
    portrait_names = {
        "Xnip2026-08-21_00-26-07.png",
        "第十六届“中国电机工程学会杯”全国大学生电工数学建模竞赛三等奖.png",
        "罗涵获奖_02.png",
        "罗涵获奖_08.png",
    }
    portrait = [path for path in paths if path.name in portrait_names]
    landscape = [path for path in paths if path.name not in portrait_names]
    if len(portrait) != 4 or len(landscape) != 7:
        raise SystemExit("Expected 4 portrait and 7 landscape awards")

    canvas = Image.new("RGB", (2400, 1800), "white")
    draw = ImageDraw.Draw(canvas)
    draw.text((70, 35), "PORTRAIT CERTIFICATES — KEEP TOGETHER", font=font(34), fill=(23, 58, 134))
    portrait_boxes = [(70 + index * 575, 100, 600 + index * 575, 840) for index in range(4)]
    draw.text((70, 885), "LANDSCAPE CERTIFICATES — KEEP SEPARATE FROM PORTRAIT GROUP", font=font(34), fill=(23, 58, 134))
    landscape_boxes = [
        (70, 950, 590, 1325),
        (650, 950, 1170, 1325),
        (1230, 950, 1750, 1325),
        (1810, 950, 2330, 1325),
        (360, 1370, 880, 1745),
        (940, 1370, 1460, 1745),
        (1520, 1370, 2040, 1745),
    ]

    for path, box in zip(portrait, portrait_boxes):
        x1, y1, x2, y2 = box
        draw.rounded_rectangle(box, radius=18, fill=(247, 249, 253), outline=(190, 205, 232), width=3)
        image = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
        image = ImageOps.contain(image, (x2 - x1 - 28, y2 - y1 - 28), Image.Resampling.LANCZOS)
        canvas.paste(image, (x1 + (x2 - x1 - image.width) // 2, y1 + (y2 - y1 - image.height) // 2))

    for path, box in zip(landscape, landscape_boxes):
        x1, y1, x2, y2 = box
        draw.rounded_rectangle(box, radius=18, fill=(247, 249, 253), outline=(190, 205, 232), width=3)
        image = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
        image = ImageOps.contain(image, (x2 - x1 - 28, y2 - y1 - 28), Image.Resampling.LANCZOS)
        canvas.paste(image, (x1 + (x2 - x1 - image.width) // 2, y1 + (y2 - y1 - image.height) // 2))

    canvas.save(output, optimize=True)


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    paths = sorted(SOURCE.glob("*.png"), key=lambda path: path.name)
    if len(paths) != 11:
        raise SystemExit(f"Expected 11 award images, found {len(paths)}")
    groups = [paths[:4], paths[4:8], paths[8:]]
    for index, group in enumerate(groups, start=1):
        make_sheet(group, OUTPUT / f"awards-source-sheet-{index}.png")
    make_orientation_sheet(paths, OUTPUT / "awards-orientation-reference.png")
    print("\n".join(str(path) for path in sorted(OUTPUT.glob("*.png"))))


if __name__ == "__main__":
    main()
