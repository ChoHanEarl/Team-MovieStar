import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground} from "react-native";
import { useNavigation } from "@react-navigation/native";

const MainScreen = () => {

    const navigation = useNavigation();

    const handleClick2 = () => {
        navigation.navigate('Login');
      };
    
      const handleClick = () => {
        navigation.navigate('Home');
      };

    return(
        <ImageBackground
                source={require('../images/background.jpg')} 
                style={styles.background}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.heading}>Movie</Text>
                    <Text style={styles.subHeading}>보고싶은 영화의 평점과 리뷰를 미리 확인하고 선택해 보세요!</Text>
                    <TouchableOpacity style={styles.button} onPress={handleClick2}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={handleClick}>
                        <Text style={styles.buttonText}>Home</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        resizeMode: 'cover', // 배경 이미지 크기 조절
      },
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // 투명한 배경
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // 반투명 배경
        padding: 40,
        borderRadius: 40,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5, // 안드로이드 전용 그림자
    },
    heading: {
        fontSize: 28,
        color: 'white',
        marginBottom: 10,
    },
    subHeading: {
        fontSize: 11,
        color: 'white',
        marginBottom: 20,
        textAlign: 'center',
    },
    button: {
        padding: 10,
        backgroundColor: '#443b38',
        borderRadius: 5,
        marginVertical: 5,
        alignItems: 'center',
        justifyContent:'center',
        marginHorizontal: 5,
    },
    buttonText: {
       color: 'white',
       fontSize: 14,
    },

    
  });
  
  export default MainScreen;