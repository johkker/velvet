# BACKEND_DATA_ARCHITECTURE.md

## Objetivo
Documento completo que descreve a **modelagem de dados (ERD)** e a **arquitetura do backend (NestJS + infra)** para o Projeto Velvet. Destinado a desenvolvedores humanos e agentes de IA para gerar migrations, schemas ORM, módulos, workers e fluxos assíncronos sem ambiguidade.

---

# 1. Visão Geral do Domínio
Entidades principais:
- users
- talents
- establishments
- photos
- invitations
- boosts
- payments
- sessions (refresh tokens)
- audit_logs
- roles (enum)

Relações essenciais:
- `users` 1:1 `talents` ou 1:1 `establishments` (user tem UM perfil de talento ou UM perfil de estabelecimento)
- `talents` 1:N `photos`
- `establishments` 1:N `invitations`
- `talents` 1:N `boosts`
- `boosts` 1:N `payments`

---

# 2. ERD (Resumo ASCII)

```
users {1} --- {0..1} talents
users {1} --- {0..1} establishments

talents {1} --- {0..N} photos
establishments {1} --- {0..N} invitations

talents {1} --- {0..N} boosts --- {0..N} payments

sessions (refresh tokens) linked to users
audit_logs linked to important actions (user_id nullable)
```

---

# 3. Tabelas e Schemas (Postgres)
Abaixo estão as definições de tabelas principais com tipos, constraints e índices recomendados.

## 3.1. users
```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) NOT NULL UNIQUE,
  password_hash varchar(255) NOT NULL,
  role varchar(32) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true
);
CREATE INDEX idx_users_role ON users(role);
```
- `role` enum values: 'TALENT', 'ESTABLISHMENT', 'ADMIN'

## 3.2. talents
```sql
CREATE TABLE talents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  slug varchar(160) NOT NULL UNIQUE,
  display_name varchar(120) NOT NULL,
  bio text,
  age smallint,
  city varchar(100),
  services text[] DEFAULT '{}',
  price_min integer,
  status varchar(16) DEFAULT 'OFFLINE', -- ONLINE|OFFLINE
  is_boosted boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_talents_city ON talents(city);
CREATE INDEX idx_talents_status ON talents(status);
CREATE INDEX idx_talents_price_min ON talents(price_min);
```

## 3.3. establishments
```sql
CREATE TABLE establishments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  slug varchar(160) NOT NULL UNIQUE,
  address text,
  city varchar(100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_establishments_city ON establishments(city);
```

## 3.4. photos
```sql
CREATE TABLE photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id uuid REFERENCES talents(id) ON DELETE CASCADE,
  url text NOT NULL,
  blur_url text,
  is_main boolean DEFAULT false,
  status varchar(16) DEFAULT 'PROCESSING', -- PROCESSING|READY|REJECTED
  width integer,
  height integer,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_photos_talent_id ON photos(talent_id);
CREATE INDEX idx_photos_status ON photos(status);
```

## 3.5. invitations
```sql
CREATE TABLE invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id uuid REFERENCES establishments(id) ON DELETE CASCADE,
  talent_id uuid REFERENCES talents(id) ON DELETE CASCADE,
  message text,
  status varchar(16) DEFAULT 'PENDING', -- PENDING|ACCEPTED|REJECTED
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_invitations_establishment ON invitations(establishment_id);
CREATE INDEX idx_invitations_talent ON invitations(talent_id);
```

## 3.6. boosts
```sql
CREATE TABLE boosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id uuid REFERENCES talents(id) ON DELETE CASCADE,
  start_at timestamptz,
  end_at timestamptz,
  duration_days int,
  payment_id uuid REFERENCES payments(id),
  status varchar(16) DEFAULT 'PENDING', -- PENDING|ACTIVE|EXPIRED|CANCELLED
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_boosts_talent ON boosts(talent_id);
CREATE INDEX idx_boosts_status ON boosts(status);
CREATE INDEX idx_boosts_end_at ON boosts(end_at);
```

> Nota: `boosts.payment_id` nullable até o pagamento ser confirmado. Alternativamente, pagamentos podem referenciar boost_id.

