import React, { useState, useEffect, useContext } from "react";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { View, TouchableOpacity, Text, TextInput,Button, StyleSheet,KeyboardAvoidingView,ScrollView } from "react-native";
import { Linking, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppContext } from "../context/AppContext";

const LoginScreen = () => {
    const [formData, setFormData] = useState({ userName: "", userPwd: "" });
    const [error, setError] = useState("")
    const { setUser } = useContext(AppContext)
    const navigation = useNavigation();
    const isfocused = useIsFocused();

    useEffect(()=>{
        if(isfocused){
            setFormData({ userName: "", userPwd: "" })
        }
    },[isfocused])

    // 네이버 로그인
    const handleNaverLogin = () => {
        const NAVER_LOGIN_CLIENT_ID ="kSEszMRKZ_x7AdJDnave";
        const REDIRECT_URI = 'http://localhost:9090/oauth'
        const STATE = "false";
        const NAVER_AUTH_URL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_LOGIN_CLIENT_ID}&state=${STATE}&redirect_uri=${REDIRECT_URI}`;
        Linking.openURL(NAVER_AUTH_URL).catch(err => console.error("Failed to open URL:", err))
    };


    // 카카오 로그인
    const handleKakaoLogin = () => {
        const Rest_api_key = Config.REACT_APP_KAKAO_LOGIN_API_KEY;
        const REDIRECT_URI = 'http://localhost:9090/oauth';
        const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${Rest_api_key}&redirect_uri=${REDIRECT_URI}&response_type=code`;
        Linking.openURL(KAKAO_AUTH_URL).catch(err => console.error("Failed to open URL:", err))
    };

    // 구글 로그인
    const handleGoogleLogin = () => {
        const GOOGLE_CLIENT_ID = Config.REACT_APP_GOOGLE_LOGIN_CLIENT_ID;
        const REDIRECT_URI = 'http://localhost:9090/oauth';
        const SCOPE = "email profile";
        const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPE}`;
        Linking.openURL(GOOGLE_AUTH_URL).catch(err => console.error("Failed to open URL:", err))
    };

    // 폼 제출 처리
    const handleSubmit = async () => {
        try {
            // AsyncStorage에서 모든 사용자 정보 가져오기
            const storedUsers = await AsyncStorage.getItem('users');
            const users = storedUsers ? JSON.parse(storedUsers) : [];

            // 입력된 userName에 해당하는 사용자 찾기
            const parsedUser = users.find(user => user.userName === formData.userName);

            if (parsedUser && parsedUser.userPwd === formData.userPwd) {
                // 로그인 성공 시
                setUser(parsedUser);
                navigation.navigate("Home");
            } else {
                setFormData({ userName: "", userPwd: "" })
                setError("아이디 또는 비밀번호가 일치하지 않습니다.");
            }
        } catch (err) {
            setError("로그인 오류가 발생했습니다. 다시 시도해 주세요.");
        }
    };

    return(
        <KeyboardAvoidingView
            behavior={Platform.OS === "android" ? "height" : "padding"}
            style={{ flex: 1,  }}
        >
            <ScrollView contentContainerStyle={styles.background}>
                <View style={styles.container}>
                    <View style={styles.loginForm}>
                        <Text style={styles.logininput}>Login</Text>
                        {/* 로그인 폼 */}
                        <View>
                        <Text style={styles.textlogin}>아이디</Text>
                        <TextInput
                            style={styles.textlogininput}
                            placeholder="아이디를 입력하세요"
                            placeholderTextColor='#A6A6A6'
                            value={formData.userName}
                            onChangeText={(value) => setFormData({ ...formData, userName: value })}
                        />
                        </View>

                        <View>
                        <Text style={styles.textlogin}>비밀번호</Text>
                            <TextInput
                                style={styles.textpasswordinput}
                                placeholder="비밀번호를 입력하세요"
                                placeholderTextColor='#A6A6A6'
                                value={formData.userPwd}
                                onChangeText={(value) => setFormData({ ...formData, userPwd: value })}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity onPress={handleSubmit}>
                            <Text style={styles.Loginbutton}>로그인</Text>
                        </TouchableOpacity>


                        {/* 에러 메시지 */}
                        {error && <Text style={styles.errortext}>{error}</Text>}

                        {/* 소셜 로그인 섹션 */}
                        <View>
                            <Text style={styles.socialinput}>SocialLogin</Text>
                                <View>
                                    <TouchableOpacity onPress={handleNaverLogin}>
                                        <Text style={styles.naverbutton}>네이버 로그인</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity  onPress={handleKakaoLogin}>
                                        <Text style={styles.kakaobutton}>카카오 로그인</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity  onPress={handleGoogleLogin}>
                                        <Text style={styles.googlebutton}>구글 로그인</Text>
                                    </TouchableOpacity>
                                </View>
                        </View>
                    </View>

                    {/* 링크 섹션 */}
                    <View style={styles.Link}>
                        <TouchableOpacity onPress={() => navigation.navigate("FindId")}>
                            <Text style={styles.Linktext}>아이디 찾기</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate("FindPassword")}>
                            <Text style={styles.Linktext}>비밀번호 찾기</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                            <Text style={styles.Linktext}>회원가입</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
};

const styles = StyleSheet.create({
    background:{
        flex: 1,
        padding:5,
        justifyContent: 'center',
        alignItems: 'center',
        resizeMode: 'cover',
        backgroundColor:'rgba(0, 0, 0, 0.8)'
    },
    container:{
        backgroundColor: 'rgba(0, 0, 0, 0.9)', // 투명한 배경
        justifyContent: 'center',
        alignItems: 'center',
        padding:24,
        margin:16,
        flex:1,
        borderRadius:35,
    },
    loginForm:{
        width:300,
    },
    logininput:{
        fontSize:22,
        color:"white",
        textAlign:'center',
        justifyContent:'center',
        marginBottom:10,
        padding:5,
    },
    socialinput:{
        fontSize:20,
        color:"white",
        textAlign:'center',
        justifyContent:'center',
        margin:10,
        marginTop:20,
        padding:5,
    },
    textlogin:{
        color:"white",
        margin:5
    },
    textlogininput:{
        color:'white',
        fontSize:12,
        margin:5,
        marginBottom:10,
        paddingLeft:10,
        borderWidth:1,
        borderColor:'white',
        borderRadius:8,
    },
    textpasswordinput:{
        color:'white',
        fontSize:12,
        margin:5,
        paddingLeft:10,
        marginBottom:10,
        borderWidth:1,
        borderColor:'white',
        borderRadius:8,
    },
    Linktext:{
        color:"red",
        alignItems:'center',
        justifyContent:'center',
        padding:5,
        margin:5
    },
    Link:{
        flexDirection:'row',
        alignItems:'center',
        textAlign:'center',
        justifyContent:'center',

    },
    Loginbutton:{
        backgroundColor:'red',
        textAlign:'center',
        fontSize: 16,
        padding:14,
        margin:5,
        color:'white',
        borderRadius:10,
    },
    naverbutton:{
        backgroundColor:'#03c75a',
        textAlign:'center',
        fontSize: 16,
        padding:14,
        margin:5,
        color:'white',
        borderRadius:10,
    },
    kakaobutton:{
        backgroundColor:'#fee500',
        textAlign:'center',
        fontSize: 16,
        padding:14,
        margin:5,
        color:'white',
        borderRadius:10,
    },
    googlebutton:{
        backgroundColor:'#4285f4',
        textAlign:'center',
        fontSize: 16,
        padding:14,
        margin:5,
        color:'white',
        borderRadius:10,
    },
    errortext: {
        color: "white",
        textAlign: "center",
        marginTop: 10,
        fontSize:12,
    }
})



export default LoginScreen;
