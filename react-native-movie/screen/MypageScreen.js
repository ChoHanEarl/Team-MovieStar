import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { View,Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";


const MypageScreen= () => {
    const {user,setUser} = useContext(AppContext)
    const [formData, setFormData] = useState({
        userName: user?.userName || '',
        userNick: user?.userNick || '',
        userEmail: user?.userEmail || '',
        currentPassword: '',
        newPassword:'',
        confirmNewPassword:'',
    })
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [tab, setTab] = useState('profile');

    const handleInputChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setMessage('');
    };

    const handleProfileUpdate = async() => {
        try {
            const storedUser = await AsyncStorage.getItem('user');
            let existingUser = storedUser ? JSON.parse(storedUser) : null;

            // 입력값과 기존 값이 다를 경우에만 로컬스토리지 업데이트
            if (
                existingUser &&
                existingUser.userName === formData.userName &&
                existingUser.userNick === formData.userNick &&
                existingUser.userEmail === formData.userEmail
            ) {
                setMessage('수정된 내용이 없습니다.');
                setMessageType('info');
                return; // 중복되는 값이기 때문에 업데이트를 하지 않음
            }
            
            if(!formData.userName || !formData.userNick || !formData.userEmail){
                setMessage('모든 필드를 입력해주세요')
                setMessageType('error')
                return;
            }

            const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
            if (!emailRegex.test(formData.userEmail)) {
                setMessage('유효한 이메일 주소를 입력해주세요');
                setMessageType('error');
                return;
            }

            setUser((prev)=>({
                ...prev,
                userName: formData.userName,
                userNick: formData.userNick,
                userEmail: formData.userEmail
            }));

            AsyncStorage.setItem('user', JSON.stringify({
                userName: formData.userName,
                userNick: formData.userNick,
                userEmail: formData.userEmail,
            }));

            setMessage('프로필이 수정되었습니다.')
            setMessageType('success')
        } catch (error) {
            console.error('프로필 업데이트 실패', error);
            setMessage('프로필 수정 중 오류가 발생했습니다.');
            setMessageType('error');
        }
        
    }

     // 비밀번호 변경 함수
     const handlePasswordChange = () => {
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword) {
            setMessage('모든 비밀번호 필드를 입력해주세요');
            setMessageType('error');
            return;
        }

        if (formData.newPassword !== formData.confirmNewPassword) {
            setMessage('새 비밀번호와 새 비밀번호 확인이 일치하지 않습니다');
            setMessageType('error');
            return;
        }

        // 비밀번호 변경 처리 로직 추가 (서버 연동 등)

        setMessage('비밀번호가 변경되었습니다.');
        setMessageType('success');
    };

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const storedUser = await AsyncStorage.getItem("user");
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    setFormData({
                        userName: parsedUser.userName,
                        userNick: parsedUser.userNick,
                        userEmail: parsedUser.userEmail,
                    });
                }
            } catch (error) {
                console.error("사용자 정보 로딩 실패", error);
            }
        };

        loadUserData();
    }, []);

    
    return(
        <View style={styles.background}>
            <View style={styles.formContainer}>
            {tab === 'profile' ? (<Text style={styles.header}>내 정보 페이지</Text>)
            : (<Text style={styles.header}>비밀번호 변경 페이지</Text>)}
                <View style={styles.changeButton}>
                    <TouchableOpacity onPress={()=>setTab('profile')}>
                        <Text style={styles.buttonText}>내 정보</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>setTab('password')}>
                        <Text style={styles.buttonText2}>비밀번호 변경</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.borderLine}></Text>
                {tab === 'profile' &&
                <View style={{marginTop:10}}>
                    <Text style={styles.userNickText}>{` ${formData.userNick}님 안녕하세요! :)`}</Text>
                    <Text style={styles.formText}>아이디</Text>
                    <TextInput
                        style={styles.formTextInput}
                        value={formData.userName}
                        onChangeText={(value)=> handleInputChange('userName', value)}
                        placeholder={formData.userName}
                        placeholderTextColor="grey"
                    />

                    <Text style={styles.formText}>닉네임</Text>
                    <TextInput
                        style={styles.formTextInput}
                        value={formData.userNick}
                        onChangeText={(value)=> handleInputChange('userNick', value)}
                        placeholder={formData.userNick}
                        placeholderTextColor="grey"
                    />

                    <Text style={styles.formText}>이메일</Text>
                    <TextInput
                        style={styles.formTextInput}
                        value={formData.userEmail}
                        onChangeText={(value)=> handleInputChange('userEmail', value)}
                        placeholder={formData.userEmail}
                        placeholderTextColor="grey"
                    />
                    <TouchableOpacity onPress={handleProfileUpdate} >
                        <Text style={styles.profileButton}>프로필 수정</Text>
                    </TouchableOpacity>
                    <Text style={styles.borderLine}></Text>
                </View>
                }
                {tab === 'password' &&
                <View style={{marginTop:10}}>
                    <Text style={styles.userNickText}>{` ${formData.userNick}님 안녕하세요! :)`}</Text>
                    <Text style={styles.formText}>현재 비밀번호</Text>
                        <TextInput
                            style={styles.formTextInput}
                            value={formData.currentPassword}
                            onChangeText={(value)=> handleInputChange('currentPassword', value)}
                            placeholder="현재 비밀번호"
                            placeholderTextColor="grey"
                        />

                    <Text style={styles.formText}>비밀번호 확인</Text>
                        <TextInput
                            style={styles.formTextInput}
                            value={formData.newPassword}
                            onChangeText={(value)=> handleInputChange('newPassword', value)}
                            placeholder="새 비밀번호"
                            placeholderTextColor="grey"
                        />

                    <Text style={styles.formText}>새 비밀번호 확인</Text>
                        <TextInput
                            style={styles.formTextInput}
                            value={formData.confirmNewPassword}
                            onChangeText={(value)=> handleInputChange('confirmNewPassword', value)}
                            placeholder="새 비밀번호 확인"
                            placeholderTextColor="grey"
                        />
                    <TouchableOpacity onPress={handlePasswordChange} >
                        <Text style={styles.profileButton}>비밀번호 변경</Text>
                    </TouchableOpacity>
                        <Text style={styles.borderLine}></Text>
                </View>
                }
                {message && (
                    <Text style={[styles.message, messageType === 'error' ? styles.errorMessage : styles.successMessage]}>
                        {message}
                    </Text>
                )}

            </View>
        </View>
    )
}

