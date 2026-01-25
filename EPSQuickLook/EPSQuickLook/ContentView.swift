import SwiftUI

/// Main content view for the host application
/// Provides information about the QuickLook extensions and their status
struct ContentView: View {
    @State private var extensionsEnabled = false

    var body: some View {
        VStack(spacing: 24) {
            // App Icon
            Image(systemName: "doc.richtext")
                .font(.system(size: 64))
                .foregroundColor(.accentColor)

            // Title
            Text("EPS QuickLook")
                .font(.largeTitle)
                .fontWeight(.bold)

            // Description
            Text("Preview EPS files directly in Finder")
                .font(.title3)
                .foregroundColor(.secondary)

            Divider()
                .padding(.vertical, 8)

            // Instructions
            VStack(alignment: .leading, spacing: 16) {
                InstructionRow(
                    number: 1,
                    title: "Enable Extensions",
                    description: "Go to System Settings → Privacy & Security → Extensions → Quick Look"
                )

                InstructionRow(
                    number: 2,
                    title: "Enable Both Extensions",
                    description: "Turn on \"EPS Preview\" and \"EPS Thumbnail\""
                )

                InstructionRow(
                    number: 3,
                    title: "Preview EPS Files",
                    description: "Select any .eps file in Finder and press Space"
                )
            }
            .padding(.horizontal)

            Divider()
                .padding(.vertical, 8)

            // Open System Settings button
            Button(action: openSystemSettings) {
                Label("Open Extension Settings", systemImage: "gear")
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)

            Spacer()

            // Footer
            Text("Tip: Run 'qlmanage -r' in Terminal if previews don't appear")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(32)
        .frame(width: 480, height: 520)
    }

    /// Opens System Settings to the Extensions pane
    private func openSystemSettings() {
        if let url = URL(string: "x-apple.systempreferences:com.apple.ExtensionsPreferences") {
            NSWorkspace.shared.open(url)
        }
    }
}

/// A single instruction row with a numbered step
struct InstructionRow: View {
    let number: Int
    let title: String
    let description: String

    var body: some View {
        HStack(alignment: .top, spacing: 16) {
            // Number badge
            Text("\(number)")
                .font(.headline)
                .foregroundColor(.white)
                .frame(width: 28, height: 28)
                .background(Circle().fill(Color.accentColor))

            // Text content
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)

                Text(description)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Spacer()
        }
    }
}

#Preview {
    ContentView()
}
