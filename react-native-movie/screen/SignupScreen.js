import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation } from '@react-navigation/native';

const Signup = () => {
  const [formData, setFormData] = useState({
    userNick: "",
    userEmail: "",
    userName: "",
    userPwd: "",
    userPwdCheck: "",
  });

  const [message, setMessage] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    // 이메일 식별 정규식
    const emailCheck = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+$/;
    // 비밀번호 정규식
    const passwordCheck = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!formData.userNick) {
      setMessage("닉네임을 입력해주세요");
      setDisabled(true);
    } else if (!formData.userEmail) {
      setMessage("이메일을 입력해주세요.");
      setDisabled(true);
    } else if (!emailCheck.test(formData.userEmail)) {
      setMessage("이메일 형식을 확인해주세요.");
      setDisabled(true);
    } else if (!formData.userName) {
      setMessage("아이디를 입력해주세요.");
      setDisabled(true);
    } else if (!formData.userPwd) {
      setMessage("비밀번호를 입력해주세요.");
      setDisabled(true);
    } else if (!passwordCheck.test(formData.userPwd)) {
      setMessage("비밀번호는 최소 8자이며 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.");
      setDisabled(true);
    } else if (formData.userPwd !== formData.userPwdCheck) {
      setMessage("비밀번호가 일치하지 않습니다.");
      setDisabled(true);
    } else {
      setMessage("");
      setDisabled(false);
    }
  }, [formData]);

  const handleChange = (text, name) => {
    setFormData({ ...formData, [name]: text });
  };

  const handleSubmit = async () => {
    if (!disabled) {
      setLoading(true); // 로딩 시작
      try {
        const response = await fetch("http://10.0.2.2:9090/user/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "회원가입 실패");
          return;
        }

        if (data.success) {
          Alert.alert("회원가입 완료", "로그인 페이지로 이동합니다.", [
            { text: "확인", onPress: () => navigation.navigate("LoginStack") },
          ]);
          setFormData({
            userNick: "",
            userEmail: "",
            userName: "",
            userPwd: "",
            userPwdCheck: "",
          });
        } else {
          setMessage(data.message || "회원가입 실패");
        }
      } catch (error) {
        console.error("회원가입 오류:", error);
        setMessage("회원가입 중 오류가 발생했습니다.");
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
            <TouchableOpacity onPress={() => navigation.navigate("LoginStack")}>
              <Text style={styles.backButton}>←</Text>
            </TouchableOpacity>
            <Text style={styles.header}>회원가입</Text>
          </View>
          <View style={styles.info}>
            {["userNick", "userEmail", "userName", "userPwd", "userPwdCheck"].map((key) => {
              const labels = {
                userNick: "닉네임",
                userEmail: "이메일",
                userName: "아이디",
                userPwd: "비밀번호",
                userPwdCheck: "비밀번호 확인",
              };

              const inputType = key.includes("Pwd") ? "password" : "text";
              const placeholder =
                key === "userPwdCheck"
                  ? "비밀번호를 다시 입력하세요"
                  : `${labels[key]}을(를) 입력하세요`;

              return (
                <View key={key}>
                  <Text style={styles.textcontent}>{labels[key]}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor="#A6A6A6"
                    secureTextEntry={inputType === "password"}
                    value={formData[key]}
                    onChangeText={(text) => handleChange(text, key)}
                  />
                </View>
              );
            })}
          </View>
          {message && <Text style={styles.message}>{message}</Text>}
          {loading ? (
            <ActivityIndicator size="large" color="blue" />
          ) : (
            <TouchableOpacity onPress={handleSubmit} disabled={disabled}>
              <Text style={styles.signupbutton}>회원가입</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  container: {
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    padding: 40,
    margin: 20,
    borderRadius: 35,
  },
  contentcontainer: {
    flex: 1,
    justifyContent: "center",
    width: 280,
    marginBottom: 10,
  },
  input: {
    fontSize: 12,
    color: "#fff",
    height: 40,
    borderColor: "white",
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 8,
  },
  textcontent: {
    fontSize: 12,
    color: "#fff",
    marginBottom: 6,
  },
  titletext: {
    flexDirection: "row",
    color: "#fff",
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
  },
  header: {
    color: "#fff",
    fontSize: 22,
    marginBottom: 20,
    padding: 5,
    marginRight: -10,
  },
  backButton: {
    color: "#fff",
    fontSize: 30,
    justifyContent: "center",
    marginBottom: 30,
    marginLeft: -100,
  },
  message: {
    color: "red",
    padding: 10,
    marginBottom: 10,
    textAlign: "center",
  },
  signupbutton: {
    backgroundColor: "red",
    textAlign: "center",
    fontSize: 14,
    padding: 10,
    color: "white",
    borderRadius: 10,
  },
  info: {
    marginBottom: 15,
    paddingBottom: 5,
  },
});

export default Signup;

