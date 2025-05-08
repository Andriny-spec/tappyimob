# Configuração de Subdomínios Automáticos

## 1. Configuração DNS

Adicione um registro DNS do tipo wildcard (coringa) para permitir qualquer subdomínio:

```
*.imob.tappy.id.  IN  A  {SEU_IP_DO_SERVIDOR}
```

Exemplo para o Cloudflare:
- Tipo: A
- Nome: *.imob.tappy.id
- Conteúdo: {SEU_IP_DO_SERVIDOR}
- TTL: Automático
- Proxy: Desativado (inicialmente para testes)

## 2. Configuração Nginx (servidor web)

Configure o Nginx para rotear requisições baseado no subdomínio:

```nginx
# Arquivo: /etc/nginx/sites-available/imob-tappy-id.conf

server {
    listen 80;
    server_name ~^(?<subdomain>.+)\.imob\.tappy\.id$;

    location / {
        # Roteamento da requisição para o serviço adequado
        proxy_pass http://localhost:3000/sites/$subdomain;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Depois ative o site e reinicie o Nginx:

```bash
ln -s /etc/nginx/sites-available/imob-tappy-id.conf /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## 3. Configuração do Serviço Node.js

No seu aplicativo Next.js, adicione uma rota específica para renderizar o site baseado no subdomínio:

```javascript
// src/app/sites/[subdomain]/page.tsx
```

Este arquivo receberá as requisições e renderizará o site correspondente ao subdomínio.
