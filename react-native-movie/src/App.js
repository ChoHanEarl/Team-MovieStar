import React,{useState} from "react";
import { NavigationContainer } from "@react-navigation/native";
import DrawerNavigator from "../navigation/Drawer";
import { AppContext } from "../context/AppContext";
import { FavotiteProvider } from "../context/FavoriteContext";


const App = () => {
    const [user, setUser] = useState(null)
    return(
        <AppContext.Provider value={{user,setUser}}>
            <FavotiteProvider>
                <NavigationContainer>
                    <DrawerNavigator/>
                </NavigationContainer>
            </FavotiteProvider>
        </AppContext.Provider>
    )
}

export default App;