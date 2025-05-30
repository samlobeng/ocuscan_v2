# OcuScan

A React Native + Expo app for retina disease detection and patient management.

## Features

- User authentication with local SQLite database
- Patient registration and management
- Retina image capture (placeholder for future TensorFlow Lite integration)
- Diagnosis history tracking
- Clean and intuitive user interface

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Emulator

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ocuscan
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

4. Run on iOS or Android:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Or scan the QR code with the Expo Go app on your physical device

## Project Structure

```
src/
  ├── assets/         # Images and other static assets
  ├── components/     # Reusable UI components
  ├── database/       # SQLite database setup and helpers
  ├── navigation/     # Navigation configuration
  └── screens/        # App screens
```

## Dependencies

- React Native
- Expo
- React Navigation
- React Native SQLite Storage
- React Native Image Picker
- React Native Pager View

## Future Enhancements

- TensorFlow Lite integration for retina disease detection
- Cloud synchronization for patient data
- Advanced image processing features
- Multi-language support
- Dark mode support

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 