import React, { useContext }from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screen/HomeScreen";
import MainScreen from "../screen/MainScreen";
import DetailScreen from "../screen/DetailScreen";
import LoginScreen from "../screen/LoginScreen";
import SignupScreen from "../screen/SignupScreen";
import FindIdScreen from "../component/FIndId";
import FindPwdScreen from "../component/FindPwd";
import LikeScreen from "../screen/LikeScreen";
import MypageScreen from "../screen/MypageScreen";
import {MaterialCommunityIcons} from '@expo/vector-icons'
import { Image,Text,View,StyleSheet,TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AppContext } from "../context/AppContext";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();


const StackDetailNavigator = () => {
    return (
      <Stack.Navigator>
        {/* <Stack.Screen name="Main" component={MainScreen} 
            options={{ headerShown: false,  }}/> */}
        <Stack.Screen name="HomeStack" component={HomeScreen} 
            options={{ headerShown: false,  }}/>
        <Stack.Screen name="DetailScreen" component={DetailScreen} 
            options={{ headerShown: false, }}/>
      </Stack.Navigator>
    );
  };

  
  const StackLoginNavigator = () => {
    return (
      <Stack.Navigator>
        <Stack.Screen name="LoginStack" component={LoginScreen} 
            options={{ headerShown: false}} />
        <Stack.Screen name="Signup" component={SignupScreen} 
            options={{ headerShown: false}} />
        <Stack.Screen name="FindId" component={FindIdScreen} 
            options={{ headerShown: false}} />
        <Stack.Screen name="FindPassword" component={FindPwdScreen} 
            options={{ headerShown: false}}/>
      </Stack.Navigator>
    );
  };




