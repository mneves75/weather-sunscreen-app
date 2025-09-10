import Foundation
import UIKit
import CoreMotion
import CoreHaptics

/**
 * Memory manager for LiquidGlassNativeModule
 * Provides proper resource cleanup and memory leak prevention
 */

// MARK: - Memory-Safe Display Link Proxy
private class DisplayLinkProxy: NSObject {
    weak var target: LiquidGlassNativeModule?
    private var displayLink: CADisplayLink?
    private let viewId: Int
    
    init(target: LiquidGlassNativeModule, viewId: Int) {
        self.target = target
        self.viewId = viewId
        super.init()
    }
    
    @objc func tick() {
        target?.updateBlur()
    }
    
    func start() {
        stop() // Ensure no duplicate
        displayLink = CADisplayLink(target: self, selector: #selector(tick))
        displayLink?.add(to: .main, forMode: .common)
    }
    
    func stop() {
        displayLink?.invalidate()
        displayLink = nil
    }
    
    deinit {
        stop()
        // Notify manager of cleanup
        target?.displayLinkDidDeallocate(viewId: viewId)
    }
}

// MARK: - View Observer for Automatic Cleanup
private class ViewObserver: NSObject {
    weak var target: LiquidGlassNativeModule?
    private weak var observedView: UIView?
    private let viewId: Int
    
    init(target: LiquidGlassNativeModule, view: UIView, viewId: Int) {
        self.target = target
        self.observedView = view
        self.viewId = viewId
        super.init()
        
        // Use weak observation to prevent retain cycles
        observedView?.addObserver(
            self,
            forKeyPath: "window",
            options: [.new, .old],
            context: nil
        )
    }
    
    override func observeValue(forKeyPath keyPath: String?, 
                              of object: Any?, 
                              change: [NSKeyValueChangeKey : Any]?, 
                              context: UnsafeMutableRawPointer?) {
        
        if keyPath == "window" {
            let newWindow = change?[.new] as? UIWindow
            let oldWindow = change?[.old] as? UIWindow
            
            // View was removed from window hierarchy
            if oldWindow != nil && newWindow == nil {
                target?.viewDidMoveToNilWindow(viewId: viewId)
            }
        }
    }
    
    func stopObserving() {
        observedView?.removeObserver(self, forKeyPath: "window")
        observedView = nil
    }
    
    deinit {
        stopObserving()
    }
}

// MARK: - Resource Manager
class LiquidGlassResourceManager {
    private var displayLinkProxies: [Int: DisplayLinkProxy] = [:]
    private var viewObservers: [Int: ViewObserver] = [:]
    private let resourceLock = NSLock()
    
    weak var moduleTarget: LiquidGlassNativeModule?
    
    init(moduleTarget: LiquidGlassNativeModule) {
        self.moduleTarget = moduleTarget
    }
    
    // MARK: - Display Link Management
    
    func createDisplayLink(for viewId: Int) -> DisplayLinkProxy? {
        guard let target = moduleTarget else { return nil }
        
        resourceLock.lock()
        defer { resourceLock.unlock() }
        
        // Clean up existing proxy if any
        displayLinkProxies[viewId]?.stop()
        
        // Create new proxy
        let proxy = DisplayLinkProxy(target: target, viewId: viewId)
        displayLinkProxies[viewId] = proxy
        
        return proxy
    }
    
    func removeDisplayLink(for viewId: Int) {
        resourceLock.lock()
        defer { resourceLock.unlock() }
        
        displayLinkProxies[viewId]?.stop()
        displayLinkProxies.removeValue(forKey: viewId)
    }
    
    func displayLinkDidDeallocate(viewId: Int) {
        resourceLock.lock()
        defer { resourceLock.unlock() }
        
        displayLinkProxies.removeValue(forKey: viewId)
    }
    
    // MARK: - View Observer Management
    
    func observeView(_ view: UIView, viewId: Int) {
        guard let target = moduleTarget else { return }
        
        resourceLock.lock()
        defer { resourceLock.unlock() }
        
        // Clean up existing observer if any
        viewObservers[viewId]?.stopObserving()
        
        // Create new observer
        let observer = ViewObserver(target: target, view: view, viewId: viewId)
        viewObservers[viewId] = observer
    }
    
    func removeViewObserver(for viewId: Int) {
        resourceLock.lock()
        defer { resourceLock.unlock() }
        
        viewObservers[viewId]?.stopObserving()
        viewObservers.removeValue(forKey: viewId)
    }
    
    // MARK: - Cleanup
    
    func cleanupAllResources() {
        resourceLock.lock()
        defer { resourceLock.unlock() }
        
        // Stop all display links
        displayLinkProxies.values.forEach { $0.stop() }
        displayLinkProxies.removeAll()
        
        // Stop all view observers
        viewObservers.values.forEach { $0.stopObserving() }
        viewObservers.removeAll()
    }
    
    deinit {
        cleanupAllResources()
    }
}

// MARK: - LiquidGlassNativeModule Extension
extension LiquidGlassNativeModule {
    
    func displayLinkDidDeallocate(viewId: Int) {
        // Called when a DisplayLinkProxy is deallocated
        // This ensures we don't hold stale references
    }
    
    func viewDidMoveToNilWindow(viewId: Int) {
        // Called when a view is removed from window hierarchy
        // Clean up associated resources
        resourceManager?.removeDisplayLink(for: viewId)
        resourceManager?.removeViewObserver(for: viewId)
    }
}