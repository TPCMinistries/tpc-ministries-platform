#!/usr/bin/env bash
# Curate Kenya 2026 photos: Sony ARW → web JPG.
#
# Pipeline:
#   ARW (35 MB) → qlmanage -t -s 1600 → PNG (~2.5 MB)
#               → sips -s format jpeg -s formatOptions 65 → JPG (~290 KB)
#
# Why this pipeline:
#   - dcraw is not installed; user asked not to install it.
#   - sips alone silently fails on ARW (writes nothing).
#   - ffmpeg lacks libraw support in this build (Conversion failed).
#   - vipsthumbnail, ImageMagick are not installed.
#   - qlmanage uses macOS's built-in Camera Raw, which handles ARW correctly,
#     and is guaranteed available on macOS — zero external installs.
#
# Curation strategy: pick N evenly-spaced ARW files from each Day folder
# (first, last, and the rest spread across the day's shoot timeline).
#
# Output: public/kenya-2026/photos/day-{NN}/{01..NN}.jpg
#
# Usage:
#   bash scripts/curate-kenya-photos.sh           # process all days, 5 per day
#   bash scripts/curate-kenya-photos.sh --per 3   # 3 photos per day
#   bash scripts/curate-kenya-photos.sh --force   # re-encode even if output exists
#   bash scripts/curate-kenya-photos.sh --day 14  # only Day 14

set -euo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

DRIVE="/Volumes/Transcend"
OUT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/public/kenya-2026/photos"
TMP="$(mktemp -d -t kenya-photos)"
trap 'rm -rf "$TMP"' EXIT

PER_DAY=5
FORCE=0
ONLY_DAY=""
QUALITY=65
MAX_SIDE=1600

while [ $# -gt 0 ]; do
  case "$1" in
    --per) PER_DAY="$2"; shift 2;;
    --force) FORCE=1; shift;;
    --day) ONLY_DAY="$2"; shift 2;;
    --quality) QUALITY="$2"; shift 2;;
    *) echo "Unknown arg: $1"; exit 2;;
  esac
done

# Day-folder → day number mapping (bash 3.2 compatible — no associative arrays).
# Days without ARW source return empty string.
day_folder() {
  case "$1" in
    01) echo "Day 01" ;;
    02) echo "day 02" ;;
    03) echo "" ;;             # Day 03 = VIDEOS only, no photos
    04) echo "Day 04" ;;
    05) echo "" ;;             # DAY 05 = B-ROLLS/MAIN/PROXY/REELS, video-only
    06) echo "Day 06" ;;
    07) echo "Day 07" ;;
    08) echo "Day 08" ;;
    09) echo "" ;;             # DAY 09 = VIDEOS only
    10) echo "" ;;             # Day 10 = beach/podcasts (no photo subfolder confirmed)
    11) echo "Day 11" ;;
    12) echo "" ;;             # Day 12 = 28 root MP4s only
    13) echo "Day 13" ;;
    14) echo "Day 14" ;;
    *) echo "" ;;
  esac
}

# Drive available?
if [ ! -d "$DRIVE" ]; then
  echo "✗ Transcend drive not mounted at $DRIVE"
  exit 1
fi

echo "Output root: $OUT_ROOT"
echo "Per day:     $PER_DAY"
echo "Quality:     $QUALITY"
echo "Max side:    $MAX_SIDE"
echo ""

# Pick N items evenly-spaced from a list piped on stdin.
# Always includes first and last; spreads remaining N-2 evenly.
pick_spread() {
  local n=$1
  awk -v N="$n" '
    { lines[NR] = $0 }
    END {
      if (NR == 0) exit
      if (NR <= N) { for (i = 1; i <= NR; i++) print lines[i]; exit }
      print lines[1]
      if (N >= 2) print lines[NR]
      for (i = 1; i <= N - 2; i++) {
        idx = int(1 + (NR - 1) * i / (N - 1))
        if (idx > 1 && idx < NR) print lines[idx]
      }
    }
  ' | sort -u
}

