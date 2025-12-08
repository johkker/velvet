# API_GATEWAY_SPEC.md

## 1. Objetivo
Este documento define **todos os contratos oficiais do Backend (NestJS)** consumidos pelo Frontend (Next.js).  
Inclui:
- Endpoints
- Métodos
- Query params
- DTOs de entrada e saída
- Padrões de erro
- Paginação
- Códigos HTTP
- Regras de cache e autenticação
- Eventos assíncronos (pagamentos, upload)

Serve como referência absoluta para desenvolvimento humano ou automatizado (IA).

---

# 2. Convenções Globais

## 2.1. Base URL
```
/api/v1/
```

## 2.2. Formato de Resposta
```json
{
  "data": {},
  "meta": {},
  "error": null
}
```
Erro:
```json
{
  "data": null,
  "meta": {},
  "error": {
    "code": "INVALID_FIELD",
    "message": "Campo obrigatório.",
    "details": {}
  }
}
```

## 2.3. Paginação
```
?limit=20&offset=0
```

## 2.4. Autenticação
Header:
```
Authorization: Bearer <token>
```

Roles:
- TALENT
- ESTABLISHMENT
- ADMIN

---

# 3. Endpoints Públicos

## 3.1. GET /talents/featured
Retorna talentos em destaque.

### Response
```json
{
  "data": [TalentCardDTO],
  "meta": {}
}
```

---

## 3.2. GET /talents/search
Query params:
```
?city=sp
&services=gfe,massagem
&price_min=100
&price_max=400
&status=online
&sort=boosted
&limit=20
&offset=0
```

### Response
```json
{
  "data": [TalentCardDTO],
  "meta": {
    "total": 124,
    "limit": 20,
    "offset": 0
  }
}
```

---

## 3.3. GET /talents/:slug
Retorna perfil completo.

### Response: TalentProfileDTO
```json
{
  "id": "string",
  "slug": "string",
  "display_name": "string",
  "bio": "string",
  "age": 23,
  "city": "string",
  "services": ["GFE"],
  "price_min": 200,
  "status": "ONLINE",
  "is_boosted": true,
  "is_verified": true,
  "photo_gallery": [
    { "url": "...", "is_main": true, "blur_url": "..." }
  ],
  "associated_establishment": {
    "name": "Casa X",
    "slug": "casa-x"
  },
  "contact_link": "https://wa.me/...",
  "tags": ["Educada"]
}
```

---

# 4. Autenticação

## 4.1. POST /auth/login
```json
{
  "email": "string",
  "password": "string"
}
```

### Response
```json
{
  "data": {
    "access_token": "jwt",
    "refresh_token": "jwt",
    "role": "TALENT"
  }
}
```

---

## 4.2. POST /auth/register/talent
```json
{
  "email": "string",
  "password": "string",
  "display_name": "string",
  "city": "string"
}
```

---

# 5. Usuário Autenticado

## 5.1. GET /users/me
Retorna dados do usuário + perfil.

### Response
```json
{
  "data": {
    "id": "string",
    "email": "string",
    "role": "TALENT",
    "talent_profile": {
      "display_name": "string",
      "city": "string",
      "price_min": 200
    }
  }
}
```

---

# 6. Talento (Dashboard)

## 6.1. PATCH /talents
```json
{
  "display_name": "string",
  "bio": "string",
  "age": 23,
  "services": ["Massagem", "GFE"],
  "price_min": 150,
  "city": "string"
}
```

---

## 6.2. POST /media/upload
Multipart:
```
file: (foto)
```

### Response
```json
{
  "data": {
    "id": "string",
    "url": "string",
    "blur_url": "string",
    "status": "PROCESSING"
  }
}
```

Processamento assíncrono atualizará status para READY.

---

## 6.3. GET /invitations/incoming
Lista convites recebidos.

### Response
```json
{
  "data": [
    {
      "id": "string",
      "from_establishment": {
        "id": "string",
        "name": "Casa X"
      },
      "status": "PENDING"
    }
  ]
}
```

---

## 6.4. POST /invitations/accept/:id
Sem payload.

---

# 7. Estabelecimento

## 7.1. POST /invitations/send
```json
{
  "talent_id": "string"
}
```

### Response
```json
{
  "data": { "status": "SENT" }
}
```

---

# 8. Boosts & Pagamentos

## 8.1. POST /boosts
```json
{
  "duration_days": 1,
  "payment_method": "PIX"
}
```

### Response
```json
{
  "data": {
    "boost_id": "string",
    "payment_url": "string"
  }
}
```

---

# 9. Eventos Assíncronos

## 9.1. Upload de mídia
```
POST /media/upload → status PROCESSING
Worker → gera blur + otimizações → status READY
```
Frontend deve poll ou aguardar refresh.

---

## 9.2. Pagamentos
1. Front chama `/boosts` → recebe `payment_url`
2. Usuário paga
3. Webhook do provedor chama backend
4. Boost é ativado por TTL

---

# 10. Schemas Globais

## TalentCardDTO
```json
{
  "id": "string",
  "slug": "string",
  "display_name": "string",
  "city": "string",
  "photo_main": "string",
  "is_boosted": true,
  "is_online": true
}
```

## TalentProfileDTO
(Como já descrito nas seções anteriores)

---

# 11. Códigos de Erro
```json
INVALID_FIELD
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
CONFLICT
RATE_LIMITED
```

---

Documento finalizado. Contratos oficiais estabelecidos.

