<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <link rel="apple-touch-icon" href="/dist/apple-touch-icon.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="theme-color" content="#0b0f12" />
    <link rel="icon" href="/dist/favicon.ico">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deegaan Restaurant</title>
    
    <!-- PWA Manifest -->
    <link rel="manifest" href="/dist/manifest.webmanifest">
    
    <!-- Safari specific meta tags -->
    <meta name="format-detection" content="telephone=no">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-title" content="Deegaan">
    <meta name="application-name" content="Deegaan Restaurant">
    
    <!-- Built CSS files -->
    @foreach(glob(public_path('dist/assets/*.css')) as $file)
    <link rel="stylesheet" href="/dist/assets/{{ basename($file) }}">
    @endforeach
    
    <!-- Built JS files -->
    @foreach(glob(public_path('dist/assets/*.js')) as $file)
    <script type="module" crossorigin src="/dist/assets/{{ basename($file) }}"></script>
    @endforeach
    
  </head>
  <body>
    <div id="app"></div>
    
    <!-- Service Worker Registration -->
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          // Try to register the custom service worker first
          navigator.serviceWorker.register('/sw-custom.js')
            .then((registration) => {
              
              // Check for updates
              registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New content is available, reload the page
                    window.location.reload();
                  }
                });
              });
            })
            .catch((registrationError) => {
              
              // Fallback to default service worker
              navigator.serviceWorker.register('/dist/sw.js')
                .then((registration) => {
                })
                .catch((fallbackError) => {
                });
            });
        });
      }
      
      // Handle offline/online events
      window.addEventListener('online', () => {
        document.body.classList.remove('offline');
      });
      
      window.addEventListener('offline', () => {
        document.body.classList.add('offline');
      });
      
      // Check initial connection status
      if (!navigator.onLine) {
        document.body.classList.add('offline');
      }
    </script>
  </body>
</html>
