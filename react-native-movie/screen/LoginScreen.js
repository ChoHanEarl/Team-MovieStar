import React, { useState, useEffect, useContext } from "react";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { View, TouchableOpacity, Text, TextInput,Button, StyleSheet,KeyboardAvoidingView,ScrollView, Alert } from "react-native";
import { Linking, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppContext } from "../context/AppContext";
import axios from "axios";

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

    // 폼 제출 처리
    const handleSubmit = async () => {
        try {
            console.log(formData)
            const response = await axios.post(
                "http://10.0.2.2:9090/user/signin",
                {
                    userName: formData.userName,
                    userPwd: formData.userPwd
                },
                { 
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true 
                } 
            );

            if (response.status === 200) {
                const userData = response.data;
                console.log("로그인 응답 데이터:", userData);
                setUser({
                    userId: userData.userId,
                    userEmail: userData.userEmail,
                    userNick: userData.userNick,
                    userName: userData.userName,
                    userLikeList: userData.userLikeList || []
                });
                console.log("Context에 저장된 사용자 정보:", userData);
                
                navigation.navigate("Home"); 
            } else {
                setFormData({ userName: "", userPwd: "" });
                setError("아이디 또는 비밀번호가 일치하지 않습니다.");
            }
        } catch (err) {
            setError("로그인 오류가 발생했습니다. 다시 시도해 주세요:" + err);
            console.error(err.message)
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
                    </View>

                    {/* 링크 섹션 */}
                    <View style={styles.Link}>
                        <TouchableOpacity onPress={() => navigation.navigate("FindIdOrPwd")}>
                            <Text style={styles.Linktext}>아이디/비밀번호 찾기</Text>
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
    errortext: {
        color: "white",
        textAlign: "center",
        marginTop: 10,
        fontSize: 12,
    }
})

export default LoginScreen;