# Convert one ARW to web JPG. Args: <src.ARW> <dest.jpg>
# qlmanage can hang on corrupted/sibling files — perl alarm() enforces a 30s ceiling.
convert_arw() {
  local src="$1"
  local dst="$2"
  local png="$TMP/$(basename "$src").png"

  perl -e 'alarm 30; exec @ARGV' qlmanage -t -s "$MAX_SIDE" -o "$TMP" "$src" >/dev/null 2>&1
  if [ ! -f "$png" ]; then
    echo "  ✗ qlmanage produced no thumbnail for $(basename "$src")"
    return 1
  fi
  sips -s format jpeg -s formatOptions "$QUALITY" -Z "$MAX_SIDE" "$png" --out "$dst" >/dev/null 2>&1
  rm -f "$png"
  [ -f "$dst" ]
}

TOTAL=0
SKIPPED_DAYS=()
PROCESSED_DAYS=()

for day_num in 01 02 03 04 05 06 07 08 09 10 11 12 13 14; do
  if [ -n "$ONLY_DAY" ] && [ "$day_num" != "$(printf '%02d' "$ONLY_DAY")" ]; then
    continue
  fi

  folder="$(day_folder "$day_num")"
  if [ -z "$folder" ]; then
    echo "Day $day_num: (no photos — video-only)"
    SKIPPED_DAYS+=("$day_num")
    continue
  fi

  src_dir="$DRIVE/$folder"
  if [ ! -d "$src_dir" ]; then
    echo "Day $day_num: source missing ($src_dir)"
    SKIPPED_DAYS+=("$day_num")
    continue
  fi

  out_dir="$OUT_ROOT/day-$day_num"
  mkdir -p "$out_dir"

  # Find all ARW/JPG files under this day folder (incl. PHOTOS subfolder).
  # Exclude macOS sibling metadata files (._*) — these hang qlmanage.
  # bash 3.2 has no mapfile — use a while-read loop instead.
  arws=()
  while IFS= read -r line; do
    arws+=("$line")
  done < <(find "$src_dir" -type f \( -iname "*.ARW" -o -iname "*.JPG" \) ! -name "._*" 2>/dev/null | sort)
  count=${#arws[@]}

  if [ "$count" -eq 0 ]; then
    echo "Day $day_num: no .ARW/.JPG files under $src_dir"
    SKIPPED_DAYS+=("$day_num")
    continue
  fi

  # Pick PER_DAY spread evenly.
  picks=()
  while IFS= read -r p; do picks+=("$p"); done < <(printf '%s\n' "${arws[@]}" | pick_spread "$PER_DAY")

  echo "Day $day_num: $count sources → picking ${#picks[@]}"

  idx=1
  successes=0
  for src in "${picks[@]}"; do
    dst="$out_dir/$(printf '%02d' "$idx").jpg"
    if [ -f "$dst" ] && [ "$FORCE" -eq 0 ]; then
      echo "  - skip $(basename "$dst") (exists)"
      idx=$((idx + 1)); successes=$((successes + 1)); continue
    fi
    ext="${src##*.}"
    ext_lower=$(echo "$ext" | tr '[:upper:]' '[:lower:]')
    if [ "$ext_lower" = "jpg" ] || [ "$ext_lower" = "jpeg" ]; then
      # Already a JPG — just sips-resize for web.
      sips -s format jpeg -s formatOptions "$QUALITY" -Z "$MAX_SIDE" "$src" --out "$dst" >/dev/null 2>&1
      if [ -f "$dst" ]; then
        echo "  ✓ $(printf '%02d' "$idx").jpg  ($(du -k "$dst" | awk '{print $1}') KB) from JPG"
        successes=$((successes + 1))
      else
        echo "  ✗ $(printf '%02d' "$idx").jpg  sips resize failed"
      fi
    else
      if convert_arw "$src" "$dst"; then
        echo "  ✓ $(printf '%02d' "$idx").jpg  ($(du -k "$dst" | awk '{print $1}') KB) from $(basename "$src")"
        successes=$((successes + 1))
      else
        echo "  ✗ $(printf '%02d' "$idx").jpg  failed"
      fi
    fi
    idx=$((idx + 1))
  done

  TOTAL=$((TOTAL + successes))
  PROCESSED_DAYS+=("$day_num($successes)")
done

echo ""
echo "─────────────────────────────────────────────"
echo "Processed: ${#PROCESSED_DAYS[@]} days, $TOTAL JPGs total"
echo "  ${PROCESSED_DAYS[*]}"
echo "Skipped:   ${#SKIPPED_DAYS[@]} days (no photos available)"
echo "  ${SKIPPED_DAYS[*]:-(none)}"
echo "Output:    $OUT_ROOT"
