#!/usr/bin/env bash
# Process Kenya 2026 footage from ~/Downloads into /public/videos/kenya.
# Idempotent — re-running skips files whose target already exists.
#
# Usage:
#   bash scripts/process-kenya-content.sh                # process curated set
#   bash scripts/process-kenya-content.sh --all          # process every mp4 in Downloads
#   bash scripts/process-kenya-content.sh --force        # re-encode even if target exists
#   bash scripts/process-kenya-content.sh path/to/x.mp4  # process a single file

set -uo pipefail

DOWNLOADS="${HOME}/Downloads"
DEST="$(cd "$(dirname "$0")/.." && pwd)/public/videos/kenya"
POSTERS="${DEST}/posters"
mkdir -p "${DEST}" "${POSTERS}"

FORCE=0
ALL=0
ARGS=()
for a in "$@"; do
  case "$a" in
    --force) FORCE=1 ;;
    --all)   ALL=1 ;;
    *)       ARGS+=("$a") ;;
  esac
done

# Curated whitelist — filenames in ~/Downloads we treat as Kenya content.
CURATED=(
  "Highlight video.mp4"
  "day 12.mp4"
  "day 13.mp4"
  "DAY 11.mp4"
  "Itete market.mp4"
  "Sda church Dago.mp4"
  "Homabay.mp4"
  "Timeline 2.mp4"
  "REEL 01).mp4"
  "REEL 02.mp4"
  "reel 033.mp4"
  "VIDEO 01.mp4"
  "VIDEO 02.mp4"
  "VIDEO 03.mp4"
  "V5.mp4"
)

# Files to ALWAYS exclude (non-Kenya videos in Downloads)
EXCLUDE_PATTERNS=(
  "How America"
  "Why we must"
  "The Four A"
  "isms"
  "supremacy"
)

slugify() {
  local name="$1"
  local base="${name%.*}"
  printf '%s' "${base}" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g' \
    | sed -E 's/^-+|-+$//g'
}

is_excluded() {
  local name="$1"
  for pat in "${EXCLUDE_PATTERNS[@]}"; do
    if [[ "${name}" == *"${pat}"* ]]; then return 0; fi
  done
  return 1
}

orientation_of() {
  # echoes "vertical" or "horizontal"
  local f="$1"
  local w h
  read -r w h < <(ffprobe -v error -select_streams v:0 \
    -show_entries stream=width,height -of csv=p=0:s=' ' "$f")
  if [[ -z "${w}" || -z "${h}" ]]; then echo "horizontal"; return; fi
  if (( h > w )); then echo "vertical"; else echo "horizontal"; fi
}

process_one() {
  local src="$1"
  local name; name="$(basename "${src}")"

  if is_excluded "${name}"; then
    echo "  ⤵ skip (excluded): ${name}"
    return
  fi

  local slug; slug="$(slugify "${name}")"
  local orient; orient="$(orientation_of "${src}")"
  local out="${DEST}/${slug}.mp4"
  local poster="${POSTERS}/${slug}.jpg"

  if [[ -f "${out}" && $FORCE -eq 0 ]]; then
    echo "  ✓ already done: ${slug}.mp4"
    return
  fi

  echo "  ⚙ ${orient}: ${name} → ${slug}.mp4"

  local scale crf abr
  if [[ "${orient}" == "vertical" ]]; then
    scale="scale=720:-2"
    crf=26
    abr=96k
  else
    scale="scale=1280:-2"
    crf=24
    abr=128k
  fi

  ffmpeg -y -hide_banner -loglevel error -i "${src}" \
    -c:v libx264 -preset medium -crf "${crf}" -movflags +faststart \
    -c:a aac -b:a "${abr}" -vf "${scale}" "${out}" \
    && ffmpeg -y -hide_banner -loglevel error -ss 2 -i "${out}" \
       -frames:v 1 -q:v 4 "${poster}"
}

# Decide what to process
TARGETS=()
if [[ ${#ARGS[@]} -gt 0 ]]; then
  for a in "${ARGS[@]}"; do TARGETS+=("${a}"); done
elif [[ $ALL -eq 1 ]]; then
  while IFS= read -r -d '' f; do
    TARGETS+=("${f}")
  done < <(find "${DOWNLOADS}" -maxdepth 1 -type f -iname "*.mp4" -print0)
else
  for name in "${CURATED[@]}"; do
    local_path="${DOWNLOADS}/${name}"
    if [[ -f "${local_path}" ]]; then
      TARGETS+=("${local_path}")
    fi
  done
fi

if [[ ${#TARGETS[@]} -eq 0 ]]; then
  echo "Nothing to process."
  exit 0
fi

echo "Processing ${#TARGETS[@]} file(s) → ${DEST}"
for f in "${TARGETS[@]}"; do
  process_one "${f}"
done

echo ""
echo "Done. Output:"
ls -lhG "${DEST}" | tail -n +2
