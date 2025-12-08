# STYLE_GUIDE_REWRITE.md

## 1. Objetivo
Este documento define o **Design System oficial do Velvet**, otimizado para:
- implementação rápida,
- consistência visual,
- fácil compreensão por agentes de IA,
- interoperabilidade entre frontend e backend via tokens estáveis,
- uso em componentes atomic design.

Ele expande o Style Guide original, padronizando **tokens**, **layout**, **tipografia**, **componentes base**, **animações** e **estados de interface**.

---

# 2. Design Tokens
Tokens garantem consistência e permitem que IA gere UI confiável sem divergências.

## 2.1. Cores

### Paleta Principal (Dark Mode)
```
--color-bg-primary: #121212;
--color-bg-secondary: #1E1E1E;
--color-accent-primary: #D4AF37;   /* Dourado */
--color-accent-secondary: #E91E63; /* Rosa Neon */
--color-text-primary: rgba(255,255,255,0.87);
--color-text-secondary: rgba(255,255,255,0.60);
--color-border: rgba(255,255,255,0.12);
--color-success: #4CAF50;
--color-error: #F44336;
```

---

## 2.2. Tipografia

### Fontes
- **Headings:** Playfair Display
- **Body:** Inter

### Tokens Tipográficos
```
--font-heading: 'Playfair Display', serif;
--font-body: 'Inter', sans-serif;

--text-h1: 48px;
--text-h2: 36px;
--text-h3: 24px;
--text-body: 16px;
--text-small: 14px;
```

### Weights
```
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
```

---

## 2.3. Espaçamento (8pt Grid)
```
--space-1: 8px;
--space-2: 16px;
--space-3: 24px;
--space-4: 32px;
--space-8: 64px;
```

---

## 2.4. Raio e Sombra
```
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;

--shadow-soft: 0px 8px 24px rgba(0,0,0,0.5);
```

---

# 3. Componentes (Atomic Design)

Todos os componentes seguem a paleta, espaçamento e tipografia acima.

---

# 3.1. Átomos

## Button
- `primary` = dourado com texto escuro
- `secondary` = fundo secundário + borda dourada
- Hover: brilho leve do dourado
- Radius: `var(--radius-md)`

## Input
- Fundo secundário
- Borda: `var(--color-border)`
- Em foco: `border-color: var(--color-accent-primary)`

## Tag
- Usada para status: ONLINE, BOOSTED, VERIFIED
- ONLINE usa rosa neon
- VERIFIED usa dourado suave

## Typography
- Títulos sempre **Playfair**
- Corpo **Inter**

---

# 3.2. Moléculas

## ProfileCard
- Foto principal (cover)
- Nome + cidade
- Tag "Boost" quando aplicável
- Hover: borda dourada sutil

## SearchBar
- Input + botão com ícone

## FileUpload
- Estado vazio
- Estado arrastando
- Estado carregando
- Estado erro

## InvitationCard
- Nome do estabelecimento
- Botões "Aceitar" / "Recusar"

---

# 3.3. Organismos

## TalentGrid
- Grid responsivo
- Usa `ProfileCard`

## ProfileHeader
- Foto principal, nome, tags e botão de contato

## EditProfileForm
- Seções colapsáveis
- Inputs + upload + salvar

---

# 3.4. Templates

## PublicLayout
- Header com logo, busca e login
- Footer escuro discreto

## DashboardLayout
- Sidebar fixa
- Conteúdo com cards escuros

---

# 4. Animações

## Padrões
- Curva: `cubic-bezier(0.4, 0, 0.2, 1)`
- Duração: 150–250ms

### Exemplos
- Hover em botões → fade de brilho
- Transição entre páginas → fade + slide leve
- Galeria → zoom suave no hover

---

# 5. Estados de Interface

## Sucesso
- Cor: var(--color-success)
- Usar banners discretos

## Erro
- Cor: var(--color-error)
- Inputs com borda vermelha

## Loading
- Skeletons padronizados
- Spinner circular pequeno

## Empty State
- Ilustração mínima
- Texto curto: "Nenhum resultado encontrado"

---

# 6. Convenções para IA
Para evitar divergências visuais geradas por agentes automatizados:

### 6.1. Sempre usar tokens
- Nada de hex direto no código.

### 6.2. Componentes devem ser puros
- Sem estilos inline
- Estilos via classes utilitárias ou styled-components (definir conforme tech choice)

### 6.3. Layout strict
- 8px grid obrigatório
- Padding acima de 16px mínimo

### 6.4. Documentar variáveis criadas
Qualquer novo componente deve listar ao menos:
- props
- estados
- variantes
- tokens usados

---

# 7. Conclusão
Este guia define **toda a base visual oficial da plataforma**, em formato altamente consumível por humanos e agentes de IA, garantindo que o sistema mantenha consistência em todos os ambientes.

