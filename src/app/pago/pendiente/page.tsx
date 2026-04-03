export default function PagoPendiente() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center border border-gray-100">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Pago pendiente</h1>
        <p className="text-sm text-gray-500">Tu pago esta siendo procesado. Te notificaremos cuando se confirme.</p>
      </div>
    </div>
  )
}
