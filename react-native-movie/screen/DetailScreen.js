import React, { act, useEffect, useState } from 'react';
import { View, Text, Image, TextInput, Button, TouchableOpacity, ScrollView, StyleSheet,FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchMovieDetails, fetchMovieCredits } from '../api/tmdb';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';


// 별점 컴포넌트
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

// 리뷰 작성 폼 컴포넌트
const ReviewForm = ({ rate, setRate, review, setReview, addReview }) => (
    <View style={styles.reviewForm}>
        <Text style={styles.reviewTitle}>리뷰 작성</Text>
        <StarRating rating={rate} setRating={setRate} />
        <TextInput
            style={[styles.reviewInput, { color: 'white' }]}
            placeholder="리뷰 내용을 입력해주세요"
            placeholderTextColor="white"
            value={review}
            onChangeText={setReview}
        />
        <Button style={styles.reviewItem} title="올리기" onPress={addReview} />
    </View>
);

// 리뷰 아이템 컴포넌트
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
            <Button title="수정하기" onPress={updateReview} />
            <Button title="취소" onPress={cancelEdit} />
        </View>
        )}
    </View>
);

// 리뷰 리스트 컴포넌트
const ReviewList = ({ reviews, onEdit, onRemove, editable, editState, updateReview, cancelEdit }) => (
    <View style={styles.reviewItem}>
        {reviews.map((item) => (
        <ReviewItem
            key={item.id}
            item={item}
            onEdit={onEdit}
            onRemove={onRemove}
            editable={editable}
            editState={editState}
            updateReview={updateReview}
            cancelEdit={cancelEdit}
        />
        ))}
    </View>
);

// 출연진 목록 컴포넌트
const ActorList = ({ actors }) => {
    return (
        <ScrollView horizontal contentContainerStyle={styles.actorListContainer}>
            {actors.map((actor) => (
                <View key={actor.id} style={styles.actorItem}>
                    <Image
                        source={{
                            uri: `https://image.tmdb.org/t/p/w200${actor.profile_path}`,
                        }}
                        style={styles.actorImage}
                    />
                    <Text style={styles.actorText}>
                        {actor.name} - {actor.character}
                    </Text>
                </View>
            ))}
        </ScrollView>
    );
};



// 메인 MovieDetail 컴포넌트
const DetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { id } = route.params;

    const [movie, setMovie] = useState([]);
    const [rate, setRate] = useState(5);
    const [review, setReview] = useState('');
    const [reviewList, setReviewList] = useState([]);
    const [editable, setEditable] = useState(false);
    const [editState, setEditState] = useState({ id: -1, rate: 5, review: "" });
    const [actor,setActor] = useState([]);

const addReview = () => {
    const newReview = {
        id: reviewList.length + 1,
        user: '유저 이름',
        rate,
        review,
        date: moment().format('MM/DD HH:mm'),
    };
    setReviewList((prev) => [newReview, ...prev]);
    setReview('');
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

// 출연진 정보 가져오기 부분
useEffect(() => {
    if (movie?.id) {  // movie가 있을 때만 실행
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
}, [movie]); // movie 상태가 변경될 때마다 실행

 

return (
        <ScrollView style={styles.container}>

        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
                <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>

        <View style={styles.header}>
            <Image
                source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
                style={styles.poster}
            />
            <View style={styles.movieDetails}>
                <Text style={styles.title}>{movie.title}</Text>
                <Text style={styles.overview}>{movie.overview}</Text>
                <Text style={styles.releaseDate}>
                    <Text style={styles.bold}>Release Date: {movie.release_date}</Text> 
                </Text>
                <Text style={styles.rating}>
                    <Text style={styles.bold}>Rating: {movie.vote_average}/10</Text> 
                </Text>            
            </View>
        </View>
        <View>
            {/* 출연진 목록 컴포넌트 사용 */}
            <Text style={styles.bold2}>출연진</Text>
            <ActorList actors={actor}/>
        </View> 

        {/* 리뷰폼 */}
        <ReviewForm
            rate={rate}
            setRate={setRate} 
            review={review} 
            setReview={setReview} 
            addReview={addReview} 
        />

        {/* 리뷰리스트 */}
        <ReviewList
            reviews={reviewList}
            onEdit={handleEdit}
            onRemove={handleRemove}
            editable={editable}
            editState={{
                ...editState,
                setEditState
            }}
            updateReview={updateReview}
            cancelEdit={cancelEdit}
        />
    </ScrollView>
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
    },
    buttonText: {
        alignItems:'center',
        justifyContent:'center',
        fontSize: 14,
        margin:10,
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
        marginBottom:10
    },
    overview: {
        fontSize:14,
        color: 'white',
        marginVertical: 5,
        marginBottom:10
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
        
    },
    reviewDeleteButton: {
        margin: 5,
        backgroundColor: 'white',
        borderRadius: 5,
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
  });


export default DetailScreen;
