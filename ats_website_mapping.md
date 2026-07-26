# Mapeamento do Website Oficial — ATS Sistemas de Automações

Este documento apresenta o mapeamento completo e a análise técnica dos arquivos do Website Oficial da **ATS Sistemas de Automações** localizado no diretório:
`c:\Users\Mano\Documents\trae_projects\Agente IA Cloudfy\Website_Oficial\`

A estrutura foi totalmente mapeada de forma passiva, **sem qualquer modificação no código**, preparando o site para integrar a apresentação e conversão do SaaS **Reencontra**.

---

## 1. 📂 Arquivos Encontrados (Site Institucional ATS)

Todos os arquivos que compõem o website oficial estão listados abaixo:

* **Entrypoint do App:**
  * [src/App.tsx](file:///c:/Users/Mano/Documents/trae_projects/Agente%20IA%20Cloudfy/Website_Oficial/src/App.tsx) — Carrega a estrutura de seções da landing page e renderiza a página única.
  * [src/pages/Home.tsx](file:///c:/Users/Mano/Documents/trae_projects/Agente%20IA%20Cloudfy/Website_Oficial/src/pages/Home.tsx) — Entrypoint de roteamento de página (atualmente vazio/div sem conteúdo, pois o site usa `App.tsx` como componente principal).

* **Componentes de Seções (Apresentação & Marketing):**
  * [src/components/Header.tsx](file:///c:/Users/Mano/Documents/trae_projects/Agente%20IA%20Cloudfy/Website_Oficial/src/components/Header.tsx) — Navbar fixa, logo corporativo com ícone de CPU e atalho de conversão "Fale Conosco".
  * [src/components/HeroSection.tsx](file:///c:/Users/Mano/Documents/trae_projects/Agente%20IA%20Cloudfy/Website_Oficial/src/components/HeroSection.tsx) — Destaque visual da marca "ATS Sistemas de Automações" com slogans neon e botões primários.
  * [src/components/ServicesSection.tsx](file:///c:/Users/Mano/Documents/trae_projects/Agente%20IA%20Cloudfy/Website_Oficial/src/components/ServicesSection.tsx) — Grade contendo as 6 soluções principais da empresa (Apps, AI Customer Service, RPA, Android Nativo, Analytics, Vendas).
  * [src/components/AppsDevSection.tsx](file:///c:/Users/Mano/Documents/trae_projects/Agente%20IA%20Cloudfy/Website_Oficial/src/components/AppsDevSection.tsx) — Apresentação do aplicativo em desenvolvimento "Coffee Break" (Marketplace de comida 24h) com mockup 3D de smartphone.
  * [src/components/CaseStudiesSection.tsx](file:///c:/Users/Mano/Documents/trae_projects/Agente%20IA%20Cloudfy/Website_Oficial/src/components/CaseStudiesSection.tsx) — Depoimentos e dados numéricos obtidos em e-commerce, clínicas médicas e logística.
  * [src/components/AboutSection.tsx](file:///c:/Users/Mano/Documents/trae_projects/Agente%20IA%20Cloudfy/Website_Oficial/src/components/AboutSection.tsx) — Texto institucional detalhando o DNA "IA-First & Mobile-Native" da ATS Sistemas.
  * [src/components/ContactSection.tsx](file:///c:/Users/Mano/Documents/trae_projects/Agente%20IA%20Cloudfy/Website_Oficial/src/components/ContactSection.tsx) — Formulário de captura de leads integrado ao FormSubmit.co para envio das mensagens dos clientes.
  * [src/components/Footer.tsx](file:///c:/Users/Mano/Documents/trae_projects/Agente%20IA%20Cloudfy/Website_Oficial/src/components/Footer.tsx) — Rodapé contendo email de contato corporativo (`contato@atssistemas.ia.br`), CNPJ da empresa (`65.402.484/0001-40`), endereço e links de privacidade.

* **Documentos e Configurações de Arquitetura:**
  * [.trae/documents/prd-ats-sistemas-automacao.md](file:///c:/Users/Mano/Documents/trae_projects/Agente%20IA%20Cloudfy/Website_Oficial/.trae/documents/prd-ats-sistemas-automacao.md) — PRD do site detalhando o design neon, cores e regras de negócio.
  * [.trae/documents/technical-architecture-ats-website.md](file:///c:/Users/Mano/Documents/trae_projects/Agente%20IA%20Cloudfy/Website_Oficial/.trae/documents/technical-architecture-ats-website.md) — Arquitetura de software definindo o uso de React + Tailwind CSS + Vite.

---

## 2. 🌳 Estrutura de Páginas (Árvore de Componentes)

```text
pág / (Home / Landing Page Única) [App.tsx]
 │
 ├── 🧭 Cabeçalho [Header.tsx]
 │    ├── Logo: ATS Automações (Cpu Icon)
 │    ├── Links de Roteamento Ancorado (#home, #services, #apps, #about, #contact)
 │    └── Botão "Fale Conosco" (CTA ➔ #contact)
 │
 ├── 🚀 Seção Hero [HeroSection.tsx]
 │    ├── Título: "ATS Sistemas de Automações" com efeitos glow
 │    ├── Slogan: "Agentes de IA & Apps Inovadores para o seu Negócio"
 │    └── CTAs: "Nossas Soluções" (➔ #services) | "Entre em Contato" (➔ #contact)
 │
 ├── ⚙️ Seção de Soluções [ServicesSection.tsx] (Card grid com ícones lucide)
 │
 ├── 📱 Aplicativos Mobile [AppsDevSection.tsx]
 │    ├── Mockup de iPhone com a tela e interface do app "Coffee Break"
 │    └── Detalhes do aplicativo & Botão "Saiba Mais"
 │
 ├── 📊 Casos de Sucesso [CaseStudiesSection.tsx] (E-commerce, Clínica Médica e Distribuidora)
 │
 ├── 🏢 Sobre a Empresa [AboutSection.tsx] (Descrição institucional "IA-First & Mobile-Native")
 │
 ├── 📩 Seção de Contato [ContactSection.tsx]
 │    ├── Endereço (Espumoso, RS) & E-mail (contato@atssistemas.ia.br)
 │    └── Formulário de lead B2B (Integrado ao FormSubmit.co para receber envios via AJAX)
 │
 └── 📄 Rodapé [Footer.tsx] (Copyright, CNPJ, Links legais e redes sociais)
```

---

## 3. 📝 Identificação de Pontos para Edição

Para transformar o site oficial da ATS Sistemas na **vitrine do SaaS Reencontra**, os seguintes locais de alteração foram identificados:

* **Textos Institucionais:**
  * Os textos e strings do site **não utilizam arquivos i18n JSON** de tradução (ao contrário do SaaS Reencontra). Eles estão **hardcoded** diretamente em português dentro de cada componente `.tsx` em `src/components/`.
  * *Onde editar:* Para alterar qualquer frase institucional ou slogan, as edições devem ser feitas nos respectivos componentes (ex: [HeroSection.tsx](file:///c:/Users/Mano/Documents/trae_projects/Agente%20IA%20Cloudfy/Website_Oficial/src/components/HeroSection.tsx), [AboutSection.tsx](file:///c:/Users/Mano/Documents/trae_projects/Agente%20IA%20Cloudfy/Website_Oficial/src/components/AboutSection.tsx)).

* **Apresentação do SaaS Reencontra:**
  * Atualmente, o site apresenta a ATS de forma genérica focando em "Agentes de IA" e "Desenvolvimento Mobile". O app de destaque é o *Coffee Break*.
  * *Onde editar:* Para apresentar o Reencontra como produto chefe:
    1. A seção [ServicesSection.tsx](file:///c:/Users/Mano/Documents/trae_projects/Agente%20IA%20Cloudfy/Website_Oficial/src/components/ServicesSection.tsx) pode conter um card específico para o Reencontra (ex: "Proteção Familiar QR Code").
    2. O componente [AppsDevSection.tsx](file:///c:/Users/Mano/Documents/trae_projects/Agente%20IA%20Cloudfy/Website_Oficial/src/components/AppsDevSection.tsx) (que hoje foca no Coffee Break) pode ser adaptado para exibir a interface móvel do Reencontra, incluindo o leitor de QR Code ou o dashboard de acompanhamento de localização.

* **Botões de Conversão (CTAs):**
  * Todos os botões primários direcionam o usuário para a âncora `#contact` (Fale Conosco).
  * *Onde editar:* Para converter leads diretamente para o SaaS:
    1. Os botões de ação na [Header.tsx](file:///c:/Users/Mano/Documents/trae_projects/Agente%20IA%20Cloudfy/Website_Oficial/src/components/Header.tsx) e [HeroSection.tsx](file:///c:/Users/Mano/Documents/trae_projects/Agente%20IA%20Cloudfy/Website_Oficial/src/components/HeroSection.tsx) podem ser atualizados para links diretos externos apontando para a vitrine de planos do Reencontra (`https://reencontra.atssistemas.ia.br/#planos`).

---

## 4. 💡 Sugestão de Organização Ideal

Dado que o site oficial da ATS Sistemas está limpo e bem-estruturado sob a arquitetura clássica do Vite + Tailwind, a transição para vitrine do Reencontra pode ser feita de duas formas:

1. **Abordagem de Destaque Único (Vitrine de Produto Único):**
   * Substituir o destaque do aplicativo *Coffee Break* no componente `AppsDevSection.tsx` pelo **SaaS Reencontra**. O mockup de smartphone seria alterado para mostrar o painel familiar do Reencontra com o leitor biométrico, e o texto apresentaria as principais funcionalidades do sistema.
   * Adicionar atalhos/CTAs proeminentes "Conhecer Reencontra" ou "Proteger Família" apontando para o subdomínio `https://reencontra.atssistemas.ia.br`.

2. **Abordagem Portfólio (ATS como Provedora):**
   * Manter a descrição da ATS Sistemas como empresa de tecnologia avançada, mas criar uma nova seção dedicada em `src/components/` (ex: `ReencontraFeatured.tsx`) para introduzir o Reencontra como "O principal SaaS de Proteção Familiar inteligente lançado pela ATS Sistemas".
   * Essa seção conteria links diretos de redirecionamento e conversão para o produto.
