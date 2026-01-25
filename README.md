# EPS QuickLook Plugin for macOS

A native macOS QuickLook plugin that enables preview and thumbnail generation for EPS (Encapsulated PostScript) files directly in Finder.

## Features

- **Quick Look Preview**: Press Space on any EPS file in Finder to see a full preview
- **Thumbnail Generation**: See EPS file thumbnails in Finder icon views
- **Native Performance**: Uses macOS's built-in PostScript rendering capabilities
- **Retina Support**: High-resolution previews on Retina displays

## Requirements

- macOS 12.0 (Monterey) or later
- Xcode 14.0 or later (for building from source)

## Installation

### Option 1: Build from Source

1. Open `EPSQuickLook.xcodeproj` in Xcode
2. Select the `EPSQuickLook` scheme
3. Build the project (⌘B)
4. Archive and export the application (Product → Archive)
5. Move `EPSQuickLook.app` to your `/Applications` folder
6. Launch the app once to register the extensions
7. Go to **System Preferences → Extensions → Quick Look** and enable:
   - EPS Preview Extension
   - EPS Thumbnail Extension

### Option 2: Manual Installation (After Building)

1. Build the project in Xcode
2. Right-click on the built `EPSQuickLook.app` and select "Show Package Contents"
3. Navigate to `Contents/PlugIns/`
4. Copy both `.appex` extensions to `~/Library/QuickLook/`
5. Run `qlmanage -r` in Terminal to refresh QuickLook

## Usage

Once installed:

1. **Preview**: Select any `.eps` file in Finder and press **Space**
2. **Thumbnails**: EPS files will show visual thumbnails in icon view
3. **Column View**: Preview pane in column view will show EPS content

## Troubleshooting

### Previews not showing?

1. Open Terminal and run:
   ```bash
   qlmanage -r
   qlmanage -r cache
   ```

2. Restart Finder:
   ```bash
   killall Finder
   ```

3. Verify the extension is enabled in System Preferences → Extensions → Quick Look

### Debug Mode

To test the QuickLook generator directly:

```bash
# Test preview generation
qlmanage -p /path/to/your/file.eps

# Test thumbnail generation
qlmanage -t /path/to/your/file.eps

# View debug output
qlmanage -d4 -p /path/to/your/file.eps
```

## Project Structure

```
EPSQuickLook/
├── EPSQuickLook/                    # Host application
│   ├── EPSQuickLookApp.swift
│   ├── ContentView.swift
│   └── Info.plist
├── EPSPreviewExtension/             # QuickLook Preview Extension
│   ├── PreviewViewController.swift
│   └── Info.plist
├── EPSThumbnailExtension/           # Thumbnail Extension
│   ├── ThumbnailProvider.swift
│   └── Info.plist
└── Shared/                          # Shared EPS rendering code
    └── EPSRenderer.swift
```

## How It Works

The plugin uses macOS's native `NSEPSImageRep` class to render EPS files. This provides:

- Full PostScript language support
- Vector graphics rendering
- Proper color management
- Integration with Core Graphics

## License

MIT License - See [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please feel free to submit pull requests.

## Acknowledgments

- Built using Apple's QuickLook framework
- Uses native macOS PostScript rendering capabilities
