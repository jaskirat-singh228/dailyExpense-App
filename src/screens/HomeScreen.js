import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Image, Modal, Platform, SafeAreaView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { addQty, deleteQty, getDefaultPrice, getQtysRealtime } from "../services/repositories/FirebaseRepository";
import ActionSheet from "react-native-actions-sheet";
import Header from "../components/Header";
import { IMAGES } from "../utills/ImagePath";
import { formatDateToDDMMYY } from "../components/FormatedDate";
import MonthSelectorWithYear from "../components/MonthSelector";
import ViewShot from "react-native-view-shot";
import { generateExcelZipAndShare } from "../components/ShareExcelZIPFile";
import RNFS from 'react-native-fs';
import { sharePNG } from "../components/SharePNG";

const HomeScreen = () => {
    const addQtyBottomSheetRef = useRef(null);
    const calcuateBottomSheetRef = useRef(null);
    const exportQtyBottomSheetRef = useRef(null);
    const viewShotRef = useRef(null);
    const [qtys, setQtys] = useState([]);
    const [defaultPrice, setDefaultPrice] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedQty, setSelectedQty] = useState(1);

    useEffect(() => {
        const unsubscribe = getQtysRealtime(setQtys, formatDateToDDMMYY(selectedDate));
        getDefaultPrice(setDefaultPrice);

        return () => unsubscribe();
    }, [selectedDate]);

    const handleAddQty = async () => {
        setLoading(true);
        try {
            await addQty(selectedQty, formatDateToDDMMYY(selectedDate));
            setSelectedQty(1);
            addQtyBottomSheetRef.current?.hide();
            setLoading(false);
        } catch (error) {
            console.log('Failed to add qty', error);
        }
    };

    const handleIncreasing = () => {
        setSelectedQty(prev => prev + 0.5);
    }

    const handleDecreasing = () => {
        if (selectedQty > 0.5) {
            setSelectedQty(prev => prev - 0.5);
        }
    }

    const handleCalulator = () => {
        calcuateBottomSheetRef.current?.show();
    }

    const handleExport = () => {
        exportQtyBottomSheetRef.current?.show();
    }

    const handleShareZIPFile = () => {
        generateExcelZipAndShare(qtys, totalQty);
    }

    const handleShareOnWhatsApp = async () => {
        sharePNG({ viewShotRef });
        calcuateBottomSheetRef.current?.hide();
    }

    const [filterDay, filterMonth, filterYear] = formatDateToDDMMYY(selectedDate).split('-');
    const fMonth = parseInt(filterMonth);
    const fYear = parseInt(filterYear);


    const totalQty = qtys.reduce((total, item) => total + parseFloat(item.qty), 0);

    if (loading) return <View style={[styles.container, { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.3)' }]}><ActivityIndicator /></View>

    // const handleDeleteQty = async (qtyId) => {
    //     try {
    //         await deleteQty(qtyId);
    //     } catch (error) {
    //         console.error('Failed to delete qty:', error);
    //     }
    // };

    return (
        <SafeAreaView style={styles.container}>
            <Header title={'Home'} isButton={false} />
            <View style={styles.headerIconsView}>
                <TouchableOpacity style={[styles.calender, { right: 70 }]} onPress={handleCalulator}>
                    <Image source={IMAGES.calcuator} style={styles.calendarIcon} />
                    <Text style={{ fontSize: 12, color: '#ccc' }}>{'Calculate'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.calender} onPress={handleExport}>
                    <Image source={IMAGES.export} style={[styles.calendarIcon, { width: 23 }]} />
                    <Text style={{ fontSize: 12, color: '#ccc' }}>{'Export'}</Text>
                </TouchableOpacity>
            </View>

            <ActionSheet
                id='exportQty_bottomSheet'
                ref={exportQtyBottomSheetRef}
                containerStyle={[styles.bottomSheet, { justifyContent: 'center' }]}
                onClose={() => {
                    exportQtyBottomSheetRef.current?.hide();
                }}
            >
                <TouchableOpacity onPress={handleShareZIPFile} style={[styles.addQtyTextButton, { marginTop: 0 }]}>
                    <Text style={[styles.addQtyText, { marginVertical: 10, alignSelf: 'center', }]}>{'Share ZIP file'}</Text>
                </TouchableOpacity>
            </ActionSheet>

            <ActionSheet
                id='calculate_bottomSheet'
                ref={calcuateBottomSheetRef}
                containerStyle={[styles.bottomSheet, { paddingVertical: 0, padding: 0 }]}
                onClose={() => {
                    calcuateBottomSheetRef.current?.hide();
                }}
            >
                <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }} style={styles.viewShorStyle}>
                    <Text style={[styles.addQtyText, { color: '#000000', fontSize: 20, textAlign: 'center' }]}>
                        {`${new Date(fYear, fMonth - 1).toLocaleString('default', { month: 'long' })}, ${fYear}`}
                    </Text>
                    <View style={[styles.itemView, { borderBottomWidth: 0, paddingHorizontal: 0, alignItems: null, marginTop: 20 }]}>
                        <View>
                            <Text style={[styles.addQtyText, { color: '#000000', marginHorizontal: 0, fontSize: 18 }]}>{`Total days: ${qtys.length}`}</Text>
                            <FlatList
                                data={qtys}
                                keyExtractor={(item) => item.id}
                                numColumns={10}
                                renderItem={({ item }) => {
                                    const [filterDay, filterMonth, filterYear] = item.date.split('-');
                                    const frDay = parseInt(filterDay);

                                    return <Text onPress={() => { }} style={[styles.qtyItemText, { marginRight: 0 }]}>{`${frDay}, `}</Text>
                                }}
                            />
                        </View>
                        <Text style={[styles.addQtyText, { color: '#000000', marginHorizontal: 0, fontSize: 18 }]}>{`Total qty: ${totalQty}`}</Text>
                    </View>
                    <View style={[styles.itemView, { borderBottomWidth: 0, paddingHorizontal: 0 }]}>
                        <Text style={[styles.addQtyText, { color: '#000000', marginHorizontal: 0, fontSize: 18 }]}>{`Total price: ${totalQty * defaultPrice}(${defaultPrice})`}</Text>
                        <TouchableOpacity onPress={handleShareOnWhatsApp}>
                            <Image source={IMAGES.sharePNG} style={{ height: 50, width: 50 }} />
                        </TouchableOpacity>
                    </View>
                </ViewShot>
            </ActionSheet>


            <ActionSheet
                id='addQty_bottomSheet'
                ref={addQtyBottomSheetRef}
                containerStyle={styles.bottomSheet}>
                <Text style={[styles.itemView, { borderBottomWidth: 0, fontSize: 20, alignSelf: 'center', fontWeight: 'bold' }]}>Add Details</Text>
                <View style={[styles.itemView, { borderBottomWidth: 0, fontSize: 20, alignSelf: 'center' }]}>
                    <Text onPress={handleDecreasing} style={[styles.qtyItemText, { fontSize: 50, backgroundColor: '#9f9f9f9f', padding: 10, lineHeight: 20 }]}>-</Text>
                    <Text style={[styles.itemView, { borderBottomWidth: 0, fontSize: 20, alignSelf: 'center', marginHorizontal: 30 }]}>{selectedQty}</Text>
                    <Text onPress={handleIncreasing} style={[styles.qtyItemText, { fontSize: 30, backgroundColor: '#9f9f9f9f', padding: 10, lineHeight: 20 }]}>+</Text>
                </View>
                <TouchableOpacity style={styles.addQtyTextButton} onPress={handleAddQty}>
                    <Text style={[styles.addQtyText, { marginVertical: 10 }]}>Add qty</Text>
                </TouchableOpacity>
            </ActionSheet>

            <MonthSelectorWithYear
                selectedDate={selectedDate}
                onMonthSelect={(monthDate) => {
                    const firstDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
                    setSelectedDate(firstDayOfMonth);
                }}
            />

            <View style={[styles.container, { margin: 20, marginTop: 0 }]}>
                {qtys.length > 0 ? (<FlatList
                    data={qtys}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        return (
                            <View style={styles.itemView}>
                                <Text style={styles.qtyItemText}>{`qty: ${item.qty}`}</Text>
                                <Text style={styles.qtyItemText}>{item.date}</Text>
                            </View>
                        )
                    }}
                />)
                    : (<Text style={[styles.qtyItemText, { alignSelf: 'center' }]}>Add first qty of this month</Text>)}
                <TouchableOpacity onPress={() => addQtyBottomSheetRef.current?.show()} style={styles.addQtyIconButton}>
                    <Image source={IMAGES.addQty} />
                </TouchableOpacity>
            </View>
        </SafeAreaView >
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center'
    },
    input: {
        borderWidth: 1,
        padding: 10,
        borderRadius: 10,
    },
    itemView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    qtyItemText: {
        fontSize: 18,
        color: '#000000'
    },
    addQtyTextButton: {
        alignSelf: 'center',
        backgroundColor: '#154165',
        borderRadius: 10,
        marginTop: 10,
        paddingHorizontal: 20
    },
    addQtyIconButton: {
        alignSelf: 'flex-end',
        position: 'absolute',
        bottom: 10,
        right: 10,
    },
    addQtyText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginHorizontal: 10,
    },
    bottomSheet: {
        backgroundColor: '#F5F5F5',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        height: '30%',
        position: 'absolute',
        zIndex: 1000,
        padding: 20,
        paddingVertical: 20
    },
    calendarIcon: {
        height: 20,
        width: 20,
        tintColor: '#ccc'
    },
    calender: {
        position: 'absolute',
        right: 20,
        zIndex: 10000,
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerIconsView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'red',
        position: 'absolute',
        top: Platform.OS === 'android' ? 65 : 20,
        right: 0,
        zIndex: 10000,
    },
    viewShorStyle: {
        height: '100%',
        width: '100%',
        padding: 20,
        backgroundColor: '#ffffff',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10
    }
});