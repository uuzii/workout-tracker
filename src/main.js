import Chart from 'chart.js/auto'
import './style.css'

const GRUPO_COLORS = {
  Pecho: '#378ADD',
  Espalda: '#1D9E75',
  Pierna: '#7F77DD',
  Hombro: '#D85A30',
  Glúteo: '#D4537E',
  Bíceps: '#EF9F27',
  Tríceps: '#639922',
  Core: '#888780',
  Cardio: '#E24B4A',
  'Full Body': '#534AB7',
}
let data = JSON.parse(localStorage.getItem('wt_data_v2') || '[]')
let charts = {}

function save() {
  localStorage.setItem('wt_data_v2', JSON.stringify(data))
}
function today() {
  return new Date().toISOString().slice(0, 10)
}
function getEjercicios() {
  return [...new Set(data.map((d) => d.ejercicio))].sort()
}

document.getElementById('f-fecha').value = today()
document.getElementById('ses-fecha').value = today()

function switchTab(t) {
  ;['registro', 'sesion', 'historial', 'progreso', 'datos'].forEach((s, i) => {
    document.querySelectorAll('.tab')[i].classList.toggle('active', s === t)
    document.getElementById('sec-' + s).classList.toggle('active', s === t)
  })
  if (t === 'historial') renderHistorial()
  if (t === 'progreso') renderProgreso()
  if (t === 'sesion') renderSesion()
}

function guardar() {
  const fecha = document.getElementById('f-fecha').value
  const grupo = document.getElementById('f-grupo').value
  const ejercicio = document.getElementById('f-ejercicio').value.trim()
  if (!fecha || !grupo || !ejercicio) {
    alert('Fecha, grupo y ejercicio son obligatorios.')
    return
  }
  data.push({
    id: Date.now(),
    fecha,
    grupo,
    ejercicio,
    peso: document.getElementById('f-peso').value.trim() || '-',
    reps: document.getElementById('f-reps').value.trim() || '-',
    series: document.getElementById('f-series').value.trim() || '-',
    comentarios: document.getElementById('f-comentarios').value.trim(),
  })
  save()
  ;['f-ejercicio', 'f-peso', 'f-reps', 'f-series', 'f-comentarios'].forEach(
    (id) => (document.getElementById(id).value = ''),
  )
  const m = document.getElementById('msg-ok')
  m.style.display = 'block'
  setTimeout(() => (m.style.display = 'none'), 2000)
}

function renderSesion() {
  const fecha = document.getElementById('ses-fecha').value
  const rows = data.filter((d) => d.fecha === fecha)
  const el = document.getElementById('sesion-content')
  if (!rows.length) {
    el.innerHTML = `<div class="empty">Sin entrenamientos registrados para ${fecha}.</div>`
    return
  }
  const grupos = [...new Set(rows.map((r) => r.grupo))]
  const totalSeries = rows.reduce((a, r) => a + (parseInt(r.series) || 1), 0)
  const totalVol = rows
    .filter((r) => r.peso !== '-' && r.reps !== '-')
    .reduce(
      (a, r) =>
        a +
        (parseFloat(r.peso) || 0) * (parseInt(r.reps) || 0) * (parseInt(r.series) || 1),
      0,
    )
  el.innerHTML = `<div class="session-card">
    <div class="session-date">${fecha}</div>
    <div class="session-grupos">${grupos.map((g) => `<span class="badge" style="background:${(GRUPO_COLORS[g] || '#888')}22;color:${GRUPO_COLORS[g] || '#555'}">${g}</span>`).join('')}</div>
    <div style="margin-bottom:12px;font-size:13px;color:var(--text2)">${rows.length} ejercicios &nbsp;·&nbsp; ${totalSeries} series${totalVol > 0 ? ' &nbsp;·&nbsp; ' + Math.round(totalVol) + ' kg volumen' : ''}</div>
    <div class="table-wrap"><table>
      <thead><tr><th>Grupo</th><th>Ejercicio</th><th>Peso</th><th>Reps</th><th>Series</th><th>Comentarios</th></tr></thead>
      <tbody>${rows.map((r) => `<tr>
        <td><span class="badge" style="background:${(GRUPO_COLORS[r.grupo] || '#888')}22;color:${GRUPO_COLORS[r.grupo] || '#555'}">${r.grupo}</span></td>
        <td>${r.ejercicio}</td><td class="muted">${r.peso}</td><td class="muted">${r.reps}</td><td class="muted">${r.series}</td>
        <td class="muted" style="font-size:12px;max-width:160px">${r.comentarios || '-'}</td>
      </tr>`).join('')}</tbody>
    </table></div>
  </div>`
}

