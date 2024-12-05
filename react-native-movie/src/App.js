import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import MovieStack from "../navigation/MovieStack";
import DrawerNavigator from "../navigation/Drawer";

const App = () => {
    return(
        <NavigationContainer>
            <DrawerNavigator/>
        </NavigationContainer>
    )
}

export default App;