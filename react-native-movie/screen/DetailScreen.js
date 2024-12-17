import React, { useEffect, useState,useContext } from 'react';
import { View, Text, Image, TextInput, Button, TouchableOpacity, ScrollView, StyleSheet,FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchMovieDetails, fetchMovieCredits } from '../api/tmdb';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import { AppContext } from '../context/AppContext';
import { useFavoriteContext } from '../context/FavoriteContext';

const StarRating = ({ rating, setRating, size = 20 }) => (
    <View style={styles.starRating}>
        {[...Array(5)].map((_, index) => (
            <TouchableOpacity key={index} onPress={() => setRating(index + 1)}>
                <Ionicons
                    name={index < rating ? 'star' : 'star-outline'}
                    size={size}
                    color={index < rating ? 'gold' : 'lightgray'}
                />
            </TouchableOpacity>
        ))}
    </View>
);

const ReviewForm = ({ rate, setRate, review, setReview, addReview }) => (
    <View style={styles.reviewForm}>
        <Text style={styles.reviewTitle}>리뷰</Text>
        <StarRating rating={rate} setRating={setRate} />

        <TextInput
            style={[styles.reviewInput, { color: 'white' }]}
            placeholder="리뷰 내용을 입력해주세요"
            placeholderTextColor="white"
            value={review}
            onChangeText={setReview}
        />

        <TouchableOpacity style={styles.editButton} onPress={addReview}>
            <Text style={styles.editText}>등록</Text>
        </TouchableOpacity>
    </View>
);

const ReviewItem = ({ item, onEdit, onRemove, editable, editState, updateReview, cancelEdit }) => (
    <View style={styles.reviewItem}>
        <Text style={styles.reviewUser}>{item.user}</Text>
        <StarRating rating={item.rate} size={15} />
        <Text style={styles.reviewText}>{item.review}</Text>
        <Text style={styles.reviewDate}>{item.date}</Text>
        <View style={styles.reviewUser}>
            <TouchableOpacity style={styles.reviewEditButton} onPress={() => onEdit(item)}>
                <Text style={styles.buttonText}>수정</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reviewDeleteButton} onPress={() => onRemove(item.id)}>
                <Text style={styles.buttonText}>삭제</Text>
            </TouchableOpacity>
        </View>

        {editable && editState.id === item.id && (
            <View style={styles.reviewForm}>
                <StarRating
                    rating={editState.rate}
                    setRating={(newRate) => editState.setEditState((prev) => ({ ...prev, rate: newRate }))}
                    size={15}
                />
                <TextInput
                    style={styles.reviewInput}  
                    placeholder="리뷰 내용을 입력해주세요"
                    placeholderTextColor="white"
                    value={editState.review}
                    onChangeText={(text) => editState.setEditState((prev) => ({ ...prev, review: text }))}
                />
                <View style={styles.reviewUser}>
                    <TouchableOpacity style={styles.reviewEditButton} onPress={updateReview}>
                        <Text style={styles.buttonText}>수정</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.reviewDeleteButton} onPress={cancelEdit}>
                        <Text style={styles.buttonText}>취소</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )}
    </View>
);

const ActorList = ({ actors }) => {
    return (
        <FlatList
            horizontal
            data={actors}
            keyExtractor={(actor) => actor.id.toString()}
            renderItem={({ item }) => (
                <View style={styles.actorItem}>
                    <Image
                        source={{
                            uri: `https://image.tmdb.org/t/p/w200${item.profile_path}`,
                        }}
                        style={styles.actorImage}
                    />
                    <Text style={styles.actorText}>
                        {item.name} - {item.character}
                    </Text>
                </View>
            )}
        />
    );
};

const DetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { id } = route.params;
    const { user } = useContext(AppContext)
    const [movie, setMovie] = useState([]);
    const [rate, setRate] = useState(5);
    const [review, setReview] = useState('');
    const [reviewList, setReviewList] = useState([]);
    const [editable, setEditable] = useState(false);
    const [editState, setEditState] = useState({ id: -1, rate: 5, review: "" });
    const [actor, setActor] = useState([]);
    const [isFavorite,setIsFavorite]= useState(false)
    const { favoriteMovies, setFavoriteMovies, } = useFavoriteContext(); // 찜 목록과 업데이트 함수 사용

    const addReview = () => {
        if(!user){
            alert('로그인 후 작성할 수 있습니다.')
            return;
        }
        const newReview = {
            id: reviewList.length + 1,
            user: '유저 이름',
            rate,
            review,
            date: moment().format('MM/DD HH:mm'),
        };
        setReviewList((prev) => [newReview, ...prev]);
        // setReview('');
    };

    const handleRemove = (id) => {
        setReviewList((prev) => prev.filter((item) => item.id !== id));
    };

    const handleEdit = (item) => {
        setEditable(true);
        setEditState({ id: item.id, rate: item.rate, review: item.review });
    };

    const updateReview = () => {
        setReviewList((prev) =>
            prev.map((item) =>
                item.id === editState.id
                    ? { ...item, rate: editState.rate, review: editState.review }
                    : item
            )
        );
        setEditable(false);
        setEditState({ id: -1, rate: 5, review: '' });
    };

    const cancelEdit = () => {
        setEditable(false);
        setEditState({ id: -1, rate: 5, review: '' });
    };

    useEffect(() => {
        if (movie?.id) {
            const fetchDetails = async () => {
                try {
                    const castData = await fetchMovieCredits(movie.id);
                    setActor(castData.cast.slice(0, 10));
                } catch (error) {
                    console.error('Error fetching actor details:', error);
                }
            };
            fetchDetails();
        }
    }, [movie]);

    useEffect(() => {
            const getMovieDetails = async () => {
                try {
                    const movieDetails = await fetchMovieDetails(id);
                    setMovie(movieDetails);
                } catch (error) {
                    console.error('Error fetching movie details:', error);
                }
            };
            getMovieDetails();
    }, [id]);

    useEffect(() => {
        // 찜 목록에 영화가 있는지 확인하여 하트 상태를 설정
        const isMovieFavorite = favoriteMovies.some((m) => m.id === movie?.id);
        setIsFavorite(isMovieFavorite); // 찜 여부 상태 설정
    }, [favoriteMovies, movie]);

    const toggleFavorite = () => {
        const updatedFavorites = isFavorite
            ? favoriteMovies.filter((m) => m.id !== movie.id)
            : [...favoriteMovies, movie];

        setFavoriteMovies(updatedFavorites); // 찜 목록 업데이트
        setIsFavorite(!isFavorite); // 찜 여부 상태 업데이트
    };



