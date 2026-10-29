//
//  VINScannerView.swift
//  VINPartsScanner
//
//  Camera-based VIN scanner using Vision framework
//

import SwiftUI
import AVFoundation
import Vision

struct VINScannerView: View {
    @Environment(\.dismiss) var dismiss
    @Binding var scannedVIN: String
    @StateObject private var viewModel = VINScannerViewModel()
    
    var body: some View {
        NavigationStack {
            ZStack {
                // Camera Preview
                CameraPreviewView(session: viewModel.captureSession)
                    .ignoresSafeArea()
                
                // Overlay
                VStack {
                    Spacer()
                    
                    // Scanning area indicator
                    Rectangle()
                        .stroke(Color.white, lineWidth: 2)
                        .frame(height: 60)
                        .padding(.horizontal, 20)
                    
                    Text("Position VIN within the frame")
                        .font(.caption)
                        .foregroundColor(.white)
                        .padding(.top, 8)
                    
                    Spacer()
                    
                    // Detected VIN
                    if !viewModel.detectedVIN.isEmpty {
                        VStack(spacing: 12) {
                            Text("Detected VIN:")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.7))
                            
                            Text(viewModel.detectedVIN)
                                .font(.system(.title2, design: .monospaced))
                                .foregroundColor(.white)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 8)
                                .background(Color.green.opacity(0.8))
                                .cornerRadius(8)
                            
                            Button("Use This VIN") {
                                scannedVIN = viewModel.detectedVIN
                                dismiss()
                            }
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding(.horizontal, 24)
                            .padding(.vertical, 12)
                            .background(Color.blue)
                            .cornerRadius(10)
                        }
                        .padding(.bottom, 40)
                    }
                }
            }
            .navigationTitle("Scan VIN")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(.white)
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        viewModel.toggleFlash()
                    }) {
                        Image(systemName: viewModel.isFlashOn ? "bolt.fill" : "bolt.slash.fill")
                            .foregroundColor(.white)
                    }
                }
            }
            .onAppear {
                viewModel.startScanning()
            }
            .onDisappear {
                viewModel.stopScanning()
            }
        }
    }
}

// MARK: - Camera Preview UIViewRepresentable

struct CameraPreviewView: UIViewRepresentable {
    let session: AVCaptureSession
    
    func makeUIView(context: Context) -> UIView {
        let view = CameraPreviewUIView()
        view.session = session
        return view
    }
    
    func updateUIView(_ uiView: UIView, context: Context) {
        guard let previewView = uiView as? CameraPreviewUIView else { return }
        previewView.updatePreviewLayerFrame()
    }
}

/// Custom UIView that properly handles preview layer layout
class CameraPreviewUIView: UIView {
    var session: AVCaptureSession? {
        didSet {
            setupPreviewLayer()
        }
    }
    
    private var previewLayer: AVCaptureVideoPreviewLayer?
    
    private func setupPreviewLayer() {
        guard let session = session else { return }
        
        let layer = AVCaptureVideoPreviewLayer(session: session)
        layer.videoGravity = .resizeAspectFill
        self.layer.addSublayer(layer)
        previewLayer = layer
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        updatePreviewLayerFrame()
    }
    
    func updatePreviewLayerFrame() {
        previewLayer?.frame = bounds
    }
}

// MARK: - VIN Scanner ViewModel

class VINScannerViewModel: NSObject, ObservableObject {
    @Published var detectedVIN: String = ""
    @Published var isFlashOn: Bool = false
    
    let captureSession = AVCaptureSession()
    private var videoOutput: AVCaptureVideoDataOutput?
    private let videoQueue = DispatchQueue(label: "VINScannerQueue")
    
    override init() {
        super.init()
        setupCaptureSession()
    }
    
    private func setupCaptureSession() {
        guard let videoDevice = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back),
              let videoInput = try? AVCaptureDeviceInput(device: videoDevice) else {
            return
        }
        
        if captureSession.canAddInput(videoInput) {
            captureSession.addInput(videoInput)
        }
        
        let output = AVCaptureVideoDataOutput()
        output.setSampleBufferDelegate(self, queue: videoQueue)
        
        if captureSession.canAddOutput(output) {
            captureSession.addOutput(output)
            videoOutput = output
        }
    }
    
    func startScanning() {
        if !captureSession.isRunning {
            DispatchQueue.global(qos: .userInitiated).async { [weak self] in
                self?.captureSession.startRunning()
            }
        }
    }
    
    func stopScanning() {
        if captureSession.isRunning {
            captureSession.stopRunning()
        }
    }
    
    func toggleFlash() {
        guard let device = AVCaptureDevice.default(for: .video),
              device.hasTorch else { return }
        
        do {
            try device.lockForConfiguration()
            device.torchMode = isFlashOn ? .off : .on
            isFlashOn.toggle()
            device.unlockForConfiguration()
        } catch {
            print("Flash toggle error: \(error)")
        }
    }
    
    private func processVIN(_ text: String) -> String? {
        // Clean and validate VIN
        let cleaned = text
            .uppercased()
            .replacingOccurrences(of: " ", with: "")
            .replacingOccurrences(of: "-", with: "")
        
        // VIN must be 17 characters
        guard cleaned.count == 17 else { return nil }
        
        // VIN cannot contain I, O, Q
        guard !cleaned.contains(where: { "IOQ".contains($0) }) else { return nil }
        
        // VIN must be alphanumeric
        guard cleaned.allSatisfy({ $0.isLetter || $0.isNumber }) else { return nil }
        
        return cleaned
    }
}

// MARK: - AVCaptureVideoDataOutputSampleBufferDelegate

extension VINScannerViewModel: AVCaptureVideoDataOutputSampleBufferDelegate {
    func captureOutput(_ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer, from connection: AVCaptureConnection) {
        guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }
        
        let request = VNRecognizeTextRequest { [weak self] request, error in
            guard let observations = request.results as? [VNRecognizedTextObservation] else { return }
            
            for observation in observations {
                guard let topCandidate = observation.topCandidates(1).first else { continue }
                
                if let vin = self?.processVIN(topCandidate.string) {
                    DispatchQueue.main.async {
                        self?.detectedVIN = vin
                    }
                    return
                }
            }
        }
        
        request.recognitionLevel = .accurate
        request.usesLanguageCorrection = false
        
        let handler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer, options: [:])
        try? handler.perform([request])
    }
}

#Preview {
    VINScannerView(scannedVIN: .constant(""))
}
