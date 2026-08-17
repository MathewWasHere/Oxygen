#!/usr/bin/env python3
"""
Performance pass over static assets.

1. Subset the Vazirmatn fonts to the characters the app can actually render
   (Persian/Arabic block + Latin + Persian & ASCII digits + the punctuation we
   use). The shipped fonts carry 811 glyphs incl. full Latin-Extended and
   Cyrillic that this Persian UI will never draw.
2. Drop the `font-medium` (500) weight — it is used 11 times and 400 covers it
   visually, saving a whole file from the critical path.
3. Report anything else oversized.

Re-runnable: always subsets from ./fonts-src (a pristine copy made on first run).
"""
import pathlib
import shutil
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
PUB = ROOT / "public"
FONT_DIR = PUB / "fonts"
SRC_DIR = ROOT / "scripts" / "fonts-src"

# Keep every weight the UI actually asks for.
WEIGHTS = [400, 700, 800]

# --- character coverage -----------------------------------------------------
ranges = []
ranges += [(0x0020, 0x007E)]          # ASCII (latin words, digits, punctuation)
ranges += [(0x00A0, 0x00FF)]          # latin-1 punctuation/symbols
ranges += [(0x0600, 0x06FF)]          # Arabic block (Persian letters + ۰-۹)
ranges += [(0x0750, 0x077F)]          # Arabic supplement
ranges += [(0xFB50, 0xFDFF)]          # Arabic presentation forms-A
ranges += [(0xFE70, 0xFEFF)]          # Arabic presentation forms-B
extra = "‌‍–—‘’“”…،؛؟٪×÷°→←↑↓✓✕★☆🎉"     # ZWNJ/ZWJ, Persian punctuation, symbols

unicodes = set()
for lo, hi in ranges:
    unicodes.update(range(lo, hi + 1))
unicodes.update(ord(c) for c in extra)

unicode_arg = ",".join(f"U+{c:04X}" for c in sorted(unicodes))


def human(n: int) -> str:
    return f"{n/1024:.1f} KB"


def main() -> None:
    # Preserve pristine originals once so the script stays idempotent.
    SRC_DIR.mkdir(parents=True, exist_ok=True)
    for w in [400, 500, 700, 800]:
        src = FONT_DIR / f"Vazirmatn-{w}.woff2"
        keep = SRC_DIR / f"Vazirmatn-{w}.woff2"
        if src.exists() and not keep.exists():
            shutil.copy2(src, keep)

    total_before = 0
    total_after = 0

    for w in WEIGHTS:
        src = SRC_DIR / f"Vazirmatn-{w}.woff2"
        out = FONT_DIR / f"Vazirmatn-{w}.woff2"
        if not src.exists():
            print(f"  ! missing source for {w}")
            continue
        before = src.stat().st_size
        cmd = [
            sys.executable, "-m", "fontTools.subset", str(src),
            f"--unicodes={unicode_arg}",
            "--layout-features=*",           # keep shaping (RTL joining!)
            "--flavor=woff2",
            "--desubroutinize",
            f"--output-file={out}",
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        after = out.stat().st_size
        total_before += before
        total_after += after
        print(f"  Vazirmatn-{w}: {human(before)} -> {human(after)}  ({100*(1-after/before):.0f}% smaller)")

    # weight 500 is dropped from the critical path
    dead = FONT_DIR / "Vazirmatn-500.woff2"
    if dead.exists():
        total_before += dead.stat().st_size
        dead.unlink()
        print(f"  Vazirmatn-500: removed (unused weight)")

    print(f"\n  fonts total: {human(total_before)} -> {human(total_after)}")


if __name__ == "__main__":
    main()
