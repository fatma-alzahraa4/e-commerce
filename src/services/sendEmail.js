import nodemailer from 'nodemailer'
export async function sendEmailService({
    to,
    subject,
    message,
    attachments=[]
}={}){
    //configurations
    const transporter = nodemailer.createTransport({
        host:'localhost',
        port:587,
        secure:false,
        service:'gmail',
        auth:{
            user:'Kfatmaalzahraa@gmail.com',
            pass:'vxhvedjwopdikfal'
        }
    })
    const emailInfo = transporter.sendMail({
        from:'"confirmation" <Kfatmaalzahraa@gmail.com>',
        to : to ? to : '',
        subject : subject ? subject : '',
        html:message ? message :'',
        attachments
    })
    if(emailInfo.accepted.length){
        return true
    }
    else{
        return false
    }
}