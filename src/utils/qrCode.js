import qrcode from 'qrcode'
export const qrCodeFunction = ({data=''}={})=>{
    const qrCodeResult = qrcode.toDataURL(JSON.stringify(data),{errorCorrectionLevel:'H'})
    return qrCodeResult
}