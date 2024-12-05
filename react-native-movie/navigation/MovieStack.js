import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { AntDesign } from '@expo/vector-icons'
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MainScreen from "../screen/MainScreen";
import HomeScreen from "../screen/HomeScreen";
import DetailScreen from "../screen/DetailScreen";
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Stack = createStackNavigator();

const MovieStack = () => {
    const navigation = useNavigation();
    

    return(
        <Stack.Navigator>
            <Stack.Screen name="Main" component={MainScreen}
                    options={{ title:'MOVIE',headerShown: false }}/>
            <Stack.Screen name="Home" component={HomeScreen}
                    options={{
                        title:'MOVIE',
                        headerTintColor : '#fff',
                        headerStyle:{
                            backgroundColor:'black',
                            height:60

                        },
                        headerTitleStyle:{color:'#fff',fontSize:20},
                        headerRight: () =>(
                            <TouchableOpacity style={{marginRight:15}} onPress={()=>navigation.openDrawer()}>
                                <MaterialCommunityIcons name="menu" size={28} color="#Fff" />
                            </TouchableOpacity>
                        )
                    }} />
            <Stack.Screen name="Detail" component={DetailScreen} />
            {/* <Stack.Screen name="Login" component={LoginScreen} /> */}
        </Stack.Navigator>

    )
}

export default MovieStack;