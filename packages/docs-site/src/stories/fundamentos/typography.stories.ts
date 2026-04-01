import type { Meta, StoryObj } from '@storybook/html';

/** Historia de la escala tipográfica del sistema */
const meta = {
  title: 'Tokens/Tipografía',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Escala de headings y cuerpo */
export const EscalaTipografica: Story = {
  render: () => `
    <div style="max-width: 700px; padding: 1rem">
      <h5 style="margin-bottom: 1.5rem; color: var(--bs-secondary-color)">Headings</h5>
      <h1>H1 — Título principal</h1>
      <h2>H2 — Título de sección</h2>
      <h3>H3 — Subtítulo</h3>
      <h4>H4 — Encabezado de módulo</h4>
      <h5>H5 — Encabezado de card</h5>
      <h6>H6 — Encabezado auxiliar</h6>
      <hr />
      <h5 style="margin-bottom: 1.5rem; color: var(--bs-secondary-color)">Cuerpo</h5>
      <p class="lead">Lead — Introducción o descripción principal. Texto de mayor jerarquía para párrafos introductorios.</p>
      <p>Body — Texto base del sistema. Usado en párrafos, descripciones y contenido general de la interfaz.</p>
      <p><small>Small — Texto auxiliar, meta-información, timestamps, captions.</small></p>
      <p><code>Code — Fragmentos de código, valores técnicos, identificadores.</code></p>
    </div>
  `,
};

/** Pesos tipográficos disponibles */
export const PesosYEstilos: Story = {
  name: 'Pesos y estilos',
  render: () => `
    <div style="max-width: 600px; padding: 1rem">
      <h5 style="margin-bottom: 1.5rem; color: var(--bs-secondary-color)">Pesos</h5>
      <p class="fw-bold">fw-bold — 700 — Énfasis fuerte, labels críticos</p>
      <p class="fw-semibold">fw-semibold — 600 — Encabezados de tabla, títulos de card</p>
      <p class="fw-normal">fw-normal — 400 — Texto base (default)</p>
      <p class="fw-light">fw-light — 300 — Texto auxiliar, marcas de agua</p>
    </div>
  `,
};
