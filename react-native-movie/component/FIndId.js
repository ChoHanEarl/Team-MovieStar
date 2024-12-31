import React,{useState } from "react";
import { View,Text,TextInput,TouchableOpacity,StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";


const FindIdScreen = () => {
    const [email,setEmail] = useState("")
    const [message,setMessage] = useState("")
    const navigation = useNavigation();

    const handleFindId = (e) => {
        e.preventDefault();
        if (email === "example@example.com") {
            setMessage("회원님의 아이디는 exampleUser 입니다.");
        } else {
            setEmail('')
            setMessage("입력하신 정보와 일치하는 아이디가 없습니다.");
        }
    };


    return(
        <View style={styles.background}>
            <View style={styles.container}>
                <View style={styles.contentcontainer}>
                    <View style={styles.header}>
                        <TouchableOpacity  onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.backButton}>←</Text>
                        </TouchableOpacity>
                        <Text style={styles.titlecontent}>아이디 찾기</Text>
                    </View>
                    <Text style={styles.content}>이메일 주소</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="이메일을 입력하세요"
                        placeholderTextColor="#A6A6A6"
                        keyboardType="email-address"
                            autoCapitalize="none"
                            required
                    />
                    <TouchableOpacity onPress={handleFindId}>
                        <Text style={styles.button}>아이디 찾기</Text>
                    </TouchableOpacity>
                    {message && <Text style={styles.message}>{message}</Text>}
                </View>
            </View>
        </View>

    )
}

const styles = StyleSheet.create({
    background:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor:'rgba(0, 0, 0, 0.8)'
    },
    container: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding:35,
        marginBottom:40,
        borderRadius:35,
        height:380
    },
    header: {
        flexDirection:'row',
        margin:5,
        paddingBottom:5

    },
    contentcontainer:{
        justifyContent:'center',
        width:280 ,
        paddingTop:30
    },
    content:{
        color:'#fff',
        fontSize:12,
        marginBottom:5,
        marginTop:35
    },
    titlecontent:{
        color:'#fff',
        fontSize:22,
        paddingLeft:55, 
    },
    input: {
        fontSize:10,
        color:'#fff',
        height: 40,
        borderColor: 'white',
        borderWidth: 1,
        marginBottom: 20,
        paddingLeft:10,
        borderRadius: 8,
      },
    button:{
        backgroundColor:'red',
        textAlign:'center',
        fontSize: 14,
        padding:10,
        color:'white',
        borderRadius:10,
    },
    backButton: {
        color:'#fff',
        fontSize:30,
        justifyContent:'center',
        marginTop:-10
        
    },
    message: {
        color: 'red',
        padding:10,
        marginBottom: 10,
        textAlign: 'center',
        fontSize:12
      },
  });
export default FindIdScreen;