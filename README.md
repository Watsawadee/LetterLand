# LetterLand  
### Interactive Learning Word Game Using Generative AI

## 📌 Overview
LetterLand is an **AI-powered educational puzzle game** that generates personalized **crossword search** and **word search** puzzles from user-provided content (text, PDF, or URL).  
It adapts to each player’s **CEFR level (A1–C2)**, supports pronunciation, offers achievements, and tracks learning progress through a personal dashboard.

Powered by **Google Gemini Generative AI**, LetterLand transforms any input **text, URLs, or PDFs** into interactive word puzzles with dynamic difficulty, child-friendly themes, and vocabulary reinforcement.  
LetterLand is designed for all age groups, from young learners to adults, using both **CEFR-based adaptation** and **age-based themes**.

This project was developed as a **Capstone Project** at  
**School of Information Technology, King Mongkut’s University of Technology Thonburi (SIT KMUTT)**.

## 🎮 Core Features

### ✨ **1. Customizable Game Topics**
- Upload **PDFs, URLs, or text**
- Gemini API extracts key concepts, vocabulary, and meanings  
- Generates unique crossword search & word search games instantly

### 🎨 **2. AI Image Generation**
- Backgrounds dynamically adjust to user age
- Younger players → colorful and playful scenes  
- Older players → realistic visuals  

### 📈 **3. Progress-Based Level Up**
- LetterLand evaluates key performance metrics, including:
  - completion time  
  - number of hints used
  - total playtime  
- Based on these, it automatically adjusts the learner’s CEFR level (A1–C2).

### 🔊 **4. Word Pronunciation**
- Text-to-speech pronunciation  
- After gameplay, users see word summaries and speaker icons

### 🏆 **5. Achievement & Reward System**
- Coins for completing puzzles  
- Streaks, first-time achievements, and challenge bonuses  
- Unlock learning motivation

### 📊 **6. Progress Dashboard**
- Visualized activity reports at weekly, monthly, and yearly intervals
- Total vocabulary learned  
- Total accumulated playtime  
- Daily streak progress tracking

---

## 🧩 Sub Features

- ✅ Adjustable font size  
- ✅ Timer mode  
- ✅ Hint system  
- ✅ Personal or public puzzle sharing  
- ✅ Vocabulary summary  
- ✅ CEFR test during registration 
- ✅ Text extraction for PDFs and links

---

## 🏗️ Tech Stack & Architecture

### **Frontend**
- React Native (Expo)
- Typescript
- Axios for API requests

### **Backend**
- Node.js (Express)
- Prisma ORM
- JWT authentication

### **Database**
- PostgreSQL

### **Infra / DevOps**
- Docker (containerized backend + DB)
- Ubuntu (SIT VM)
- GitHub
- Jenkins (CI/CD)

### **🔌 External Services**
- **Google Gemini API** – content extraction & puzzle generation  
- **ImagineArt API** – AI background image generation  
- **Google Drive API** – object storage for generated assets
- **Dictionary API** - word meanings, synonyms & audio pronunciation 
- **Google Translate API** - generates fallback pronunciation audio
---

## 🔧 Project Structure
```
LetterLand/
├── client/ # React Native App (Expo)
│ ├── app/
│ ├── components/
│ ├── hooks/
│ ├── assets/
│ └── ...
│
├── server/ # Node.js Backend (Express + Prisma)
│ ├── controllers/
│ ├── services/
│ ├── routes/
│ ├── prisma/
│ ├── utils/
│ └── ...
│
├── database/ # Local PostgreSQL DB (Docker)
│ ├── docker-compose.db.yml   # Docker config to start PostgreSQL container
│ ├── .env.example            # Example environment variables for the DB container
│ └── letterland_dump.sql     # Full LetterLand database dump (schema + sample data)
│
└── README.md
```

## 🚀 Getting Started

### 🧰 Prerequisites
#### 📱 Application Requirements (Frontend + Backend)

- Node.js LTS ≥ 18
- npm or pnpm
- Expo CLI
```
npm install -g expo-cli
```
- Expo Go app (for running the mobile app)
- Required API Keys:
  - Google Gemini API
  - ImagineArt API
  - Google Drive API (OAuth2)

