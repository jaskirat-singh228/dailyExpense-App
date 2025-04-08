import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigator from './MainNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Navigation = () => {
    return (
        <GestureHandlerRootView>
            <NavigationContainer>
                <MainNavigator />
            </NavigationContainer>
        </GestureHandlerRootView>
    );
};

export default Navigation;