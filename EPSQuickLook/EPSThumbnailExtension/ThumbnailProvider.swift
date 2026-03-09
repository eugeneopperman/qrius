import AppKit
import QuickLookThumbnailing

/// QuickLook Thumbnail Extension for EPS files
/// This provider generates thumbnail images for EPS files shown in Finder
class ThumbnailProvider: QLThumbnailProvider {

    override func provideThumbnail(
        for request: QLFileThumbnailRequest,
        _ handler: @escaping (QLThumbnailReply?, Error?) -> Void
    ) {
        let fileURL = request.fileURL
        let maximumSize = request.maximumSize
        let scale = request.scale

        // Calculate the pixel dimensions
        let contextSize = CGSize(
            width: maximumSize.width * scale,
            height: maximumSize.height * scale
        )

        // Create the thumbnail reply with a drawing block
        let reply = QLThumbnailReply(contextSize: contextSize) { () -> Bool in
            return self.drawThumbnail(
                for: fileURL,
                contextSize: contextSize,
                maximumSize: maximumSize,
                scale: scale
            )
        }

        handler(reply, nil)
    }

    /// Draws the thumbnail for the EPS file
    /// - Parameters:
    ///   - fileURL: The URL of the EPS file
    ///   - contextSize: The size of the drawing context in pixels
    ///   - maximumSize: The maximum size of the thumbnail in points
    ///   - scale: The scale factor for the display
    /// - Returns: true if drawing succeeded, false otherwise
    private func drawThumbnail(
        for fileURL: URL,
        contextSize: CGSize,
        maximumSize: CGSize,
        scale: CGFloat
    ) -> Bool {
        guard let context = NSGraphicsContext.current else {
            return false
        }

        // Fill with white background
        context.cgContext.setFillColor(NSColor.white.cgColor)
        context.cgContext.fill(CGRect(origin: .zero, size: contextSize))

        do {
            // Render the EPS file
            let image = try EPSRenderer.renderEPS(from: fileURL, maxSize: maximumSize)

            // Calculate centered position
            let imageSize = image.size
            let drawRect = calculateCenteredRect(
                imageSize: imageSize,
                contextSize: contextSize,
                scale: scale
            )

            // Draw the image
            image.draw(in: drawRect)

            return true
        } catch {
            // Draw a placeholder for failed renders
            drawErrorPlaceholder(in: contextSize, context: context)
            return true // Return true to show the placeholder instead of generic icon
        }
    }

    /// Calculates a centered rectangle for drawing the image
    private func calculateCenteredRect(
        imageSize: CGSize,
        contextSize: CGSize,
        scale: CGFloat
    ) -> NSRect {
        // Add some padding
        let padding: CGFloat = 4 * scale
        let availableSize = CGSize(
            width: contextSize.width - (padding * 2),
            height: contextSize.height - (padding * 2)
        )

        // Calculate aspect-fit size
        let widthRatio = availableSize.width / imageSize.width
        let heightRatio = availableSize.height / imageSize.height
        let ratio = min(widthRatio, heightRatio, scale) // Don't upscale beyond scale factor

        let drawSize = CGSize(
            width: imageSize.width * ratio,
            height: imageSize.height * ratio
        )

        // Center the image
        let x = (contextSize.width - drawSize.width) / 2
        let y = (contextSize.height - drawSize.height) / 2

        return NSRect(x: x, y: y, width: drawSize.width, height: drawSize.height)
    }

    /// Draws an error placeholder when EPS rendering fails
    private func drawErrorPlaceholder(in size: CGSize, context: NSGraphicsContext) {
        let cgContext = context.cgContext

        // Draw a light gray background
        cgContext.setFillColor(NSColor(white: 0.95, alpha: 1.0).cgColor)
        cgContext.fill(CGRect(origin: .zero, size: size))

        // Draw "EPS" text
        let text = "EPS" as NSString
        let attributes: [NSAttributedString.Key: Any] = [
            .font: NSFont.boldSystemFont(ofSize: min(size.width, size.height) * 0.25),
            .foregroundColor: NSColor.secondaryLabelColor
        ]

        let textSize = text.size(withAttributes: attributes)
        let textRect = CGRect(
            x: (size.width - textSize.width) / 2,
            y: (size.height - textSize.height) / 2,
            width: textSize.width,
            height: textSize.height
        )

        text.draw(in: textRect, withAttributes: attributes)
    }
}
