import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet, ActivityIndicator,TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Signup = () => {
  const [formData, setFormData] = useState({
    userEmail: "",
    userPwd: "",
    userPwdCheck: "",
    userNick: "",
    userName: "",
    userLikeList: [],
  });

  const [message, setMessage] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const emailCheck = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+/;
    if (!formData.userName) {
      setMessage("아이디를 입력해주세요");
      setDisabled(true);
    } else if (!formData.userEmail) {
      setMessage("이메일을 입력해주세요.");
      setDisabled(true);
    } else if (!emailCheck.test(formData.userEmail)) {
      setMessage("이메일 형식을 확인해주세요.");
      setDisabled(true);
    } else if (!formData.userNick) {
      setMessage("닉네임을 입력해주세요.");
      setDisabled(true);
    } else if (!formData.userPwd) {
      setMessage("비밀번호를 입력해주세요.");
      setDisabled(true);
    } else if (formData.userPwd !== formData.userPwdCheck) {
      setMessage("비밀번호가 일치하지 않습니다.");
      setDisabled(true);
    } else {
      setMessage("");
      setDisabled(false);
    }
  }, [formData]);

  const handleChange = (e, name) => {
    setFormData({ ...formData, [name]: e });
  };

  const handleSubmit = async () => {
        if (!disabled) {
            setLoading(true); // 로딩 시작
            try {
                const newUser = {
                userName: formData.userName,
                userPwd: formData.userPwd,
                userEmail: formData.userEmail,
                userNick: formData.userNick,
                userLikeList: [],
                };

                const existingUsers = await AsyncStorage.getItem('users');
                const users = existingUsers ? JSON.parse(existingUsers) : [];
                
                if (users.some(user => user.userEmail === formData.userEmail)) {
                    setMessage("이미 등록된 이메일입니다.");
                    setDisabled(true);
                    return;
                }

                // Save new user
                users.push(newUser);
                await AsyncStorage.setItem('users', JSON.stringify(users));

                // Success message
                Alert.alert("회원가입 완료");
                navigation.navigate("LoginStack"); // 로그인 화면으로 이동

                // Clear form data
                setFormData({
                    userEmail: "",
                    userPwd: "",
                    userPwdCheck: "",
                    userNick: "",
                    userName: "",
                    userLikeList: [],
                });

            } catch (error) {
                console.error(error);
                Alert.alert("회원가입 오류", "회원가입에 실패했습니다.");
            } finally {
                setLoading(false); // 로딩 종료
            }
        }
  };

  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <View style={styles.contentcontainer}>
        <View style={styles.titletext}>
          <TouchableOpacity  onPress={() => navigation.navigate('LoginStack')}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.header}>회원가입</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.textcontent}>아이디</Text>
          <TextInput
              style={styles.input}
              placeholder="아이디를 입력하세요"
              placeholderTextColor="#A6A6A6"
              value={formData.userName}
              onChangeText={(text) => handleChange(text, "userName")}
          />

          <Text style={styles.textcontent}>이메일</Text>
          <TextInput
              style={styles.input}
              placeholder="이메일을 입력하세요"
              placeholderTextColor="#A6A6A6"
              value={formData.userEmail}
              onChangeText={(text) => handleChange(text, "userEmail")}
          />

          <Text style={styles.textcontent}>닉네임</Text>
          <TextInput
              style={styles.input}
              placeholder="닉네임을 입력하세요"
              placeholderTextColor="#A6A6A6"
              value={formData.userNick}
              onChangeText={(text) => handleChange(text, "userNick")}
          />

          <Text style={styles.textcontent}>비밀번호</Text>
          <TextInput
              style={styles.input}
              placeholder="비밀번호를 입력하세요"
              placeholderTextColor="#A6A6A6"
              secureTextEntry
              value={formData.userPwd}
              onChangeText={(text) => handleChange(text, "userPwd")}
          />

          <Text style={styles.textcontent}>비밀번호 확인</Text>
          <TextInput
              style={styles.input}
              placeholder="비밀번호를 다시 입력하세요"
              placeholderTextColor="#A6A6A6"
              secureTextEntry
              value={formData.userPwdCheck}
              onChangeText={(text) => handleChange(text, "userPwdCheck")}
          />
        </View>  
          {message && <Text style={styles.message}>{message}</Text>}
          {loading ? (
              <ActivityIndicator size="large" color="blue" />
          ) : (
              <TouchableOpacity onPress={handleSubmit} disabled={disabled} >
                <Text style={styles.signupbutton}>회원가입</Text>
              </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'rgba(0, 0, 0, 0.8)'
  },
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding:40,
    margin:20,
    borderRadius:35,
  },
  contentcontainer:{
    flex:1,
    justifyContent:'center',
    width:280,
    marginBottom:10
  },
  input: {
    fontSize:12,
    color:'#fff',
    height: 40,
    borderColor: 'white',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft:10,
    borderRadius: 8,
  },
  textcontent:{
    fontSize:12,
    color:'#fff',
    marginBottom:6
  },
  titletext:{
    flexDirection:'row',
    color:'#fff',
    justifyContent:'center',
    alignItems:'center',
    margin:5
  },
  header: {
    color:'#fff',
    fontSize: 22,
    marginBottom: 20,
    padding:5,
    marginRight:-10
  },
  backButton: {
    color:'#fff',
    fontSize:30,
    justifyContent:'center',
    marginBottom: 30,
    marginLeft:-100
    
  },
  message: {
    color: 'red',
    padding:10,
    marginBottom: 10,
    textAlign: 'center',
  },
  signupbutton:{
    backgroundColor:'red',
    textAlign:'center',
    fontSize: 14,
    padding:10,
    color:'white',
    borderRadius:10,
  },
  info:{
    marginBottom:15,
    paddingBottom:5
  }
});

export default Signup;
