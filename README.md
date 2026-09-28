# MediaFlow — HLS + Cloudflare R2 Streaming Architecture

MediaFlow is a modern, lightweight, and scalable movie and music streaming web application built with **React**, **Vite**, **Firebase**, **Cloudflare R2**, and **Vercel Serverless API**.

---

## 🏗 Architecture Overview

```text
                                MEDIAFLOW
                                    |
                             React + Vite
                                    |
             +----------------------+----------------------+
             |                                             |
             | REST/API requests                           | Media requests
             v                                             v
      Vercel Serverless API                           CDN / Edge
      (/api/media/upload-url)                              |
             |                                             |
             v                                             v
        Firebase                                     Cloudflare R2
             |                                             |
             v                                         HLS Media
       User Metadata & Auth                                |
       (Auth / Firestore)                                  |
                                                           v
                                                    HLS Video/Audio
                                                           |
                                                           v
                                                    MediaFlow Player
                                                    (VideoPlayer/hls.js)
```

### Key Architectural Benefits
- **Zero Video Bottlenecking on Vercel**: Large media files are never proxied or processed through Vercel serverless functions.
- **Adaptive Bitrate HLS Streaming**: Videos stream via `master.m3u8` playlists using `hls.js` for automatic quality adaptation (720p / 480p) based on network conditions.
- **Zero Storage Credentials Leakage**: `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` are kept strictly server-side on Vercel API routes.
- **Throttled Watch History Synchronization**: Playback position is synced to Firestore every 12-15 seconds for resumption without excessive writes.

---

## 📁 Repository Structure

```text
MediaFlow/
├── api/
│   └── media/
│       ├── upload-url.js      # Serverless API: Generates R2 Presigned PUT URLs
│       └── access-url.js      # Serverless API: Generates R2 Signed/CDN URLs
├── public/
│   ├── manifest.json          # PWA App Manifest
│   └── sw.js                  # Service Worker PWA Cache shell
├── src/
│   ├── components/
│   │   ├── media/
│   │   │   ├── VideoPlayer.jsx      # HLS Video Player (hls.js + Watch History)
│   │   │   ├── AudioPlayer.jsx      # HLS Audio Player (Docked Mini & Full Modal)
│   │   │   ├── PlayerControls.jsx   # Shared UI Control Bar
│   │   │   ├── QualitySelector.jsx  # Adaptive Bitrate Selector (720p/480p/Auto)
│   │   │   └── SubtitleSelector.jsx # Subtitles & Caption Tracks
│   │   ├── AdminUploadForm.jsx
│   │   ├── Auth.jsx
│   │   ├── ContentFeed.jsx
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── Topbar.jsx
│   ├── services/
│   │   ├── cloudStorage.js    # Firebase Cloud Storage fallback
│   │   ├── firebase.js        # Firebase App, Auth & Firestore initialization
│   │   ├── mediaService.js    # R2 presigned upload client & Watch History service
│   │   └── mediaStorage.js    # Persistent IndexedDB offline fallback
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── vercel.json
└── vite.config.js
```

---

## ⚡ Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```

---

## 🔑 Environment Variables Reference

| Variable | Type | Description |
| :--- | :--- | :--- |
| `VITE_FIREBASE_API_KEY` | Client (Public) | Firebase Web App API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Client (Public) | Firebase Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | Client (Public) | Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Client (Public) | Firebase Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Client (Public) | Firebase Sender ID |
| `VITE_FIREBASE_APP_ID` | Client (Public) | Firebase App ID |
| `VITE_DEMO_HLS_URL` | Client (Public) | Fallback HLS stream for development mode |
| `R2_ACCOUNT_ID` | Server (Private) | Cloudflare Account ID |
| `R2_ACCESS_KEY_ID` | Server (Private) | Cloudflare R2 Access Key ID |
| `R2_SECRET_ACCESS_KEY` | Server (Private) | Cloudflare R2 Secret Access Key |
| `R2_BUCKET_NAME` | Server (Private) | R2 Storage Bucket Name |
| `R2_PUBLIC_URL` | Server (Private) | Custom Domain / R2 Public CDN URL |

> ⚠️ **Security Warning**: `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` must **NEVER** be prefixed with `VITE_` or exposed in client-side code. Configure them in Vercel Project Settings under **Environment Variables**.

---

## ☁️ Cloudflare R2 Setup Guide

1. Log into **Cloudflare Dashboard** → **R2 Object Storage**.
2. Click **Create Bucket** and name it `mediaflow`.
3. Under **Settings** → **CORS Policy**, add:
   ```json
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "PUT", "HEAD", "OPTIONS"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
4. Under **Manage R2 API Tokens**, create a token with **Edit** access and copy the `Access Key ID` and `Secret Access Key`.
5. Under Bucket Settings, enable a **Custom Domain** (e.g., `cdn.mediaflow.app`) or R2.dev public URL.

---

## 🎬 FFmpeg HLS Media Processing Guide

Convert an MP4 video into an HLS adaptive bitrate master playlist (`master.m3u8`) with **720p** and **480p** variants:

```bash
ffmpeg -i input_movie.mp4 \
  -filter_complex "[0:v]split=2[v1],[v2]; [v1]scale=w=1280:h=720[v1out]; [v2]scale=w=854:h=480[v2out]" \
  -map "[v1out]" -c:v:0 libx264 -b:v:0 2800k -maxrate:v:0 2996k -bufsize:v:0 4200k \
  -map "[v2out]" -c:v:1 libx264 -b:v:1 1400k -maxrate:v:1 1498k -bufsize:v:1 2100k \
  -map a:0 -c:a:0 aac -b:a:0 128k \
  -map a:0 -c:a:1 aac -b:a:1 96k \
  -f hls \
  -hls_time 6 \
  -hls_playlist_type vod \
  -hls_flags independent_segments \
  -hls_segment_filename "stream_%v/data%03d.ts" \
  -master_pl_name master.m3u8 \
  -var_stream_map "v:0,a:0 v:1,a:1" \
  stream_%v/playlist.m3u8
```

### Output Folder Structure on Cloudflare R2
```text
movies/
└── movie-001/
    ├── master.m3u8
    ├── stream_0/       # 720p variant
    │   ├── playlist.m3u8
    │   └── data000.ts
    └── stream_1/       # 480p variant
        ├── playlist.m3u8
        └── data000.ts
```

---

## 🚀 Deployment on Vercel

1. Push code to your **GitHub** repository.
2. Import repository in **Vercel Dashboard**.
3. Add all environment variables listed in `.env.example`.
4. Deploy! Vercel will automatically build the Vite SPA and deploy serverless functions in `/api/`.
