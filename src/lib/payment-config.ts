// Configuración de métodos de pago
export const PAYMENT_CONFIG = {
  // Datos bancarios de la empresa
  bankAccounts: {
    nequi: {
      name: "Nequi",
      number: "3243118004",
      holder: "Estilo Urbano SAS",
      type: "Billetera digital",
      color: "green",
      icon: "💚"
    },
  },

  // Información de contacto
  contact: {
    whatsapp: "324 311 80 04",
    businessHours: "Lunes a Viernes 8:00 AM - 6:00 PM"
  },

  // Instrucciones de pago
  instructions: [
    "Realiza el pago por el monto exacto",
    "Usa el número de pedido como referencia",
    "Envía el comprobante de pago por WhatsApp",
    "Tu pedido será procesado en 24-48 horas después de confirmar el pago"
  ],

  // Estados de pago
  paymentStatus: {
    pending: "pendiente_pago",
    paid: "pagado",
    shipped: "enviado",
    delivered: "entregado"
  }
};

// Función para obtener los datos bancarios
export function getBankAccounts() {
  return PAYMENT_CONFIG.bankAccounts;
}

// Función para obtener información de contacto
export function getContactInfo() {
  return PAYMENT_CONFIG.contact;
}

// Función para obtener instrucciones
export function getPaymentInstructions() {
  return PAYMENT_CONFIG.instructions;
} 