import React,{useState } from "react";
import { View,Text,TextInput,TouchableOpacity,StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const FindIdOrPwdScreen = () => {
    const [findIdEmail, setFindIdEmail] = useState(""); // 아이디 찾기 이메일 상태
    const [findPwdEmail, setFindPwdEmail] = useState(""); // 비밀번호 찾기 이메일 상태
    const [message, setMessage] = useState("");
    const [pwMessage, setPwMessage] = useState("");
    const [takePwdCode, setTakePwdCode] = useState("");
    const navigation = useNavigation();

    // 아이디 찾기
    const handleFindId = async () => {
        if (!findIdEmail) {
            setMessage("이메일을 입력해주세요");
            return;
        }

        try {
            const response = await axios.get(`http://10.0.2.2:9090/user/find-id`, {
                params: { email: findIdEmail },
            });

            if (response.data.success) {
                setMessage(`회원님의 아이디는 ${response.data.userName}입니다.`);
            } else {
                setMessage(response.data.message || "아이디 찾기에 실패했습니다.");
            }
        } catch (error) {
            console.error("아이디 찾기 오류:", error);
            setMessage("아이디 찾기 중 오류가 발생했습니다.");
        }
    };

    // 임시 비밀번호 발송
    const sendEmail = async () => {
        if (!findPwdEmail) {
            setPwMessage("이메일을 입력해주세요");
            return;
        }

        setPwMessage("이메일 발송 중입니다...");

        try {
            const response = await axios.post(`http://10.0.2.2:9090/user/request_verification?email=${findPwdEmail}`);

            if (response.data.success) {
                setPwMessage(response.data.message || "인증코드를 이메일로 발송했습니다.");
            } else {
                setPwMessage(response.data.message || "인증코드 발송에 에러가 발생했습니다.");
            }
        } catch (error) {
            setPwMessage("해당 이메일로 등록된 아이디를 찾을 수 없습니다.");
            console.error("Error sending email:", error);
        }
    };

    // 인증 코드 확인
    const handleFindPassword = async () => {
        if (!takePwdCode) {
            setPwMessage("인증코드를 입력해주세요");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("token");
            const response = await axios.post(
                `http://10.0.2.2:9090/user/verify_email?email=${findPwdEmail}&code=${takePwdCode}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + token,
                    },
                    withCredentials: true,
                }
            );

            if (response.status === 200) {
                setPwMessage(response.data.message || "인증 성공");
                alert("인증 성공");
                navigation.navigate("ChangePwd");
            } else {
                setPwMessage(response.data.message || "인증코드가 일치하지 않습니다.");
            }
        } catch (error) {
            setPwMessage("서버 오류가 발생했습니다.");
            console.error("Error verifying code:", error.response || error.message);
        }
    };

    return (
        <View style={styles.background}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    <View style={styles.contentContainer}>
                        {/* 아이디 찾기 */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => navigation.navigate("LoginStack")}>
                                <Text style={styles.backButton}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.titleContent}>아이디 찾기</Text>
                        </View>
                        <Text style={styles.findIdContent}>가입 시 사용한 이메일</Text>
                        <TextInput
                            style={styles.findIdInput}
                            value={findIdEmail}
                            onChangeText={setFindIdEmail}
                            placeholder="이메일을 입력하세요"
                            placeholderTextColor="#A6A6A6"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <TouchableOpacity onPress={handleFindId}>
                            <Text style={styles.button}>아이디 찾기</Text>
                        </TouchableOpacity>
                        {message && <Text style={styles.message}>{message}</Text>}

                        {/* 비밀번호 찾기 */}
                        <Text style={styles.findPwdTitle}>비밀번호 찾기</Text>
                        <Text style={styles.findPwdContent}>이메일</Text>
                        <TextInput
                            style={styles.findPwdInput}
                            value={findPwdEmail}
                            onChangeText={setFindPwdEmail}
                            placeholder="이메일을 입력하세요"
                            placeholderTextColor="#A6A6A6"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <TouchableOpacity onPress={sendEmail}>
                            <Text style={styles.button}>임시 비밀번호 받기</Text>
                        </TouchableOpacity>
                        {pwMessage && <Text style={styles.authMessage}>{pwMessage}</Text>}
                        {pwMessage === "인증코드를 이메일로 발송했습니다." && (
                            <View>
                                <Text style={styles.authContent}>인증코드 입력</Text>
                                <TextInput
                                    style={styles.authInput}
                                    placeholder="이메일로 받은 인증코드를 입력하세요"
                                    placeholderTextColor="#ddd"
                                    value={takePwdCode}
                                    onChangeText={setTakePwdCode}
                                />
                                <TouchableOpacity onPress={handleFindPassword}>
                                    <Text style={styles.confirmButton}>인증코드확인</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        padding: 20,
    },
    contentContainer: {
        flexGrow: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 10, // 헤더를 위로 이동
        marginBottom: 20, // 헤더 아래 간격
    },
    backButton: {
        fontSize: 20,
        marginRight: 10,
        color: 'white'
    },
    titleContent: {
        fontSize: 24,
        fontWeight: "bold",
        color: 'white',
        textAlign: "center",
        flex: 1,
        marginRight: 30
    },
    findIdContent: {
        fontSize: 16,
        marginBottom: 10,
        color: 'white'
    },
    findIdInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
        padding: 10,
        marginBottom: 20, // 입력 필드와 버튼 사이 간격
        color: 'white',
    },
    button: {
        backgroundColor: "#FFADFF",
        color: "black",
        textAlign: "center",
        padding: 10,
        borderRadius: 5,
        marginBottom: 10, // 버튼과 비밀번호 찾기 텍스트 간격 조정
    },
    message: {
        marginTop: 10,
        fontSize: 14,
        color: "#fff",
        textAlign: 'center'
    },
    authMessage: {
        marginTop: 10,
        fontSize: 14,
        color: "white",
        textAlign: "center",
        marginBottom: 10
    },
    findPwdTitle: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center", // 가운데 정렬
        marginVertical: 20, // 상하 간격
        color: 'white',
    },
    findPwdContent: {
        fontSize: 16,
        marginBottom: 10,
        color: 'white',
    },
    findPwdInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
        color: 'white',
    },
    authContent: {
        fontSize: 16,
        marginBottom: 10,
        color: 'white',
    },
    authInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
        marginBottom: 20,
        color: "white",
        padding: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    confirmButton: {
        backgroundColor: "#FF1212",
        color: "white",
        textAlign: "center",
        padding: 10,
        borderRadius: 5,
    }
});


export default FindIdOrPwdScreen;