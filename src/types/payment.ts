/**
 * Payment System Type Definitions
 * Production-grade Razorpay integration types
 */

export interface PaymentRecord {
    // Razorpay identifiers
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string

    // Payment details
    amount: number // in paise (₹200 = 20000 paise)
    currency: string // 'INR'
    status: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded'

    // User information
    user_id: string
    user_email: string
    student_type: 'internal' | 'external'

    // Payment method details
    payment_method?: string // 'card', 'upi', 'netbanking', 'wallet'
    payment_method_details?: {
        type?: string
        upi_transaction_id?: string // UTR for UPI
        card_last4?: string
        card_network?: string
        bank?: string
        wallet?: string
    }

    // Timestamps
    created_at: string // ISO 8601
    updated_at: string // ISO 8601
    paid_at?: string // ISO 8601

    // Event details (for future use)
    event_ids?: string[]

    // Metadata
    notes?: Record<string, string>
    error_description?: string
}

export interface RazorpayOrderRequest {
    amount: number // in paise
    currency: string
    receipt: string // unique receipt ID
    notes?: Record<string, string>
}

export interface RazorpayOrderResponse {
    id: string // order_id
    entity: 'order'
    amount: number
    amount_paid: number
    amount_due: number
    currency: string
    receipt: string
    status: 'created' | 'attempted' | 'paid'
    attempts: number
    notes: Record<string, string>
    created_at: number // Unix timestamp
}

export interface RazorpayPaymentVerification {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
}

export interface PaymentStatusResponse {
    hasPaid: boolean
    payment?: PaymentRecord
    message: string
}
