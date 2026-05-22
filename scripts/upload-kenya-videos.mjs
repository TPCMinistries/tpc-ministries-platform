// One-shot uploader: moves the referenced Kenya videos from public/videos/kenya/
// into the existing `tpc-media` Supabase Storage bucket under `kenya-2026/`.
// Uses TUS resumable uploads so files >50MB work. Reads creds from .env.local.
// Idempotent: skips files already at the right size in the bucket.

import nextEnv from '@next/env'
import { createClient } from '@supabase/supabase-js'
import * as tus from 'tus-js-client'
import { createReadStream, statSync } from 'node:fs'
import { join } from 'node:path'

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd())

const REFERENCED = [
  'timeline-2.mp4',
  'day-11.mp4',
  'day-13.mp4',
  'cinema.mp4',
  'day-12.mp4',
  'reel-033.mp4',
  'video-03.mp4',
  'sda-church-dago.mp4',
  'day-14.mp4',
  'homabay.mp4',
  'highlight-video.mp4',
  'vertical-03.mp4',
  'reel-01.mp4',
  'reel-02.mp4',
]

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

const BUCKET = 'tpc-media'
const PREFIX = 'kenya-2026'
const PROJECT_REF = url.replace(/^https?:\/\//, '').split('.')[0]

function uploadTus(filePath, objectName, size) {
  return new Promise((resolve, reject) => {
    const stream = createReadStream(filePath)
    const upload = new tus.Upload(stream, {
      endpoint: `${url}/storage/v1/upload/resumable`,
      retryDelays: [0, 1500, 3000, 5000, 10000],
      headers: {
        authorization: `Bearer ${serviceKey}`,
        'x-upsert': 'true',
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      uploadSize: size,
      metadata: {
        bucketName: BUCKET,
        objectName: `${PREFIX}/${objectName}`,
        contentType: 'video/mp4',
        cacheControl: '31536000',
      },
      chunkSize: 6 * 1024 * 1024,
      onError: (err) => reject(err),
      onProgress: (sent, total) => {
        const pct = ((sent / total) * 100).toFixed(0)
        process.stdout.write(`\r  ${objectName}: ${pct}%   `)
      },
      onSuccess: () => {
        process.stdout.write('\r' + ' '.repeat(60) + '\r')
        resolve()
      },
    })
    upload.start()
  })
}

async function main() {
  const { data: existing, error: listErr } = await supabase.storage
    .from(BUCKET)
    .list(PREFIX, { limit: 200 })
  if (listErr) {
    console.error('Failed to list bucket:', listErr)
    process.exit(1)
  }
  const existingMap = new Map((existing || []).map((f) => [f.name, f.metadata?.size]))
  console.log(`Bucket has ${existing?.length || 0} files under ${PREFIX}/ already`)

  let uploaded = 0
  let skipped = 0
  for (const filename of REFERENCED) {
    const localPath = join(process.cwd(), 'public/videos/kenya', filename)
    const localSize = statSync(localPath).size
    const remoteSize = existingMap.get(filename)

    if (remoteSize === localSize) {
      console.log(`✓ skip ${filename} (${(localSize / 1024 / 1024).toFixed(1)} MB)`)
      skipped++
      continue
    }

    console.log(`↑ ${filename} (${(localSize / 1024 / 1024).toFixed(1)} MB) ...`)
    try {
      await uploadTus(localPath, filename, localSize)
      console.log(`  ✓ ${filename} uploaded`)
      uploaded++
    } catch (err) {
      console.error(`  ✗ ${filename} FAILED:`, err)
      process.exit(1)
    }
  }

  console.log(`\nDone. Uploaded ${uploaded}, skipped ${skipped}.`)
  console.log(`\nPublic URL pattern:`)
  console.log(`  ${url}/storage/v1/object/public/${BUCKET}/${PREFIX}/<filename>`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
