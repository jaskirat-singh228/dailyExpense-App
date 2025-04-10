import { Alert, Linking, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

export const sharePNG = async ({ viewShotRef }) => {
    try {
        // 1. Capture screenshot
        const uri = await viewShotRef.current.capture();
        const base64Data = await RNFS.readFile(uri, 'base64');

        // 2. Save PNG to accessible file path
        const imagePath = `${RNFS.CachesDirectoryPath}/screenshot.png`;
        await RNFS.writeFile(imagePath, base64Data, 'base64');

        // 3. Check if WhatsApp can be opened
        // const canOpenWhatsApp = await Linking.canOpenURL(`whatsapp://send`);

        // if (canOpenWhatsApp) {
        // 4. Share directly to WhatsApp (Android only)
        await Share.open({
            url: `file://${imagePath}`,
            type: 'image/png',
            failOnCancel: false,
            // 👇 Target WhatsApp only
            packageName: 'com.whatsapp',
        });
        // } else {
        //     // 5. Fallback if WhatsApp not installed
        //     const fallbackURL = Platform.select({
        //         ios: 'https://apps.apple.com/app/whatsapp-messenger/id310633997',
        //         android: 'https://play.google.com/store/apps/details?id=com.whatsapp',
        //     });

        //     Alert.alert(
        //         'WhatsApp Not Installed',
        //         'Do you want to download WhatsApp?',
        //         [
        //             { text: 'Cancel', style: 'cancel' },
        //             { text: 'Download', onPress: () => Linking.openURL(fallbackURL) },
        //         ]
        //     );
        // }

        // Optional: delete the file after sharing
        await RNFS.unlink(imagePath);
    } catch (error) {
        console.log('Error sharing to WhatsApp:', error);
        Alert.alert('Error', 'Something went wrong while sharing.');
    }
};
