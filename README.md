# 🔐 Secure Data App

Prosty system rejestracji, logowania, odzyskiwania hasła oraz panel administratora z możliwością eksportu danych użytkowników.

## 🚀 Funkcje

- Rejestracja z sekretną frazą
- Logowanie z sesją (Express session)
- Odzyskiwanie hasła za pomocą sekretnej frazy
- Panel administratora (edycja waluty użytkownika, eksport bazy danych)
- Szyfrowanie danych za pomocą AES
- Interfejs frontendowy w czystym HTML + CSS

---

## 🛠️ Wymagania

- Node.js (v18+) https://nodejs.org/en
- MongoDB (lokalnie lub zdalnie) https://www.mongodb.com/

---

## 📦 Instalacja

1. **Sklonuj repozytorium:**
2. Zmień nazwę pliku .env.example na .envb i w razie potrzeby edytuj go według własnych potrzeb.

```bash
git clone https://github.com/Dosk0ff/secure-app.git
cd secure-app
npm install 
npm start
