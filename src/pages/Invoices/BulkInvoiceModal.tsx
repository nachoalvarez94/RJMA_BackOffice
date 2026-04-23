import { useState } from 'react'
import {
  Modal, Button, Result, Table, Alert, Typography, Space, Statistic, Row, Col,
} from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, ThunderboltOutlined } from '@ant-design/icons'
import type { BulkInvoiceResult, Invoice } from '@/types'
import { invoicesService } from '@/services/api/invoices'
import { getErrorMessage } from '@/lib/apiError'
import { formatCurrency, formatDate } from '@/lib/format'

const { Text } = Typography

const generadasColumns = [
  { title: 'Nº Factura', dataIndex: 'numeroFactura', key: 'numeroFactura' },
  { title: 'Cliente', dataIndex: 'nombreCliente', key: 'nombreCliente', render: (v: string) => v?.trim() || '—' },
  { title: 'Total', dataIndex: 'total', key: 'total', render: (v: number) => formatCurrency(v) },
  { title: 'Fecha emisión', dataIndex: 'fechaEmision', key: 'fechaEmision', render: (v: string) => formatDate(v) },
]

const erroresColumns = [
  { title: 'Pedido ID', dataIndex: 'pedidoId', key: 'pedidoId', render: (v: number) => `#${v}` },
  { title: 'Motivo', dataIndex: 'motivo', key: 'motivo' },
]

interface BulkInvoiceModalProps {
  open: boolean
  onClose: () => void
  onDone?: () => void
}

type Step = 'confirm' | 'loading' | 'result'

export function BulkInvoiceModal({ open, onClose, onDone }: BulkInvoiceModalProps) {
  const [step, setStep] = useState<Step>('confirm')
  const [result, setResult] = useState<BulkInvoiceResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    setStep('confirm')
    setResult(null)
    setError(null)
    onClose()
    if (result && result.exitosos > 0) onDone?.()
  }

  const handleExecute = async () => {
    setStep('loading')
    setError(null)
    try {
      const res = await invoicesService.masiva()
      setResult(res)
      setStep('result')
    } catch (err) {
      setError(getErrorMessage(err))
      setStep('confirm')
    }
  }

  return (
    <Modal
      title="Facturación masiva"
      open={open}
      onCancel={step !== 'loading' ? handleClose : undefined}
      closable={step !== 'loading'}
      maskClosable={step !== 'loading'}
      footer={null}
      width={680}
    >
      {step === 'confirm' && (
        <Space direction="vertical" style={{ width: '100%' }} size={16}>
          <Text>
            Se generarán facturas para <strong>todos los pedidos pendientes de facturación</strong>.
            Esta operación no se puede deshacer de forma automática.
          </Text>
          {error && <Alert type="error" message={error} showIcon />}
          <div style={{ textAlign: 'right' }}>
            <Button onClick={handleClose} style={{ marginRight: 8 }}>
              Cancelar
            </Button>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={handleExecute}
              danger
            >
              Ejecutar facturación masiva
            </Button>
          </div>
        </Space>
      )}

      {step === 'loading' && (
        <Result
          icon={<ThunderboltOutlined style={{ color: '#1677ff' }} />}
          title="Procesando..."
          subTitle="Generando facturas. Por favor espera."
        />
      )}

      {step === 'result' && result && (
        <Space direction="vertical" style={{ width: '100%' }} size={16}>
          <Row gutter={16}>
            <Col span={8}>
              <Statistic title="Total procesados" value={result.total} />
            </Col>
            <Col span={8}>
              <Statistic
                title="Exitosos"
                value={result.exitosos}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Fallidos"
                value={result.fallidos}
                prefix={<CloseCircleOutlined style={{ color: result.fallidos > 0 ? '#ff4d4f' : undefined }} />}
                valueStyle={{ color: result.fallidos > 0 ? '#ff4d4f' : undefined }}
              />
            </Col>
          </Row>

          {result.facturasGeneradas.length > 0 && (
            <>
              <Text strong>Facturas generadas ({result.facturasGeneradas.length})</Text>
              <Table<Invoice>
                rowKey="id"
                size="small"
                columns={generadasColumns}
                dataSource={result.facturasGeneradas}
                pagination={false}
                style={{ maxHeight: 240, overflowY: 'auto' }}
              />
            </>
          )}

          {result.errores.length > 0 && (
            <>
              <Text strong type="danger">Errores ({result.errores.length})</Text>
              <Table
                rowKey="pedidoId"
                size="small"
                columns={erroresColumns}
                dataSource={result.errores}
                pagination={false}
              />
            </>
          )}

          <div style={{ textAlign: 'right' }}>
            <Button type="primary" onClick={handleClose}>
              Cerrar
            </Button>
          </div>
        </Space>
      )}
    </Modal>
  )
}
