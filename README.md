# Hello World React Native App with Expo

A simple "Hello World" application built with React Native and Expo.

## What is Expo?

Expo is a platform that makes React Native development easier. With Expo Go, you can test your app on your actual phone without installing Android Studio or Xcode!

## Quick Start (5 minutes!)

### Step 1: Install Expo CLI
```bash
npm install -g @expo/cli
```

### Step 2: Install Dependencies
```bash
cd hello
npm install
```

### Step 3: Install Expo Go on Your Phone
- **Android**: Download "Expo Go" from Google Play Store
- **iPhone**: Download "Expo Go" from App Store

### Step 4: Start the App
```bash
npm start
```

### Step 5: Scan QR Code
- A QR code will appear in your terminal
- Open Expo Go on your phone
- **Android**: Tap "Scan QR Code" and scan the code
- **iPhone**: Open Camera app and scan the code, then tap the Expo Go notification

That's it! Your app should now be running on your phone! 🎉

## Alternative Ways to Test

### Web Browser
```bash
npm run web
```
Then open http://localhost:19006 in your browser

### Android Emulator (if you have Android Studio)
```bash
npm run android
```

### iOS Simulator (if you have Xcode on macOS)
```bash
npm run ios
```

## Project Structure

```
hello/
├── App.js              # Main application component
├── package.json        # Dependencies and scripts
├── app.json           # Expo configuration
├── babel.config.js    # Babel configuration
├── assets/            # Images and icons
└── README.md          # This file
```

## Features

- ✅ Simple "Hello World" greeting
- ✅ Clean, modern design with card-style layout
- ✅ Shadow effects and rounded corners
- ✅ Responsive design
- ✅ Cross-platform compatibility (iOS, Android, Web)
- ✅ Instant testing with Expo Go

## Troubleshooting

### QR Code Not Working?
1. Make sure your phone and computer are on the same WiFi network
2. Try running `npm start -- --tunnel` for tunnel mode
3. Check if your firewall is blocking the connection

### App Not Loading?
1. Close Expo Go completely and reopen it
2. Restart the development server: `npm start`
3. Clear cache: `npm start -- --clear`

### Metro Bundler Issues?
```bash
npm start -- --reset-cache
```

## Making Changes

1. Edit `App.js` to modify your app
2. Save the file
3. The app will automatically reload on your phone!

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Go App](https://expo.dev/client)

## Next Steps

Once you're comfortable with this app, you can:
- Add more screens with React Navigation
- Use device features like camera, GPS, etc.
- Add state management with Redux or Context
- Build and publish to app stores

Happy coding! 🚀