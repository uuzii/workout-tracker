import { LitElement, css, html } from 'lit'

function today() {
  return new Date().toISOString().slice(0, 10)
}

export class WorkoutForm extends LitElement {
  static properties = {
    fecha: { type: String, state: true },
    grupo: { type: String, state: true },
    ejercicio: { type: String, state: true },
    peso: { type: String, state: true },
    reps: { type: String, state: true },
    series: { type: String, state: true },
    comentarios: { type: String, state: true },
    showSuccess: { type: Boolean, state: true },
  }

  constructor() {
    super()
    this.fecha = today()
    this.grupo = ''
    this.ejercicio = ''
    this.peso = ''
    this.reps = ''
    this.series = ''
    this.comentarios = ''
    this.showSuccess = false
  }

  static styles = css`
    :host {
      display: block;
      --bg: #ffffff;
      --bg2: #f5f5f3;
      --text: #1a1a1a;
      --text2: #6b6b6b;
      --border: rgba(0, 0, 0, 0.12);
      --border2: rgba(0, 0, 0, 0.22);
      --radius: 8px;
      --radius-lg: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: var(--text);
    }

    @media (prefers-color-scheme: dark) {
      :host {
        --bg: #1e1e1e;
        --bg2: #2a2a2a;
        --text: #f0f0f0;
        --text2: #aaa;
        --border: rgba(255, 255, 255, 0.12);
        --border2: rgba(255, 255, 255, 0.22);
      }
    }

    .card {
      background: var(--bg);
      border: 0.5px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1rem 1.25rem;
      margin-bottom: 1rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 10px;
      margin-bottom: 10px;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .field label {
      font-size: 12px;
      color: var(--text2);
    }

    .field input,
    .field select,
    .field textarea {
      font-size: 13px;
      padding: 7px 10px;
      border: 0.5px solid var(--border2);
      border-radius: var(--radius);
      background: var(--bg);
      color: var(--text);
      font-family: inherit;
      outline: none;
    }

    .field input:focus,
    .field select:focus,
    .field textarea:focus {
      border-color: #378add;
    }

    .field textarea {
      height: 56px;
      resize: vertical;
    }

    .btn-primary {
      font-size: 13px;
      font-weight: 500;
      padding: 8px 18px;
      background: var(--text);
      color: var(--bg);
      border: none;
      border-radius: var(--radius);
      cursor: pointer;
    }

    .msg-ok {
      font-size: 13px;
      color: #0f6e56;
      margin-top: 8px;
      display: none;
    }

    .msg-ok.visible {
      display: block;
    }
  `

  setField(field, value) {
    this[field] = value
    this.requestUpdate()
  }

  handleSubmit(event) {
    event.preventDefault()
    if (!this.fecha || !this.grupo || !this.ejercicio.trim()) {
      alert('Fecha, grupo y ejercicio son obligatorios.')
      return
    }

    const payload = {
      fecha: this.fecha,
      grupo: this.grupo,
      ejercicio: this.ejercicio.trim(),
      peso: this.peso.trim() || '-',
      reps: this.reps.trim() || '-',
      series: this.series.trim() || '-',
      comentarios: this.comentarios.trim(),
    }

    this.dispatchEvent(
      new CustomEvent('ejercicio-guardado', {
        detail: payload,
        bubbles: true,
        composed: true,
      }),
    )

    this.setField('fecha', today())
    this.setField('grupo', '')
    this.setField('ejercicio', '')
    this.setField('peso', '')
    this.setField('reps', '')
    this.setField('series', '')
    this.setField('comentarios', '')
    this.setField('showSuccess', true)
    setTimeout(() => {
      this.setField('showSuccess', false)
    }, 2000)
  }

  render() {
    return html`
      <div class="card">
        <form @submit=${this.handleSubmit}>
          <div class="form-grid">
            <div class="field">
              <label>Fecha</label>
              <input
                type="date"
                .value=${this.fecha}
                @input=${(e) => this.setField('fecha', e.target.value)}
              />
            </div>
            <div class="field">
              <label>Grupo muscular</label>
              <select .value=${this.grupo} @change=${(e) => this.setField('grupo', e.target.value)}>
                <option value="">Seleccionar...</option>
                <option>Pecho</option>
                <option>Espalda</option>
                <option>Pierna</option>
                <option>Hombro</option>
                <option>Glúteo</option>
                <option>Bíceps</option>
                <option>Tríceps</option>
                <option>Core</option>
                <option>Cardio</option>
                <option>Full Body</option>
              </select>
            </div>
            <div class="field">
              <label>Ejercicio</label>
              <input
                type="text"
                placeholder="Ej. Press banca"
                .value=${this.ejercicio}
                @input=${(e) => this.setField('ejercicio', e.target.value)}
              />
            </div>
            <div class="field">
              <label>Peso (kg)</label>
              <input
                type="text"
                placeholder="-"
                .value=${this.peso}
                @input=${(e) => this.setField('peso', e.target.value)}
              />
            </div>
            <div class="field">
              <label>Reps</label>
              <input
                type="text"
                placeholder="-"
                .value=${this.reps}
                @input=${(e) => this.setField('reps', e.target.value)}
              />
            </div>
            <div class="field">
              <label>Series</label>
              <input
                type="text"
                placeholder="Ej. 3"
                .value=${this.series}
                @input=${(e) => this.setField('series', e.target.value)}
              />
            </div>
          </div>
          <div class="field" style="margin-bottom: 12px">
            <label>Comentarios / Sensaciones</label>
            <textarea
              placeholder="Ej. Buen rango de movimiento, leve fatiga en serie 3..."
              .value=${this.comentarios}
              @input=${(e) => this.setField('comentarios', e.target.value)}
            ></textarea>
          </div>
          <button class="btn-primary" type="submit">Guardar ejercicio</button>
          <p class="msg-ok ${this.showSuccess ? 'visible' : ''}">Guardado correctamente.</p>
        </form>
      </div>
    `
  }
}

customElements.define('workout-form', WorkoutForm)
