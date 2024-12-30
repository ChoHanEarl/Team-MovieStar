import React, { useEffect, useState,useContext } from 'react';
import { View, Text, Image, TextInput, Button, TouchableOpacity, ScrollView, StyleSheet,FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchMovieDetails, fetchMovieCredits } from '../api/tmdb';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import { AppContext } from '../context/AppContext';
import { useFavoriteContext } from '../context/FavoriteContext';
import axios from 'axios';

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

const ReviewItem = ({ item, onEdit, onRemove, editable, editState, updateReview, cancelEdit,setEditState }) => (
    
    <View style={styles.reviewItem}>
        <Text style={styles.reviewUser}>{item.userNick}</Text>
        <StarRating rating={item.reviewRating} size={15} />
        <Text style={styles.reviewText}>{item.reviewContent}</Text>
        <Text style={styles.reviewDate}>{moment(item.reviewDate).format('YYYY-MM-DD')}</Text>
        <View style={styles.reviewUser}>
            <TouchableOpacity style={styles.reviewEditButton} onPress={() => onEdit(item)}>
                <Text style={styles.buttonText}>수정</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reviewDeleteButton} onPress={() => onRemove(item.reviewId)}>
                <Text style={styles.buttonText}>삭제</Text>
            </TouchableOpacity>
        </View>

        {editable && editState.id === item.id && (
            <View style={styles.reviewForm}>
                <StarRating
                    rating={editState.reviewRating}
                    setRating={(newRate) => setEditState((prev) => ({ ...prev, reviewRating: newRate }))}
                    size={15}
                />
                <TextInput
                    style={styles.reviewInput}  
                    placeholder="리뷰 내용을 입력해주세요"
                    placeholderTextColor="white"
                    value={editState.reviewContent}
                    onChangeText={(text) => setEditState((prev) => ({ ...prev, reviewContent: text }))}
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

    // 영화 상세 정보 가져오기
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

    // 영화 리뷰 목록 가져오기
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get(`http://192.168.3.22:9090/review/${id}`);
                setReviewList(response.data.data);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        };
        fetchReviews();
    }, [id]);

    // 출연진 정보 가져오기
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

    // 찜 목록에 영화가 있는지 확인
    useEffect(() => {
        const isMovieFavorite = favoriteMovies.some((m) => m.id === movie?.id);
        setIsFavorite(isMovieFavorite); // 찜 여부 상태 설정
    }, [favoriteMovies, movie]);

    // 찜 상태 토글
    const toggleFavorite = () => {
        const updatedFavorites = isFavorite
            ? favoriteMovies.filter((m) => m.id !== movie.id)
            : [...favoriteMovies, movie];
        setFavoriteMovies(updatedFavorites); // 찜 목록 업데이트
        setIsFavorite(!isFavorite); // 찜 여부 상태 업데이트
    };

    // 리뷰 추가
    const addReview = async () => {
        if (!user) {
            alert('로그인 후 작성할 수 있습니다.');
            return;
        }
        if (!review || review.trim() === "") {
            alert('리뷰 내용을 입력해주세요.');
            return;
        }

        const existingReview = reviewList.find((r) => r.userId === user.userId && r.movieId === movie.id);
        if (existingReview) {
            alert('이미 작성된 리뷰가 있습니다.');
            return;
        }

        const newReview = {
            userId: user.userId, // 사용자 ID
            movieId: movie.id, // 영화 ID
            reviewContent: review.trim(),
            reviewRating: rate 
        };

        try {
            const response = await axios.post('http://192.168.3.22:9090/review/private/write', newReview);
            setReviewList((prev) => [response.data, ...prev]); // 새 리뷰를 리스트 앞에 추가.
            setReview(''); // 리뷰 입력 초기화
        } catch (error) {
            console.error('Error adding review:', error);
        
        }
    };

    // 리뷰 수정
    const updateReview = async () => {
        try {
            const response = await axios.put(
                `http://192.168.3.22:9090/review/private/modify/${editState.id}`,
                { review: editState.review, rate: editState.rate }
            );
            setReviewList((prev) =>
                prev.map((item) =>
                    item.id === editState.id
                        ? { ...item, rate: response.data.rate, review: response.data.review }
                        : item
                )
            );
            setEditable(false);
            setEditState({ id: -1, rate: 5, review: '' });
        } catch (error) {
            // 더 구체적으로 에러 로그를 출력해보기
            if (error.response) {
                // 서버가 응답을 했을 경우
                console.error('Server Response:', error.response.data);
                alert(`서버 오류: ${error.response.data.message || '알 수 없는 오류'}`);
            } else if (error.request) {
                // 요청은 했지만 응답을 받지 못한 경우
                console.error('Request was made but no response received:', error.request);
                alert('서버 응답 없음');
            } else {
                // 다른 오류 발생
                console.error('Error:', error.message);
                alert('네트워크 오류');
            }
        }
    };
    

    // 리뷰 삭제
    const handleRemove = async (reviewId) => {
        try {
            const numericReviewId = parseInt(reviewId, 10);  // reviewId를 숫자로 변환
            if (isNaN(numericReviewId)) {
                alert('Invalid review ID');
                return;
            }
    
            await axios.delete(`http://192.168.3.22:9090/review/private/remove/${numericReviewId}`);
            setReviewList((prev) => prev.filter((item) => item.id !== numericReviewId)); // 삭제된 리뷰 제거
            
            alert("리뷰가 삭제되었습니다.")
        } catch (error) {
            console.error('Error removing review:', error);
            if (error.response) {
                // 서버 응답 내용 출력
                console.error('Server Response:', error.response.data);
                alert(`Error: ${error.response.data.message || 'Unknown error'}`);
            } else if (error.request) {
                console.error('Request was made but no response received:', error.request);
            } else {
                console.error('Error', error.message);
            }
        }
    };
    

    // 리뷰 수정 상태 변경
    const handleEdit = (item) => {
        setEditable(true);
        setEditState({ id: item.id, rate: item.rate, review: item.review });
    };

    // 수정 취소
    const cancelEdit = () => {
        setEditable(false);
        setEditState({ id: -1, rate: 5, review: '' });
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
            keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
            renderItem={({ item }) => (
                <ReviewItem
                    item={item}  
                    onEdit={handleEdit}
                    onRemove={handleRemove}
                    editable={editable}
                    editState={editState}
                    updateReview={updateReview}
                    cancelEdit={cancelEdit}
                    setEditState={setEditState}
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
