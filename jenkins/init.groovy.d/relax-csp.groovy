// Allow Mochawesome (and other HTML reports) to render inline scripts/styles
// Jenkins' default CSP blocks these, causing blank report pages.
System.setProperty(
    "hudson.model.DirectoryBrowserSupport.CSP",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data:; " +
    "font-src 'self' data:;"
)

println("--> CSP relaxed for HTML report rendering")
