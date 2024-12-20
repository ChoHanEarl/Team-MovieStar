import React,{createContext,useContext, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";


export const FavoriteContext = createContext();


//custom hook생성
export const useFavoriteContext = ()=> {
    return useContext(FavoriteContext);
}

export const FavotiteProvider = ({children}) => {
    const [favoriteMovies, setFavoriteMovies] = useState([]) // 찜한영화목록

    
    const saveFavoriteMovies = async (movies) => {
        try {
            await AsyncStorage.setItem('favoriteMovies', JSON.stringify(movies));
        } catch (error) {
            console.error('저장 실패:', error);
        }
    };

    const loadFavoriteMovies = async () => {
        try {
            const storedMovies = await AsyncStorage.getItem('favoriteMovies');
            if (storedMovies) {
                setFavoriteMovies(JSON.parse(storedMovies));
            }
        } catch (error) {
            console.error('불러오기 실패:', error);
        }
    };

    return(
        <FavoriteContext.Provider
            value={{favoriteMovies,setFavoriteMovies,saveFavoriteMovies,loadFavoriteMovies}}
        >
                {children}
        </FavoriteContext.Provider>
    )
}