const styles = StyleSheet.create({

    background : {
        backgroundColor: 'black', flex:1
    },
    header : {
        color:'white',textAlign:'center',marginTop:20,fontSize:16,marginBottom:10
    },
    changeButton : {
        flexDirection:'row', padding:10, justifyContent:'center',
        borderColor:'grey', paddingLeft:20, marginTop:5,marginBottom:-30
    },
    buttonText : {
        color:'white', padding:5, marginRight:20, borderWidth:1, borderColor:'#fff', textAlign:'center',
        justifyContent:'center', borderRadius:8, fontSize:12, paddingLeft:60, paddingRight:60,
    },
    buttonText2 : {
        color:'white', padding:5, marginRight:5, borderWidth:1, borderColor:'#fff', textAlign:'center',
        justifyContent:'center', borderRadius:8, fontSize:12, paddingLeft:50, paddingRight:50
    },


    formContainer : {
        borderWidth:1, borderColor:'#fff', flex:1 , borderRadius:20
    },
    userNickText : {
        textAlign:'center',color:'#fff',marginTop:30,marginBottom:10,fontSize:16
    },
    formText : {
        color:'white', padding:10, marginLeft:10, marginBottom:-10,marginTop:10
    },
    formTextInput : {
        color:'white', borderWidth:1, borderColor:'#fff', margin:10, borderRadius:10, paddingLeft:10,
        marginLeft:15, width:360,
    },

    profileButton : {
        color:'#fff', textAlign:'center', backgroundColor:'red', width:180, padding:5, margin:5,
        marginLeft:105, borderRadius:10, marginTop:30,
    },
    borderLine: {
        borderBottomWidth:1, borderRadius:20,borderColor:'white',padding:10,marginTop:5
    },

    message : {
        color:'#fff',textAlign:'center',padding:25,
    }




})

export default MypageScreen;