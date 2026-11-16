import { useMemo, useState } from 'react'
import { useApp } from '../store.jsx'
import { WEEK } from '../data/mock.js'
import { PageHead } from '../components/ui.jsx'
import { useStatRows } from './Stats.jsx'

const COL_LETTERS = 'ABCDEFGHIJ'

async function downloadXlsx(report) {
  const ExcelJS = (await import('exceljs')).default
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet(report.sheet)
  const n = report.head.length
  ws.mergeCells(1, 1, 1, n)
  ws.getCell('A1').value = report.title
  ws.getCell('A1').font = { bold: true, size: 15, color: { argb: 'FF0F5C57' } }
  ws.getCell('A1').alignment = { horizontal: 'center' }
  ws.mergeCells(2, 1, 2, n)
  ws.getCell('A2').value = report.meta
  ws.getCell('A2').alignment = { horizontal: 'center' }
  ws.getCell('A2').font = { italic: true, color: { argb: 'FF566763' } }
  const header = ws.addRow(report.head)
  header.eachCell((c) => {
    c.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F5C57' } }
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    c.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
  })
  report.rows.forEach((r) => ws.addRow(r))
  if (report.total) {
    const t = ws.addRow(report.total)
    t.font = { bold: true }
    t.eachCell((c) => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFBEFCF' } } })
  }
  ws.eachRow((row, i) => {
    if (i < 3) return
    row.eachCell((c, col) => {
      c.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
      if (i > 3 && col > 3) c.alignment = { horizontal: 'right' }
    })
  })
  ws.columns = report.head.map((h, i) => ({ width: i === 1 ? 26 : i === 2 ? 20 : 15 }))
  const buf = await wb.xlsx.writeBuffer()
  const url = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
  const a = document.createElement('a')
  a.href = url; a.download = report.file; a.click()
  URL.revokeObjectURL(url)
}

export default function Reports() {
  const { me, okrs, redeems, departments, userById, notify } = useApp()
  const { people, points } = useStatRows()
  const [type, setType] = useState('okr')
  const [format, setFormat] = useState('excel')
  const [dep, setDep] = useState(me.role === 'manager' ? String(me.department_id) : 'all')

  const deptName = (id) => departments.find((d) => d.id === id)?.name ?? ''
  const inScope = (p) => (me.role === 'staff' ? p.id === me.id : dep === 'all' || String(p.department_id) === dep)
  const scopeLabel = me.role === 'staff' ? 'Cá nhân' : dep === 'all' ? 'Toàn công ty' : deptName(Number(dep))
  const period = `Tuần ${WEEK.number} (${WEEK.from} – ${WEEK.to}/${WEEK.year})`

  const report = useMemo(() => {
    if (type === 'okr') {
      const rows = people.filter(inScope).map((p, i) => {
        const mine = okrs.filter((o) => o.owner === p.id)
        const krs = mine.reduce((s, o) => s + o.krs.length, 0)
        return [i + 1, p.name, deptName(p.department_id), p.count, krs, p.pct]
      })
      const avg = rows.length ? Math.round(rows.reduce((s, r) => s + r[5], 0) / rows.length) : 0
      return {
        key: 'okr', sheet: 'Báo cáo OKR', file: `bao-cao-okr-tuan-${WEEK.number}.xlsx`,
        title: `BÁO CÁO OKRs TUẦN ${WEEK.number}`, meta: `${period} · ${scopeLabel}`,
        head: ['STT', 'Nhân sự', 'Phòng ban', 'Số OKR', 'Số KR', 'Tiến độ (%)'],
        rows, total: ['', 'Tổng / trung bình', '', rows.reduce((s, r) => s + r[3], 0), rows.reduce((s, r) => s + r[4], 0), avg],
        note: 'Tiến độ tính trung bình trên các OKR đã được duyệt của từng nhân sự.',
      }
    }
    const rows = points.filter(inScope).map((p, i) => {
      const used = redeems.filter((r) => r.user_id === p.id).reduce((s, r) => s + r.points, 0)
      return [i + 1, p.name, deptName(p.department_id), p.review, p.fb, p.rc, used, p.total]
    })
    const sum = (k) => rows.reduce((s, r) => s + r[k], 0)
    return {
      key: 'points', sheet: 'Báo cáo điểm', file: `bao-cao-diem-tuan-${WEEK.number}.xlsx`,
      title: `BÁO CÁO ĐIỂM NGƯỜI DÙNG TUẦN ${WEEK.number}`, meta: `${period} · ${scopeLabel}`,
      head: ['STT', 'Nhân sự', 'Phòng ban', 'Điểm review', 'Điểm feedback', 'Điểm ghi nhận', 'Đã đổi quà', 'Điểm hiện có'],
      rows, total: ['', 'Tổng cộng', '', sum(3), sum(4), sum(5), sum(6), sum(7)],
      note: 'Điểm hiện có là điểm đã tích lũy sau khi trừ các lần đổi quà ở Store.',
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, dep, people, points, okrs, redeems, me])

  const exportExcel = async () => {
    await downloadXlsx(report)
    notify('Đã tải file Excel báo cáo')
  }

  return (
    <>
      <PageHead banner="mint" art="chart" title="Báo cáo" desc="Xem trước mẫu báo cáo rồi xuất ra Excel hoặc PDF để lưu trữ và phân tích." />

      <div className="filters no-print">
        <div className="seg" role="group" aria-label="Loại báo cáo">
          <button aria-pressed={type === 'okr'} onClick={() => setType('okr')}>Báo cáo OKRs</button>
          <button aria-pressed={type === 'points'} onClick={() => setType('points')}>Báo cáo điểm</button>
        </div>
        <div className="seg" role="group" aria-label="Định dạng">
          <button aria-pressed={format === 'excel'} onClick={() => setFormat('excel')}>Mẫu Excel</button>
          <button aria-pressed={format === 'pdf'} onClick={() => setFormat('pdf')}>Mẫu PDF</button>
        </div>
        {me.role === 'director' && (
          <select value={dep} onChange={(e) => setDep(e.target.value)} aria-label="Phòng ban">
            <option value="all">Toàn công ty</option>
            {departments.filter((d) => d.id !== 1).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        )}
        <span style={{ flex: 1 }} />
        {format === 'excel'
          ? <button className="btn primary" onClick={exportExcel}>Tải file Excel (.xlsx)</button>
          : <button className="btn primary" onClick={() => window.print()}>In hoặc lưu PDF</button>}
      </div>

      {format === 'excel' ? (
        <section className="xl no-print" aria-label="Xem trước mẫu Excel">
          <div className="xl-bar"><span className="xl-fx">fx</span><span>{report.title}</span></div>
          <div className="xl-scroll">
            <table className="xl-grid">
              <thead>
                <tr><th className="xl-corner" />{report.head.map((_, i) => <th key={i} className="xl-col">{COL_LETTERS[i]}</th>)}</tr>
              </thead>
              <tbody>
                <tr><th className="xl-row">1</th><td colSpan={report.head.length} className="xl-title">{report.title}</td></tr>
                <tr><th className="xl-row">2</th><td colSpan={report.head.length} className="xl-meta">{report.meta}</td></tr>
                <tr><th className="xl-row">3</th>{report.head.map((h) => <td key={h} className="xl-head">{h}</td>)}</tr>
                {report.rows.map((r, i) => (
                  <tr key={i}><th className="xl-row">{i + 4}</th>{r.map((c, j) => <td key={j} className={j > 2 ? 'xl-num' : ''}>{c}</td>)}</tr>
                ))}
                <tr className="xl-total"><th className="xl-row">{report.rows.length + 4}</th>{report.total.map((c, j) => <td key={j} className={j > 2 ? 'xl-num' : ''}>{c}</td>)}</tr>
              </tbody>
            </table>
          </div>
          <div className="xl-tabs"><span className="xl-tab">{report.sheet}</span></div>
        </section>
      ) : null}

      {/* Mẫu PDF: luôn có trong DOM để in; chỉ hiển thị khi chọn mẫu PDF hoặc khi in */}
      <section className={`pdf-wrap ${format === 'pdf' ? '' : 'pdf-hidden'}`} aria-label="Xem trước mẫu PDF">
        <article className="pdf-sheet">
          <header className="pdf-head">
            <div className="pdf-brand"><span className="brand-mark">O</span><div><b>OKR VHV</b><div>Công ty CP Truyền thông Văn Hoá Việt</div></div></div>
            <div className="pdf-code">Mẫu BC-{report.key === 'okr' ? 'OKR' : 'DIEM'}-01<br />Ngày lập: 16/11/2026</div>
          </header>
          <h2 className="pdf-title">{report.title}</h2>
          <p className="pdf-meta">{report.meta}</p>
          <table className="pdf-table">
            <thead><tr>{report.head.map((h, i) => <th key={h} className={i > 2 ? 'num' : ''}>{h}</th>)}</tr></thead>
            <tbody>
              {report.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className={j > 2 ? 'num' : ''}>{c}</td>)}</tr>)}
              <tr className="pdf-total">{report.total.map((c, j) => <td key={j} className={j > 2 ? 'num' : ''}>{c}</td>)}</tr>
            </tbody>
          </table>
          <p className="pdf-note">Ghi chú: {report.note}</p>
          <footer className="pdf-sign">
            <div>Người lập báo cáo<br /><i>(Ký, ghi rõ họ tên)</i><br /><br /><br />{me.fullname}</div>
            <div>Giám đốc phê duyệt<br /><i>(Ký, ghi rõ họ tên)</i><br /><br /><br />{userById(1)?.fullname}</div>
          </footer>
        </article>
      </section>
    </>
  )
}
