import { jsPDF } from 'jspdf'
import { formatCurrency } from './formatters'
import { formatDate } from '../utils/dates'

export function createInvoicePdf() {
  return new jsPDF({ unit: 'pt', format: 'a4' })
}

export function downloadInvoicePdf(invoice, profile) {
  const doc = createInvoicePdf()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 48
  let y = 56

  doc.setTextColor('#0f172a')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.text('INVOICE', margin, y)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(invoice.invoice_number, pageWidth - margin, y, { align: 'right' })
  y += 32

  doc.setDrawColor('#cbd5e1')
  doc.line(margin, y, pageWidth - margin, y)
  y += 32

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('From', margin, y)
  doc.text('Bill To', pageWidth / 2 + 24, y)
  y += 18

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  const companyLines = [
    profile?.company_name,
    profile?.contact_name,
    profile?.email,
    profile?.phone,
    profile?.address,
    profile?.website,
    profile?.tax_id ? `Tax ID: ${profile.tax_id}` : null,
  ].filter(Boolean)
  const customerLines = [
    invoice.customers?.name,
    invoice.customers?.company,
    invoice.customers?.email,
    invoice.customers?.billing_address,
  ].filter(Boolean)

  const blockY = y
  writeLines(doc, companyLines, margin, blockY, 14, 220)
  writeLines(doc, customerLines, pageWidth / 2 + 24, blockY, 14, 220)
  y += Math.max(companyLines.length, customerLines.length) * 14 + 34

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Invoice Details', margin, y)
  y += 18
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  writeLines(
    doc,
    [
      `Status: ${capitalize(invoice.status)}`,
      `Issue date: ${formatDate(invoice.issue_date)}`,
      `Due date: ${formatDate(invoice.due_date)}`,
      `Currency: ${invoice.currency}`,
    ],
    margin,
    y,
    14,
    pageWidth - margin * 2,
  )
  y += 78

  y = drawItemsTable(doc, invoice.invoice_items, y, margin, pageWidth - margin, invoice.currency)
  y += 24

  const summaryX = pageWidth - margin - 180
  y = drawSummary(doc, invoice, summaryX, y, invoice.currency)

  if (invoice.notes) {
    y += 32
    y = ensureSpace(doc, y, 90)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('Notes', margin, y)
    y += 16
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(doc.splitTextToSize(invoice.notes, pageWidth - margin * 2), margin, y)
  }

  if (profile?.invoice_footer) {
    y += 48
    y = ensureSpace(doc, y, 90)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('Payment details', margin, y)
    y += 16
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(doc.splitTextToSize(profile.invoice_footer, pageWidth - margin * 2), margin, y)
  }

  doc.save(`${invoice.invoice_number}.pdf`)
}

export function downloadReceiptPdf(invoice, payment, profile) {
  const doc = createInvoicePdf()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 48
  let y = 56

  doc.setTextColor('#0f172a')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.text('RECEIPT', margin, y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(payment.receipt_number, pageWidth - margin, y, { align: 'right' })
  y += 32

  doc.setDrawColor('#cbd5e1')
  doc.line(margin, y, pageWidth - margin, y)
  y += 32

  const businessName = profile?.company_name || profile?.contact_name || 'Billing'
  const customerName = invoice.customers?.name || 'Unknown client'
  const rows = [
    ['Receipt Number', payment.receipt_number],
    ['Invoice Number', invoice.invoice_number],
    ['Client Name', customerName],
    ['Business Name', businessName],
    ['Payment Date', formatDate(payment.paid_at)],
    ['Payment Method', payment.payment_method],
    ['Payment Reference', payment.payment_reference],
    ['Amount Paid', formatCurrency(payment.amount, payment.currency)],
    ['Currency', payment.currency],
    ['Description', payment.description || `Payment for invoice ${invoice.invoice_number}`],
  ]

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Payment Receipt', margin, y)
  y += 22

  rows.forEach(([label, value]) => {
    y = ensureSpace(doc, y, 42)
    y = writeReceiptRow(doc, label, value, margin, y, pageWidth - margin * 2)
  })

  y += 24
  y = ensureSpace(doc, y, 90)
  doc.setFillColor('#f8fafc')
  doc.rect(margin, y, pageWidth - margin * 2, 64, 'F')
  y += 24
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('Amount received', margin + 16, y)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(formatCurrency(payment.amount, payment.currency), pageWidth - margin - 16, y, {
    align: 'right',
  })
  y += 22
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('Thank you for your payment.', margin + 16, y)

  doc.save(`${payment.receipt_number}.pdf`)
}

function drawItemsTable(doc, items, y, left, right, currency) {
  const column = {
    description: left,
    quantity: right - 210,
    unitPrice: right - 140,
    total: right,
  }

  doc.setFillColor('#f8fafc')
  doc.rect(left, y - 14, right - left, 28, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Description', column.description, y)
  doc.text('Qty', column.quantity, y)
  doc.text('Unit price', column.unitPrice, y)
  doc.text('Total', column.total, y, { align: 'right' })
  y += 22

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)

  items.forEach((item) => {
    y = ensureSpace(doc, y, 36)
    doc.text(doc.splitTextToSize(item.description, 250), column.description, y)
    doc.text(String(Number(item.quantity)), column.quantity, y)
    doc.text(formatCurrency(item.unit_price, currency), column.unitPrice, y)
    doc.text(formatCurrency(item.line_total, currency), column.total, y, { align: 'right' })
    y += 28
  })

  doc.setDrawColor('#cbd5e1')
  doc.line(left, y, right, y)

  return y
}

function drawSummary(doc, invoice, x, y, currency) {
  const rows = [
    ['Subtotal', formatCurrency(invoice.subtotal, currency)],
    ['Tax', formatCurrency(invoice.tax_amount, currency)],
    ['Discount', formatCurrency(-invoice.discount, currency)],
    ['Total', formatCurrency(invoice.total, currency)],
  ]

  rows.forEach(([label, value], index) => {
    const isTotal = index === rows.length - 1
    if (isTotal) {
      y += 8
      doc.setDrawColor('#cbd5e1')
      doc.line(x, y, x + 180, y)
      y += 18
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
    } else {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
    }

    doc.text(label, x, y)
    doc.text(value, x + 180, y, { align: 'right' })
    y += 18
  })

  return y
}

function writeLines(doc, lines, x, y, lineHeight, width) {
  lines.forEach((line) => {
    const wrappedLines = doc.splitTextToSize(line, width)
    doc.text(wrappedLines, x, y)
    y += wrappedLines.length * lineHeight
  })
}

function writeReceiptRow(doc, label, value, x, y, width) {
  const labelWidth = 150
  const valueX = x + labelWidth
  const wrappedValue = doc.splitTextToSize(String(value || 'Not provided'), width - labelWidth)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text(label, x, y)
  doc.setFont('helvetica', 'normal')
  doc.text(wrappedValue, valueX, y)

  return y + Math.max(wrappedValue.length * 16, 24)
}

function ensureSpace(doc, y, requiredSpace) {
  const pageHeight = doc.internal.pageSize.getHeight()

  if (y + requiredSpace > pageHeight - 48) {
    doc.addPage()
    return 56
  }

  return y
}

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : ''
}

