module.exports = {
    ENUMS: {
        USER_TYPE: {
            CUSTOMER: 'Customer',
            SERVICE_PROVIDER: 'ServiceProvider',
            ADMIN: 'Admin'
        },
        USER_STATUS: {
            PENDING: 'Pending',
            APPROVED: 'Approved',
            REJECTED: 'Rejected'
        },
        ORDER_STATUS : {
            PENDING: 'Pending',
            AMOUNT_ADDEDD : 'Amount Added',
            AMOUNT_APPROVED_BY_USER : 'Amount Approved',
            ORDER_APPROVED_BY_TAILOR : 'Order Approved',
            MEASUREMENT_PENDING : 'Measurement Pending',
            MEASUREMENT_DONE : 'Measurement Done',
            READY_FOR_TRY : 'Ready For Try',
            TRIED_BY_USER : 'Tried By User',
            APPROVED_BY_USER : 'Approved By Customer',
            PAYMENT_DONE : 'Payment Done',
            COMPLETED : 'Completed',
            REJECTED: 'Rejected'
        }
    }
}