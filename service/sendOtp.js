
const axios = require('axios')

const sendOtp = async (phone, otp) => {

    let isSent = false;

    // third party service provider
    const url = 'https://api.managepoint.co/api/sms/send'

    // payload
    const payload = {
        'apiKey' : 'd8edd3dd-dd86-4c83-841b-c3f702eb01a0',
        'to' : phone,
        'message' : `Your OTP for Verification is ${otp}`
    }

    try {
        const res = await axios.post(url,payload)
        if(res.status == 200){
            isSent = true;
        }
        
    } catch (error) {
        console.log('OTP Sending Fail : ', error.message)
    }

    return isSent;

}


module.exports = sendOtp
//