# 🎬 Jupiter ERR - Angular Video Platform

Modern Angular application recreating the Jupiter ERR video platform interface with responsive design and smooth user experience.

## 🌟 Features

- **📱 Responsive Design** - Works perfectly on desktop, tablet and mobile
- **🎥 Video Content Browser** - Browse movies, series, documentaries and more
- **🔄 Horizontal Scrolling** - Smooth category-based content browsing
- **👀 Show All/Show Less** - Toggle between limited and full content view (10 items initially)
- **🖼️ Smart Image Loading** - Automatic fallback for missing images
- **🎯 Direct Jupiter Links** - Click any content to open on Jupiter ERR platform
- **⚡ Real-time API** - Live data from ERR API
- **🎨 Modern UI/UX** - Dark theme with orange accents and glassmorphism effects

## 🚀 Demo

🔗 **Live Demo:** [Jupiter ERR Clone](https://jupiter.err.ee/video)


## 📂 Project Structure

```
jupiter-homepage/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── content-item/          # Individual content cards
│   │   │   └── content-section/       # Category sections with show all
│   │   ├── services/
│   │   │   └── api.service.ts         # ERR API integration
│   │   ├── models/
│   │   │   └── jupiter.models.ts      # TypeScript interfaces
│   │   ├── app.component.ts           # Main app component
│   │   ├── app.component.html         # Main template
│   │   └── app.component.scss         # Global styles
│   ├── assets/                        # Static assets
│   └── styles.scss                    # Global styles
├── package.json
├── angular.json
└── README.md
```

## 🛠️ Technologies Used

- **Angular 17+** - Latest Angular with standalone components
- **TypeScript** - Type-safe development
- **SCSS** - Advanced styling with variables and mixins
- **RxJS** - Reactive programming for API calls
- **ERR API** - Official ERR media content API

## 📦 Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Angular CLI** (`npm install -g @angular/cli`)

### Setup

1. **Clone the repository:**
```bash
git clone https://github.com/Artjomeller/Jupiter-ERR.git
cd Jupiter-ERR
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
ng serve
```

4. **Open in browser:**
```
http://localhost:4200
```

## 🎯 API Integration

The application uses ERR's official API endpoint:
```
https://services.err.ee/api/v2/category/getByUrl?url=video&domain=jupiter.err.ee
```

### Data Structure
- **Categories:** `data.category.frontPage[]`
- **Content Items:** Each category's `data[]` array
- **Images:** From `verticalPhotos` object with multiple sizes
- **Filtering:** Only shows `highTimeline: true` categories

## 🎨 Design Features

### User Interface
- **Dark Theme** - Professional dark background
- **Orange Accents** - ERR brand color (#ff6b35)
- **Glassmorphism** - Modern frosted glass effects
- **Smooth Animations** - Hover effects and transitions
- **Typography** - Clean, readable font hierarchy

### User Experience
- **Progressive Loading** - Shows 10 items, expand to show all
- **Smart Scrolling** - Horizontal scroll with custom scrollbars
- **Error Handling** - Graceful fallbacks for missing content
- **Mobile First** - Optimized for all screen sizes

## 📱 Responsive Breakpoints

```scss
// Desktop
@media (min-width: 1200px) { ... }

// Tablet
@media (max-width: 1199px) { ... }

// Mobile
@media (max-width: 768px) { ... }

// Small Mobile
@media (max-width: 480px) { ... }
```

## 🔧 Available Scripts

```bash
# Development server
ng serve

# Build for production
ng build

# Run unit tests
ng test

# Run end-to-end tests
ng e2e

# Lint code
ng lint

# Code formatting
npx prettier --write src/
```

## 📊 Content Categories

The application displays the following content categories:

- 🏆 **Enim vaadatud** - Most watched content
- 📺 **Saatesoovitus** - Show recommendations
- 🎬 **Filmisoovitus** - Movie recommendations
- 📖 **Sarjasoovitus** - Series recommendations
- 📚 **Dokisoovitus** - Documentary recommendations
- 🇪🇪 **Eesti Telefilm** - Estonian TV films
- 🎵 **Kuulamissoovitus** - Audio recommendations
- 🎭 **Raadioteater** - Radio theater
- 🎼 **Kontserdid ja muusika** - Concerts and music
- 🎪 **Lavastused** - Stage performances
- ⭐ **Värskelt lisatud** - Recently added
- 📰 **Uudised ja magasinid** - News and magazines
- 🏛️ **Poliitika ja ühiskond** - Politics and society
- 🎨 **Kultuur** - Culture
- ⚽ **Sport** - Sports
- 👥 **Elu ja inimesed** - Life and people
- 🎓 **Jupiteri akadeemia** - Jupiter academy
- 🌿 **Loodus ja teadus** - Nature and science
- 📜 **Ajalugu** - History
- ✈️ **Elustiil ja reisimine** - Lifestyle and travel
- 🎉 **Meelelahutus** - Entertainment
- 📼 **Retro TV** - Retro television
- 👤 **Portree** - Portrait

## 🐛 Known Issues

- Image loading might be slow on first visit
- Some content might not have images (graceful fallback implemented)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Artjom Eller**
- GitHub: [@Artjomeller](https://github.com/Artjomeller)
- Email: your.email@example.com


## 📈 Project Status

🟢 **Active Development** - This project is actively maintained and updated.