return (
        <FlatList
            style={styles.container}
            ListHeaderComponent={
                <>
                    <TouchableOpacity onPress={() => navigation.navigate('HomeStack')}>
                        <Text style={styles.backButton}>←</Text>
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Image
                            source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
                            style={styles.poster}
                        />
                        <View style={styles.movieDetails}>
                            <View style={styles.likeList}>
                                <Text style={styles.title}>{movie.title}</Text>
                                <TouchableOpacity onPress={toggleFavorite}>
                                    <Ionicons 
                                        style={styles.like}
                                        name={isFavorite ? 'heart' : 'heart-outline'} 
                                        size={20} 
                                        color={isFavorite ? 'red' : 'white'} 
                                    />
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={{maxHeight:140}}>
                                <Text style={styles.overview}>{movie.overview}</Text>
                            </ScrollView>
                            <Text style={styles.releaseDate}>
                                <Text style={styles.bold}>Release Date: {movie.release_date}</Text>
                            </Text>
                            <Text style={styles.rating}>
                                <Text style={styles.bold}>Rating: {movie.vote_average}/10</Text>
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.bold2}>출연진</Text>
                    <ActorList actors={actor} />

                    <ReviewForm
                        rate={rate}
                        setRate={setRate}
                        review={review}
                        setReview={setReview}
                        addReview={addReview}
                    />
                </>
            }
            data={reviewList}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <ReviewItem
                    item={item}  
                    onEdit={handleEdit}
                    onRemove={handleRemove}
                    editable={editable}
                    editState={editState}
                    updateReview={updateReview}
                    cancelEdit={cancelEdit}
                />
            )}
        />
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        padding: 10,
    },
    backButton: {
        color:'white',
        fontSize:30,
        marginBottom: 5,
        marginTop:-10
    },
    buttonText: {
        textAlign:'center',
        alignItems:'center',
        justifyContent:'center',
        fontSize: 14,
        margin:5,
        color:'black'
    },
    header: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    poster: {
        width: 150,
        height: 225,
        marginRight: 15,
    },
    movieDetails: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom:10,
        paddingRight:10,
        marginLeft:-5
    },
    overview: {
        fontSize:14,
        color: 'white',
        marginVertical: 5,
        marginBottom:10,
        marginTop:-5
    },
    reviewForm: {
        
         marginVertical: 20,
    },
    reviewTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom:10
    },
    reviewInput: {
        color:'white',
        height: 40,
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 10,
        marginVertical: 10,
        paddingLeft: 10,

    },
    reviewItem: {
        backgroundColor: 'black',
        padding: 10,
        marginBottom: 10,
        borderColor: 'white',
        borderWidth:2,
        borderRadius: 5,
    },
    reviewUser: {
        color: 'white',
        flexDirection:'row',
        fontWeight: 'bold',
        
    },
    reviewText: {
        color:'white',
        marginVertical: 5,
    },
    reviewDate: {
        color: '#fff',
        fontSize: 12,
    },
    reviewEditButton: {
        marginTop:5,
        marginBottom:5,
        backgroundColor: 'white',
        borderRadius: 5,
        width: 170
    },
    editButton:{
        backgroundColor:'#FF3636',
        marginTop:5,
        marginBottom:5,
        padding:5,
        borderRadius: 5,
    },
    editText:{
        color:'white',
        textAlign:'center', 
    },
    reviewDeleteButton: {
        marginLeft:5,
        marginTop:5,
        marginBottom:5,
        backgroundColor: 'white',
        borderRadius: 5,
        width: 170
    },
    starRating : {
        flexDirection: 'row',
        flex: 1,
        
    },
    bold : {
        color:"#fff",
        alignItems:'center',
        justifyContent:'center',
        flex:1,
        margin:5
    },
    bold2:{
        color:"#fff",
        alignItems:'center',
        justifyContent:'center',
        flex:1,
    },
    actorListContainer: {
        flexDirection: 'row', 
        paddingHorizontal: 10,  
    },
    actorItem: {
        marginRight: 15,  
        alignItems: 'center',
    },
    actorImage: {
        width: 60, 
        height: 80,
        borderRadius: 30,  
    },
    actorText: {
        color: 'white',
        fontSize: 12,
        marginTop: 5,
    },
    likeList : {
        flexDirection:'row',
        margin:5,
        
    },
    like: {
        marginTop:10
    },
  });


export default DetailScreen;
