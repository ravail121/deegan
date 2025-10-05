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
        
        // Initialize the system
        this.init();
    }

    /**
     * Initialize the notification system
     */
    init() {
        console.log('🔔 Order Notification System initialized');
        
        // Get the last order ID on startup
        this.getLastOrderId().then(() => {
            this.startMonitoring();
        }).catch(error => {
            console.error('❌ Failed to initialize notification system:', error);
        });
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
            // Create audio context for notification sound
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create a simple beep sound
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Configure the beep
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 800Hz
            oscillator.type = 'sine';
            
            // Set volume
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            // Play the beep
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            
            console.log('🔊 Notification sound played');
            
        } catch (error) {
            console.error('❌ Error playing notification sound:', error);
            
            // Fallback: Use browser's built-in notification sound
            try {
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
                audio.play().catch(() => {
                    console.log('🔇 Audio playback not supported');
                });
            } catch (fallbackError) {
                console.log('🔇 No audio support available');
            }
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
