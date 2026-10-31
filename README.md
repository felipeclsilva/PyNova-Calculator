# 🍊 PyNova Calculator

> Calculadora multifuncional, moderna e responsiva com execução de código Python (WASM), suporte a atalhos de teclado e tema claro/escuro com paleta em laranja pastel.

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-Pyodide_WASM-f97316.svg)](https://pyodide.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Principais Recursos

### 1. 🧮 Calculadora Padrão
- Operações aritméticas essenciais: adição, subtração, multiplicação e divisão.
- Cálculos rápidos de porcentagem (`%`), inverso (`1/x`), quadrado (`x²`) e raiz quadrada (`√x`).
- Troca de sinal (`±`) e gerenciamento de memória (`MC`, `MR`, `M+`, `M-`, `MS`).
- Histórico completo de cálculos com cópia e restauração de resultados.

### 2. 🔬 Calculadora Científica
- **Trigonometria**: `sin`, `cos`, `tan`, `asin`, `acos`, `atan` e versões hiperbólicas (`sinh`, `cosh`, `tanh`).
- Alternador de unidades angulares entre **Graus (DEG)** e **Radianos (RAD)**.
- **Logaritmos e Exponenciais**: `ln`, `log₁₀`, `log₂`, `eˣ`, `10ˣ`, `xʸ`, `x³`, `³√x`.
- Constantes matemáticas fundamentais ($\pi$ e $e$), fatorial ($n!$), valor absoluto ($|x|$) e parênteses encadeados.

### 3. 📈 Representação Gráfica (Plotter de Funções)
- Visualização em tempo real de funções matemáticas através de HTML5 Canvas em alta resolução (60 FPS).
- Suporte a múltiplas curvas simultâneas ($f(x)$ em laranja pastel e $g(x)$ em azul ciano).
- Navegação interativa: Zoom in/out, arrasto do plano cartesiano (Pan) e botão para redefinir origem em $(0, 0)$.
- Inspeção de coordenadas com mira e coordenadas flutuantes ao passar o mouse.
- Exemplos rápidos prontos (`sin(x)`, `x² - 4`, `2ˣ`, `e^(-x²)`, `1/x`) e tabela de valores notáveis.

### 4. 💻 Modo Programador
- Conversão instantânea e sincronizada entre **HEX** (Hexadecimal), **DEC** (Decimal), **OCT** (Octal) e **BIN** (Binário).
- Larguras de palavra selecionáveis: **QWORD** (64 bits), **DWORD** (32 bits), **WORD** (16 bits) e **BYTE** (8 bits).
- **Matriz de Bits Interativa**: Visualização de 64 bits separados em nibbles com alternância individual ao clicar ($0 \leftrightarrow 1$).
- Operadores lógicos e de deslocamento: `AND`, `OR`, `XOR`, `NOT`, `NAND`, `NOR`, `XNOR`, `<<`, `>>`, `RoL` e `RoR`.
- Representação de caracteres em **ASCII**.

### 5. 📅 Cálculo de Data
- **Diferença entre datas**: Cálculo de dias corridos, semanas, anos/meses/dias e **dias úteis de trabalho** (excluindo fins de semana).
- **Adicionar ou subtrair tempo**: Projeção de prazos com anos, meses e dias a partir de uma data inicial com dia da semana formatado.
- **Contagem Regressiva**: Dias restantes para datas comemorativas e eventos.

### 6. 🐍 Console e Editor Python (WASM)
- Caixa de código com numeração de linhas e código de exemplo esmaecido como placeholder.
- Execução client-side via **Pyodide** (WebAssembly) sem necessidade de servidor externo, com suporte a `math`, loops, funções e imports.
- Integração bidirecional: use o valor da calculadora como variável `ans` ou `x` no script e envie o resultado do código de volta para o visor com 1 clique.
- Atalho `Ctrl + Enter` para execução imediata e presets prontos (Juros Compostos, Bhaskara, Fibonacci e Estatística).

---

## ⌨️ Atalhos de Teclado

| Tecla | Função |
| :--- | :--- |
| `0` a `9` | Digitação numérica |
| `.` ou `,` | Ponto decimal |
| `+`, `-`, `*`, `/` | Operações básicas |
| `Enter` ou `=` | Calcular resultado |
| `Backspace` | Apagar último dígito |
| `Esc` ou `C` | Limpar visor |
| `%` | Porcentagem |
| `^` | Potenciação |
| `(` e `)` | Parênteses |
| `A` a `F` | Dígitos hexadecimais (Modo Programador em HEX) |
| `Ctrl + Enter` | Executar código Python no editor |

---

## 🎨 Design & Temas

- **Paleta Pastel Orange**: Baseada em tons quentes e suaves (`#F97316`, `#FB923C`, `#FFB085`).
- **Suporte a Tema Claro e Escuro**: Alternância instantânea com persistência de preferências no `localStorage`.
- **Tipografia**: Outfit para títulos e botões limpos, e JetBrains Mono para números tabulares e código.
- **Responsividade Total**: Otimizado para telas de smartphones, tablets e desktops em modo split lateral.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior
- Gerenciador de pacotes `npm` ou `yarn`

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/pycalc-pastel.git
cd pycalc-pastel
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse no navegador:
```
http://localhost:3000
```

### Compilar para Produção
```bash
npm run build
```

---

## 🛠️ Tecnologias Utilizadas

- **Framework**: [React 19](https://react.dev/)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Ambiente Python**: [Pyodide](https://pyodide.org/) (Python 3.12 WebAssembly)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)

---

## 📄 Licença

Distribuído sob a licença MIT. Consulte `LICENSE` para mais detalhes.