const DrawerNavigator = () => {
    const { user, setUser } = useContext(AppContext);
    const navigation = useNavigation();

    // 로그인 버튼 클릭 시
    const navigateToLoginScreen = () => {
        navigation.navigate("Login") // LoginScreen으로 이동
    }
    
    // 로그아웃 버튼 클릭 시
    const handleLogout = () => {
        setUser(null)
        navigation.navigate('Home')
        
    }

    //라벨 로그아웃 버튼 클릭 시
    const labelHandleLogout = () => {
        setUser(null)
        navigation.navigate('Login')
    }

    const labelHandleMypage = () => {
        navigation.navigate('Mypage')
    }

    const labelHandleLogoutMypage = () => {
        alert('로그인 후 이용해주세요')
        navigation.navigate('Home')
        
    }

    const labelHandleLike = () => {
        navigation.navigate('Like')
    }

    return(
        <Drawer.Navigator initialRouteName="Main"
            screenOptions={({navigation})=> ({
                drawerStyle:{backgroundColor: 'black',
                    width:160, 
                },
                drawerLabelStyle:{fontSize:16,color:'white'},
                drawerActiveTintColor:'#4caf50',  
                drawerInactiveTintColor: '#757575', 
                drawerPosition:'right',
                drawerType:'slide' ,
                headerLeft: () => (
                    null
                ),
                headerRight: () =>(
                    <View style={styles.container}>
                    <TouchableOpacity onPress={user ? handleLogout : navigateToLoginScreen}>
                        <Text style={styles.loginbutton}>
                            {user ? "로그아웃" : "로그인"}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toggle} onPress={()=>navigation.toggleDrawer()}>
                        <MaterialCommunityIcons name="menu" size={28} color="#Fff" />
                    </TouchableOpacity>
                    </View>
                ),               
            })}
        >
            <Drawer.Screen name="Main" component={MainScreen} 
                options={ {headerShown: false,
                    drawerLabelStyle:{
                        display: 'none',  // 드로어 라벨을 숨깁니다
                    },
                    drawerItemStyle:{
                        display:'none'
                    }
            }}/>
            
            <Drawer.Screen name="Home" component={StackDetailNavigator}
                    options={{
                        headerTitle:() => {
                            const navigation = useNavigation();
                            return(
                            <TouchableOpacity onPress={()=>navigation.navigate('Home')}>
                                <Image
                                    source={require('../images/logo.png')}
                                    style={styles.logo}
                                />
                            </TouchableOpacity>
                            )
                        },
                        headerTintColor : '#fff',
                        headerStyle:{
                            backgroundColor:'black',
                            height:70,
                        },
                        drawerLabel:()=>(
                        <View style={{flexDirection:'row',marginLeft:-10}}>
                            <MaterialCommunityIcons name="home" size={20} color="white" />
                            <Text style={{color:"white",marginLeft:10,fontWeight:'blod'}}>Home</Text>
                        </View>
                        )
                    }} />

            <Drawer.Screen name="Login" component={StackLoginNavigator}
                options={({navigation})=> ({
                    headerTitle:() => {
                        const navigation = useNavigation();
                        return(
                            <TouchableOpacity onPress={()=>navigation.navigate('Home')}>
                                <Image
                                    source={require('../images/logo.png')}
                                    style={styles.logo}
                                />
                            </TouchableOpacity>
                        )
                    },
                    headerRight:()=>(
                        <TouchableOpacity style={styles.toggle} onPress={()=>navigation.toggleDrawer()}>
                            <MaterialCommunityIcons name="menu" size={28} color="#Fff" />
                        </TouchableOpacity>
                    ),
                    headerTintColor : '#fff',
                    headerStyle:{
                        backgroundColor:'black',
                        height:90,
                    },
                    drawerLabel: ()=>{
                        return(
                        <TouchableOpacity onPress={user ? labelHandleLogout : navigateToLoginScreen}>
                            <View style={{flexDirection:'row',marginLeft:-10}}>
                                {user ? 
                                <>
                                <MaterialCommunityIcons name="logout" size={20} color="#fff" />
                                <Text style={{ color:'#fff',marginLeft:10 }}>Logout</Text>
                                </> 
                                :
                                <>
                                <MaterialCommunityIcons name="login" size={20} color="#fff" />
                                <Text style={{ color:'#fff',marginLeft:10 }}>Login</Text>
                                </>
                                }
                            </View>
                        </TouchableOpacity>
                        )
                    } ,                 
                })}/>
            <Drawer.Screen name="Mypage" component={MypageScreen}
                options={{
                    headerTitle:() => {
                        const navigation = useNavigation();
                        return(
                        <TouchableOpacity onPress={()=>navigation.navigate('Home')}>
                            <Image
                                source={require('../images/logo.png')}
                                style={styles.logo}
                            />
                        </TouchableOpacity>
                        )
                    },
                    headerTintColor : '#fff',
                    headerStyle:{
                        backgroundColor:'black',
                        height:80,
                    },
                    drawerLabel: ()=>{
                        const MyLabelContent = (
                            <View style={{flexDirection:'row',marginLeft:-10,}}>
                                <MaterialCommunityIcons name="account" size={20} color="#fff" />
                                <Text style={{ color:'#fff',marginLeft:10 }}>Mypage</Text>
                            </View>
                        )
                        return(
                        <TouchableOpacity onPress={user ? labelHandleMypage : labelHandleLogoutMypage} >
                            {MyLabelContent}
                        </TouchableOpacity>
                        )
                    } 
                }}/>
            <Drawer.Screen name="Like" component={LikeScreen}
                options={{
                    drawerLabel:()=>{
                        const LikeLabelContent=(
                            <View style={{flexDirection:'row',marginLeft:-5}}>
                                <MaterialCommunityIcons name="heart" size={20} color="red" />
                                <Text style={{color:"white",marginLeft:10,fontWeight:'blod'}}>찜 목록</Text>
                            </View>
                        )
                        return(
                            <TouchableOpacity onPress={user ? labelHandleLike : labelHandleLogoutMypage} style={{flexDirection:'row',marginLeft:-5}}>
                               {LikeLabelContent}
                            </TouchableOpacity>
                        )
                    },
                    headerTitle:() => {
                        const navigation = useNavigation();
                        return(
                        <TouchableOpacity onPress={()=>navigation.navigate('Home')}>
                            <Image
                                source={require('../images/logo.png')}
                                style={styles.logo}
                            />
                        </TouchableOpacity>
                        )
                    },
                    headerTintColor : '#fff',
                    headerStyle:{
                        backgroundColor:'black',
                        height:80,
                    },
                }}/>
        </Drawer.Navigator>
    )
}

const styles =StyleSheet.create({
    container:{
        flexDirection:'row',
    },
    loginbutton:{
        color:'white',
        width:60,
        height:20,
        backgroundColor:'red',
        textAlign: 'center',
        fontSize: 12,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop:6,
        marginRight:5
        
    },
    toggle:{
        marginRight:15,
    },
    logo:{
        width: 140,
        height:100,
        flex:1,
        padding:20,
        marginTop:2,
    }
})




export default DrawerNavigator;