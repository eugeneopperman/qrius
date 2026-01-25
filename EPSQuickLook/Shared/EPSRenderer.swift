import AppKit
import QuickLookThumbnailing

/// Shared EPS rendering functionality used by both preview and thumbnail extensions
public class EPSRenderer {

    /// Errors that can occur during EPS rendering
    public enum RenderError: Error {
        case fileNotFound
        case invalidEPSData
        case renderingFailed
        case unsupportedFormat

        public var localizedDescription: String {
            switch self {
            case .fileNotFound:
                return "The EPS file could not be found."
            case .invalidEPSData:
                return "The file does not contain valid EPS data."
            case .renderingFailed:
                return "Failed to render the EPS content."
            case .unsupportedFormat:
                return "The EPS format is not supported."
            }
        }
    }

    /// Renders an EPS file to an NSImage
    /// - Parameters:
    ///   - url: The URL of the EPS file to render
    ///   - maxSize: Optional maximum size for the rendered image
    /// - Returns: An NSImage containing the rendered EPS content
    public static func renderEPS(from url: URL, maxSize: CGSize? = nil) throws -> NSImage {
        guard FileManager.default.fileExists(atPath: url.path) else {
            throw RenderError.fileNotFound
        }

        guard let data = try? Data(contentsOf: url) else {
            throw RenderError.fileNotFound
        }

        return try renderEPS(from: data, maxSize: maxSize)
    }

    /// Renders EPS data to an NSImage
    /// - Parameters:
    ///   - data: The EPS data to render
    ///   - maxSize: Optional maximum size for the rendered image
    /// - Returns: An NSImage containing the rendered EPS content
    public static func renderEPS(from data: Data, maxSize: CGSize? = nil) throws -> NSImage {
        // Try using NSEPSImageRep first (native macOS EPS support)
        if let epsRep = NSEPSImageRep(data: data) {
            return try createImage(from: epsRep, maxSize: maxSize)
        }

        // Fallback: Try creating an NSImage directly from the data
        if let image = NSImage(data: data), image.isValid {
            if let maxSize = maxSize {
                return resizeImage(image, to: maxSize)
            }
            return image
        }

        // Try using PDFImageRep as EPS can sometimes be wrapped in PDF
        if let pdfRep = NSPDFImageRep(data: data) {
            let image = NSImage(size: pdfRep.bounds.size)
            image.addRepresentation(pdfRep)
            if let maxSize = maxSize {
                return resizeImage(image, to: maxSize)
            }
            return image
        }

        throw RenderError.invalidEPSData
    }

    /// Creates an NSImage from an NSEPSImageRep
    private static func createImage(from epsRep: NSEPSImageRep, maxSize: CGSize?) throws -> NSImage {
        let originalSize = epsRep.boundingBox.size

        guard originalSize.width > 0 && originalSize.height > 0 else {
            throw RenderError.renderingFailed
        }

        let targetSize: CGSize
        if let maxSize = maxSize {
            targetSize = calculateFitSize(originalSize: originalSize, maxSize: maxSize)
        } else {
            targetSize = originalSize
        }

        let image = NSImage(size: targetSize)
        image.addRepresentation(epsRep)

        // Create a bitmap representation for better compatibility
        guard let bitmapRep = createBitmapRepresentation(from: image, size: targetSize) else {
            // Return the original image if bitmap creation fails
            return image
        }

        let finalImage = NSImage(size: targetSize)
        finalImage.addRepresentation(bitmapRep)

        return finalImage
    }

