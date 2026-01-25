import Cocoa
import Quartz
import QuickLook

/// QuickLook Preview Extension for EPS files
/// This view controller handles the preview display when users press Space on an EPS file
class PreviewViewController: NSViewController, QLPreviewingController {

    /// The image view that displays the rendered EPS content
    private var imageView: NSImageView!

    /// Error label for displaying error messages
    private var errorLabel: NSTextField!

    /// Loading indicator
    private var progressIndicator: NSProgressIndicator!

    override var nibName: NSNib.Name? {
        return nil
    }

    override func loadView() {
        // Create the main view programmatically
        let view = NSView()
        view.wantsLayer = true
        view.layer?.backgroundColor = NSColor.windowBackgroundColor.cgColor

        // Setup image view
        imageView = NSImageView()
        imageView.translatesAutoresizingMaskIntoConstraints = false
        imageView.imageScaling = .scaleProportionallyUpOrDown
        imageView.imageAlignment = .alignCenter
        view.addSubview(imageView)

        // Setup error label
        errorLabel = NSTextField(labelWithString: "")
        errorLabel.translatesAutoresizingMaskIntoConstraints = false
        errorLabel.alignment = .center
        errorLabel.textColor = .secondaryLabelColor
        errorLabel.font = .systemFont(ofSize: 14)
        errorLabel.isHidden = true
        view.addSubview(errorLabel)

        // Setup progress indicator
        progressIndicator = NSProgressIndicator()
        progressIndicator.translatesAutoresizingMaskIntoConstraints = false
        progressIndicator.style = .spinning
        progressIndicator.controlSize = .regular
        progressIndicator.isHidden = true
        view.addSubview(progressIndicator)

        // Layout constraints
        NSLayoutConstraint.activate([
            // Image view fills the entire view with padding
            imageView.topAnchor.constraint(equalTo: view.topAnchor, constant: 20),
            imageView.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            imageView.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            imageView.bottomAnchor.constraint(equalTo: view.bottomAnchor, constant: -20),

            // Error label centered
            errorLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            errorLabel.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            errorLabel.leadingAnchor.constraint(greaterThanOrEqualTo: view.leadingAnchor, constant: 20),
            errorLabel.trailingAnchor.constraint(lessThanOrEqualTo: view.trailingAnchor, constant: -20),

            // Progress indicator centered
            progressIndicator.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            progressIndicator.centerYAnchor.constraint(equalTo: view.centerYAnchor)
        ])

        self.view = view
    }

    override func viewDidLoad() {
        super.viewDidLoad()
    }

    // MARK: - QLPreviewingController

    /// Called when QuickLook needs to prepare the preview
    func preparePreviewOfFile(at url: URL, completionHandler handler: @escaping (Error?) -> Void) {
        DispatchQueue.main.async {
            self.showLoading()
        }

        // Perform rendering on a background thread
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            do {
                // Get the view size for rendering
                let maxSize = CGSize(width: 1200, height: 1200)

                let image = try EPSRenderer.renderEPS(from: url, maxSize: maxSize)

                DispatchQueue.main.async {
                    self?.hideLoading()
                    self?.imageView.image = image
                    self?.imageView.isHidden = false
                    self?.errorLabel.isHidden = true
                    handler(nil)
                }
            } catch {
                DispatchQueue.main.async {
                    self?.hideLoading()
                    self?.showError(error)
                    handler(error)
                }
            }
        }
    }

    /// Called when QuickLook needs to prepare a preview of search content
    func preparePreviewOfSearchableItem(
        identifier: String,
        queryString: String?,
        completionHandler handler: @escaping (Error?) -> Void
    ) {
        // Not applicable for file previews
        handler(nil)
    }

    // MARK: - Private Methods

    private func showLoading() {
        progressIndicator.isHidden = false
        progressIndicator.startAnimation(nil)
        imageView.isHidden = true
        errorLabel.isHidden = true
    }

    private func hideLoading() {
        progressIndicator.stopAnimation(nil)
        progressIndicator.isHidden = true
    }

    private func showError(_ error: Error) {
        imageView.isHidden = true
        errorLabel.isHidden = false

        if let renderError = error as? EPSRenderer.RenderError {
            errorLabel.stringValue = renderError.localizedDescription
        } else {
            errorLabel.stringValue = "Unable to preview this EPS file.\n\(error.localizedDescription)"
        }
    }
}
