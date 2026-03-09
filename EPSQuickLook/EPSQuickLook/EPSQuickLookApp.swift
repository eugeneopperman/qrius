import SwiftUI

/// Main entry point for the EPS QuickLook host application
/// This app serves as a container for the QuickLook extensions
@main
struct EPSQuickLookApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .windowStyle(.hiddenTitleBar)
        .windowResizability(.contentSize)
    }
}
