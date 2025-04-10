import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { IMAGES } from '../utills/ImagePath'

const Header = ({ navigation, title, isButton }) => {
    return (
        <View style={styles.header}>
            {isButton && <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image source={IMAGES.backArrow} style={styles.backArrow} />
            </TouchableOpacity>}
            <Text style={styles.screenTitle}>{title}</Text>
        </View>
    )
}

export default Header

const styles = StyleSheet.create({
    header: {
        position: 'absolute',
        height: Platform.OS === 'android' ? 90 : 100,
        backgroundColor: '#154165',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 10000,
        top: 0,
        paddingHorizontal: 20,
    },
    backArrow: {
        tintColor: '#FFFFFF',
        height: 25,
        width: 25,
        marginTop: Platform.OS === 'android' ? 30 : 0,
    },
    screenTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginHorizontal: 10,
        marginTop: Platform.OS === 'android' ? 30 : 0,
    },
})