#### 🗄️ Database Requirements
LetterLand uses **Docker** to run PostgreSQL locally. \
You do **not** need to install PostgreSQL manually.

Install Docker:
https://www.docker.com/products/docker-desktop/

### ✅ Clone the Repository
```bash
git clone https://github.com/Watsawadee/LetterLand.git
cd LetterLand
```

### 1. 🗄️ Database Setup (PostgreSQL via Docker)
LetterLand includes a complete Dockerized PostgreSQL setup inside: ``` /database```

**Start the Database**
```bash
cd database
cp .env.example .env
docker compose -f docker-compose.db.yml up -d
```
**Verify the Database Container is Running**

Check whether the PostgreSQL container started successfully:
```bash
docker ps
```
You should see a container named letterland_db in the output.

**Default Database Configuration**
```
| Setting  | Value              |
|----------|--------------------|
| Host     | localhost          |
| Port     | 5432               |
| User     | letterland_admin   |
| Password | letterland123      |
| Database | letterland_db      |
```

**Import the LetterLand Database**
```bash
cat letterland_dump.sql | docker exec -i letterland_db \
psql -U letterland_admin -d letterland_db
```
**Verify the Data Import**

Ensure that all database tables were imported correctly.
Run the following command to list every table in the letterland_db database:
```bash
docker exec -it letterland_db \
  psql -U letterland_admin -d letterland_db -c "\dt"
```
✔ Your database is now ready.

### 2. 🖥️ Backend Setup (Node.js + Prisma)
**Install Dependencies**
```bash
cd server
npm install
```
**Configure Environment Variables**

Create a `.env` file inside the **server** folder (server/.env) and fill in the required values:
```bash
DATABASE_URL="postgresql://letterland_admin:letterland123@localhost:5432/letterland_db"
JWT_SECRET="..."
GEMINI_API_KEY="..."
IMAGINE_API_KEY="..."
CLIENT_ID="..."
CLIENT_SECRET="..."
REDIRECT_URI="..."
REFRESH_TOKEN="..."
AUDIO_FOLDERID="..."
IMAGE_FOLDERID="..."
ACHIEVEMENT_IMAGE_FOLDERID="..."
```
#### 🔑 Where to Generate API Keys

You must generate your own API keys from the following services:
- *Google Gemini API Key*   
  https://aistudio.google.com/app/apikey
- *ImagineArt API Key*  
  https://www.imagine.art/api/home
- *Google Cloud Console (OAuth2 + Drive API)*  
  Create a project → Enable "Google Drive API" → Create OAuth credentials  
  https://console.cloud.google.com/apis/credentials

⚠️ Note: These keys are private and are **not included** in the repository or database dump.

**Generate Prisma Client**
```bash
npx prisma generate
```
**Start Backend Server**
```bash
npm run dev
```

### 3. 📱 Frontend Setup (React Native with Expo)
**Install Dependencies**
```bash
cd client
npm install
```
**Start the App**
```bash
npx expo start --go -c
```

### When the Expo server starts, make sure:
- Both your development computer and your iPad are connected to the **same Wi-Fi network**  
  (e.g., **SIT Wi-Fi** or **KMUTT Wi-Fi**)
- The terminal will display a connection link such as:  
  `exp://<your-local-ip>:8081`
- Your project will automatically appear inside the **Expo Go** app on your iPad under  
  **Development servers**
- Tap the project name to open and run the app on the iPad — then enjoy LetterLand!

**Run on Device**
- Expo Go (iPad 11-inch recommended for best gameplay experience)
- Or run on emulator/simulator

### 🌐 Project Page
https://seniorproject.sit.kmutt.ac.th/showproject/CS65-RE80

### 👥 Contributors

- Mr. Nontakorn Chatkoonsathien – https://github.com/Ntckx
- Ms. Watsawadee Saeyong – https://github.com/Watsawadee
- Ms. Virunpat Theeranuluk – https://github.com/Virunpat


**Advisor:** Asst. Prof. Dr. Chakarida Nukoolkit


### ⭐ Support the Project
If you like this project, please give **LetterLand** a **star ⭐**!