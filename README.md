
# 📸 Attendance AI – Automated Face Recognition Attendance System

A smart attendance automation system built using **Next.js 14, Prisma, MySQL, AWS Rekognition, and Sharp**.  
Upload a **group classroom image** → the system automatically detects students, marks attendance, and sends email alerts.

---

## 🚀 Features

- 🎭 **AI Face Detection** (AWS Rekognition)
- 👥 Group photo → auto face recognition
- 👨‍🎓 **Student registration with photo**
- 📨 Email alerts for absentees
- 🗄️ **Prisma + MySQL** database
- 📅 Attendance logs & daily reporting
- ⚡ Optimized image processing (Sharp)
- 🎛️ Full Admin Dashboard (Add/View Students, Attendance Control)

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), TailwindCSS |
| **Backend** | Node.js, Next.js Server Actions |
| **Database** | Prisma ORM + MySQL |
| **AI Engine** | AWS Rekognition |
| **Utilities** | Sharp, Nodemailer |
| **Auth** | (Optional) NextAuth |

---

## 📂 Project Structure

```
attendance-ai/
│── app/
│   ├── dashboard/
│   ├── api/
│   │   ├── students/
│   │   └── attendance/
│── prisma/
│   ├── schema.prisma
│── public/
│   └── uploads/students/
│── lib/
│   └── prisma.ts
│── .env
│── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file:

```
DATABASE_URL="mysql://root:password@localhost:3306/attendance_ai"

AWS_REGION="ap-south-1"
AWS_ACCESS_KEY_ID="YOUR_KEY"
AWS_SECRET_ACCESS_KEY="YOUR_SECRET"
AWS_REKOG_COLLECTION="attendance_ai"
```

---

## ▶️ Getting Started

Install dependencies:

```bash
npm install
```

Push Prisma schema:

```bash
npx prisma db push
```

Start development server:

```bash
npm run dev
```

Open:  
👉 http://localhost:3000

---

## 🤖 Face Recognition Workflow

1. Register student → upload clear face photo  
2. Photo saved in `/public/uploads/students/`  
3. AWS Rekognition indexes face  
4. Attendance upload → group image processed  
5. Each detected face is matched with Rekognition collection  
6. Prisma stores **Present / Absent**  
7. Emails sent for absent students

---

## 📧 Email Notification

Uses Nodemailer (SMTP):

- Gmail  
- Outlook  
- Private SMTP  
- AWS SES  

---

## 📌 Deployment

### 🔹 Vercel (Recommended)
- Supports Next.js App Router
- Add environment variables
- Use Planetscale / Neon / RDS for MySQL

### 🔹 AWS EC2 / Lightsail
- Run Next.js + MySQL locally on server
- Install PM2 to keep app alive

---

## 🙌 Contributing

Pull Requests are welcome!  
If you want to improve AI accuracy or extend the dashboard, feel free to collaborate.

---

## ⭐ Support the Project

If you find this useful, please ⭐ star the repository on GitHub!

---

## 📜 License

MIT License – free to use for personal and commercial projects.

