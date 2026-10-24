// swift pdf2png.swift in.pdf outPrefix  → outPrefix-01.png, outPrefix-02.png ...
import AppKit
import PDFKit

let args = CommandLine.arguments
guard args.count >= 3, let doc = PDFDocument(url: URL(fileURLWithPath: args[1])) else {
  print("用法：swift pdf2png.swift in.pdf outPrefix"); exit(1)
}
for i in 0..<doc.pageCount {
  let page = doc.page(at: i)!
  let box = page.bounds(for: .mediaBox)
  let scale: CGFloat = 1600 / box.width
  let img = NSImage(size: NSSize(width: box.width * scale, height: box.height * scale))
  img.lockFocus()
  NSColor.white.set(); NSRect(origin: .zero, size: img.size).fill()
  let ctx = NSGraphicsContext.current!.cgContext
  ctx.scaleBy(x: scale, y: scale)
  page.draw(with: .mediaBox, to: ctx)
  img.unlockFocus()
  let png = NSBitmapImageRep(data: img.tiffRepresentation!)!.representation(using: .png, properties: [:])!
  try! png.write(to: URL(fileURLWithPath: String(format: "%@-%02d.png", args[2], i + 1)))
}
