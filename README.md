# Editor 2D de Chapas

SPA desenvolvida em React + TypeScript para gerenciar chapas e alocar peças 2D com drag-and-drop, simulação de colisão e suporte completo a i18n (PT, EN, ES, FR, DE).

## Principais recursos

- Gestão de chapas: seleção de mock inicial, criação de novas chapas e visualização em escala com grid responsivo.
- Gestão de peças: cadastro manual, upload de CSV (ou mock), controle automático de quantidade restante e cores únicas por peça.
- Editor interativo: arraste uma peça para a chapa, respeitando limites, decremento de estoque e bloqueio de colisões com feedback visual.
- Seleção de peças alocadas para inspecionar dimensões e coordenadas.
- Internacionalização com react-i18next e seletor de idioma persistente nas 5 línguas exigidas.

## Decisões técnicas

- **Stack:** Vite + React + TypeScript para rapidez no dev/build e tipagem rigorosa.
- **Estado:** Mantido no componente `App.tsx`, suficiente para o escopo da SPA. Os dados mockados simulam requisições via `services/mockApi.ts`.
- **Lógica de colisão:** Conversão das posições para unidades reais da chapa; cada nova peça é validada com `rectanglesOverlap` antes da alocação.
- **Escala e grid:** A chapa é desenhada proporcionalmente ao maior lado (máx. 720x480 px), garantindo que as peças ocupem o espaço correto independentemente do tamanho real.
- **Drag-and-drop:** Implementado com HTML5 nativo (sem dependências extras). O `dataTransfer` leva apenas o ID da peça e o editor calcula a posição relativa no drop.
- **Internacionalização:** Configurada em `src/i18n.ts` com arquivos tipados; todas as strings de UI são traduzidas.

## Como executar

### Pré-requisitos

- Node.js >= 18
- npm >= 10

### Passos

```bash
npm install
npm run dev
```

Abra http://localhost:5173.

### Build de produção

```bash
npm run build
npm run preview
```

## Uso da interface

1. **Selecione uma chapa** (ou crie uma nova) no painel esquerdo.
2. **Cadastre peças** manualmente ou use o upload CSV (há um botão para carregar o mock `Porta_A`, `Base`, `Divisoria`).
3. **Arraste uma peça** da lista para a área da chapa:
   - Se faltar espaço ou houver colisão, o contorno ficará vermelho e a ação será rejeitada.
   - Se a alocação for válida, a quantidade da peça é decrementada e o item aparece no plano.
4. **Clique em uma peça** dentro da chapa para ver detalhes (nome, dimensões, coordenadas).
5. **Mude o idioma** pelo seletor no canto superior direito; todos os textos do app mudam imediatamente.

## Estrutura principal

- `src/components/` – componentes de UI (PlateManager, PiecesPanel, BoardEditor, LanguageSelector).
- `src/services/mockApi.ts` – simula as chamadas de backend.
- `src/utils/geometry.ts` – detecção de colisão entre retângulos.
- `src/i18n.ts` – configuração de idiomas e textos.