## 3.7. payments
```sql
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boost_id uuid REFERENCES boosts(id) ON DELETE SET NULL,
  provider varchar(64) NOT NULL, -- STRIPE|MERCADOPAGO|PIX
  provider_payment_id varchar(255),
  amount_cents bigint NOT NULL,
  currency varchar(8) DEFAULT 'BRL',
  status varchar(32) NOT NULL, -- CREATED|PENDING|COMPLETED|FAILED
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_boost ON payments(boost_id);
```

## 3.8. sessions (refresh tokens)
```sql
CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash varchar(255) NOT NULL,
  user_agent text,
  ip_address varchar(64),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);
CREATE INDEX idx_sessions_user ON sessions(user_id);
```

## 3.9. audit_logs
```sql
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  action varchar(128),
  resource_type varchar(64),
  resource_id uuid,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
```

---

# 4. Relacionamentos e Regras de Negócio
- Um `user` pode ser apenas TALENT ou ESTABLISHMENT (enforce na aplicação; opcional: CHECK constraint no DB).
- `talents.slug` único.
- `photos.is_main` deve ser no máximo 1 por talento — garantir com trigger ou lógica de aplicação (ou index partial UNIQUE (talent_id) WHERE is_main).

Exemplo de index parcial (Postgres):
```sql
CREATE UNIQUE INDEX unique_main_photo_per_talent ON photos (talent_id) WHERE is_main = true;
```

---

# 5. Exemplo de Schema Prisma (snippet)
Se usar Prisma, o modelo abaixo resume os campos principais (simplificado):

```prisma
model User {
  id         String   @id @default(uuid())
  email      String   @unique
  password   String
  role       Role
  talent     Talent?  @relation(fields: [talentId], references: [id])
  talentId   String?
  establishment Establishment?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

enum Role { TALENT ESTABLISHMENT ADMIN }

model Talent {
  id          String   @id @default(uuid())
  user        User     @relation(fields: [userId], references: [id])
  userId      String   @unique
  slug        String   @unique
  displayName String
  bio         String?
  age         Int?
  city        String?
  services    String[]
  priceMin    Int?
  status      String   @default("OFFLINE")
  isBoosted   Boolean  @default(false)
  isVerified  Boolean  @default(false)
  photos      Photo[]
}

model Photo {
  id        String  @id @default(uuid())
  talent    Talent? @relation(fields: [talentId], references: [id])
  talentId  String?
  url       String
  blurUrl   String?
  isMain    Boolean @default(false)
  status    String  @default("PROCESSING")
}
```

---

# 6. Índices e Otimizações
- Índices em `talents(city, is_boosted, status, price_min)` para queries de listagem.
- Índices parciais para `photos (talent_id) WHERE status = 'READY'`.
- Usar `GIN` index em `services` (text[]) para buscas por serviço.

Exemplo:
```sql
CREATE INDEX idx_talents_services_gin ON talents USING gin (services);
```

---

# 7. Arquitetura do Backend (NestJS) - Estrutura e Padrões

## 7.1. Organização de pastas
```
src/
 ├─ modules/
 │   ├─ auth/
 │   ├─ users/
 │   ├─ talents/
 │   ├─ establishments/
 │   ├─ photos/
 │   ├─ invitations/
 │   ├─ boosts/
 │   ├─ payments/
 │   └─ notifications/
 ├─ common/
 │   ├─ guards/
 │   ├─ interceptors/
 │   ├─ pipes/
 │   ├─ filters/
 │   └─ decorators/
 ├─ infra/
 │   ├─ prisma.module.ts
 │   ├─ redis.module.ts
 │   ├─ queue.module.ts  (RabbitMQ)
 │   └─ storage.module.ts (S3 or MinIO)
 └─ main.ts
```

## 7.2. Principais Responsabilidades por Módulo
- **auth**: login, refresh, guards, strategies JWT
- **users**: CRUD usuários, sessões
- **talents**: endpoints públicos e privados, slug resolver
- **photos**: upload, validação, status
- **invitations**: envio/aceitação/rejeição
- **boosts**: criação, ativação, expiração
- **payments**: integração com provedores, webhooks
- **notifications**: filas para emails/push

## 7.3. Patterns & Cross-Cutting
- **Guards**: `RolesGuard` (verifica role), `AuthGuard` (verifica JWT)
- **Interceptors**: `TransformResponseInterceptor` para padronizar `{data, meta, error}`; `TimeoutInterceptor` opcional
- **Pipes**: `ValidationPipe` (class-validator/class-transformer ou zod)
- **Filters**: `AllExceptionsFilter` mapeando para ErrorDTO
- **Logger** central (Winston ou pino)
- **Caching**: Redis, com keys padronizadas (`talent:featured`, `talent:list:city:{city}:...`)
- **Queue**: RabbitMQ para processamento de mídia e jobs de pagamento
- **Storage**: S3/MinIO para arquivos; CDN + signed URLs