function renderHistorial() {
  const gf = document.getElementById('fil-grupo').value
  const ef = document.getElementById('fil-ejercicio').value
  const ejSel = document.getElementById('fil-ejercicio')
  ejSel.innerHTML =
    '<option value="">Todos los ejercicios</option>' +
    getEjercicios().map((e) => `<option${ef === e ? ' selected' : ''}>${e}</option>`).join('')
  ejSel.value = ef
  let rows = [...data].sort((a, b) => b.fecha.localeCompare(a.fecha))
  if (gf) rows = rows.filter((r) => r.grupo === gf)
  if (ef) rows = rows.filter((r) => r.ejercicio === ef)
  const tb = document.getElementById('tabla-historial')
  const empty = document.getElementById('empty-hist')
  if (!rows.length) {
    tb.innerHTML = ''
    empty.style.display = 'block'
    return
  }
  empty.style.display = 'none'
  tb.innerHTML = rows
    .map(
      (r) => `<tr>
    <td class="muted">${r.fecha}</td>
    <td><span class="badge" style="background:${(GRUPO_COLORS[r.grupo] || '#888')}22;color:${GRUPO_COLORS[r.grupo] || '#555'}">${r.grupo}</span></td>
    <td>${r.ejercicio}</td><td class="muted">${r.peso}</td><td class="muted">${r.reps}</td><td class="muted">${r.series}</td>
    <td class="muted" style="max-width:140px;font-size:12px">${r.comentarios || '-'}</td>
    <td><button type="button" class="btn-del" data-id="${r.id}">eliminar</button></td>
  </tr>`,
    )
    .join('')
}

function eliminar(id) {
  data = data.filter((d) => d.id !== id)
  save()
  renderHistorial()
}

function destroyChart(key) {
  if (charts[key]) {
    charts[key].destroy()
    charts[key] = null
  }
}

function renderProgreso() {
  const selEl = document.getElementById('prog-ejercicio')
  const ejercs = getEjercicios()
  const prev = selEl.value
  selEl.innerHTML =
    '<option value="">Seleccionar ejercicio para ver evolución...</option>' +
    ejercs.map((e) => `<option>${e}</option>`).join('')
  if (prev && ejercs.includes(prev)) selEl.value = prev
  const emptyEl = document.getElementById('empty-prog')
  if (!data.length) {
    document.getElementById('metrics-row').innerHTML = ''
    emptyEl.style.display = 'block'
    return
  }
  emptyEl.style.display = 'none'
  const totalSesiones = [...new Set(data.map((d) => d.fecha))].length
  const totalEj = [...new Set(data.map((d) => d.ejercicio))].length
  const grupos = [...new Set(data.map((d) => d.grupo))].length
  const maxPeso = Math.max(
    ...data.filter((d) => d.peso !== '-').map((d) => parseFloat(d.peso) || 0),
  )
  document.getElementById('metrics-row').innerHTML = `
    <div class="metric"><div class="metric-label">Sesiones</div><div class="metric-val">${totalSesiones}</div></div>
    <div class="metric"><div class="metric-label">Ejercicios distintos</div><div class="metric-val">${totalEj}</div></div>
    <div class="metric"><div class="metric-label">Grupos trabajados</div><div class="metric-val">${grupos}</div></div>
    <div class="metric"><div class="metric-label">Mayor peso (kg)</div><div class="metric-val">${maxPeso > 0 ? maxPeso : '-'}</div></div>`

  const ejSel = selEl.value
  destroyChart('peso')
  destroyChart('reps')
  if (ejSel) {
    const rows = data
      .filter((d) => d.ejercicio === ejSel)
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
    const labels = rows.map((d) => d.fecha)
    const pesos = rows.map((d) => (d.peso !== '-' ? parseFloat(d.peso) : null))
    const repsArr = rows.map((d) => (d.reps !== '-' ? parseInt(d.reps) : null))
    charts['peso'] = new Chart(document.getElementById('chart-peso'), {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Peso (kg)',
            data: pesos,
            borderColor: '#378ADD',
            backgroundColor: '#378ADD22',
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: '#378ADD',
            borderWidth: 2,
            fill: true,
            spanGaps: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: false, ticks: { callback: (v) => v + 'kg' } } },
      },
    })
    charts['reps'] = new Chart(document.getElementById('chart-reps'), {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Reps',
            data: repsArr,
            backgroundColor: '#7F77DD99',
            borderColor: '#7F77DD',
            borderWidth: 1.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } },
      },
    })
  }

  destroyChart('vol')
  const volPorGrupo = {}
  data.forEach((d) => {
    const s = parseInt(d.series) || 1,
      r = parseInt(d.reps) || 0,
      p = parseFloat(d.peso) || 0
    if (!volPorGrupo[d.grupo]) volPorGrupo[d.grupo] = 0
    volPorGrupo[d.grupo] += p > 0 ? s * r * p : s
  })
  const vLabels = Object.keys(volPorGrupo)
  const vData = vLabels.map((g) => Math.round(volPorGrupo[g]))
  const vColors = vLabels.map((g) => GRUPO_COLORS[g] || '#888')
  document.getElementById('legend-vol').innerHTML = vLabels
    .map(
      (g, i) =>
        `<span class="legend-item"><span class="legend-dot" style="background:${vColors[i]}"></span>${g}</span>`,
    )
    .join('')
  charts['vol'] = new Chart(document.getElementById('chart-volumen'), {
    type: 'bar',
    data: {
      labels: vLabels,
      datasets: [
        {
          data: vData,
          backgroundColor: vColors.map((c) => c + '99'),
          borderColor: vColors,
          borderWidth: 1.5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } },
    },
  })

  destroyChart('freq')
  const semanas = {}
  data.forEach((d) => {
    const dt = new Date(d.fecha + 'T12:00:00')
    const day = dt.getDay()
    const mon = new Date(dt)
    mon.setDate(dt.getDate() - (day === 0 ? 6 : day - 1))
    const key = mon.toISOString().slice(0, 10)
    if (!semanas[key]) semanas[key] = new Set()
    semanas[key].add(d.fecha)
  })
  const sKeys = Object.keys(semanas).sort()
  const sCounts = sKeys.map((k) => semanas[k].size)
  charts['freq'] = new Chart(document.getElementById('chart-freq'), {
    type: 'bar',
    data: {
      labels: sKeys,
      datasets: [
        {
          label: 'Días entrenados',
          data: sCounts,
          backgroundColor: '#1D9E7599',
          borderColor: '#1D9E75',
          borderWidth: 1.5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 }, max: 7 } },
    },
  })
}

