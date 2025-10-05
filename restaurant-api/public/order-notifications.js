/**
 * Standalone Order Notification System
 * 
 * This file runs independently and checks for new e-menu orders every 10 seconds.
 * When new orders are detected, it plays a notification sound.
 * 
 * Usage: Include this script in your main restaurant system dashboard
 */

class OrderNotificationSystem {
    constructor() {
        this.apiUrl = '/api/orders'; // Adjust this URL as needed
        this.checkInterval = 10000; // 10 seconds
        this.lastOrderId = null;
        this.isRunning = false;
        this.intervalId = null;
        this.audioContext = null;
        this.audioInitialized = false;
        
        // Initialize the system
        this.init();
    }

    /**
     * Initialize the notification system
     */
    init() {
        console.log('🔔 Order Notification System initialized');
        
        // Add click handler to initialize audio on first user interaction
        this.addAudioInitHandler();
        
        // Get the last order ID on startup
        this.getLastOrderId().then(() => {
            this.startMonitoring();
        }).catch(error => {
            console.error('❌ Failed to initialize notification system:', error);
        });
    }

    /**
     * Add click handler to initialize audio on first user interaction
     */
    addAudioInitHandler() {
        const initAudio = () => {
            if (!this.audioInitialized) {
                this.audioInitialized = true;
                this.initAudioContext();
                // Remove the event listeners after first interaction
                document.removeEventListener('click', initAudio);
                document.removeEventListener('keydown', initAudio);
                document.removeEventListener('touchstart', initAudio);
            }
        };

        // Add event listeners for various user interactions
        document.addEventListener('click', initAudio);
        document.addEventListener('keydown', initAudio);
        document.addEventListener('touchstart', initAudio);
    }

    /**
     * Get the last order ID to establish baseline
     */
    async getLastOrderId() {
        try {
            const response = await this.makeApiCall('GET', this.apiUrl + '/latest');
            if (response.success && response.data) {
                this.lastOrderId = response.data.orderID;
                console.log(`📋 Baseline order ID set to: ${this.lastOrderId}`);
            } else {
                // If no orders exist, start from 0
                this.lastOrderId = 0;
                console.log('📋 No existing orders found, starting from 0');
            }
        } catch (error) {
            console.error('❌ Error getting last order ID:', error);
            this.lastOrderId = 0;
        }
    }

    /**
     * Start monitoring for new orders
     */
    startMonitoring() {
        if (this.isRunning) {
            console.log('⚠️ Monitoring is already running');
            return;
        }

        this.isRunning = true;
        console.log('🚀 Starting order monitoring...');
        
        // Check immediately
        this.checkForNewOrders();
        
        // Then check every 10 seconds
        this.intervalId = setInterval(() => {
            this.checkForNewOrders();
        }, this.checkInterval);
    }

    /**
     * Stop monitoring for new orders
     */
    stopMonitoring() {
        if (!this.isRunning) {
            console.log('⚠️ Monitoring is not running');
            return;
        }

        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        console.log('⏹️ Order monitoring stopped');
    }

    /**
     * Check for new orders
     */
    async checkForNewOrders() {
        try {
            console.log('🔍 Checking for new orders...');
            
            // Get orders newer than our last known order
            const response = await this.makeApiCall('GET', `${this.apiUrl}/newer/${this.lastOrderId}`);
            
            if (response.success && response.data && response.data.length > 0) {
                console.log(`🎉 Found ${response.data.length} new order(s)!`);
                
                // Process each new order
                for (const order of response.data) {
                    this.handleNewOrder(order);
                }
                
                // Update last order ID to the newest one
                const newestOrder = response.data[response.data.length - 1];
                this.lastOrderId = newestOrder.orderID;
                
            } else {
                console.log('📭 No new orders found');
            }
            
        } catch (error) {
            console.error('❌ Error checking for new orders:', error);
        }
    }

    /**
     * Handle a new order notification
     */
    handleNewOrder(order) {
        console.log(`🔔 NEW ORDER DETECTED!`, {
            orderID: order.orderID,
            tableName: order.tableName,
            orderAmount: order.orderAmount,
            orderDate: order.orderDate
        });

        // Play notification sound
        this.playNotificationSound();

        // Show visual notification (optional)
        this.showVisualNotification(order);

        // Log order details
        this.logOrderDetails(order);
    }

    /**
     * Play notification sound
     */
    playNotificationSound() {
        try {
            // Method 1: Try Web Audio API with user interaction
            if (this.audioContext && this.audioContext.state === 'running') {
                this.playWebAudioBeep();
                return;
            }
            
            // Method 2: Use HTML5 Audio with data URI (more reliable)
            this.playHTML5Beep();
            
        } catch (error) {
            console.error('❌ Error playing notification sound:', error);
            // Method 3: Fallback to system beep
            this.playSystemBeep();
        }
    }

