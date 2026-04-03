export default function PagoError() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center border border-gray-100">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Error en el pago</h1>
        <p className="text-sm text-gray-500">Hubo un problema procesando tu pago. Por favor contacta a Ferova Agency para resolverlo.</p>
      </div>
    </div>
  )
}
