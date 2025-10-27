// Address type matching backend model
export interface Address {
    id?: number
    receiverName: string
    receiverPhone: string
    main: number
    province: string
    district: string
    ward: string
    specifics: string
    isDefault: boolean
}

export interface AddressFormData {
    receiverName: string
    receiverPhone: string
    main: string
    province: string
    district: string
    ward: string
    specifics?: string
    isDefault?: boolean
}
