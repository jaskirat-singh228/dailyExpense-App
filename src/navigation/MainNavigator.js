import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { mStacks } from '../utills/ScreenList';

const Stack = createNativeStackNavigator();

const MainNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName="HomeScreen"
        >
            {mStacks.map((item) => (
                <Stack.Screen
                    key={item.name}
                    name={item.name}
                    component={item.component}
                />
            ))}
        </Stack.Navigator>
    );
};

export default MainNavigator;