#!/usr/bin/env python3
import http.server
import socketserver
import os
import mimetypes

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
    def end_headers(self):
        # 캐시 완전 비활성화
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def guess_type(self, path):
        # JavaScript 파일에 대한 명시적 MIME 타입 설정
        if path.endswith('.js'):
            return 'application/javascript'
        elif path.endswith('.html'):
            return 'text/html'
        elif path.endswith('.css'):
            return 'text/css'
        else:
            return super().guess_type(path)
    
    def do_GET(self):
        print(f"Request: {self.path}")
        super().do_GET()

if __name__ == "__main__":
    PORT = 9000
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"Custom server running at http://localhost:{PORT}")
        print("Press Ctrl+C to stop")
        httpd.serve_forever()
