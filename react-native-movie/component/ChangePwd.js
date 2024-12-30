import React, { useContext, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PwdChangeScreen = () => {
  const navigation = useNavigation();
  const { setUser } = useContext(AppContext);

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const emailCheck = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+$/;
  const passwordCheck = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const handleChangePassword = () => {
    if (!email || !newPassword || !confirmNewPassword) {
      setErrorMessage("모든 항목을 입력해주세요.");
      return false;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return false;
    }
    if (!emailCheck.test(email)) {
      setErrorMessage("이메일 형식에 맞지 않습니다.");
      return false;
    }
    if (!passwordCheck.test(newPassword)) {
      setErrorMessage(
        "비밀번호는 최소 8자 이상이며, 대소문자, 숫자, 특수문자가 포함되어야 합니다."
      );
      return false;
    }

    setErrorMessage("");
    return true;
  };

  const handleSubmit = async () => {
    if (handleChangePassword()) {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await axios.put(
          `http://10.0.2.2:9090/user/modifyPwd?email=${email}`,
          { userPwd: newPassword },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          Alert.alert("비밀번호 변경 완료", "홈 화면으로 이동합니다.", [
            { text: "확인", onPress: () => navigation.navigate("Home") },
          ]);
          const userData = response.data;
          setUser({
            userId: userData.userId,
            userEmail: userData.userEmail,
            userNick: userData.userNick,
            userName: userData.userName,
            userLikeList: userData.userLikeList || [],
          });
        } else {
          setErrorMessage(response.data.message || "비밀번호 변경에 실패했습니다.");
        }
      } catch (error) {
        setErrorMessage("서버 오류가 발생했습니다. 다시 시도해주세요.");
        console.error("비밀번호 변경 실패:", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>비밀번호 변경</Text>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>이메일</Text>
        <TextInput
          style={styles.input}
          placeholder="이메일 입력"
          placeholderTextColor="#A6A6A6"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>새 비밀번호</Text>
        <TextInput
          style={styles.input}
          placeholder="새 비밀번호 입력"
          placeholderTextColor="#A6A6A6"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>새 비밀번호 확인</Text>
        <TextInput
          style={styles.input}
          placeholder="새 비밀번호 다시 입력"
          placeholderTextColor="#A6A6A6"
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
          secureTextEntry
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>비밀번호 변경</Text>
      </TouchableOpacity>
      {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    padding: 20,
    justifyContent: "center",
  },
  header: {
    fontSize: 24,
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    color: "white",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    height: 40,
    color: "black",
  },
  button: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  errorMessage: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
});

export default PwdChangeScreen;
