const code = new URL(window.location.href).searchParams.get("code");

const getCode = async () => {
    try{
        const response = await axios.post(
            'https://kauth.kakao.com/oauth/token',{
                grant_type: "authorization_code",
                client_id: REST_API_KEY,
                redirect_uri: REDIRECT_URI,
                code: code    // 인가코드
            })
    } catch {
        
    }
}