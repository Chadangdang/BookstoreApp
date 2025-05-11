# BookstoreApp — Mobile Bookstore Application

**Course:** DES427 Mobile Application Programming (2024/2)
**Group:** 7
**Members:**

* 6522770591 Chadang Phummarin
* 6522770864 Punyawee Poungsri
* 6522781986 Wichita Wongwichit

---

## 📱 Project Overview

**BookstoreApp** is a cross-platform application built with **Expo (React Native + TypeScript)** and **Firebase**. It offers a seamless experience for discovering, browsing, and purchasing books. The app features secure user authentication, a dynamic home screen with featured recommendations, a searchable catalog, cart management with stock validation, real-time updates, and detailed order history.

> 🔗 Live Demo: [https://bookstore-app-mocha.vercel.app/](https://bookstore-app-mocha.vercel.app/)

---

## ✨ Key Features

* 🔒 **User Authentication**: Secure signup & login with Firebase Auth.
* 🏠 **Home Screen**: Swipeable promotional banners & "This Month’s Must-Reads" section.
* 🔍 **Search**: Find books by title, author, publisher, or ISBN.
* 📚 **Catalog**: Browse all books, including sold-out items, with detailed info pages.
* 🛒 **Cart Management**: Add books, update quantities, remove items; prevents exceeding stock.
* 💳 **Checkout**: Complete purchases; Firestore stock counts update automatically.
* 📜 **Order History**: View past purchases with titles, dates, and quantities.
* 👤 **Profile**: Access user info, view order history, and logout.

---

## 💡 Architecture & Tech Stack

### Frontend (Mobile & Web)

* **Framework:** Expo (React Native + TypeScript)
* **Navigation:** React Navigation (native-stack)
* **UI:** React Native components with custom styles
* **Fonts:** Bodoni Moda via `@expo-google-fonts/bodoni-moda`
* **State Management:** React Context API (Cart)

### Backend

* **Database:** Firebase Firestore (NoSQL)
* **Authentication:** Firebase Auth

### Deployment

* 🔹 **Web:** Vercel (Live Demo)
* 🔹 **Mobile:** Expo Go / Custom Dev Client