    /**
     * Play beep using Web Audio API
     */
    playWebAudioBeep() {
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Configure the beep
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.type = 'sine';
            
            // Set volume
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            // Play the beep
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
            
            console.log('🔊 Web Audio beep played');
            
        } catch (error) {
            console.error('❌ Web Audio beep failed:', error);
            this.playHTML5Beep();
        }
    }

    /**
     * Play beep using HTML5 Audio (most reliable)
     */
    playHTML5Beep() {
        try {
            // Check if audio is allowed (user has interacted)
            if (!this.audioInitialized) {
                console.log('🔇 Audio not initialized - user interaction required');
                this.playSystemBeep();
                return;
            }
            
            // Create a simple beep sound using data URI
            const beepData = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
            
            const audio = new Audio(beepData);
            audio.volume = 0.5;
            audio.play().then(() => {
                console.log('🔊 HTML5 beep played');
            }).catch((error) => {
                console.error('❌ HTML5 beep failed:', error);
                this.playSystemBeep();
            });
            
        } catch (error) {
            console.error('❌ HTML5 beep creation failed:', error);
            this.playSystemBeep();
        }
    }

    /**
     * Fallback system beep
     */
    playSystemBeep() {
        try {
            // Try multiple beep methods
            console.log('\x07'); // ASCII bell character
            
            // Try to create a simple beep using document title flash
            this.flashTitle();
            
            // Try to use browser notification if available
            this.showBrowserNotification();
            
            console.log('🔔 System beep attempted');
        } catch (error) {
            console.log('🔇 No audio support available');
        }
    }

    /**
     * Flash document title as visual notification
     */
    flashTitle() {
        try {
            const originalTitle = document.title;
            let flashCount = 0;
            const maxFlashes = 6;
            
            const flash = () => {
                if (flashCount < maxFlashes) {
                    document.title = flashCount % 2 === 0 ? '🔔 NEW ORDER!' : originalTitle;
                    flashCount++;
                    setTimeout(flash, 500);
                } else {
                    document.title = originalTitle;
                }
            };
            
            flash();
        } catch (error) {
            // Ignore title flash errors
        }
    }

    /**
     * Show browser notification if permission granted
     */
    showBrowserNotification() {
        try {
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('New Order!', {
                    body: 'A new order has been received',
                    icon: '/favicon.ico',
                    tag: 'new-order'
                });
            }
        } catch (error) {
            // Ignore notification errors
        }
    }

    /**
     * Initialize audio context (call this on first user interaction)
     */
    initAudioContext() {
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            // Request notification permission
            this.requestNotificationPermission();
            
            console.log('🔊 Audio context initialized');
            return true;
        } catch (error) {
            console.error('❌ Audio context initialization failed:', error);
            return false;
        }
    }

    /**
     * Request notification permission
     */
    requestNotificationPermission() {
        try {
            if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        console.log('🔔 Notification permission granted');
                    } else {
                        console.log('🔇 Notification permission denied');
                    }
                });
            }
        } catch (error) {
            // Ignore notification permission errors
        }
    }

    /**
     * Show visual notification (optional)
     */
    showVisualNotification(order) {
        // Create a simple visual notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #22c55e;
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 4px;">🔔 New Order!</div>
            <div>Order #${order.orderID}</div>
            <div>Table: ${order.tableName}</div>
            <div>Amount: $${order.orderAmount}</div>
        `;
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    /**
     * Log order details to console
     */
    logOrderDetails(order) {
        console.group('📋 Order Details');
        console.log('Order ID:', order.orderID);
        console.log('Table Name:', order.tableName);
        console.log('Table ID:', order.tableID);
        console.log('Warehouse ID:', order.whouseID);
        console.log('Order Amount:', order.orderAmount);
        console.log('VAT Value:', order.vatValue);
        console.log('Total Amount:', order.totalAmount);
        console.log('Order Date:', order.orderDate);
        console.log('Order Time:', order.orderTime);
        console.log('Status:', order.status);
        console.groupEnd();
    }

    /**
     * Make API call with error handling
     */
    async makeApiCall(method, url, data = null) {
        try {
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            };

            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
            
        } catch (error) {
            console.error('❌ API call failed:', error);
            throw error;
        }
    }

    /**
     * Get system status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            lastOrderId: this.lastOrderId,
            checkInterval: this.checkInterval,
            apiUrl: this.apiUrl
        };
    }

    /**
     * Update configuration
     */
    updateConfig(config) {
        if (config.checkInterval) {
            this.checkInterval = config.checkInterval;
        }
        if (config.apiUrl) {
            this.apiUrl = config.apiUrl;
        }
        
        // Restart monitoring if it's running
        if (this.isRunning) {
            this.stopMonitoring();
            this.startMonitoring();
        }
    }
}

// Auto-initialize when script loads
let orderNotificationSystem;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        orderNotificationSystem = new OrderNotificationSystem();
    });
} else {
    orderNotificationSystem = new OrderNotificationSystem();
}

// Expose to global scope for manual control
window.OrderNotificationSystem = OrderNotificationSystem;
window.orderNotificationSystem = orderNotificationSystem;

// Console commands for testing
console.log(`
🔔 Order Notification System Loaded!

Available commands:
- orderNotificationSystem.startMonitoring()  // Start monitoring
- orderNotificationSystem.stopMonitoring()   // Stop monitoring
- orderNotificationSystem.getStatus()        // Get system status
- orderNotificationSystem.checkForNewOrders() // Manual check

Example usage:
orderNotificationSystem.updateConfig({
    checkInterval: 5000,  // Check every 5 seconds
    apiUrl: '/api/orders' // Custom API URL
});
`);