function exportCSV() {
  const header = 'fecha,grupo,ejercicio,peso,reps,series,comentarios'
  const rows = data.map((d) =>
    [
      d.fecha,
      d.grupo,
      d.ejercicio,
      d.peso,
      d.reps,
      d.series,
      `"${(d.comentarios || '').replace(/"/g, '""')}"`,
    ].join(','),
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'entrenos_' + today() + '.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function importCSV(event) {
  const file = event.target.files[0]
  if (!file) return
  const input = event.target
  const reader = new FileReader()
  reader.onload = (e) => {
    const lines = e.target.result.split('\n').filter((l) => l.trim())
    if (!lines[0].toLowerCase().includes('fecha')) {
      showImportMsg('Formato no reconocido.', true)
      return
    }
    let imported = 0
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].match(/(".*?"|[^,]+)(?=,|$)/g) || lines[i].split(',')
      if (cols.length < 6) continue
      const clean = cols.map((c) => c.trim().replace(/^"|"$/g, '').replace(/""/g, '"'))
      data.push({
        id: Date.now() + i,
        fecha: clean[0],
        grupo: clean[1],
        ejercicio: clean[2],
        peso: clean[3] || '-',
        reps: clean[4] || '-',
        series: clean[5] || '-',
        comentarios: clean[6] || '',
      })
      imported++
    }
    save()
    showImportMsg(`${imported} registros importados correctamente.`, false)
    input.value = ''
  }
  reader.readAsText(file)
}

function showImportMsg(txt, err) {
  const m = document.getElementById('msg-import')
  m.textContent = txt
  m.style.color = err ? '#A32D2D' : '#0F6E56'
  m.style.display = 'block'
  setTimeout(() => (m.style.display = 'none'), 4000)
}

function borrarTodo() {
  if (!confirm('¿Borrar todos los datos? Esta acción no se puede deshacer.')) return
  data = []
  save()
  alert('Datos borrados.')
}

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab))
})

document.getElementById('btn-guardar').addEventListener('click', guardar)
document.getElementById('ses-fecha').addEventListener('change', renderSesion)
document.getElementById('btn-ses-hoy').addEventListener('click', () => {
  document.getElementById('ses-fecha').value = today()
  renderSesion()
})
document.getElementById('fil-grupo').addEventListener('change', renderHistorial)
document.getElementById('fil-ejercicio').addEventListener('change', renderHistorial)
document.getElementById('prog-ejercicio').addEventListener('change', renderProgreso)
document.getElementById('btn-export-csv').addEventListener('click', exportCSV)
const importInput = document.getElementById('import-input')
document.getElementById('btn-import-csv').addEventListener('click', () => importInput.click())
document.getElementById('import-area').addEventListener('click', () => importInput.click())
importInput.addEventListener('change', importCSV)
document.getElementById('btn-borrar-todo').addEventListener('click', borrarTodo)

document.getElementById('tabla-historial').addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-del')
  if (!btn) return
  eliminar(Number(btn.dataset.id))
})