---

# 8. Workers & Jobs

## 8.1. Media Worker
- Consome fila `media.process`
- Tarefas: gerar thumbnail, gerar blurhash/blur_url, redimensionar, detecção de NSFW (opcional), otimizar JPG/WebP
- Atualiza `photos.status` para READY e envia evento para invalidar cache

## 8.2. Payment Worker
- Processa webhooks, reconciliations, retries
- Atualiza `payments.status` e marca `boosts` como ACTIVE quando confirmado

## 8.3. Notification Worker
- Envia emails (SendGrid/Mailgun) e push notifications

---

# 9. Fluxos Críticos (sequências)

## 9.1. Cadastro de Talento
1. `POST /auth/register/talent` cria `user` + `talents` (status OFFLINE)
2. Email de verificação enviado (fila)
3. Após verificação, `talent.is_verified` pode ser true

## 9.2. Upload de Foto
1. Frontend faz `POST /media/upload` (multipart) -> retorna `photo` com status PROCESSING
2. API coloca job em `media.process` com `photo_id`
3. Media Worker processa e atualiza `photos.status=READY` e `photos.blur_url`
4. Cache invalidation para listagens e perfil

## 9.3. Compra de Boost
1. `POST /boosts` cria `boost` (PENDING) e `payment` (CREATED)
2. Backend retorna `payment_url` para checkout
3. Usuário paga; provedor dispara webhook
4. Webhook enfileira job para Payment Worker
5. Worker valida e atualiza `payments.status=COMPLETED` e `boosts.status=ACTIVE`; define `start_at` e `end_at`
6. Sistema agenda job TTL (ou cron) para expirar boost

---

# 10. Segurança & Compliance
- Nunca armazenar `refresh_token` em texto; armazenar hash
- Armazenar apenas `password_hash` (bcrypt / argon2)
- CSRF não aplicável para APIs JWT, mas proteger endpoints de admin
- Rate limiting em rotas sensíveis (login, register, search)
- Proteção contra SQL injection: usar query builders/ORM

---

# 11. Migrations & Seeds
- Migrations geradas com Prisma/Migrate ou um tool (Flyway)
- Seeds: perfis de teste, cidades base, alguns usuários admin

Exemplo de migration SQL para `photos` já mostrado na seção 3.

---

# 12. Observabilidade
- Tracing (OpenTelemetry) para requests + jobs
- Metrics (Prometheus) com: request_latency, job_queue_length, failed_jobs
- Logs estruturados (JSON) via pino/winston

---

# 13. Exemplos de DTOs (NestJS / TypeScript)

```ts
// talent-profile.dto.ts
export class TalentCardDTO {
  id: string;
  slug: string;
  displayName: string;
  city?: string;
  photoMain?: string;
  isBoosted?: boolean;
  isOnline?: boolean;
}

export class TalentProfileDTO extends TalentCardDTO {
  bio?: string;
  age?: number;
  services?: string[];
  priceMin?: number;
  isVerified?: boolean;
  photoGallery?: { url: string; isMain: boolean; blurUrl?: string }[];
  associatedEstablishment?: { name: string; slug: string };
  contactLink?: string;
  tags?: string[];
}
```

---

# 14. Checklist para um agente de IA gerar o backend completo
- [ ] Gerar models/migrations para todas as tabelas acima
- [ ] Implementar módulos NestJS com controllers, services e repositories
- [ ] Implementar guards (AuthGuard, RolesGuard)
- [ ] Implementar ValidationPipe e DTOs
- [ ] Integrar Redis + RabbitMQ + S3
- [ ] Implementar Workers (media, payments, notifications)
- [ ] Criar testes básicos (e2e para auth, search, upload)
- [ ] Criar scripts de seed

---

# 15. Conclusão
Este documento é a fonte de verdade para a modelagem de dados e arquitetura backend. Com ele, um agente de IA pode gerar migrations, modelos ORM, módulos NestJS, workers e fluxos assíncronos com mínima intervenção humana.


