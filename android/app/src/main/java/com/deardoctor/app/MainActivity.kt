package com.deardoctor.app

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.os.Bundle
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private val webAppUrl = "https://whitesmoke-dove-500019.hostingersite.com/"
    private val recordAudioPermissionCode = 101

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);

        val settings: WebSettings = webView.settings;
        
        // Enable Javascript and Local Storage Support
        settings.javaScriptEnabled = true;
        settings.domStorageEnabled = true;
        settings.databaseEnabled = true;
        
        // Disable Zoom Support (Restricts pinch-to-zoom completely)
        settings.setSupportZoom(false);
        settings.builtInZoomControls = false;
        settings.displayZoomControls = false;
        
        // Optimize rendering size
        settings.useWideViewPort = true;
        settings.loadWithOverviewMode = true;

        // Force URL clicks to load inside the app instead of default browser
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                if (url != null) {
                    view?.loadUrl(url);
                }
                return true;
            }
        }

        // Handle Audio Recording Permission requests in WebView
        webView.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest?) {
                request?.let {
                    it.grant(it.resources);
                }
            }
        }

        // Request runtime permission from Android OS
        checkMicrophonePermission();

        webView.loadUrl(webAppUrl);
    }

    private fun checkMicrophonePermission() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) 
            != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(
                this, 
                arrayOf(Manifest.permission.RECORD_AUDIO), 
                recordAudioPermissionCode
            );
        }
    }

    // Handle back button navigation inside WebView
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
