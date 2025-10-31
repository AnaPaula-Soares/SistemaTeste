#!/usr/bin/env python3
import json
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

USERS = {}  # email -> user data

class Handler(SimpleHTTPRequestHandler):
    def _send_json(self, status_code, data):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        
        # API routes
        if path == '/api/users/exists':
            qs = parse_qs(parsed.query or '')
            email = (qs.get('email') or [''])[0].strip().lower()
            exists = email in USERS
            return self._send_json(200, {'exists': exists})
        
        # Clean URL routing (sem .html)
        if path == '/login':
            self.path = '/login.html'
        elif path == '/cadastro' or path == '/':
            self.path = '/index.html'
        elif path == '/termos':
            self.path = '/indextermos.html'
        
        # Serve arquivos estáticos normalmente
        return super().do_GET()

    def do_POST(self):
        if self.path == '/api/users':
            length = int(self.headers.get('Content-Length', '0'))
            body = self.rfile.read(length) if length > 0 else b''
            try:
                data = json.loads(body.decode('utf-8'))
            except Exception:
                return self._send_json(400, {'message': 'JSON inválido.'})

            email = (data.get('email') or '').strip().lower()
            if not email:
                return self._send_json(400, {'message': 'E-mail é obrigatório.'})
            if email in USERS:
                return self._send_json(409, {'message': 'E-mail já cadastrado.'})

            # Simples inserção em memória (não persistente)
            USERS[email] = data
            return self._send_json(201, {'message': 'Cadastro realizado com sucesso!'})

        elif self.path == '/api/login':
            length = int(self.headers.get('Content-Length', '0'))
            body = self.rfile.read(length) if length > 0 else b''
            try:
                data = json.loads(body.decode('utf-8'))
            except Exception:
                return self._send_json(400, {'message': 'JSON inválido.'})

            email = (data.get('email') or '').strip().lower()
            senha = data.get('senha') or ''
            
            if not email:
                return self._send_json(400, {'message': 'E-mail é obrigatório.'})
            if not senha:
                return self._send_json(400, {'message': 'Senha é obrigatória.'})
            
            # Validação simples de email
            import re
            email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
            if not re.match(email_regex, email):
                return self._send_json(400, {'message': 'E-mail inválido.'})
            
            # Por enquanto, qualquer email válido e senha acessa
            # No futuro, você pode implementar validação real aqui
            return self._send_json(200, {'message': 'Login realizado com sucesso!', 'email': email})

        return super().do_POST()

    def log_message(self, format, *args):
        # Mais silencioso
        return

if __name__ == '__main__':
    port = 8000
    server = ThreadingHTTPServer(('', port), Handler)
    print(f'Server iniciado. Preview: http://localhost:{port}/cadastro/')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    server.server_close()