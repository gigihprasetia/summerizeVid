
# 🚀 Next.js Starter Project with FFmpeg Setup

This is a minimal **Next.js** starter project with guidance to install **FFmpeg**, required for processing media (audio/video) files.

---

## 📦 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/nextjs-ffmpeg-starter.git
cd nextjs-ffmpeg-starter
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

---

## ▶️ Running the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎬 FFmpeg Installation Guide

FFmpeg is required if your app involves media processing. Install it based on your OS:

### 🔵 Windows

1. Go to [https://www.gyan.dev/ffmpeg/builds/](https://www.gyan.dev/ffmpeg/builds/)
2. Download the latest **Release full build (zip)**
3. Extract the zip (e.g., to `C:\ffmpeg`)
4. Add `C:\ffmpeg\bin` to your **System Environment Variables**:
   - Open *System Properties* > *Environment Variables*
   - Under "System Variables", find and edit `Path`
   - Add: `C:\ffmpeg\bin`
5. Open `cmd` and test:
   ```bash
   ffmpeg -version
   ```

### 🍎 macOS

#### Option 1: Homebrew (recommended)

```bash
brew install ffmpeg
```

#### Option 2: Download Binary

1. Go to [https://evermeet.cx/ffmpeg/](https://evermeet.cx/ffmpeg/)
2. Download the latest `.zip`
3. Move the `ffmpeg` binary to `/usr/local/bin`:
   ```bash
   sudo mv ~/Downloads/ffmpeg /usr/local/bin/
   sudo chmod +x /usr/local/bin/ffmpeg
   ```

4. Test with:
   ```bash
   ffmpeg -version
   ```

---



## 📜 License

This project is open source and available under the [MIT License](LICENSE).
