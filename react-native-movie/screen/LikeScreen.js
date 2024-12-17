import React from "react";
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useFavoriteContext } from "../context/FavoriteContext";



const LikeScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { favoriteMovies } = useFavoriteContext(); // 찜 목록 가져오기
    const numColumns = 3 // 영화 n개씩 보여주고 다음열로 넘어가기

    
    const handleMoviePress = (movieId) => {
        navigation.navigate("Home",{screen:"DetailScreen",params:{ id:movieId}});
    };


    return (
        <View style={styles.background}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.navigate('HomeStack')}>
                        <Text style={styles.backbutton}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.text}>나의 찜 리스트</Text>
                </View>
                
                {favoriteMovies.length === 0 ? (
                    <Text style={styles.text0}>찜한 영화가 없습니다</Text>
                ) : (
                    <FlatList
                        
                        data={favoriteMovies}
                        key={numColumns}
                        numColumns={numColumns}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                                <TouchableOpacity onPress={()=>handleMoviePress(item.id)}>
                                    <Image
                                        source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
                                        style={styles.image}
                                    />
                                    <Text style={styles.item}>{item.title} ♥</Text>
                                </TouchableOpacity>
                        )}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    background:{
        backgroundColor:'black',
        flex:1
    },
    container: {
        backgroundColor: 'black',
        padding:10,
        borderWidth:2,
        borderColor:'grey',
        borderRadius:10,
        flex:1
    },
    header:{
        flexDirection:'row',
        margin:5,
        padding:5,
        borderWidth:1,
        borderRadius:10,
        borderColor:'#fff',
    },
    backbutton: {
        color:'#fff',
        fontSize: 30,
        marginTop:-15,
    },
    text : {
        color:'#fff',
        fontSize:14,
        paddingLeft:105,
        marginTop:2,
        
        
    },
    text0 : {
        color:'#fff',
        textAlign:"center",
        margin:10,
        marginLeft:15
    },
    image :{
        width: 100,
        height: 150,
        margin:12 
    },
    item : {
        color:'#fff',
        fontSize:12,
        textAlign:'center'
    },



})

export default LikeScreen;
