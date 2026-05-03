// Strip the background from an image using Vision's foreground-instance mask.
// Requires macOS 14+. Usage: swift remove_bg.swift <input> <output>
import Vision
import CoreImage
import AppKit

let args = CommandLine.arguments
guard args.count == 3 else {
    print("usage: swift remove_bg.swift <input> <output.png>")
    exit(2)
}

let inputURL = URL(fileURLWithPath: args[1])
let outputURL = URL(fileURLWithPath: args[2])

guard let inputImage = CIImage(contentsOf: inputURL) else {
    print("error: could not read \(args[1])")
    exit(1)
}

let request = VNGenerateForegroundInstanceMaskRequest()
let handler = VNImageRequestHandler(ciImage: inputImage)

do {
    try handler.perform([request])
    guard let result = request.results?.first else {
        print("error: no subject detected")
        exit(1)
    }

    let maskedPixelBuffer = try result.generateMaskedImage(
        ofInstances: result.allInstances,
        from: handler,
        croppedToInstancesExtent: false
    )

    let ciContext = CIContext()
    let maskedCIImage = CIImage(cvPixelBuffer: maskedPixelBuffer)
    guard let cgImage = ciContext.createCGImage(maskedCIImage, from: maskedCIImage.extent) else {
        print("error: failed to render output")
        exit(1)
    }

    let bitmap = NSBitmapImageRep(cgImage: cgImage)
    guard let pngData = bitmap.representation(using: .png, properties: [:]) else {
        print("error: failed to encode PNG")
        exit(1)
    }

    try pngData.write(to: outputURL)
    print("ok: wrote \(args[2]) (\(cgImage.width)×\(cgImage.height))")
} catch {
    print("error: \(error)")
    exit(1)
}