    /// Creates a bitmap representation from an NSImage
    private static func createBitmapRepresentation(from image: NSImage, size: CGSize) -> NSBitmapImageRep? {
        let scaleFactor: CGFloat = 2.0 // Retina support
        let pixelWidth = Int(size.width * scaleFactor)
        let pixelHeight = Int(size.height * scaleFactor)

        guard let bitmapRep = NSBitmapImageRep(
            bitmapDataPlanes: nil,
            pixelsWide: pixelWidth,
            pixelsHigh: pixelHeight,
            bitsPerSample: 8,
            samplesPerPixel: 4,
            hasAlpha: true,
            isPlanar: false,
            colorSpaceName: .calibratedRGB,
            bytesPerRow: 0,
            bitsPerPixel: 0
        ) else {
            return nil
        }

        bitmapRep.size = size

        NSGraphicsContext.saveGraphicsState()

        guard let context = NSGraphicsContext(bitmapImageRep: bitmapRep) else {
            NSGraphicsContext.restoreGraphicsState()
            return nil
        }

        NSGraphicsContext.current = context
        context.imageInterpolation = .high

        // Fill with white background
        NSColor.white.setFill()
        NSRect(origin: .zero, size: size).fill()

        // Draw the EPS image
        image.draw(
            in: NSRect(origin: .zero, size: size),
            from: .zero,
            operation: .sourceOver,
            fraction: 1.0
        )

        NSGraphicsContext.restoreGraphicsState()

        return bitmapRep
    }

    /// Calculates the size that fits within maxSize while preserving aspect ratio
    private static func calculateFitSize(originalSize: CGSize, maxSize: CGSize) -> CGSize {
        let widthRatio = maxSize.width / originalSize.width
        let heightRatio = maxSize.height / originalSize.height
        let ratio = min(widthRatio, heightRatio)

        // Don't upscale
        let finalRatio = min(ratio, 1.0)

        return CGSize(
            width: originalSize.width * finalRatio,
            height: originalSize.height * finalRatio
        )
    }

    /// Resizes an image to fit within the specified size
    private static func resizeImage(_ image: NSImage, to maxSize: CGSize) -> NSImage {
        let originalSize = image.size
        let targetSize = calculateFitSize(originalSize: originalSize, maxSize: maxSize)

        let resizedImage = NSImage(size: targetSize)
        resizedImage.lockFocus()

        NSGraphicsContext.current?.imageInterpolation = .high

        image.draw(
            in: NSRect(origin: .zero, size: targetSize),
            from: NSRect(origin: .zero, size: originalSize),
            operation: .copy,
            fraction: 1.0
        )

        resizedImage.unlockFocus()

        return resizedImage
    }

    /// Extracts metadata from an EPS file
    public static func extractMetadata(from url: URL) -> [String: Any] {
        var metadata: [String: Any] = [:]

        guard let data = try? Data(contentsOf: url),
              let content = String(data: data.prefix(4096), encoding: .ascii) else {
            return metadata
        }

        // Parse EPS header comments
        let lines = content.components(separatedBy: .newlines)

        for line in lines {
            if line.hasPrefix("%%Title:") {
                metadata["title"] = line.replacingOccurrences(of: "%%Title:", with: "").trimmingCharacters(in: .whitespaces)
            } else if line.hasPrefix("%%Creator:") {
                metadata["creator"] = line.replacingOccurrences(of: "%%Creator:", with: "").trimmingCharacters(in: .whitespaces)
            } else if line.hasPrefix("%%CreationDate:") {
                metadata["creationDate"] = line.replacingOccurrences(of: "%%CreationDate:", with: "").trimmingCharacters(in: .whitespaces)
            } else if line.hasPrefix("%%BoundingBox:") {
                let bbox = line.replacingOccurrences(of: "%%BoundingBox:", with: "").trimmingCharacters(in: .whitespaces)
                metadata["boundingBox"] = bbox

                // Parse bounding box dimensions
                let components = bbox.components(separatedBy: .whitespaces).compactMap { Int($0) }
                if components.count == 4 {
                    let width = components[2] - components[0]
                    let height = components[3] - components[1]
                    metadata["width"] = width
                    metadata["height"] = height
                }
            } else if line.hasPrefix("%%EndComments") {
                break
            }
        }

        return metadata
    }
}
